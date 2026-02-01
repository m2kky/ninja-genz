<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## 3. Basic Analytics Dashboard

### 3.1 Overview

**Description:** Performance metrics dashboard for Owner/Team Leader to track team and client health[^1]

**Why Critical:**

- Data-driven decision making (hiring, firing, resource allocation)
- Identify top performers and bottlenecks
- Spot problematic clients early
- Foundation for advanced analytics (Phase 4)

***

### 3.2 Database Views \& Calculations

```sql
-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Team Performance Metrics
CREATE OR REPLACE VIEW team_performance AS
SELECT 
  u.id as user_id,
  up.full_name,
  up.avatar_url,
  ur.role,
  
  -- Task completion metrics
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done' AND t.updated_at >= DATE_TRUNC('month', NOW())) as tasks_completed_this_month,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done' AND t.updated_at >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND t.updated_at < DATE_TRUNC('month', NOW())) as tasks_completed_last_month,
  
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('todo', 'in_progress', 'review')) as tasks_active,
  
  COUNT(DISTINCT t.id) FILTER (WHERE t.status != 'done' AND t.deadline < NOW()) as tasks_overdue,
  
  -- Time metrics
  COALESCE(SUM(tl.duration_seconds) FILTER (WHERE tl.start_time >= DATE_TRUNC('month', NOW())), 0) / 3600.0 as hours_logged_this_month,
  
  -- Average completion time (hours between task creation and completion)
  AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600.0) FILTER (WHERE t.status = 'done') as avg_completion_time_hours,
  
  -- On-time delivery rate (%)
  (COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done' AND t.updated_at <= t.deadline)::FLOAT / 
   NULLIF(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done' AND t.deadline IS NOT NULL), 0)) * 100 as on_time_delivery_rate,
  
  -- Quality metrics (based on revisions)
  AVG(t.revision_count) FILTER (WHERE t.status = 'done') as avg_revisions_per_task

FROM auth.users u
JOIN user_profiles up ON up.user_id = u.id
JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN tasks t ON t.assigned_to = u.id
LEFT JOIN time_logs tl ON tl.user_id = u.id
WHERE ur.role IN ('team_leader', 'member')
GROUP BY u.id, up.full_name, up.avatar_url, ur.role;


-- Client Health Metrics
CREATE OR REPLACE VIEW client_health AS
SELECT 
  c.id as client_id,
  c.name as client_name,
  c.status,
  w.name as workspace_name,
  
  -- Task metrics
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') as tasks_completed,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('todo', 'in_progress', 'review')) as tasks_active,
  
  -- Time investment
  COALESCE(SUM(tl.duration_seconds), 0) / 3600.0 as total_hours_logged,
  (COALESCE(SUM(tl.duration_seconds), 0) / 3600.0) / NULLIF(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done'), 0) as avg_hours_per_task,
  
  -- Revision metrics (client difficulty indicator)
  AVG(t.revision_count) FILTER (WHERE t.status = 'done') as avg_revisions_per_task,
  COUNT(DISTINCT ta.id) FILTER (WHERE ta.action = 'revision_requested') as total_revisions_requested,
  
  -- Project metrics
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') as active_projects,
  
  -- Revenue (if budget tracking enabled - Phase 3)
  -- SUM(p.budget) as total_budget

FROM clients c
JOIN workspaces w ON w.id = c.workspace_id
LEFT JOIN projects p ON p.client_id = c.id
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN time_logs tl ON tl.task_id = t.id
LEFT JOIN task_approvals ta ON ta.task_id = t.id
GROUP BY c.id, c.name, c.status, w.name;


-- Project Performance
CREATE OR REPLACE VIEW project_performance AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.type,
  p.status,
  c.name as client_name,
  
  -- Progress
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'done') as tasks_completed,
  (COUNT(t.id) FILTER (WHERE t.status = 'done')::FLOAT / NULLIF(COUNT(t.id), 0)) * 100 as progress_percentage,
  
  -- Time
  COALESCE(SUM(tl.duration_seconds), 0) / 3600.0 as total_hours_logged,
  
  -- Deadlines
  MIN(t.deadline) as earliest_deadline,
  MAX(t.deadline) as latest_deadline,
  
  -- Health indicator
  CASE 
    WHEN p.end_date < NOW() AND progress_percentage < 100 THEN 'overdue'
    WHEN COUNT(t.id) FILTER (WHERE t.deadline < NOW() AND t.status != 'done') > 0 THEN 'at_risk'
    WHEN progress_percentage >= 80 THEN 'on_track'
    ELSE 'in_progress'
  END as health_status

FROM projects p
JOIN clients c ON c.id = p.client_id
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN time_logs tl ON tl.task_id = t.id
GROUP BY p.id, p.name, p.type, p.status, c.name, p.end_date;
```


