<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PART 3: COMPLETE SYSTEM DESIGN

## Overview

هذا هو **المخطط التقني الشامل** لمنصة workit - من قاعدة البيانات حتى الـ Deployment. كل ما يحتاجه المطور للبدء في التنفيذ موجود هنا.

***

# 1. DATABASE SCHEMA \& ERD

## 1.1 Multi-Tenant Strategy

**Approach:** **Shared Database, Shared Schema** مع Row-Level Security (RLS)[^1][^2][^3]

**Why?**

- ✅ Cost-effective (database واحد لكل العملاء)
- ✅ Easy maintenance (schema update واحد يطبق على الجميع)
- ✅ Supabase RLS يحمي البيانات بين tenants بشكل قوي[^3]
- ✅ Scalable (يتحمل 10,000+ agency بدون مشاكل)[^1]

**Tenant Isolation via RLS:**[^2][^3]

```sql
-- كل agency لها tenant_id (agency_id)
-- كل user مرتبط بـ agency
-- RLS policies تضمن أن User يشوف بيانات agency الخاص بيه فقط
```


***

## 1.2 Core Database Schema

### 1.2.1 Authentication \& Users

**Table: auth.users** (Supabase built-in)

- `id` (UUID) - Primary Key
- `email` (TEXT)
- `encrypted_password` (TEXT)
- `email_confirmed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

**Table: user_profiles**

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id, UNIQUE)
full_name (TEXT)
avatar_url (TEXT)
phone (TEXT)
timezone (TEXT, default: 'Africa/Cairo')
language (TEXT, default: 'ar')
date_format (TEXT, default: 'DD/MM/YYYY')
time_format (TEXT, default: '24h')
notifications_enabled (BOOLEAN, default: true)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```


***

### 1.2.2 Multi-Tenancy Core

**Table: agencies**

```
id (UUID, PK)
name (TEXT, NOT NULL)
slug (TEXT, UNIQUE) -- للـ subdomain: slug.workit.com
logo_url (TEXT)
industry (TEXT) -- 'marketing', 'design', 'development'
size (TEXT) -- 'small', 'medium', 'large'
country (TEXT)
timezone (TEXT)
subscription_plan (TEXT) -- 'free', 'pro', 'enterprise'
subscription_status (TEXT) -- 'active', 'cancelled', 'trial'
trial_ends_at (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Table: user_roles**

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id)
agency_id (UUID, FK → agencies.id)
role (TEXT) -- 'owner', 'team_leader', 'member', 'client', 'custom'
custom_role_id (UUID, FK → custom_roles.id, NULLABLE)
invited_by (UUID, FK → auth.users.id, NULLABLE)
invited_at (TIMESTAMP)
accepted_at (TIMESTAMP, NULLABLE)
created_at (TIMESTAMP)
UNIQUE(user_id, agency_id)

INDEX: idx_user_roles_user (user_id)
INDEX: idx_user_roles_agency (agency_id)
```


***

### 1.2.3 Workspaces \& Organization

**Table: workspaces**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
name (TEXT, NOT NULL)
description (TEXT)
color (TEXT) -- hex color
icon (TEXT) -- emoji or icon name
is_archived (BOOLEAN, default: false)
created_by (UUID, FK → auth.users.id)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_workspaces_agency (agency_id)
```

**Table: workspace_members**

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
user_id (UUID, FK → auth.users.id)
role (TEXT) -- 'admin', 'member'
added_by (UUID, FK → auth.users.id)
added_at (TIMESTAMP)
UNIQUE(workspace_id, user_id)

INDEX: idx_workspace_members_workspace (workspace_id)
INDEX: idx_workspace_members_user (user_id)
```


***

### 1.2.4 Clients

**Table: clients**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
name (TEXT, NOT NULL)
logo_url (TEXT)
industry (TEXT)
website (TEXT)
email (TEXT)
phone (TEXT)
address (TEXT)
country (TEXT)
notes (TEXT)
is_archived (BOOLEAN, default: false)
created_by (UUID, FK → auth.users.id)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_clients_agency (agency_id)
```

**Table: client_contacts**

```
id (UUID, PK)
client_id (UUID, FK → clients.id)
name (TEXT, NOT NULL)
email (TEXT)
phone (TEXT)
position (TEXT)
is_primary (BOOLEAN, default: false)
created_at (TIMESTAMP)

