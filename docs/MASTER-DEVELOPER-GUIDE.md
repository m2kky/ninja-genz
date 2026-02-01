# 🥷 Ninja Gen Z - Master Developer Guide

> **Version 2.0** | **Last Updated:** 2026-02-01  
> **Status:** Active Development (Phase 1)  
> **Deployment Target:** Coolify (Self-Hosted)

This master guide serves as the central source of truth for all developers (Human & AI Agents) working on the Ninja Gen Z platform.

---

## 🏗️ Architecture Overview

The system follows a modern **Agentic SaaS Architecture** designed for **self-hosted deployment on Coolify**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)  →  Backend (NestJS)  →  Database (PostgreSQL)│
│        ↓                    ↓                      ↓             │
│  Nginx Container    API Container         Data Containers       │
│                           ↓                      ↓               │
│                       Redis              MinIO (Storage)         │
└─────────────────────────────────────────────────────────────────┘
```

### 🔗 Quick Links

| Document | Description |
|----------|-------------|
| [**TECH-STACK.md**](./TECH-STACK.md) | Complete technology stack details |
| [Frontend Architecture](./Frontend-Architecture.md) | Component structure, state management |
| [Backend Architecture](./Backend-Architecture.md) | NestJS modules, API design |
| [Database Design](./Database-Design.md) | Prisma schema, relationships |
| [UI/UX Design System](./Technical-Documentation/UI-UX-Design-System.md) | Colors, typography, components |

---

## 🛠️ Tech Stack (Production Ready)

### **Frontend (Antigravity Agent)**

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.x |
| Build Tool | Vite (Rolldown) | 7.x |
| Language | TypeScript | 5.9+ |
| Styling | Tailwind CSS | 3.4 |
| Server State | TanStack Query | 5.x |
| Client State | Zustand | 4.x |
| Routing | React Router | 7.x |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| UI Primitives | Radix UI | Latest |
| Drag & Drop | @dnd-kit | 6.x |
| Rich Text | Tiptap | 2.x |

### **Backend (Trae Agent - NestJS)**

| Category | Technology | Version |
|----------|------------|---------|
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.3+ |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 16.x |
| Cache | Redis | 7.x |
| Auth | Passport.js + JWT | 4.x |
| Real-time | Socket.io | 4.x |
| Queue | Bull | 4.x |
| Storage | MinIO | Latest |
| Validation | class-validator | 0.14.x |

### **Infrastructure**

| Category | Technology |
|----------|------------|
| Deployment | Coolify (Self-Hosted) |
| Containers | Docker + Docker Compose |
| Web Server | Nginx (Frontend) |
| File Storage | MinIO (S3-Compatible) |

---

## 🤖 Agent Collaboration Protocol

### Agents

| Agent | Role | Workspace |
|-------|------|-----------|
| **Antigravity** | Frontend Development | `/frontend` |
| **Trae** | Backend Development | `/backend`, `/mcp-server` |

### Workflow

```
1. Task Assignment
   └→ User assigns task in chat or TODO.md

2. Agent Execution
   ├→ Antigravity: React components, pages, hooks
   └→ Trae: NestJS modules, APIs, database

3. Coordination (via MCP Hub)
   ├→ Status updates in agent_status table
   ├→ Handoffs in handoffs table
   └→ Shared docs in /.ai-agents/shared/

4. Integration
   └→ Both agents work from shared types & contracts
```

### Communication Files

| File | Purpose |
|------|---------|
| `/.ai-agents/shared/TODO.md` | Task assignments |
| `/.ai-agents/shared/handoff-protocol.md` | Agent handoffs |
| `/.ai-agents/shared/agent-status.md` | Current status |
| `/.ai-agents/shared/changelog.md` | Change log |

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