***

### 3.3 Analytics Dashboard UI

**Route:** `/analytics` (Owner/Team Leader only)

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Analytics Dashboard                                   │
│ [This Month ▼] [All Workspaces ▼]                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 🎯 Key Metrics (This Month)                             │
│ ┌──────────┬──────────┬──────────┬──────────┬─────────┐ │
│ │ 📋 Tasks │ ⏱️ Hours │ 👥 Team  │ 🏢 Clients│ 📈 Rate │ │
│ │  Completed│  Logged  │  Size    │  Active   │ On-Time │ │
│ ├──────────┼──────────┼──────────┼──────────┼─────────┤ │
│ │   156    │  347.5h  │    12    │     8     │   87%   │ │
│ │  +12%    │  +8%     │   +2     │    -1     │  +3%    │ │
│ └──────────┴──────────┴──────────┴──────────┴─────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 👥 Team Performance                                      │
│                                                          │
│ [Sort by: Tasks ▼] [Filter: All Roles ▼]               │
│                                                          │
│ ┌──────┬────────┬──────┬───────┬────────┬─────┬──────┐ │
│ │ Rank │ Name   │ Tasks│ Hours │Avg Time│Rate │Status│ │
│ ├──────┼────────┼──────┼───────┼────────┼─────┼──────┤ │
│ │  🥇  │ Khaled │  28  │ 95.2h │ 3.4h   │ 95% │  ⭐  │ │
│ │      │ Designer│ +5   │ +12h  │        │     │      │ │
│ ├──────┼────────┼──────┼───────┼────────┼─────┼──────┤ │
│ │  🥈  │ Ahmed  │  25  │ 85.5h │ 3.4h   │ 92% │  ✅  │ │
│ │      │ Designer│ +3   │ +8h   │        │     │      │ │
│ ├──────┼────────┼──────┼───────┼────────┼─────┼──────┤ │
│ │  🥉  │ Sara   │  22  │ 72.3h │ 3.3h   │ 90% │  ✅  │ │
│ │      │ Writer │ +2   │ +5h   │        │     │      │ │
│ ├──────┼────────┼──────┼───────┼────────┼─────┼──────┤ │
│ │  4   │ Mona   │  15  │ 94.5h │ 6.3h⚠️│ 75% │  ⚠️  │ │
│ │      │ Designer│ -2   │ +15h  │        │     │      │ │
│ └──────┴────────┴──────┴───────┴────────┴─────┴──────┘ │
│                                                          │
│ 💡 Insights:                                             │
│ • Mona's avg task time 6.3h (team avg: 3.6h). Review?   │
│ • Khaled completed 28 tasks with 95% on-time rate 🎉    │
│                                                          │
│ [View Individual Reports →]                              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🏢 Client Health                                         │
│                                                          │
│ [Sort by: Hours ▼]                                      │
│                                                          │
│ ┌──────────────┬──────┬───────┬─────────┬────────┬────┐│
│ │ Client       │ Tasks│ Hours │ Hrs/Task│Revisions│ 🚦 ││
│ ├──────────────┼──────┼───────┼─────────┼────────┼────┤│
│ │ Nike Egypt   │  45  │ 125.5h│  2.8h   │  1.2   │ 🟢 ││
│ │ 3 projects   │      │       │         │        │    ││
│ ├──────────────┼──────┼───────┼─────────┼────────┼────┤│
│ │ Adidas Egypt │  28  │ 180.0h│  6.4h⚠️│  3.5⚠️ │ 🟡 ││
│ │ 2 projects   │      │       │         │        │    ││
│ ├──────────────┼──────┼───────┼─────────┼────────┼────┤│
│ │ Puma Egypt   │  32  │  42.0h│  1.3h   │  0.8   │ 🟢 ││
│ │ 1 project    │      │       │         │        │    ││
│ └──────────────┴──────┴───────┴─────────┴────────┴────┘│
│                                                          │
│ 💡 Insights:                                             │
│ • Adidas Egypt: High hours/task ratio (6.4h vs 2.8h avg)│
│ • Adidas Egypt: 3.5 avg revisions (team avg: 1.5)       │
│ • Consider: Scope clarity? Expectations management?      │
│                                                          │
│ [View Client Details →]                                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Charts                                                │
│                                                          │
│ ┌──────────────────────┬──────────────────────┐         │
│ │ Tasks Completed      │ Hours Logged         │         │
│ │ (Last 30 Days)       │ (Last 30 Days)       │         │
│ │                      │                      │         │
│ │ [Line Chart]         │ [Bar Chart]          │         │
│ │                      │                      │         │
│ └──────────────────────┴──────────────────────┘         │
│                                                          │
│ [Export All Data to CSV]                                 │
└──────────────────────────────────────────────────────────┘
```


***

### 3.4 Individual User Report

**Route:** `/analytics/users/:userId`

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Analytics                                      │
├──────────────────────────────────────────────────────────┤
│ 👤 Ahmed Hassan - Performance Report                    │
│ Senior Designer • Member since Dec 2025                  │
│                                                          │
│ [This Month ▼]                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Summary                                               │
│ ┌──────────┬──────────┬──────────┬──────────┐           │
│ │ Tasks    │ Hours    │ Avg Time │ On-Time  │           │
│ │ Done     │ Logged   │ per Task │ Rate     │           │
│ ├──────────┼──────────┼──────────┼──────────┤           │
│ │   25     │  85.5h   │  3.4h    │   92%    │           │
│ │  +3 vs   │  +8h     │  -0.2h   │  +5%     │           │
│ │ last mo. │          │          │          │           │
│ └──────────┴──────────┴──────────┴──────────┘           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📋 Tasks Breakdown                                       │
│                                                          │
│ Status Distribution:                                     │
│ ✅ Done: 25 (62%)                                        │
│ 🔄 In Progress: 8 (20%)                                  │
│ 📝 To Do: 5 (13%)                                        │
│ 👀 Review: 2 (5%)                                        │
│                                                          │
│ By Client:                                               │
│ • Nike Egypt: 12 tasks (48%)                             │
│ • Adidas Egypt: 8 tasks (32%)                            │
│ • Puma Egypt: 5 tasks (20%)                              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🎯 Performance Trends                                    │
│                                                          │
│ [Chart: Tasks completed per week - Last 4 weeks]         │
│ Week 1: 5 tasks                                          │
│ Week 2: 7 tasks                                          │
│ Week 3: 6 tasks                                          │
│ Week 4: 7 tasks ← Consistent! 📈                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ⚡ Strengths                                             │
│ • High on-time delivery rate (92%, team avg: 87%)       │
│ • Efficient: 3.4h avg per task (team avg: 3.6h)         │
│ • Consistent output: ~6-7 tasks/week                     │
│                                                          │
│ 💡 Areas for Improvement                                 │
│ • 2 tasks currently overdue (Design IG Carousel, etc.)   │
│ • Consider better deadline estimation                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📝 Recent Tasks                                          │
│                                                          │
│ ✅ Design Facebook Ad Creative (Nike) - 2.5h - Jan 23   │
│ ✅ Create Instagram Story (Adidas) - 1.2h - Jan 22      │
│ ✅ Edit Product Photos (Puma) - 4.1h - Jan 22           │
│ 🔄 Design IG Carousel (Nike) - 3.2h logged - In Progress│
│ ⏰ Create Brand Guidelines (Adidas) - Not started        │
│                                                          │
│ [View All Tasks →]                                       │
│                                                          │
│ [Export Report to PDF]                                   │
└──────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- ✅ Dashboard loads in < 2 seconds for 1000+ tasks
- ✅ Team performance table sortable by any column
- ✅ Insights auto-generated (e.g., detect outliers in avg time)
- ✅ Charts update when filters change
- ✅ Owner sees all data, Team Leader sees only their workspace
- ✅ Export to CSV includes all visible data
- ✅ Individual reports drill down to specific tasks

***

## 4. Calendar View

### 4.1 Overview

**Description:** Visualize tasks by deadline on monthly/weekly/daily calendar[^2]

**Why Critical:**

- See workload distribution at a glance
- Identify deadline conflicts
- Better capacity planning
- Drag-and-drop reschedule tasks

***

### 4.2 Implementation

**Library:** FullCalendar.js or React Big Calendar

**Database Query:**

```sql
-- Get tasks with deadlines for calendar
SELECT 
  t.id,
  t.title,
  t.deadline,
  t.status,
  t.priority,
  t.assigned_to,
  up.full_name as assignee_name,
  up.avatar_url as assignee_avatar,
  c.name as client_name,
  p.name as project_name
