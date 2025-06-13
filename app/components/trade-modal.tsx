import { FC } from "react"
import { TokenData } from "../types/token.type"
import { useTokenSale, useBuyToken } from "../hooks/useContract"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import {
	useReadCrowdfundingLibFundingLimit,
	useReadCrowdfundingLibFundingTarget,
	useReadFactoryGetCost,
} from "../generated"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveModal, ResponsiveModalProps } from "./responsive-modal"
import { getCurveTypeName } from "./token-card"


// 助手函数：格式化斜率显示
const formatSlope = (slope: bigint): string => {
  // 将BigInt转换为可读格式，考虑到1e18的缩放
  const slopeNumber = Number(slope) / 1e18;
  return slopeNumber.toFixed(6);
};

interface ITradeModalProps extends Pick<ResponsiveModalProps, "open"> {
	toggleTrade: () => void
	token: TokenData
}

const TradeModal: FC<ITradeModalProps> = ({ toggleTrade, token, open }) => {
	const {
		data: target = BigInt(0),
		error: targetError,
		isLoading: targetLoading,
	} = useReadCrowdfundingLibFundingTarget()

	const { data: limit = BigInt(0), error: limitError, isLoading: limitLoading } = useReadCrowdfundingLibFundingLimit()

	const { data: cost = BigInt(0) } = useReadFactoryGetCost({
		args: [token.sold],
	})

	const { buyToken } = useBuyToken()

	async function buyHandler(formData: FormData) {
		const amount = formData.get("amount") as string
		if (!cost || !amount) return

		await buyToken(token.token, amount, BigInt(amount) * BigInt(cost.toString()))
		toggleTrade()
	}

	// FIXME
	console.log({ token, limit, target })

	return (
		<ResponsiveModal open={open} onOpenChange={toggleTrade} title="Trade">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl text-center">{token.name}</CardTitle>
					<CardDescription className="text-sm text-center">
						creator: {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4 text-center">
					<img src={token.signedUrl} alt="token" width={256} height={256} className="mx-auto" />
					<p className="text-sm">marketcap: {formatEther(token.raised)} ETH</p>
					<p className="text-sm">base cost: {formatEther(cost)} ETH</p>

					{token.curveType !== undefined && (
						<div className="bg-gray-800 p-2 rounded-md text-sm">
							<p>
								Bonding Curve:{" "}
								<span className="font-bold">{getCurveTypeName(token.curveType)}</span>
							</p>
							<p className="text-xs mt-1">Curve parameters determine token price based on supply</p>
							{token.curveSlope && (
								<p className="text-xs mt-1">Slope: {formatSlope(token.curveSlope)}</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{token.sold >= limit || token.raised >= target ? (
				<p className="text-2xl text-center lowercase">target reached!</p>
			) : (
				<form action={buyHandler} className="space-y-6">
					<Input type="number" name="amount" min={1} max={10000} placeholder="1" className="w-full p-6" />
					<Button
						type="submit"
						variant="ghost"
						className="w-full text-2xl hover:scale-110 transition-transform"
					>
						[ buy ]
					</Button>
				</form>
			)}

			<Button onClick={toggleTrade} variant="ghost" className="text-2xl hover:scale-110 transition-transform">
				[ cancel ]
			</Button>
		</ResponsiveModal>
	)
}

export default TradeModal
