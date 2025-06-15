import { parseEther } from "viem"
import { useWaitForTransactionReceipt } from "wagmi"
import { useState, useEffect } from "react"
import { CurveType, TokenSale } from "@fun-pump/smart-contract"
import {
	useReadFactoryTokenForSale,
	useWatchFactoryContractCreatedEvent,
	useWriteFactoryBuy,
	useWriteFactoryCreate,
} from "@fun-pump/smart-contract"
import { toast } from "sonner"

export function useTokenSale(tokenAddress: string) {
	const { data } = useReadFactoryTokenForSale({
		args: [tokenAddress as `0x${string}`],
	})

	// Process token sale data
	const formattedData = data
		? ({
				token: data[0],
				name: data[1],
				creator: data[2],
				sold: data[3],
				raised: data[4],
				startTime: data[5],
				endTime: data[6],
				saleStage: data[7],
				signedUrl: data[8],
				curveType: data[9],
				curveSlope: data[10],
			} as unknown as TokenSale)
		: undefined

	return { data: formattedData }
}

export function useBuyToken() {
	const { writeContract } = useWriteFactoryBuy()

	const buyToken = async (tokenAddress: string, amount: string, cost: bigint) => {
		return writeContract({
			args: [tokenAddress as `0x${string}`, parseEther(amount)],
			value: cost,
		})
	}

	return { buyToken }
}