INDEX: idx_client_contacts_client (client_id)
```

**Table: client_portal_access**

```
id (UUID, PK)
client_id (UUID, FK → clients.id)
user_id (UUID, FK → auth.users.id) -- client user account
access_token (TEXT, UNIQUE) -- secure token للـ portal
is_active (BOOLEAN, default: true)
last_login_at (TIMESTAMP)
created_at (TIMESTAMP)

INDEX: idx_client_portal_client (client_id)
INDEX: idx_client_portal_user (user_id)
```


***

### 1.2.5 Projects

**Table: projects**

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
client_id (UUID, FK → clients.id)
name (TEXT, NOT NULL)
description (TEXT)
status (TEXT) -- 'planning', 'active', 'on_hold', 'completed', 'cancelled'
priority (TEXT) -- 'low', 'medium', 'high', 'urgent'
start_date (DATE)
deadline (DATE)
budget (NUMERIC)
color (TEXT)
is_archived (BOOLEAN, default: false)
created_by (UUID, FK → auth.users.id)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
completed_at (TIMESTAMP, NULLABLE)

INDEX: idx_projects_workspace (workspace_id)
INDEX: idx_projects_client (client_id)
INDEX: idx_projects_status (status)
```

**Table: project_members**

```
id (UUID, PK)
project_id (UUID, FK → projects.id)
user_id (UUID, FK → auth.users.id)
role (TEXT) -- 'lead', 'member'
added_at (TIMESTAMP)
UNIQUE(project_id, user_id)

INDEX: idx_project_members_project (project_id)
INDEX: idx_project_members_user (user_id)
```


***

### 1.2.6 Tasks (Core Feature)

**Table: tasks**

```
id (UUID, PK)
project_id (UUID, FK → projects.id)
parent_task_id (UUID, FK → tasks.id, NULLABLE) -- للـ subtasks
title (TEXT, NOT NULL)
description (TEXT)
status (TEXT) -- 'todo', 'in_progress', 'review', 'done', 'cancelled'
priority (TEXT) -- 'low', 'medium', 'high', 'urgent'
assigned_to (UUID, FK → auth.users.id, NULLABLE)
created_by (UUID, FK → auth.users.id)
start_at (TIMESTAMP, NULLABLE) -- Phase 4: Timeline
end_at (TIMESTAMP, NULLABLE) -- Phase 4: Timeline
deadline (TIMESTAMP)
estimated_hours (NUMERIC)
actual_hours (NUMERIC) -- computed from time_logs
tags (TEXT[]) -- array of tags
position (INTEGER) -- للترتيب في Kanban
is_archived (BOOLEAN, default: false)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
completed_at (TIMESTAMP, NULLABLE)

INDEX: idx_tasks_project (project_id)
INDEX: idx_tasks_assigned (assigned_to)
INDEX: idx_tasks_status (status)
INDEX: idx_tasks_deadline (deadline)
INDEX: idx_tasks_parent (parent_task_id)
```

**Table: task_dependencies** (Phase 3)

```
id (UUID, PK)
task_id (UUID, FK → tasks.id)
depends_on_task_id (UUID, FK → tasks.id)
dependency_type (TEXT) -- 'finish_to_start', 'start_to_start'
created_at (TIMESTAMP)
UNIQUE(task_id, depends_on_task_id)

INDEX: idx_task_deps_task (task_id)
INDEX: idx_task_deps_depends (depends_on_task_id)
```


***

### 1.2.7 Comments \& Activity

**Table: comments**

```
id (UUID, PK)
task_id (UUID, FK → tasks.id)
user_id (UUID, FK → auth.users.id)
content (TEXT, NOT NULL)
mentioned_users (UUID[]) -- array of user IDs
is_internal (BOOLEAN, default: false) -- hidden from clients
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULLABLE) -- soft delete

INDEX: idx_comments_task (task_id)
INDEX: idx_comments_user (user_id)
```