FROM tasks t
LEFT JOIN user_profiles up ON up.user_id = t.assigned_to
JOIN projects p ON p.id = t.project_id
JOIN clients c ON c.id = p.client_id
WHERE t.deadline IS NOT NULL
  AND t.deadline >= :start_date
  AND t.deadline <= :end_date
  -- Filter by workspace if Team Leader
ORDER BY t.deadline ASC;
```


***

### 4.3 Calendar UI

**Route:** `/calendar`

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ 📅 Calendar View                                         │
│                                                          │
│ [Table] [Kanban] [Calendar] [Timeline]                  │
│                                                          │
│ [← Previous]  January 2026  [Next →]  [Today]           │
│ [Month View] [Week View] [Day View]                     │
│                                                          │
│ Filters: [All Status ▼] [All Users ▼] [All Clients ▼]  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│         Mon    Tue    Wed    Thu    Fri    Sat    Sun   │
├──────────────────────────────────────────────────────────┤
│                              1      2      3      4      │
│                              🔴2    🟡1           🟢1    │
│                                                          │
│   5      6      7      8      9     10     11            │
│  🟡1    🔴3    🟢2    🟡1    🔴1    🟢1                 │
│                                                          │
│  12     13     14     15     16     17     18            │
│  🟢1    🔴1    🟡2    🔴2    🟡1    🟢2    🔴1          │
│                                                          │
│  19     20     21     22     23     24     25            │
│  🟡1    🔴2    🟢1    🟡3    🔴4    🟡2    🟢1          │
│                                     ^^^                  │
│                                  Today                   │
│  26     27     28     29     30     31                   │
│  🔴2    🟡1    🔴3    🟢1    🟡2                         │
│                                                          │
└──────────────────────────────────────────────────────────┘

Legend: 🔴 High Priority  🟡 Medium Priority  🟢 Low Priority

Unscheduled Tasks (No Deadline): 12 tasks
[View Unscheduled →]
```


