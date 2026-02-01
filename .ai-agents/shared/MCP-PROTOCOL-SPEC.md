# 🔌 MCP Protocol Specification - Agent Communication

> **Version:** 1.0  
> **Author:** Antigravity (Frontend Agent)  
> **For:** Trae (Backend Agent)  
> **Priority:** 🔴 HIGH  
> **Status:** 📋 SPECIFICATION

---

## 📋 Overview

This document specifies the **Full MCP Protocol** implementation needed for seamless agent-to-agent communication in Ninja Gen Z.

### Goal

Enable Antigravity (Frontend) to automatically query backend information from Trae without user intervention.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIRED WORKFLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User: "Build Login Page"                                        │
│                                                                  │
│  Antigravity (me):                                               │
│  ├→ mcp.call("get_api_docs", { module: "auth" })                │
│  ├→ Gets: endpoints, types, hooks                               │
│  ├→ Builds page with correct API integration                    │
│  └→ mcp.call("notify_agent", { message: "Done!" })              │
│                                                                  │
│  No manual coordination needed! 🎉                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### Current State (HTTP Server)

```
mcp-server/
├── src/
│   └── server.ts        # Express HTTP server
├── dist/
│   └── server.js        # Compiled
└── package.json
```

### Target State (MCP Protocol Server)

```
mcp-server/
├── src/
│   ├── index.ts                 # Main MCP Server entry
│   ├── server.ts                # Keep HTTP for health checks
│   ├── tools/
│   │   ├── index.ts             # Tool registry
│   │   ├── agent-status.ts      # Agent status tools
│   │   ├── api-docs.ts          # API documentation tools
│   │   ├── db-schema.ts         # Database schema tools
│   │   ├── handoffs.ts          # Handoff management tools
│   │   └── notifications.ts     # Agent notifications
│   ├── resources/
│   │   ├── index.ts             # Resource registry
│   │   └── api-spec.ts          # OpenAPI spec resource
│   └── types/
│       └── index.ts             # Shared types
├── data/
│   └── api-docs/                # API documentation files
│       ├── auth.json
│       ├── tasks.json
│       └── ...
├── dist/
└── package.json
```

---

## 🔧 Required Tools

### 1️⃣ `get_agent_status`

**Purpose:** Get current status of all agents

```typescript
// Tool Definition
{
  name: "get_agent_status",
  description: "Get current status and task of all agents (antigravity, trae)",
  inputSchema: {
    type: "object",
    properties: {
      agent_name: {
        type: "string",
        enum: ["antigravity", "trae", "all"],
        description: "Agent name or 'all' for all agents"
      }
    }
  }
}

// Response
{
  agents: [
    {
      name: "antigravity",
      status: "working" | "idle" | "blocked",
      current_task: "Building Login Page",
      last_seen: "2026-02-01T15:00:00Z"
    },
    {
      name: "trae",
      status: "idle",
      current_task: null,
      last_seen: "2026-02-01T14:55:00Z"
    }
  ]
}
```

---

### 2️⃣ `get_api_docs`

**Purpose:** Get API endpoint documentation for a specific module

```typescript
// Tool Definition
{
  name: "get_api_docs",
  description: "Get API endpoint documentation for a specific backend module",
  inputSchema: {
    type: "object",
    properties: {
      module: {
        type: "string",
        enum: ["auth", "users", "tasks", "projects", "clients", "workspaces", "comments", "notifications", "all"],
        description: "Backend module name"
      }
    },
    required: ["module"]
  }
}

// Response Example (module: "auth")
{
  module: "auth",
  base_path: "/api/auth",
  endpoints: [
    {
      method: "POST",
      path: "/login",
      description: "Login with email and password",
      request_body: {
        email: "string",
        password: "string"
      },
      response: {
        access_token: "string",
        refresh_token: "string",
        user: "User"
      },
      errors: [
        { code: 401, message: "Invalid credentials" },
        { code: 400, message: "Validation error" }
      ]
    },
    {
      method: "POST",
      path: "/register",
      description: "Register new user",
      request_body: {
        email: "string",
        password: "string",
        full_name: "string"
      },
      response: {
        user: "User",
        message: "string"
      }
    },
    {
      method: "POST",
      path: "/logout",
      description: "Logout and invalidate tokens",
      headers: { "Authorization": "Bearer <token>" },
      response: { success: true }
    },
    {
      method: "POST",
      path: "/refresh",
      description: "Refresh access token",
      request_body: { refresh_token: "string" },
      response: { access_token: "string" }
    }
  ],
  types: {
    User: {
      id: "string (UUID)",
      email: "string",
      full_name: "string",
      avatar_url: "string | null",
      role: "owner | admin | member | viewer",
      created_at: "string (ISO 8601)"
    }
  },
  hooks: [
    {
      name: "useAuth",
      description: "Authentication hook with login/logout/register",
      file: "src/hooks/useAuth.ts",
      methods: ["login", "logout", "register", "refreshToken"]
    }
  ]
}
```

