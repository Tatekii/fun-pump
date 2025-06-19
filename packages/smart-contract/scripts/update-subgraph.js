#!/usr/bin/env node
/**
 * This script reads the deployed contract addresses and updates the subgraph configuration
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const network = process.argv[2] || 'localhost';

// Path to the latest deployment
const deploymentsDir = path.resolve(__dirname, '../ignition/deployments');
const deploymentFiles = fs.readdirSync(deploymentsDir);

// Sort by creation time to get the latest
const latestDeployment = deploymentFiles
  .filter(file => file.endsWith('.json'))
  .sort((a, b) => {
    const statA = fs.statSync(path.join(deploymentsDir, a));
    const statB = fs.statSync(path.join(deploymentsDir, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  })[0];

if (!latestDeployment) {
  console.error('No deployment found. Please deploy the contracts first.');
  process.exit(1);
}

// Read the deployment file
const deploymentPath = path.join(deploymentsDir, latestDeployment);
console.log(`Reading deployment from ${deploymentPath}`);
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Extract the Factory contract address
const factoryContract = Object.values(deployment.contracts).find(
  contract => contract.contractName === 'Factory'
);

if (!factoryContract) {
  console.error('Factory contract not found in deployment');
  process.exit(1);
}

const factoryAddress = factoryContract.address;
console.log(`Found Factory address: ${factoryAddress}`);

// Update the addresses.json file first
try {
  console.log(`Updating smart contract addresses file...`);
  execSync(`node ${path.join(__dirname, 'update-address.js')} ${network} Factory ${factoryAddress}`, { stdio: 'inherit' });
  console.log('Smart contract addresses updated successfully');
} catch (error) {
  console.error('Failed to update addresses:', error.message);
  process.exit(1);
}

// Run the extract-abis script to ensure ABIs are up to date
try {
  console.log(`Extracting contract ABIs...`);
  execSync(`node ${path.join(__dirname, 'extract-abis.js')}`, { stdio: 'inherit' });
  console.log('Contract ABIs extracted successfully');
} catch (error) {
  console.error('Failed to extract ABIs:', error.message);
  process.exit(1);
}

// Copy files to the subgraph package
const subgraphDir = path.resolve(__dirname, '../../subgraph');
const subgraphAbisDir = path.join(subgraphDir, 'abis');

// Ensure the subgraph abis directory exists
if (!fs.existsSync(subgraphAbisDir)) {
  fs.mkdirSync(subgraphAbisDir, { recursive: true });
}

// Copy the ABIs
const abiFiles = ['Factory.json', 'Token.json'];
abiFiles.forEach(file => {
  const sourcePath = path.join(__dirname, '../abis', file);
  const targetPath = path.join(subgraphAbisDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${file} to subgraph package`);
  } else {
    console.error(`ABI file ${file} not found`);
  }
});

// Update the subgraph.yaml with the new contract address
const subgraphYamlPath = path.join(subgraphDir, 'subgraph.yaml');
if (fs.existsSync(subgraphYamlPath)) {
  try {
    // Use the subgraph script to update the address
    console.log(`Updating subgraph.yaml with Factory address: ${factoryAddress}`);
    execSync(`node ${path.join(subgraphDir, 'scripts/update-address.js')} ${network} ${factoryAddress}`, { stdio: 'inherit' });
    console.log('Subgraph configuration updated successfully');
  } catch (error) {
    console.error('Failed to update subgraph configuration:', error.message);
    process.exit(1);
  }
} else {
  console.error('Subgraph configuration file not found');
  process.exit(1);
}