**Table: activity_logs**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id) -- for multi-tenant isolation
entity_type (TEXT) -- 'task', 'project', 'client', etc.
entity_id (UUID) -- ID of the entity
user_id (UUID, FK → auth.users.id, NULLABLE) -- NULL for system actions
action (TEXT) -- 'created', 'updated', 'deleted', 'status_changed', etc.
changes (JSONB) -- {'field': {'old': 'value', 'new': 'value'}}
ip_address (TEXT)
user_agent (TEXT)
created_at (TIMESTAMP)

INDEX: idx_activity_logs_agency (agency_id)
INDEX: idx_activity_logs_entity (entity_type, entity_id)
INDEX: idx_activity_logs_user (user_id)
INDEX: idx_activity_logs_created (created_at DESC)
```


***

### 1.2.8 Files \& Attachments

**Table: files**

```
id (UUID, PK)
task_id (UUID, FK → tasks.id, NULLABLE)
project_id (UUID, FK → projects.id, NULLABLE)
client_id (UUID, FK → clients.id, NULLABLE)
uploaded_by (UUID, FK → auth.users.id)
file_name (TEXT, NOT NULL)
file_size (BIGINT) -- in bytes
file_type (TEXT) -- MIME type
file_url (TEXT, NOT NULL) -- Supabase Storage URL
thumbnail_url (TEXT, NULLABLE) -- for images
is_public (BOOLEAN, default: false)
version (INTEGER, default: 1)
previous_version_id (UUID, FK → files.id, NULLABLE)
uploaded_at (TIMESTAMP)
deleted_at (TIMESTAMP, NULLABLE)

INDEX: idx_files_task (task_id)
INDEX: idx_files_project (project_id)
INDEX: idx_files_uploaded_by (uploaded_by)
```


***

### 1.2.9 Time Tracking (Phase 2)

**Table: time_logs**

```
id (UUID, PK)
task_id (UUID, FK → tasks.id)
user_id (UUID, FK → auth.users.id)
start_time (TIMESTAMP, NOT NULL)
end_time (TIMESTAMP, NULLABLE) -- NULL = timer running
duration_minutes (INTEGER) -- computed
description (TEXT)
is_billable (BOOLEAN, default: true)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_time_logs_task (task_id)
INDEX: idx_time_logs_user (user_id)
INDEX: idx_time_logs_start (start_time)
```


***

### 1.2.10 Approvals (Phase 2)

**Table: approvals**

```
id (UUID, PK)
task_id (UUID, FK → tasks.id)
requested_by (UUID, FK → auth.users.id)
requested_from (UUID, FK → auth.users.id) -- approver
status (TEXT) -- 'pending', 'approved', 'rejected', 'changes_requested'
notes (TEXT)
revision_count (INTEGER, default: 0)
requested_at (TIMESTAMP)
responded_at (TIMESTAMP, NULLABLE)

INDEX: idx_approvals_task (task_id)
INDEX: idx_approvals_requested_from (requested_from)
INDEX: idx_approvals_status (status)
```


***

### 1.2.11 Notifications

**Table: notifications**

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id)
type (TEXT) -- 'task_assigned', 'comment_added', 'approval_requested', etc.
title (TEXT)
message (TEXT)
link (TEXT) -- URL to related entity
metadata (JSONB) -- extra data
is_read (BOOLEAN, default: false)
created_at (TIMESTAMP)

INDEX: idx_notifications_user (user_id)
INDEX: idx_notifications_read (user_id, is_read)
INDEX: idx_notifications_created (created_at DESC)
```


***

### 1.2.12 AI (سَنَد) - Phase 3 \& 4

