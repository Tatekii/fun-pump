"use client"
import { FC } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { ModeToggle } from "./mode-toggle"

const Header: FC = () => {
	const { address } = useAccount()


	console.log(address);
	

	return (
		<header className="col-[2/12] flex justify-between items-center p-6">
			<div className="text-4xl -rotate-5 flex gap-2">
				<p>fun.pump</p>
				<ModeToggle />
			</div>

			<div className="rotate-5">
				<ConnectButton
					label={address ? `[ ${address.slice(0, 6)}...${address.slice(38, 42)} ]` : "[ connect ]"}
					showBalance={false}
				/>
			</div>
		</header>
	)
}

export default Header
