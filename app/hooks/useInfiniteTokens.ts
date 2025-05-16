import { TokenData } from "../types/token.type"
import { factoryAddress, factoryAbi } from "../generated"
import { readContract } from "wagmi/actions"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useReadFactoryTotalTokens } from "../generated"
import { config } from "../config/wagmi"

type PageParam = number
type TokenPage = {
    tokens: TokenData[]
    nextPage: number | undefined
    totalTokens: number
}

const TOKENS_PER_PAGE = 12

async function fetchTokenPage(pageParam: number) {
	const start = pageParam * TOKENS_PER_PAGE
	const tokenData: TokenData[] = []

	try {
		// Get total tokens first to know our bounds
		const totalTokens = await readContract(config, {
			address: factoryAddress[31337],
			abi: factoryAbi,
			functionName: "totalTokens",
		})

		// Calculate end index, making sure we don't exceed total tokens
		const end = Math.min(start + TOKENS_PER_PAGE, Number(totalTokens))

		// Fetch tokens for current page
		for (let i = start; i < end; i++) {
			// Get token address at index
			const tokenAddress = await readContract(config, {
				address: factoryAddress[31337],
				abi: factoryAbi,
				functionName: "tokens",
				args: [BigInt(i)],
			})

			// Get token sale details
			const tokenSale = await readContract(config, {
				address: factoryAddress[31337],
				abi: factoryAbi,
				functionName: "tokenForSale",
				args: [tokenAddress],
			})

			if (tokenSale) {
				tokenData.push({
					token: tokenSale[0],
					name: tokenSale[1],
					creator: tokenSale[2],
					sold: tokenSale[3],
					raised: tokenSale[4],
					startTime: tokenSale[5],
					endTime: tokenSale[6],
					saleStage: tokenSale[7],
					signedUrl: tokenSale[8],
				})
			}
		}

		return {
			tokens: tokenData,
			nextPage: end < Number(totalTokens) ? pageParam + 1 : undefined,
			totalTokens: Number(totalTokens),
		}
	} catch (error) {
		console.error("Error fetching tokens:", error)
		throw error
	}
}

export function useInfiniteTokens() {
	const { data: totalTokens = BigInt(0) } = useReadFactoryTotalTokens()

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isError,
		error,
		isLoading,
		isSuccess,
	} = useInfiniteQuery({
		queryKey: ["tokens"],
		initialPageParam: 0,
		queryFn: async ({ pageParam }) => fetchTokenPage(pageParam as number),
		getNextPageParam: (lastPage: TokenPage) => lastPage.nextPage,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		refetchInterval: 1000 * 30, // Refetch every 30 seconds
	})

	// Combine all pages into a single array
	const tokens = data?.pages.flatMap((page) => page.tokens) ?? []

	return {
		tokens,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isError,
		error,
		isLoading,
		isSuccess,
		totalTokens,
	}
}
