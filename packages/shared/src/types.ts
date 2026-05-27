// Shared types used by both frontend and backend

export type StrategyType = 'Conservative' | 'Balanced' | 'Aggressive';

export type JobState =
  | 'Created'
  | 'Assigned'
  | 'Executing'
  | 'Completed'
  | 'Failed'
  | 'Disputed';

export interface AgentProfile {
  address: string;
  name: string;
  agentType: string;
  reputationScore: number;
  totalJobs: number;
  totalEarned: number; // USDC 6 decimals
  isActive: boolean;
}

export interface UserPosition {
  address: string;
  totalDeposited: number;
  currentValue: number;
  totalYield: number;
  apy: number;
  strategy: StrategyType;
  riskScore: number;
}

export interface YieldDataPoint {
  date: string;
  value: number;
  yield: number;
}

export interface AgentActivityLog {
  id: string;
  type: string;
  data: Record<string, unknown>;
  agentAddress?: string;
  timestamp: string;
}

// Arc Network
export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
export const ARC_USDC_DECIMALS = 6;
