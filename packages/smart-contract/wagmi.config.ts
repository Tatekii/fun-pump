import { defineConfig } from "@wagmi/cli"
import { hardhat, react } from "@wagmi/cli/plugins"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

// 获取部署地址的工具函数
function getDeployedAddress(contractName: string, chainId: number): `0x${string}` {
	const deploymentPath = join(
		__dirname,
		"ignition/deployments",
		`chain-${chainId}`,
		"deployed_addresses.json"
	)

	console.log(`Checking for deployment at: ${deploymentPath}`)

	if (existsSync(deploymentPath)) {
		try {
			const deployment = JSON.parse(readFileSync(deploymentPath, "utf-8"))
			const address = deployment[contractName]
			if (address) {
				console.log(`Found ${contractName} address for chain ${chainId}: ${address}`)
				return address as `0x${string}`
			}
		} catch (error) {
			console.error(`Error parsing deployment file: ${error}`)
		}
	}

	console.warn(`Could not find ${contractName} deployment for chain ${chainId}, using default address`)
	return `0x0000000000000000000000000000000000000000` as `0x${string}`
}

export default defineConfig({
	out: "src/generated.ts",

	plugins: [
		hardhat({
			project: ".", // 当前目录是smart-contract项目
			deployments: {
				Factory: {
					31337: getDeployedAddress("FactoryModule#Factory", 31337),
					// 11155111: getDeployedAddress("Factory", 11155111), // Sepolia测试网
				},
				Token: {
					// 这里不需要部署地址，因为Token是由Factory动态创建的
				},
				CrowdfundingLib: {
					31337: getDeployedAddress("FactoryModule#CrowdfundingLib", 31337),
					// 11155111: getDeployedAddress("CrowdfundingLib", 11155111), // Sepolia测试网
				},
			},
		}),
    
		react(),
	],
})