---

### 3️⃣ `get_db_schema`

**Purpose:** Get database schema for a table or all tables

```typescript
// Tool Definition
{
  name: "get_db_schema",
  description: "Get database schema (tables, columns, relationships)",
  inputSchema: {
    type: "object",
    properties: {
      table: {
        type: "string",
        description: "Table name or 'all' for all tables"
      }
    }
  }
}

// Response Example
{
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "uuid", primary: true },
        { name: "email", type: "varchar(255)", unique: true },
        { name: "password_hash", type: "text" },
        { name: "full_name", type: "varchar(255)" },
        { name: "avatar_url", type: "text", nullable: true },
        { name: "role", type: "enum", values: ["owner", "admin", "member", "viewer"] },
        { name: "created_at", type: "timestamp", default: "now()" },
        { name: "updated_at", type: "timestamp" }
      ],
      relationships: [
        { type: "hasMany", table: "tasks", foreign_key: "assignee_id" },
        { type: "hasMany", table: "comments", foreign_key: "user_id" }
      ]
    }
  ]
}
```

---

### 4️⃣ `get_available_hooks`

**Purpose:** Get list of available React hooks from backend

```typescript
// Tool Definition
{
  name: "get_available_hooks",
  description: "Get list of React hooks provided by backend integration",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["auth", "data", "realtime", "all"],
        description: "Hook category"
      }
    }
  }
}

// Response
{
  hooks: [
    {
      name: "useAuth",
      category: "auth",
      description: "Authentication state and methods",
      exports: ["user", "isAuthenticated", "login", "logout", "register"],
      example: "const { user, login } = useAuth();"
    },
    {
      name: "useTasks",
      category: "data",
      description: "Tasks CRUD operations",
      exports: ["tasks", "isLoading", "createTask", "updateTask", "deleteTask"],
      example: "const { tasks, createTask } = useTasks(projectId);"
    },
    {
      name: "useRealtime",
      category: "realtime",
      description: "Real-time subscriptions",
      exports: ["subscribe", "unsubscribe", "lastEvent"],
      example: "useRealtime('tasks', (event) => console.log(event));"
    }
  ]
}
```

---

### 5️⃣ `create_handoff`

**Purpose:** Create a handoff/task for another agent

```typescript
// Tool Definition
{
  name: "create_handoff",
  description: "Create a handoff (task/request) for another agent",
  inputSchema: {
    type: "object",
    properties: {
      to_agent: {
        type: "string",
        enum: ["antigravity", "trae"],
        description: "Target agent"
      },
      title: {
        type: "string",
        description: "Handoff title"
      },
      description: {
        type: "string",
        description: "Detailed description"
      },
      priority: {
        type: "string",
        enum: ["high", "medium", "low"],
        default: "medium"
      },
      context: {
        type: "object",
        description: "Additional context (files, data, etc.)"
      }
    },
    required: ["to_agent", "title", "description"]
  }
}

// Response
{
  handoff_id: "HANDOFF-2026-02-01-001",
  status: "pending",
  created_at: "2026-02-01T15:30:00Z",
  message: "Handoff created successfully"
}
```

---

### 6️⃣ `get_handoffs`

**Purpose:** Get pending handoffs for an agent

```typescript
// Tool Definition
{
  name: "get_handoffs",
  description: "Get pending handoffs for an agent",
  inputSchema: {
    type: "object",
    properties: {
      for_agent: {
        type: "string",
        enum: ["antigravity", "trae"],
        description: "Agent to get handoffs for"
      },
      status: {
        type: "string",
        enum: ["pending", "in_progress", "completed", "all"],
        default: "pending"
      }
    },
    required: ["for_agent"]
  }
}

// Response
{
  handoffs: [
    {
      id: "HANDOFF-2026-02-01-001",
      from_agent: "antigravity",
      to_agent: "trae",
      title: "Need Tasks API endpoint",
      description: "Please create CRUD endpoints for tasks",
      priority: "high",
      status: "pending",
      created_at: "2026-02-01T15:30:00Z",
      context: { ... }
    }
  ]
}
```

---

### 7️⃣ `complete_handoff`

**Purpose:** Mark a handoff as completed with response

