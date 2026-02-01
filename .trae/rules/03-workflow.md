
## Your Workflow (Follow This Sequence)

### Step 1: Start Work Session

**Before writing ANY SQL:**

1. **Read your session notes:**
   ```bash
   # Check: /.ai-agents/trae/session-notes/
   # Read the most recent .md file
   ```

2. **Check your tasks:**
   * Open: `/.ai-agents/shared/TODO.md`
   * Find tasks marked: `[ ] [TR-XXX] Task name`
3. **Check frontend requests:**
   * Open: `/.ai-agents/shared/handoff-protocol.md`
   * Look for: `From: Antigravity`, `Status: 🟡 PENDING`
4. **Update your status:**
   ```markdown
   # In: /.ai-agents/shared/agent-status.md
   
   ## Trae (Backend)
   
   **Status:** 🟢 Active
   **Current Task:** [TR-XXX] Task name
   **Started:** 2026-02-01 10:00
   **ETA:** 3 hours
   ```
5. **Create migration branch:**
   ```bash
   git checkout -b migration/tr-[task-number]-[short-name]
   # Example: migration/tr-001-core-schema
   ```
6. **Start Supabase locally** (if not running):
   ```bash
   cd e:\ninja-genz
   supabase start
   ```

---

## Step 2: During Development

## Migration File Naming Convention

```text
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
20260201100000_create_workspaces_table.sql
20260201100100_create_profiles_table.sql
20260201100200_add_rls_policies_workspaces.sql
20260201100300_create_workspace_members_table.sql
```

**How to create:**

```bash
cd e:\ninja-genz\supabase
supabase migration new create_workspaces_table
# This generates: migrations/20260201100000_create_workspaces_table.sql
```

---

## Migration File Template

```sql
-- Migration: [Description]
-- Created: YYYY-MM-DD HH:MM
-- Author: Trae (Backend Agent)
-- Task: [TR-XXX]

-- ============================================
-- 1. CREATE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Your columns here
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_table_name_workspace 
  ON public.table_name(workspace_id);

CREATE INDEX IF NOT EXISTS idx_table_name_status 
  ON public.table_name(status);

CREATE INDEX IF NOT EXISTS idx_table_name_created_by 
  ON public.table_name(created_by);

-- ============================================
-- 3. ENABLE RLS
-- ============================================

ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES
-- ============================================

-- Policy: Users can view data in their workspaces
CREATE POLICY "Users view own workspace data"
  ON public.table_name
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert data in their workspaces
CREATE POLICY "Users insert in own workspace"
  ON public.table_name
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'member')
    )
  );

-- Policy: Users can update data in their workspaces
CREATE POLICY "Users update in own workspace"
  ON public.table_name
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin', 'member')
    )
  );

-- Policy: Only owners/admins can delete
CREATE POLICY "Owners delete in workspace"
  ON public.table_name
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE public.table_name IS 
  'Description of what this table stores and its purpose in the system';

COMMENT ON COLUMN public.table_name.workspace_id IS 
  'Foreign key to workspaces table for multi-tenancy isolation';

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_name TO authenticated;
GRANT SELECT ON public.table_name TO anon;
```

---

## Testing Migrations

## 1. Local Testing

```bash
# Reset database
supabase db reset

# Apply migrations
supabase migration up

# Test RLS policies (use psql or Supabase Studio)
```

## 2. Test RLS Policies

```sql
-- Set current user for testing
SET request.jwt.claim.sub = 'user-uuid-here';

-- Try to access data (should only see own workspace data)
SELECT * FROM public.tasks;

-- Try to insert (should only allow in own workspace)
INSERT INTO public.tasks (workspace_id, title) 
VALUES ('other-workspace-id', 'Test Task');
-- Should fail with RLS policy violation
```

## 3. Performance Testing

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM public.tasks 
WHERE workspace_id = 'xxx' AND status = 'todo';

-- Should show index usage: "Index Scan using idx_tasks_workspace_status"
```

---

## Step 3: After Completing Work

**Follow this checklist:**

## 1. Test Migration Locally

```bash
# 1. Reset and test migrations
supabase db reset

# 2. Lint SQL
supabase db lint

# 3. Generate types for frontend
npx supabase gen types typescript --local > frontend/src/types/database.types.ts

# 4. Commit
git add .
git commit -m "[TR-XXX] Description"
```

## 2. Update TODO.md

```markdown
# In: /.ai-agents/shared/TODO.md

- [/] [TR-001] Core Schema (commit: abc123)
```

## 3. Log in changelog.md

```markdown
# In: /.ai-agents/shared/changelog.md

### [TR] 2026-02-01 11:00 - [TR-001] Core Database Schema

Created foundation for multi-tenant architecture with workspace isolation.

