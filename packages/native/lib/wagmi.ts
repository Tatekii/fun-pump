import { defaultWagmiConfig } from "@reown/appkit-wagmi-react-native"
import { hardhat, mainnet } from "wagmi/chains"
import { http } from "viem"
import { factoryAddress } from "@fun-pump/smart-contract"

export const projectId = "d75914c304ecfde8743d05ae830a4439"

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

// NOTE 关联view调用
const chains = [hardhat] as const

// TODO merge wagmi config to shared package
export const wagmiConfig = defaultWagmiConfig({
	chains,
	projectId,
	metadata,
	transports: {
		[mainnet.id]: http(),
		// Add the explicit URL for your local hardhat node
		[hardhat.id]: http("http://127.0.0.1:8545"),
	},
	ssr: true,
})
