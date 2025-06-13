import { defineConfig } from "@wagmi/cli";
import { hardhat, react } from "@wagmi/cli/plugins";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// 获取部署地址的工具函数
function getDeployedAddress(contractName: string, chainId: number): `0x${string}` | undefined {
  const deploymentPath = join(
    __dirname,
    "ignition/deployments",
    `chain-${chainId}`,
    "deployed_addresses.json"
  );

  if (existsSync(deploymentPath)) {
    const deployment = JSON.parse(readFileSync(deploymentPath, "utf-8"));
    const address = deployment[contractName];
    if (address) {
      console.log(`Found ${contractName} address for chain ${chainId}: ${address}`);
      return address as `0x${string}`;
    }
  }
  console.warn(`Could not find ${contractName} deployment for chain ${chainId} at ${deploymentPath}`);

  return undefined;
}

export default defineConfig({
  out: "dist/generated.ts", // 输出到dist目录，便于包含在发布包中
  
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
    react({
      useContractRead: true,
      useContractWrite: true,
      useContractEvent: true,
    }),
  ],
});
