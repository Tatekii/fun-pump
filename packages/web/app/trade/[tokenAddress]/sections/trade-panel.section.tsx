import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import router from "next/router"
import { FunctionComponent, useState } from "react"
import { formatEther } from "viem"
import { useTokenInfo, useTokenCost } from "../provider/token.provider"
import { useBuyToken } from "@/hooks/use-contract"
import { useTokenFactoryLimit, useTokenFactoryTarget } from "@/app/providers/factory.provider"

interface TradePanelSectionProps extends React.ComponentProps<"div"> {}

/**
 * 骨架屏组件 - 模拟 TradePanelSection 的结构
 * @param props
 * @returns
 */
const TradePanelSectionSkeleton = (props: React.ComponentProps<"div">) => {
	return (
		<Card {...props}>
			<CardHeader>
				{/* 模拟标题 */}
				<Skeleton className="h-7 w-32" />
				{/* 模拟描述 */}
				<Skeleton className="h-4 w-40" />
			</CardHeader>
			<CardContent className="space-y-6">
				{/* 模拟表单区域 */}
				<div className="space-y-4">
					<div className="space-y-2">
						{/* 模拟金额显示行 */}
						<div className="flex justify-between">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-4 w-20" />
						</div>
						{/* 模拟输入框 */}
						<Skeleton className="h-12 w-full" />
					</div>
					{/* 模拟购买按钮 */}
					<Skeleton className="h-12 w-full" />
				</div>

				{/* 模拟取消按钮 */}
				<Skeleton className="h-12 w-full" />
			</CardContent>
		</Card>
	)
}

const TradePanelSection: FunctionComponent<TradePanelSectionProps> = ({ ...rest }) => {
	const token = useTokenInfo()
	const cost = useTokenCost()
	const target = useTokenFactoryTarget()
	const limit = useTokenFactoryLimit()

	const [inputAmount, setInputAmount] = useState("1")

	const { buyToken } = useBuyToken()

	async function buyHandler(formData: FormData) {
		const amount = formData.get("amount") as string
		if (!cost || !amount || !token) return

		await buyToken(token.token, amount, BigInt(amount) * BigInt(cost.toString()))
		router.back()
	}

	if (token === null || cost === null || target === null || limit === null) {
		return <TradePanelSectionSkeleton {...rest} />
	}

	return (
		<Card {...rest}>
			<CardHeader>
				<CardTitle className="text-xl">Trade {token.name}</CardTitle>
				<CardDescription>Purchase tokens using ETH</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{token.sold >= limit || token.raised >= target ? (
					<div className="text-center py-4">
						<p className="text-2xl lowercase">target reached!</p>
					</div>
				) : (
					<form action={buyHandler} className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>Amount to purchase</span>
								<span>
									Cost:{" "}
									{inputAmount ? (Number(formatEther(cost)) * Number(inputAmount)).toFixed(6) : "0"}{" "}
									ETH
								</span>
							</div>
							<Input
								type="number"
								name="amount"
								min={1}
								max={10000}
								placeholder="1"
								className="w-full p-4"
								value={inputAmount}
								onChange={(e) => setInputAmount(e.target.value)}
							/>
						</div>
						<Button
							type="submit"
							variant="default"
							className="w-full text-lg hover:scale-105 transition-transform"
						>
							[ buy tokens ]
						</Button>
					</form>
				)}

				<Button
					onClick={() => router.back()}
					variant="ghost"
					className="w-full text-lg hover:scale-105 transition-transform"
				>
					[ cancel ]
				</Button>
			</CardContent>
		</Card>
	)
}

export default TradePanelSection
