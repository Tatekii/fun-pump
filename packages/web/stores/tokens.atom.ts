import { atom } from "jotai"
import { atomWithInfiniteQuery, atomWithQuery } from "jotai-tanstack-query"
import { filterAtom } from "./filter.atom"
import { CurveType, TokenSale } from "@fun-pump/smart-contract"
import { config } from "@/lib/wagmi"
import { readContract } from "wagmi/actions"
import { factoryAddress, factoryAbi } from "@fun-pump/smart-contract"
import { filterToken } from "@/utils/tokens.utils"

const TOKENS_PER_PAGE = 12

type TokenPage = {
	tokens: TokenSale[]
	nextPage: number | undefined
	totalTokens: number
}

// Simplified atom using the hooks approach - Total tokens atom
export const totalTokensQueryAtom = atomWithQuery<bigint>((get) => ({
	queryKey: ["totalTokens"],
	queryFn: async () => {
		const result = await readContract(config, {
			address: factoryAddress[31337],
			abi: factoryAbi,
			functionName: "totalTokens",
		})
		return result as bigint
	},
	staleTime: 1000 * 60, // 1 minute
	refetchInterval: 1000 * 30, // Refetch every 30 seconds
}))

// Create a derived atom that extracts the data with a default value
export const totalTokensAtom = atom((get) => {
	const query = get(totalTokensQueryAtom)
	return query.data ?? BigInt(0)
})

// Optimized infinite query atom using batch fetching
export const tokensQueryAtom = atomWithInfiniteQuery((get) => {
	const totalTokens = get(totalTokensAtom)

	return {
		queryKey: ["tokens", totalTokens.toString(), get(filterAtom)],
		initialPageParam: 0,
		queryFn: ({ pageParam = 0 }: { pageParam: number }) => 
			fetchTokenPageBatch(totalTokens, pageParam, get(filterAtom)),
		getNextPageParam: (lastPage: TokenPage) => lastPage.nextPage,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		refetchInterval: 1000 * 30, // Refetch every 30 seconds
		enabled: totalTokens > BigInt(0),
	}
})

// Create a derived atom for the flattened tokens array
export const flatTokensAtom = atom((get) => {
	const queryResult = get(tokensQueryAtom)
	if (!queryResult.data?.pages) return []
	
	return queryResult.data.pages.flatMap((page) => {
		const typedPage = page as TokenPage
		return typedPage.tokens
	})
})

// Better approach: Use multicall or batch reading
async function fetchTokenPageBatch(totalTokens: bigint, pageParam: number, filter: any): Promise<TokenPage> {
	const start = pageParam * TOKENS_PER_PAGE
	const end = Math.min(start + TOKENS_PER_PAGE, Number(totalTokens))
	
	try {
		// Batch fetch token addresses
		const tokenAddressPromises = []
		for (let i = start; i < end; i++) {
			tokenAddressPromises.push(
				readContract(config, {
					address: factoryAddress[31337],
					abi: factoryAbi,
					functionName: "tokens",
					args: [BigInt(i)],
				})
			)
		}
		
		const tokenAddresses = await Promise.all(tokenAddressPromises)
		
		// Batch fetch token sale data
		const tokenSalePromises = tokenAddresses.map(address =>
			readContract(config, {
				address: factoryAddress[31337],
				abi: factoryAbi,
				functionName: "tokenForSale",
				args: [address],
			})
		)
		
		const tokenSales = await Promise.all(tokenSalePromises)
		
		// Process and filter tokens
		const tokens: TokenSale[] = tokenSales
			.map((tokenSale, index) => {
				if (!tokenSale) return null
				
				const token: TokenSale = {
					token: tokenSale[0],
					name: tokenSale[1],
					creator: tokenSale[2],
					sold: tokenSale[3],
					raised: tokenSale[4],
					startTime: tokenSale[5],
					endTime: tokenSale[6],
					stage: tokenSale[7],
					signedUrl: tokenSale[8],
					curveType: tokenSale[9] as unknown as CurveType,
					curveSlope: tokenSale[10],
				}
				
				return filterToken(token, filter) ? token : null
			})
			.filter((token): token is TokenSale => token !== null)
		
		return {
			tokens,
			nextPage: end < Number(totalTokens) ? pageParam + 1 : undefined,
			totalTokens: Number(totalTokens),
		}
	} catch (error) {
		console.error("Error fetching tokens:", error)
		throw error
	}
}
