import { describe, it, expect, vi, beforeEach } from "vitest"
import { connectMockWallet, render, screen, TEST_ACCOUNTS } from "../../test-utils"
import Header from "../header"
import { useAccount } from "wagmi"

// Simple mock for useAccount
// vi.mock("wagmi", () => ({
//   useAccount: vi.fn(),
//   useConnect: vi.fn(() => ({ connect: vi.fn() })),
//   useDisconnect: vi.fn(() => ({ disconnect: vi.fn() })),
//   useSwitchChain: vi.fn(() => ({ chains: [] })),
//   useConfig: vi.fn(),
//   mainnet: { id: 1, name: 'Ethereum' },
//   createConfig: vi.fn(),
//   http: vi.fn(),
//   WagmiProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
// }))

describe("Header Component", () => {
	const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()
	})

	it("displays the [ connected ] before connect to a wallet", () => {
		render(<Header />)
		const connectButton = screen.getByTestId("connect-button")
		const shortAddress = `[ connect ]`
		expect(connectButton).toHaveTextContent(shortAddress)
	})

	it("displays the connected wallet address", async () => {
		render(<Header />)

		await connectMockWallet()

		const connectButton = screen.getByTestId("connect-button")
		const shortAddress = `${TEST_ACCOUNTS[0].address.slice(0, 6)}...${TEST_ACCOUNTS[0].address.slice(-4)}`
		expect(connectButton).toHaveTextContent(shortAddress)
	})

	it("includes the theme toggle button", () => {
		render(<Header />)
		expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
	})
})
