import { isDev } from "@/lib/utils"
import { projectId, wagmiConfig } from "@/lib/wagmi"
import { createAppKit, AppKit } from "@reown/appkit-wagmi-react-native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { FC, PropsWithChildren } from "react"
import { hardhat, mainnet } from "viem/chains"
import { WagmiProvider } from "wagmi"

createAppKit({
	projectId,
	wagmiConfig,
	defaultChain: isDev ? hardhat : mainnet, // Optional
	enableAnalytics: false, // Optional - defaults to your Cloud configuration
})

const queryClient = new QueryClient()

const MyWagmiProvider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				{children}
				<AppKit />
			</QueryClientProvider>
		</WagmiProvider>
	)
}

export default MyWagmiProvider
