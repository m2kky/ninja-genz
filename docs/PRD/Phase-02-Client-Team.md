# PHASE 2 - CLIENT & TEAM ENHANCEMENT

## Phase 2 Overview

**Timeline:** Month 4-5 (8 weeks / 4 sprints)  
**Goal:** Enable seamless client collaboration and team performance tracking  
**Team:** 3 Frontend Devs, 1 Backend Dev, 1 Designer, 1 QA Engineer  
**Prerequisites:** Phase 1 completed and tested

***

## Phase 2: Complete Feature List (7 Features)

1. **Client Portal** (Dedicated subdomain for client access)
2. **Time Tracking** (Manual timer with play/pause/stop)
3. **Basic Analytics Dashboard** (Team performance metrics)
4. **Calendar View** (Task visualization by deadline)
5. **File Management** (Full upload, preview, organize)
6. **Strategy Section** (Per-client strategy documents)
7. **Email Notifications** (Critical updates via email)

***

## 1. Client Portal

### 1.1 Overview
**Description:** Dedicated white-label portal where clients view projects and provide feedback [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/57205511/b6ce3aa9-da3c-453f-8882-5c93d2f18fea/Product-Vision-Document1.1.md)

**Why Critical for Phase 2:**
- Eliminates WhatsApp chaos for client communication
- Professional presentation to clients
- Reduces agency team interruptions
- Clear approval/rejection workflow

***

### 1.2 Database Schema

```sql
-- ============================================
-- CLIENT PORTAL ACCESS
-- ============================================
CREATE TABLE client_portal_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(client_id, email)
);

CREATE INDEX idx_client_portal_client ON client_portal_users(client_id);
CREATE INDEX idx_client_portal_user ON client_portal_users(user_id);

-- Client subdomain configuration
CREATE TABLE client_portal_settings (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE, -- e.g., "nike-egypt"
  custom_domain TEXT, -- Phase 3: client's own domain
  logo_url TEXT, -- Override agency logo with client's logo
  primary_color TEXT, -- Brand color for portal theme
  welcome_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Clients can only see their own portal access
CREATE POLICY "Clients see own portal access"
ON client_portal_users FOR SELECT
USING (
  user_id = auth.uid() 
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN agencies a ON a.id = ur.agency_id
    JOIN workspaces w ON w.agency_id = a.id
    JOIN clients c ON c.workspace_id = w.id
    WHERE c.id = client_portal_users.client_id
      AND (ur.user_id = auth.uid() AND ur.role IN ('owner', 'team_leader'))
  )
);
```

***

### 1.3 Client Portal Features

#### A. Client Invitation Flow

**User Story:** *As a Team Leader, I want to invite my client to the portal so they can review work without WhatsApp.*

**Steps:**
1. Team Leader navigates to Client detail page → "Portal Access" tab
2. Clicks "Invite Client" button
3. Modal opens: Enter client email, optional message
4. System generates invitation email with:
   - Portal URL: `https://nike-egypt.workit.app`
   - Temporary password (must change on first login)
   - Welcome message from agency
5. Client receives email, clicks link
6. Portal login page with client's branding (logo + colors)
7. Client sets new password
8. Lands on client dashboard

**Database Operations:**
```sql
-- Invitation creates user in auth.users with role 'client'
INSERT INTO auth.users (email, role) VALUES ('yara@nike.com', 'client');

-- Link user to client
INSERT INTO client_portal_users (client_id, user_id, email, invited_by)
VALUES ('client-uuid', 'user-uuid', 'yara@nike.com', 'team-leader-uuid');

-- Create portal settings if not exists
INSERT INTO client_portal_settings (client_id, subdomain, logo_url)
VALUES ('client-uuid', 'nike-egypt', 'https://.../nike-logo.png');
```

**Acceptance Criteria:**
- ✅ Team Leader can invite multiple users per client (e.g., Marketing Manager + Brand Manager)
- ✅ Invitation email sent within 30 seconds
- ✅ Portal URL unique per client (subdomain based on client name)
- ✅ Client cannot access main platform (role enforcement)
- ✅ Multiple failed login attempts lock account (security)

***

#### B. Client Portal Dashboard

**Route:** `https://{client-slug}.workit.app/dashboard`

