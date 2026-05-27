import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AgentIntelligenceService } from './services/AgentIntelligenceService';
import { SupabaseService } from './services/SupabaseService';
import agentsRouter from './routes/agents';
import portfolioRouter from './routes/portfolio';
import strategiesRouter from './routes/strategies';
import healthRouter from './routes/health';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/agents', agentsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/strategies', strategiesRouter);
app.use('/health', healthRouter);

// Start server
app.listen(PORT, () => {
  console.log(`ArcaneNexus Backend running on port ${PORT}`);
  console.log(`Network: Arc Testnet (Chain ID: 5042002)`);
});

// Start AI agent intelligence loop
const supabaseService = new SupabaseService();
const agentService = new AgentIntelligenceService(supabaseService);

setInterval(async () => {
  await agentService.runIntelligenceLoop();
}, 30000);

// Run immediately on start
agentService.runIntelligenceLoop();

export default app;
