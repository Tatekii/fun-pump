const fs = require('fs');
const path = require('path');

// Network ID and contract details as script parameters
const [networkId, contractName, contractAddress] = process.argv.slice(2);

if (!networkId || !contractName || !contractAddress) {
  console.error('Usage: bun run update-address <networkId> <contractName> <contractAddress>');
  process.exit(1);
}

// Validate address format
if (!contractAddress.startsWith('0x')) {
  console.error('Error: Contract address must start with 0x');
  process.exit(1);
}

// Network config file path
const NETWORKS_FILE = path.join(__dirname, '../dist/networks.json');
// ABI addresses file for subgraph integration
const ABI_ADDRESSES_FILE = path.join(__dirname, '../abis/addresses.json');

// Ensure directories exist
const networksDir = path.dirname(NETWORKS_FILE);
if (!fs.existsSync(networksDir)) {
  fs.mkdirSync(networksDir, { recursive: true });
}

const abiDir = path.dirname(ABI_ADDRESSES_FILE);
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir, { recursive: true });
}

// Read existing networks config
let networks = {};
if (fs.existsSync(NETWORKS_FILE)) {
  networks = JSON.parse(fs.readFileSync(NETWORKS_FILE, 'utf8'));
}

// Ensure network ID exists
if (!networks[networkId]) {
  networks[networkId] = {};
}

// Update contract address
networks[networkId][contractName] = contractAddress;

// Write back to networks file
fs.writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2));

// Update ABI addresses file for subgraph integration
let abiAddresses = { factory: {} };
if (fs.existsSync(ABI_ADDRESSES_FILE)) {
  try {
    abiAddresses = JSON.parse(fs.readFileSync(ABI_ADDRESSES_FILE, 'utf8'));
    if (!abiAddresses.factory) {
      abiAddresses.factory = {};
    }
  } catch (error) {
    console.error('Error reading ABI addresses file:', error.message);
  }
}

// Map contract name to ABI key
if (contractName.toLowerCase() === 'factory') {
  abiAddresses.factory[networkId] = contractAddress;
  fs.writeFileSync(ABI_ADDRESSES_FILE, JSON.stringify(abiAddresses, null, 2));
  console.log(`✅ Updated ABI addresses for subgraph integration`);
}

console.log(`✅ Updated ${contractName} address on network ${networkId} to ${contractAddress}`);
