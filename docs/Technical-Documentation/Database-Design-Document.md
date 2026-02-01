---
title: "Database Design Document"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "System Architecture Document"
  - "Phase 1 Foundation"
priority: "P0"
estimated_implementation_time: "1 week"
---

# Database Design Document — Ninja Gen Z Platform

## TL;DR

This document defines the complete database schema for the Ninja Gen Z platform, a multi-tenant SaaS application for marketing agencies in MENA. The database uses **PostgreSQL 15.x** via Supabase with **Row Level Security (RLS)** for tenant isolation. It includes 14 core tables supporting the hierarchical structure (Agency → Workspace → Client → Project → Task), activity logging, user management, brand kits, notifications, and file attachments. All tables implement `agency_id` or `workspace_id` filtering for multi-tenancy, with comprehensive indexes for performance and foreign keys with `ON DELETE CASCADE` for data integrity.

---

## Table of Contents

- [1. Database Technology Stack](#1-database-technology-stack)
- [2. Entity Relationship Diagram (ERD)](#2-entity-relationship-diagram-erd)
- [3. Complete Table Definitions](#3-complete-table-definitions)
- [4. Indexes Strategy](#4-indexes-strategy)
- [5. Row Level Security (RLS) Policies](#5-row-level-security-rls-policies)
- [6. Migration Strategy](#6-migration-strategy)
- [7. Backup and Recovery Plan](#7-backup-and-recovery-plan)
- [8. Performance Considerations](#8-performance-considerations)
- [9. Next Steps](#9-next-steps)
- [10. References](#10-references)
- [11. Changelog](#11-changelog)

---

## 1. Database Technology Stack

### 1.1 Database Engine

- **Engine:** PostgreSQL 15.x
- **Provider:** Supabase (managed PostgreSQL)
- **Region:** AWS eu-central-1 (closest to MENA)
- **Connection Pooling:** PgBouncer (Supabase built-in)

### 1.2 PostgreSQL Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Encryption for sensitive data
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Full-text search (Arabic + English)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Scheduled jobs (prayer reminders, quotas)
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 1.3 Key Features Used

- **Row Level Security (RLS):** Multi-tenant isolation at database level
- **JSONB Columns:** Flexible storage for `brand_kit`, `custom_properties`
- **Full-Text Search:** Arabic and English content search
- **Materialized Views:** Performance optimization for analytics
- **Triggers:** Automatic logging and timestamp updates
- **Foreign Keys with CASCADE:** Automatic cleanup on deletion

---

## 2. Entity Relationship Diagram (ERD)

### 2.1 Complete ERD (Mermaid)

```mermaid
erDiagram
    AGENCIES ||--o{ WORKSPACES : "has"
    AGENCIES ||--o{ USER_ROLES : "employs"
    AGENCIES {
        uuid id PK
        text name
        text slug UK
        text logo_url
        text timezone
        text currency
        text language
        timestamp created_at
        uuid owner_id FK
    }

    WORKSPACES ||--o{ CLIENTS : "manages"
    WORKSPACES ||--o{ USER_WORKSPACE_ACCESS : "grants_access_to"
    WORKSPACES {
        uuid id PK
        uuid agency_id FK
        text name
        text description
        text color
        timestamp created_at
        uuid created_by FK
    }

    CLIENTS ||--o{ PROJECTS : "owns"
    CLIENTS ||--o| BRAND_KITS : "has_brand_kit"
    CLIENTS {
        uuid id PK
        uuid workspace_id FK
        text name
        text contact_person
        text email
        text phone
        text company_website
        text status
        text avatar_url
        timestamp created_at
        uuid created_by FK
    }

    PROJECTS ||--o{ TASKS : "contains"
    PROJECTS ||--o{ PROJECT_TEAM_MEMBERS : "has_members"
    PROJECTS {
        uuid id PK
        uuid client_id FK
        text name
        text description
        text type
        text status
        date start_date
        date end_date
        timestamp created_at
        uuid created_by FK
    }

    TASKS ||--o{ COMMENTS : "has_comments"
    TASKS ||--o{ FILES : "has_files"
    TASKS ||--o{ ACTIVITY_LOGS : "generates_logs"
    TASKS {
        uuid id PK
        uuid project_id FK
        text title
        text description
        uuid assigned_to FK
        text status
        text priority
        timestamp deadline
        numeric estimated_hours
        timestamp created_at
        uuid created_by FK
        timestamp updated_at
    }

    USERS ||--o{ USER_ROLES : "has_roles"
    USERS ||--o| USER_PROFILES : "has_profile"
    USERS ||--o{ TASKS : "assigned"
    USERS ||--o{ COMMENTS : "writes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITY_LOGS : "performs_actions"
    USERS {
        uuid id PK
        text email UK
        timestamp created_at
    }

    USER_PROFILES {
        uuid user_id PK_FK
        text full_name
        text avatar_url
        text bio
        text phone
        text job_title
        text timezone
        text language
        text date_format
        text time_format
        text task_view_mode
        boolean notify_task_assigned
        boolean notify_task_due
        boolean notify_task_status_changed
        boolean notify_comment_added
        boolean profile_visible
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid agency_id FK
        text role
        timestamp created_at
    }

    USER_WORKSPACE_ACCESS {
        uuid user_id FK
        uuid workspace_id FK
        text role
        timestamp created_at
    }

    PROJECT_TEAM_MEMBERS {
        uuid project_id FK
        uuid user_id FK
        text role
        timestamp added_at
    }

    BRAND_KITS {
        uuid id PK
        uuid client_id FK_UK
        text primary_color
        text secondary_color
        text accent_color
        text primary_font
        text secondary_font
        text logo_primary_url
        text logo_secondary_url
        text notes
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        uuid task_id FK
        uuid user_id FK
        text content
        timestamp created_at
        timestamp updated_at
        boolean is_edited
    }

    FILES {
        uuid id PK
        uuid task_id FK
        text filename
        text file_url
        text file_type
        bigint file_size_bytes
        uuid uploaded_by FK
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        text type
        text title
        text message
        text link
        boolean is_read
        timestamp created_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        text entity_type
        uuid entity_id
        uuid user_id FK
        text action
        text field_name
        jsonb old_value
        jsonb new_value
        inet ip_address
        text user_agent
        timestamp created_at
    }
```

### 2.2 Hierarchical Structure Visualization

```
Agency (Tenant Root)
│
├── Workspace 1
│   ├── Client A
│   │   ├── Project 1
│   │   │   ├── Task 1 (assigned to User 1)
│   │   │   ├── Task 2 (assigned to User 2)
│   │   │   └── Task 3 (assigned to User 1)
│   │   └── Project 2
│   │       └── Tasks...
│   └── Client B
│       └── Projects...
│
└── Workspace 2
    └── Clients...
```

---

## 3. Complete Table Definitions

### 3.1 Core Hierarchy Tables

#### agencies

**Purpose:** Root entity for multi-tenancy. Each agency is completely isolated.

```sql
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  timezone TEXT DEFAULT 'Africa/Cairo',
  currency TEXT DEFAULT 'EGP',
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_owner ON agencies(owner_id);
```

#### workspaces

**Purpose:** Organizational units within an agency (e.g., "Social Media Team", "Ads Team").

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for visual identification
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_workspaces_agency ON workspaces(agency_id);
CREATE INDEX idx_workspaces_created_by ON workspaces(created_by);
```

#### clients

**Purpose:** Client companies managed by the agency.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  company_website TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_clients_workspace ON clients(workspace_id);
CREATE INDEX idx_clients_status ON clients(status);
```

#### projects

**Purpose:** Projects for each client (e.g., "Ramadan Campaign 2026").

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('campaign', 'retainer', 'one_time')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

#### tasks

**Purpose:** Individual work items assigned to team members.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  deadline TIMESTAMP,
  estimated_hours NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

---

### 3.2 User Management Tables

#### user_roles

**Purpose:** RBAC at agency level (Owner, Team Leader, Member, Client).

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'team_leader', 'member', 'client')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, agency_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_agency ON user_roles(agency_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

#### user_workspace_access

**Purpose:** Workspace-level permissions (Team Leader, Member).

```sql
CREATE TABLE user_workspace_access (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('team_leader', 'member')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, workspace_id)
);

CREATE INDEX idx_user_workspace_access_workspace ON user_workspace_access(workspace_id);
```

#### project_team_members

**Purpose:** Project-specific team assignments (e.g., "Lead Designer").

```sql
CREATE TABLE project_team_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT, -- e.g., "Lead Designer", "Copywriter"
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX idx_project_team_members_project ON project_team_members(project_id);
CREATE INDEX idx_project_team_members_user ON project_team_members(user_id);
```

#### user_profiles

**Purpose:** Extended user information and preferences.

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT CHECK (LENGTH(bio) <= 200),
  phone TEXT,
  job_title TEXT,
  timezone TEXT DEFAULT 'Africa/Cairo',
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  task_view_mode TEXT DEFAULT 'center' CHECK (task_view_mode IN ('side', 'center', 'full')),
  
  -- Notification Preferences
  notify_task_assigned BOOLEAN DEFAULT true,
  notify_task_due BOOLEAN DEFAULT true,
  notify_task_status_changed BOOLEAN DEFAULT true,
  notify_comment_added BOOLEAN DEFAULT true,
  
  profile_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name);
```

---

### 3.3 Activity and Audit Tables

#### activity_logs

**Purpose:** Complete audit trail of all changes across the system.

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'client', 'workspace', 'comment', 'file', 'user')),
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 
    'status_changed', 'assigned', 'unassigned', 
    'deadline_changed', 'priority_changed', 
    'commented', 'file_uploaded', 'file_deleted',
    'archived', 'restored'
  )),
  field_name TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_entity_created ON activity_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
```

---

### 3.4 Content and Feature Tables

#### brand_kits

**Purpose:** Brand guidelines for each client (colors, fonts, logos).

```sql
CREATE TABLE brand_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  primary_font TEXT,
  secondary_font TEXT,
  logo_primary_url TEXT,
  logo_secondary_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brand_kits_client ON brand_kits(client_id);
```

#### comments

**Purpose:** Task discussions and client feedback.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  is_edited BOOLEAN DEFAULT false
);

CREATE INDEX idx_comments_task ON comments(task_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
```

#### files

**Purpose:** File attachments for tasks (stored in Supabase Storage).

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_task ON files(task_id, created_at DESC);
CREATE INDEX idx_files_uploader ON files(uploaded_by);
```

#### notifications

**Purpose:** In-app notification system (Phase 1).

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

---

## 4. Indexes Strategy

### 4.1 Index Design Principles

1. **Foreign Keys:** Always indexed for join performance
2. **Filters:** Status, dates, and other frequently filtered columns
3. **Sorting:** Composite indexes for `ORDER BY` queries
4. **Tenant Filters:** `agency_id`, `workspace_id` for multi-tenancy
5. **Full-Text Search:** GIN indexes for `trgm` extension (future)

### 4.2 Critical Performance Indexes

```sql
-- Task list queries (most frequent)
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_workspace ON tasks(project_id) 
  INCLUDE (status, priority, deadline);

-- Activity log timeline
CREATE INDEX idx_activity_logs_timeline ON activity_logs(entity_type, entity_id, created_at DESC);

-- Notifications panel
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) 
  WHERE is_read = false;

-- Comments count (avoid N+1 queries)
CREATE INDEX idx_comments_count ON comments(task_id) WHERE task_id IS NOT NULL;
```

---

## 5. Row Level Security (RLS) Policies

### 5.1 RLS Strategy

> [!IMPORTANT]
> **All tables** have RLS enabled. Policies check `agency_id` or `workspace_id` from JWT claims via `auth.uid()`.

### 5.2 Policy Templates

#### Agency-Level Tables (agencies, user_roles)

```sql
-- agencies: Users can only see their own agencies
CREATE POLICY "Users see own agencies"
ON agencies FOR SELECT
USING (
  owner_id = auth.uid() 
  OR id IN (
    SELECT agency_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- agencies: Only owners can update
CREATE POLICY "Only owner can update agency"
ON agencies FOR UPDATE
USING (owner_id = auth.uid());
```

#### Workspace-Level Tables (workspaces, clients, projects)

```sql
-- workspaces: Users see workspaces in their agency
CREATE POLICY "Users see workspaces in their agency"
ON workspaces FOR SELECT
USING (
  agency_id IN (
    SELECT agency_id FROM user_roles WHERE user_id = auth.uid()
  )
);

-- workspaces: Only team leaders can create workspaces
CREATE POLICY "Team leaders create workspaces"
ON workspaces FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND agency_id = workspaces.agency_id
    AND role IN ('owner', 'team_leader')
  )
);
```

#### Task-Level Tables (tasks, comments, files)

```sql
-- tasks: Users see tasks in their workspace
CREATE POLICY "Users see tasks in their workspace"
ON tasks FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN clients c ON c.id = p.client_id
    JOIN workspaces w ON w.id = c.workspace_id
    JOIN user_workspace_access uwa ON uwa.workspace_id = w.id
    WHERE uwa.user_id = auth.uid()
  )
);

-- tasks: Assigned users can update status
CREATE POLICY "Assigned users can update task"
ON tasks FOR UPDATE
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- comments: Users can comment on visible tasks
CREATE POLICY "Users can comment on visible tasks"
ON comments FOR INSERT
WITH CHECK (
  task_id IN (SELECT id FROM tasks) -- Checked by task RLS policy
);
```

#### Activity Logs (Read-Only)

```sql
-- activity_logs: Read-only for all authenticated users in same agency
CREATE POLICY "Users see activity in their agency"
ON activity_logs FOR SELECT
USING (
  -- Complex join to check agency membership via entity hierarchy
  CASE entity_type
    WHEN 'task' THEN entity_id IN (
      SELECT t.id FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN clients c ON c.id = p.client_id
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN user_workspace_access uwa ON uwa.workspace_id = w.id
      WHERE uwa.user_id = auth.uid()
    )
    -- Similar logic for other entity types...
    ELSE false
  END
);
```

---

## 6. Migration Strategy

### 6.1 Supabase Migration Workflow

**Reference:** [System Architecture Document](file:///e:/docs/docs/System%20Architecture/System%20Architecture.md)

```bash
# Create new migration
supabase migration new create_agencies_table

# Edit migration file in supabase/migrations/
# Apply migration
supabase db push

# Verify in Supabase Dashboard
```

### 6.2 Migration Execution Order

1. **Phase 1:** Core hierarchy tables
   - `agencies` → `workspaces` → `clients` → `projects` → `tasks`
2. **Phase 2:** User management
   - `user_roles` → `user_workspace_access` → `project_team_members` → `user_profiles`
3. **Phase 3:** Feature tables
   - `brand_kits` → `comments` → `files` → `notifications` → `activity_logs`
4. **Phase 4:** Indexes and RLS policies
5. **Phase 5:** Triggers (activity logging, `updated_at`)

### 6.3 Sample Migration File

```sql
-- supabase/migrations/20260124_create_agencies.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create agencies table
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  timezone TEXT DEFAULT 'Africa/Cairo',
  currency TEXT DEFAULT 'EGP',
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_owner ON agencies(owner_id);

-- Enable RLS
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own agencies"
ON agencies FOR SELECT
USING (
  owner_id = auth.uid() 
  OR id IN (SELECT agency_id FROM user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Only owner can update agency"
ON agencies FOR UPDATE
USING (owner_id = auth.uid());

-- Comments
COMMENT ON TABLE agencies IS 'Root tenant entity for multi-tenancy';
COMMENT ON COLUMN agencies.slug IS 'URL-safe unique identifier';
```

---

## 7. Backup and Recovery Plan

### 7.1 Backup Strategy

> **Reference:** [DevOps & Infrastructure Document](file:///e:/docs/docs/System%20Architecture/DevOps%20%26%20Infrastructure%20Document.md)

**Automatic Backups (Supabase):**

- **Frequency:** Daily at 02:00 UTC
- **Retention:** 
  - Free Plan: 7 days
  - Pro Plan: 30 days
  - Pro+: Point-in-time recovery
- **Storage:** AWS S3 with encryption

**Manual Backups:**

- **Frequency:** Weekly (before major releases)
- **Method:** `pg_dump` with Supabase CLI
- **Storage:** Separate S3 bucket + local copy

```bash
# Manual backup command
supabase db dump -f backup_$(date +%Y%m%d).sql
```

### 7.2 Recovery Procedures

**Recovery Time Objective (RTO):** 1 hour  
**Recovery Point Objective (RPO):** 24 hours (daily backups)

**Steps:**

1. Identify backup to restore (latest or specific date)
2. Create new Supabase project (if production is corrupted)
3. Restore from backup using Supabase Dashboard or CLI
4. Update DNS/environment variables to new project
5. Verify data integrity

---

## 8. Performance Considerations

### 8.1 Query Optimization

**Avoid N+1 Queries:** Use Supabase `select()` with relations

```typescript
// ❌ BAD (N+1 query)
const tasks = await supabase.from('tasks').select('*');
for (const task of tasks) {
  const { data: assignee } = await supabase
    .from('users')
    .select('*')
    .eq('id', task.assigned_to);
}

// ✅ GOOD (single query with JOIN)
const { data: tasks } = await supabase
  .from('tasks')
  .select(`
    *,
    assignee:users!assigned_to(id, full_name, avatar_url),
    project:projects(id, name, client:clients(id, name))
  `);
```

### 8.2 Materialized Views (Phase 2+)

**User Performance Stats:**

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.id as user_id,
  COUNT(t.id) FILTER (WHERE t.status = 'done') as tasks_completed,
  COUNT(t.id) FILTER (WHERE t.status IN ('todo', 'in_progress', 'review')) as tasks_active,
  COUNT(t.id) FILTER (WHERE t.deadline < NOW() AND t.status != 'done') as tasks_overdue,
  COUNT(c.id) as total_comments,
  up.created_at as joined_date
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN tasks t ON t.assigned_to = u.id
LEFT JOIN comments c ON c.user_id = u.id
GROUP BY u.id, up.created_at;

-- Refresh daily via cron
SELECT cron.schedule('refresh-user-stats', '0 3 * * *', 'REFRESH MATERIALIZED VIEW user_stats');
```

### 8.3 Connection Pooling

**Supabase PgBouncer Configuration:**

- Pool Mode: Transaction
- Max Connections: 200 (Pro Plan)
- Default Pool Size: 15

---

## 9. Next Steps

- [ ] Implement core migrations for Phase 1 (agencies → tasks)
- [ ] Write RLS policies and test with different user roles
- [ ] Create database triggers for `activity_logs` automation
- [ ] Set up monitoring for slow queries (Supabase Dashboard)
- [ ] Generate TypeScript types from schema (`supabase gen types`)
- [ ] Create seed data for development and testing
- [ ] Document RLS testing procedures
- [ ] Plan materialized views for analytics (Phase 2)

---

## 10. References

- [System Architecture Document](file:///e:/docs/docs/System%20Architecture/System%20Architecture.md)
- [Phase 1 Foundation](file:///e:/docs/docs/PRD/1%20%28UPDATED%29%20-%20FOUNDATION.md)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)

---

## 11. Changelog

- **v1.0** (2026-01-24): Initial database design document created
  - Complete ERD with 14 core tables
  - RLS policy patterns for multi-tenancy
  - Index strategy for performance
  - Migration and backup procedures
