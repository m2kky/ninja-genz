<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# DevOps \& Infrastructure Document

**Version:** 1.0
**Platform:** Ninja Gen Z
**Date:** January 24, 2026

***

## 1. DevOps Overview

### 1.1 Philosophy \& Principles

**Core Principles:**

- **Automation First:** كل حاجة repeatable تتعمل automated
- **Infrastructure as Code:** كل الـ config في Git
- **Continuous Deployment:** كل merge للـ main يروح production
- **Monitoring Everything:** Logs, metrics, alerts for all systems
- **Fast Recovery:** Rollback في أقل من 5 دقائق

**Tools Stack:**

- **Version Control:** GitHub
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (Frontend) + Supabase (Backend)
- **Monitoring:** Sentry (errors) + Vercel Analytics + Supabase Dashboard
- **Secrets:** GitHub Secrets + Vercel Environment Variables + Supabase Vault
- **DNS:** Cloudflare
- **CDN:** Cloudflare + Vercel Edge

***

## 2. Environment Architecture

### 2.1 Environments Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT                             │
│                                                             │
│  Developer Laptop                                           │
│  ├── localhost:5173 (Vite dev server)                      │
│  ├── Local Supabase (optional - Docker)                    │
│  └── Hot reload, debugging, testing                        │
│                                                             │
│  Purpose: Local development, fast iteration                 │
│  Data: Mock data / test database                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ git push origin feature/*
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      STAGING                                │
│                                                             │
│  URL: https://staging.ninjagenzy.com                       │
│  Frontend: Vercel (staging environment)                     │
│  Backend: Supabase (staging project)                        │
│  Database: PostgreSQL (non-production data)                 │
│                                                             │
│  Purpose: Pre-production testing, QA, client demos          │
│  Deploy Trigger: Merge to 'staging' branch                  │
│  Auto-deployed: Yes (via GitHub Actions)                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ git tag v1.x.x → merge to main
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION                              │
│                                                             │
│  URL: https://app.ninjagenzy.com                           │
│  Frontend: Vercel (production environment)                  │
│  Backend: Supabase (production project)                     │
│  Database: PostgreSQL (live customer data)                  │
│                                                             │
│  Purpose: Live system serving real users                    │
│  Deploy Trigger: Push to 'main' branch                      │
│  Auto-deployed: Yes (after CI checks pass)                  │
│  Rollback: Instant (Vercel keeps previous deployments)     │
└─────────────────────────────────────────────────────────────┘
```


***

### 2.2 Environment Configuration

| Config | Development | Staging | Production |
| :-- | :-- | :-- | :-- |
| **Frontend URL** | localhost:5173 | staging.ninjagenzy.com | app.ninjagenzy.com |
| **Supabase URL** | Local or staging | staging-ref.supabase.co | prod-ref.supabase.co |
| **Database Size** | Minimal | 1GB test data | Full (production) |
| **Logs Retention** | 1 day | 7 days | 30 days |
| **Backups** | None | Daily | Daily + hourly snapshots |
| **Monitoring** | Console only | Basic | Full (Sentry + alerts) |
| **Rate Limits** | Unlimited | Relaxed | Strict (per plan) |
| **Feature Flags** | All enabled | Staged rollout | Gradual rollout |


***

## 3. CI/CD Pipeline (GitHub Actions)

### 3.1 Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 1. git checkout -b feature/new-feature
                          │ 2. Code changes
                          │ 3. git push origin feature/new-feature
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              PULL REQUEST OPENED (GitHub)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│              CI PIPELINE - PR CHECKS                         │
│                                                              │
│  Step 1: Install Dependencies                                │
│    ├── npm ci (lock file for consistency)                   │
│    └── Cache node_modules for speed                         │
│                                                              │
│  Step 2: Code Quality                                        │
│    ├── ESLint (code style + best practices)                 │
│    ├── Prettier (formatting check)                          │
│    └── TypeScript type checking                             │
│                                                              │
│  Step 3: Unit Tests                                          │
│    ├── Vitest (run all *.test.ts files)                     │
│    └── Coverage report (minimum 70%)                        │
│                                                              │
│  Step 4: Build                                               │
│    ├── Vite build (production bundle)                       │
│    └── Check bundle size (< 500KB initial)                  │
│                                                              │
│  ✅ All checks pass → PR can be merged                      │
│  ❌ Any check fails → Block merge, notify developer         │
└──────────────────────────────────────────────────────────────┘
                       │
                       │ Reviewer approves + merge
                       ▼
┌──────────────────────────────────────────────────────────────┐
│         STAGING DEPLOYMENT (on merge to staging branch)      │
│                                                              │
│  Step 1: Build                                               │
│    └── npm run build (production mode)                      │
│                                                              │
│  Step 2: Deploy to Vercel Staging                            │
│    ├── vercel deploy --env=staging                          │
│    └── URL: https://staging-xyz.vercel.app                  │
│                                                              │
│  Step 3: Smoke Tests                                         │
│    ├── Check homepage loads (HTTP 200)                      │
│    ├── Check API health endpoint                            │
│    └── Check login flow works                               │
│                                                              │
│  Step 4: Notify Team                                         │
│    └── Slack: "✅ Staging deployed: [commit] by [author]"  │
└──────────────────────────────────────────────────────────────┘
                       │
                       │ QA testing complete + tag release
                       │ git tag v1.2.3 && git push --tags
                       ▼
┌──────────────────────────────────────────────────────────────┐
│      PRODUCTION DEPLOYMENT (on push to main branch)          │
│                                                              │
│  Step 1: Pre-deployment Checks                               │
│    ├── Verify all CI checks passed                          │
│    ├── Verify no critical Sentry errors in staging          │
│    └── Verify database migrations applied (if any)          │
│                                                              │
│  Step 2: Build & Deploy                                      │
│    ├── npm run build (production optimized)                 │
│    ├── vercel deploy --prod                                 │
│    └── Deployment URL: https://app.ninjagenzy.com           │
│                                                              │
│  Step 3: Post-deployment Checks                              │
│    ├── Health check (GET /api/health)                       │
│    ├── Smoke tests (login, dashboard load, API call)        │
│    └── Verify no error spike in Sentry                      │
│                                                              │
│  Step 4: Notify & Monitor                                    │
│    ├── Slack: "🚀 Production deployed: v1.2.3"             │
│    ├── Monitor error rate for 15 minutes                    │
│    └── Auto-rollback if error rate > 2%                     │
│                                                              │
│  ✅ Success → Keep deployment                               │
│  ❌ Failure → Auto-rollback to previous version             │
└──────────────────────────────────────────────────────────────┘
```


***

### 3.2 GitHub Actions Workflows

#### **Workflow 1: PR Checks** (`.github/workflows/pr-checks.yml`)

```yaml
name: PR Checks

on:
  pull_request:
    branches: [main, staging, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npm run format:check
      
      - name: TypeScript type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
      
      - name: Check bundle size
        run: |
          size=$(du -sh dist | cut -f1)
          echo "Bundle size: $size"
          # Add bundle size check logic here

  security-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```


***

#### **Workflow 2: Deploy to Staging** (`.github/workflows/deploy-staging.yml`)

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          VITE_ENV: staging
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.ninjagenzy.com
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://staging.ninjagenzy.com
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Staging deployed successfully",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n:rocket: <https://staging.ninjagenzy.com|staging.ninjagenzy.com>\nCommit: ${{ github.sha }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```


***

#### **Workflow 3: Deploy to Production** (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch: # Manual trigger option

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Requires approval (optional)
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
          VITE_ENV: production
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: app.ninjagenzy.com
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://app.ninjagenzy.com
      
      - name: Monitor error rate
        run: |
          sleep 60 # Wait 1 minute
          # Check Sentry for error spike (API call)
          # If error rate > 2%, trigger rollback
      
      - name: Notify Slack (Success)
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚀 Production deployed successfully",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment*\n:white_check_mark: <https://app.ninjagenzy.com|app.ninjagenzy.com>\nVersion: ${{ github.ref_name }}\nAuthor: ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
      
      - name: Notify Slack (Failure)
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Production deployment failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Failed*\n:x: Check logs: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View workflow>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```


***

### 3.3 Database Migrations (Supabase)

**Migration Strategy:**

1. **Write migration SQL** في `supabase/migrations/`
2. **Test locally** مع Supabase CLI
3. **Apply to staging** manually (review changes)
4. **Apply to production** بعد QA approval

**Example Migration File:** `supabase/migrations/20260124_add_focus_sessions.sql`

```sql
-- Phase 3: Smart Work System
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  work_minutes INTEGER DEFAULT 90,
  break_minutes INTEGER DEFAULT 15,
  status TEXT CHECK (status IN ('running', 'break', 'completed')) DEFAULT 'running',
  break_snoozed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_status ON focus_sessions(status);

-- Enable RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions"
ON focus_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage own sessions"
ON focus_sessions FOR ALL
USING (user_id = auth.uid());
```

**Apply Migration:**

```bash
# Staging
supabase db push --project-ref staging-ref

# Production (after approval)
supabase db push --project-ref prod-ref
```


***

## 4. Secrets Management

### 4.1 Secrets Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    SECRETS STORAGE                          │
│                                                             │
│  GitHub Secrets (CI/CD)                                     │
│  ├── VERCEL_TOKEN                                           │
│  ├── VERCEL_ORG_ID                                          │
│  ├── VERCEL_PROJECT_ID                                      │
│  ├── STAGING_SUPABASE_URL                                   │
│  ├── STAGING_SUPABASE_ANON_KEY                              │
│  ├── PROD_SUPABASE_URL                                      │
│  ├── PROD_SUPABASE_ANON_KEY                                 │
│  ├── SLACK_WEBHOOK_URL                                      │
│  └── SNYK_TOKEN                                             │
│                                                             │
│  Vercel Environment Variables (Runtime)                     │
│  ├── VITE_SUPABASE_URL (public)                            │
│  ├── VITE_SUPABASE_ANON_KEY (public)                       │
│  └── VITE_ENV (public: development/staging/production)     │
│                                                             │
│  Supabase Vault (Backend secrets)                          │
│  ├── OPENAI_API_KEY (for سَنَد AI)                         │
│  ├── META_APP_SECRET (for Ads API)                         │
│  ├── GOOGLE_ADS_CLIENT_SECRET                               │
│  ├── SENDGRID_API_KEY (for emails)                         │
│  └── STRIPE_SECRET_KEY (for payments)                      │
└─────────────────────────────────────────────────────────────┘
```

**Security Rules:**

- ❌ Never commit secrets to Git
- ✅ Use `.env.example` (placeholder values only)
- ✅ Rotate secrets every 90 days
- ✅ Use environment-specific secrets (staging ≠ production)
- ✅ Encrypt secrets at rest (Supabase Vault uses AES-256)

***

### 4.2 Environment Variables Template

**`.env.example`** (committed to Git):

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Environment
VITE_ENV=development

# Feature Flags
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_ADS_MONITORING=false
```

**`.env.local`** (developer's local machine - not committed):

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci...local_key
VITE_ENV=development
```


***

## 5. Monitoring \& Observability

### 5.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    MONITORING LAYERS                        │
│                                                             │
│  Layer 1: Error Tracking (Sentry)                           │
│  ├── Frontend errors (React crashes, API failures)         │
│  ├── Backend errors (Edge Function exceptions)             │
│  ├── Source maps uploaded (for stack traces)               │
│  └── Alert: Slack notification if error rate > 1%          │
│                                                             │
│  Layer 2: Performance (Vercel Analytics)                    │
│  ├── Page load times (Core Web Vitals)                     │
│  ├── API response times                                     │
│  ├── Largest Contentful Paint (LCP)                        │
│  └── First Input Delay (FID)                               │
│                                                             │
│  Layer 3: Infrastructure (Supabase Dashboard)               │
│  ├── Database CPU, memory, connections                     │
│  ├── Storage usage                                          │
│  ├── API request rate                                       │
│  └── Realtime connections (WebSocket)                      │
│                                                             │
│  Layer 4: Uptime (UptimeRobot)                              │
│  ├── Check every 5 minutes: https://app.ninjagenzy.com    │
│  ├── Check API health: /api/health                         │
│  └── Alert via email + Slack if down                       │
│                                                             │
│  Layer 5: Logs (Supabase Logs + Vercel Logs)               │
│  ├── Application logs (console.log, console.error)         │
│  ├── Access logs (HTTP requests)                           │
│  ├── Database query logs (slow queries)                    │
│  └── Retention: 7 days (staging), 30 days (production)    │
└─────────────────────────────────────────────────────────────┘
```


***

### 5.2 Sentry Configuration

**`src/lib/sentry.ts`:**

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session replay (for debugging)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove passwords, tokens from logs
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
  
  // Ignore expected errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ]
});
```


***

### 5.3 Health Check Endpoint

**Edge Function:** `supabase/functions/health/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  );
  
  // Check database connection
  const { error: dbError } = await supabase
    .from('health_check')
    .select('*')
    .limit(1);
  
  const health = {
    status: dbError ? 'unhealthy' : 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbError ? 'down' : 'up',
      storage: 'up', // Add storage check if needed
      realtime: 'up' // Add realtime check if needed
    }
  };
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  return new Response(
    JSON.stringify(health),
    { 
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  );
});
```

**Check URL:** `https://[project-ref].supabase.co/functions/v1/health`

***

### 5.4 Alert Configuration

**Slack Alerts (via webhooks):**


| Condition | Severity | Notification |
| :-- | :-- | :-- |
| Error rate > 1% for 5 min | 🔴 Critical | @channel in \#incidents |
| Error rate > 0.5% for 10 min | 🟡 Warning | \#engineering (no ping) |
| API response time > 3s (p95) | 🟡 Warning | \#engineering |
| Database CPU > 80% for 5 min | 🟡 Warning | \#devops |
| Uptime check fails (2x in row) | 🔴 Critical | @channel in \#incidents |
| Deployment failed | 🟡 Warning | \#deployments |
| Deployment succeeded | 🟢 Info | \#deployments |


***

## 6. Backup \& Disaster Recovery

### 6.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKUP LAYERS                            │
│                                                             │
│  Layer 1: Database (Supabase automated)                     │
│  ├── Frequency: Daily (2 AM UTC)                           │
│  ├── Retention: 7 days (Free), 30 days (Pro)              │
│  ├── Point-in-time recovery: Available (Pro+)              │
│  └── Manual backup: Via Supabase CLI                       │
│                                                             │
│  Layer 2: Storage/Files (S3 versioning)                     │
│  ├── Frequency: On every upload (automatic)                │
│  ├── Retention: 30 days (old versions)                     │
│  └── Recovery: Restore previous version                    │
│                                                             │
│  Layer 3: Code (Git)                                        │
│  ├── Repository: GitHub (cloud + local clones)             │
│  ├── Branches: main, staging, develop (protected)          │
│  └── Tags: Release versions (v1.0.0, v1.1.0, etc.)        │
│                                                             │
│  Layer 4: Configuration (Infrastructure as Code)            │
│  ├── Vercel config: vercel.json (in Git)                  │
│  ├── Supabase config: supabase/config.toml (in Git)       │
│  └── GitHub Actions: .github/workflows/*.yml (in Git)      │
└─────────────────────────────────────────────────────────────┘
```


***

### 6.2 Manual Backup Commands

**Backup Database:**

```bash
# Full database dump
supabase db dump --project-ref prod-ref > backup_$(date +%Y%m%d).sql

# Specific table
supabase db dump --project-ref prod-ref --table tasks > tasks_backup.sql
```

**Restore Database:**

```bash
# Restore full backup (CAUTION!)
psql -h db.xxx.supabase.co -U postgres -d postgres < backup_20260124.sql

# Restore single table
psql -h db.xxx.supabase.co -U postgres -d postgres < tasks_backup.sql
```


***

### 6.3 Disaster Recovery Scenarios

#### **Scenario 1: Bad Deployment (Code Bug)**

**Problem:** Production deployment introduced critical bug

**Recovery Time:** 2-5 minutes

**Steps:**

1. **Immediate:** Vercel instant rollback

```bash
vercel rollback app.ninjagenzy.com
```

Or via Vercel Dashboard: Click "Rollback" on previous deployment
2. **Fix:** Developer fixes bug locally
3. **Deploy:** Push fix to staging → test → merge to main

**Status:** ✅ Zero downtime (previous version still running)

***

#### **Scenario 2: Database Corruption**

**Problem:** Database table corrupted or accidentally deleted

**Recovery Time:** 15-30 minutes

**Steps:**

1. **Stop writes:** Enable maintenance mode (redirect to static page)
2. **Restore:** Point-in-time recovery via Supabase Dashboard
    - Select timestamp before corruption
    - Restore to new database
3. **Verify:** Check data integrity
4. **Switch:** Update connection string to new database
5. **Resume:** Disable maintenance mode

**Status:** ⚠️ Brief downtime (15-30 min)

***

#### **Scenario 3: Complete Infrastructure Failure (AWS outage)**

**Problem:** Supabase region down (extremely rare)

**Recovery Time:** 1-2 hours

**Steps:**

1. **Assess:** Check AWS status page + Supabase status
2. **Communicate:** Post status update to users
3. **Restore:**
    - Option A: Wait for AWS/Supabase recovery (likely fastest)
    - Option B: Migrate to new Supabase project in different region
4. **Restore data:** From latest backup
5. **Update DNS:** Point to new infrastructure

**Status:** 🔴 Extended downtime (follow AWS SLA)

***

### 6.4 Recovery Time Objectives (RTO/RPO)

| Scenario | RTO (Recovery Time) | RPO (Data Loss) |
| :-- | :-- | :-- |
| Bad deployment | 2-5 minutes | 0 (rollback) |
| Edge Function failure | 5-10 minutes | 0 (redeploy) |
| Database corruption | 15-30 minutes | < 1 hour (point-in-time) |
| Complete infrastructure failure | 1-2 hours | < 24 hours (daily backup) |
| Malicious data deletion | 30-60 minutes | < 24 hours (restore from backup) |


***

## 7. Security Practices

### 7.1 Security Checklist (Pre-deployment)

```
✅ Secrets & Credentials
  ├── No hardcoded secrets in code
  ├── Environment variables properly set
  ├── API keys rotated (if needed)
  └── Supabase RLS policies tested

✅ Dependencies
  ├── npm audit shows no critical vulnerabilities
  ├── Snyk scan passed
  └── Dependencies up to date (patch versions)

✅ Code Quality
  ├── ESLint + Prettier checks passed
  ├── TypeScript strict mode enabled
  ├── No console.log in production (except errors)
  └── No commented-out code

✅ Authentication & Authorization
  ├── JWT tokens expire (default: 1h)
  ├── Refresh tokens secure (httpOnly cookies)
  ├── RLS policies tested with multiple users
  └── Client portal properly isolated

✅ Input Validation
  ├── Zod schemas on all forms
  ├── API endpoints validate input
  ├── SQL injection protected (Supabase)
  └── XSS protection (React auto-escapes)

✅ Network Security
  ├── HTTPS enforced (TLS 1.3)
  ├── CORS configured (allowed origins only)
  ├── CSP headers set (Content-Security-Policy)
  └── Rate limiting enabled

✅ Compliance
  ├── GDPR: User data export/deletion available
  ├── Privacy policy updated
  ├── Terms of service reviewed
  └── Cookie consent (if EU users)
```


***

### 7.2 Penetration Testing (Phase 5)

**Frequency:** Annual (before SOC 2 audit)

**Scope:**

- Authentication bypass attempts
- Authorization (RLS) bypass tests
- SQL injection tests
- XSS/CSRF tests
- API rate limit tests
- File upload vulnerabilities

**Tools:**

- OWASP ZAP (automated scanning)
- Burp Suite (manual testing)
- Third-party security firm (for certification)

***

## 8. Performance Optimization

### 8.1 Frontend Optimizations

```yaml
Code Splitting:
  - React.lazy() for routes
  - Dynamic imports for heavy components
  - Separate vendor bundle (node_modules)

Caching:
  - React Query: 5 min stale time for lists
  - Service Worker: Cache static assets
  - CDN: 1 year cache for immutable assets

Image Optimization:
  - WebP format (with fallback to PNG)
  - Lazy loading (IntersectionObserver)
  - Responsive images (srcset)
  - Supabase Storage auto-resize

Bundle Size:
  - Tree shaking (Vite automatic)
  - Remove unused dependencies
  - Analyze bundle: npm run build --analyze
  - Target: < 500KB initial load

Critical Rendering Path:
  - Inline critical CSS (above-the-fold)
  - Defer non-critical JS
  - Preload fonts
  - Prefetch next pages
```


***

### 8.2 Database Optimizations

```sql
-- Indexes for common queries
CREATE INDEX idx_tasks_status_deadline ON tasks(status, deadline);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- Materialized views for analytics
CREATE MATERIALIZED VIEW workspace_daily_stats AS
SELECT 
  workspace_id,
  DATE(created_at) as date,
  COUNT(*) as tasks_created,
  COUNT(*) FILTER (WHERE status = 'done') as tasks_completed
FROM tasks
GROUP BY workspace_id, DATE(created_at);

-- Refresh daily via cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-stats', '0 2 * * *', 'REFRESH MATERIALIZED VIEW workspace_daily_stats');

-- Partitioning for large tables (future)
-- CREATE TABLE activity_logs_2026_01 PARTITION OF activity_logs
-- FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```


***

### 8.3 API Optimizations

```typescript
// Batch requests
const { data: tasks } = await supabase
  .from('tasks')
  .select(`
    *,
    project:projects(name),
    assigned_user:user_profiles(full_name, avatar_url)
  `);

// Instead of multiple requests:
// 1. Get tasks
// 2. Get projects for each task
// 3. Get users for each task

// Use Supabase's join syntax for single request
```


***

## 9. Scaling Strategy

### 9.1 Scaling Triggers

| Metric | Current | Trigger Action | Target |
| :-- | :-- | :-- | :-- |
| **Users** | 500 | At 5,000 → Upgrade Supabase | 10,000+ |
| **Database CPU** | 30% | At 70% → Add read replica | < 60% |
| **API Requests/min** | 500 | At 5,000 → Rate limit review | 10,000+ |
| **Storage** | 10GB | At 80GB → Upgrade plan | 500GB+ |
| **Realtime Connections** | 100 | At 800 → Optimize subscriptions | 2,000+ |


***

### 9.2 Horizontal Scaling Plan

**Phase 1-3 (Current):** Single Supabase instance

- ✅ Sufficient for 1,000-5,000 users
- ✅ Vercel auto-scales frontend

**Phase 4-5 (10K+ users):**

- Read replicas for database (Supabase Enterprise)
- CDN for static assets (already using Cloudflare)
- Edge Functions auto-scale (Supabase built-in)

**Phase 6 (Future - 100K+ users):**

- Multi-region deployment
- Database sharding (by agency)
- Dedicated Supabase instances per region

***

## 10. DevOps Team Runbook

### 10.1 Daily Operations

**Morning Checklist:**

```bash
1. Check production health
   - Vercel Dashboard: No errors?
   - Supabase Dashboard: Database healthy?
   - Sentry: Error rate < 0.5%?
   - UptimeRobot: All green?

2. Review overnight deployments
   - Any staging deployments?
   - Any production hotfixes?

3. Check monitoring alerts
   - Slack #incidents: Any critical alerts?
   - Email: Any downtime notifications?

4. Review open PRs
   - Any PRs waiting for CI to pass?
   - Any PRs ready to merge?
```


***

### 10.2 Deployment Checklist

**Before Production Deploy:**

```
□ All CI checks passed (green)
□ Staging tested and approved by QA
□ Database migrations applied to staging (if any)
□ No critical Sentry errors in staging (last 24h)
□ Changelog updated (what's new?)
□ Team notified in #deployments channel
□ Deployment window scheduled (avoid peak hours)
□ Rollback plan ready (Vercel instant rollback)
```

**After Production Deploy:**

```
□ Health check passed (GET /api/health)
□ Smoke tests passed (login, dashboard, API call)
□ Monitor Sentry for 15 minutes (error rate < 1%)
□ Notify team: "Deployment complete"
□ Tag release in Git (git tag v1.2.3)
□ Update status page (if public-facing)
```


***

### 10.3 Incident Response

**Severity Levels:**


| Level | Description | Response Time | Example |
| :-- | :-- | :-- | :-- |
| **P0 - Critical** | Platform down | 5 min | Database unreachable, login broken |
| **P1 - High** | Major feature broken | 30 min | Tasks not loading, files not uploading |
| **P2 - Medium** | Minor feature broken | 2 hours | Analytics slow, notification delay |
| **P3 - Low** | Cosmetic issue | Next sprint | Button misaligned, typo |

**Incident Response Steps (P0/P1):**

```
1. Acknowledge (2 min)
   - Post in #incidents: "Investigating [issue]"
   - Notify on-call engineer

2. Assess (5 min)
   - Check Sentry, Vercel, Supabase logs
   - Identify root cause

3. Mitigate (10 min)
   - Option A: Rollback deployment
   - Option B: Hotfix deploy
   - Option C: Enable maintenance mode

4. Communicate (ongoing)
   - Update #incidents every 15 min
   - Update status page (if public)
   - Notify affected customers (if needed)

5. Resolve
   - Deploy fix to staging → test → production
   - Verify issue resolved
   - Post-incident review (within 48h)

6. Post-mortem
   - Document: What happened, why, how fixed
   - Action items: Prevent recurrence
   - Share with team
```


***

**🎉 DevOps Document Complete!**

**التالي؟**

1. **Testing Strategy** (unit, integration, e2e tests)
2. **Team Onboarding Guide** (للـ developers الجدد)
3. **Performance Benchmarks** (target metrics)

أي واحد نكمل بيه؟ 🚀
<span style="display:none">[^1][^10][^11][^12][^13][^14][^15][^16][^17][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: Pricing page.md

[^2]: Pricing Model.md

[^3]: PHASE 5 (تكملة).md

[^4]: PHASE 5 — SCALE \& ENTERPRISE (Month 11-14).md

[^5]: PHASE 4.2 Mockup Preview System.md

[^6]: PHASE 4.1 — ADVANCED \& INTEGRATIONS.md

[^7]: PHASE 3.3 (Complete) — PRODUCTIVITY \& CULTURE.md

[^8]: Phase 3.2 UX Features.md

[^9]: PHASE 3 — Productivity \& Culture (Month 6–7).md

[^10]: 3. Basic Analytics Dashboard.md
[^11]: 2. CLIENT \& TEAM ENHANCEMENT.md
[^12]: 1 (UPDATED) - FOUNDATION.md

[^13]: Technical Details, Features \& Implem.md

[^14]: Product Vision Document1.2.md

[^15]: Product Vision Document1.1.md

[^16]: PART 3_ SYSTEM DESIGN (تكملة).md

[^17]: PART 3_ COMPLETE SYSTEM DESIGN.md

