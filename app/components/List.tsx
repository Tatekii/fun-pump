import { FC, useState } from "react"
import { formatEther } from "viem"
import { useCreateToken } from "../hooks/useContract"
import { useWaitForTransactionReceipt } from "wagmi"

interface ListProps {
	toggleCreate: () => void
	fee: bigint
}

const List: FC<ListProps> = ({ toggleCreate, fee }) => {
	const { createToken } = useCreateToken()

	async function listHandler(formData: FormData) {
		const name = formData.get("name") as string
		const ticker = formData.get("ticker") as string

		if (!name || !ticker) return

		await createToken(name, ticker, fee)
		toggleCreate()
	}

	return (
		<div className="list">
			<h2>list new token</h2>

			<div className="list__description">
				<p>fee: {formatEther(fee)} ETH</p>
			</div>

			<form action={listHandler}>
				<input type="text" name="name" placeholder="name" required />
				<input type="text" name="ticker" placeholder="ticker" required />
				{/* TODO <input type="submit" value={isPending ? "[ listing... ]" : "[ list ]"} disabled={isPending} /> */}
				<input type="submit" value={"[ list ]"} />
			</form>

			<button onClick={toggleCreate} className="btn--fancy">
				[ cancel ]
			</button>
		</div>
	)
}

export default List
