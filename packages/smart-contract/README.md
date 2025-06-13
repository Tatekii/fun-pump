# @fun-pump/smart-contract

智能合约包，为Fun Pump众筹平台提供合约ABI和类型定义。

## 安装

```bash
# 使用bun
bun add @fun-pump/smart-contract

# 或使用npm
npm install @fun-pump/smart-contract

# 或使用yarn
yarn add @fun-pump/smart-contract
```

## 使用方法

### 获取合约ABI

```javascript
import { abis } from '@fun-pump/smart-contract';

// 工厂合约ABI
const factoryAbi = abis.Factory;

// 代币合约ABI
const tokenAbi = abis.Token;
```

### 获取合约地址

```javascript
import { networks } from '@fun-pump/smart-contract';

// 获取指定网络的工厂合约地址
const networkId = 1; // 以太坊主网
const factoryAddress = networks[networkId]?.Factory;

// 检查地址是否存在
if (factoryAddress) {
  console.log(`工厂合约地址: ${factoryAddress}`);
} else {
  console.log('当前网络未部署工厂合约');
}
```

### TypeScript类型

```typescript
import { Address, TokenSale, SaleStage, CurveType } from '@fun-pump/smart-contract';

// 使用枚举
function getStatusText(stage: SaleStage): string {
  switch (stage) {
    case SaleStage.Created: return '已创建';
    case SaleStage.Active: return '正在进行';
    case SaleStage.Successful: return '成功';
    case SaleStage.Failed: return '失败';
    case SaleStage.Closed: return '已关闭';
    default: return '未知';
  }
}

// 使用接口
function formatTokenSale(sale: TokenSale): string {
  return `代币 ${sale.name} - 状态: ${getStatusText(sale.stage)}`;
}
```

## 与Wagmi集成

```typescript
// wagmi.config.ts
import { defineConfig } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';
import { abis } from '@fun-pump/smart-contract';

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [react()],
  contracts: [
    {
      name: 'Factory',
      abi: abis.Factory,
    },
    {
      name: 'Token',
      abi: abis.Token,
    },
  ],
});
```

## 开发

```bash
# 编译合约
bun run compile

# 运行测试
bun run test

# 提取ABI文件
bun run build:abis

# 构建完整包
bun run build

# 更新合约地址
bun run update-address <networkId> <contractName> <contractAddress>
```