**UI Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Client Logo]  Nike Egypt Portal         [Profile ▼] │ ← White-label header
├──────────────────────────────────────────────────────┤
│ Welcome back, Yara! 👋                               │
│                                                      │
│ ⚠️ Pending Your Review (3)                          │
│ ┌────────────────────────────────────────────────┐  │
│ │ 📄 Design: Instagram Carousel Posts           │  │
│ │    Project: Ramadan Campaign                  │  │
│ │    Submitted: 2 hours ago                     │  │
│ │    [View & Review]                            │  │
│ ├────────────────────────────────────────────────┤  │
│ │ 🎥 Video: Product Launch Teaser               │  │
│ │    Project: Q1 Product Launch                 │  │
│ │    Submitted: 5 hours ago                     │  │
│ │    [View & Review]                            │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 📊 Projects Overview                                 │
│ ┌──────────────┬──────────────┬──────────────────┐  │
│ │ Active (2)   │ Completed (5)│ Upcoming (1)     │  │
│ └──────────────┴──────────────┴──────────────────┘  │
│                                                      │
│ 🎯 Active Projects                                   │
│ ┌────────────────────────────────────────────────┐  │
│ │ Ramadan Campaign 2026                         │  │
│ │ Progress: ████████░░ 80%                      │  │
│ │ Tasks: 12/15 completed                        │  │
│ │ [View Details]                                │  │
│ ├────────────────────────────────────────────────┤  │
│ │ Monthly Social Media - February               │  │
│ │ Progress: ██████████ 100%                     │  │
│ │ Tasks: 20/20 completed                        │  │
│ │ [View Details]                                │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 📅 Recent Activity                                   │
│ • Ahmed uploaded design for review (2h ago)          │
│ • You approved "Facebook Ad Copy" (Yesterday)        │
│ • Sara completed "Weekly Report" (2 days ago)        │
└──────────────────────────────────────────────────────┘
```

**Data Query:**
```sql
-- Get tasks pending client review
SELECT t.*, p.name as project_name
FROM tasks t
JOIN projects p ON p.id = t.project_id
WHERE p.client_id = :client_id
  AND t.status = 'review'
ORDER BY t.updated_at DESC;

-- Get project progress
SELECT 
  p.*,
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_tasks,
  (COUNT(t.id) FILTER (WHERE t.status = 'done')::FLOAT / NULLIF(COUNT(t.id), 0)) * 100 as progress_percentage
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
WHERE p.client_id = :client_id
  AND p.status = 'active'
GROUP BY p.id;
```

**Acceptance Criteria:**
- ✅ Dashboard shows only client's own projects (data isolation via RLS)
- ✅ "Pending Review" section shows tasks with status = 'review' only
- ✅ Project progress calculated in realtime
- ✅ Recent activity shows last 10 actions related to client
- ✅ Mobile responsive (all sections stack vertically)

***

#### C. Task Review & Approval

**Route:** `https://{client-slug}.workit.app/tasks/:taskId`

**UI Layout:**
```
┌──────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                  │
├──────────────────────────────────────────────────────┤
│ Task: Design Instagram Carousel Posts                │
│ Project: Ramadan Campaign 2026                       │
│ Submitted by: Ahmed (Designer)                       │
│ Submitted: 2 hours ago                               │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 📄 Description                                       │
│ Create 3 carousel posts showcasing Ramadan           │
│ collection. Posts should highlight:                  │
│ • New product features                               │
│ • Ramadan-themed visuals                             │
│ • Call-to-action for website visit                   │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 📎 Files (3)                                         │
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │                                              │    │
│ │         [Image Preview]                      │    │
│ │      nike_carousel_1.png                     │    │
│ │                                              │    │
│ │      [< Previous]  1/3  [Next >]            │    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ [Download All Files]                                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 💬 Your Feedback                                     │
│ ┌────────────────────────────────────────────────┐  │
│ │ Add your comments here...                     │  │
│ │ (e.g., "Please make logo larger in post 2")  │  │
│ │                                               │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 🎯 What would you like to do?                        │
│ ┌────────────────────────────────────────────────┐  │
│ │ ✅ Approve                                     │  │
│ │    Work is perfect, ready to publish          │  │
│ │    [Approve & Close]                          │  │
│ ├────────────────────────────────────────────────┤  │
│ │ ✏️ Approve with Minor Changes                 │  │
│ │    Good overall, but needs small edits        │  │
│ │    [Approve with Changes]                     │  │
│ ├────────────────────────────────────────────────┤  │
│ │ ❌ Request Major Revisions                    │  │
│ │    Needs significant rework                   │  │
│ │    [Request Revision]                         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ 📜 Approval History                                  │
│ • Submitted for review by Ahmed (2 hours ago)        │
└──────────────────────────────────────────────────────┘
```

