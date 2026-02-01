# 🚀 Ninja Gen Z - Tech Stack (Production Ready)

> **Last Updated:** 2026-02-01  
> **Deployment Target:** Coolify (Self-Hosted)  
> **Status:** ✅ Approved

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NINJA GEN Z ARCHITECTURE                            │
│                         (Coolify Self-Hosted)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🎨 FRONTEND CONTAINER (Antigravity)                                │    │
│  │  ├── React 19 + Vite (Rolldown)                                     │    │
│  │  ├── TypeScript 5.9+                                                │    │
│  │  ├── Tailwind CSS 3.4                                               │    │
│  │  ├── TanStack Query v5 (Server State)                               │    │
│  │  ├── Zustand (Client State)                                         │    │
│  │  └── Nginx (Static Serving + Reverse Proxy)                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ⚙️ BACKEND CONTAINER (Trae - NestJS)                               │    │
│  │  ├── NestJS 10+ (Main Framework)                                    │    │
│  │  ├── Prisma 5+ (ORM)                                                │    │
│  │  ├── Passport.js + JWT (Authentication)                             │    │
│  │  ├── Socket.io (Real-time)                                          │    │
│  │  ├── Bull (Background Jobs Queue)                                   │    │
│  │  └── Class-validator (Validation)                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                               │                                              │
│                               ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🗄️ DATA LAYER                                                      │    │
│  │  ├── PostgreSQL 16 (Primary Database)                               │    │
│  │  ├── Redis 7 (Cache + Sessions + Queue)                             │    │
│  │  └── MinIO (S3-Compatible File Storage)                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🤖 AGENT COORDINATION (MCP Hub)                                    │    │
│  │  └── Node.js + Express (Agent Status & Handoffs)                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Stack (Antigravity)

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.x | UI Library |
| `react-dom` | 19.x | DOM Rendering |
| `vite` | 7.x (Rolldown) | Build Tool |
| `typescript` | 5.9+ | Type Safety |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 3.4.x | Utility-First CSS |
| `tailwind-merge` | 3.x | Class Merging |
| `clsx` | 2.x | Conditional Classes |

### State Management

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | 5.x | Server State (API caching) |
| `zustand` | 4.x | Client State (UI state) |

### Routing

| Package | Version | Purpose |
|---------|---------|---------|
| `react-router-dom` | 7.x | Client-side Routing |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `react-hook-form` | 7.x | Form Management |
| `zod` | 3.x | Schema Validation |
| `@hookform/resolvers` | 3.x | Zod Integration |

### UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/react-*` | Latest | Accessible Primitives |
| `lucide-react` | 0.x | Icons |
| `cmdk` | 1.x | Command Palette |
| `vaul` | 0.x | Drawer/Side Peek |
| `sonner` | 1.x | Toast Notifications |

### Data Display

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-table` | 8.x | Table View |
| `@tanstack/react-virtual` | 3.x | Virtualization |

### Drag & Drop

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | 6.x | Kanban Board |
| `@dnd-kit/sortable` | 8.x | Sortable Lists |

### Rich Text

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/react` | 2.x | Rich Text Editor |
| `@tiptap/starter-kit` | 2.x | Basic Extensions |

### Date & Time

| Package | Version | Purpose |
|---------|---------|---------|
| `date-fns` | 3.x | Date Utilities |
| `@internationalized/date` | 3.x | i18n Dates |

### HTTP Client

| Package | Version | Purpose |
|---------|---------|---------|
| `ky` | 1.x | Fetch Wrapper |

---

## ⚙️ Backend Stack (Trae - NestJS)

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | 10.x | Main Framework |
| `@nestjs/common` | 10.x | Common Utilities |
| `@nestjs/platform-express` | 10.x | Express Adapter |
| `typescript` | 5.3+ | Type Safety |

### Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | 5.x | ORM & Migrations |
| `@prisma/client` | 5.x | Database Client |

### Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/passport` | 10.x | Auth Module |
| `passport-jwt` | 4.x | JWT Strategy |
| `passport-local` | 1.x | Local Strategy |
| `bcrypt` | 5.x | Password Hashing |
| `@nestjs/jwt` | 10.x | JWT Utilities |

### Validation

| Package | Version | Purpose |
|---------|---------|---------|
| `class-validator` | 0.14.x | DTO Validation |
| `class-transformer` | 0.5.x | Object Transform |

### Real-time

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/websockets` | 10.x | WebSocket Module |
| `@nestjs/platform-socket.io` | 10.x | Socket.io Adapter |
| `socket.io` | 4.x | Real-time Engine |

### Background Jobs

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/bull` | 10.x | Queue Module |
| `bull` | 4.x | Redis-based Queue |

