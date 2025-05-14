// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")
const { parseEther } = require("ethers")

const FEE = parseEther("0.01")

module.exports = buildModule("FactoryModule", (m) => {
	const fee = m.getParameter("fee", FEE)

	const crowdfundingLib = m.contract("CrowdfundingLib")

	const factory = m.contract("Factory", [fee], {
		libraries: {
			CrowdfundingLib: crowdfundingLib,
		},
	})

	return { factory }
})
