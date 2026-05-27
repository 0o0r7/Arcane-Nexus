import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { ARC_TESTNET, STRATEGY_CONFIG, GAS_SETTINGS } from '../lib/constants';
import { SupabaseService } from './SupabaseService';

interface YieldOpportunity {
  protocol: string;
  apy: number;
  tvl: number;
  risk: number;
  strategy: 'Conservative' | 'Balanced' | 'Aggressive';
}

interface RebalanceDecision {
  shouldRebalance: boolean;
  reason: string;
  targetStrategy: string;
  estimatedGain: number;
}

export class AgentIntelligenceService {
  private client;
  private supabase: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.client = createPublicClient({
      transport: http(ARC_TESTNET.rpcUrl),
    });
    this.supabase = supabaseService;
  }

  /**
   * Main intelligence loop - runs every 30 seconds
   * Scans for yield opportunities and triggers rebalancing
   */
  async runIntelligenceLoop(): Promise<void> {
    console.log('[Agent] Running intelligence scan...');

    try {
      const opportunities = await this.scanYieldOpportunities();

      if (!opportunities || opportunities.length === 0) {
        console.warn('[Agent] No yield opportunities found.');
        return;
      }

      const decision = await this.evaluateRebalance(opportunities);

      await this.supabase.logAgentActivity({
        type: 'intelligence_scan',
        data: { opportunities, decision } as any,
        timestamp: new Date().toISOString(),
      });

      if (decision.shouldRebalance) {
        console.log(`[Agent] Rebalance triggered: ${decision.reason}`);
        await this.supabase.logAgentActivity({
          type: 'rebalance_triggered',
          data: decision as any,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[Agent] Intelligence loop error:', error);
    }
  }

  /**
   * Scan for yield opportunities across simulated protocols
   * In production: integrate with real DeFi protocols on Arc
   */
  async scanYieldOpportunities(): Promise<YieldOpportunity[]> {
    // Simulated opportunities for testnet demo
    // In production: query actual DeFi protocol contracts on Arc
    const baseOpportunities: YieldOpportunity[] = [
      {
        protocol: 'ArcLend',
        apy: 0.052 + (Math.random() * 0.01 - 0.005), // slight variation
        tvl: 2400000,
        risk: 15,
        strategy: 'Conservative',
      },
      {
        protocol: 'ArcSwap LP',
        apy: 0.087 + (Math.random() * 0.02 - 0.01),
        tvl: 1800000,
        risk: 45,
        strategy: 'Balanced',
      },
      {
        protocol: 'ArcYield Vault',
        apy: 0.142 + (Math.random() * 0.03 - 0.015),
        tvl: 950000,
        risk: 78,
        strategy: 'Aggressive',
      },
    ];

    return baseOpportunities;
  }

  /**
   * Evaluate whether to rebalance based on opportunities
   */
  async evaluateRebalance(
    opportunities: YieldOpportunity[]
  ): Promise<RebalanceDecision> {
    const bestOpportunity = opportunities.reduce((best, current) =>
      current.apy > best.apy ? current : best
    );

    const shouldRebalance = bestOpportunity.apy > 0.10; // 10% threshold

    return {
      shouldRebalance,
      reason: shouldRebalance
        ? `High yield opportunity detected: ${(bestOpportunity.apy * 100).toFixed(2)}% APY on ${bestOpportunity.protocol}`
        : 'Current allocations are optimal',
      targetStrategy: bestOpportunity.strategy,
      estimatedGain: bestOpportunity.apy * 10000, // on $10k position
    };
  }

  /**
   * Get current Arc Network stats
   */
  async getNetworkStats() {
    try {
      const blockNumber = await this.client.getBlockNumber();
      return {
        blockNumber: Number(blockNumber),
        chainId: ARC_TESTNET.chainId,
        rpcUrl: ARC_TESTNET.rpcUrl,
      };
    } catch {
      return { blockNumber: 0, chainId: ARC_TESTNET.chainId, rpcUrl: ARC_TESTNET.rpcUrl };
    }
  }
}
