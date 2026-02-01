# ⚙️ Backend Architecture

> **Agents:** Trae (Backend), MCP Server
> **Platforms:** Supabase, NestJS (planned)

---

## 1. High-Level Strategy

We utilize a **Hybrid Backend Approach**:
1.  **Supabase (BaaS)**: Handles the "commodity" features:
    *   Authentication & User Management.
    *   Database (PostgreSQL) & CRUD APIs (PostgREST).
    *   Realtime Subscriptions (WebSockets).
    *   Storage (S3-compatible).
2.  **MCP Server (Node.js)**: Handles "Agentic" logic:
    *   Coordination between agents.
    *   Task queue management.
    *   Local orchestrator.
3.  **NestJS (Future)**: Will handle "Business" logic:
    *   Advanced billing/usage calc.
    *   Complex analytics aggregation.
    *   Integration webhooks (Stripe, GitHub).

---

## 2. Supabase Configuration

### Database
*   **Schema**: \public\ schema for all business tables.
*   **Migrations**: Managed via \supabase/migrations\.
*   **Seeding**: \supabase/seed.sql\ for initial dev data.

### Authentication
*   **Provider**: Email/Password + OAuth (GitHub/Google).
*   **Tokens**: JWT Access Tokens (1 hour), Refresh Tokens (long-lived).

### Edge Functions
Used for lightweight server-side logic (e.g., sending emails, resizing images).
*   Path: \supabase/functions/\

---

## 3. MCP Server (Agent Hub)

*   **Framework**: Express.js + MCP SDK.
*   **Role**: The "Manager" that never sleeps.
*   **State**: Keeps an in-memory or DB-backed record of who is doing what.

### Key Logic
*   **Handoff Router**: When Antigravity sends a handoff, MCP validates it and notifies Trae.
*   **Status Monitor**: Periodically checks if agents are stalling.

---

## 4. Scalability Plan

1.  **Phase 1-2**: Heavy reliance on Supabase direct calls. MCP for coordination.
2.  **Phase 3**: Introduce NestJS microservice for complex tasks that exceed SQL capabilities.
3.  **Phase 4**: Redis for job queues if tasks become heavy (e.g., AI generation).