***

### 4.4 Day View (Detailed)

**Click on a date:**

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Month View                                     │
│                                                          │
│ Friday, January 24, 2026                                 │
│ 4 tasks due today                                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🔴 High Priority (2)                                     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔴 Design Instagram Carousel Posts                 │  │
│ │ Client: Nike Egypt • Project: Ramadan Campaign     │  │
│ │ Assigned: Ahmed (Designer)                         │  │
│ │ Status: In Progress                                │  │
│ │ [Open Task]                                        │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔴 Write Ad Copy for Facebook Campaign             │  │
│ │ Client: Adidas Egypt • Project: Q1 Launch          │  │
│ │ Assigned: Sara (Copywriter)                        │  │
│ │ Status: To Do                                      │  │
│ │ [Open Task]                                        │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 🟡 Medium Priority (2)                                   │
│ [Show tasks...]                                          │
│                                                          │
│ [+ Create New Task for this Date]                       │
└──────────────────────────────────────────────────────────┘
```


***

### 4.5 Drag-and-Drop Reschedule

**Behavior:**

1. User drags task card from one date to another
2. Confirmation modal: "Reschedule task to January 28?"
3. On confirm:
    - Update `tasks.deadline` in database
    - Log in Activity Log: "User changed deadline from Jan 24 to Jan 28"
    - Notify assignee: "Deadline changed for: [Task Title]"
4. Calendar updates in realtime for all viewers

**Implementation:**

```typescript
// FullCalendar event drag handler
const handleEventDrop = async (info: EventDropArg) => {
  const taskId = info.event.id;
  const newDeadline = info.event.start;
  
  // Show confirmation
  const confirmed = await showConfirmation({
    title: 'Reschedule Task?',
    message: `Move "${info.event.title}" to ${formatDate(newDeadline)}?`,
  });
  
  if (!confirmed) {
    info.revert(); // Revert drag if cancelled
    return;
  }
  
  // Update database
  const { error } = await supabase
    .from('tasks')
    .update({ deadline: newDeadline })
    .eq('id', taskId);
  
  if (error) {
    showError('Failed to reschedule task');
    info.revert();
    return;
  }
  
  // Success
  showSuccess('Task rescheduled');
};
```

**Acceptance Criteria:**

- ✅ All 3 views functional (Month, Week, Day)
- ✅ Tasks color-coded by priority
- ✅ Click task opens in user's preferred view mode (side/center/full)
- ✅ Drag-and-drop reschedule works smoothly
- ✅ Reschedule requires confirmation
- ✅ Realtime updates (other users see changes within 2 seconds)
- ✅ "Unscheduled Tasks" section shows tasks without deadlines
- ✅ Mobile: Calendar responsive (switches to list view)

***

## 5. File Management (Full Features)

### 5.1 Overview

**Description:** Complete file upload, preview, organize, and version control[^1]

**Phase 1 had:** Basic upload infrastructure
**Phase 2 adds:** Drag-and-drop, inline preview, file versioning, organize by type

***

### 5.2 Enhanced Database Schema

```sql
-- Update files table (already exists from Phase 1)
ALTER TABLE files 
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN parent_file_id UUID REFERENCES files(id) ON DELETE SET NULL, -- For versioning
ADD COLUMN thumbnail_url TEXT, -- For image/video thumbnails
ADD COLUMN metadata JSONB; -- Store width/height for images, duration for videos