**Table: ai_usage**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
month_key (TEXT) -- 'YYYY-MM'
questions_count (INTEGER, default: 0)
quota_limit (INTEGER, default: 50)
last_reset_at (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
UNIQUE(agency_id, month_key)

INDEX: idx_ai_usage_agency_month (agency_id, month_key)
```

**Table: ai_conversations**

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id)
agency_id (UUID, FK → agencies.id)
question (TEXT, NOT NULL)
answer (TEXT, NOT NULL)
context_type (TEXT) -- 'task', 'project', 'workspace', 'analytics'
context_id (UUID, NULLABLE)
tokens_used (INTEGER)
response_time_ms (INTEGER)
created_at (TIMESTAMP)

INDEX: idx_ai_conversations_user (user_id)
INDEX: idx_ai_conversations_agency (agency_id)
```

**Table: meeting_transcripts** (Phase 4)

```
id (UUID, PK)
project_id (UUID, FK → projects.id, NULLABLE)
uploaded_by (UUID, FK → auth.users.id)
title (TEXT)
transcript_text (TEXT)
summary (TEXT)
action_items (JSONB) -- [{assignee, task, deadline}, ...]
file_url (TEXT) -- original audio/video
created_at (TIMESTAMP)

INDEX: idx_meeting_transcripts_project (project_id)
```


***

### 1.2.13 Focus Sessions (Phase 3)

**Table: focus_sessions**

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id)
task_id (UUID, FK → tasks.id, NULLABLE)
started_at (TIMESTAMP, NOT NULL)
ended_at (TIMESTAMP, NULLABLE)
work_minutes (INTEGER, default: 90)
break_minutes (INTEGER, default: 15)
status (TEXT) -- 'running', 'break', 'completed', 'cancelled'
break_snoozed (BOOLEAN, default: false)
created_at (TIMESTAMP)

INDEX: idx_focus_sessions_user (user_id)
INDEX: idx_focus_sessions_task (task_id)
```

**Table: prayer_settings** (Phase 3)

```
user_id (UUID, PK, FK → auth.users.id)
enabled (BOOLEAN, default: false)
city (TEXT)
country (TEXT)
latitude (NUMERIC)
longitude (NUMERIC)
calculation_method (INTEGER, default: 5)
fajr_offset_min (INTEGER, default: 0)
dhuhr_offset_min (INTEGER, default: 0)
asr_offset_min (INTEGER, default: 0)
maghrib_offset_min (INTEGER, default: 0)
isha_offset_min (INTEGER, default: 0)
remind_before_min (INTEGER, default: 10)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**Table: prayer_times_cache** (Phase 3)

```
id (UUID, PK)
user_id (UUID, FK → auth.users.id)
date (DATE, NOT NULL)
fajr (TIMESTAMP, NOT NULL)
dhuhr (TIMESTAMP, NOT NULL)
asr (TIMESTAMP, NOT NULL)
maghrib (TIMESTAMP, NOT NULL)
isha (TIMESTAMP, NOT NULL)
source (TEXT, default: 'aladhan')
created_at (TIMESTAMP)
UNIQUE(user_id, date)

INDEX: idx_prayer_cache_user_date (user_id, date)
```


***

### 1.2.14 Ads Monitoring (Phase 4)

**Table: meta_ad_accounts**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
account_id (TEXT, NOT NULL) -- Meta Account ID
account_name (TEXT)
access_token (TEXT) -- encrypted
is_active (BOOLEAN, default: true)
last_synced_at (TIMESTAMP)
created_at (TIMESTAMP)

INDEX: idx_meta_accounts_agency (agency_id)
```

**Table: meta_campaigns**

```
id (UUID, PK)
ad_account_id (UUID, FK → meta_ad_accounts.id)
campaign_id (TEXT, NOT NULL) -- Meta Campaign ID
campaign_name (TEXT)
objective (TEXT)
status (TEXT)
daily_budget (NUMERIC)
project_id (UUID, FK → projects.id, NULLABLE) -- link to workit project
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_meta_campaigns_account (ad_account_id)
INDEX: idx_meta_campaigns_project (project_id)
```

**Table: meta_campaign_insights**

```
id (UUID, PK)
campaign_id (UUID, FK → meta_campaigns.id)
date (DATE, NOT NULL)
impressions (BIGINT)
clicks (BIGINT)
spend (NUMERIC)
conversions (INTEGER)
ctr (NUMERIC) -- click-through rate
cpc (NUMERIC) -- cost per click
cpm (NUMERIC) -- cost per mille
created_at (TIMESTAMP)
UNIQUE(campaign_id, date)

