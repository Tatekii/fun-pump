import { FC } from "react"
import { TokenData } from "../types/global"
import { useTokenSale, useBuyToken } from "../hooks/useContract"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import {
	useReadCrowdfundingLibFundingLimit,
	useReadCrowdfundingLibFundingTarget,
	useReadFactoryGetCost,
} from "../generated"

interface ITradeProps {
	toggleTrade: () => void
	token: TokenData
}

const Trade: FC<ITradeProps> = ({ toggleTrade, token }) => {
	const { data: target = BigInt(0) } = useReadCrowdfundingLibFundingTarget()

	const { data: limit = BigInt(0) } = useReadCrowdfundingLibFundingLimit()

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
		<div className="trade">
			<h2>trade</h2>

			<div className="token__details">
				<p className="name">{token.name}</p>
				<p>creator: {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}</p>
				<img src={token.image} alt="token" width={256} height={256} />
				<p>marketcap: {formatEther(token.raised)} ETH</p>
				<p>base cost: {formatEther(cost)} ETH</p>
			</div>

			{token.sold >= limit || token.raised >= target ? (
				<p className="disclaimer">target reached!</p>
			) : (
				<form action={buyHandler}>
					<input type="number" name="amount" min={1} max={10000} placeholder="1" />
					{/* <input type="submit" value={isLoading ? "[ buying... ]" : "[ buy ]"} disabled={isLoading} /> */}
					<input type="submit" value={"[ buy ]"} />
				</form>
			)}

			<button onClick={toggleTrade} className="btn--fancy">
				[ cancel ]
			</button>
		</div>
	)
}

export default Trade
