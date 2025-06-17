"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "./theme-provider"
import CustomRainbowKitProvider from "./rainbowkit-provider"
import WagmiProvider from "./wagmi-provider"

export function RootProviders({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<ThemeProvider>
			<WagmiProvider>
				<QueryClientProvider client={queryClient}>
					<CustomRainbowKitProvider>{children}</CustomRainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	)
}
