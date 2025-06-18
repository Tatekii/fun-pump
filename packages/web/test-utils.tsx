import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, RenderOptions, RenderResult } from "@testing-library/react"
import { ReactElement, ReactNode } from "react"
import { Address, createTestClient, http, publicActions, walletActions } from "viem"
import { WagmiProvider, createConfig } from "wagmi"
import { connect } from "wagmi/actions"
import { hardhat } from "wagmi/chains"
import { mock } from "wagmi/connectors"

// hardhat#19
export const TEST_ACCOUNTS = [
	{
		address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" as Address,
		key: "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
	},
]

// Create mock connector that can be connected in tests
export const mockConnector = mock({
	accounts: [TEST_ACCOUNTS[0].address],
	features: {
		defaultConnected: true, // 默认连接
	},
})

export const testWagmiConfig = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
	// connectors: [mockConnector],
	// client({ chain }) {
	// 	return (
	// 		createTestClient({
	// 			transport: http(),
	// 			chain,
	// 			mode: "hardhat",
	// 			// Pass the account address and private key, so we can sign transactions
	// 			account: TEST_ACCOUNTS[0].address,
	// 			key: TEST_ACCOUNTS[0].key,
	// 			// Use a low pollingInterval to speed up tests
	// 			pollingInterval: 100,
	// 		})
	// 			// Extend the client with public and wallet actions, so it can also act as a Public Client and Wallet Client
	// 			.extend(publicActions)
	// 			.extend(walletActions)
	// 	)
	// },

	// Disable multiInjectedProviderDiscovery because it uses browser APIs
	multiInjectedProviderDiscovery: false,
})

export const connectMockWallet = async () => {
	const { connect } = await import("wagmi/actions")
	await connect(testWagmiConfig, {
		connector: mockConnector,
	})
}

// Simple wrapper for testing
const createTestQueryClient = () => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
		},
	})
}

type TestProviderProps = {
	children: ReactNode
}

// Create a test provider with necessary contexts
const TestProviders = ({ children }: TestProviderProps) => {
	const queryClient = createTestQueryClient()

	return (
		<WagmiProvider config={testWagmiConfig as any}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	)
}

// Custom render function with providers
type CustomRenderOptions = Omit<RenderOptions, "wrapper">

const customRender = (ui: ReactElement, options?: CustomRenderOptions): RenderResult => {
	return render(ui, {
		wrapper: TestProviders,
		...options,
	})
}

export * from "@testing-library/react"
// Override render method
export { customRender as render }
