import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface AgentActivityLog {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  agentAddress?: string;
}

interface UserStrategyUpdate {
  userAddress: string;
  strategy: string;
  updatedAt: string;
}

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const key = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';
    this.client = createClient(url, key);
  }

  async logAgentActivity(log: AgentActivityLog): Promise<void> {
    try {
      const { error } = await this.client
        .from('agent_activity_logs')
        .insert({
          type: log.type,
          data: log.data,
          timestamp: log.timestamp,
          agent_address: log.agentAddress || null,
        });

      if (error) console.error('[Supabase] Log error:', error);
    } catch (e) {
      console.warn('[Supabase] Sync skipped or failed due to missing configuration', e);
    }
  }

  async getRecentActivity(limit = 20) {
    try {
      const { data, error } = await this.client
        .from('agent_activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch {
      return []; // Return mock / blank array on missing DB keys
    }
  }

  async getUserStrategy(userAddress: string) {
    try {
      const { data, error } = await this.client
        .from('user_strategies')
        .select('*')
        .eq('user_address', userAddress.toLowerCase())
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }

  async upsertUserStrategy(update: UserStrategyUpdate) {
    try {
      const { error } = await this.client
        .from('user_strategies')
        .upsert({
          user_address: update.userAddress.toLowerCase(),
          strategy: update.strategy,
          updated_at: update.updatedAt,
        });

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase] Strategy upsert skipped', e);
    }
  }

  async getPortfolioStats() {
    try {
      const { data, error } = await this.client
        .from('portfolio_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }
}