-- File categories for organization
CREATE TABLE file_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT, -- Emoji or icon name
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Many-to-many: Files can have multiple categories
CREATE TABLE file_category_mappings (
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  category_id UUID REFERENCES file_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (file_id, category_id)
);
```


***

### 5.3 File Upload UI (Enhanced)

**Location:** Task Detail → "Files" tab

**UI:**

```
[Comments] [Activity] [Files (8)] [Time Logs]

┌──────────────────────────────────────────────────────────┐
│ 📎 Files (8)                                             │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │  📤 Drag & drop files here or click to browse        ││
│ │     Supports: Images, Videos, PDFs, Office files     ││
│ │     Max size: 10MB per file (Phase 2)                ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ [All Files ▼] [Sort by: Date ▼] [Grid View] [List View]│
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Images (5)                                               │
│                                                          │
│ ┌─────────┬─────────┬─────────┬─────────┐              │
│ │[Thumb]  │[Thumb]  │[Thumb]  │[Thumb]  │              │
│ │design_1 │design_2 │design_3 │logo.png │              │
│ │2.3 MB   │1.8 MB   │2.1 MB   │0.5 MB   │              │
│ │Ahmed    │Ahmed    │Sara     │Ahmed    │              │
│ │2h ago   │5h ago   │Yesterday│Jan 20   │              │
│ │[↓][👁][🗑]│[↓][👁][🗑]│[↓][👁][🗑]│[↓][👁][🗑]│              │
│ └─────────┴─────────┴─────────┴─────────┘              │
│                                                          │
│ Documents (2)                                            │
│ ┌──────────────────────────────────────────────────┐    │
│ │ 📄 brand-guidelines.pdf                          │    │
│ │    3.5 MB • Uploaded by Layla • Jan 22           │    │
│ │    [Download] [Preview] [Delete]                 │    │
│ ├──────────────────────────────────────────────────┤    │
│ │ 📊 campaign-report.xlsx                          │    │
│ │    1.2 MB • Uploaded by Ahmed • Jan 21           │    │
│ │    [Download] [Preview] [Delete]                 │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ Videos (1)                                               │
│ ┌──────────────────────────────────────────────────┐    │
│ │ 🎥 product-teaser.mp4                            │    │
│ │    8.7 MB • 0:45 duration • Khaled • Yesterday   │    │
│ │    [Play] [Download] [Delete]                    │    │
│ └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```


***

### 5.4 File Preview (Lightbox)

**Click "Preview" or thumbnail:**

```
┌──────────────────────────────────────────────────────────┐
│ [X Close]                               [↓ Download]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│               [Full-size Image Preview]                  │
│                                                          │
│                  design_1.png                            │
│                  1920x1080 • 2.3 MB                      │
│                                                          │
│                                                          │
│ [< Previous]              1 of 5              [Next >]   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📝 Details                                               │
│ Uploaded: 2 hours ago by Ahmed Hassan                    │
│ File size: 2.3 MB                                        │
│ Dimensions: 1920x1080                                    │
│                                                          │
│ 🔗 Share Link: [Copy URL]                               │
│ 📁 Categories: [Design][Final]                           │
│                                                          │
│ [Replace with New Version]  [Delete]                     │
└──────────────────────────────────────────────────────────┘
```


***

### 5.5 File Versioning

**Replace File Flow:**

1. Click "Replace with New Version" in file preview
2. Upload new file
3. Database:

```sql
-- Create new file record
INSERT INTO files (task_id, filename, file_url, version, parent_file_id, uploaded_by)
VALUES (:task_id, 'design_1_v2.png', :url, 2, :old_file_id, :user_id);
```

4. UI shows version history:

```
Version History:
-  Version 2 (Current) - Uploaded 5 min ago by Ahmed
-  Version 1 - Uploaded 2 hours ago by Ahmed [Restore]
```


**Acceptance Criteria:**

- ✅ Drag-and-drop upload (multiple files simultaneously)
- ✅ Upload progress bar for each file
- ✅ Image files: Generate thumbnails (Supabase Image Transformation)
- ✅ Images preview inline with lightbox
- ✅ Videos play in-browser player with controls
- ✅ PDFs display in inline viewer (PDF.js)
- ✅ Office files (DOCX, XLSX, PPTX): Download only (preview Phase 3)
- ✅ File versioning: Keep history, restore previous versions
- ✅ Delete file: Confirmation required, logged in Activity Log
- ✅ Client portal: Clients can view/download files but cannot delete

***

## 6. Strategy Section (Per Client)

### 6.1 Overview

**Description:** Store and organize client strategy documents[^2]

**Use Cases:**

- Content strategy and calendar
- Paid ads strategy
- SEO strategy
- Competitor analysis notes
- KPIs and goals

***

### 6.2 Database Schema

```sql
CREATE TABLE client_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('content', 'paid_ads', 'seo', 'competitor', 'kpis', 'other')),
  title TEXT NOT NULL,
  content TEXT, -- Rich text (HTML or Markdown)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_edited_by UUID REFERENCES auth.users(id)
);

