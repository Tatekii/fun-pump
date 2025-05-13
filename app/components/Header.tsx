import { FC } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header: FC = () => {
	const { address } = useAccount()

	return (
		<header>
			<p className="brand">fun.pump</p>

			<ConnectButton
				label={address ? `[ ${address.slice(0, 6)}...${address.slice(38, 42)} ]` : "[ connect ]"}
				showBalance={false}
			/>
		</header>
	)
}

export default Header
