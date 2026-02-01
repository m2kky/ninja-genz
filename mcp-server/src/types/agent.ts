import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

export interface AgentConnection {
  id: string;
  name: 'antigravity' | 'trae';
  transport: SSEServerTransport;
  status: 'idle' | 'working' | 'blocked';
  currentTask?: string;
  connectedAt: Date;
}

export interface HandoffRequest {
  id: string;
  from_agent: string;
  to_agent: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  requirements?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AgentStatus {
  agent_name: string;
  status: 'idle' | 'working' | 'blocked';
  current_task?: string;
  last_seen: string;
}
