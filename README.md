#  Ninja Gen Z - Marketing Agency SaaS Platform

> **AI-Agent-Driven Development** | A complete productivity platform for marketing agencies built by collaborative AI agents.

![Status](https://img.shields.io/badge/Status-Phase%202%20Development-yellow)
![Agents](https://img.shields.io/badge/Agents-Antigravity%20%7C%20Trae-purple)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Supabase%20%7C%20NestJS-blue)

---

##  What is Ninja Gen Z?

A specialized SaaS platform for marketing agencies featuring:
-  **Smart Work Systems** (90min focused work / 15min break cycles)
-  **Prayer Reminders** (Integrated Islamic prayer times)
-  **Mockup Previews** (Real-time social media post previews)
-  **Client Portal** (Transparent client communication)
-  **AI Agents** (Antigravity for Frontend, Trae for Backend)
-  **Ads Monitoring** (Meta & Google Ads integration)

---

##  AI Agent System

### **Active Agents**
| Agent | Role | Status | Workspace |
|-------|------|--------|-----------|
| **Antigravity** | Frontend Dev | Active | \/frontend\ |
| **Trae** | Backend Dev | Active | \/mcp-server\, \/backend\ |
| **MCP Server** | Coordination Hub | Running | Port 3000 |

### **How Agents Collaborate**
\\\

     CTO      (Human Orchestrator)

       
       v

         MCP Server (Port 3000)      
   Agent Status & Task Coordination   

               
       
                       
       v                v
   
 Antigravity          Trae     
  (Frontend)     (Backend)  
 Port: 5173                    
   
                       
       
                v
         
           Supabase   
            Local     
          Port: 58321 
         
\\\

---

##  For AI Agents

### Before You Start
1.  Read \.ai-agents/shared/context.md\ for project overview.
2.  Check your introduction:
    -   **Antigravity**: \.ai-agents/shared/antigravity-introduction.md\
    -   **Trae**: \.ai-agents/shared/trae-introduction.md\
3.  Review current tasks: \.ai-agents/shared/TODO.md\.
4.  Check who's working: \.ai-agents/shared/agent-status.md\.

### Your Workflow
1.  **Check Status**: Query \gent_status\ table or check the markdown file.
2.  **Read Docs**: Review relevant files for your task.
3.  **Follow Rules**:
    -   Antigravity: \.agent/rules/\
    -   Trae: \.trae/rules/\
4.  **Document Work**: Create session notes in your folder.
5.  **Handoff**: Update TODO and create handoff entry.

---

##  Agent Coordination Protocol

### Handoff System
-   \gent_status\ table tracks active agent.
-   \handoffs\ table logs task transfers.
-   Agents must check status before starting work.

### Agent Responsibilities

| Agent | Responsibilities |
|-------|-----------------|
| **Antigravity** | React components, UI/UX, Tailwind, MCP client |
| **Trae** | API endpoints, DB schema, Supabase, MCP server |

### How to Handoff (SQL)
\\\sql
-- Check current agent
SELECT * FROM agent_status ORDER BY updated_at DESC LIMIT 1;

-- Create handoff
INSERT INTO handoffs (from_agent, to_agent, task_description, status) 
VALUES ('antigravity', 'trae', 'Dashboard UI complete - Ready for API integration', 'pending');
\\\

---

##  Syncing MCP Server (Crucial for Agents)

To enable your Agent Tools (Handoffs, Status updates), you must configure your Agent's \mcp_config.json\.

**1. Locate Config File:**
- **Windows:** \%USERPROFILE%\\.gemini\\antigravity\\mcp_config.json\
- **Mac/Linux:** \~/.gemini/antigravity/mcp_config.json\

**2. Add Server Configuration:**
Add the \
inja-genz-mcp\ entry to the \mcpServers\ object:

\\\json
{
  "mcpServers": {
    "ninja-genz-mcp": {
      "command": "node",
      "args": ["ABSOLUTE_PATH_TO_PROJECT/mcp-server/build/index.js"],
      "env": {
        "SUPABASE_URL": "http://127.0.0.1:58321",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
\\\

**3. Restart Agent:**
- Fully restart your IDE or Agent process to load the new tools.

---

##  Quick Start for AI Agents

### ** Prerequisites Check**
\\\powershell
# Verify installations
node --version        # Should be >= 18.x
docker --version      # Docker Desktop required
git --version         # Git required
\\\

---

##  Step-by-Step Setup (Fresh Machine)

### **Step 1: Environment Prep**
1.  **Install VS Code**
2.  **Install Extensions:**
    -   ESLint
    -   Prettier
    -   Tailwind CSS IntelliSense
    -   Supabase (optional)

### **Step 2: Clone Repository**
\\\powershell
git clone https://github.com/m2kky/ninja-genz.git
cd ninja-genz
\\\

### **Step 3: Install Dependencies**
\\\powershell
# Root dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..

# MCP Server dependencies
cd mcp-server
npm install
cd ..
\\\

### **Step 4: Start Supabase (Database)**
\\\powershell
# From project root
npx supabase start
\\\

** IMPORTANT: Get Credentials**
The output will show:
\\\
API URL: http://127.0.0.1:58321
anon key: eyJ...
service_role key: eyJ...
\\\
**Copy these keys - you'll need them in Step 5 & 6!**

### **Step 5: Configure Environment Variables**

#### **5.1 - MCP Server Environment**
\\\powershell
# Create mcp-server/.env
cd mcp-server
# Use the values from Step 3
# SUPABASE_SERVICE_ROLE_KEY is required here!
npm run dev
\\\

#### **5.2 - Frontend Environment**
\\\powershell
# Create frontend/.env
cd frontend
# Use the values from Step 3
# VITE_SUPABASE_ANON_KEY is required here!
npm run dev
\\\

### **Step 6: Verify Database Migrations**
If tables are missing (check Supabase Studio at http://localhost:54323):
\\\powershell
npx supabase db reset
\\\

---

##  Troubleshooting

**Supabase won't start:**
\\\powershell
npx supabase stop
npx supabase start
\\\

**Port conflicts:**
-   MCP Server: Change \PORT\ in \.env\.
-   Frontend: Update \ite.config.ts\ port.

**Agent coordination issues:**
-   Check \gent_status\ table.
-   Verify MCP server is running on port 3000.
-   Review handoff logs.

---

##  Database Schema (Quick Ref)

**Core Tables:**
-   \gent_status\ (id, agent_name, status, last_seen)
-   \handoffs\ (id, from, to, task, status)
-   \gent_status_log\ (history)

---

##  Agent Documentation

### Essential Reading
-   **Context**: \.ai-agents/shared/context.md\
-   **Handoff Protocol**: \.ai-agents/shared/handoff-protocol.md\
-   **Current Tasks**: \.ai-agents/shared/TODO.md\
-   **Changelog**: \.ai-agents/shared/changelog.md\

---

##  Development Workflow URLS

When all services are running:
-   **Frontend**: http://localhost:5173
-   **MCP Server**: http://localhost:3000
-   **Supabase Studio**: http://localhost:54323
-   **Supabase API**: http://localhost:54321

---

##  Contributing & License

**Proprietary Software** - Internal development only.
Issues tracked via GitHub.

---
*Last Updated: 2026-02-01*