**Approval Actions Logic:**

```typescript
// When client clicks "Approve"
async function approveTask(taskId: string, feedback?: string) {
  // 1. Update task status
  await supabase
    .from('tasks')
    .update({ status: 'done' })
    .eq('id', taskId);

  // 2. Add approval record
  await supabase
    .from('task_approvals')
    .insert({
      task_id: taskId,
      approved_by: clientUserId,
      action: 'approved',
      feedback: feedback,
      approved_at: new Date()
    });

  // 3. Log activity
  await supabase
    .from('activity_logs')
    .insert({
      entity_type: 'task',
      entity_id: taskId,
      user_id: clientUserId,
      action: 'approved'
    });

  // 4. Notify assignee
  await createNotification({
    user_id: task.assigned_to,
    type: 'client_approved',
    title: 'Client approved your work! 🎉',
    message: `${clientName} approved: ${task.title}`,
    link: `/tasks/${taskId}`
  });

  // 5. Send email to assignee (Phase 2 email feature)
  await sendEmail({
    to: assigneeEmail,
    subject: `${clientName} approved: ${task.title}`,
    body: `Congratulations! Your work was approved.`
  });
}

// When client clicks "Approve with Changes"
async function approveWithChanges(taskId: string, feedback: string) {
  // 1. Update task status back to 'in_progress'
  await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', taskId);

  // 2. Add approval record
  await supabase
    .from('task_approvals')
    .insert({
      task_id: taskId,
      approved_by: clientUserId,
      action: 'approved_with_changes',
      feedback: feedback, // Required field
      approved_at: new Date()
    });

  // 3. Add comment with feedback
  await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: clientUserId,
      content: `[Client Feedback]: ${feedback}`
    });

  // 4. Notify assignee
  await createNotification({
    user_id: task.assigned_to,
    type: 'client_requested_changes',
    title: 'Client requested changes',
    message: `${clientName} on: ${task.title}`,
    link: `/tasks/${taskId}`
  });
}

// When client clicks "Request Revision"
async function requestRevision(taskId: string, feedback: string) {
  // Similar to "Approve with Changes" but:
  // - Action: 'revision_requested'
  // - Adds revision count to task
  // - Tracks in analytics (for client difficulty metrics)
}
```

**Database Schema for Approvals:**

```sql
CREATE TABLE task_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id), -- Client user
  action TEXT NOT NULL CHECK (action IN ('approved', 'approved_with_changes', 'revision_requested')),
  feedback TEXT,
  approved_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_task_approvals_task ON task_approvals(task_id);

-- Add revision tracking to tasks
ALTER TABLE tasks 
ADD COLUMN revision_count INTEGER DEFAULT 0,
ADD COLUMN last_reviewed_at TIMESTAMP;
```

**Acceptance Criteria:**
- ✅ Client can view all files attached to task
- ✅ Image files display inline with lightbox (click to zoom)
- ✅ Video files play in-browser player
- ✅ PDF files display in inline viewer
- ✅ Client must add feedback when clicking "Approve with Changes" or "Request Revision" (validation enforced)
- ✅ Approval action changes task status immediately
- ✅ Assignee notified within 30 seconds (in-app + email)
- ✅ Approval logged in Activity Log
- ✅ Mobile responsive (all buttons stack vertically)

***

### 1.4 Client Portal Security

**Authentication:**
- Separate login page per subdomain
- Client role enforced (cannot access main platform)
- Session timeout: 24 hours (configurable)
- MFA optional (Phase 3)

**Data Isolation:**
```sql
-- RLS ensures clients only see their own data
CREATE POLICY "Clients see own tasks only"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN client_portal_users cpu ON cpu.client_id = p.client_id
    WHERE p.id = tasks.project_id
      AND cpu.user_id = auth.uid()
  )
);
```

