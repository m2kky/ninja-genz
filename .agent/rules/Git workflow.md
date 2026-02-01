---
trigger: always_on
---

Git Workflow
Branch Naming
bash
feature/ag-[number]-[short-description]

# Examples

feature/ag-001-login-page
feature/ag-002-task-card-component
feature/ag-003-dashboard-layout
fix/ag-004-button-styling
Commit Messages (Conventional Commits)
bash
<type>(<scope>): <subject>

# Types

feat:     New feature
fix:      Bug fix
ui:       UI/styling changes
refactor: Code refactoring
perf:     Performance improvement
test:     Adding tests
docs:     Documentation
chore:    Build/config changes

# Examples

feat(auth): Add login form with email validation
fix(tasks): Resolve infinite scroll bug on mobile
ui(button): Update hover state gradient colors
refactor(hooks): Simplify useAuth hook logic
perf(list): Add virtualization for large task lists
Before Pushing
bash

# 1. Lint check

npm run lint

# 2. Type check

npm run type-check

# or

npx tsc --noEmit

# 3. Build check

npm run build

# 4. Visual inspection

npm run dev

# Test all viewports

Step 3: After Completing Work
Follow this checklist:

1. Commit Changes
bash
git add .
git commit -m "[AG-XXX] Brief description of changes"

# Example: git commit -m "[AG-001] Add login page with form validation"

2. Update TODO.md
text

# In: /.ai-agents/shared/TODO.md

- [x] [AG-001] Build login page (commit: abc123) ✅ 2026-02-01

3. Log in changelog.md
text

# In: /.ai-agents/shared/changelog.md

### [AG] 2026-02-01 10:30 - [AG-001] Login Page Implementation

Built complete login page with email/password validation.

**Files Changed:**

- `/frontend/src/pages/Login.tsx` (NEW)
- `/frontend/src/components/atoms/Input.tsx` (NEW)
- `/frontend/src/components/atoms/Button.tsx` (NEW)

**Features:**

- Email validation (regex)
- Password strength indicator
- Loading states
- Error messages
- Responsive design (mobile/tablet/desktop)

**Impact on Trae:**

- None (using existing auth endpoints)

**Screenshots:**

- See `/.ai-agents/antigravity/artifacts/login-page/`

4. Create Session Note
File: /.ai-agents/antigravity/session-notes/2026-02-01-1030.md

text

# Session 2026-02-01-1030

## Agent: Antigravity

## Task: [AG-001] Build Login Page

## Duration: 2.5 hours

## Branch: feature/ag-001-login-page

## Commit: abc123def456

***

## Work Completed

- Built login page component
- Created Input and Button atoms
- Added form validation with Zod
- Integrated Supabase auth
- Styled according to Cyberpunk theme
- Tested on mobile/tablet/desktop

***

## Files Created

- `/frontend/src/pages/Login.tsx`
- `/frontend/src/components/atoms/Input.tsx`
- `/frontend/src/components/atoms/Button.tsx`
- `/frontend/src/lib/validations/auth.ts`

***

## Files Modified

- `/frontend/src/App.tsx` (added route)
- `/frontend/src/styles/globals.css` (added custom focus styles)

***

## Screenshots

- `/.ai-agents/antigravity/artifacts/login-page/desktop.png`
- `/.ai-agents/antigravity/artifacts/login-page/mobile.png`
- `/.ai-agents/antigravity/artifacts/login-page/error-state.png`

***

## Handoffs Created

- None

***

## Blockers

- None

***

## Next Steps

- [AG-002] Build register page
- [AG-003] Add password reset flow

5. Update agent-status.md
text

# In: /.ai-agents/shared/agent-status.md

## Antigravity (Frontend)

**Status:** ✅ Completed [AG-001]
**Current Task:** Ready for next assignment
**Last Update:** 2026-02-01 10:30

**Recent Commits:**

- `abc123` - [AG-001] Add login page with form validation
- `def456` - [AG-002] Create Input and Button components

**Next Task:** [AG-002] Build register page
6. Create Handoff (if needed)
Only if you need something from Trae:

text

# In: /.ai-agents/shared/handoff-protocol.md

***

### [REQ-001] - Need User Profile API Endpoint

**From:** Antigravity  
**To:** Trae  
**Status:** 🟡 PENDING  
**Priority:** 🔴 High  
**Created:** 2026-02-01 10:30

**Context:**
I've built the user profile page UI, but need the backend endpoint to fetch/update profile data.

**What I Need:**

1. `GET /api/user/profile` - Fetch current user profile
2. `PUT /api/user/profile` - Update profile (name, avatar, phone, timezone)

**Expected Response:**

```typescript
interface UserProfile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  phone: string | null
  timezone: string
  language: 'en' | 'ar'
  created_at: string
}
Files Involved:

/frontend/src/pages/Profile.tsx

/frontend/src/hooks/useProfile.ts

Timeline: Need by 2026-02-02 (tomorrow)

Notes: Using React Query for data fetching, needs CORS headers.

text

---

## Communication Protocol

### When You Need Something from Trae

1. **Create handoff** in `handoff-protocol.md`
2. **Update status** to `🟡 Waiting` in `agent-status.md`
3. **Be specific** about what you need (API contract, database fields, etc.)
4. **Include timeline** (when you need it)

### When Trae Completes Your Request

1. **Check** `handoff-protocol.md` for `Status: ✅ COMPLETED`
2. **Pull changes** from main branch
3. **Test integration** immediately
4. **Report issues** via new handoff if needed

### Daily Sync Routine

**Start of session:**
- Read `changelog.md` - what changed?
- Read `agent-status.md` - what is Trae doing?
- Read `handoff-protocol.md` - any responses?

**End of session:**
- Update `changelog.md`
- Update `agent-status.md`
- Update `handoff-protocol.md` if needed

---

## Environment Variables

**File:** `/frontend/.env.local`

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:58321
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:58321

# Environment
VITE_ENV=development
⚠️ NEVER commit .env.local to Git!
