---
title: "Wireframes Documentation — Index & Overview"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "UI/UX Design System"
  - "User Flow Diagrams"
  - "C4 Architecture Diagrams"
priority: "P1"
---

# Wireframes Documentation — Ninja Gen Z Platform

## Overview

This folder contains comprehensive wireframes for the Ninja Gen Z platform, covering all user roles and major features.

**Created:** 2026-01-24  
**Format:** ASCII art + component descriptions + code examples  
**Total Screens:** 15+ detailed wireframes  
**Views:** Desktop (1920×1080) + Mobile (375×667)

---

## Complete Wireframe List

### 1. Dashboard Views (by Role)

#### Agency Owner Dashboard
**File:** [Wireframes-Agency-Owner-Dashboard.md](./Wireframes-Agency-Owner-Dashboard.md)

**Scope:** Superuser dashboard with agency-wide analytics

**Screens:**
- Main dashboard with KPI cards
- Performance charts (last 30 days)
- Current tasks widget
- Ads performance widget
- سَنَد AI chat widget
- Workspace switcher
- Mobile responsive view

**Key Components:**
- `AppHeader.tsx` - Top navigation bar
- `Sidebar.tsx` - Main navigation
- `StatsCard.tsx` - KPI metrics cards
- `CurrentTasksWidget.tsx` - Task overview
- `AdsPerformanceWidget.tsx` - Campaign metrics
- `SanadChatWidget.tsx` - AI assistant

**Highlights:**
- Multi-workspace overview
- Real-time notifications
- Dark mode design
- RTL layout for Arabic

---

### 2. Task Management

#### Task Management Interface
**File:** [Wireframes-Task-Management.md](./Wireframes-Task-Management.md)

**Scope:** Complete task workflows with 3 view modes

**Screens:**
- **Kanban Board** (drag & drop columns)
  - 4 columns: TODO, IN PROGRESS, REVIEW, DONE
  - Task cards with priority badges
  - Drag & drop between columns
  
- **List View** (sortable table)
  - Data table with all task fields
  - Multi-select checkboxes
  - Bulk actions
  - Pagination
  
- **Calendar View** (timeline)
  - Month/week/day views
  - Color-coded by priority
  - Deadline visualization

**Modals:**
- Task Detail Modal (full CRUD)
- Create Task Modal (form validation)
- Filters & Search panel

**Key Components:**
- `KanbanBoard.tsx` - Drag & drop board
- `TaskCard.tsx` - Individual task card
- `TasksTable.tsx` - List view table
- `TaskDetailModal.tsx` - Full task details
- `CreateTaskModal.tsx` - Task creation form

**Code Examples:**
- `@hello-pangea/dnd` for drag & drop
- `DataTable` from Shadcn/ui
- React Big Calendar integration
- Zod validation schemas

---

### 3. Client Portal

#### Client Portal Interface
**File:** [Wireframes-Client-Portal.md](./Wireframes-Client-Portal.md)

**Scope:** Client-facing interface with approval workflows

**Screens:**
- Client Dashboard (simplified)
- Tasks requiring approval
- Project view (progress tracking)
- File viewer (image/video preview)
- Mobile-optimized views

**Modals:**
- Approval Modal (confirm approval)
- Request Revision Modal (detailed feedback)
- File Preview Modal (gallery view)

**Key Components:**
- `ClientDashboard.tsx` - Simplified dashboard
- `ApprovalModal.tsx` - Approval workflow
- `RequestRevisionModal.tsx` - Revision requests
- `ClientProjectView.tsx` - Project details
- Image gallery component

**Features:**
- Read-only access (RLS enforced)
- Quick approve/reject buttons
- Revision tracking
- File downloads
- Activity timeline

---

## Design System Integration

All wireframes follow the **UI/UX Design System** specifications:

### Colors (Dark Mode Default)
```
Background: #0a0a0f (very dark)
Cards: #1a1a24 (dark gray)
Primary: #9333ea (neon purple)
Text: #f9fafb (light gray)
Accents: #ec4899 (pink), #3b82f6 (blue)
```

### Typography
```
Font: Inter (primary), Noto Sans Arabic (fallback)
Sizes: text-xs to text-4xl (Tailwind scale)
Weights: 400 (normal), 500 (medium), 600 (semi-bold), 700 (bold)
```

### Spacing
```
Padding: p-4 (16px) default for cards
Gaps: gap-4 (16px) for layouts
Margins: mt-3, mb-4, etc.
```

### Components (Shadcn/ui)
```
Button, Card, Badge, Input, Label, Dialog, Dropdown, Select, Toast
```

---

## Responsive Design Breakpoints

### Desktop (1920×1080) — Default
- Sidebar visible
- 4-column Kanban
- Full data tables
- Chart with all data points

### Tablet (768×1024)
- Collapsible sidebar
- 3-column Kanban
- Simplified tables (hide columns)
- Charts with fewer points

