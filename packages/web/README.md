# @fun-pump/web

Fun Pump的前端应用，基于Next.js构建的去中心化众筹平台UI。

## 技术栈

- **前端框架**: [Next.js 15](https://nextjs.org/)
- **区块链集成**: [Wagmi v2](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/)
- **状态管理**: [Jotai](https://jotai.org/) + [TanStack Query](https://tanstack.com/query/latest)
- **UI组件**: [Shadcn/ui](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **表单处理**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)

## 功能特性

- 连接钱包（通过RainbowKit）
- 浏览众筹代币
- 创建新的众筹代币
- 参与现有众筹
- 实时查看众筹状态
- 筛选和搜索功能
- 响应式设计，适配移动端和桌面端

## 快速开始

### 安装依赖

```bash
bun install
```

### 配置环境变量

创建`.env.local`文件并添加以下内容:

```bash
# Pinata IPFS配置
PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_url
```

### 启动开发服务器

```bash
bun dev
```

此命令会启动一个本地开发服务器，通常在`http://localhost:3000`。

## 项目结构

```
@fun-pump/web/
├── app/                # Next.js 应用目录
│   ├── page.tsx        # 主页
│   ├── layout.tsx      # 布局组件
│   └── client.tsx      # 客户端组件
├── components/         # 共享组件
│   ├── ui/             # 基础UI组件
│   ├── token-card.tsx  # 代币卡片组件
│   └── ...             # 其他组件
├── hooks/              # 自定义React Hooks
│   ├── use-contract.ts # 合约交互hooks
│   ├── use-tokens.ts   # 代币数据hooks
│   └── ...             # 其他hooks
├── stores/             # Jotai状态管理
│   ├── tokens.atom.ts  # 代币相关状态
│   └── filter.atom.ts  # 筛选相关状态
├── lib/                # 工具函数和配置
│   ├── wagmi.ts        # Wagmi客户端配置
│   └── pinata.ts       # IPFS存储工具
└── providers/          # React Context提供者
    ├── index.tsx       # 提供者组合
    └── ...             # 各种提供者
```

## 可用脚本

```bash
# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 启动生产服务器
bun start

# 运行类型检查
bun typecheck

# 代码风格检查
bun lint
```

## 与智能合约集成

此前端应用使用 `@fun-pump/smart-contract` 包与区块链交互。查看该包的README以获取更多详细信息。

## 如何贡献

1. Fork这个仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request
