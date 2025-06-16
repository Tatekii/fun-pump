"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { useAtomValue, useSetAtom } from "jotai"
import { Button } from "@/components/ui/button"
import CreateTokenModal from "@/components/create-token-modal"
import TokenCard from "@/components/token-card"
import { TokenFilterComponent } from "@/components/token-filter"
import { flatTokensAtom, tokensQueryAtom } from "@/stores/tokens.atom"
import { TokenSale, useReadFactoryFee } from "@fun-pump/smart-contract"

export default function HomePageClient() {
	const router = useRouter()
	const { address: account } = useAccount()
	const { data: fee = BigInt(0) } = useReadFactoryFee()

	// Get tokens data from Jotai atoms
	const tokens = useAtomValue(flatTokensAtom)

	const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, error, isLoading, isSuccess } =
		useAtomValue(tokensQueryAtom)

	const [showCreate, setShowCreate] = useState(false)

	function handleClickCreate() {
		account && toggleCreate()
	}

	function toggleCreate() {
		setShowCreate(!showCreate)
	}

	function handleTrade(token: TokenSale) {
		router.push(`/trade/${token.token}`)
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

			<div className="col-span-full space-y-8">
				<div className="space-y-4">
					<h1 className="font-extrabold p-4">Token List</h1>

					<TokenFilterComponent />

					<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,0fr))] gap-8 place-content-center text-center m-4">
						{tokens.map((_token) => (
							<TokenCard toggleTrade={handleTrade} token={_token} key={_token.token} />
						))}
					</div>
				</div>

				<Button
					onClick={() => fetchNextPage()}
					disabled={!hasNextPage || isFetchingNextPage}
					className="mx-auto"
				>
					{isLoading
						? "Loading..."
						: isFetchingNextPage
							? "Loading more..."
							: hasNextPage
								? "Load More"
								: "Nothing more to load"}
				</Button>
			</div>

			<CreateTokenModal toggleCreate={toggleCreate} fee={fee} showCreate={showCreate} />
		</main>
	)
}
