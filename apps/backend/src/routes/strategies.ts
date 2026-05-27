import { Router, Request, Response } from 'express';
import { STRATEGY_CONFIG } from '../lib/constants';
import { SupabaseService } from '../services/SupabaseService';

const router = Router();
const supabase = new SupabaseService();

// GET /api/strategies - Get all strategies APY and parameters
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.entries(STRATEGY_CONFIG).map(([key, value]) => ({
      id: key,
      ...value,
    })),
  });
});

// POST /api/strategies/user - Update user strategy preference
router.post('/user', async (req: Request, res: Response) => {
  const { userAddress, strategy } = req.body;

  if (!userAddress || !strategy) {
    return res.status(400).json({ success: false, error: 'userAddress and strategy are required' });
  }

  if (!['Conservative', 'Balanced', 'Aggressive'].includes(strategy)) {
    return res.status(400).json({ success: false, error: 'Invalid strategy type' });
  }

  try {
    await supabase.upsertUserStrategy({
      userAddress,
      strategy,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `User strategy updated to ${strategy}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update strategy preference' });
  }
});

// GET /api/strategies/user/:address - Get strategy for address
router.get('/user/:address', async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    const data = await supabase.getUserStrategy(address);
    res.json({
      success: true,
      data: data || { user_address: address, strategy: 'Balanced' },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user strategy' });
  }
});

export default router;
