import { isDev } from "@/utils/debug.utils"
import {
	useWriteFactoryCreate,
	useWatchFactoryContractCreatedEvent,
	CurveType,
} from "@fun-pump/smart-contract"
import { FC, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useWaitForTransactionReceipt } from "wagmi"

// 交易状态枚举
export enum TransactionStatus {
	IDLE = "idle",
	SIGNING = "signing",
	SUBMITTED = "submitted",
	CONFIRMED = "confirmed",
	FAILED = "failed",
}

// 交易信息接口
interface PendingTransaction {
	hash: string
	timestamp: number
	name: string
	symbol: string
}

export function useCreateToken() {
	const {
		writeContract,
		isPending: isSigningTransaction,
		data: txHash,
		isError: isWriteError,
		error: writeError,
		reset: resetWrite,
		isSuccess: isTransactionSubmitted,
	} = useWriteFactoryCreate({
		mutation: {
			onSuccess(data) {
				// 交易提交成功后，添加到待监听队列
				addPendingTransaction(data, currentTokenInfo.current)
				toast.success("Transaction submitted!")
			},
			onError(error) {
				if (error.message.includes("User rejected the request")) {
					toast.error("Transaction rejected by user")
				} else {
					console.log(error)
					toast.error(`Failed to create transaction: ${error.message}`)
				}
			},
		},
	})

	// 当前创建的token信息
	const currentTokenInfo = useRef<{ name: string; symbol: string } | null>(null)
	
	// 待确认的交易列表
	const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
	const [completedTokens, setCompletedTokens] = useState<string[]>([])

	// 添加到待监听队列
	const addPendingTransaction = (hash: string, tokenInfo: { name: string; symbol: string } | null) => {
		if (!tokenInfo) return
		
		const newTx: PendingTransaction = {
			hash,
			timestamp: Date.now(),
			name: tokenInfo.name,
			symbol: tokenInfo.symbol,
		}
		
		setPendingTransactions(prev => [...prev, newTx])
	}

	// 监听所有待确认的交易
	useWatchFactoryContractCreatedEvent({
		onLogs(logs) {
			console.log("Received logs:", logs)
			
			for (const log of logs) {
				const txHash = log.transactionHash
				const tokenAddress = log.args.contractAddress
				
				if (tokenAddress) {
					// 查找对应的待确认交易
					const pendingTx = pendingTransactions.find(tx => tx.hash === txHash)
					
					if (pendingTx) {
						console.log(`Token ${pendingTx.symbol} created at:`, tokenAddress)
						
						// 从待确认列表中移除
						setPendingTransactions(prev => prev.filter(tx => tx.hash !== txHash))
						
						// 添加到已完成列表
						setCompletedTokens(prev => [...prev, tokenAddress as string])
						
						// 显示成功通知
						toast.success(`Token ${pendingTx.symbol} created successfully!`, {
							description: `Contract address: ${tokenAddress}`,
							action: {
								label: "View",
								onClick: () => {
									window.open(`https://etherscan.io/address/${tokenAddress}`, "_blank")
								},
							},
						})
					}
				}
			}
		},
		enabled: pendingTransactions.length > 0,
	})

	// 定期清理超时的交易（可选）
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now()
			const TIMEOUT = 10 * 60 * 1000 // 10分钟超时
			
			setPendingTransactions(prev => 
				prev.filter(tx => now - tx.timestamp < TIMEOUT)
			)
		}, 60000) // 每分钟检查一次
		
		return () => clearInterval(interval)
	}, [])

	const createToken = (
		name: string,
		symbol: string,
		startTime: number,
		endTime: number,
		signedUrl: string,
		curveType: CurveType,
		curveSlope: bigint,
		fee: bigint
	) => {
		// 保存当前token信息
		currentTokenInfo.current = { name, symbol }
		
		return writeContract({
			args: [name, symbol, BigInt(startTime), BigInt(endTime), signedUrl, Number(curveType), curveSlope],
			value: fee,
		})
	}

	const resetAll = () => {
		resetWrite()
		currentTokenInfo.current = null
	}

	return {
		createToken,
		isSigningTransaction,
		isTransactionSubmitted,
		isWriteError,
		writeError,
		txHash,
		pendingTransactions,
		completedTokens,
		reset: resetAll,
	} as const
}
