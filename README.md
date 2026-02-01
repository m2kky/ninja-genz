#  Ninja Gen Z - Marketing Agency SaaS Platform

> **Built by AI Agents** - A productivity and client management platform designed specifically for marketing agencies.

![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![Tech](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20NestJS-blue)

---

##  Project Vision

**Ninja Gen Z** is a specialized SaaS platform for marketing agencies featuring:

-  **Smart Work Systems** (90min work/15min break)
-  **Prayer Reminders** integration
-  **Mockup Previews** for social platforms
-  **Client Management** portals
-  **AI Agents** (Antigravity & Trae)

---

##  Architecture

### **Multi-Agent System**
- **Antigravity**: Frontend Development Agent (React + Vite)
- **Trae**: Backend Development Agent (NestJS + Supabase)
- **MCP Server**: Agent coordination hub

### **Tech Stack**
| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Automation | n8n |
| Integrations | Meta API, Google Ads API |

---

##  Quick Start

### **Prerequisites**
\\\ash
Node.js >= 18.x
Docker Desktop
Git
\\\

### **Installation**

\\\powershell
# Clone
git clone https://github.com/YOUR_USERNAME/ninja-genz.git
cd ninja-genz

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd mcp-server && npm install && cd ..

# Start Supabase
npx supabase start

# Configure environment variables
# Copy .env.example to .env in frontend/ and mcp-server/
\\\

### **Development**

\\\powershell
# Terminal 1: MCP Server
cd mcp-server
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Supabase Studio
start http://127.0.0.1:58323
\\\

---

##  Project Structure

\\\
ninja-genz/
 .agent/              # AI Agent configurations
 .trae/               # Trae agent files
 frontend/            # React + Vite (Antigravity)
    src/
       components/
       services/
       lib/
    .env.example
 mcp-server/          # MCP Coordination Hub
    src/
       server.ts
    .env.example
 backend/             # NestJS (Coming Soon)
 supabase/            # Database migrations
    migrations/
 docs/                # Documentation
    Database-Design-Document.md
    Integration-Specifications.md
    Wireframes/
 README.md
\\\

---

##  Database Schema

### **Core Tables**
- \gent_status\: Agent coordination
- \handoffs\: Task handoff between agents
- \users\: Agency users
- \clients\: Client management
- \	asks\: Task tracking

[Full Schema Documentation](./docs/Database-Design-Document.md)

---

##  Configuration

### **MCP Server (.env)**
\\\env
SUPABASE_URL=http://127.0.0.1:58321
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=3000
\\\

### **Frontend (.env)**
\\\env
VITE_SUPABASE_URL=http://127.0.0.1:58321
VITE_SUPABASE_ANON_KEY=your_anon_key
\\\

---

##  Testing

\\\powershell
# Health Check
curl http://localhost:3000/health

# MCP Status
curl http://localhost:3000/mcp/status
\\\

---

##  Documentation

- [System Design](./docs/PART%203_%20COMPLETE%20SYSTEM%20DESIGN.md)
- [Database Schema](./docs/Database-Design-Document.md)
- [Integration Specs](./docs/Integration-Specifications.md)
- [Wireframes](./docs/Wireframes/)
- [Security & Compliance](./docs/Security-Compliance-Document.md)

---

##  Roadmap

### **Phase 1: Foundation** 
- [x] MCP Server setup
- [x] Database schema design
- [x] Agent coordination system

### **Phase 2: Core Features** 
- [ ] Dashboard UI (Antigravity)
- [ ] Task Management
- [ ] Client Portal
- [ ] Prayer Reminders

### **Phase 3: Integrations** 
- [ ] Meta API integration
- [ ] Google Ads API
- [ ] n8n automation workflows

### **Phase 4: Advanced Features** 
- [ ] Smart Work System
- [ ] Mockup Previews
- [ ] Analytics Dashboard
- [ ] AI Assistant (Sanad)

---

##  Team

- **CTO/Architect**: Project Lead
- **Antigravity**: Frontend Development Agent
- **Trae**: Backend Development Agent

---

##  License

[MIT License](./LICENSE)

---

##  Contributing

This is an AI-agent-driven development project. For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

**Built with  by AI Agents for Marketing Agencies**
