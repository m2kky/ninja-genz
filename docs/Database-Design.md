# 🗄️ Database Design Document

> **Status:** Draft v1.0
> **Engine:** PostgreSQL 15 (Supabase)

---

## 1. Core System Schema (Agent Coordination)

These tables define the "brain" of the self-building system.

### \gent_status\
Tracks the current activity of AI agents.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | Unique Agent ID |
| \gent_name\ | TEXT (Unique) | 'antigravity' or 'trae' |
| \status\ | TEXT | 'idle', 'working', 'blocked' |
| \current_task\ | TEXT | Description of current activity |
| \last_seen\ | TIMESTAMPTZ | Last heartbeat |
| \metadata\ | JSONB | Extra context (files open, etc.) |

### \handoffs\
Queue for transferring tasks between agents.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | Unique Handoff ID |
| \rom_agent\ | TEXT | Sender |
| \	o_agent\ | TEXT | Receiver |
| \	ask_description\| TEXT | Task details |
| \status\ | TEXT | 'pending', 'in_progress', 'completed' |
| \context\ | JSONB | Shared variables/file paths |
| \created_at\ | TIMESTAMPTZ | Creation time |

---

## 2. Business Logic Schema (Planned)

### \users\ (Managed by Supabase Auth)
Extends default \uth.users\.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | References \uth.users.id\ |
| \ull_name\ | TEXT | Display Name |
| \vatar_url\ | TEXT | Profile Picture |
| \ole\ | TEXT | 'admin', 'manager', 'member' |
| \created_at\ | TIMESTAMPTZ | Signup Date |

### \workspaces\
Tenant isolation for agencies.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | Workspace ID |
| \
ame\ | TEXT | Agency Name |
| \slug\ | TEXT (Unique) | URL friendly slug |
| \owner_id\ | UUID (FK) | References \users.id\ |

### \clients\
Agency clients.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | Client ID |
| \workspace_id\ | UUID (FK) | References \workspaces.id\ |
| \
ame\ | TEXT | Client Company Name |
| \contact_email\ | TEXT | Primary Contact |
| \status\ | TEXT | 'active', 'onboarding', 'churned' |

### \	asks\
Core work units.

| Column | Type | Description |
|---|---|---|
| \id\ | UUID (PK) | Task ID |
| \workspace_id\ | UUID (FK) | Context |
| \client_id\ | UUID (FK) | Related Client |
| \	itle\ | TEXT | Task Title |
| \description\ | TEXT | Markdown details |
| \status\ | TEXT | 'todo', 'in_progress', 'review', 'done' |
| \ssignee_id\ | UUID (FK) | References \users.id\ |
| \priority\ | TEXT | 'low', 'medium', 'high', 'urgent' |
| \due_date\ | TIMESTAMPTZ | Deadline |

---

## 3. Security (RLS Policies)

*   **Users**: Can read/update their own profile.
*   **Workspaces**: Can read if member (\workspace_members\ table needed in future).
*   **Tasks/Clients**: Can read/write if they belong to the user's workspace.
*   **Agents**: Use \SERVICE_ROLE_KEY\ to bypass RLS for maintenance.

---

## 4. Supabase Functions (RPC)

*   \create_workspace(name, user_id)\: Transaction to create workspace and add owner.
*   \get_agent_status(name)\: Helper to quickly fetch agent state.