INDEX: idx_meta_insights_campaign_date (campaign_id, date)
```

**Similar tables for Google Ads:**

- `google_ad_accounts`
- `google_campaigns`
- `google_campaign_insights`

***

### 1.2.15 Competitor Monitoring (Phase 4)

**Table: competitor_profiles**

```
id (UUID, PK)
client_id (UUID, FK → clients.id)
name (TEXT, NOT NULL)
instagram_handle (TEXT)
facebook_page_id (TEXT)
twitter_handle (TEXT)
linkedin_company_id (TEXT)
is_active (BOOLEAN, default: true)
created_at (TIMESTAMP)

INDEX: idx_competitors_client (client_id)
```

**Table: competitor_posts**

```
id (UUID, PK)
competitor_id (UUID, FK → competitor_profiles.id)
platform (TEXT) -- 'instagram', 'facebook', 'twitter'
post_url (TEXT)
content (TEXT)
media_urls (TEXT[])
engagement_score (INTEGER) -- likes + comments + shares
posted_at (TIMESTAMP)
scraped_at (TIMESTAMP)

INDEX: idx_competitor_posts_competitor (competitor_id)
INDEX: idx_competitor_posts_posted (posted_at DESC)
```


***

### 1.2.16 Mockup Previews (Phase 4)

**Table: mockup_previews**

```
id (UUID, PK)
task_id (UUID, FK → tasks.id)
file_id (UUID, FK → files.id)
platform (TEXT) -- 'instagram_feed', 'facebook_post', etc.
format (TEXT) -- 'feed', 'story', 'reel'
preview_config (JSONB) -- {username, caption, likes, etc.}
preview_url (TEXT) -- URL to generated mockup image
created_at (TIMESTAMP)

INDEX: idx_mockups_task (task_id)
```


***

### 1.2.17 Custom Properties (Phase 4)

**Table: custom_properties**

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
property_name (TEXT, NOT NULL)
property_type (TEXT) -- 'text', 'number', 'date', 'select', 'checkbox', 'url'
options (JSONB, NULLABLE) -- for select type: ["option1", "option2"]
applies_to (TEXT) -- 'tasks', 'projects', 'clients'
is_required (BOOLEAN, default: false)
default_value (TEXT, NULLABLE)
created_at (TIMESTAMP)

INDEX: idx_custom_props_workspace (workspace_id)
```

**Table: custom_property_values**

```
id (UUID, PK)
property_id (UUID, FK → custom_properties.id)
entity_type (TEXT) -- 'task', 'project', 'client'
entity_id (UUID)
value (JSONB) -- supports any type
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
UNIQUE(property_id, entity_type, entity_id)

INDEX: idx_custom_values_property (property_id)
INDEX: idx_custom_values_entity (entity_type, entity_id)
```

**Table: formulas** (Phase 4)

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
formula_name (TEXT, NOT NULL)
formula_expression (TEXT, NOT NULL) -- 'BUDGET - ACTUAL_COST'
output_property_id (UUID, FK → custom_properties.id)
input_properties (UUID[]) -- array of property IDs
created_at (TIMESTAMP)

INDEX: idx_formulas_workspace (workspace_id)
```


***

### 1.2.18 API \& Integrations (Phase 5)

**Table: api_keys**

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
key_name (TEXT)
key_hash (TEXT, UNIQUE) -- hashed API key
key_prefix (TEXT) -- 'wk_live_' or 'wk_test_'
permissions (TEXT) -- 'read', 'write', 'read_write'
rate_limit (INTEGER, default: 1000) -- requests per hour
last_used_at (TIMESTAMP)
is_active (BOOLEAN, default: true)
created_by (UUID, FK → auth.users.id)
created_at (TIMESTAMP)

INDEX: idx_api_keys_workspace (workspace_id)
INDEX: idx_api_keys_hash (key_hash)
```

