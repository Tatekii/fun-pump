import { defineConfig } from "@wagmi/cli"
import { hardhat, react } from "@wagmi/cli/plugins"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

function getDeployedAddress(contractName: string, chainId: number): `0x${string}` {
	const artifactPath = join(__dirname, "deployments", chainId.toString(), `${contractName}.json`)

	if (!existsSync(artifactPath)) {
		console.warn(`No deployment found for ${contractName} on chain ${chainId}`)
	}

	try {
		const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"))
		return artifact.address as `0x${string}`
	} catch (error) {
		console.error(`Error reading deployment for ${contractName}:`, error)
	}

	return "0x"
}

export default defineConfig({
	out: "app/generated.ts",
	contracts: [],
	plugins: [
		hardhat({
			project: "./",
			deployments: {
				Factory: {
					31337: getDeployedAddress("Factory", 31337),
					11155111: getDeployedAddress("Factory", 11155111),
				},
				CrowdfundingLib: {
					31337: getDeployedAddress("CrowdfundingLib", 31337),
					11155111: getDeployedAddress("CrowdfundingLib", 11155111),
				},
			},
		}),
		react(),
	],
})
