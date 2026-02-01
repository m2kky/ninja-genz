# System Architecture Document (SAD) — Ninja Gen Z Platform

**Version:** 1.1
**Date:** January 24, 2026
**Document Owner:** CTO & Lead Product Manager

---

## 1. System Overview

### 1.1 Purpose & Goals

**Ninja Gen Z** هي منصة SaaS شاملة لإدارة وكالات التسويق في منطقة MENA، مصممة خصيصاً لحل مشاكل:

- فوضى التواصل مع العملاء (استبدال WhatsApp بـ Client Portal احترافي)
- إدارة المشاريع والمهام بشكل هرمي (Agency → Workspace → Client → Project → Task)
- تتبع الأداء والوقت والموافقات
- التكامل مع منصات الإعلانات (Meta Ads, Google Ads)
- دعم الثقافة المحلية (Prayer Reminders, Smart Work System)
- AI Teammate "سَنَد" للمساعدة الذكية

**الهدف الرئيسي:**
توفير **All-in-One Platform** تُمكّن الوكالات من إدارة كل عملياتها (من التخطيط حتى التسليم والتحليلات) من مكان واحد، مع تجربة محلية authentic ومحسّنة للسوق العربي.

---

### 1.2 Key System Characteristics

| Characteristic    | Description                                                                                |
| :---------------- | :----------------------------------------------------------------------------------------- |
| **Multi-tenancy** | كل Agency منعزلة تماماً (data isolation) مع دعم Workspaces متعددة |
| **Real-time**     | Live updates عبر Supabase Realtime (comments, notifications, status changes)            |
| **Scalability**   | يدعم من 5 users (Free) حتى 10,000+ users (Enterprise)                             |
| **Security**      | RLS على كل الجداول + Encryption at rest/transit + SOC 2 (Phase 5)              |
| **Mobile-first**  | Responsive web + Native mobile apps (iOS/Android)                                          |
| **API-driven**    | REST API + Webhooks للتكامل الخارجي (Phase 5)                                |
| **AI-powered**    | سَنَد AI teammate بـ context-aware intelligence                                     |

---

## 2. Physical Architecture

### 2.1 Cloud Infrastructure

**Primary Infrastructure:** **Hostinger KVM VPS** (Ubuntu 24.04) running **Coolify**

```
┌─────────────────────────────────────────────────────────────┐
│                      GLOBAL USERS                           │
│         (MENA: Egypt, Saudi, UAE, + Global)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │   Cloudflare CDN (Global)   │◄─── Static assets
         │   - Edge caching             │     (images, CSS, JS)
         │   - DDoS protection          │
         │   - SSL/TLS termination      │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌───────────────────────────────────────────────┐
         │             Hostinger KVM VPS                 │
         │             (Ubuntu 24.04 LTS)                │
         │                                               │
         │  ┌─────────────────────────────────────────┐  │
         │  │              Coolify PaaS               │  │
         │  │                                         │  │
         │  │ ┌──────────────┐    ┌─────────────────┐ │  │
         │  │ │  Frontend    │    │   Backend API   │ │  │
         │  │ │ (Vite/React) │◄──►│    (NestJS)     │ │  │
         │  │ └──────────────┘    └────────┬────────┘ │  │
         │  │                              │          │  │
         │  │ ┌──────────────┐    ┌────────▼────────┐ │  │
         │  │ │    Redis     │◄──►│   PostgreSQL    │ │  │
         │  │ │ (Cache/Queue)│    │      (DB)       │ │  │
         │  │ └──────────────┘    └─────────────────┘ │  │
         │  │                                         │  │
         │  │ ┌──────────────┐                        │  │
         │  │ │     n8n      │◄───────────────────────┘  │
         │  │ │ (Automation) │                           │
         │  │ └──────────────┘                           │
         │  └─────────────────────────────────────────┘  │
         └───────────────────────────────────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │  External APIs   │
                          │                  │
                          │ • Supabase Auth  │
                          │ • Meta Graph API │
                          │ • Google Ads API │
                          │ • OpenAI API     │
                          │ • AlAdhan API    │
                          └──────────────────┘
```

---

### 2.2 Server Specifications (Hostinger KVM)

| Component | Specification | Role |
| :-------- | :------------ | :--- |
| **VPS** | **KVM 2** (Hostinger) | Main Host |
| **CPU** | 2 vCPU Cores | Compute |
| **RAM** | 8 GB RAM | Memory |
| **Storage** | 100 GB NVMe | Disk |
| **OS** | **Ubuntu 24.04 LTS** | Operating System |
| **Management** | **Coolify** | Docker/App Management |

