const fs = require('fs');
const path = require('path');

// 网络ID和合约地址是脚本参数
const [networkId, contractName, contractAddress] = process.argv.slice(2);

if (!networkId || !contractName || !contractAddress) {
  console.error('使用方法: bun run update-address <networkId> <contractName> <contractAddress>');
  process.exit(1);
}

// 验证地址格式
if (!contractAddress.startsWith('0x')) {
  console.error('错误: 合约地址必须以0x开头');
  process.exit(1);
}

// 网络配置文件路径
const NETWORKS_FILE = path.join(__dirname, '../dist/networks.json');

// 确保目录存在
const dir = path.dirname(NETWORKS_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 读取现有配置
let networks = {};
if (fs.existsSync(NETWORKS_FILE)) {
  networks = JSON.parse(fs.readFileSync(NETWORKS_FILE, 'utf8'));
}

// 确保网络ID存在
if (!networks[networkId]) {
  networks[networkId] = {};
}

// 更新合约地址
networks[networkId][contractName] = contractAddress;

// 写回文件
fs.writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2));

console.log(`✅ 已更新 ${contractName} 在网络 ${networkId} 上的地址为 ${contractAddress}`);
