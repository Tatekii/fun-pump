import { parseEther } from "viem"
import { useWaitForTransactionReceipt } from "wagmi"
import type { TokenSale, TokenData } from "../types/token.type"
import {
	useReadFactoryTokenForSale,
	useWatchFactoryContractCreatedEvent,
	useWriteFactoryBuy,
	useWriteFactoryCreate,
} from "../generated"
import { toast } from "sonner"
import { useEffect, useState } from "react"

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
	const {
		writeContract,
		isPending,
		data: tx,
		isError,
		error,
		reset: resetWrite,
	} = useWriteFactoryCreate({
		mutation: {
			onSuccess(data) {
				toast.success("Transaction submitted")
			},
			onError(error) {
				toast.error("Failed to create transaction")
			},
			onSettled() {
				resetWrite()
			},
		},
	})

	// Wait for transaction receipt
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash: tx,
	})

	useWatchFactoryContractCreatedEvent({
		onLogs(logs) {
			// Only process if this log corresponds to our transaction
			const [log] = logs
			if (log.transactionHash === tx) {
				const newTokenAddress = log.args.contractAddress
				toast.success(`Token created at ${newTokenAddress}`)
			}
		},
		enabled: Boolean(tx), // Only watch when we have a transaction
	})

	const createToken = async (
		name: string,
		symbol: string,
		startTime: number,
		endTime: number,
		signedUrl: string,
		fee: bigint
	) =>
		writeContract({
			args: [name, symbol, BigInt(startTime), BigInt(endTime), signedUrl],
			value: fee,
		})

	return {
		createToken,
		isPending, // Wallet interaction
		isConfirming, // Transaction confirming
		isSuccess, // Transaction confirmed
		isError, // Transaction failed
		error, // Error details if any
		reset: () => {
			resetWrite()
		},
	}
}
