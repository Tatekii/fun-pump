import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { hardhat, sepolia } from "wagmi/chains"
import { http } from "wagmi"

export const config = getDefaultConfig({
    appName: "Fun Pump",
    projectId: "d75914c304ecfde8743d05ae830a4439",
    chains: [hardhat, sepolia] as const,
    transports: {
        [hardhat.id]: http(),
        [sepolia.id]: http(),
    }
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
