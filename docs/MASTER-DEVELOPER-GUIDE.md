#  Ninja Gen Z - Master Developer Guide

> **Version 1.0** | **Last Updated:** 2026-02-01
> **Status:** Active Development (Phase 2)

This master guide serves as the central source of truth for all developers (Human & AI Agents) working on the Ninja Gen Z platform.

---

##  Architecture Overview

The system follows a modern **Agentic SaaS Architecture**:

*   **Frontend**: React 18, Vite, Tailwind CSS (Antigravity Agent)
*   **Backend**: Supabase (PostgreSQL, Auth, Realtime) + NestJS (Trae Agent)
*   **Coordination**: Node.js MCP Server (Hub for Agent Handoffs)
*   **AI**: OpenAI (GPT-4), Custom Agents

###  Quick Links
*   [Frontend Architecture](./Frontend-Architecture.md) - Component structure, state management, UI patterns.
*   [Backend Architecture](./Backend-Architecture.md) - Supabase schema, Edge Functions, NestJS services.
*   [Database Design](./Database-Design.md) - Tables, RLS policies, relationships.
*   [API Specifications](./API-Specifications.md) - REST endpoints, MCP tools, Webhooks.
*   [UI/UX Design System](./Technical-Documentation/UI-UX-Design-System.md) - Colors, typography, components.

---

##  Tech Stack & Standards

### **Frontend**
*   **Framework**: React 18 + Vite
*   **Language**: TypeScript 5.x (Strict Mode)
*   **Styling**: Tailwind CSS 3.4
*   **State**: React Query (Server state), Zustand (Client state)
*   **Routing**: React Router v6 (Data API)
*   **Forms**: React Hook Form + Zod

### **Backend**
*   **Database**: PostgreSQL 15 (Supabase)
*   **API**: REST + Realtime Subscriptions
*   **Auth**: Supabase Auth (JWT)
*   **Server**: Express.js (MCP), NestJS (Core Logic)

---

##  Agent Collaboration Workflow

1.  **Task Assignment**: User Assigns task in \TODO.md\ or Chat.
2.  **Agent Pickup**: Agent checks \gent_status\ table.
3.  **Implementation**:
    *   **Antigravity**: Works in \/frontend\, uses \mcp-client\ for status updates.
    *   **Trae**: Works in \/mcp-server\ & \/backend\, manages DB migrations.
4.  **Handoff**: Agents use \handoffs\ table to transfer context.
    *   *Example*: Antigravity finishes UI -> Handoffs to Trae for API -> Trae confirms -> Antigravity integrates.

---

##  Directory Structure

\\\plaintext
ninja-genz/
 .ai-agents/          # Agent Memory & Context
    antigravity/     # Frontend Context
    trae/            # Backend Context
    shared/          # Shared Protocols (TODO, Handoffs)
 docs/                # Project Documentation
 frontend/            # React Application
 mcp-server/          # Agent Coordination Hub
 supabase/            # Database Migrations & Config
 backend/             # Future NestJS Application
\\\

---

##  Getting Started

1.  **Read the [README.md](../README.md)** for setup instructions.
2.  **Review the [UI/UX Design System](./Technical-Documentation/UI-UX-Design-System.md)** before writing any frontend code.
3.  **Check [Database Design](./Database-Design.md)** before creating new tables.

---

##  Change Management

*   **Migrations**: Always use \supabase migration new\ for DB changes.
*   **Commits**: Use Conventional Commits (e.g., \eat(auth): add login\).
*   **Docs**: Update this guide if architecture changes.
