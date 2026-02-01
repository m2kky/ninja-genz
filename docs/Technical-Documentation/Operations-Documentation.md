---
title: "Operations Documentation"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "DevOps & Infrastructure Document"
  - "Development Standards Document"
  - "Security & Compliance Document"
priority: "P2"
estimated_implementation_time: "N/A (Operational Guide)"
---

# Operations Documentation — Ninja Gen Z Platform

## TL;DR

This document provides operational runbooks for deploying, monitoring, and maintaining the Ninja Gen Z platform. Deployment follows a **staging → production** flow using GitHub Actions, with automatic deployments triggered by branch merges. Database migrations are applied manually via Supabase CLI with rollback procedures. Incident response follows a **P0-P3 severity model** with escalation paths and response time SLAs (P0: 15 min, P1: 1 hour). Monitoring uses **Sentry** for errors, **Vercel Analytics** for performance, and **Supabase Dashboard** for infrastructure. Rollback procedures support instant frontend revert (<5 min) and database point-in-time recovery (up to 30 days).

---

## Table of Contents

- [1. Deployment Procedures](#1-deployment-procedures)
- [2. Database Migration Guide](#2-database-migration-guide)
- [3. Rollback Procedures](#3-rollback-procedures)
- [4. Incident Response Runbook](#4-incident-response-runbook)
- [5. Monitoring & Alerting](#5-monitoring--alerting)
- [6. Backup & Recovery](#6-backup--recovery)
- [7. Emergency Contacts](#7-emergency-contacts)
- [8. Next Steps](#8-next-steps)
- [9. References](#9-references)
- [10. Changelog](#10-changelog)

---

## 1. Deployment Procedures

### 1.1 Staging Deployment

**Trigger:** Merge to `staging` branch  
**Automated:** Yes (GitHub Actions)  
**Duration:** ~5 minutes

**Steps:**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Create Pull Request to staging
# - PR checks run automatically (lint, test, build)
# - Request review from team member

# 5. Merge PR after approval
# - GitHub Actions automatically deploys to staging
# - URL: https://staging.ninjagenzy.com
```

**Post-Deployment Verification:**
```bash
# Check deployment status
curl https://staging.ninjagenzy.com/api/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-24T10:30:00Z"}

# Run smoke tests
npm run test:smoke -- --env=staging
```

---

### 1.2 Production Deployment

**Trigger:** Merge to `main` branch  
**Automated:** Yes (GitHub Actions)  
**Duration:** ~7 minutes (includes health checks)

**Pre-Deployment Checklist:**
- [ ] All staging tests passed
- [ ] No critical errors in Sentry (staging)
- [ ] Database migrations applied (if any)
- [ ] Environment variables updated (if needed)
- [ ] Team notified of deployment window

**Steps:**
```bash
# 1. Merge staging to main
git checkout main
git pull origin main
git merge staging

# 2. Tag release
git tag -a v1.2.0 -m "Release v1.2.0: New features"
git push origin main --tags

# 3. GitHub Actions deploys automatically
# - Runs CI checks
# - Builds production bundle
# - Deploys to Vercel
# - Runs smoke tests
# - Notifies Slack

# 4. Monitor deployment
# - Watch GitHub Actions logs
# - Check Sentry error rate
# - Verify Core Web Vitals
```

**Post-Deployment Verification:**
```bash
# 1. Health check
curl https://app.ninjagenzy.com/api/health

# 2. Smoke tests
npm run test:smoke -- --env=production

# 3. Monitor for 15 minutes
# - Sentry dashboard: Check error rate < 1%
# - Vercel Analytics: Check LCP < 2.5s
# - Supabase Dashboard: Check API response time < 500ms
```

**Rollback Trigger:**
If error rate > 2% within 15 minutes, initiate rollback.

---

## 2. Database Migration Guide

### 2.1 Creating Migrations

**Tool:** Supabase CLI

```bash
# 1. Create new migration
supabase migration new add_focus_sessions_table

# This creates:
# supabase/migrations/20260124103000_add_focus_sessions_table.sql
```

**2. Write migration SQL:**
```sql
-- supabase/migrations/20260124103000_add_focus_sessions_table.sql

-- Create table
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  work_minutes INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task ON focus_sessions(task_id);

-- Enable RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users view own sessions"
ON focus_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users manage own sessions"
ON focus_sessions FOR ALL
USING (user_id = auth.uid());
```

---

### 2.2 Applying Migrations

**Staging:**
```bash
# 1. Test migration locally
supabase db reset  # Resets local DB
supabase start

# 2. Apply to staging
supabase db push --project-ref staging-project-ref

# 3. Verify tables created
supabase db dump --project-ref staging-project-ref --table focus_sessions
```

**Production:**
```bash
# 1. Backup database first
supabase db dump --project-ref prod-project-ref > backup_$(date +%Y%m%d).sql

# 2. Apply migration
supabase db push --project-ref prod-project-ref

# 3. Verify migration
supabase db remote commit list --project-ref prod-project-ref

# 4. Test application
# - Run smoke tests
# - Check Sentry for errors
# - Verify new features work
```

---

### 2.3 Migration Rollback

**If migration fails:**

```bash
# 1. Connect to database
psql -h db.xxx.supabase.co -U postgres -d postgres

# 2. Manually revert changes
DROP TABLE IF EXISTS focus_sessions;

# 3. Restore from backup (if needed)
psql -h db.xxx.supabase.co -U postgres -d postgres < backup_20260124.sql

# 4. Verify application works
npm run test:smoke
```

**Best Practice:** Always write rollback SQL alongside migration.

---

## 3. Rollback Procedures

### 3.1 Frontend Rollback (Vercel)

**Time to Rollback:** < 5 minutes

**Method 1: Vercel Dashboard**
```
1. Go to https://vercel.com/dashboard
2. Select project: ninjagenzy
3. Click "Deployments" tab
4. Find previous stable deployment
5. Click "..." menu → "Promote to Production"
6. Confirm rollback
```

**Method 2: Vercel CLI**
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Example:
vercel rollback app-ninjagenzy-abc123.vercel.app
```

**Verification:**
```bash
# Check current deployment
vercel inspect app.ninjagenzy.com

# Run smoke tests
npm run test:smoke
```

---

### 3.2 Database Rollback

**Time to Rollback:** 15-30 minutes

**Method 1: Point-in-Time Recovery (Supabase Pro)**
```bash
# Restore to specific timestamp
supabase db restore \
  --project-ref prod-project-ref \
  --time "2026-01-24 09:00:00"
```

**Method 2: Manual Restore from Backup**
```bash
# 1. Download backup
supabase db dump --project-ref prod-project-ref > current_backup.sql

# 2. Restore previous backup
psql -h db.xxx.supabase.co -U postgres -d postgres < backup_20260124.sql

# 3. Verify data
# - Check critical tables (tasks, projects)
# - Run data integrity tests
```

---

## 4. Incident Response Runbook

### 4.1 Incident Severity Levels

| Level | Definition | Response Time | Escalation |
|:------|:-----------|:--------------|:-----------|
| **P0** | Platform down, no users can access | 15 minutes | Immediate, all hands |
| **P1** | Critical feature broken (e.g., login) | 1 hour | Tech lead + on-call |
| **P2** | Major feature degraded (e.g., slow API) | 4 hours | On-call engineer |
| **P3** | Minor bug, workaround available | 1 business day | Normal workflow |

---

### 4.2 P0 Incident Response (Platform Down)

**Symptoms:**
- Health check endpoint returns 503
- Sentry error rate > 50%
- Multiple user reports

**Response Steps:**

**1. Acknowledge (0-5 min)**
```bash
# Post in Slack #incidents
"🚨 P0 INCIDENT: Platform down. Investigating."

# Check status pages
- Vercel: https://www.vercel-status.com/
- Supabase: https://status.supabase.com/

# Check recent deployments
vercel ls
```

**2. Diagnose (5-15 min)**
```bash
# Check Vercel logs
vercel logs app.ninjagenzy.com

# Check Supabase logs
# Go to Supabase Dashboard → Logs

# Check Sentry errors
# Go to Sentry → Issues → Sort by "Last Seen"
```

**3. Mitigate (15-30 min)**
```bash
# If recent deployment caused issue:
vercel rollback <previous-deployment-url>

# If database issue:
# Check connection count, CPU, memory in Supabase Dashboard

# If external API issue (Meta, Google):
# Disable integration temporarily via feature flag
```

**4. Communicate (Ongoing)**
```bash
# Update Slack every 15 minutes
"Update: Rolled back to v1.1.0. Monitoring error rate."

# Notify users (if downtime > 30 min)
# Post on status page or Twitter
```

**5. Resolve & Post-Mortem**
```markdown
# Create post-mortem doc
## Incident: Platform Down (2026-01-24)

**Timeline:**
- 10:30 AM: Deployment v1.2.0
- 10:35 AM: Error rate spike detected
- 10:40 AM: Incident declared P0
- 10:45 AM: Rolled back to v1.1.0
- 10:50 AM: Platform restored

**Root Cause:**
Database migration added column without default value, 
causing INSERT queries to fail.

**Action Items:**
- [ ] Add migration tests (check for breaking changes)
- [ ] Add default values to all new columns
- [ ] Improve staging testing coverage
```

---

## 5. Monitoring & Alerting

### 5.1 Metrics to Monitor

**Frontend (Vercel Analytics):**
- Page load time (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- API response time

**Backend (Supabase Dashboard):**
- Database CPU usage
- Database memory usage
- Active connections
- API request rate
- Storage usage

**Errors (Sentry):**
- Error rate (errors/minute)
- Unique errors
- User impact (affected users)

---

### 5.2 Alert Configuration

**Slack Alerts:**

| Condition | Channel | Mention |
|:----------|:--------|:--------|
| Error rate > 2% | #incidents | @channel |
| API response time > 3s | #engineering | None |
| Database CPU > 80% | #devops | @oncall |
| Deployment failed | #deployments | @team |
| Deployment succeeded | #deployments | None |

**Email Alerts (UptimeRobot):**
- Check: https://app.ninjagenzy.com every 5 minutes
- Alert if down 2x consecutive checks
- Send email to: ops@ninjagenzy.com

---

## 6. Backup & Recovery

### 6.1 Automated Backups

**Database:**
- **Frequency:** Daily at 2:00 AM UTC
- **Retention:** 30 days (Pro plan)
- **Location:** Supabase managed backups
- **Size:** ~500 MB (current)

**Storage/Files:**
- **Frequency:** Continuous (S3 versioning)
- **Retention:** 30 days for old versions
- **Location:** Supabase managed storage

---

### 6.2 Manual Backup

```bash
# Full database backup
supabase db dump --project-ref prod-project-ref > backup_manual_$(date +%Y%m%d).sql

# Specific table backup
supabase db dump --project-ref prod-project-ref --table tasks > tasks_backup.sql

# Verify backup
wc -l backup_manual_20260124.sql  # Check line count
head -20 backup_manual_20260124.sql  # Check content
```

**Store backups:**
- Upload to AWS S3 or Google Drive
- Encrypt with GPG before upload
- Retention: 90 days for manual backups

---

## 7. Emergency Contacts

**On-Call Rotation:** https://oncall.ninjagenzy.com

| Role | Name | Phone | Email |
|:-----|:-----|:------|:------|
| **Tech Lead** | TBD | +20-XXX-XXXX | tech@ninjagenzy.com |
| **DevOps** | TBD | +20-XXX-XXXX | devops@ninjagenzy.com |
| **Security** | TBD | +20-XXX-XXXX | security@ninjagenzy.com |

**External Support:**
- **Vercel Support:** https://vercel.com/support (Pro plan)
- **Supabase Support:** support@supabase.io (Pro plan)
- **Sentry Support:** support@sentry.io

---

## 8. Next Steps

- [ ] Set up on-call rotation (PagerDuty or Opsgenie)
- [ ] Configure Slack webhook alerts
- [ ] Create status page (StatusPage.io or custom)
- [ ] Document common incident scenarios
- [ ] Run disaster recovery drill (quarterly)
- [ ] Set up automated backup verification
- [ ] Create database restore procedure checklist

---

## 9. References

- [DevOps & Infrastructure Document](file:///e:/docs/docs/System%20Architecture/DevOps%20&%20Infrastructure%20Document.md)
- [Security & Compliance Document](file:///e:/docs/docs/Technical%20Documentation/Security-Compliance-Document.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 10. Changelog

- **v1.0** (2026-01-24): Initial operations documentation
  - Deployment procedures (staging → production)
  - Database migration guide with rollback steps
  - Rollback procedures (frontend < 5 min, database 15-30 min)
  - Incident response runbook with P0-P3 severity levels
  - Monitoring & alerting configuration
  - Backup & recovery procedures
  - Emergency contacts and escalation paths
