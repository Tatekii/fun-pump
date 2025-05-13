import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'
import { getIgnitionDeployment } from './utils/deployments'

export default defineConfig({
  out: 'app/generated.ts',
  contracts: [],
  plugins: [
    hardhat({
      project: './',
      deployments: {
        // CrowdfundingLib: await getIgnitionDeployment('CrowdfundingLib'),
        Factory: await getIgnitionDeployment('Factory')
      }
    })
  ]
})
