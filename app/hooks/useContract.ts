import { parseEther } from "viem"
import { useWaitForTransactionReceipt } from "wagmi"
import type { TokenSale, TokenData } from "../types/token.type"
import { useReadFactoryTokenForSale, useWriteFactoryBuy, useWriteFactoryCreate } from "../generated"

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
			} as TokenSale)
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

export function useCreateToken() {
	const { writeContract } = useWriteFactoryCreate()

	const createToken = async (name: string, symbol: string, startTime: number, endTime: number, fee: bigint) => {
		return writeContract({
			args: [name, symbol, BigInt(startTime), BigInt(endTime)],
			value: fee,
		})
	}

	return { createToken }
}
