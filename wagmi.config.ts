import { defineConfig } from "@wagmi/cli"
import { hardhat, react } from "@wagmi/cli/plugins"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

function getDeployedAddress(contractName: string, chainId: number): `0x${string}` {
	const deploymentPath = join(
		__dirname, // wagmi.config.ts 所在目录
		"ignition",
		"deployments",
		`chain-${chainId}`,
		"deployed_addresses.json" // 或者其他 Ignition 生成的文件名
	)

	if (existsSync(deploymentPath)) {
		const deployment = JSON.parse(readFileSync(deploymentPath, "utf-8"))
		// Ignition 部署报告的结构通常是 { "YourContract": "0x..." }
		// 确保这里能正确获取到你的合约地址
		const address = deployment[contractName]
		if (address) {
			console.log(`Found YourContract address for chain ${chainId}: ${address}`)
			return address
		}
	}
	console.warn(`Could not find YourContract deployment for chain ${chainId} at ${deploymentPath}`)

	return "0x" // 如果找不到，返回 undefined
}

export default defineConfig({
	out: "app/generated.ts",
	
	contracts: [],
	plugins: [
		hardhat({
			project: "./",
			deployments: {
				Factory: {
					31337: getDeployedAddress("FactoryModule#Factory", 31337),
					// 11155111: getDeployedAddress("Factory", 11155111),
				},
				CrowdfundingLib: {
					31337: getDeployedAddress("FactoryModule#CrowdfundingLib", 31337),
					// 11155111: getDeployedAddress("CrowdfundingLib", 11155111),
				},
			},
		}),
		react(),
	],
})