-- Attachments for strategies
CREATE TABLE strategy_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES client_strategies(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_strategies_client ON client_strategies(client_id);
```


***

### 6.3 Strategy UI

**Route:** `/clients/:clientId/strategy`

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Client: Nike Egypt                                       │
│ [Projects] [Brand Kit] [Strategy] [Files] [Team]        │
├──────────────────────────────────────────────────────────┤
│ 📋 Strategy                              [+ New Document]│
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📄 Content Strategy - Q1 2026                      │  │
│ │    Updated 3 days ago by Layla (Team Leader)       │  │
│ │    [View] [Edit] [...]                             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📊 Paid Ads Strategy - Ramadan Campaign            │  │
│ │    Updated 1 week ago by Ahmed                     │  │
│ │    Attachments: campaign-brief.pdf (2)             │  │
│ │    [View] [Edit] [...]                             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🎯 KPIs & Goals - 2026                             │  │
│ │    Updated 2 weeks ago by Owner                    │  │
│ │    [View] [Edit] [...]                             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔍 Competitor Analysis                             │  │
│ │    Updated 1 month ago by Sara                     │  │
│ │    [View] [Edit] [...]                             │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```


***

### 6.4 Strategy Editor

**Click "Edit" or "New Document":**

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Strategy List                                  │
│                                                          │
│ Edit Strategy Document                                   │
│                                                          │
│ Type: [Content Strategy ▼]                              │
│ Title: [Content Strategy - Q1 2026____________]          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Content:                                                 │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ [B] [I] [U] [Link] [H1] [H2] [Bullet] [Number]      ││
│ ├──────────────────────────────────────────────────────┤│
│ │                                                      ││
│ │ ## Content Pillars                                   ││
│ │                                                      ││
│ │ 1. **Product Highlights**                            ││
│ │    - Focus on new Ramadan collection                 ││
│ │    - Showcase quality and craftsmanship              ││
│ │                                                      ││
│ │ 2. **Lifestyle & Inspiration**                       ││
│ │    - Behind-the-scenes content                       ││
│ │    - Customer testimonials                           ││
│ │                                                      ││
│ │ 3. **Community Engagement**                          ││
│ │    - User-generated content campaigns                ││
│ │    - Interactive polls and Q&A                       ││
│ │                                                      ││
│ │ ## Posting Schedule                                  ││
│ │ - Instagram: 5 posts/week (Mon, Wed, Fri, Sat, Sun) ││
│ │ - Facebook: 3 posts/week (Tue, Thu, Sat)            ││
│ │ - LinkedIn: 1 post/week (Wednesday)                  ││
│ │                                                      ││
│ │ [Rich text editor area...]                           ││
│ │                                                      ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ 📎 Attachments (2)                                       │
│ • content-calendar-jan.xlsx (1.2 MB) [Delete]           │
│ • brand-voice-guidelines.pdf (3.5 MB) [Delete]          │
│ [+ Upload File]                                          │
│                                                          │
│            [Cancel]  [Save Draft]  [Publish]             │
└──────────────────────────────────────────────────────────┘
```

**Rich Text Editor:** Tiptap or Lexical (React-based)

**Acceptance Criteria:**

- ✅ Owner/Team Leader can create/edit strategies
- ✅ Team members can view strategies (read-only)
- ✅ Rich text editor supports: bold, italic, headings, lists, links
- ✅ Attach files (PDFs, spreadsheets, presentations)
- ✅ Version history (Phase 3 - track changes over time)
- ✅ Strategies accessible from client detail page
- ✅ Mobile responsive (editor switches to mobile-optimized view)

***

## 7. Email Notifications

### 7.1 Overview

**Description:** Send critical notifications via email, not just in-app[^3]

**Why Critical:**

- Users don't stay logged in 24/7
- Email ensures timely responses
- Professional communication channel

***

### 7.2 Email Service Setup

**Service:** Resend (recommended) or SendGrid

**Supabase Integration:**

```typescript
// Supabase Edge Function: send-email
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  const { to, subject, html, from } = await req.json();
  
  const { data, error } = await resend.emails.send({
    from: from || 'workit <notifications@workit.app>',
    to: [to],
    subject: subject,
    html: html,
  });
  
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }
  
  return new Response(JSON.stringify({ data }), { status: 200 });
});
```


***

### 7.3 Email Triggers (Phase 2)

| Event | Trigger | Recipient | Email Subject |
| :-- | :-- | :-- | :-- |
| **Task Assigned** | Task assigned to user | Assignee | "New task assigned: [Task Title]" |
| **Deadline Approaching** | 24 hours before deadline | Assignee | "⏰ Task due tomorrow: [Task Title]" |
| **Task Overdue** | Task passed deadline | Assignee + Team Leader | "⚠️ Overdue: [Task Title]" |
| **Client Approval** | Client approved/rejected work | Assignee | "Client approved: [Task Title]" or "Client requested changes" |
| **Comment Added** | Comment on assigned task | Assignee (if not commenter) | "[User] commented on: [Task Title]" |
| **Status Changed** | Task status changed | Assignee + Creator | "[Task Title] status changed to [Status]" |


***

### 7.4 Email Templates

**Template: Task Assigned**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; padding: 30px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { background: #667eea; color: white; padding: 12px 24px; 
              text-decoration: none; border-radius: 6px; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Task Assigned</h1>
    </div>
    <div class="content">
      <p>Hi Ahmed,</p>
      <p><strong>Layla</strong> assigned a new task to you:</p>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h2 style="margin-top: 0;">Design Instagram Carousel Posts</h2>
        <p><strong>Client:</strong> Nike Egypt</p>
        <p><strong>Project:</strong> Ramadan Campaign 2026</p>
        <p><strong>Deadline:</strong> January 28, 2026</p>
        <p><strong>Priority:</strong> 🔴 High</p>
      </div>
      
      <p>
        <a href="https://workit.app/tasks/task-uuid" class="button">
          View Task Details →
        </a>
      </p>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        💡 Tip: Start the timer when you begin working to track your time.
      </p>
    </div>
    <div class="footer">
      <p>You're receiving this because you're part of the workit team.</p>
      <p><a href="https://workit.app/settings/notifications">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
```


