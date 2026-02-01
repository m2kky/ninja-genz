🔗 Ninja Gen Z - MCP Server for Agent-to-Agent Real-Time Communication
Overview
هذا المستند يوضح تصميم وتطبيق Model Context Protocol (MCP) Server لتمكين التواصل اللحظي (Real-time) بين الـ Agents (Antigravity و Trae) في مشروع Ninja Gen Z [web:22][web:28].

🎯 Project Goals
Problem Statement
حالياً الـ Agents تتواصل عبر ملفات ثابتة في .ai-agents/shared/:

❌ بطء في التحديثات (يحتاج reload يدوي)

❌ عدم وجود notifications فورية

❌ صعوبة تتبع حالة الـ Agent في الوقت الفعلي

❌ عدم القدرة على streaming للتقدم (progress updates)

Solution: MCP Server
بناء MCP Server مركزي يوفر:

✅ Real-time notifications: إشعارات فورية عند تغيير الحالة

✅ Bidirectional streaming: تدفق البيانات في الاتجاهين

✅ Progress tracking: متابعة تقدم المهام لحظياً

✅ State synchronization: مزامنة حالة الـ Agents تلقائياً [web:24][web:28]

🏗️ Architecture Design
System Overview
text
┌─────────────────┐         MCP Protocol (JSON-RPC 2.0)         ┌─────────────────┐
│   Antigravity   │◄──────────────────────────────────────────►│      Trae       │
│ (Frontend Agent)│                                             │ (Backend Agent) │
└────────┬────────┘                                             └────────┬────────┘
         │                                                               │
         │                        WebSocket/SSE                          │
         │                                                               │
         ▼                                                               ▼
    ┌────────────────────────────────────────────────────────────────────┐
    │                       MCP Central Server                           │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
    │  │  Connection  │  │   Message    │  │ Notification │            │
    │  │   Manager    │  │    Router    │  │   Service    │            │
    │  └──────────────┘  └──────────────┘  └──────────────┘            │
    │                                                                    │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
    │  │ Agent State  │  │   Handoff    │  │   Progress   │            │
    │  │    Store     │  │    Queue     │  │   Tracker    │            │
    │  └──────────────┘  └──────────────┘  └──────────────┘            │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  PostgreSQL Database  │
                        │  (State Persistence)  │
                        └───────────────────────┘
Communication Flow
Agent Registration: كل Agent يتصل بالـ MCP Server عند البدء

Handshake: Server يرسل capabilities والـ Agent يؤكد

Real-time Channel: اتصال WebSocket دائم للإشعارات

Request/Response: JSON-RPC 2.0 للطلبات المتزامنة

Notifications: Server يبث التحديثات لجميع الـ Agents المهتمة [web:22]

🛠️ Technical Implementation
Tech Stack
Component	Technology	Justification
Server Runtime	Node.js 20+	MCP SDK رسمي متاح [web:27]
MCP SDK	@modelcontextprotocol/sdk	Official implementation
Transport	HTTP + SSE	Real-time server-to-client [web:22][web:27]
Protocol	JSON-RPC 2.0	MCP standard
State Store	Supabase Realtime	يتكامل مع stack الحالي
WebSocket	Socket.io	Fallback للـ real-time
Server Structure
text
mcp-server/
├── src/
│   ├── server.ts              # Main MCP server instance
│   ├── transports/
│   │   ├── http-sse.ts        # HTTP + SSE transport
│   │   └── stdio.ts           # Stdio transport (local testing)
│   ├── handlers/
│   │   ├── handoff.ts         # Handoff request handlers
│   │   ├── status.ts          # Agent status handlers
│   │   └── progress.ts        # Progress notification handlers
│   ├── services/
│   │   ├── connection.ts      # Agent connection management
│   │   ├── notification.ts    # Real-time notification service
│   │   └── state.ts           # State synchronization
│   ├── models/
│   │   ├── agent.ts           # Agent type definitions
│   │   ├── handoff.ts         # Handoff data models
│   │   └── message.ts         # Message schemas
│   └── utils/
│       ├── logger.ts          # Structured logging
│       └── validation.ts      # Request validation
├── tests/
│   ├── integration/
│   └── unit/
├── config/
│   ├── development.json
│   └── production.json
├── package.json
└── tsconfig.json
📡 MCP Server Implementation
1. Server Initialization
typescript
// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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

