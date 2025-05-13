"use client"

import { useState } from "react"
import { useAccount } from "wagmi"

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// Hooks
import { useTokens } from "./hooks/useTokens"

export default function Home() {
	const { address: account } = useAccount()
	const { fee, tokens } = useTokens()
	
	const [selectedToken, setSelectedToken] = useState<string | null>(null)
	const [showCreate, setShowCreate] = useState(false)
	const [showTrade, setShowTrade] = useState(false)

	function toggleCreate() {
		setShowCreate(!showCreate)
	}

	function toggleTrade(token: string) {
		setSelectedToken(token)
		setShowTrade(!showTrade)
	}

	return (
		<div className="page">
			<Header/>

			<main>
				<div className="create">
					<button onClick={account ? toggleCreate : undefined} className="btn--fancy">
						{!account ? "[ please connect ]" : "[ start a new token ]"}
					</button>
				</div>

				<div className="listings">
					<h1>new listings</h1>

					<div className="tokens">
						{!account ? (
							<p>please connect wallet</p>
						) : tokens.length === 0 ? (
							<p>No tokens listed</p>
						) : (
							tokens.map((token, index) => (
								<Token toggleTrade={toggleTrade} token={token} key={index} />
							))
						)}
					</div>
				</div>

				{showCreate && fee && <List toggleCreate={toggleCreate} fee={fee} />}

				{showTrade && selectedToken && (
					<Trade 
						toggleTrade={() => toggleTrade(selectedToken)} 
						token={tokens.find(t => t.token === selectedToken)!} 
					/>
				)}
			</main>
		</div>
	)
}