***

### 7.5 Email Notification Settings

**User Settings Page:**

```
🔔 Notification Preferences

In-App Notifications:
☑ Task assigned to me
☑ Task deadline approaching (24h)
☑ Task overdue
☑ Comments added to my tasks
☑ Task status changed

Email Notifications:
☑ Task assigned to me
☑ Task deadline approaching (24h)
☑ Task overdue
☐ Comments added (too noisy, disabled)
☐ Task status changed (too noisy, disabled)
☑ Client approved/rejected work

Email Digest:
☐ Daily summary (8:00 AM)
☑ Weekly summary (Monday 9:00 AM)

[Save Preferences]
```


***

### 7.6 Email Queue System

**Database Schema:**

```sql
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at);
```

**Email Worker (Supabase Cron Job):**

```typescript
// Runs every 5 minutes
// SELECT * FROM email_queue WHERE status = 'pending' AND scheduled_at <= NOW()
// For each email:
//   1. Call send-email Edge Function
//   2. Update status to 'sent' or 'failed'
//   3. Retry failed emails (max 3 attempts)
```

**Acceptance Criteria:**

- ✅ Emails sent within 1 minute of trigger event
- ✅ Email delivery rate > 95%
- ✅ Failed emails retry automatically (max 3 attempts)
- ✅ Users can customize email preferences
- ✅ Emails comply with CAN-SPAM Act (unsubscribe link, physical address)
- ✅ Email templates mobile-responsive
- ✅ Deep links in emails navigate directly to task/project

