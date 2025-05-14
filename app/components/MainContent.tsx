"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useTokens } from "../hooks/useTokens"
import { Button } from "@/components/ui/button"
import List from "./List"
import Token from "./Token"
import Trade from "./Trade"
import { useInfiniteTokens } from "../hooks/useInfiniteTokens"

export default function MainContent() {
	const { address: account } = useAccount()
	const { fee } = useTokens()
	const {
		tokens, // All fetched tokens combined
		fetchNextPage, // Function to load more tokens
		hasNextPage, // Boolean indicating if more tokens exist
		isFetchingNextPage, // Loading state for next page
		isError, // Error state
		error, // Error object if any
		isLoading, // Initial loading state
		isSuccess, // Success state
	} = useInfiniteTokens()
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
					disabled={!account}
				>
					{"[ start a new token ]"}
				</Button>
			</div>

			<div className="col-span-full">
				<h1 className=" font-extrabold p-4">Token List</h1>

				<div className="grid grid-cols-[repeat(auto-fill,minmax(400px,0fr))] gap-4 place-content-center text-center">
					{tokens.map((token) => (
						<Token toggleTrade={toggleTrade} token={token} key={token.token} />
					))}
				</div>
				<Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
					{isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
				</Button>
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
