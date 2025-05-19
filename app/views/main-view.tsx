"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import CreateTokenModal from "../components/create-token-modal"
import TokenCard from "../components/token-card"
import TradeModal from "../components/trade-modal"
import { useInfiniteTokens } from "../hooks/useInfiniteTokens"
import { useReadFactoryFee } from "../generated"
import { toast } from "sonner"
import { TokenData } from "../types/token.type"

export default function MainView() {
	const { address: account } = useAccount()
	const { data: fee = BigInt(0) } = useReadFactoryFee()
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
	const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)

	function handleClickCreate() {
		account && toggleCreate()
	}

	function toggleCreate() {
		setShowCreate(!showCreate)
	}

	function toggleTrade(token: TokenData | null) {
		setSelectedToken(token)
		setShowTrade(!showTrade)
	}

	return (
		<main className="col-[2/12] grid grid-cols-12 text-center">
			<div className="col-span-full place-content-center min-h-[30svh]">
				<Button
					onClick={handleClickCreate}
					variant="ghost"
					className="text-4xl hover:scale-110 transition-transform"
					disabled={!account}
				>
					{"[ start a new token ]"}
				</Button>
			</div>

			<div className="col-span-full">
				<h1 className=" font-extrabold p-4">Token List</h1>

				<div className="grid grid-cols-[repeat(auto-fill,minmax(300px,0fr))] gap-4 place-content-center text-center m-4">
					{tokens.map((_token) => (
						<TokenCard toggleTrade={toggleTrade} token={_token} key={_token.token} />
					))}
				</div>
				<Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
					{isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
				</Button>
			</div>

			<CreateTokenModal toggleCreate={toggleCreate} fee={fee} showCreate={showCreate} />

			{selectedToken ? (
				<TradeModal open={showTrade} toggleTrade={() => toggleTrade(null)} token={selectedToken} />
			) : null}
		</main>
	)
}
