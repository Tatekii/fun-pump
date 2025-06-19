#!/usr/bin/env node
/**
 * This script extracts ABIs from compiled contracts and saves them in a format
 * suitable for the subgraph package to consume.
 */
const fs = require('fs');
const path = require('path');

// Paths
const artifactsDir = path.resolve(__dirname, '../artifacts/contracts');
const abiOutputDir = path.resolve(__dirname, '../src/abis');

// Ensure the output directory exists
if (!fs.existsSync(abiOutputDir)) {
  fs.mkdirSync(abiOutputDir, { recursive: true });
}

// List of contracts to extract ABIs for
const contracts = [
  { name: 'Factory', path: 'Factory.sol/Factory.json' },
  { name: 'Token', path: 'Token.sol/Token.json' }
];

console.log('Extracting ABIs for subgraph consumption...');

// Extract ABIs from contract artifacts
contracts.forEach(contract => {
  const artifactPath = path.join(artifactsDir, contract.path);
  
  try {
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      const abi = artifact.abi;
      
      // Write ABI to output file
      const outputPath = path.join(abiOutputDir, `${contract.name}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
      console.log(`✅ Extracted ABI for ${contract.name}`);
    } else {
      console.error(`❌ Artifact not found for ${contract.name} at ${artifactPath}`);
    }
  } catch (error) {
    console.error(`❌ Error extracting ABI for ${contract.name}:`, error.message);
  }
});

// Create an addresses export
const addressesFilePath = path.join(abiOutputDir, 'addresses.json');
const templateAddresses = {
  factory: {
    mainnet: "",
    sepolia: "",
    localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Default local hardhat address
  }
};

// Don't overwrite if exists
if (!fs.existsSync(addressesFilePath)) {
  fs.writeFileSync(addressesFilePath, JSON.stringify(templateAddresses, null, 2));
  console.log('✅ Created template addresses.json');
} else {
  console.log('ℹ️ addresses.json already exists, skipping');
}

console.log('ABI extraction complete! Files are available in the abis/ directory.');
