<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PART 3: SYSTEM DESIGN (تكملة)


***

# 2. SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture (C4 Model - Level 1)

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS & CLIENTS                          │
│  👨‍💼 Agency Owner  👥 Team Members  🧑‍💼 Clients  📱 Mobile │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CDN & EDGE LAYER                         │
│           Cloudflare (CDN, DDoS Protection)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
┌───────────────────────┐   ┌───────────────────────┐
│   FRONTEND (React)    │   │   MOBILE APPS         │
│   Hosted: Vercel      │   │   iOS + Android       │
│   - Dashboard         │   │   Native Apps         │
│   - Client Portal     │   └───────────────────────┘
└───────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Supabase)                         │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ PostgreSQL   │ Auth         │ Storage (S3-like)    │    │
│  │ + RLS        │ (JWT)        │ Files/Images         │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐      │
│  │ Edge Functions (Deno)                            │      │
│  │ - AI (OpenAI integration)                        │      │
│  │ - Prayer times caching                           │      │
│  │ - Ads sync (Meta/Google)                         │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │ Realtime (WebSockets)                            │      │
│  │ - Live updates, Notifications                    │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                │
    ┌───────────┴──────────┬──────────────┐
    ↓                      ↓              ↓
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   n8n       │  │ External APIs│  │ Third-Party  │
│ Automation  │  │ - Meta Ads   │  │ - Slack      │
│ Workflows   │  │ - Google Ads │  │ - Zapier     │
│             │  │ - AlAdhan    │  │ - G Drive    │
└─────────────┘  └──────────────┘  └──────────────┘
```


***

## 2.2 Frontend Architecture (React + Vite)

### 2.2.1 Tech Stack

- **Framework:** React 18+ (Hooks, Context API)
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS (utility-first, responsive)
- **State Management:**
    - Zustand (global state: user, workspace)
    - React Query (server state: API caching)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Real-time:** Supabase Realtime client
- **Charts:** Recharts or Chart.js
- **Timeline:** FullCalendar or DHTMLX Gantt

***

### 2.2.2 Folder Structure

```
src/
├── components/
│   ├── ui/                  # Reusable UI (Button, Input, Modal)
│   ├── layout/              # Layout components (Navbar, Sidebar)
│   ├── tasks/               # Task-specific components
│   ├── projects/
│   ├── clients/
│   └── ...
├── views/                   # Page-level components
│   ├── Dashboard.tsx
│   ├── TasksView.tsx
│   ├── Timeline.tsx
│   ├── Gallery.tsx
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   ├── useRealtime.ts
│   └── ...
├── services/                # API clients
│   ├── supabase.ts
│   ├── api.ts
│   └── ...
├── stores/                  # Zustand stores
│   ├── authStore.ts
│   ├── workspaceStore.ts
│   └── ...
├── utils/                   # Helper functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── ...
├── types/                   # TypeScript types
│   ├── database.types.ts    # Generated from Supabase
│   └── ...
├── App.tsx
└── main.tsx
```


***

### 2.2.3 Key Design Patterns

**A. Component Composition**

```tsx
// Bad: Monolithic component
<TaskCard ... />

// Good: Composable components
<TaskCard>
  <TaskCard.Header />
  <TaskCard.Body />
  <TaskCard.Footer />
</TaskCard>
```

**B. Custom Hooks for Logic**

```tsx
// useTasks.ts
export function useTasks(projectId: string) {
  const { data, isLoading, error } = useQuery(
    ['tasks', projectId],
    () => fetchTasks(projectId),
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );
  
  return { tasks: data, isLoading, error };
}
```

**C. Optimistic Updates**

```tsx
// When user creates task, update UI immediately
const mutation = useMutation(createTask, {
  onMutate: async (newTask) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['tasks']);
    
    // Optimistically update cache
    queryClient.setQueryData(['tasks'], (old) => [...old, newTask]);
  },
  onError: (err, newTask, rollback) => {
    // Rollback on error
    rollback();
  }
});
```


***

### 2.2.4 Performance Optimizations[^1]

**Code Splitting:**

```tsx
// Lazy load heavy views
const Timeline = lazy(() => import('./views/Timeline'));
const Gallery = lazy(() => import('./views/Gallery'));
const Charts = lazy(() => import('./views/Charts'));