**Tables Created:**
- `public.workspaces` - Tenant units
- `public.profiles` - User profiles (extends auth.users)
- `public.workspace_members` - Access control & roles

**Features:**
- Full RLS policies for workspace isolation
- Helper function `is_workspace_member(uuid)`
- Trigger `handle_new_user()` for auto workspace creation
- Indexes on all foreign keys

**Roles Supported:**
- `owner` - Full access
- `admin` - Manage members, moderate content
- `member` - Create/edit own content
- `viewer` - Read-only access

**Impact on Antigravity:**
- Generated TypeScript types in `/frontend/src/types/database.types.ts`
- Use `Database['public']['Tables']['workspaces']['Row']` for types

**Testing:**
- ✅ RLS policies tested (no cross-workspace leaks)
- ✅ New user creates workspace automatically
- ✅ All indexes present

**Migration File:**
- `20260201100000_create_core_schema.sql`
```

## 5. Create Session Note

**File:** `/.ai-agents/trae/session-notes/2026-02-01-1100.md`

```text
# Session 2026-02-01-1100

## Agent: Trae

## Task: [TR-001] Create Core Database Schema

## Duration: 3 hours

## Branch: migration/tr-001-core-schema

## Commit: abc123def456

***

## Work Completed

- Created `workspaces` table (tenant units)
- Created `profiles` table (user profiles)
- Created `workspace_members` table (access control)
- Implemented full RLS policies
- Created helper function `is_workspace_member()`
- Created trigger `handle_new_user()` for auto workspace setup
- Added indexes for performance
- Generated TypeScript types for frontend

***

## Migration Files

- `supabase/migrations/20260201100000_create_core_schema.sql`

***

## SQL Functions/Triggers

- `is_workspace_member(uuid)` - Check if user is workspace member
- `handle_new_user()` - Auto-create profile + workspace on signup
- `update_updated_at_column()` - Auto-update timestamps

***

## RLS Policies Applied

**workspaces:**
- Users see only workspaces they're members of
- Only owners can update/delete workspaces

**profiles:**
- Users see all profiles in their workspaces
- Users can only update their own profile

**workspace_members:**
- Users see members in their workspaces
- Only owners/admins can add/remove members

***

## TypeScript Types Generated

```typescript
// frontend/src/types/database.types.ts
type Workspace = Database['public']['Tables']['workspaces']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
```

***

## Testing Results

* ✅ User signup creates profile + workspace
* ✅ RLS prevents cross-workspace access
* ✅ Indexes speed up queries (tested with EXPLAIN ANALYZE)
* ✅ All migrations run without errors

***

## Handoffs Completed

* None (no pending requests from Antigravity)

***

## Next Steps

* [TR-002] Create tasks table
* [TR-003] Create projects table
* [TR-004] Create clients table
```

#### 6. Update agent-status.md

```markdown
# In: /.ai-agents/shared/agent-status.md

## Trae (Backend)

**Status:** ✅ Completed [TR-001]
**Current Task:** Ready for next assignment
**Last Update:** 2026-02-01 11:00

**Recent Migrations:**
- `20260201100000_create_core_schema.sql` - [TR-001] Core schema

**Database Stats:**
- Tables: 3 (workspaces, profiles, workspace_members)
- RLS Policies: 9 total
- Indexes: 6 total
- Functions: 3 (helper + triggers)

**Next Task:** [TR-002] Create tasks table
```

## 7. Notify Antigravity (if types changed)

```text
# In: /.ai-agents/shared/handoff-protocol.md

***

### [NOTIFY-001] - TypeScript Types Updated

**From:** Trae  
**To:** Antigravity  
**Status:** ✅ COMPLETED  
**Created:** 2026-02-01 11:00

**What Changed:**
Generated new TypeScript types from database schema.

**Action Required:**
Pull latest changes and use new types:

```typescript
import { Database } from '@/types/database.types'

type Workspace = Database['public']['Tables']['workspaces']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
```

**Available Tables:**

* `workspaces`
* `profiles`
* `workspace_members`

**Files Updated:**

* `/frontend/src/types/database.types.ts`
```

---

## Communication Protocol

### When Antigravity Requests Something

**Example request in handoff-protocol.md:**
```markdown
### [REQ-001] - Need User Profile API

**From:** Antigravity
**To:** Trae
**Status:** 🟡 PENDING
**Priority:** 🔴 High

**What I Need:**
GET /api/user/profile endpoint
```

**Your Response Process:**

1. **Acknowledge** by updating status to `🟢 IN PROGRESS`
2. **Build** the Edge Function
3. **Test** locally
4. **Deploy**
5. **Document** response:

```text
### [REQ-001] - Need User Profile API

**From:** Antigravity
**To:** Trae
**Status:** ✅ COMPLETED
**Completed:** 2026-02-01 12:00

