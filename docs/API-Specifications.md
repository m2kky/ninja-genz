#  API Specifications

> **Version:** 1.0
> **Protocols:** REST (HTTP), SSE (Server-Sent Events)

---

## 1. MCP Server API (Agent Coordination)

Base URL: \http://localhost:3000\

### Endpoints

#### \GET /health\
Server health check.
*   **Response**: \200 OK\
    \\\json
    { "status": "ok", "uptime": 123 }
    \\\

#### \GET /mcp/status\
Get current status of all agents.
*   **Response**: \200 OK\
    \\\json
    {
      "agents": [
        { "name": "antigravity", "status": "idle" },
        { "name": "trae", "status": "working" }
      ]
    }
    \\\

#### \GET /mcp/sse\
Server-Sent Events stream for real-time updates.
*   **Headers**: \Accept: text/event-stream\
*   **Events**:
    *   \gent-status\: When an agent updates its status.
    *   \handoff\: When a task is transferred.

---

## 2. Business API (Supabase REST)

Base URL: \http://127.0.0.1:58321/rest/v1\
Auth: Bearer Token (JWT)

### Conventions
*   **Filtering**: \?column=eq.value\ (Supabase standard)
*   **Selecting**: \?select=id,name\
*   **Ordering**: \?order=created_at.desc\

### Core Resources

#### \GET /tasks\
Fetch tasks for the current user/workspace.
*   **Query Params**: \workspace_id\, \status\
*   **Response**:
    \\\json
    [
      {
        "id": "uuid",
        "title": "Fix login bug",
        "status": "todo"
      }
    ]
    \\\

#### \POST /tasks\
Create a new task.
*   **Body**:
    \\\json
    {
      "title": "New Task",
      "workspace_id": "uuid",
      "assignee_id": "uuid"
    }
    \\\

#### \GET /clients\
List clients.

#### \GET /workspaces\
List workspaces the user is a member of.

---

## 3. Webhooks (Future)

*   \POST /webhooks/stripe\: Payment events.
*   \POST /webhooks/github\: CI/CD triggers.
