---
title: "Technical Requirements Specification (TRS)"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "Database Design Document"
  - "Integration Specifications"
  - "User Flow Diagrams"
priority: "P1"
estimated_implementation_time: "N/A (Requirements)"
---

# Technical Requirements Specification — Ninja Gen Z Platform

## TL;DR

This document defines **functional and non-functional requirements** for the Ninja Gen Z platform, structured by **Phase 1-5** implementation priorities. Functional requirements cover task management, client portal, prayer reminders, AI assistant, and ads monitoring. Non-functional requirements set **performance targets** (LCP < 2.5s, API response < 500ms), **scalability limits** (10,000 agencies, 100,000 tasks/agency), **availability SLA** (99.9% uptime), and **security baselines** (WCAG 2.1 AA, SOC 2 compliance). All requirements include **acceptance criteria** with clear pass/fail metrics for QA testing.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Functional Requirements (Phase 1)](#2-functional-requirements-phase-1)
- [3. Functional Requirements (Phase 2-4)](#3-functional-requirements-phase-2-4)
- [4. Non-Functional Requirements](#4-non-functional-requirements)
- [5. API Contracts](#5-api-contracts)
- [6. Data Requirements](#6-data-requirements)
- [7. Integration Requirements](#7-integration-requirements)
- [8. Acceptance Criteria](#8-acceptance-criteria)
- [9. Next Steps](#9-next-steps)
- [10. References](#10-references)
- [11. Changelog](#11-changelog)

---

## 1. Overview

### 1.1 Purpose

This Technical Requirements Specification (TRS) defines:
- **What the system must do** (functional requirements)
- **How well it must perform** (non-functional requirements)
- **How components interact** (API contracts)
- **When requirements are satisfied** (acceptance criteria)

### 1.2 Scope

**In Scope:** Phase 1-4 features  
**Out of Scope:** Phase 5 enterprise features (documented separately)

### 1.3 Requirement Prioritization

| Priority | Label | Definition |
|:---------|:------|:-----------|
| **P0** | Must Have | Blocks launch if missing |
| **P1** | Should Have | Important but launch possible without |
| **P2** | Nice to Have | Improves UX but not critical |

---

## 2. Functional Requirements (Phase 1)

### FR-1: User Authentication

**ID:** FR-1  
**Priority:** P0  
**Owner:** Authentication Module

**Description:** Users must be able to create accounts and authenticate using magic links.

**Requirements:**
- **FR-1.1:** System shall send magic link to user's email upon signup
- **FR-1.2:** Magic link shall expire after 15 minutes
- **FR-1.3:** System shall create JWT token upon successful authentication
- **FR-1.4:** JWT shall include claims: `user_id`, `agency_id`, `role`
- **FR-1.5:** Sessions shall persist for 7 days (refresh token)

**Acceptance Criteria:**
```gherkin
Given a new user enters email "user@example.com"
When they click "Sign Up"
Then they receive an email with a magic link within 30 seconds
And clicking the link authenticates them
And they are redirected to the onboarding wizard
```

---

### FR-2: Agency Provisioning

**ID:** FR-2  
**Priority:** P0  
**Owner:** Onboarding Module

**Description:** System must create isolated tenants (agencies) with default workspace.

**Requirements:**
- **FR-2.1:** System shall create agency record in `agencies` table
- **FR-2.2:** System shall assign user as `owner` role in `user_roles`
- **FR-2.3:** System shall create default workspace named "Workspace افتراضي"
- **FR-2.4:** System shall grant workspace access to owner
- **FR-2.5:** All operations shall execute in a database transaction

**Acceptance Criteria:**
```gherkin
Given an authenticated user without an agency
When they complete the onboarding wizard
Then an agency is created with:
  | Field      | Value                  |
  | name       | User-provided name     |
  | slug       | Auto-generated         |
  | owner_id   | Current user ID        |
And a workspace is created and linked to the agency
And the user has 'owner' role
```

---

### FR-3: Task Management

**ID:** FR-3  
**Priority:** P0  
**Owner:** Task Module

**Description:** Users must be able to create, assign, update, and track tasks.

**Requirements:**
- **FR-3.1:** Team leaders and owners can create tasks
- **FR-3.2:** Tasks must have: title, description (optional), assigned user, status, priority, deadline
- **FR-3.3:** Task statuses: `todo`, `in_progress`, `review`, `done`
- **FR-3.4:** Task priorities: `high`, `medium`, `low`
- **FR-3.5:** System shall notify assignee when task is created or updated
- **FR-3.6:** System shall log all task changes in `activity_logs`

**Acceptance Criteria:**
```gherkin
Given a team leader in a workspace
When they create a task with title "Design Instagram post"
And assign it to team member "Ahmed"
And set priority to "high"
Then the task is saved to the database
And Ahmed receives a real-time notification
And an activity log entry is created with action="created"
```

---

### FR-4: Multi-Tenant Isolation

**ID:** FR-4  
**Priority:** P0  
**Owner:** Security Module

**Description:** System must prevent cross-tenant data access using RLS.

**Requirements:**
- **FR-4.1:** All tables with `agency_id` shall have RLS enabled
- **FR-4.2:** Users shall only access data from their own agency
- **FR-4.3:** RLS policies shall filter queries automatically
- **FR-4.4:** System shall return 0 rows (not error) for unauthorized queries
- **FR-4.5:** RLS bypassed only by service role (backend functions)

**Acceptance Criteria:**
```gherkin
Given User A belongs to Agency 1
And User B belongs to Agency 2
When User A queries tasks
Then User A sees only Agency 1 tasks
And User A does NOT see Agency 2 tasks
```

---

## 3. Functional Requirements (Phase 2-4)

### FR-10: Client Approval Workflow

**ID:** FR-10  
**Priority:** P0 (Phase 2)  
**Owner:** Client Portal Module

**Description:** Clients must be able to review and approve/reject task deliverables.

**Requirements:**
- **FR-10.1:** Clients can view tasks in "review" status
- **FR-10.2:** Clients can download attached files
- **FR-10.3:** Clients can approve tasks (changes status to "done")
- **FR-10.4:** Clients can request revisions (changes status to "in_progress" + adds comment)
- **FR-10.5:** Team is notified of client decision in real-time

**Acceptance Criteria:**
```gherkin
Given a client user logs into portal
And a task is in "review" status
When they click "Approve"
Then task status changes to "done"
And team leader receives notification
And activity log records approval
```

---

### FR-15: Prayer Time Reminders

**ID:** FR-15  
**Priority:** P1 (Phase 3)  
**Owner:** Culture Module

**Description:** Muslim users must receive prayer time notifications.

**Requirements:**
- **FR-15.1:** Users can enable prayer reminders in settings
- **FR-15.2:** Users select city for accurate prayer times
- **FR-15.3:** System fetches daily prayer times from AlAdhan API
- **FR-15.4:** System sends browser notification 15 minutes before each prayer
- **FR-15.5:** Optional: Screen lock overlay for 15 minutes during prayer time

**Acceptance Criteria:**
```gherkin
Given a user in Cairo, Egypt
And prayer reminders enabled
When Dhuhr prayer time is at 12:30 PM
Then user receives notification at 12:15 PM
And if screen lock enabled, overlay appears at 12:30 PM
And overlay disappears after 15 minutes
```

---

### FR-20: Meta Ads Monitoring

**ID:** FR-20  
**Priority:** P0 (Phase 4)  
**Owner:** Integrations Module

**Description:** System must sync campaign data from Meta Ads API.

**Requirements:**
- **FR-20.1:** Users can connect Meta Ads account via OAuth 2.0
- **FR-20.2:** System stores access/refresh tokens in encrypted format
- **FR-20.3:** System syncs campaigns daily at 3:00 AM UTC
- **FR-20.4:** Dashboard displays: spend, impressions, clicks, conversions
- **FR-20.5:** System handles rate limits (max 200 calls/hour)

**Acceptance Criteria:**
```gherkin
Given user connects Meta Ads account
When OAuth flow completes successfully
Then access token is encrypted and stored
And system fetches ad accounts
And daily sync cron job runs at 3:00 AM
And dashboard displays campaign metrics
```

---

## 4. Non-Functional Requirements

### NFR-1: Performance

**ID:** NFR-1  
**Priority:** P0

**Requirements:**

| Metric | Target | Measurement |
|:-------|:-------|:------------|
| **Page Load Time** | < 2.5s (LCP) | 75th percentile |
| **API Response Time** | < 500ms | 95th percentile |
| **Database Query Time** | < 100ms | 95th percentile |
| **Time to Interactive** | < 3.5s | 75th percentile |
| **Bundle Size** | < 500KB | Initial JS (gzip) |

**Acceptance Criteria:**
```
When running Lighthouse audit on dashboard page
Then Performance score >= 90
And LCP < 2.5s
And FID < 100ms
And CLS < 0.1
```

---

### NFR-2: Scalability

**ID:** NFR-2  
**Priority:** P1

**Requirements:**

| Dimension | Limit | Notes |
|:----------|:------|:------|
| **Max Agencies** | 10,000 | Free + Pro tiers |
| **Max Users per Agency** | 500 | Enterprise tier: unlimited |
| **Max Tasks per Project** | 10,000 | Pagination required |
| **Max File Size** | 50 MB | Per upload |
| **Max Concurrent Users** | 5,000 | Real-time connections |

**Acceptance Criteria:**
```
When 1,000 users access the platform simultaneously
Then all users experience < 500ms API response time
And real-time notifications deliver within 1 second
```

---

### NFR-3: Availability

**ID:** NFR-3  
**Priority:** P0

**Requirements:**
- **NFR-3.1:** System uptime: **99.9%** (8.76 hours downtime/year)
- **NFR-3.2:** Recovery Time Objective (RTO): **1 hour**
- **NFR-3.3:** Recovery Point Objective (RPO): **24 hours** (daily backups)
- **NFR-3.4:** Database backups: Daily at 2:00 AM UTC
- **NFR-3.5:** Rollback capability: Instant (Vercel keeps 10 previous deployments)

**Acceptance Criteria:**
```
Given a production outage occurs
When incident is detected
Then system is restored within 1 hour
And data loss is <= 24 hours
```

---

### NFR-4: Security

**ID:** NFR-4  
**Priority:** P0

**Requirements:**
- **NFR-4.1:** All data in transit encrypted with TLS 1.3
- **NFR-4.2:** Sensitive columns (API tokens) encrypted at rest (AES-256)
- **NFR-4.3:** Passwords hashed with bcrypt (cost factor 12)
- **NFR-4.4:** JWTs signed with RS256 algorithm
- **NFR-4.5:** Rate limiting: 100 requests/minute per user
- **NFR-4.6:** SQL injection prevention: Parameterized queries only
- **NFR-4.7:** XSS prevention: React auto-escaping + CSP headers

**Acceptance Criteria:**
```
When running OWASP ZAP security scan
Then no critical vulnerabilities found
And all data transfers use HTTPS
And API tokens stored encrypted in database
```

---

### NFR-5: Accessibility

**ID:** NFR-5  
**Priority:** P0

**Requirements:**
- **NFR-5.1:** WCAG 2.1 AA compliance
- **NFR-5.2:** Color contrast ratio: 4.5:1 (normal text), 3:1 (large text)
- **NFR-5.3:** Keyboard navigation: All interactive elements reachable via Tab
- **NFR-5.4:** Screen reader support: ARIA labels on icon-only buttons
- **NFR-5.5:** Reduced motion support: Respect `prefers-reduced-motion`

**Acceptance Criteria:**
```
When running aXe DevTools audit
Then no critical accessibility violations
And all form inputs have labels
And focus indicators visible
```

---

## 5. API Contracts

### API-1: Create Task

**Endpoint:** `POST /rest/v1/tasks`  
**Authentication:** Required (JWT)  
**Authorization:** Team Leader, Owner

**Request:**
```json
{
  "title": "Design Instagram post",
  "description": "Create a post for Ramadan campaign",
  "project_id": "uuid",
  "assigned_to": "uuid",
  "status": "todo",
  "priority": "high",
  "deadline": "2026-02-01T23:59:59Z",
  "estimated_hours": 3.5
}
```

**Response (201 Created):**
```json
{
  "id": "task-uuid",
  "title": "Design Instagram post",
  "status": "todo",
  "created_at": "2026-01-24T10:30:00Z",
  "created_by": "user-uuid"
}
```

**Errors:**
- `400 Bad Request`: Missing required field (title, project_id)
- `403 Forbidden`: User lacks permission to create tasks
- `404 Not Found`: Project not found or not in user's workspace

---

### API-2: Update Task Status

**Endpoint:** `PATCH /rest/v1/tasks/{task_id}`  
**Authentication:** Required  
**Authorization:** Assignee, Team Leader, Owner

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response (200 OK):**
```json
{
  "id": "task-uuid",
  "status": "in_progress",
  "updated_at": "2026-01-24T11:00:00Z"
}
```

---

### API-3: Fetch Prayer Times

**Endpoint:** `GET /functions/v1/prayer-times`  
**Authentication:** Required  
**Query Params:** `?city=Cairo&country=Egypt&date=2026-01-24`

**Response (200 OK):**
```json
{
  "date": "2026-01-24",
  "timings": {
    "Fajr": "05:12",
    "Dhuhr": "12:30",
    "Asr": "15:42",
    "Maghrib": "17:55",
    "Isha": "19:15"
  },
  "source": "AlAdhan API"
}
```

---

## 6. Data Requirements

### DR-1: Data Retention

| Data Type | Retention Period | Deletion Method |
|:----------|:-----------------|:----------------|
| **User data** | Until account deletion | Soft delete (30-day grace) |
| **Activity logs** | 2 years | Auto-purge after 2 years |
| **Files** | Until manual deletion | Soft delete (7-day grace) |
| **Backups** | 30 days | Auto-delete old backups |

### DR-2: Data Export (GDPR)

**Requirement:** Users must be able to export all their data in JSON format.

**Data Included:**
- User profile
- Tasks created/assigned
- Comments
- Files uploaded
- Activity logs

**Format:** JSON file downloadable via Edge Function.

---

## 7. Integration Requirements

### IR-1: Meta Ads API

**Version:** Graph API v19.0  
**Authentication:** OAuth 2.0  
**Scopes Required:** `ads_read`, `business_management`, `read_insights`

**Data Sync Frequency:** Daily at 3:00 AM UTC  
**Rate Limit:** 200 calls/hour  
**Error Handling:** Exponential backoff (retry after 5s, 15s, 45s)

---

### IR-2: AlAdhan Prayer Times API

**Version:** v1  
**Authentication:** None (public API)  
**Endpoint:** `https://api.aladhan.com/v1/timingsByCity`

**Caching Strategy:** Cache daily prayer times at 3:00 AM  
**Fallback:** Return cached times if API unavailable

---

## 8. Acceptance Criteria

### Phase 1 Launch Criteria

**Must Pass All:**
- [ ] User can sign up with magic link
- [ ] Agency provisioning creates isolated tenant
- [ ] Task CRUD operations work
- [ ] RLS prevents cross-tenant access
- [ ] Real-time notifications deliver within 1 second
- [ ] Lighthouse Performance score >= 90
- [ ] Zero critical security vulnerabilities (OWASP scan)
- [ ] 70% test coverage

---

### Phase 2 Launch Criteria

**Must Pass All:**
- [ ] Client can log into portal
- [ ] Client can approve/reject tasks
- [ ] File uploads work (max 50MB)
- [ ] Brand kit storage and retrieval
- [ ] Client sees only their own projects (RLS)

---

### Phase 4 Launch Criteria

**Must Pass All:**
- [ ] Meta Ads OAuth flow completes
- [ ] Campaign data syncs daily
- [ ] Google Ads integration works
- [ ] Prayer reminders send notifications
- [ ] Mockup previews generate correctly

---

## 9. Next Steps

- [ ] Review TRS with product team for completeness
- [ ] Create test cases for each acceptance criterion
- [ ] Set up automated testing for API contracts
- [ ] Define Phase 5 requirements (enterprise features)
- [ ] Create traceability matrix (requirements → tests)

---

## 10. References

- [Database Design Document](file:///e:/docs/docs/Technical%20Documentation/Database-Design-Document.md)
- [Integration Specifications](file:///e:/docs/docs/Technical%20Documentation/Integration-Specifications.md)
- [User Flow Diagrams](file:///e:/docs/docs/Technical%20Documentation/User-Flow-Diagrams.md)
- [Security & Compliance Document](file:///e:/docs/docs/Technical%20Documentation/Security-Compliance-Document.md)

---

## 11. Changelog

- **v1.0** (2026-01-24): Initial Technical Requirements Specification
  - Functional requirements for Phase 1-4
  - Non-functional requirements (performance, scalability, security)
  - API contracts for task management and integrations
  - Data retention and GDPR export requirements
  - Integration requirements for Meta Ads and AlAdhan
  - Acceptance criteria for Phase 1, 2, and 4 launches
