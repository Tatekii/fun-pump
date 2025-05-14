import { defineConfig } from "@wagmi/cli"
import { hardhat, react } from "@wagmi/cli/plugins"
import * as dotenv from "dotenv"

dotenv.config({
	path:'.env.local'
})

const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS
const libAddress = process.env.NEXT_PUBLIC_LIB_ADDRESS

console.log(factoryAddress);


export default defineConfig({
	out: "app/generated.ts",
	contracts: [],
	plugins: [
		hardhat({
			project: "./",
			deployments: {
				Factory: {
					31337: factoryAddress,
					11155111: factoryAddress,
				},
				CrowdfundingLib:{
					31337: libAddress,
					11155111: libAddress,
				}
			},
		}),
		react(),
	],
})