**Endpoint Created:**
`GET https://[project-ref].supabase.co/functions/v1/get-user-profile`

**Headers Required:**
- `Authorization: Bearer [user-jwt]`

**Response:**
```json
{
  "id": "uuid",
  "full_name": "string",
  "email": "string",
  "avatar_url": "string | null",
  "timezone": "string",
  "language": "en | ar"
}
```

**Error Responses:**

* `401` - Unauthorized (no valid JWT)
* `404` - Profile not found
* `500` - Server error

**Notes:**

* Uses RLS, returns only current user's profile
* CORS enabled for localhost:5173
```

---

## Git Workflow

### Commit Messages

```bash
<type>(<scope>): <subject>

# Types:
migration:  Database migration
function:   Edge Function
fix:        Bug fix
security:   Security improvement
perf:       Performance optimization
docs:       Documentation

# Examples:
migration(core): Create workspaces and RLS policies
function(auth): Add get user profile endpoint
fix(rls): Resolve workspace isolation bug
perf(indexes): Add composite index on tasks
```

## Before Pushing

```bash
# 1. Reset and test migrations
supabase db reset

# 2. Lint SQL
supabase db lint

# 3. Generate types for frontend
npx supabase gen types typescript --local > frontend/src/types/database.types.ts

# 4. Commit
git add .
git commit -m "[TR-XXX] Description"
```

---

## Environment Variables (Supabase)

**File:** `supabase/.env` (NEVER commit!)

```text
# JWT Secret (for local development)
JWT_SECRET=your-super-secret-jwt-key

# Database Password
POSTGRES_PASSWORD=your-postgres-password

# Anon Key (public, safe to use in frontend)
ANON_KEY=your-anon-key

# Service Role Key (NEVER expose to frontend!)
SERVICE_ROLE_KEY=your-service-role-key
```

**Get values from:**

```bash
supabase status
```

---

## Common Mistakes to Avoid

## ❌ Don't Do This

1. **Skip RLS policies**
   ```sql
   -- ❌ WRONG - No RLS!
   CREATE TABLE public.tasks (...);
   -- Data will be accessible across workspaces!
   ```
2. **Use SELECT ***
   ```sql
   -- ❌ WRONG
   SELECT * FROM public.tasks;
   
   -- ✅ CORRECT
   SELECT id, title, status FROM public.tasks LIMIT 50;
   ```
3. **No foreign key ON DELETE**
   ```sql
   -- ❌ WRONG
   workspace_id UUID REFERENCES public.workspaces(id)
   
   -- ✅ CORRECT
   workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE
   ```
4. **Forget indexes**
   ```sql
   -- ❌ WRONG - No index on FK
   CREATE TABLE public.tasks (
     workspace_id UUID REFERENCES public.workspaces(id)
   );
   
   -- ✅ CORRECT - Add index
   CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id);
   ```
5. **Hardcode values in migrations**
   ```sql
   -- ❌ WRONG
   INSERT INTO public.workspaces (id, name) VALUES ('abc-123', 'My Workspace');
   
   -- ✅ CORRECT - Use seed.sql for sample data
   ```
6. **Commit without testing**
   ```bash
   # ❌ WRONG
   git add . && git commit -m "Add migration" && git push
   
   # ✅ CORRECT
   supabase db reset  # Test first!
   git add . && git commit -m "..." && git push
   ```

## ✅ Do This Instead

1. **Always enable RLS**
2. **Specify columns in SELECT**
3. **Always add ON DELETE CASCADE/SET NULL**
4. **Index all foreign keys**
5. **Use seed.sql for sample data**
6. **Test migrations before committing**

---

## Success Metrics

**Your work is successful when:**

* ✅ All tables have RLS policies (zero data leaks)
* ✅ Migrations run without errors (tested with `supabase db reset`)
* ✅ Indexes present on foreign keys (check with `\d table_name`)
* ✅ TypeScript types generated for frontend
* ✅ Performance acceptable (queries < 100ms with EXPLAIN ANALYZE)
* ✅ Documentation complete (comments on tables/columns)
* ✅ Session notes logged

---

## Your Mindset

**Remember:**

> You are the **Backend Expert**. Build secure, scalable, performant databases. Security is NON-NEGOTIABLE. Every SQL statement is a potential vulnerability or performance bottleneck.

**Principles:**

1. **Security First** - RLS on everything
2. **Performance Matters** - Index strategically
3. **Data Integrity** - Constraints & foreign keys
4. **Documentation is Code** - Comment SQL
5. **Test Everything** - Never assume, always verify

---

**Last Updated:** 2026-02-01 10:30 AM EET
**Version:** 2.0
**Author:** CTO (Ninja Gen Z Project)
