import { atom } from "jotai"
import { atomWithInfiniteQuery, atomWithQuery } from "jotai-tanstack-query"
import { filterAtom } from "./filter.atom"
import { TokenData } from "../types/token.type"
import { CurveType } from "@fun-pump/smart-contract"
import { config } from "@/lib/wagmi"
import { readContract } from "wagmi/actions"
import { useReadFactoryTotalTokens } from "@fun-pump/smart-contract"
import { getContractAddress, getContractAbi } from "@/lib/contract-utils"

const TOKENS_PER_PAGE = 12

type TokenPage = {
	tokens: TokenData[]
	nextPage: number | undefined
	totalTokens: number
}

function applyTimeFilter(time: number, timeFilter?: { type: "before" | "after" | "equals"; date: Date }): boolean {
	if (!timeFilter) return true
	const timestamp = new Date(time * 1000)

	if (timeFilter.type === "equals" && timestamp.getTime() !== timeFilter.date.getTime()) return false
	if (timeFilter.type === "before" && timestamp >= timeFilter.date) return false
	if (timeFilter.type === "after" && timestamp <= timeFilter.date) return false

	return true
}

function filterToken(token: TokenData, filter?: any): boolean {
	if (!filter) return true

	// Apply name filter
	if (filter.name && !token.name.toLowerCase().includes(filter.name.toLowerCase())) {
		return false
	}

	// Apply start time filter
	if (filter.startTime && !applyTimeFilter(Number(token.startTime), filter.startTime)) {
		return false
	}

	// Apply end time filter
	if (filter.endTime && !applyTimeFilter(Number(token.endTime), filter.endTime)) {
		return false
	}

	return true
}

async function fetchTokenPage(totalTokens: bigint, pageParam: number, filter: any) {
	const start = pageParam * TOKENS_PER_PAGE
	const tokenData: TokenData[] = []
	let fetchedCount = 0
	let currentIndex = start

	try {
		while (fetchedCount < TOKENS_PER_PAGE && currentIndex < Number(totalTokens)) {
			const tokenAddress = await readContract(config, {
				address: getContractAddress('Factory', 31337),
				abi: getContractAbi('Factory'),
				functionName: "tokens",
				args: [BigInt(currentIndex)],
			})

			const tokenSale = await readContract(config, {
				address: getContractAddress('Factory', 31337),
				abi: getContractAbi('Factory'),
				functionName: "tokenForSale",
				args: [tokenAddress],
			})

			if (tokenSale) {
				const token: TokenData = {
					token: tokenSale[0],
					name: tokenSale[1],
					creator: tokenSale[2],
					sold: tokenSale[3],
					raised: tokenSale[4],
					startTime: tokenSale[5],
					endTime: tokenSale[6],
					saleStage: tokenSale[7],
					signedUrl: tokenSale[8],
					curveType: tokenSale[9] as unknown as CurveType,
					curveSlope: tokenSale[10],
				}

				if (filterToken(token, filter)) {
					tokenData.push(token)
					fetchedCount++
				}
			}

			currentIndex++
		}

		return {
			tokens: tokenData,
			nextPage: currentIndex < Number(totalTokens) ? pageParam + 1 : undefined,
			totalTokens: Number(totalTokens),
		}
	} catch (error) {
		console.error("Error fetching tokens:", error)
		throw error
	}
}

// Create an atom for total tokens from contract
export const totalTokensQueryAtom = atomWithQuery<bigint>((get) => ({
	queryKey: ["totalTokens"],
	queryFn: async () => {
		const result = await readContract(config, {
			address: getContractAddress('Factory', 31337),
			abi: getContractAbi('Factory'),
			functionName: "totalTokens",
		})
		return result as bigint
	},
	staleTime: 1000 * 30, // Refetch every 30 seconds
}))

// Create a derived atom that extracts the data with a default value
export const totalTokensAtom = atom((get) => {
	const query = get(totalTokensQueryAtom)
	return query.data ?? BigInt(0)
})

// Create atoms for the infinite query
export const tokensQueryAtom = atomWithInfiniteQuery((get) => {
	const totalTokens = get(totalTokensAtom)

	return {
		queryKey: ["tokens", totalTokens.toString(), get(filterAtom)],
		initialPageParam: 0,
		queryFn: ({ pageParam = 0 }: { pageParam: number }) => fetchTokenPage(totalTokens, pageParam, get(filterAtom)),
		getNextPageParam: (lastPage: TokenPage) => lastPage.nextPage,
		staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
		refetchInterval: 1000 * 30, // Refetch every 30 seconds
		enabled: !totalTokens.toString().startsWith("-"),
	}
})

// Create a derived atom for the flattened tokens array
export const flatTokensAtom = atom((get) => {
	const queryResult = get(tokensQueryAtom)
	return queryResult.data?.pages.flatMap((page) => page.tokens) ?? []
})