**Acceptance Criteria:**
- ✅ Client A cannot see Client B's data (tested with automated security tests)
- ✅ Client cannot modify task details (only approve/reject/comment)
- ✅ Client cannot see team's internal comments (if marked as internal - Phase 3)
- ✅ Client cannot access API endpoints for agency operations

***

## 2. Time Tracking

### 2.1 Overview
**Description:** Manual timer for tracking time spent on tasks [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/57205511/56a2b39b-59b8-4047-ab23-3fc50eaafc37/Technical-Details-Features-Implem.md)

**Why Critical:**
- Understand true time investment per task/client
- Accurate billing for hourly projects
- Identify inefficiencies (tasks taking too long)
- Foundation for performance analytics

***

### 2.2 Database Schema

```sql
-- ============================================
-- TIME TRACKING
-- ============================================
CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP, -- Nullable if timer still running
  duration_seconds INTEGER, -- Calculated: end_time - start_time
  notes TEXT, -- Optional note about what was done
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_time_logs_task ON time_logs(task_id);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_date ON time_logs(start_time);

-- Add total time to tasks table
ALTER TABLE tasks 
ADD COLUMN total_time_logged_seconds INTEGER DEFAULT 0;

-- Trigger to update total_time on tasks
CREATE OR REPLACE FUNCTION update_task_total_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    UPDATE tasks 
    SET total_time_logged_seconds = COALESCE(total_time_logged_seconds, 0) + NEW.duration_seconds
    WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_log_update_task_total
  AFTER INSERT OR UPDATE ON time_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_task_total_time();

-- Enable RLS
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see own time logs + managers can see team logs
CREATE POLICY "Users see own time logs"
ON time_logs FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('owner', 'team_leader')
  )
);
```

***

### 2.3 Timer UI & Functionality

#### A. Timer Widget (Task Detail Page)

**UI Location:** Top of task detail view, always visible

```
┌──────────────────────────────────────┐
│ ⏱️ Time Tracker                      │
├──────────────────────────────────────┤
│                                      │
│        ⏱️ 01:23:45                   │ ← Large display
│                                      │
│    [⏸️ Pause]  [⏹️ Stop]             │
│                                      │
│ Total logged: 5.5 hours              │
└──────────────────────────────────────┘
```

**States:**

**1. Not Running (Default):**
```
⏱️ 00:00:00
[▶️ Start Timer]
Total logged: 5.5 hours
```

**2. Running:**
```
⏱️ 01:23:45
[⏸️ Pause]  [⏹️ Stop]
Started: 2:30 PM
```

**3. Paused:**
```
⏱️ 01:23:45 (Paused)
[▶️ Resume]  [⏹️ Stop]
```

***

#### B. Timer Logic & Implementation