<Suspense fallback={<Skeleton />}>
  <Routes>
    <Route path="/timeline" element={<Timeline />} />
  </Routes>
</Suspense>
```

**Virtualization (للـ long lists):**

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={80}
>
  {({ index, style }) => (
    <TaskRow task={tasks[index]} style={style} />
  )}
</FixedSizeList>
```

**Image Optimization:**

```tsx
// Use Supabase Image Transformation
const thumbnailUrl = `${fileUrl}?width=200&height=200&quality=80`;
```


***

## 2.3 Backend Architecture (Supabase)

### 2.3.1 PostgreSQL + Row-Level Security (RLS)[^2]

**RLS Policy Examples:**

```sql
-- Users can only see agencies they belong to
CREATE POLICY "Users view own agency data"
ON agencies FOR SELECT
USING (
  id IN (
    SELECT agency_id FROM user_roles
    WHERE user_id = auth.uid()
  )
);

-- Users can only view tasks in their workspace
CREATE POLICY "Users view workspace tasks"
ON tasks FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspaces w ON w.id = p.workspace_id
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = auth.uid()
  )
);

-- Clients can only view their own tasks (via client portal)
CREATE POLICY "Clients view own tasks"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN projects p ON p.client_id = (
      SELECT client_id FROM client_portal_access
      WHERE user_id = auth.uid()
    )
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'client'
      AND tasks.project_id = p.id
  )
);

-- Only assigned user or team leaders can update task
CREATE POLICY "Update own or managed tasks"
ON tasks FOR UPDATE
USING (
  assigned_to = auth.uid()
  OR
  created_by = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('owner', 'team_leader')
      AND ur.agency_id = (
        SELECT w.agency_id FROM projects p
        JOIN workspaces w ON w.id = p.workspace_id
        WHERE p.id = tasks.project_id
      )
  )
);
```


***

### 2.3.2 Edge Functions (Serverless)

**Deployment:** Deno Deploy (globally distributed)

**Key Edge Functions:**

**A. `/functions/ai-ask`** (Phase 3-4)

- Handles AI Q\&A and task creation
- Integrates with OpenAI API
- Quota enforcement
- Response: JSON with answer + metadata

**B. `/functions/fetch-prayer-times`** (Phase 3)

- Runs daily at 3 AM (cron)
- Fetches prayer times from AlAdhan API
- Caches in `prayer_times_cache` table
- Response: Success/error status

**C. `/functions/send-prayer-reminders`** (Phase 3)

- Runs every 5 minutes (cron)
- Checks upcoming prayers
- Creates notifications
- Response: Count of notifications sent

**D. `/functions/sync-meta-ads`** (Phase 4)

- Runs every 6 hours (cron)
- Fetches campaign data from Meta API
- Stores in `meta_campaigns` + `meta_campaign_insights`
- Response: Campaigns synced count

**E. `/functions/sync-google-ads`** (Phase 4)

- Similar to Meta sync
- Google Ads API integration

**F. `/functions/process-webhook`** (Phase 5)

- Receives webhooks from external services
- Validates signatures
- Processes events
- Response: 200 OK or error

***

### 2.3.3 Realtime Subscriptions

**How it works:**

```typescript
// Client subscribes to changes
const subscription = supabase
  .channel('workspace-123')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'tasks',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('Task changed:', payload);
      // Update UI in realtime
      queryClient.invalidateQueries(['tasks']);
    }
  )
  .subscribe();
```

**Channels per entity:**

- `workspace-{id}`: All changes in workspace
- `task-{id}`: Comments, file uploads on specific task
- `notifications-{userId}`: Real-time notifications

***

### 2.3.4 Storage (Files \& Images)

**Supabase Storage Buckets:**

```
workit-storage/
├── avatars/          # User profile pictures
├── logos/            # Client logos, agency branding
├── task-files/       # Task attachments
│   ├── {task-id}/
│   │   ├── file1.pdf
│   │   └── file2.png
├── mockups/          # Generated mockup previews
└── exports/          # CSV/PDF exports (temporary)
```

**Access Control:**

