export interface PortfolioSimulation {
  address: string;
  totalDeposited: number;
  currentValue: number;
  totalYield: number;
  apy: number;
  strategy: 'Conservative' | 'Balanced' | 'Aggressive';
  riskScore: number;
  change24h: number;
  changePercent: number;
}