```typescript
// Timer State Management (Zustand or React Context)
interface TimerState {
  taskId: string | null;
  startTime: Date | null;
  elapsed: number; // seconds
  isRunning: boolean;
  isPaused: boolean;
  currentLogId: string | null; // Reference to time_logs row
}

// Start Timer
async function startTimer(taskId: string) {
  // Check if another timer is running
  const activeTimer = await supabase
    .from('time_logs')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)
    .single();

  if (activeTimer) {
    // Prompt user: "Stop current timer first?"
    showConfirmation({
      title: 'Another timer is running',
      message: `You have an active timer on "${activeTimer.task_title}". Stop it first?`,
      onConfirm: async () => {
        await stopTimer(activeTimer.id);
        await startTimer(taskId);
      }
    });
    return;
  }

  // Create new time log
  const { data: timeLog } = await supabase
    .from('time_logs')
    .insert({
      task_id: taskId,
      user_id: userId,
      start_time: new Date()
    })
    .select()
    .single();

  // Update local state
  setTimerState({
    taskId,
    startTime: new Date(),
    elapsed: 0,
    isRunning: true,
    isPaused: false,
    currentLogId: timeLog.id
  });

  // Auto-change task status to "in_progress" if "todo"
  const task = await getTask(taskId);
  if (task.status === 'todo') {
    await supabase
      .from('tasks')
      .update({ status: 'in_progress' })
      .eq('id', taskId);
  }

  // Start browser interval (update every second)
  startBrowserTimer();

  // Save to localStorage (persist across page refresh)
  localStorage.setItem('activeTimer', JSON.stringify(timerState));

  // Update browser tab title
  document.title = `⏱️ ${formatTime(elapsed)} - workit`;
}

// Stop Timer
async function stopTimer(logId: string) {
  const endTime = new Date();
  const duration = Math.floor((endTime - timerState.startTime) / 1000);

  // Update time log
  await supabase
    .from('time_logs')
    .update({
      end_time: endTime,
      duration_seconds: duration
    })
    .eq('id', logId);

  // Prompt for notes (optional)
  const notes = await showNotesDialog({
    title: 'Add notes (optional)',
    message: `You worked for ${formatTime(duration)}. What did you accomplish?`,
    placeholder: 'e.g., Completed initial design mockup'
  });

  if (notes) {
    await supabase
      .from('time_logs')
      .update({ notes })
      .eq('id', logId);
  }

  // Clear state
  setTimerState({
    taskId: null,
    startTime: null,
    elapsed: 0,
    isRunning: false,
    isPaused: false,
    currentLogId: null
  });

  localStorage.removeItem('activeTimer');
  document.title = 'workit';
}

// Pause Timer
async function pauseTimer() {
  setTimerState({ ...timerState, isPaused: true });
  // Timer continues in database (start_time unchanged)
  // Local state stores elapsed time
  localStorage.setItem('pausedTimer', JSON.stringify(timerState));
}

// Resume Timer
async function resumeTimer() {
  setTimerState({ ...timerState, isPaused: false });
  startBrowserTimer();
  localStorage.removeItem('pausedTimer');
}
```

***

#### C. Timer Persistence & Edge Cases

**Cross-Page Navigation:**
- Timer state stored in localStorage + React Context
- Timer widget visible on all pages (sticky header)
- Navigating away from task doesn't stop timer

**Browser Refresh:**
- On app load, check localStorage for active timer
- Recalculate elapsed time based on start_time
- Resume timer display

**Multiple Tabs:**
- Use BroadcastChannel API to sync timer across tabs
- If user starts timer in Tab A, Tab B shows warning

**User Logs Out:**
- Auto-stop active timer before logout
- Prompt: "Save active timer before logging out?"

**Idle Detection (Phase 3):**
- Track mouse/keyboard activity
- If idle > 5 minutes, prompt: "Still working?"
- If no response, pause timer

***

#### D. Time Log History

**UI Location:** Task Detail → "Time Logs" tab

```
[Comments] [Activity] [Files] [Time Logs]

┌──────────────────────────────────────────────────┐
│ ⏱️ Time Logs (8 sessions)                        │
│                                                  │
│ Total time logged: 12 hours 35 minutes           │
│                                                  │
├──────────────────────────────────────────────────┤
│ Today                                            │
│ ┌────────────────────────────────────────────┐  │
│ │ 👤 Ahmed - 2:30 PM to 4:45 PM             │  │
│ │    Duration: 2h 15m                       │  │
│ │    Notes: "Completed initial mockup"      │  │
│ │    [Edit] [Delete]                        │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ 👤 Ahmed - 10:00 AM to 12:30 PM           │  │
│ │    Duration: 2h 30m                       │  │
│ │    Notes: "Research and planning"         │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Yesterday                                        │
│ ┌────────────────────────────────────────────┐  │
│ │ 👤 Ahmed - 3:00 PM to 7:15 PM             │  │
│ │    Duration: 4h 15m                       │  │
│ │    Notes: "Final edits and client review" │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [Load More...]                                   │
└──────────────────────────────────────────────────┘
```

**Manual Time Entry (For corrections):**