```sql
-- RLS on storage
CREATE POLICY "Users upload to own workspace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-files'
  AND auth.uid() IN (
    SELECT user_id FROM workspace_members
    WHERE workspace_id = (storage.foldername(name))[^1]::uuid
  )
);
```

**Image Transformation (Built-in):**

```
GET /storage/v1/object/public/task-files/image.jpg
  ?width=400&height=300&quality=80&resize=cover
```


***

## 2.4 External Integrations Architecture

### 2.4.1 n8n Workflows (Self-hosted or Cloud)

**Setup:**

1. Deploy n8n (Docker container or n8n Cloud)
2. Connect to Supabase via PostgreSQL node
3. Create workflows for:
    - **Competitor scraping** (Instagram, Facebook)
    - **Slack notifications**
    - **Email automations**
    - **Zapier alternative workflows**

**Example Workflow: Instagram Competitor Monitoring**

```
[Schedule: Daily at 9 AM]
  ↓
[HTTP Request: Fetch posts via RapidAPI Instagram Scraper]
  Input: @competitor_handle
  Output: JSON array of posts
  ↓
[Function: Parse posts]
  Extract: post_url, content, likes, comments
  ↓
[Supabase Insert: competitor_posts table]
  ↓
[IF: engagement_score > 1000]
  ↓
[Supabase Insert: notifications table]
  Message: "Competitor X had viral post"
```


***

### 2.4.2 API Integration Patterns

**OAuth 2.0 Flow (Meta, Google, Slack, etc.):**

```
1. User clicks "Connect Meta Ads"
2. Frontend redirects to Meta OAuth URL
3. User authorizes
4. Meta redirects back with code
5. Backend exchanges code for access_token
6. Store encrypted token in database
7. Use token for API calls
8. Refresh token when expired
```

**Webhook Handling:**

```typescript
// Endpoint: POST /api/webhooks/{provider}
export async function handleWebhook(req, res) {
  // 1. Verify signature (HMAC)
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifySignature(req.body, signature, secret);
  
  if (!isValid) return res.status(401).send('Invalid signature');
  
  // 2. Process event
  const event = req.body;
  
  if (event.type === 'task.completed') {
    // Trigger automation
    await notifySlack(event.data);
  }
  
  // 3. Respond quickly
  res.status(200).send('OK');
}
```


***

## 2.5 Security Architecture

### 2.5.1 Authentication \& Authorization

**Authentication Layers:**

```
1. Email/Password (Supabase Auth)
2. OAuth (Google, Microsoft) [Phase 5]
3. SSO (SAML 2.0) [Phase 5]
4. 2FA (TOTP) [Phase 5]
```

**Authorization Hierarchy:**

```
Agency → Workspace → Project → Task
   ↓         ↓          ↓        ↓
 Owner    Admin      Lead    Assignee
```

**Permission Check Flow:**

```typescript
async function canUpdateTask(userId: string, taskId: string) {
  // 1. Get task with relationships
  const task = await db.tasks.findUnique({
    where: { id: taskId },
    include: { project: { include: { workspace: true } } }
  });
  
  // 2. Check user role in workspace
  const userRole = await db.user_roles.findFirst({
    where: {
      user_id: userId,
      agency_id: task.project.workspace.agency_id
    }
  });
  
  // 3. Apply permission logic
  if (userRole.role === 'owner') return true;
  if (userRole.role === 'team_leader') return true;
  if (task.assigned_to === userId) return true;
  
  return false;
}
```


***

### 2.5.2 Data Encryption

**At Rest:**

- PostgreSQL: AES-256 (Supabase default)
- Storage: Server-side encryption (SSE)
- Sensitive fields: Additional encryption layer

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt API tokens
INSERT INTO api_keys (key_hash)
VALUES (crypt('api_key_value', gen_salt('bf')));
```


**In Transit:**

- TLS 1.3 for all connections
- HTTPS enforced (HSTS headers)
- WebSocket over TLS (wss://)

***

### 2.5.3 Rate Limiting \& DDoS Protection

**API Rate Limits (by tier):**

```typescript
const RATE_LIMITS = {
  free: { requests: 100, window: 3600 }, // 100 req/hour
  pro: { requests: 1000, window: 3600 },
  enterprise: { requests: 10000, window: 3600 }
};