***

## Phase 2: Sprint Planning

### Sprint 7: Client Portal Foundation (Weeks 13-14)

- [ ] Client portal subdomain routing
- [ ] Client invitation system
- [ ] Client dashboard UI
- [ ] Client authentication (separate from main platform)
- [ ] RLS policies for client data isolation
- [ ] Task review UI (approve/reject/comment)
- [ ] Approval logic and notifications

**Deliverables:**

- ✅ Clients can login to portal
- ✅ Clients can approve/reject work
- ✅ Data isolation verified

***

### Sprint 8: Time Tracking \& Analytics (Weeks 15-16)

- [ ] Time tracking widget (play/pause/stop timer)
- [ ] Timer persistence (localStorage + database)
- [ ] Time log history UI
- [ ] Manual time entry form
- [ ] Analytics dashboard (team performance)
- [ ] Analytics dashboard (client health)
- [ ] Individual user reports
- [ ] Export to CSV functionality

**Deliverables:**

- ✅ Timer functional and accurate
- ✅ Analytics dashboard operational
- ✅ Reports generated correctly

***

### Sprint 9: Calendar \& Files (Weeks 17-18)

- [ ] Calendar view integration (FullCalendar.js)
- [ ] Month/Week/Day views
- [ ] Drag-and-drop reschedule
- [ ] File upload drag-and-drop
- [ ] File preview (images, videos, PDFs)
- [ ] File versioning
- [ ] Thumbnail generation

**Deliverables:**

- ✅ Calendar fully functional
- ✅ File management complete

***

### Sprint 10: Strategy \& Email (Weeks 19-20)

- [ ] Strategy section CRUD
- [ ] Rich text editor (Tiptap)
- [ ] Strategy attachments
- [ ] Email service setup (Resend)
- [ ] Email templates
- [ ] Email queue system
- [ ] Email notification preferences
- [ ] Beta testing with 5-10 agencies
- [ ] Bug fixes and polish

**Deliverables:**

- ✅ Strategy documents functional
- ✅ Email notifications working
- ✅ Platform ready for wider beta

***

## Phase 2: Success Criteria

**At end of Month 5:**

✅ **Functional:**

- 5-10 external agencies in closed beta
- 70%+ client portal adoption (clients login weekly)
- 60%+ time tracking adoption (hours logged)

✅ **User Feedback:**

- 30%+ reduction in client WhatsApp messages
- 80%+ clients prefer portal over WhatsApp
- Team Leaders find analytics "very useful"

✅ **Technical:**

- 100 concurrent users, no performance issues
- Multi-tenancy secure (penetration tested)
- Email delivery rate > 95%

✅ **Business:**

- 3+ case studies from beta users
- Pricing validated (\$30-70/month feasible)
- Feature roadmap refined based on feedback

***

**Phase 2 كامل! 🚀**

**التالي:**

- Phase 3: Productivity \& Culture
- أو Part 3: Complete System Design (Database Schema + Architecture)?

<div align="center">⁂</div>

[^1]: Product-Vision-Document1.1.md

[^2]: Technical-Details-Features-Implem.md

[^3]: Product-Vision-Document1.2.md