// Agent registry (who's connected)
const connectedAgents = new Map<string, AgentConnection>();

interface AgentConnection {
  id: string;
  name: "antigravity" | "trae";
  transport: SSEServerTransport;
  status: "idle" | "working" | "blocked";
  currentTask?: string;
  connectedAt: Date;
}
2. Real-time Notifications [web:22][web:28]
typescript
// src/services/notification.ts
import { types } from "@modelcontextprotocol/sdk";

class NotificationService {
  // إرسال تحديث حالة Agent
  async broadcastAgentStatus(
    agentName: string, 
    status: AgentStatus
  ): Promise<void> {
    const notification: types.ServerNotification = {
      method: "notifications/agent/statusChanged",
      params: {
        agent: agentName,
        status: status.state,
        currentTask: status.currentTask,
        timestamp: new Date().toISOString()
      }
    };

    // إرسال لجميع الـ Agents المتصلة
    for (const [id, connection] of connectedAgents.entries()) {
      if (connection.name !== agentName) { // لا نرسل للـ Agent نفسه
        await connection.transport.send(notification);
      }
    }

    // حفظ في Supabase للـ persistence
    await supabase.from('agent_status_log').insert({
      agent_name: agentName,
      status: status.state,
      task: status.currentTask,
      timestamp: new Date()
    });
  }

  // إرسال progress update [web:28]
  async streamProgress(
    taskId: string,
    progress: number,
    total: number,
    message: string
  ): Promise<void> {
    const notification: types.ProgressNotification = {
      method: "notifications/progress",
      params: {
        progressToken: taskId,
        progress,
        total,
        message,
        related_request_id: taskId
      }
    };

    // Broadcast لكل الـ Agents
    for (const connection of connectedAgents.values()) {
      await connection.transport.send(notification);
    }
  }
}
3. Handoff Management
typescript
// src/handlers/handoff.ts
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "create_handoff") {
    const handoff = {
      id: `HANDOFF-${Date.now()}`,
      from: args.from_agent,
      to: args.to_agent,
      priority: args.priority || "medium",
      title: args.title,
      description: args.description,
      requirements: args.requirements,
      status: "pending",
      created_at: new Date()
    };

    // حفظ في Database
    await supabase.from('handoffs').insert(handoff);

    // إرسال notification فوري للـ Agent المستهدف [web:22]
    const targetAgent = Array.from(connectedAgents.values())
      .find(a => a.name === args.to_agent);

    if (targetAgent) {
      await targetAgent.transport.send({
        method: "notifications/handoff/new",
        params: {
          handoff_id: handoff.id,
          from: args.from_agent,
          title: args.title,
          priority: args.priority,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: true,
            handoff_id: handoff.id,
            status: "delivered"
          })
        }
      ]
    };
  }

  if (name === "update_handoff_status") {
    const { handoff_id, status, notes } = args;

    await supabase
      .from('handoffs')
      .update({ 
        status, 
        updated_at: new Date(),
        completion_notes: notes 
      })
      .eq('id', handoff_id);

    // إشعار الـ Agent الأصلي بالتحديث
    const handoff = await supabase
      .from('handoffs')
      .select('*')
      .eq('id', handoff_id)
      .single();

    const requesterAgent = Array.from(connectedAgents.values())
      .find(a => a.name === handoff.data.from);

    if (requesterAgent) {
      await requesterAgent.transport.send({
        method: "notifications/handoff/updated",
        params: {
          handoff_id,
          status,
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      content: [{ type: "text", text: "Handoff updated successfully" }]
    };
  }
});
4. State Synchronization with Supabase Realtime
typescript
// src/services/state.ts
class StateSync {
  constructor() {
    // Subscribe لتغييرات الـ Agent status في Supabase
    supabase
      .channel('agent-status-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'agent_status' 
        },
        async (payload) => {
          // بث التغيير لكل الـ Agents المتصلة
          const notification = {
            method: "notifications/state/sync",
            params: {
              table: "agent_status",
              change: payload.eventType,
              data: payload.new
            }
          };

          for (const connection of connectedAgents.values()) {
            await connection.transport.send(notification);
          }
        }
      )
      .subscribe();
  }
}
🔌 Agent Client Implementation
Antigravity (Frontend Agent) Client
typescript
// antigravity/mcp-client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

