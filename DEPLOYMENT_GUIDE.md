# 🚀 ArcaneNexus Deployment Guide

**Status**: Production-Ready for Vercel Deployment

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Setup & Deployment](#vercel-setup--deployment)
4. [Backend Deployment](#backend-deployment)
5. [Wallet Integration](#wallet-integration-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Pre-Deployment Checklist

### Frontend (Next.js)
- ✅ TypeScript build errors enabled (`ignoreBuildErrors: false`)
- ✅ Environment variables configured
- ✅ Gemini model fixed (gemini-1.5-flash)
- ✅ Backend integration implemented
- ✅ ESLint configured
- ✅ Standalone output enabled for Docker/Vercel

### Backend (Express.js)
- ✅ All services implemented (Supabase, Circle, Viem)
- ✅ Routes configured (agents, portfolio, strategies, health)
- ✅ AI agent intelligence loop running
- ✅ Error handling in place
- ✅ CORS configured

### Smart Contracts (Foundry/Solidity)
- ⚠️ **Not yet deployed** - see [Contract Deployment](#smart-contract-deployment)
- Agent Registry contract
- Vault contract

### Database (Supabase)
- ⚠️ **Requires setup** - see [Supabase Setup](#supabase-setup)

---

## Environment Configuration

### 1. Frontend Environment Variables (.env.local)

```bash
# .env.local (Frontend - Next.js)

# Gemini API
GEMINI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# App URLs
APP_URL=https://arcanenexus.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://arcanenexus-backend.vercel.app

# Circle/Wallet
NEXT_PUBLIC_CIRCLE_API_KEY=pk_live_xxxxxxxx
```

### 2. Backend Environment Variables (.env)

```bash
# .env (Backend - Express)

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://arcanenexus.vercel.app

# Arc Network (Testnet)
ARC_RPC_URL=https://rpc.testnet.arc.network
ARC_CHAIN_ID=5042002
ARC_USDC_ADDRESS=0x3600000000000000000000000000000000000000

# Contract Addresses (from deployment)
AGENT_REGISTRY_ADDRESS=0x...
VAULT_ADDRESS=0x...

# Circle Developer Wallets
CIRCLE_API_KEY=sk_live_xxxxxxxx
CIRCLE_ENTITY_SECRET=xxxxxxxxxxxxxxxx

# Supabase
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5...

# Deployment private key
PRIVATE_KEY=0x... (NEVER commit to git)
```

---

## Vercel Setup & Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository: `0o0r7/Arcane-Nexus`
4. Configure project settings:
   - **Framework Preset**: Next.js ✅
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### Step 3: Add Environment Variables in Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

Add all variables from `.env.local`:
```
GEMINI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BACKEND_URL=https://arcanenexus-backend.vercel.app
APP_URL=https://arcanenexus.vercel.app
```

### Step 4: Deploy

```bash
# Vercel will auto-deploy on push to main
# Or manually trigger:
vercel --prod
```

### Expected Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (0/X)
✓ Finalizing page optimization
✓ Collecting build logs
✓ Deployment successful
```

---

## Backend Deployment

### Option A: Deploy to Railway.app (Recommended for Node.js)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project
railway init

# 4. Add environment variables
railway variables:set SUPABASE_URL=xxx
railway variables:set SUPABASE_SERVICE_KEY=xxx
railway variables:set CIRCLE_API_KEY=xxx
railway variables:set CIRCLE_ENTITY_SECRET=xxx

# 5. Deploy
railway up
```

### Option B: Deploy to Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Create app
fly apps create arcanenexus-backend

# 4. Deploy
fly deploy
```

### Option C: Deploy to Heroku

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login
heroku login

# 3. Create app
heroku create arcanenexus-backend

# 4. Set environment variables
heroku config:set SUPABASE_URL=xxx -a arcanenexus-backend

# 5. Deploy
git push heroku main
```

---

## Smart Contract Deployment

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Install dependencies
cd packages/contracts
forge install
```

### Deploy to Arc Testnet

```bash
cd packages/contracts

# 1. Create .env file
cp .env.example .env

# 2. Set deployment key
PRIVATE_KEY=0x... # Your deployer wallet private key

# 3. Run deployment script
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.network \
  --broadcast \
  -vvvv

# 4. Verify deployment
forge verify-contract \
  --chain-id 5042002 \
  --compiler-version 0.8.20 \
  <CONTRACT_ADDRESS> \
  src/ArcaneAgentRegistry.sol:ArcaneAgentRegistry
```

### Save Contract Addresses

After deployment, update `apps/backend/.env`:
```
AGENT_REGISTRY_ADDRESS=0x...
VAULT_ADDRESS=0x...
```

---

## Wallet Integration Setup

### 1. Install Web3 Wallet Connector

The frontend already has placeholder for wallet connection. Implement via wagmi:

```bash
npm install wagmi viem @rainbow-me/rainbowkit
```

### 2. Add Wallet Provider (Create `lib/wagmi.ts`)

```typescript
import { configureChains, createConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const { chains, publicClient } = configureChains(
  [
    {
      id: 5042002,
      name: 'Arc Testnet',
      network: 'arc-testnet',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        public: { http: ['https://rpc.testnet.arc.network'] },
        default: { http: ['https://rpc.testnet.arc.network'] },
      },
    },
  ],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'https://rpc.testnet.arc.network',
      }),
    }),
  ]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
});

