# @fun-pump/smart-contract

智能合约包，为Fun Pump众筹平台提供合约ABI、类型定义和Wagmi hooks。

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

### 使用Wagmi生成的Hooks

```typescript
import { 
  useReadFactoryTotalTokens, 
  useReadFactoryTokenForSale,
  useWriteFactoryCreate,
  useWriteFactoryBuy
} from '@fun-pump/smart-contract';

// 读取总代币数量
function TotalTokensComponent() {
  const { data, isLoading } = useReadFactoryTotalTokens();
  return <div>总代币数量: {isLoading ? '加载中...' : data?.toString()}</div>;
}

// 读取代币详情
function TokenSaleDetails({ tokenAddress }) {
  const { data } = useReadFactoryTokenForSale({
    args: [tokenAddress as `0x${string}`],
  });
  
  if (!data) return <div>加载中...</div>;
  
  return (
    <div>
      <h2>{data[1]}</h2>
      <p>创建者: {data[2]}</p>
      {/* 更多代币信息 */}
    </div>
  );
}

// 创建新代币
function CreateTokenButton() {
  const { writeContract } = useWriteFactoryCreate();
  
  const handleCreate = async () => {
    try {
      await writeContract({
        args: [
          "My Token",
          "MTK",
          BigInt(Math.floor(Date.now() / 1000)),
          BigInt(Math.floor(Date.now() / 1000) + 86400 * 30),
          "ipfs://hash",
          0, // CurveType.LINEAR
          BigInt(1000)
        ],
        value: BigInt(1e17) // 0.1 ETH
      });
    } catch (error) {
      console.error("创建失败", error);
    }
  };
  
  return <button onClick={handleCreate}>创建代币</button>;
}
```

### 使用类型定义

```typescript
import { TokenSale, CurveType } from '@fun-pump/smart-contract';

// 使用TokenSale类型
function formatTokenSale(sale: TokenSale): string {
  return `代币 ${sale.name} (${sale.sold}/${sale.raised})`;
}

// 使用CurveType枚举
function getCurveDescription(curveType: CurveType): string {
  switch (curveType) {
    case CurveType.LINEAR:
      return '线性曲线';
    case CurveType.QUADRATIC:
      return '二次曲线';
    case CurveType.EXPONENTIAL:
      return '指数曲线';
    default:
      return '未知曲线';
  }
}
```

### 使用合约地址

```typescript
import { factoryAddress } from '@fun-pump/smart-contract';

// 获取Factory合约地址（目前支持链ID: 31337）
console.log(`Factory合约地址: ${factoryAddress[31337]}`);
```

## 包结构

```
@fun-pump/smart-contract/
├── dist/                      # 发布的TypeScript文件
│   ├── index.ts               # 主入口点
│   ├── types/                 # 类型定义
│   └── generated.ts           # 自动生成的Wagmi hooks
├── artifacts/                 # 编译后的合约ABI和字节码
│   └── contracts/
│       ├── Factory.sol/       # 工厂合约编译产物
│       └── Token.sol/         # 代币合约编译产物
```

## 构建配置

此包使用以下构建配置:

1. TypeScript源文件被直接复制到`dist`目录，保持`.ts`扩展名
2. 智能合约ABI通过`artifacts/contracts/**/*.json`一起发布
3. 没有`.d.ts`文件生成，直接使用原始TypeScript文件

## 开发指南

### 安装依赖

```bash
# 安装依赖
bun install
```

### 编译合约

```bash
# 编译Solidity合约
bun run compile
```

### 测试合约

```bash
# 运行合约测试
bun run test
```

### 本地部署

```bash
# 先启动本地节点
bun run node

# 在另一个终端部署合约
bun run deploy:local
```

### 构建包

```bash
# 构建完整的NPM包
bun run build
```

此命令会:
1. 清空dist目录
2. 编译智能合约
3. 使用Wagmi生成hooks
4. 将TypeScript源文件复制到dist目录

### 更新合约地址

部署到新网络后，可以使用以下命令更新地址:

```bash
bun run update-address <networkId> <contractName> <address>
```

例如:
```bash
bun run update-address 11155111 Factory 0x1234...5678
```