class AntigravityMCPClient {
  private client: Client;
  private serverUrl = "http://localhost:3000/mcp";

  async connect() {
    const transport = new SSEClientTransport(
      new URL(this.serverUrl),
      { headers: { "X-Agent-Name": "antigravity" } }
    );

    this.client = new Client({
      name: "antigravity-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });

    // Handle incoming notifications
    this.client.setNotificationHandler(async (notification) => {
      if (notification.method === "notifications/handoff/new") {
        console.log("🔔 New handoff received:", notification.params);
        // عرض notification في الـ terminal أو log
      }

      if (notification.method === "notifications/agent/statusChanged") {
        console.log("📊 Trae status updated:", notification.params.status);
      }
    });

    await this.client.connect(transport);
    console.log("✅ Antigravity connected to MCP Server");
  }

  // طلب handoff من Trae
  async requestBackendWork(task: HandoffRequest) {
    const result = await this.client.request({
      method: "tools/call",
      params: {
        name: "create_handoff",
        arguments: {
          from_agent: "antigravity",
          to_agent: "trae",
          priority: task.priority,
          title: task.title,
          description: task.description,
          requirements: task.requirements
        }
      }
    });

    return JSON.parse(result.content.text);
  }

  // تحديث الحالة
  async updateStatus(status: "idle" | "working" | "blocked", task?: string) {
    await this.client.request({
      method: "tools/call",
      params: {
        name: "update_agent_status",
        arguments: {
          agent: "antigravity",
          status,
          current_task: task
        }
      }
    });
  }
}

export const mcpClient = new AntigravityMCPClient();
Trae (Backend Agent) Client
typescript
// trae/mcp-client.ts
class TraeMCPClient {
  // مماثل لـ Antigravity لكن مع handlers مختلفة

  async completeHandoff(handoffId: string, deliverables: any) {
    await this.client.request({
      method: "tools/call",
      params: {
        name: "update_handoff_status",
        arguments: {
          handoff_id: handoffId,
          status: "completed",
          notes: JSON.stringify(deliverables)
        }
      }
    });

    console.log("✅ Handoff completed, Antigravity notified automatically");
  }

  // Stream progress للمهام الطويلة [web:28]
  async streamTaskProgress(taskId: string, steps: string[]) {
    for (let i = 0; i < steps.length; i++) {
      await this.client.request({
        method: "notifications/progress",
        params: {
          progressToken: taskId,
          progress: (i + 1) * (100 / steps.length),
          total: 100,
          message: steps[i]
        }
      });

      // محاكاة العمل
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
📊 Database Schema (Supabase)
Tables for MCP Server State
sql
-- Agent status tracking
CREATE TABLE agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL CHECK (agent_name IN ('antigravity', 'trae')),
  status TEXT NOT NULL CHECK (status IN ('idle', 'working', 'blocked')),
  current_task TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(agent_name)
);

-- Handoff requests
CREATE TABLE handoffs (
  id TEXT PRIMARY KEY,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Status change log (audit trail)
CREATE TABLE agent_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  task TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime [web:24]
ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
ALTER PUBLICATION supabase_realtime ADD TABLE handoffs;
🚀 Deployment & Running
Development Mode
bash
# Terminal 1: Start MCP Server
cd mcp-server
npm install
npm run dev

# Terminal 2: Start Antigravity with MCP Client
cd antigravity
node mcp-client.ts

# Terminal 3: Start Trae with MCP Client
cd trae
node mcp-client.ts
Production with Docker Compose
text
# docker-compose.yml
version: '3.8'

services:
  mcp-server:
    build: ./mcp-server
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - NODE_ENV=production
    restart: always

  antigravity:
    build: ./antigravity
    environment:
      - MCP_SERVER_URL=http://mcp-server:3000/mcp
    depends_on:
      - mcp-server

  trae:
    build: ./trae
    environment:
      - MCP_SERVER_URL=http://mcp-server:3000/mcp
    depends_on:
      - mcp-server
📝 Usage Examples
Example 1: Antigravity requests API from Trae
typescript
// في Antigravity
await mcpClient.updateStatus("working", "Building Task List UI");

const handoff = await mcpClient.requestBackendWork({
  priority: "high",
  title: "Create assign-task Edge Function",
  description: "Need serverless function for task assignment",
  requirements: {
    input: { task_id: "uuid", assigned_to: "uuid" },
    output: { success: "boolean", message: "string" },
    security: ["workspace_membership_check"]
  }
});

console.log("Handoff created:", handoff.handoff_id);
// ⏸️ Antigravity can continue other work, will get notified when Trae completes
Example 2: Trae completes work and notifies
typescript
// في Trae (بعد إنشاء الـ Function)
await mcpClient.updateStatus("working", "Creating assign-task function");

// Stream progress [web:28]
await mcpClient.streamTaskProgress("HANDOFF-12345", [
  "Creating function file...",
  "Writing TypeScript code...",
  "Adding RLS validation...",
  "Testing function...",
  "Deploying to Supabase..."
]);

// Complete handoff
await mcpClient.completeHandoff("HANDOFF-12345", {
  function_url: "https://project.supabase.co/functions/v1/assign-task",
  api_docs: "See /docs/api/assign-task.md",
  tests_passed: true
});

// ✅ Antigravity gets instant notification: "Handoff completed!"
await mcpClient.updateStatus("idle");
🔒 Security Considerations
Authentication
كل Agent له API key مخزن في environment variables

MCP Server يتحقق من الـ key في كل request

استخدام HTTPS في production

Authorization
Agent يقدر يطلب handoffs فقط من الـ Agents التانية

مايقدرش يعدل status agent تاني

RLS في Supabase لعزل البيانات

Rate Limiting
typescript
// في MCP Server
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per agent
  keyGenerator: (req) => req.headers['x-agent-name']
});
📈 Monitoring & Observability
Metrics to Track
عدد الـ Agents المتصلة

متوسط وقت استجابة الـ handoffs

عدد الـ notifications المرسلة/الثانية

حالة الاتصال (connection health)

Logging Strategy
typescript
// استخدام structured logging
logger.info("Agent connected", {
  agent_name: "antigravity",
  timestamp: new Date(),
  connection_id: connectionId
});

logger.warn("Handoff taking too long", {
  handoff_id: "HANDOFF-123",
  duration_minutes: 15,
  from: "antigravity",
  to: "trae"
});
🎯 Next Steps
Phase 1: Basic Setup (Week 1)
 فهم MCP Protocol

 إنشاء MCP Server الأساسي

 تطبيق HTTP + SSE transport

 اختبار connection بين الـ Agents

Phase 2: Core Features (Week 2)
 تطبيق Handoff Management

 Real-time notifications

 State synchronization مع Supabase

 Progress streaming

Phase 3: Advanced Features (Week 3)
 Session resumption [web:28]

 Retry logic للـ failed requests

 Dashboard للـ monitoring

 Performance optimization

Phase 4: Production Ready (Week 4)
 Security hardening

 Load testing

 Documentation

 Deployment automation

📚 References & Resources
Model Context Protocol Docs [web:22]

MCP Architecture Guide [web:22]

Agent-to-Agent Communication with MCP [web:28]

Building Real-Time AI Apps with MCP [web:25]

MCP SDK on GitHub

Document Version: 1.0.0
Last Updated: February 1, 2026
Status: 📋 Design Phase - Ready for Implementation

