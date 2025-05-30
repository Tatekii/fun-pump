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
- [Pinata](https://www.pinata.cloud/) (IPFS Storage)
- [TanStack Query](https://tanstack.com/query/latest) (Data Fetching & Caching)
- [Shadcn/ui](https://ui.shadcn.com/) (UI Components)
- [Tailwind CSS](https://tailwindcss.com/) (Styling)
- [React Hook Form](https://react-hook-form.com/) (Form Handling)
- [Zod](https://zod.dev/) (Schema Validation)

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

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Pinata IPFS
PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_GATEWAY_URL=your_pinata_secret_key

# Add other environment variables as needed
```

Note: Never commit your `.env.local` file to version control.

## Testing

Run the test suite:
```bash
bunx hardhat test --tsconfig ./tsconfig.hardhat.json
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