---

### 2.3 CDN Strategy

**Cloudflare CDN:**

- **Static Assets:** Images, CSS, JS bundles (served via Coolify/Nginx)
- **File Uploads:** Supabase Storage / MinIO (Self-hosted)
- **Caching Rules:**
  - Static assets: 1 year (`Cache-Control: public, max-age=31536000, immutable`)
  - API responses: No cache (dynamic)
  - Brand Kit assets (logos, colors): 1 week (updatable)

**Edge Locations:**

- MENA: Dubai, Cairo, Riyadh (via Cloudflare)
- Global: 200+ locations worldwide

---

## 3. Logical Architecture

### 3.1 System Layers (N-Tier Architecture)

```
┌────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Web App      │  │ Mobile Apps  │  │ Client Portal│    │
│  │ (React/Vite) │  │ (iOS/Android)│  │ (Subdomain)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS/WSS
┌────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 NestJS API Gateway                   │  │
│  │  • Authentication (Guard + Supabase)                 │  │
│  │  • Authorization (RBAC / CASL)                       │  │
│  │  • Rate limiting (Throttler)                         │  │
│  │  • Request validation (Zod/DTOs)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ NestJS      │  │ Database     │  │ n8n Workflows   │   │
│  │ Services    │  │ Functions    │  │                 │   │
│  │             │  │ (SQL/plpgsql)│  │ • Automations   │   │
│  │ • AI Logic  │  │              │  │ • Integrations  │   │
│  │ • Webhooks  │  │ • Triggers   │  │ • Cron jobs     │   │
│  │ • Queues    │  │ • Aggregation│  │ • API polling   │   │
│  │             │  │              │  │                 │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  PostgreSQL      │  │  File Storage    │               │
│  │  (Primary DB)    │  │  (Supabase/S3)   │               │
│  │                  │  │                  │               │
│  │  • Relational    │  │  • S3-compatible │               │
│  │  • JSONB support │  │  • CDN-backed    │               │
│  │  • Full-text     │  │  • Image resize  │               │
│  │  • RLS enabled   │  │                  │               │
│  └──────────────────┘  └──────────────────┘               │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Meta API │  │Google Ads│  │OpenAI   │  │ AlAdhan   │  │
│  │ (Ads)    │  │ API      │  │(AI)     │  │ (Prayer)  │  │
│  └──────────┘  └──────────┘  └─────────┘  └───────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐                 │
│  │ SendGrid │  │ Slack    │  │ Zapier  │                 │
│  │ (Email)  │  │ (Chat)   │  │ (Auto)  │                 │
│  └──────────┘  └──────────┘  └─────────┘                 │
└────────────────────────────────────────────────────────────┘
```

---

### 3.2 Core Components

#### A. Frontend Components

- **Main App** (React + Vite + Tailwind)
  - Dashboard
  - Task Management (List/Board/Timeline/Gallery views)
  - Client Management + Brand Kit
  - Analytics & Reports
  - Settings & Team Management
  - سَنَد AI Chat Widget
- **Client Portal** (Subdomain routing)
  - Client Dashboard
  - Task Review & Approval
  - Project Overview
  - File Preview
- **Mobile Apps** (iOS/Android Native)
  - Task list + detail
  - Time tracking
  - Notifications
  - File upload

#### B. Backend Services

- **NestJS API** (Main Application Logic)
  - Authentication Guard (validates Supabase JWT)
  - Business Logic (Tasks, Projects, Clients)
  - Queue Consumers (BullMQ + Redis)
- **Supabase Auth** (Authentication Provider)
- **PostgreSQL** (Primary Database)
- **Redis** (Caching & Message Queue)
- **n8n** (Automation Engine)

#### C. Automation Layer

- **n8n Workflows**
  - Competitor monitoring (scrape + notify)
  - Prayer times caching (daily fetch)
  - Ads sync (Meta + Google, every 6h)
  - Email campaigns (onboarding, notifications)

---

## 4. Technology Stack (Detailed)

### 4.1 Frontend Stack

