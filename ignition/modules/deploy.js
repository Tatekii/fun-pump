/**
 * @module FactoryModule
 * @description Hardhat Ignition module for deploying the Factory contract and its dependencies
 * @author siynma
 *
 * This module deploys:
 * 1. The CrowdfundingLib library
 * 2. The Factory contract with the library linked
 *
 * After deployment, it saves the Factory contract's address and ABI to a JSON file
 * in the deployments directory, organized by chainId.
 *
 * @param {import("@nomicfoundation/hardhat-ignition/").IgnitionModuleBuilder} m - The Ignition module context
 * @returns {Object} The deployed contracts
 * @returns {import("ethers").Contract} returns.factory - The deployed Factory contract
 */
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
	// // Instead of using await, use onDeployment to handle post-deployment actions

	// ;async () => {
	// 	const fs = require("fs")
	// 	const path = require("path")
	// 	const chainId = await deployedFactory.provider.getNetwork().then((n) => n.chainId)

	// 	const deploymentDir = path.join(__dirname, "deployments", chainId.toString())

	// 	// Create directory if it doesn't exist
	// 	if (!fs.existsSync(deploymentDir)) {
	// 		fs.mkdirSync(deploymentDir, { recursive: true })
	// 	}

	// 	fs.writeFileSync(
	// 		path.join(deploymentDir, "Factory.json"),
	// 		JSON.stringify(
	// 			{
	// 				address: deployedFactory.target,
	// 				abi: deployedFactory.interface.format(),
	// 			},
	// 			null,
	// 			2
	// 		)
	// 	)
	// }

	return { factory }
})
