import { Router, Request, Response } from 'express';
import { SupabaseService } from '../services/SupabaseService';

const router = Router();
const supabase = new SupabaseService();

// GET /api/portfolio/:address
router.get('/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    // Mock portfolio data for testnet
    // In production: read from ArcaneVault contract
    const portfolio = {
      address,
      totalDeposited: 24891440000, // 24,891.44 USDC (6 decimals)
      currentValue: 25340210000,
      totalYield: 448770000,
      apy: 8.7,
      strategy: 'Balanced',
      riskScore: 45,
      change24h: 2.34,
      changePercent: 0.94,
    };

    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio' });
  }
});

// GET /api/portfolio/:address/history - yield history for chart
router.get('/:address/history', async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;

  // Generate mock chart data
  const history = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toISOString().split('T')[0],
      value: 24000 + i * 30 + Math.random() * 100,
      yield: i * 8.5 + Math.random() * 5,
    };
  });

  res.json({ success: true, data: history });
});

export default router;