```yaml
Core:
  Framework: React 18.x
  Build Tool: Vite 5.x
  Language: TypeScript 5.x
  Styling: Tailwind CSS 3.x

UI Components:
  Component Library: shadcn/ui (Radix UI primitives)
  Icons: Lucide React
  Charts: Recharts / Chart.js
  Calendar: FullCalendar (Timeline/Gantt view)
  Rich Text: TipTap / Lexical (for task descriptions)
  File Upload: React Dropzone
  Toast/Notifications: Sonner

State Management:
  Client State: Zustand (lightweight, simple)
  Server State: TanStack Query (React Query v5)
  Forms: React Hook Form + Zod (validation)

Routing:
  Library: React Router v6
  Structure: Nested routes with lazy loading

Authentication:
  Library: @supabase/auth-helpers-react
  Strategy: JWT tokens (stored in httpOnly cookies)

Real-time:
  Library: Supabase Realtime / Socket.io (via NestJS)
  Use Cases: Comments, notifications, task status updates

Internationalization:
  Library: i18next + react-i18next
  Languages: Arabic (primary), English
  RTL Support: Built into Tailwind (dir="rtl")

Performance:
  Code Splitting: Vite automatic + React.lazy()
  Image Optimization: Auto-resize
  Lazy Loading: Intersection Observer for images/components
  Caching: React Query with stale-while-revalidate

Testing:
  Unit Tests: Vitest + React Testing Library
  E2E Tests: Playwright
  Coverage Target: 80%+ for critical paths
```

---

### 4.2 Backend Stack

```yaml
Framework:
  Core: NestJS (Node.js)
  Language: TypeScript
  Platform: Fastify (for performance)

Database:
  Engine: PostgreSQL 15.x (Self-hosted)
  ORM: Prisma or TypeORM
  Features:
    - Row Level Security (RLS) support
    - JSONB columns
    - Full-text search
    - Extensions: pg_cron, uuid-ossp

Caching & Queues:
  Engine: Redis (Self-hosted)
  Queue: BullMQ (for background jobs)
  Caching: CacheManager (NestJS)

Authentication:
  Provider: Supabase Auth (Managed)
  Validation: Passport-JWT (in NestJS)
  Methods: Email/Password, Google OAuth

Storage:
  Service: Supabase Storage or MinIO (S3 Compatible)
  Buckets: files, brand-kits, avatars

Real-time:
  Protocol: WebSocket (Socket.io Gateway in NestJS) or Supabase Realtime

API:
  Type: REST (Swagger/OpenAPI)
  Validation: Zod / class-validator
  Documentation: Swagger UI (/api/docs)
```

---

### 4.3 DevOps & Infrastructure

```yaml
Version Control:
  Platform: GitHub
  Branching Strategy: Git Flow

CI/CD:
  Platform: GitHub Actions
  Pipelines:
    - Build & Test (on PR)
    - Deploy to Coolify (on merge to main)

Hosting:
  Platform: Hostinger KVM VPS
  Management: Coolify (PaaS)
  OS: Ubuntu 24.04 LTS

Environments:
  Development:
    - Localhost (Docker Compose)
  Staging:
    - https://staging.ninjagenzy.com (Coolify)
  Production:
    - https://app.ninjagenzy.com (Coolify)

Monitoring:
  Logs: Coolify Logs
  Performance: OpenTelemetry / custom metrics
  Uptime: UptimeRobot

Security:
  SSL: Auto-managed by Coolify (Let's Encrypt)
  Firewall: UFW (Ubuntu) + Coolify restrictions
  Backups: Automated Database Backups (Coolify -> S3/R2)
```

---

### 4.4 External Services & APIs

```yaml
AI/ML:
  OpenAI GPT-4o-mini:
    - Use: سَنَد AI assistant (Q&A, task creation, summaries)
    - Quota: Per agency (50 questions/month Basic, unlimited Pro)
    - Context window: 8k tokens
    - Temperature: 0.3 (factual responses)

Advertising Platforms:
  Meta Marketing API (Graph API):
    - Use: Fetch ad campaigns, insights (Phase 4)
    - Auth: OAuth 2.0
    - Permissions: ads_read, read_insights
    - Rate limit: 200 calls/hour (app-level)
  
  Google Ads API:
    - Use: Fetch ad campaigns, performance (Phase 4)
    - Auth: OAuth 2.0
    - Permissions: Read-only
    - Rate limit: 15,000 operations/day

Prayer Times:
  AlAdhan API (https://aladhan.com/prayer-times-api):
    - Use: Fetch daily prayer times by city/coordinates
    - Method: Free public API (no auth)
    - Caching: Daily via n8n → store in prayer_times_cache table
    - Calculation methods: Egyptian, MWL, ISNA, etc.

Email Delivery:
  SendGrid:
    - Use: Transactional emails (notifications, invites, approvals)
    - Volume: 100 emails/day (Free), 40k/month (Starter)
    - Templates: Custom HTML templates per email type
    - Tracking: Opens, clicks, bounces

Communication:
  Slack API (Phase 5):
    - Use: Notifications, slash commands (/workit)
    - Auth: OAuth 2.0
    - Scopes: chat:write, commands, channels:read

File Storage:
  Google Drive API (Phase 5):
    - Use: Attach files from Drive, auto-sync uploads
    - Auth: OAuth 2.0
    - Scopes: drive.file (per-file access)

Automation:
  Zapier (Phase 5):
    - Use: Integrate with 2000+ apps
    - Method: Publish "ninja-gen-z" app in Zapier directory
    - Triggers: task.created, task.completed, etc.
    - Actions: create_task, update_task, etc.

Payment Processing:
  Stripe (or Paddle):
    - Use: Subscription billing, invoices
    - Products: Workspace plans, add-ons (seats, storage, AI)
    - Webhooks: Payment success, subscription updates
    - Regional pricing: Multi-currency support
```

