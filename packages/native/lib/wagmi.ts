import { defaultWagmiConfig } from "@reown/appkit-wagmi-react-native"
import { arbitrum, hardhat, mainnet, polygon } from "@wagmi/core/chains"

export const projectId = "YOUR_PROJECT_ID"

export const metadata = {
	name: "AppKit RN",
	description: "AppKit RN Example",
	url: "https://reown.com/appkit",
	icons: ["https://avatars.githubusercontent.com/u/179229932"],
	redirect: {
		native: "YOUR_APP_SCHEME://",
		universal: "YOUR_APP_UNIVERSAL_LINK.com",
	},
}

const chains = [mainnet, hardhat] as const

export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
