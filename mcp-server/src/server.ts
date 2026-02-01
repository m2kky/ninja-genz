import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import type { AgentConnection } from './types/agent.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mcpServer = new Server({
  name: "ninja-genz-agent-hub",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
    logging: {}
  }
});

const connectedAgents = new Map<string, AgentConnection>();

console.log('🚀 Initializing MCP Server for Ninja Gen Z...');

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'ninja-genz-mcp-hub',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    connectedAgents: Array.from(connectedAgents.keys()),
    totalConnections: connectedAgents.size
  });
});

app.get('/mcp/sse', async (req, res) => {
  const agentName = req.headers['x-agent-name'] as string;

  if (!agentName || !['antigravity', 'trae'].includes(agentName)) {
    res.status(400).json({ error: 'Invalid or missing X-Agent-Name header' });
    return;
  }

  console.log(`📡 Agent "${agentName}" attempting to connect...`);

  try {
    const transport = new SSEServerTransport('/mcp/messages', res);

    connectedAgents.set(agentName, {
      id: `${agentName}-${Date.now()}`,
      name: agentName as 'antigravity' | 'trae',
      transport,
      status: 'idle',
      connectedAt: new Date()
    });

    await supabase
      .from('agent_status')
      .upsert({
        agent_name: agentName,
        status: 'idle',
        last_seen: new Date().toISOString()
      }, { onConflict: 'agent_name' });

    await mcpServer.connect(transport);

    console.log(`✅ Agent "${agentName}" connected successfully`);
    console.log(`📊 Total connected agents: ${connectedAgents.size}`);

    res.on('close', () => {
      connectedAgents.delete(agentName);
      console.log(`👋 Agent "${agentName}" disconnected`);
      console.log(`📊 Remaining agents: ${connectedAgents.size}`);
    });

  } catch (error) {
    console.error(`❌ Connection error for agent "${agentName}":`, error);
    res.status(500).json({ error: 'Failed to establish SSE connection' });
  }
});

app.post('/mcp/messages', async (req, res) => {
  console.log('📨 Message received:', req.body);
  res.json({ status: 'received', timestamp: new Date().toISOString() });
});

app.get('/mcp/status', async (req, res) => {
  try {
    console.log('🔍 Fetching agents from database...');
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    
    const { data, error } = await supabase
      .from('agent_status')
      .select('*');
    
    console.log('📊 Query result:', data);
    console.log('❌ Query error:', error);
    
    if (error) throw error;
    
    res.json({ agents: data || [], connected: Array.from(connectedAgents.keys()) });
  } catch (err) {
    console.error('💥 Error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NINJA GEN Z - MCP SERVER OPERATIONAL');
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 SSE Endpoint: http://localhost:${PORT}/mcp/sse`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/mcp/status`);
  console.log('='.repeat(60) + '\n');
  console.log('⏳ Waiting for agents to connect...\n');
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down MCP Server...');

  for (const [agentName] of connectedAgents) {
    try {
      await supabase
        .from('agent_status')
        .update({ status: 'idle', last_seen: new Date().toISOString() })
        .eq('agent_name', agentName);
    } catch (e) {
      console.error(`Failed to update status for ${agentName} during shutdown`);
    }
  }

  console.log('✅ Cleanup completed');
  process.exit(0);
});