---

## 5. Deployment Architecture

### 5.1 Deployment Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPERS (Git Push)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   GitHub Actions    │
              │   (CI/CD Pipeline)  │
              │                     │
              │  1. Lint & Test     │
              │  2. Build Docker    │
              │  3. Trigger Webhook │
              └──────────┬──────────┘
                         │
                         ▼
        ┌────────────────┴─────────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────────────────────────────────────────┐
│                  Hostinger KVM VPS                   │
│                    (Coolify)                         │
│                                                      │
│  ┌──────────────┐          ┌──────────────────┐      │
│  │  Frontend    │          │  Backend API     │      │
│  │ (Container)  │◄────────►│  (NestJS Cont.)  │      │
│  └──────┬───────┘          └────────┬─────────┘      │
│         │                           │                │
│         ▼                           ▼                │
│  ┌──────────────┐          ┌──────────────────┐      │
│  │  Redis       │          │  PostgreSQL      │      │
│  │ (Cache)      │          │  (Database)      │      │
│  └──────────────┘          └──────────────────┘      │
└──────────────────────────────────────────────────────┘
        │                                  │
        │                                  │
        ▼                                  ▼
┌──────────────────────────────────────────────────────┐
│             Cloudflare CDN (Global Edge)             │
│  • Cache static assets (images, CSS, JS)             │
│  • DDoS protection                                   │
│  • SSL/TLS termination                               │
└──────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                   END USERS (Global)                    │
│  • Agency teams (Egypt, Saudi, UAE, etc.)              │
│  • Clients (via subdomain portal)                      │
│  • Mobile app users (iOS/Android)                      │
└─────────────────────────────────────────────────────────┘
```

---

### 5.2 Environment Strategy


| Environment     | Purpose                | URL Pattern            | Database                  | Deploy Trigger          |
| :-------------- | :--------------------- | :--------------------- | :------------------------ | :---------------------- |
| **Development** | Local dev              | localhost:3000         | Local Docker Postgres     | Manual                  |
| **Staging**     | Pre-production testing | staging.ninjagenzy.com | Staging DB (VPS)          | Push to`staging` branch |
| **Production**  | Live system            | app.ninjagenzy.com     | Production DB (VPS)       | Git tag`v*.*.*`         |

---

### 5.3 Zero-Downtime Deployment

**Strategy:** Rolling Update (Docker/Coolify)

1. Coolify pulls new image.
2. Starts new container.
3. Health check passes.
4. Traffic switched to new container.
5. Old container removed.

---

## 6. C4 Architecture Diagrams

الآن هنبدأ في الـ **C4 Model** بالـ 4 levels:

---

# C4 Level 1 - System Context Diagram

**Purpose:** عرض النظام ككل وعلاقته بالـ external actors/systems

```
                    ┌──────────────────────────┐
                    │   Agency Team Members    │
                    │ (Owner, Team Leader,     │
                    │  Designer, Media Buyer)  │
                    └────────────┬─────────────┘
                                 │
                                 │ Manage projects,
                                 │ tasks, clients
                                 ▼
        ┌────────────────────────────────────────────────┐
        │                                                │
        │         Ninja Gen Z Platform                   │
        │                                                │
        │  Marketing Agency Management SaaS              │
        │  • Project & Task Management                   │
        │  • Client Portal & Approvals                   │
        │  • Time Tracking & Analytics                   │
        │  • AI Assistant (سَنَد)                        │
        │  • Ads Monitoring & Integrations               │
        │                                                │
        └────┬────────────┬──────────────┬───────────┬───┘
             │            │              │           │
             │            │              │           │
    ┌────────▼───┐  ┌────▼─────┐  ┌────▼────┐  ┌──▼─────┐
    │  Clients   │  │  Mobile  │  │External │  │ Admin  │
    │(Reviewers) │  │   Apps   │  │Developers│  │(DevOps)│
    │            │  │iOS/Android│  │(via API)│  │        │
    │Review work │  │           │  │         │  │Monitor │
    │via portal  │  │On-the-go │  │Integrate│  │system  │
    └────────────┘  └──────────┘  └─────────┘  └────────┘
             │
             │
    ┌────────▼───────────────────────────────────────────┐
    │          External Systems & Services               │
    │                                                    │
    │  ┌──────────┐  ┌──────────┐  ┌─────────────┐    │
    │  │Meta Ads  │  │Google Ads│  │  OpenAI     │    │
    │  │   API    │  │   API    │  │  (GPT-4o)   │    │
    │  └──────────┘  └──────────┘  └─────────────┘    │
    │                                                    │
    │  ┌──────────┐  ┌──────────┐  ┌─────────────┐    │
    │  │ AlAdhan  │  │ SendGrid │  │   Slack     │    │
    │  │ (Prayer) │  │ (Email)  │  │   API       │    │
    │  └──────────┘  └──────────┘  └─────────────┘    │
    │                                                    │
    │  ┌──────────┐  ┌──────────┐                      │
    │  │  Stripe  │  │  Zapier  │                      │
    │  │(Payment) │  │ (Automate│                      │
    │  └──────────┘  └──────────┘                      │
    │                                                    │
    └────────────────────────────────────────────────────┘
```

---

# C4 Level 2 - Container Diagram

**Purpose:** عرض الـ containers الرئيسية (applications, data stores) داخل النظام

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Ninja Gen Z Platform                                │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                      PRESENTATION LAYER                            │    │
│  │                                                                    │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │    │
│  │  │  Web Application │  │  Mobile Apps     │  │ Client Portal  │  │    │
│  │  │                  │  │                  │  │                │  │    │
│  │  │  React + Vite    │  │  iOS (Swift)     │  │ React (sub-    │  │    │
│  │  │  Tailwind CSS    │  │  Android (Kotlin)│  │ domain route)  │  │    │
│  │  │                  │  │                  │  │                │  │    │
│  │  │  • Dashboard     │  │  • Task list     │  │ • Review tasks │  │    │
│  │  │  • Task mgmt     │  │  • Time tracking │  │ • Approve work │  │    │
│  │  │  • Analytics     │  │  • Notifications │  │ • View reports │  │    │
│  │  │  • سَنَد Chat   │  │  • File upload   │  │                │  │    │
│  │  │                  │  │                  │  │                │  │    │
│  │  │  Hosted: VPS     │  │  Hosted: App     │  │ Hosted: VPS    │  │    │
│  │  │                  │  │  Store/Play Store│  │                │  │    │
│  │  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────┘  │    │
│  │           │                     │                     │          │    │
│  └───────────┼─────────────────────┼─────────────────────┼──────────┘    │
│              │                     │                     │               │
│              │  HTTPS/WSS          │  HTTPS/WSS          │  HTTPS/WSS    │
│              │                     │                     │               │
│  ┌───────────▼─────────────────────▼─────────────────────▼──────────┐    │
│  │                      API GATEWAY & BACKEND                        │    │
│  │                                                                   │    │
│  │                    NestJS API Service                             │    │
│  │                                                                   │    │
│  │  • Authentication Guard (JWT)                                     │    │
│  │  • Business Logic (Services)                                      │    │
│  │  • Rate limiting                                                  │    │
│  │  • WebSocket Gateway                                              │    │
│  │                                                                   │    │
│  │  Hosted: Hostinger KVM VPS (Coolify)                              │    │
│  └───────────────────────────────┬───────────────────────────────────┘    │
│                                  │                                        │
│                                  │                                        │
│  ┌───────────────────────────────▼────────────────────────────────────┐  │
│  │                      DATA & SERVICES LAYER                         │  │
│  │                                                                    │  │
│  │  ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────┐ │  │
│  │  │  Redis              │  │  PostgreSQL      │  │ n8n          │ │  │
│  │  │  (Cache/Queue)      │  │  Database        │  │ Automation   │ │  │
│  │  │                     │  │                  │  │              │ │  │
│  │  │  • BullMQ Jobs      │  │  • Application   │  │ • Cron jobs  │ │  │
│  │  │  • API Cache        │  │    Data          │  │ • Webhooks   │ │  │
│  │  │                     │  │  • Users         │  │              │ │  │
│  │  │                     │  │                  │  │              │ │  │
│  │  │  Hosted: VPS        │  │  Hosted: VPS     │  │ Hosted: VPS  │ │  │
│  │  └─────────────────────┘  └──────────────────┘  └──────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```
