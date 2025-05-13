import fs from "fs"
import path from "path"

export async function getIgnitionDeployment(contractName: string) {
	try {
		// Check multiple possible deployment paths
		const possiblePaths = ["ignition/deployments", ".ignition/deployments", "deployments"]

		let deploymentsPath
		for (const p of possiblePaths) {
			const fullPath = path.join(process.cwd(), p)
			if (fs.existsSync(fullPath)) {
				deploymentsPath = fullPath
				break
			}
		}

		if (!deploymentsPath) {
			throw new Error("Deployments directory not found")
		}

		// Check chain-specific folders
		const chainFolders = ["chain-31337", "chain-11155111"].filter((folder) =>
			fs.existsSync(path.join(deploymentsPath, folder))
		)

		if (chainFolders.length === 0) {
			throw new Error("No chain deployment folders found")
		}

		const addresses: Record<number, string | undefined> = {}

		// Read deployments for each chain
		for (const chainFolder of chainFolders) {
			const chainId = parseInt(chainFolder.split("-")[1])
			const artifactPath = path.join(deploymentsPath, chainFolder, "artifacts.json")

			if (fs.existsSync(artifactPath)) {
				const artifacts = JSON.parse(fs.readFileSync(artifactPath, "utf-8"))
				const deployment = artifacts.contracts?.[contractName]
				if (deployment?.address) {
					addresses[chainId] = deployment.address
				}
			}
		}

		return {
			31337: addresses[31337] as `0x${string}`,
			11155111: addresses[11155111] as `0x${string}`,
		}
	} catch (error) {
		console.error(`Error getting deployment for ${contractName}:`, error)
		return {
			31337: "0x01" as `0x${string}`,
			11155111: "0x01" as `0x${string}`,
		}
	}
}
