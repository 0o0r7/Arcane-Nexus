// Shared constants used by both frontend and backend

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
export const ARC_USDC_DECIMALS = 6;

export const VAULT_STRATEGIES = {
  Conservative: { targetApy: 0.052, riskScore: 15, name: 'Stable Yield' },
  Balanced:     { targetApy: 0.087, riskScore: 45, name: 'Balanced Growth' },
  Aggressive:   { targetApy: 0.142, riskScore: 78, name: 'Aggressive Alpha' },
};
