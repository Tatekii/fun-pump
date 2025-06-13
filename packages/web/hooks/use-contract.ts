import { parseEther } from "viem"
import { useWaitForTransactionReceipt } from "wagmi"
import { useState } from "react"
import type { TokenSale, TokenData } from "@/types/token.type"
import { CurveType } from "@fun-pump/smart-contract"
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
				toast.success("Transaction submitted to blockchain")
			},
			onError(error) {
				// 处理用户拒绝交易的情况
				if (error.message.includes("User rejected the request")) {
					toast.error("Transaction rejected by user")
				} else {
					toast.error(`Failed to create transaction: ${error.message}`)
				}
			},
			onSettled() {
				// 不要在这里重置，让用户查看交易状态
				// resetWrite()
			},
		},
	})

	// 等待交易收据并获取更详细的状态
	// TODO status 不会变？？？
	const {
		isLoading: isConfirming,
		isSuccess,
		data: receipt,
		status,
		error: txError,
	} = useWaitForTransactionReceipt({
		hash: tx,
		confirmations: 2, // 等待 2 个区块确认
		timeout: 60_000, // 60秒超时
		onReplaced(replacement) {
			// 处理交易被替换的情况 (加速或取消)
			if (replacement.reason === "cancelled") {
				toast.error("Transaction was cancelled")
			} else if (replacement.reason === "replaced") {
				toast.info("Transaction was replaced with a new one")
			}
		},
	})

	console.log("@@@@", { status })

	// 通过事件监听获取新创建的代币地址
	const [newTokenAddress, setNewTokenAddress] = useState<string | null>(null)

	useWatchFactoryContractCreatedEvent({
		onLogs(logs) {
			// Only process logs related to our transaction
			for (const log of logs) {
				if (log.transactionHash === tx) {
					const tokenAddress = log.args.contractAddress
					if (tokenAddress) {
						setNewTokenAddress(tokenAddress as string)
						toast.success(`Token created at ${tokenAddress}`, {
							description: "Your token is now live on the blockchain",
							action: {
								label: "View",
								onClick: () => {
									window.open(`https://etherscan.io/address/${tokenAddress}`, "_blank")
								},
							},
						})
					}
					break
				}
			}
		},
		enabled: Boolean(tx) && !newTokenAddress, // Only listen when transaction is confirming or successful
	})

	// 计算整体交易状态
	const getTransactionStatus = () => {
		if (isPending) return "signing" // 用户正在签名
		if (isConfirming) return "confirming" // 交易正在链上确认
		if (isSuccess) return "success" // 交易已成功
		if (isError) return "error" // 交易出错
		return "idle" // 初始状态
	}

	const createToken = async (
		name: string,
		symbol: string,
		startTime: number,
		endTime: number,
		signedUrl: string,
		curveType: CurveType,
		curveSlope: bigint,
		fee: bigint
	) => {
		try {
			return await writeContract({
				args: [name, symbol, BigInt(startTime), BigInt(endTime), signedUrl, Number(curveType), curveSlope],
				value: fee,
			})
		} catch (err) {
			console.error("Error creating token:", err)
			throw err
		}
	}

	// 完全重置所有状态
	const resetAll = () => {
		resetWrite()
		setNewTokenAddress(null)
	}

	return {
		createToken,
		isPending, // 钱包交互
		isConfirming, // 交易正在确认
		isSuccess, // 交易已确认
		isError, // 交易失败
		error, // 错误详情
		txHash: tx, // 交易哈希
		receipt, // 交易收据
		newTokenAddress, // 新创建的代币地址
		transactionStatus: getTransactionStatus(), // 整体交易状态
		reset: resetAll, // 重置所有状态
	}
}