export { chains };
```

### 3. Implement Wallet Connect Button

Update `app/page.tsx` wallet connection:

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// In component:
const { address, isConnected } = useAccount();
const { connect, connectors, isLoading } = useConnect();
const { disconnect } = useDisconnect();

// In JSX:
{!isConnected ? (
  <button onClick={() => connect({ connector: connectors[0] })}>
    Connect Wallet
  </button>
) : (
  <div>
    <span>{address}</span>
    <button onClick={() => disconnect()}>Disconnect</button>
  </div>
)}
```

### 4. Configure Circle Wallets

Update backend wallet service:

```typescript
// apps/backend/src/services/WalletService.ts
import { CircleClient } from '@circle-fin/developer-controlled-wallets';

const circle = new CircleClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

// Use for controlled transactions
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save credentials to backend `.env`

### 2. Create Tables

Run SQL migrations in Supabase console:

```sql
-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vaults table
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  strategy TEXT NOT NULL,
  balance DECIMAL(20, 6) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  type TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;
```

### 3. Enable API Access

In Supabase Settings:
- Copy Project URL → `SUPABASE_URL`
- Get Service Role Key → `SUPABASE_SERVICE_KEY`

---

## Post-Deployment Verification

### 1. Check Frontend
```bash
curl https://arcanenexus.vercel.app
# Should return HTML with "ArcaneNexus" in title
```

### 2. Check Backend Health
```bash
curl https://arcanenexus-backend.vercel.app/health
# Should return: { "status": "healthy", "network": "Arc Testnet" }
```

### 3. Test Wallet Connection
- Open app in browser
- Click "Connect Wallet"
- Sign transaction with MetaMask/Wallet
- Verify wallet address displays

### 4. Test Backend Integration
```bash
# Get portfolio history (replace with real wallet)
curl 'https://arcanenexus-backend.vercel.app/api/portfolio/0x.../history'
```

### 5. Check Gemini Integration
- Navigate to Analytics tab
- Verify AI insights load without errors

---

## Monitoring & Troubleshooting

### View Deployment Logs

**Vercel Frontend:**
```bash
vercel logs --prod
```

**Backend (Railway):**
```bash
railway logs
```

### Common Issues

#### Issue: Build fails with TypeScript errors
**Solution**: Ensure `ignoreBuildErrors: false` in `next.config.ts`
```typescript
typescript: {
  ignoreBuildErrors: false,
}
```

#### Issue: Backend can't reach Arc RPC
**Solution**: Verify Arc RPC URL in `.env`:
```
ARC_RPC_URL=https://rpc.testnet.arc.network
```

#### Issue: CORS errors in frontend
**Solution**: Update CORS in backend:
```typescript
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000' 
}));
```

#### Issue: Wallet connection fails
**Solution**: Verify chain configuration:
```typescript
chainId: 5042002, // Arc Testnet
rpcUrl: 'https://rpc.testnet.arc.network'
```

### Performance Optimization

**Frontend:**
- ✅ Next.js output: `standalone` (already set)
- ✅ Image optimization enabled
- ✅ Tailwind CSS minified

**Backend:**
- Enable gzip compression:
```typescript
import compression from 'compression';
app.use(compression());
```

---

## Security Checklist

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Enable CORS restrictions
- ✅ Rate limiting on API endpoints
- ✅ Input validation with Zod (already implemented)
- ✅ TypeScript strict mode enabled
- ✅ Private keys stored in secrets manager

---

## Production Readiness Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Frontend (Next.js) | ✅ Ready | Deploy to Vercel |
| Backend (Express) | ✅ Ready | Deploy to Railway/Fly |
| Smart Contracts | ⚠️ Needs Deployment | Run forge deploy |
| Database (Supabase) | ⚠️ Needs Setup | Create project & tables |
| Wallet Integration | ⚠️ Partial | Implement wagmi connection |
| CI/CD | ✅ Auto | GitHub → Vercel |
| Monitoring | ⚠️ Recommended | Setup error tracking |
| SSL/HTTPS | ✅ Auto | Vercel provides |

---

## Next Steps

1. ✅ **Immediate**: Deploy frontend to Vercel
2. ⚠️ **Next**: Deploy backend & set up Supabase
3. ⚠️ **Then**: Deploy smart contracts to Arc Testnet
4. ⚠️ **Finally**: Test full end-to-end wallet integration

---

**Questions?** Check the GitHub Discussions or create an Issue.