// Middleware
async function rateLimitMiddleware(req, res, next) {
  const apiKey = req.headers['authorization'];
  const tier = await getTier(apiKey);
  
  const count = await redis.incr(`rate:${apiKey}`);
  if (count === 1) {
    await redis.expire(`rate:${apiKey}`, RATE_LIMITS[tier].window);
  }
  
  if (count > RATE_LIMITS[tier].requests) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  next();
}
```

**Cloudflare Protection:**

- DDoS mitigation (Layer 3/4/7)
- Bot detection
- Rate limiting at edge
- WAF (Web Application Firewall)

***

## 2.6 Monitoring \& Observability

### 2.6.1 Error Tracking

**Sentry Integration:**

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  }
});
```

**Alerts:**

- Error rate > 1% (5 min avg)
- Response time > 2s (p95)
- Database CPU > 80%

***

### 2.6.2 Performance Monitoring

**Metrics Tracked:**

```
- API response time (p50, p95, p99)
- Database query time
- Realtime connection count
- Active users (concurrent)
- Storage bandwidth
- Edge function invocations
```

**Dashboard (Internal):**

```
Grafana + Prometheus
- Real-time graphs
- Historical trends
- Alerts configuration
```


***

### 2.6.3 Logging Strategy

**Log Levels:**

```
ERROR:   Critical failures (notify immediately)
WARN:    Potential issues (review daily)
INFO:    Important events (audit logs)
DEBUG:   Development only
```

**Structured Logging:**

```json
{
  "level": "info",
  "timestamp": "2026-01-24T12:45:00Z",
  "user_id": "uuid",
  "action": "task.created",
  "entity_id": "task-uuid",
  "ip": "197.45.23.10",
  "duration_ms": 250
}
```

**Log Retention:**

- ERROR logs: 1 year
- INFO logs: 90 days
- DEBUG logs: 7 days

***

# 3. API SPECIFICATION (REST API)

## 3.1 API Standards

**Base URL:** `https://api.workit.com/v1`

**Authentication:**

```
Authorization: Bearer {access_token}
```

**Response Format:**

```json
{
  "data": {...},
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 250
  },
  "links": {
    "next": "/v1/tasks?page=2",
    "prev": null
  }
}
```

**Error Format:**

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input",
    "details": [
      {
        "field": "title",
        "issue": "Title is required"
      }
    ]
  }
}
```


***

## 3.2 Core Endpoints (Examples)

### Tasks API

**GET /v1/tasks**

```
Query params:
- project_id (UUID)
- status (todo|in_progress|review|done)
- assigned_to (UUID)
- page (integer)
- per_page (integer, max 100)

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "title": "Design Instagram Post",
      "status": "in_progress",
      "priority": "high",
      "assigned_to": {
        "id": "uuid",
        "name": "Ahmed"
      },
      "deadline": "2026-01-28T18:00:00Z",
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "meta": {...}
}
```

**POST /v1/tasks**

```
Body:
{
  "project_id": "uuid",
  "title": "Design IG Post",
  "description": "Create 5-slide carousel",
  "assigned_to": "uuid",
  "deadline": "2026-01-28",
  "priority": "high",
  "tags": ["design", "instagram"]
}

Response: 201 Created
{
  "data": {...}
}
```

**PATCH /v1/tasks/{id}**

```
Body:
{
  "status": "done",
  "completed_at": "2026-01-25T15:30:00Z"
}

Response: 200 OK
```


***

### Webhooks API

**POST /v1/webhooks**

```
Body:
{
  "url": "https://your-app.com/webhooks",
  "events": ["task.created", "task.updated"],
  "secret": "your-secret-key"
}

Response: 201 Created
```


***

## 3.3 Versioning Strategy

**URL Versioning:** `/v1`, `/v2`

**Deprecation Process:**

1. Announce deprecation (3 months notice)
2. Add deprecation headers:

```
Deprecation: true
Sunset: 2026-06-01
```

3. Redirect to new version
4. Remove old version after sunset

***

# 4. DEVOPS \& DEPLOYMENT

## 4.1 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build frontend
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3

  deploy-frontend:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-database:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Run Supabase migrations
        run: npx supabase db push
```


***

## 4.2 Environments

