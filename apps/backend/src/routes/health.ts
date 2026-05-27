import { Router, Request, Response } from 'express';
import { ARC_TESTNET } from '../lib/constants';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    network: 'Arc Testnet (Chain ID: 5042002)',
    contracts: {
      usdc: ARC_TESTNET.usdcAddress,
    },
    services: {
      intelligenceLoop: 'active',
      circleSync: 'operational',
    },
  });
});

export default router;
