import TradePageClient from "./client"
import TokenContextProvider from "./provider/token.provider"

export default async function TradePage({
	params,
	searchParams,
}: {
	params: Promise<{ tokenAddress: `0x${string}` }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const tokenAddress = (await params).tokenAddress
	return (
		<TokenContextProvider tokenAddress={tokenAddress}>
			<TradePageClient />
		</TokenContextProvider>
	)
}
