
## Database Schema Standards

## 1. Table Naming

```sql
-- ✅ CORRECT: Plural, snake_case
public.workspaces
public.tasks
public.user_roles
public.workspace_members

-- ❌ WRONG: Singular, camelCase
public.workspace
public.Task
public.userRoles
```

## 2. Column Naming

```sql
-- ✅ CORRECT: snake_case
workspace_id
created_at
assigned_to
full_name

-- ❌ WRONG: camelCase
workspaceId
createdAt
assignedTo
fullName
```

## 3. Primary Keys

```sql
-- ✅ CORRECT: UUID
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- ❌ WRONG: Auto-increment integer (for user-facing tables)
id SERIAL PRIMARY KEY
```

## 4. Foreign Keys

```sql
-- ✅ CORRECT: Explicit ON DELETE behavior
workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE
user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL

-- ❌ WRONG: No ON DELETE specified
workspace_id UUID REFERENCES public.workspaces(id)
```

## 5. Timestamps

```sql
-- ✅ CORRECT: TIMESTAMPTZ with timezone, DEFAULT NOW()
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL

-- ❌ WRONG: TIMESTAMP without timezone
created_at TIMESTAMP
```

## 6. Enum-like Columns (CHECK Constraints)

```sql
-- ✅ CORRECT: TEXT with CHECK constraint
status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done'))

-- ❌ WRONG: No constraint, allows any value
status TEXT
```

---

## Multi-Tenancy Architecture (CRITICAL)

## Core Principle

**EVERY table (except auth.users and core config tables) MUST have `workspace_id`.**

## Workspace Isolation Pattern

```sql
-- 1. Create workspaces table (core tenant unit)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create workspace members (access control)
CREATE TABLE public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 3. ANY feature table MUST reference workspace
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  -- other columns...
);
```

## Helper Function for RLS

```sql
-- Create once, use everywhere
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.workspace_members
    WHERE workspace_id = ws_id 
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage in RLS policies
CREATE POLICY "Users view workspace data"
  ON public.tasks
  FOR SELECT
  USING (is_workspace_member(workspace_id));
```

---

## RLS Policy Patterns

## Pattern 1: Read (SELECT)

```sql
-- Anyone in the workspace can read
CREATE POLICY "workspace_members_read"
  ON public.table_name
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );
```

## Pattern 2: Create (INSERT)

```sql
-- Members and above can create
CREATE POLICY "workspace_members_insert"
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
```

## Pattern 3: Update

```sql
-- Members can update their own, admins can update all
CREATE POLICY "workspace_members_update"
  ON public.table_name
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM public.workspace_members 
      WHERE user_id = auth.uid()
        AND (
          role IN ('owner', 'admin')
          OR (role = 'member' AND created_by = auth.uid())
        )
    )
  );
```

## Pattern 4: Delete

```sql
-- Only owners/admins can delete
CREATE POLICY "workspace_owners_delete"
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
```

---

## Performance Optimization

## 1. Indexes Strategy

**Always create indexes for:**

* Foreign keys
* Columns in WHERE clauses
* Columns in ORDER BY
* Columns in JOIN conditions

```sql
-- ✅ CORRECT: Index foreign keys
CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- ✅ CORRECT: Index frequently filtered columns
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);

-- ✅ CORRECT: Composite index for common queries
CREATE INDEX idx_tasks_workspace_status 
  ON public.tasks(workspace_id, status);
```

## 2. Query Optimization

```sql
-- ❌ WRONG: SELECT *
SELECT * FROM public.tasks WHERE workspace_id = 'xxx';

-- ✅ CORRECT: Specify columns
SELECT id, title, status, deadline, assigned_to 
FROM public.tasks 
WHERE workspace_id = 'xxx'
LIMIT 50;

-- ✅ CORRECT: Use EXPLAIN ANALYZE for slow queries
EXPLAIN ANALYZE
SELECT id, title FROM public.tasks WHERE status = 'todo';
```

## 3. Pagination (Cursor-based)

```sql
-- ❌ WRONG: OFFSET pagination (slow for large tables)
SELECT * FROM public.tasks 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 1000;

-- ✅ CORRECT: Cursor-based pagination
SELECT * FROM public.tasks 
WHERE created_at < '2026-01-01T00:00:00Z'
ORDER BY created_at DESC 
LIMIT 20;
```

## 4. Full-Text Search

```sql
-- Add GIN index for text search
CREATE INDEX idx_tasks_title_search 
  ON public.tasks 
  USING gin(to_tsvector('english', title));

-- Query
SELECT * FROM public.tasks
WHERE to_tsvector('english', title) @@ to_tsquery('english', 'design & logo');
```

---

## Edge Functions (Deno/TypeScript)

## File Structure

```text
supabase/functions/
├── _shared/
│   ├── supabase-client.ts       # Shared Supabase client
│   └── cors.ts                  # CORS headers
├── get-user-profile/
│   └── index.ts
├── update-user-profile/
│   └── index.ts
└── send-notification/
    └── index.ts
```

## Function Template

```typescript
// supabase/functions/function-name/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialize Supabase client with user context
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 3. Parse request body
    const { param1, param2 } = await req.json()

    // 4. Business logic
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    // 5. Return response
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    // Error handling
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

## Deploy Edge Function

```bash
# Local test
supabase functions serve function-name

# Deploy to Supabase
supabase functions deploy function-name

# Set secrets
supabase secrets set MY_SECRET=value
```

---

## Authentication Setup

## 1. Handle New User (Trigger)

```sql
-- Auto-create profile and workspace on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- 1. Create user profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  -- 2. Create default workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (
    COALESCE(
      NEW.raw_user_meta_data->>'agency_name', 
      split_part(NEW.email, '@', 1) || '''s Workspace'
    ),
    lower(replace(
      COALESCE(NEW.raw_user_meta_data->>'agency_name', NEW.email),
      ' ', '-'
    )) || '-' || substr(md5(random()::text), 1, 6),
    NEW.id
  )
  RETURNING id INTO new_workspace_id;

  -- 3. Add user as owner in workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Real-time Subscriptions

## Enable Realtime for Tables

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Disable if not needed (reduces overhead)
ALTER PUBLICATION supabase_realtime DROP TABLE public.workspaces;
```

**When to use:**

* ✅ Tasks (status changes, assignments)
* ✅ Notifications (new notifications)
* ✅ Comments (chat-like features)
* ❌ Static data (workspaces, profiles, clients)
