"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useTokens } from "../hooks/useTokens"
import { Button } from "@/components/ui/button"
import List from "./List"
import Token from "./Token"
import Trade from "./Trade"

export default function MainContent() {
	const { address: account } = useAccount()
	const { fee, tokens } = useTokens()
	const [showCreate, setShowCreate] = useState(false)
	const [showTrade, setShowTrade] = useState(false)
	const [selectedToken, setSelectedToken] = useState<string | null>(null)

	function toggleCreate() {
		setShowCreate(!showCreate)
	}

	function toggleTrade(token: string) {
		setSelectedToken(token)
		setShowTrade(!showTrade)
	}

	return (
		<main className="col-[2/12] grid grid-cols-12 text-center">
			<div className="col-span-full place-content-center min-h-[30svh]">
				<Button
					onClick={account ? toggleCreate : undefined}
					variant="ghost"
					className="text-4xl hover:scale-110 transition-transform"
				>
					{!account ? "[ please connect ]" : "[ start a new token ]"}
				</Button>
			</div>

			<div className="col-span-full">
				<h1 className=" font-extrabold p-4">Token List</h1>

				<div className="grid grid-cols-[repeat(auto-fill,minmax(400px,0fr))] gap-4 place-content-center text-center">
					{!account ? (
						<p className="col-span-full  text-2xl">please connect wallet</p>
					) : tokens.length === 0 ? (
						<p className="col-span-full  text-2xl">No tokens listed</p>
					) : (
						tokens.map((token, index) => <Token toggleTrade={toggleTrade} token={token} key={index} />)
					)}
				</div>
			</div>

			{showCreate && fee && <List toggleCreate={toggleCreate} fee={fee} />}

			{showTrade && selectedToken && (
				<Trade
					toggleTrade={() => toggleTrade(selectedToken)}
					token={tokens.find((t) => t.token === selectedToken)!}
				/>
			)}
		</main>
	)
}