```
[+ Add Time Manually] Button

Modal:
┌────────────────────────────────────┐
│ Add Time Entry                     │
├────────────────────────────────────┤
│ Date: [Jan 24, 2026 ▼]            │
│ Start Time: [2:00 PM]              │
│ End Time: [4:30 PM]                │
│ Duration: 2h 30m (auto-calculated) │
│                                    │
│ Notes (optional):                  │
│ [Text area________________]        │
│                                    │
│     [Cancel]  [Add Entry]          │
└────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Timer runs accurately (1-second precision)
- ✅ Timer persists across page refresh
- ✅ Only 1 timer can run at a time per user
- ✅ Auto-change task status to "in_progress" when timer starts
- ✅ Stop timer prompts for optional notes
- ✅ Time log history shows all sessions chronologically
- ✅ User can edit/delete own time logs (within 24 hours)
- ✅ Owner/Team Leader can edit any time log
- ✅ Total time displayed in task detail header
- ✅ Mobile: Timer widget in sticky header

***

### 2.4 Time Reports (Basic)

**Route:** `/reports/time`

**Filters:**
- Date range (This Week, This Month, Last Month, Custom Range)
- User (All or specific user)
- Client (All or specific client)
- Project (All or specific project)

**UI:**
```
┌────────────────────────────────────────────────────────┐
│ Time Reports                                           │
│ [This Month ▼] [All Users ▼] [All Clients ▼]         │
├────────────────────────────────────────────────────────┤
│ 📊 Summary                                             │
│ Total Hours Logged: 347.5 hours                        │
│ Billable Hours: 280 hours (80%)                        │
│ Non-billable: 67.5 hours (20%)                         │
│                                                        │
├────────────────────────────────────────────────────────┤
│ 👥 By User                                             │
│ ┌──────────┬─────────────┬──────────────┬──────────┐  │
│ │ User     │ Hours       │ Tasks Done   │ Avg/Task │  │
│ ├──────────┼─────────────┼──────────────┼──────────┤  │
│ │ Ahmed    │ 85.5h       │ 15           │ 5.7h     │  │
│ │ Sara     │ 72.3h       │ 12           │ 6.0h     │  │
│ │ Khaled   │ 95.2h       │ 18           │ 5.3h     │  │
│ │ Mona     │ 94.5h       │ 10           │ 9.5h  ⚠️ │  │
│ └──────────┴─────────────┴──────────────┴──────────┘  │
│                                                        │
│ 🏢 By Client                                           │
│ ┌──────────────┬─────────────┬──────────────────────┐ │
│ │ Client       │ Hours       │ Budget Used          │ │
│ ├──────────────┼─────────────┼──────────────────────┤ │
│ │ Nike Egypt   │ 125.5h      │ 62% of 200h budget   │ │
│ │ Adidas Egypt │ 180.0h ⚠️   │ 90% of 200h budget   │ │
│ │ Puma Egypt   │ 42.0h       │ 21% of 200h budget   │ │
│ └──────────────┴─────────────┴──────────────────────┘ │
│                                                        │
│ 📈 Chart: Hours per Day                                │
│ [Line chart showing daily hours logged]                │
│                                                        │
│ [Export to CSV]                                        │
└────────────────────────────────────────────────────────┘
```

**SQL Query:**
```sql
-- Total hours by user
SELECT 
  u.full_name,
  SUM(tl.duration_seconds) / 3600.0 as total_hours,
  COUNT(DISTINCT tl.task_id) as tasks_completed,
  (SUM(tl.duration_seconds) / 3600.0) / NULLIF(COUNT(DISTINCT tl.task_id), 0) as avg_hours_per_task
FROM time_logs tl
JOIN user_profiles u ON u.user_id = tl.user_id
WHERE tl.start_time >= :start_date
  AND tl.start_time <= :end_date
GROUP BY u.user_id, u.full_name
ORDER BY total_hours DESC;

-- Total hours by client
SELECT 
  c.name as client_name,
  SUM(tl.duration_seconds) / 3600.0 as total_hours
FROM time_logs tl
JOIN tasks t ON t.id = tl.task_id
JOIN projects p ON p.id = t.project_id
JOIN clients c ON c.id = p.client_id
WHERE tl.start_time >= :start_date
  AND tl.start_time <= :end_date
GROUP BY c.id, c.name
ORDER BY total_hours DESC;
```

**Acceptance Criteria:**
- ✅ Report loads within 2 seconds for 1000+ time logs
- ✅ Export to CSV includes all filtered data
- ✅ Chart visualizes time trends clearly
- ✅ Owner sees all data, Team Leader sees only their workspace

***

عايز أكمل بقية Phase 2؟ (Analytics, Calendar View, Files, Strategy, Email Notifications)