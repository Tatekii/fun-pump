'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat, sepolia } from 'wagmi/chains'
import { http } from 'wagmi'

export const config = getDefaultConfig({
  appName: 'Fun Pump',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [hardhat, sepolia] as const,
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http()
  }
})
