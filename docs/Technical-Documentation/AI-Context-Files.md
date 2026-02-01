---
title: "AI Context Files & Prompts"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "Development Standards Document"
  - "Database Design Document"
  - "UI/UX Design System"
priority: "P2"
estimated_implementation_time: "1 day (setup)"
---

# AI Context Files & Prompts — Ninja Gen Z Platform

## TL;DR

This document provides AI context files and prompts for **Cursor IDE**, **GitHub Copilot**, and other AI coding assistants. Includes a **codebase rules file** (`.cursorrules`) defining naming conventions, forbidden patterns, and project structure, **component generation prompts** for creating React components following the design system, **database query templates** with RLS enforcement, and **code review prompts** for automated PR analysis. All prompts ensure AI-generated code follows Ninja Gen Z standards: TypeScript strict mode, no `any` types, RTL-aware components, proper tenant isolation, and WCAG 2.1 accessibility.

---

## Table of Contents

- [1. Cursor IDE Configuration](#1-cursor-ide-configuration)
- [2. Component Generation Prompts](#2-component-generation-prompts)
- [3. Database Query Prompts](#3-database-query-prompts)
- [4. Code Review Prompts](#4-code-review-prompts)
- [5. Refactoring Prompts](#5-refactor ing-prompts)
- [6. Documentation Prompts](#6-documentation-prompts)
- [7. Next Steps](#7-next-steps)
- [8. References](#8-references)
- [9. Changelog](#9-changelog)

---

## 1. Cursor IDE Configuration

### 1.1 Codebase Rules File

**File:** `.cursorrules`

```markdown
# Ninja Gen Z — Codebase Rules for AI Assistants

## Project Overview
Ninja Gen Z is a Gen Z-optimized, Arabic-first, multi-tenant agency management platform.
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Design:** Dark mode first, RTL layout, cyberpunk aesthetic

## Critical Rules

### 1. TypeScript
- ✅ **ALWAYS** use TypeScript strict mode
- ❌ **NEVER** use `any` type (use `unknown` or proper types)
- ✅ Generate types from Supabase: `npx supabase gen types typescript`
- ✅ Use type imports: `import type { Task } from '@/types/database.types'`

### 2. Naming Conventions
- **Components:** PascalCase (`TaskCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useTaskFilters.ts`)
- **Functions:** camelCase (`formatDate()`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Database tables:** snake_case, plural (`tasks`, `brand_kits`)

### 3. Multi-Tenancy (CRITICAL)
- ✅ **ALWAYS** filter queries by `agency_id` or `workspace_id`
- ✅ Use RLS policies, never bypass security
- ❌ **NEVER** allow cross-tenant data access
- **Example:**
```typescript
// ✅ GOOD
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('workspace_id', workspaceId);

// ❌ BAD (no tenant filter)
const { data } = await supabase.from('tasks').select('*');
```

### 4. RTL Layout (Arabic Support)
- ✅ Use logical properties: `ms-4` (margin-inline-start), `me-4` (margin-inline-end)
- ❌ **NEVER** use `ml-4`, `mr-4` (not RTL-aware)
- ✅ Mirror directional icons: `<ChevronRightIcon className="rtl:rotate-180" />`

### 5. Accessibility (WCAG 2.1 AA)
- ✅ Color contrast ratio >= 4.5:1 for text
- ✅ All form inputs have labels
- ✅ Icon-only buttons have `aria-label`
- ✅ Keyboard navigation works (Tab order)

### 6. Forbidden Patterns
- ❌ Redux, MobX (use Zustand or React Query)
- ❌ Express.js, Nest.js (use Supabase Edge Functions)
- ❌ MongoDB (use PostgreSQL via Supabase)
- ❌ `console.log` in production (use `console.warn`, `console.error`)
- ❌ Inline styles (use Tailwind classes)

### 7. Code Quality
- ✅ ESLint must pass (no warnings)
- ✅ Prettier formatting required
- ✅ Test coverage >= 70%
- ✅ Components max 200 lines

### 8. Database Queries
- ✅ Use Supabase client, not raw SQL
- ✅ Handle errors explicitly: `if (error) throw error`
- ✅ Use `select('*')` with join syntax for relations
- ❌ **NEVER** use `SELECT *` in production (specify columns)

### 9. UI Components
- ✅ Use Shadcn/ui components only
- ✅ Dark mode colors: `bg-background`, `text-foreground`
- ✅ Primary brand color: `bg-brand-purple` (#9333ea)
- ✅ Animations: < 300ms duration

### 10. File Structure
```
src/
├── components/
│   ├── ui/           # Shadcn/ui components
│   ├── task-card/    # Feature components
│   └── layout/       # Layout components
├── hooks/            # Custom hooks
├── lib/
│   ├── supabase/     # Supabase queries
│   └── utils/        # Utility functions
├── types/            # TypeScript types
└── pages/            # Route pages
```

## When Generating Code
1. Ask for context if unclear (workspace ID, user role)
2. Include error handling
3. Add TypeScript types
4. Follow naming conventions
5. Add inline comments for complex logic only
6. Use Arabic labels for UI text
7. Ensure RTL compatibility
8. Check accessibility

## Example: Generate Task Component
When asked to create a task card component:
- Use `Card` from Shadcn/ui
- Include props type interface
- Add status badge with color
- Make RTL-aware
- Add accessibility labels
- Use brand colors
- Handle click events
- Add hover effects (< 300ms transition)
```

---

## 2. Component Generation Prompts

### 2.1 React Component Prompt

**Prompt for AI:**
```
Create a React component called [ComponentName] that [description].

Requirements:
- TypeScript with strict types
- Use Shadcn/ui components (Card, Button, Badge)
- Dark mode compatible (use bg-background, text-foreground)
- RTL-aware (use ms-*, me-* instead of ml-*, mr-*)
- Accessible (ARIA labels, keyboard navigation)
- Props interface with JSDoc comments
- Handle loading and error states
- Include hover effects with transition-all duration-150
- Arabic labels for UI text

File structure:
src/components/[component-name]/[ComponentName].tsx
```

**Example Usage:**
```
Create a React component called TaskStatusBadge that displays a task's status with color coding.

Requirements: [same as above]
```

**Expected Output:**
```typescript
// src/components/task-status-badge/TaskStatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/database.types';

interface TaskStatusBadgeProps {
  /** Task status */
  status: Task['status'];
  /** Optional CSS classes */
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusConfig = {
    todo: { label: 'قيد الانتظار', variant: 'secondary' as const },
    in_progress: { label: 'قيد التنفيذ', variant: 'default' as const },
    review: { label: 'قيد المراجعة', variant: 'outline' as const },
    done: { label: 'مكتمل', variant: 'success' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
```

---

### 2.2 Form Component Prompt

**Prompt for AI:**
```
Create a form component for [purpose] using React Hook Form and Zod validation.

Requirements:
- Use `useForm` from react-hook-form
- Zod schema for validation
- Shadcn/ui form components (Form, FormField, Input, Button)
- Arabic labels and error messages
- Loading state during submission
- Toast notification on success/error
- Accessible form with proper labels
- Handle submission with Supabase
- Include tenant filtering (workspace_id, agency_id)

Schema example:
```typescript
const schema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().max(500).optional(),
});
```
```

---

## 3. Database Query Prompts

### 3.1 Supabase Query Prompt

**Prompt for AI:**
```
Generate a Supabase query function for [operation].

Requirements:
- TypeScript function in src/lib/supabase/queries/[entity].ts
- Use Supabase client from '@/lib/supabase/client'
- Include proper error handling
- Filter by tenant (workspace_id or agency_id)
- Use TypeScript types from database.types.ts
- Return typed data
- Add JSDoc comment

Template:
```typescript
/**
 * [Description of function]
 * @param [param] - [description]
 * @returns Promise resolving to [return type]
 * @throws {Error} If [error condition]
 */
export async function [functionName]([params]): Promise<[ReturnType]> {
  const { data, error } = await supabase
    .from('[table]')
    .select('[columns]')
    .eq('[tenant_filter]', [value]);
  
  if (error) {
    console.error('Error in [functionName]:', error);
    throw new Error('[Arabic error message]');
  }
  
  return data;
}
```
```

**Example Usage:**
```
Generate a Supabase query function for fetching all tasks in a workspace with assignee details.

Requirements: [same as above]
```

---

## 4. Code Review Prompts

### 4.1 PR Review Prompt

**Prompt for GitHub Copilot:**
```
Review this Pull Request for the Ninja Gen Z platform.

Check for:
1. **Security:** RLS filters on all queries, no SQL injection risks
2. **Multi-tenancy:** All queries filter by agency_id/workspace_id
3. **TypeScript:** No `any` types, proper interfaces
4. **RTL:** Uses logical properties (ms-*, me-*), not ml-*/mr-*
5. **Accessibility:** ARIA labels, color contrast, keyboard nav
6. **Performance:** No N+1 queries, proper memoization
7. **Naming:** Follows conventions (PascalCase components, camelCase functions)
8. **Testing:** Test coverage for new code
9. **Code quality:** ESLint passes, Prettier formatted
10. **Arabic:** UI labels in Arabic

Provide feedback as:
- ✅ **Approved areas**
- ⚠️ **Suggestions** (non-blocking)
- ❌ **Issues** (blocking, must fix)
```

---

## 5. Refactoring Prompts

### 5.1 Extract Component Prompt

**Prompt:**
```
Refactor [component] by extracting [section] into a separate component.

Requirements:
- Create new file in appropriate directory
- Use TypeScript with proper types
- Maintain RTL compatibility
- Keep accessibility features
- Update parent component to use extracted component
- Add JSDoc comment to new component
```

---

## 6. Documentation Prompts

### 6.1 JSDoc Prompt

**Prompt:**
```
Add JSDoc documentation to this function.

Include:
- Brief description
- @param for each parameter with type and description
- @returns with return type and description
- @throws if function can throw errors
- @example with usage example

Follow this template:
/**
 * [Brief description]
 * 
 * @param [name] - [description]
 * @returns [description]
 * @throws {Error} If [condition]
 * 
 * @example
 * ```typescript
 * const result = await functionName(param);
 * ```
 */
```

---

## 7. Next Steps

- [ ] Copy `.cursorrules` to project root
- [ ] Configure Cursor IDE with Ninja Gen Z context
- [ ] Test component generation with AI prompts
- [ ] Validate AI-generated code follows standards
- [ ] Create additional prompts for Edge Functions
- [ ] Document common AI mistakes to avoid

---

## 8. References

- [Cursor IDE Documentation](https://cursor.sh/docs)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Development Standards Document](file:///e:/docs/docs/Technical%20Documentation/Development-Standards-Document.md)
- [UI/UX Design System](file:///e:/docs/docs/Technical%20Documentation/UI-UX-Design-System.md)

---

## 9. Changelog

- **v1.0** (2026-01-24): Initial AI context files
  - Codebase rules file (.cursorrules) with critical patterns
  - Component generation prompts for React + TypeScript
  - Database query templates with RLS enforcement
  - Code review prompts for PR analysis
  - Refactoring prompts for code improvement
  - JSDoc documentation templates