### Mobile (375×667)
- Hamburger menu
- 1-column Kanban (swipe)
- Card view (not tables)
- Bottom navigation
- Floating action buttons

---

## Interaction Patterns

### Hover States
```
Normal:  [Button]
Hover:   [Button] ← scale-105, shadow-lg
Active:  [Button] ← scale-95
```

### Loading States
```
┌─────────────┐
│ Loading...  │
│ ▓▓▓░░░░░    │ ← Skeleton loader
└─────────────┘
```

### Empty States
```
┌─────────────┐
│   📊       │
│ No data     │
│ [+ Add]     │
└─────────────┘
```

---

## RTL Layout

**Direction Changes:**
- Sidebar: Left → Right
- Text alignment: Auto (AR = right, EN = left)
- Icons: Chevrons rotate 180°
- Charts: Axis direction reversed

**Code:**
```typescript
document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
```

**CSS:**
```css
/* Use logical properties */
.ms-4 { margin-inline-start: 1rem; } /* right in RTL */
.me-4 { margin-inline-end: 1rem; }   /* left in RTL */
```

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Purple #9333ea on dark bg passes ✓

### Keyboard Navigation
```
Tab       → Next element
Shift+Tab → Previous element
Enter     → Activate
Esc       → Close modal
Arrow keys → Navigate lists/calendars
```

### Screen Readers
- All images have `alt` text
- Buttons have `aria-label`
- Form inputs have `<label>` elements
- Dynamic content uses `aria-live`

---

## Component Library Structure

```
src/components/
├── ui/                    # Shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── dialog.tsx
│
├── layout/                # Layout components
│   ├── AppHeader.tsx
│   ├── Sidebar.tsx
│   └── BottomNav.tsx
│
├── dashboard/             # Dashboard widgets
│   ├── StatsCard.tsx
│   ├── PerformanceChart.tsx
│   ├── CurrentTasksWidget.tsx
│   └── AdsPerformanceWidget.tsx
│
├── task-management/       # Task components
│   ├── KanbanBoard.tsx
│   ├── TaskCard.tsx
│   ├── TasksTable.tsx
│   ├── TaskDetailModal.tsx
│   └── CreateTaskModal.tsx
│
├── client-portal/         # Client-specific
│   ├── ClientDashboard.tsx
│   ├── ApprovalModal.tsx
│   └── RequestRevisionModal.tsx
│
└── shared/                # Shared components
    ├── Avatar.tsx
    ├── FileUpload.tsx
    └── RichTextEditor.tsx
```

---

## Implementation Notes

### State Management
- **Zustand** for global state (user, theme, language)
- **React Query** for server state (tasks, projects)
- **Supabase Realtime** for live updates

### Forms
- **React Hook Form** for form handling
- **Zod** for schema validation
- Arabic error messages

### Drag & Drop
- **@hello-pangea/dnd** (React Beautiful DnD fork)
- Accessibility-friendly keyboard support

### Charts
- **Recharts** for analytics graphs
- Customizable colors (brand purple)
- RTL support

---

## Next Steps

### For Designers
1. Create high-fidelity mockups in Figma
2. Export design tokens to code
3. Create component library
4. Design dark mode variants
5. Test color contrast (WCAG)

### For Developers
1. Set up Vite + React + TypeScript project
2. Install Shadcn/ui components
3. Implement layout components (Header, Sidebar)
4. Build dashboard with dummy data
5. Integrate Supabase API
6. Add Realtime subscriptions
7. Implement responsive design
8. Test keyboard navigation

### For Product Team
1. Validate wireframes with users
2. Prioritize features for MVP
3. Create user testing scenarios
4. Define success metrics

---

## Related Documentation

**Design System:**
- [UI/UX Design System](../Technical%20Documentation/UI-UX-Design-System.md)
- [Development Standards](../Technical%20Documentation/Development-Standards-Document.md)

**Architecture:**
- [C4 Architecture Diagrams](../C4%20Architecture%20Diagrams/README.md)
- [System Architecture](../System%20Architecture/System%20Architecture.md)

**User Flows:**
- [User Flow Diagrams](../Technical%20Documentation/User-Flow-Diagrams.md)

**Requirements:**
- [Technical Requirements Specification](../Technical%20Documentation/Technical-Requirements-Specification.md)

---

## Contact

**Questions about wireframes?**
- Design Lead: [design@ninjagenzy.com]
- Product Manager: [product@ninjagenzy.com]

**Suggest changes:**
- Create GitHub issue with label "wireframes"
- Update wireframe docs and submit PR

---

## Changelog

- **v1.0** (2026-01-24): Initial wireframes created
  - Agency Owner Dashboard ✅
  - Task Management (Kanban, List, Calendar) ✅
  - Client Portal ✅
  - README index ✅
  - Component breakdown and code examples ✅
  - Mobile responsive views ✅
  - RTL and accessibility specs ✅
