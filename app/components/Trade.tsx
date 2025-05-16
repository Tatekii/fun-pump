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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ITradeProps {
	toggleTrade: () => void
	token: TokenData
}

const Trade: FC<ITradeProps> = ({ toggleTrade, token }) => {
	const { data: target = BigInt(0), error: targetError, isLoading: targetLoading } =
		useReadCrowdfundingLibFundingTarget()

	const { data: limit = BigInt(0), error: limitError, isLoading: limitLoading } =
		useReadCrowdfundingLibFundingLimit()

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
		<Dialog open={true} onOpenChange={toggleTrade}>
			<DialogContent className="backdrop-blur-sm">
				<DialogHeader>
					<DialogTitle className="text-4xl text-center">trade</DialogTitle>
				</DialogHeader>

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
					</CardContent>
				</Card>

				{token.sold >= limit || token.raised >= target ? (
					<p className="text-2xl text-center lowercase">target reached!</p>
				) : (
					<form action={buyHandler} className="space-y-6">
						<Input
							type="number"
							name="amount"
							min={1}
							max={10000}
							placeholder="1"
							className="w-full p-6"
						/>
						<Button 
							type="submit"
							variant="ghost"
							className="w-full text-2xl hover:scale-110 transition-transform"
						>
							[ buy ]
						</Button>
					</form>
				)}

				<Button 
					onClick={toggleTrade}
					variant="ghost"
					className="text-2xl hover:scale-110 transition-transform"
				>
					[ cancel ]
				</Button>
			</DialogContent>
		</Dialog>
	)
}

export default Trade