**Table: webhooks**

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
url (TEXT, NOT NULL)
events (TEXT[]) -- ['task.created', 'task.updated']
secret (TEXT) -- for signature verification
is_active (BOOLEAN, default: true)
last_delivery_at (TIMESTAMP)
success_count (INTEGER, default: 0)
failure_count (INTEGER, default: 0)
created_at (TIMESTAMP)

INDEX: idx_webhooks_workspace (workspace_id)
```


***

### 1.2.19 SSO \& Enterprise (Phase 5)

**Table: sso_configurations**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
provider (TEXT) -- 'okta', 'azure_ad', 'google', 'custom_saml'
is_enabled (BOOLEAN, default: false)
saml_sso_url (TEXT)
saml_entity_id (TEXT)
saml_certificate (TEXT)
auto_provision (BOOLEAN, default: true)
default_role (TEXT, default: 'member')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_sso_agency (agency_id)
```

**Table: custom_roles** (Phase 5)

```
id (UUID, PK)
workspace_id (UUID, FK → workspaces.id)
role_name (TEXT, NOT NULL)
description (TEXT)
permissions (JSONB) -- {'tasks.view': true, 'tasks.create': false, ...}
created_at (TIMESTAMP)

INDEX: idx_custom_roles_workspace (workspace_id)
```


***

### 1.2.20 White-label \& Branding (Phase 5)

**Table: white_label_settings**

```
id (UUID, PK)
agency_id (UUID, FK → agencies.id)
custom_domain (TEXT, UNIQUE)
domain_verified (BOOLEAN, default: false)
logo_url (TEXT)
favicon_url (TEXT)
primary_color (TEXT)
secondary_color (TEXT)
accent_color (TEXT)
email_sender_name (TEXT)
email_sender_address (TEXT)
hide_powered_by (BOOLEAN, default: false)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

INDEX: idx_white_label_agency (agency_id)
INDEX: idx_white_label_domain (custom_domain)
```


***

## 1.3 Database Views \& Materialized Views

**Performance optimization للـ analytics:**

```sql
-- View: workspace_stats (refreshed hourly)
CREATE MATERIALIZED VIEW workspace_stats AS
SELECT 
  w.id as workspace_id,
  w.agency_id,
  COUNT(DISTINCT p.id) as projects_count,
  COUNT(DISTINCT t.id) as tasks_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') as tasks_completed,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('todo', 'in_progress')) as tasks_active,
  COALESCE(SUM(tl.duration_minutes)/60, 0) as total_hours_logged
FROM workspaces w
LEFT JOIN projects p ON p.workspace_id = w.id
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN time_logs tl ON tl.task_id = t.id
GROUP BY w.id, w.agency_id;

-- Refresh strategy
REFRESH MATERIALIZED VIEW workspace_stats;
```


***

**تكمل باقي Part 3 (Architecture + API + Security + DevOps)؟** 🚀
<span style="display:none">[^10][^11][^12][^13][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://daily.dev/blog/multi-tenant-database-design-patterns-2024

[^2]: https://www.geeksforgeeks.org/dbms/multi-tenant-application-database-design/

[^3]: https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175

[^4]: Product-Vision-Document1.1.md

[^5]: Product-Vision-Document1.2.md

[^6]: Technical-Details-Features-Implem.md

[^7]: https://www.reddit.com/r/PostgreSQL/comments/1glvfa5/multitenant_database_design/

[^8]: https://www.crunchydata.com/blog/designing-your-postgres-database-for-multi-tenancy

[^9]: https://www.reddit.com/r/PostgreSQL/comments/1acxgdk/database_architecture_for_multitenant_apps/

[^10]: https://dev.to/thebenforce/lock-down-your-data-implement-row-level-security-policies-in-supabase-sql-4p82

[^11]: https://kansoftware.com/how-to-build-scalable-saas-platforms-architecture-decisions-that-matter/

[^12]: https://eoxs.com/new_blog/best-practices-for-managing-multi-tenant-database-architectures/

[^13]: https://www.studiolabs.com/building-scalable-saas-applications-with-react-node-js/

