-- Agent activity logs table
CREATE TABLE agent_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB,
  agent_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User strategies table
CREATE TABLE user_strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT UNIQUE NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'Balanced',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio snapshots table
CREATE TABLE portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_tvl NUMERIC,
  total_yield NUMERIC,
  active_agents INTEGER,
  avg_apy NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies activation
ALTER TABLE agent_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public read for activity feed and reports
CREATE POLICY "Public read activity" ON agent_activity_logs FOR SELECT USING (true);
CREATE POLICY "Public read snapshots" ON portfolio_snapshots FOR SELECT USING (true);
