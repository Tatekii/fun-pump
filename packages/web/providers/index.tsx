"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ThemeProvider } from "./theme-provider"
import CustomRainbowKitProvider from "./rainbowkit-provider"
import WagmiProvider from "./wagmi-provider"

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<WagmiProvider>
				<QueryClientProvider client={queryClient}>
					<CustomRainbowKitProvider>{children}</CustomRainbowKitProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ThemeProvider>
	)
}
