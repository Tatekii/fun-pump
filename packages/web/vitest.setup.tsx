// vitest.setup.ts
import { expect, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import * as matchers from "@testing-library/jest-dom/matchers"
import type { ReactNode } from "react"
import { connect } from "wagmi/actions"
import { mockConnector, testWagmiConfig } from "./test-utils"

// Extend Vitest's expect with jest-dom matchers
Object.entries(matchers).forEach(([matcherName, matcher]) => {
	// @ts-ignore
	expect.extend({ [matcherName]: matcher })
})

// Mock next/navigation
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(),
	}),
	usePathname: () => "/",
}))

// Mock next/head
vi.mock("next/head", () => ({
	__esModule: true,
	default: ({ children }: { children: ReactNode }) => {
		return <>{children}</>
	},
}))

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: () => ({
		theme: "light",
		setTheme: vi.fn(),
	}),
}))

// Mock @rainbow-me/rainbowkit
vi.mock("@rainbow-me/rainbowkit", () => ({
	ConnectButton: ({ label, showBalance }: { label?: string; showBalance?: boolean }) => (
		<button data-testid="connect-button">{label || "Connect Wallet"}</button>
	),
}))

// Mock window.ethereum
Object.defineProperty(window, "ethereum", {
	value: {
		isMetaMask: true,
		request: vi.fn(),
		on: vi.fn(),
		removeListener: vi.fn(),
	},
	writable: true,
})

// Clean up after each test
afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})
