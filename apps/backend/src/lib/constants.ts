// Arc Network constants - DO NOT CHANGE
export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: '0x4CEF52',
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorerUrl: 'https://testnet.arcscan.app',
  usdcAddress: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  usdcDecimals: 6,
};

export const GAS_SETTINGS = {
  maxFeePerGas: BigInt('160000000000'),      // 160 gwei
  maxPriorityFeePerGas: BigInt('2000000000'), // 2 gwei
};

// Strategy APY targets (for simulation on testnet)
export const STRATEGY_CONFIG = {
  Conservative: { targetApy: 0.052, riskScore: 15, name: 'Stable Yield' },
  Balanced:     { targetApy: 0.087, riskScore: 45, name: 'Balanced Growth' },
  Aggressive:   { targetApy: 0.142, riskScore: 78, name: 'Aggressive Alpha' },
};
