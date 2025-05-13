# Fun Pump

A decentralized crowdfunding platform using smart contracts and modern web technologies.

## Technology Stack & Tools

- Solidity (Writing Smart Contracts & Tests)
- TypeScript (Development & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Hardhat Ignition](https://hardhat.org/ignition/docs/getting-started) (Deployment Management)
- [Bun](https://bun.sh/) (Runtime & Package Manager)
- [Next.js](https://nextjs.org/) (Frontend Framework)
- [Wagmi](https://wagmi.sh/) (React Hooks for Ethereum)

## Requirements For Initial Setup

- Install [Bun](https://bun.sh/): `curl -fsSL https://bun.sh/install | bash`

## Project Structure

```
├── app/                    # Next.js frontend application
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── generated.ts       # Auto-generated contract types
├── contracts/             # Solidity smart contracts
│   ├── Factory.sol        # Main factory contract
│   ├── Token.sol          # Token contract
│   ├── libraries/         # Contract libraries
│   └── interfaces/        # Contract interfaces
├── ignition/              # Hardhat Ignition deployment
│   └── modules/           # Deployment modules
└── test/                  # Contract tests
```

## Setting Up

### 1. Clone/Download the Repository
```bash
git clone <repository-url>
cd fun-pump
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Compile Contracts
```bash
bun hardhat compile
```

### 4. Start Local Node
```bash
bun hardhat node
```

### 5. Deploy Contracts
In a separate terminal, run:
```bash
# For local development
bun hardhat ignition deploy ignition/modules/deploy.js --network localhost

# For deployment with reset
bun hardhat ignition deploy ignition/modules/deploy.js --network localhost --reset
```

### 6. Generate Contract Types
After deployment, generate the TypeScript bindings:
```bash
bun wagmi generate
```

### 7. Start Frontend
```bash
bun dev
```

## Testing

Run the test suite:
```bash
bun hardhat test
```

## Contract Deployment Addresses

The project uses Hardhat Ignition for deployment management. Deployment artifacts are stored in:
- Local network (Hardhat): `ignition/deployments/chain-31337/`
- Sepolia testnet: `ignition/deployments/chain-11155111/`

## Available Scripts

- `bun dev` - Start the Next.js development server
- `bun build` - Build the frontend for production
- `bun start` - Start the production server
- `bun test` - Run contract tests
- `bun compile` - Compile smart contracts
- `bun deploy` - Deploy contracts using Ignition