### File Storage

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/multer` | 10.x | File Upload |
| `minio` | 8.x | S3-Compatible Client |

### API Documentation

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/swagger` | 7.x | OpenAPI/Swagger |

### Caching

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/cache-manager` | 2.x | Cache Module |
| `cache-manager-redis-store` | 3.x | Redis Store |

### Configuration

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/config` | 3.x | Environment Config |

---

## 🗄️ Data Layer

### Primary Database

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16.x | Relational Database |

### Caching & Sessions

| Technology | Version | Purpose |
|------------|---------|---------|
| Redis | 7.x | Cache, Sessions, Queue Backend |

### File Storage

| Technology | Version | Purpose |
|------------|---------|---------|
| MinIO | Latest | S3-Compatible Object Storage |

---

## 🐳 Deployment (Coolify)

### Docker Compose Structure

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:4000

  # Backend API
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ninjagenz
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=ninjagenz
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=ninjagenz

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # MinIO Storage
  minio:
    image: minio/minio
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=${MINIO_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"

  # MCP Hub (Agent Coordination)
  mcp-hub:
    build: ./mcp-server
    ports:
      - "3500:3000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/ninjagenz

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

## 📁 Project Structure

```
ninja-genz/
├── frontend/                    # React Frontend (Antigravity)
│   ├── src/
│   │   ├── components/          # UI Components (Atomic Design)
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   ├── pages/               # Route Pages
│   │   ├── hooks/               # Custom Hooks
│   │   ├── lib/                 # Utilities
│   │   ├── stores/              # Zustand Stores
│   │   ├── types/               # TypeScript Types
│   │   └── styles/              # Global Styles
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # NestJS Backend (Trae)
│   ├── src/
│   │   ├── modules/             # Feature Modules
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── tasks/
│   │   │   ├── projects/
│   │   │   └── ...
│   │   ├── common/              # Shared (guards, pipes, etc.)
│   │   ├── config/              # Configuration
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   └── package.json
│
├── mcp-server/                  # Agent Coordination Hub
│   ├── src/
│   └── package.json
│
├── docs/                        # Documentation
│   ├── TECH-STACK.md           # This file
│   ├── PRD/
│   ├── Wireframes/
│   └── ...
│
├── docker-compose.yml           # Docker Compose
├── .env.example                 # Environment Variables Template
└── README.md
```

---

## 🔐 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
VITE_ENV=development
```

### Backend (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://ninjagenz:password@localhost:5432/ninjagenz

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ninjagenz

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

---

## 🆚 Why This Stack?

### Frontend Choices

| Choice | Why |
|--------|-----|
| **React 19** | Latest Concurrent Features, Server Components ready |
| **Vite + Rolldown** | Fastest build tool, native ESM |
| **TanStack Query** | Best server state management, caching |
| **Zustand** | Simple, performant client state |
| **Radix UI** | Accessible, unstyled primitives |
| **@dnd-kit** | Better than react-beautiful-dnd (maintained) |

### Backend Choices

| Choice | Why |
|--------|-----|
| **NestJS** | Enterprise-ready, TypeScript-first, modular |
| **Prisma** | Type-safe ORM, great migrations |
| **Socket.io** | Battle-tested real-time |
| **Bull** | Redis-based, reliable job queue |
| **MinIO** | S3-compatible, self-hosted storage |

### Infrastructure Choices

| Choice | Why |
|--------|-----|
| **PostgreSQL 16** | Best relational DB, JSON support |
| **Redis 7** | Fast cache, pub/sub, queues |
| **Coolify** | Self-hosted, no vendor lock-in |
| **Docker** | Consistent environments |

---

## 📋 Development Workflow

### Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
npm install
npm run prisma:migrate
npm run start:dev    # http://localhost:4000

# Database
docker-compose up postgres redis minio -d
```

### Production Build

```bash
# Build all
docker-compose build

# Deploy to Coolify
git push origin main  # Coolify auto-deploys
```

---

## ✅ Stack Approval Checklist

- [x] Frontend: React 19 + Vite + TypeScript + Tailwind
- [x] Backend: NestJS + Prisma + PostgreSQL
- [x] Real-time: Socket.io
- [x] Caching: Redis
- [x] Storage: MinIO (S3-compatible)
- [x] Queue: Bull (Redis-based)
- [x] Deployment: Docker + Coolify
- [x] No vendor lock-in
- [x] Self-hosted ready

---

**This stack is PRODUCTION READY for Coolify deployment!** 🚀
