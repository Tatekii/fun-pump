"use client"

import { ReactNode, useState } from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { config } from "../config/wagmi"
import { ThemeProvider } from "./theme-provider"
import CustomRainbowKitProvider from "./rainbow-kit-provider"

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<CustomRainbowKitProvider>{children}</CustomRainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	)
}
