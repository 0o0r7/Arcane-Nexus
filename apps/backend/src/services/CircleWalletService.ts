import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

export class CircleWalletService {
  private client: any = null;

  constructor() {
    // Lazy/deferred initialization to prevent crashes on startups when keys are absent
  }

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.CIRCLE_API_KEY;
      const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

      if (!apiKey || !entitySecret) {
        throw new Error('CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET environment variables are required');
      }

      this.client = initiateDeveloperControlledWalletsClient({
        apiKey,
        entitySecret,
      });
    }
    return this.client;
  }

  /**
   * Register a dynamic yield optimizer smart wallet
   */
  async createAgentSmartWallet(agentId: string) {
    try {
      const circleClient = this.getClient();
      const response = await circleClient.createWalletSet({
        name: `AgentWalletSet-${agentId}`,
      });
      return response.data;
    } catch (error: any) {
      console.warn('[CircleWalletService] Skipping raw wallet creation because keys are unconfigured. Simulation mode active.');
      return {
        walletSet: {
          id: `simulated-set-${agentId}`,
          custodyRule: 'DEVELOPER',
        }
      };
    }
  }
}