```typescript
// Tool Definition
{
  name: "complete_handoff",
  description: "Mark a handoff as completed with response",
  inputSchema: {
    type: "object",
    properties: {
      handoff_id: {
        type: "string",
        description: "Handoff ID to complete"
      },
      response: {
        type: "string",
        description: "Completion response/notes"
      },
      artifacts: {
        type: "array",
        items: { type: "string" },
        description: "File paths created/modified"
      }
    },
    required: ["handoff_id", "response"]
  }
}

// Response
{
  success: true,
  handoff_id: "HANDOFF-2026-02-01-001",
  status: "completed",
  completed_at: "2026-02-01T16:00:00Z"
}
```

---

### 8️⃣ `update_agent_status`

**Purpose:** Update current agent's status

```typescript
// Tool Definition
{
  name: "update_agent_status",
  description: "Update the calling agent's status",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["working", "idle", "blocked"]
      },
      current_task: {
        type: "string",
        description: "Current task description"
      }
    },
    required: ["status"]
  }
}

// Response
{
  success: true,
  agent: "antigravity",
  status: "working",
  updated_at: "2026-02-01T15:35:00Z"
}
```

---

## 📚 Required Resources

### 1️⃣ `api-spec`

**Purpose:** Full OpenAPI/Swagger specification

```typescript
// Resource Definition
{
  uri: "api-spec://openapi.json",
  name: "OpenAPI Specification",
  description: "Complete API specification in OpenAPI 3.0 format",
  mimeType: "application/json"
}

// Returns: Full OpenAPI 3.0 JSON spec
```

---

## 🔌 Implementation Guide

### Step 1: Install MCP SDK

```bash
cd mcp-server
npm install @modelcontextprotocol/sdk
```

### Step 2: Create MCP Server Entry Point

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { tools, handleToolCall } from "./tools/index.js";
import { resources, handleResourceRead } from "./resources/index.js";

const server = new Server(
  {
    name: "ninja-genz-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools,
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(name, args);
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: resources,
}));

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  return handleResourceRead(uri);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ninja Gen Z MCP Server running on stdio");
}

main().catch(console.error);
```

### Step 3: Create Tool Handlers

```typescript
// src/tools/index.ts
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getAgentStatus, updateAgentStatus } from "./agent-status.js";
import { getApiDocs } from "./api-docs.js";
import { getDbSchema } from "./db-schema.js";
import { getAvailableHooks } from "./hooks.js";
import { createHandoff, getHandoffs, completeHandoff } from "./handoffs.js";

export const tools: Tool[] = [
  {
    name: "get_agent_status",
    description: "Get current status of agents",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: {
          type: "string",
          enum: ["antigravity", "trae", "all"],
        },
      },
    },
  },
  {
    name: "get_api_docs",
    description: "Get API documentation for a module",
    inputSchema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          enum: ["auth", "users", "tasks", "projects", "clients", "all"],
        },
      },
      required: ["module"],
    },
  },
  // ... more tools
];

export async function handleToolCall(name: string, args: any) {
  switch (name) {
    case "get_agent_status":
      return await getAgentStatus(args);
    case "get_api_docs":
      return await getApiDocs(args);
    case "get_db_schema":
      return await getDbSchema(args);
    case "get_available_hooks":
      return await getAvailableHooks(args);
    case "create_handoff":
      return await createHandoff(args);
    case "get_handoffs":
      return await getHandoffs(args);
    case "complete_handoff":
      return await completeHandoff(args);
    case "update_agent_status":
      return await updateAgentStatus(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Step 4: Update package.json

```json
{
  "name": "ninja-genz-mcp",
  "version": "2.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "ninja-genz-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

---

## ⚙️ Antigravity MCP Config Update

After Trae implements this, update my `mcp_config.json`:

```json
{
  "mcpServers": {
    "ninja-genz-mcp": {
      "command": "node",
      "args": [
        "D:\\Codes_Projects\\ninja-genz\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "NODE_ENV": "development"
      }
    }
  }
}
```

---

## ✅ Acceptance Criteria

1. ✅ MCP Server starts without errors
2. ✅ All 8 tools are registered and callable
3. ✅ `get_api_docs` returns accurate endpoint info
4. ✅ `get_db_schema` returns current Prisma schema
5. ✅ Handoff creation/completion works
6. ✅ Agent status updates persist to database
7. ✅ Resources (OpenAPI spec) are accessible

---

## 📊 Testing

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js

# Or test directly
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

---

## 🎯 Priority Order

1. **HIGH:** `get_api_docs` - Most needed for frontend development
2. **HIGH:** `get_db_schema` - Essential for data modeling
3. **MEDIUM:** `get_agent_status` - Coordination
4. **MEDIUM:** `create_handoff` / `get_handoffs` - Communication
5. **LOW:** `get_available_hooks` - Nice to have

---

**Trae, please implement this specification so we can have full automated communication!** 🚀

---

*Created by: Antigravity (Frontend Agent)*  
*Date: 2026-02-01*  
*Handoff ID: REQ-MCP-001*
