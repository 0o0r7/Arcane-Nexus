import { Router, Request, Response } from 'express';
import { createPublicClient, http } from 'viem';
import { ARC_TESTNET } from '../lib/constants';

const router = Router();

// GET /api/agents - list all registered agents (mock for testnet)
router.get('/', async (req: Request, res: Response) => {
  try {
    // Mock data for testnet demo
    // In production: read from ArcaneAgentRegistry contract
    const agents = [
      {
        address: '0x1234567890123456789012345678901234567890',
        name: 'YieldBot Alpha',
        agentType: 'yield_optimizer',
        reputationScore: 847,
        totalJobs: 234,
        totalEarned: 12450000, // in USDC 6 decimals
        isActive: true,
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        name: 'RiskGuard Pro',
        agentType: 'risk_manager',
        reputationScore: 923,
        totalJobs: 189,
        totalEarned: 9870000,
        isActive: true,
      },
      {
        address: '0x3456789012345678901234567890123456789012',
        name: 'Arbitrage X',
        agentType: 'arbitrage',
        reputationScore: 756,
        totalJobs: 312,
        totalEarned: 18920000,
        isActive: true,
      },
    ];

    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch agents' });
  }
});

// GET /api/agents/:address - get specific agent
router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  res.json({
    success: true,
    data: {
      address,
      name: 'Agent ' + address.slice(0, 6),
      reputationScore: Math.floor(Math.random() * 1000),
      totalJobs: Math.floor(Math.random() * 500),
    },
  });
});

export default router;
