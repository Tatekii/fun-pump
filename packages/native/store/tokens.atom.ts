import { atom } from "jotai"
import { atomWithInfiniteQuery, atomWithQuery } from "jotai-tanstack-query"
import type { CurveType, TokenSale } from "@fun-pump/smart-contract"
import { readContract } from "wagmi/actions"
import { factoryAddress, factoryAbi } from "@fun-pump/smart-contract"
import { wagmiConfig } from "@/lib/wagmi"
import { createPublicClient, getContract, http } from "viem"
import { hardhat } from "viem/chains"

const TOKENS_PER_PAGE = 12

type TokenPage = {
	tokens: TokenSale[]
	nextPage: number | undefined
	totalTokens: number
}

export const publicClient = createPublicClient({
	chain: hardhat,
	transport: http(),
})

// Simplified atom using the hooks approach - Total tokens atom
export const totalTokensQueryAtom = atomWithQuery<bigint>((get) => ({
	queryKey: ["totalTokens"],
	queryFn: async () => {
		console.log("准备调用合约...")
		console.log("合约地址:", factoryAddress[31337])


		try {
			const result = await readContract(wagmiConfig, {
				address: factoryAddress[31337],
				abi: factoryAbi,
				functionName: "totalTokens",

			})

			console.log("合约调用结果:", result)
			return result as bigint
		} catch (error) {
			console.error("合约调用失败:", error)
			throw error
		}
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
		queryKey: ["tokens", totalTokens.toString()],
		initialPageParam: 0,
		queryFn: ({ pageParam = 0 }: { pageParam: number }) => fetchTokenPageBatch(totalTokens, pageParam, {}),
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
				readContract(wagmiConfig, {
					address: factoryAddress[31337],
					abi: factoryAbi,
					functionName: "tokens",
					args: [BigInt(i)],
				})
			)
		}

		const tokenAddresses = await Promise.all(tokenAddressPromises)

		// Batch fetch token sale data
		const tokenSalePromises = tokenAddresses.map((address) =>
			readContract(wagmiConfig, {
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

				return {
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
				} as TokenSale
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