**Development:**

- URL: `dev.workit.com`
- Database: Supabase dev instance
- Features: Debug mode, hot reload

**Staging:**

- URL: `staging.workit.com`
- Database: Staging replica
- Purpose: QA testing before production

**Production:**

- URL: `app.workit.com`
- Database: Production (with backups)
- Monitoring: Full observability

***

## 4.3 Database Migrations

**Supabase Migration Files:**

```
supabase/migrations/
├── 20260101000000_initial_schema.sql
├── 20260115000000_add_custom_properties.sql
├── 20260120000000_add_rls_policies.sql
└── ...
```

**Migration Strategy:**

1. Write migration SQL
2. Test in dev
3. Apply to staging
4. Apply to production (with rollback plan)

***

## 4.4 Backup \& Disaster Recovery

**Automated Backups:**

- Database: Daily snapshots (30-day retention)
- Storage: Continuous replication (S3)

**Recovery Time Objective (RTO):** < 4 hours
**Recovery Point Objective (RPO):** < 1 hour

**Disaster Recovery Plan:**

1. Detect outage (monitoring alerts)
2. Assess impact
3. Restore from backup
4. Verify data integrity
5. Communicate to users

***

## 4.5 Scaling Strategy

**Horizontal Scaling:**

- Frontend: Auto-scale on Vercel (unlimited)
- Edge Functions: Auto-scale on Deno Deploy
- Database: Read replicas (Phase 6)

**Vertical Scaling:**

- Database: Upgrade Supabase plan (more CPU/RAM)

**Caching:**

- CDN: Cloudflare (static assets)
- Application: Redis (for rate limiting, sessions)
- Database: Materialized views (pre-computed analytics)

**Load Targets:**

- 1,000 concurrent users: Phase 3-4
- 5,000 concurrent users: Phase 5
- 10,000+ concurrent users: Phase 6

***

# 5. TESTING STRATEGY

## 5.1 Testing Pyramid

```
        /\
       /  \      E2E Tests (5%)
      /────\     - Critical user flows
     /      \    - Playwright
    /────────\   
   /          \  Integration Tests (20%)
  /────────────\ - API endpoints
 /              \- Database queries
/────────────────\
    Unit Tests    Component Tests (75%)
    - Functions   - React components
    - Utils       - Jest + Testing Library
```


***

## 5.2 Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All API endpoints
- **E2E Tests:** 5 critical flows

1. User signup → Create workspace → Create task
2. Task assignment → Comment → Approval
3. Client login → View tasks → Approve design
4. Upload file → Generate mockup → Share
5. Time tracking → Submit timesheet

***

**🎉 PART 3: SYSTEM DESIGN COMPLETE! 🎉**

***

## Summary: What We've Built

✅ **Database Schema:** 40+ tables with relationships + RLS policies
✅ **Architecture:** Frontend (React) + Backend (Supabase) + Integrations
✅ **API Specification:** RESTful API with versioning + rate limiting
✅ **Security:** Multi-tenant isolation, encryption, authentication
✅ **DevOps:** CI/CD pipeline, environments, backups, scaling
✅ **Testing:** Comprehensive testing strategy

***

## Next Steps for Development Team

1. **Sprint 0 (Setup - Week 1):**
    - Initialize GitHub repo
    - Setup Supabase project
    - Configure CI/CD
    - Create database schema (run all migrations)
    - Setup development environment
2. **Sprint 1-30 (Weeks 2-60):**
    - Follow Phase 1-5 sprint plans from PRD
    - Implement features incrementally
    - Test thoroughly
    - Deploy to production progressively
3. **Post-Launch:**
    - Monitor performance
    - Gather user feedback
    - Iterate based on analytics
    - Plan Phase 6 (Advanced features)

***

**المنصة جاهزة للتنفيذ! هل تريد توضيح أي جزء تقني معين؟** 🚀
<span style="display:none">[^3][^4][^5]</span>

<div align="center">⁂</div>

[^1]: https://www.studiolabs.com/building-scalable-saas-applications-with-react-node-js/

[^2]: https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175

[^3]: Product-Vision-Document1.1.md

[^4]: Product-Vision-Document1.2.md

[^5]: Technical-Details-Features-Implem.md

