# ArcaneNexus — Autonomic Yield Aggregator on Arc Network

ArcaneNexus is an AI-driven autonomous yield aggregator on the high-speed **Arc Network** blockchain. The project leverages Soulbound AI Agent Identity Registry (inspired by ERC-8004) and Agentic Commerce Vaults (inspired by ERC-8183) to coordinate multi-chain liquidity, optimize gasless compound yields, and automate risk-managed capital allocations.

---

## 📂 Repository Structure

The project is structured as a robust multi-workspace monorepo containing:

* **`/` (Root Next.js Application)**: The premium Web3 frontend constructed using Next.js, Tailwind v4, Framer Motion, and Google Gemini Server API integrations.
* **`/packages/contracts/`**: Solidified Smart Contracts (implemented in Solidity under a Foundry framework):
  * `ArcaneAgentRegistry.sol`: Soulbound NFT identification and reputation scores tracker for registered yielding agents.
  * `ArcaneVault.sol`: Deposit vaults, yield compounding distribution thresholds, and autonomous job tracking.
* **`/apps/backend/`**: Autonomic Node.js server using Express, Viem, Supabase client sync, and Circle developer wallets for secure, deferred fund management.
* **`/packages/shared/`**: Common types and constant mappings shared across modern stack components.
* **`/supabase/`**: Core SQL scripts for tables structure, indexing, and Row Level Security definitions.

---

## 🛠️ Quick Start

### 1. Smart Contracts Deployment (Foundry)

Ensure Foundry is installed on your local computer (`curl -L https://foundry.paradigm.xyz | bash`):

```bash
cd packages/contracts
cp .env.example .env
# Set PRIVATE_KEY and ARC_USDC_ADDRESS in .env file

# Deploy to Arc Testnet
forge script script/Deploy.s.sol --rpc-url https://rpc.testnet.arc.network --broadcast -vvvv
```

To run contract tests:
```bash
forge test -v
```

### 2. Express Backend Sync (NodeJS)

Configure and boot up the autonomic intelligence scan interval:

```bash
cd apps/backend
npm install
cp .env.example .env
# Set contract addresses, Supabase keys, and Circle API keys

npm run dev
```

### 3. Frontend Web Client (NextJS)

Start the premium user terminal:

```bash
npm install
npm run dev
```

---

## 💡 Key Network Parameters

* **Arc Testnet Chain ID**: `5042002` (hex: `0x4CEF52`)
* **RPC Host**: `https://rpc.testnet.arc.network`
* **USDC Address (Arc)**: `0x3600000000000000000000000000000000000000`
* **USDC Decimals**: `6`
* **Gas parameters**: `maxFeePerGas = 160 gwei`, `maxPriorityFeePerGas = 2 gwei`
