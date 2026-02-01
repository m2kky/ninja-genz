---
title: "Development Standards Document"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "DevOps & Infrastructure Document"
  - "Database Design Document"
  - "System Architecture Document"
priority: "P1"
estimated_implementation_time: "N/A (Standards)"
---

# Development Standards Document — Ninja Gen Z Platform

## TL;DR

This document defines code standards, naming conventions, Git workflow, and CI/CD practices for the Ninja Gen Z platform. All TypeScript code follows **strict mode** with **ESLint** and **Prettier** enforcement. Components use **PascalCase**, functions use **camelCase**, and database tables use **snake_case**. The Git workflow follows **GitHub Flow** with protected branches (`main`, `staging`, `develop`). All PRs require **passing CI checks** (lint, type-check, tests) and **one approval** before merging. The CI/CD pipeline auto-deploys to staging on merge to `staging` branch and to production on merge to `main`. Code review standards include max 400 lines per PR, inline comments for complex logic, and mandatory security review for authentication/database changes.

---

## Table of Contents

- [1. Code Style Standards](#1-code-style-standards)
- [2. Naming Conventions](#2-naming-conventions)
- [3. TypeScript Standards](#3-typescript-standards)
- [4. React Component Standards](#4-react-component-standards)
- [5. Git Workflow](#5-git-workflow)
- [6. Pull Request Guidelines](#6-pull-request-guidelines)
- [7. Code Review Standards](#7-code-review-standards)
- [8. Testing Standards](#8-testing-standards)
- [9. Documentation Standards](#9-documentation-standards)
- [10. Performance Standards](#10-performance-standards)
- [11. Next Steps](#11-next-steps)
- [12. References](#12-references)
- [13. Changelog](#13-changelog)

---

## 1. Code Style Standards

### 1.1 ESLint Configuration

**Reference:** `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'prettier' // Must be last to override other configs
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  rules: {
    // React
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off', // Not needed with React 18+
    'react/prop-types': 'off', // TypeScript handles this
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error', // Strict: no any types
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    
    // Imports
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
    }],
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

### 1.2 Prettier Configuration

**Reference:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Run Formatting:**

```bash
# Format all files
npm run format

# Check formatting (CI)
npm run format:check
```

### 1.3 VS Code Settings

**Reference:** `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 1.4 File Size Limits

- الحد الأقصى لحجم الملف البرمجي هو 200 سطر.
- الاستثناءات مسموحة فقط للحالات الحرجة وتُذكر في الـ PR.
- أي ملف يتجاوز 200 سطر يجب تقسيمه إلى وحدات أصغر.

---

## 2. Naming Conventions

### 2.1 Complete Naming Reference

| Code Element | Convention | Example | ❌ Incorrect |
|:-------------|:-----------|:--------|:-------------|
| **React Components** | PascalCase | `TaskCard.tsx`, `ClientPortal.tsx` | `taskCard.tsx`, `task-card.tsx` |
| **Hooks** | camelCase with `use` prefix | `useTaskFilters.ts`, `usePrayerTimes.ts` | `TaskFilters.ts`, `getPrayerTimes.ts` |
| **Functions** | camelCase | `formatDuration()`, `calculateProgress()` | `FormatDuration()`, `format_duration()` |
| **Variables** | camelCase | `taskCount`, `isLoading` | `TaskCount`, `is_loading` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` | `maxFileSize`, `MaxFileSize` |
| **Types/Interfaces** | PascalCase, `I` prefix for interfaces | `interface ITask`, `type TaskStatus` | `interface task`, `type taskstatus` |
| **Enums** | PascalCase (name), UPPER_SNAKE_CASE (values) | `enum TaskStatus { TODO = 'TODO' }` | `enum taskStatus { todo = 'todo' }` |
| **Database Tables** | snake_case, plural | `tasks`, `brand_kits` | `Tasks`, `brandKits`, `task` |
| **Database Columns** | snake_case | `created_at`, `is_active` | `createdAt`, `IsActive` |
| **CSS Classes (Tailwind)** | kebab-case | `bg-primary`, `text-lg` | `bgPrimary`, `TextLg` |
| **Files (non-component)** | kebab-case | `date-utils.ts`, `api-client.ts` | `DateUtils.ts`, `api_client.ts` |
| **Folders** | kebab-case | `/components/task-card/` | `/Components/TaskCard/` |

### 2.2 Naming Examples by Category

#### React Components

```typescript
// ✅ GOOD
TaskCard.tsx
ClientPortal.tsx
WorkspaceSelector.tsx

// ❌ BAD
taskCard.tsx (not PascalCase)
task-card.tsx (kebab-case)
TaskCardComponent.tsx (redundant "Component")
```

#### Hooks

```typescript
// ✅ GOOD
useTaskFilters.ts
usePrayerTimes.ts
useAuth.ts

// ❌ BAD
TaskFilters.ts (missing "use")
getTaskFilters.ts (wrong verb)
use_task_filters.ts (snake_case)
```

#### Types & Interfaces

```typescript
// ✅ GOOD
interface ITask {
  id: string;
  title: string;
}

type TaskStatus = 'todo' | 'in_progress' | 'done';

// ❌ BAD
interface task { ... } // lowercase
type taskStatus = ... // lowercase
interface Task {} // Conflicts with domain models, use ITask
```

---

## 3. TypeScript Standards

### 3.1 Strict Mode Configuration

**Reference:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Strict Type Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,

    /* Module Resolution */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.2 Type Safety Rules

**Rule 1: No `any` types**

```typescript
// ❌ BAD
function processData(data: any) {
  return data.map((item: any) => item.id);
}

// ✅ GOOD
interface IDataItem {
  id: string;
  name: string;
}

function processData(data: IDataItem[]): string[] {
  return data.map((item) => item.id);
}
```

**Rule 2: Use `unknown` instead of `any` for truly dynamic data**

```typescript
// ❌ BAD
catch (error: any) {
  console.error(error.message);
}

// ✅ GOOD
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error', error);
  }
}
```

**Rule 3: Use strict null checks**

```typescript
// ❌ BAD
function getUser(id: string) {
  return users.find((u) => u.id === id); // Returns User | undefined
}

const user = getUser('123');
console.log(user.name); // ERROR: user might be undefined

// ✅ GOOD
function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

const user = getUser('123');
if (user) {
  console.log(user.name); // Safe
}
```

### 3.3 Type Generation from Supabase

```bash
# Generate types from Supabase schema
npx supabase gen types typescript --project-id=your-project-ref > src/types/database.types.ts
```

**Usage:**

```typescript
// src/types/database.types.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          status: 'todo' | 'in_progress' | 'review' | 'done';
          // ...
        };
        Insert: {
          id?: string;
          title: string;
          // ...
        };
        Update: {
          title?: string;
          // ...
        };
      };
    };
  };
};

// Usage
import type { Database } from '@/types/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
```

---

## 4. React Component Standards

### 4.1 Component Structure

```typescript
// src/components/TaskCard.tsx
import { useState } from 'react';
import { Task } from '@/types/database.types';
import { formatDate } from '@/lib/utils/date';
import { Badge } from '@/components/ui/badge';

// 1. Props interface
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

// 2. Component definition
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // 3. State hooks
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 4. Computed values
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();
  
  // 5. Event handlers
  const handleEdit = () => {
    onEdit(task);
  };
  
  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      onDelete(task.id);
    }
  };
  
  // 6. Render
  return (
    <div className="task-card rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>
        
        <Badge variant={isOverdue ? 'destructive' : 'default'}>
          {task.status}
        </Badge>
      </div>
      
      {task.deadline && (
        <div className="mt-2 text-xs text-muted-foreground">
          الموعد النهائي: {formatDate(task.deadline)}
        </div>
      )}
      
      <div className="mt-4 flex gap-2">
        <button onClick={handleEdit} className="btn-secondary">
          تعديل
        </button>
        <button onClick={handleDelete} className="btn-destructive">
          حذف
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Component Organization

```
src/components/
├── ui/                  # Shadcn/ui base components
│   ├── button.tsx
│   ├── badge.tsx
│   └── card.tsx
├── task-card/           # Feature component with sub-components
│   ├── TaskCard.tsx
│   ├── TaskCardHeader.tsx
│   ├── TaskCardFooter.tsx
│   └── index.ts
├── layout/              # Layout components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Footer.tsx
└── forms/               # Form components
    ├── TaskForm.tsx
    └── ClientForm.tsx
```

### 4.3 Hooks Best Practices

```typescript
// src/hooks/useTaskFilters.ts
import { useState, useMemo } from 'react';
import type { Task } from '@/types/database.types';

interface UseTaskFiltersProps {
  tasks: Task[];
}

interface UseTaskFiltersReturn {
  filteredTasks: Task[];
  filter: string;
  setFilter: (filter: string) => void;
  sortBy: 'deadline' | 'priority';
  setSortBy: (sort: 'deadline' | 'priority') => void;
}

export function useTaskFilters({ tasks }: UseTaskFiltersProps): UseTaskFiltersReturn {
  const [filter, setFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');
  
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Filter by title
    if (filter) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
      } else {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });
    
    return result;
  }, [tasks, filter, sortBy]);
  
  return {
    filteredTasks,
    filter,
    setFilter,
    sortBy,
    setSortBy
  };
}
```

---

## 5. Git Workflow

### 5.1 Branch Strategy (GitHub Flow)

```mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Setup project"
    
    branch feature/task-management
    commit id: "Add TaskCard"
    commit id: "Add TaskForm"
    
    checkout develop
    merge feature/task-management
    
    branch staging
    checkout staging
    merge develop
    commit id: "QA testing"
    
    checkout main
    merge staging tag: "v1.0.0"
    commit id: "Production deploy"
```

### 5.2 Branch Naming Conventions

| Branch Type | Pattern | Example | Purpose |
|:------------|:--------|:--------|:--------|
| **Feature** | `feature/description` | `feature/prayer-reminders` | New feature development |
| **Bugfix** | `bugfix/description` | `bugfix/login-error` | Fix bugs in develop branch |
| **Hotfix** | `hotfix/description` | `hotfix/security-patch` | Emergency production fixes |
| **Release** | `release/v1.x.x` | `release/v1.2.0` | Release preparation |

### 5.3 Protected Branches

**Configuration (GitHub Settings → Branches → Branch Protection Rules):**

| Branch | Protection Rules |
|:-------|:-----------------|
| `main` | ✅ Require pull request<br/>✅ Require  approvals: 1<br/>✅ Require status checks (CI)<br/>✅ No force push<br/>✅ No deletions |
| `staging` | ✅ Require pull request<br/>✅ Require approvals: 1<br/>✅ Require status checks<br/>✅ No force push |
| `develop` | ✅ Require pull request<br/>✅ Require status checks<br/>❌ Approvals optional |

### 5.4 Commit Message Format

**Reference:** [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/tooling changes

**Examples:**

```bash
# ✅ GOOD
feat(tasks): add task filtering by status
fix(auth): resolve magic link expiration bug
docs: update database design document
refactor(api): simplify task query logic

# ❌ BAD
Update code
Fixed bug
Changes
WIP
```

---

## 6. Pull Request Guidelines

### 6.1 PR Template

**Reference:** `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Description
<!-- Brief summary of changes -->

## Type of Change
- [ ] 🎉 New feature
- [ ] 🐛 Bug fix
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring
- [ ] 🔧 Configuration change

## Related Issues
Closes #[issue-number]

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on Chrome, Firefox,Safari

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] No console.log statements
- [ ] TypeScript types are correct
- [ ] RLS policies updated (if database changes)
- [ ] Documentation updated
```

### 6.2 PR Size Guidelines

| Size | Lines Changed | Review Time | Recommendation |
|:-----|:--------------|:------------|:---------------|
| **XS** | < 50 | 5 min | ✅ Ideal for quick reviews |
| **S** | 50-200 | 15 min | ✅ Good |
| **M** | 200-400 | 30 min | ⚠️ Consider splitting |
| **L** | 400-1000 | 1 hour | ❌ Split into smaller PRs |
| **XL** | > 1000 | 2+ hours | ❌ Too large, MUST split |

**Goal:** Keep PRs under 400 lines for faster review and lower error rate.

---

## 7. Code Review Standards

### 7.1 Review Checklist

**Reviewer Must Check:**

- [ ] **Functionality:** Does the code do what it's supposed to?
- [ ] **Logic:** Are there any edge cases not handled?
- [ ] **Security:** Any SQL injection, XSS, or auth bypass risks?
- [ ] **Performance:** Any N+1 queries, memory leaks, or slow operations?
- [ ] **Tests:** Are there tests? Do they cover edge cases?
- [ ] **Naming:** Are variables/functions named clearly?
- [ ] **Comments:** Is complex logic documented?
- [ ] **Error Handling:** Are errors caught and logged properly?
- [ ] **Types:** Are TypeScript types correct (no `any`)?
- [ ] **Style:** Does code follow ESLint/Prettier rules?

### 7.2 Review Response Time SLA

| Priority | Response Time | Example |
|:---------|:--------------|:--------|
| **P0 - Hotfix** | < 1 hour | Production crash fix |
| **P1 - Critical** | < 4 hours | Blocking release |
| **P2 - Normal** | < 24 hours | Feature development |
| **P3 - Low** | < 48 hours | Refactoring, docs |

### 7.3 Review Comments Format

**Use Conventional Comments:** https://conventionalcomments.org/

```markdown
<!-- ✅ GOOD -->
**question:** Why are we using `setTimeout` here instead of a Promise?

**suggestion:** Consider extracting this logic into a separate hook (`useTaskFilters`).

**nitpick:** Variable name `data` is too generic. Consider `taskData` or `filteredTasks`.

**issue (blocking):** This will cause a race condition. We need to add a loading state.

**praise:** Excellent error handling! This covers all edge cases.

<!-- ❌ BAD -->
This is wrong.
Change this.
I don't like this.
```

---

## 8. Testing Standards

### 8.1 Test Coverage Requirements

| Code Type | Min Coverage | Goal Coverage |
|:----------|:-------------|:--------------|
| **Utilities** | 80% | 100% |
| **Hooks** | 70% | 90% |
| **Components** | 60% | 80% |
| **API Routes** | 70% | 90% |
| **Overall** | 70% | 85% |

### 8.2 Unit Test Example (Vitest)

```typescript
// src/lib/utils/__tests__/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, isOverdue, getDaysUntil } from '../date-utils';

describe('formatDate', () => {
  it('formats date in DD/MM/YYYY format', () => {
    const date = '2026-01-24T10:30:00Z';
    expect(formatDate(date)).toBe('24/01/2026');
  });
  
  it('handles invalid date', () => {
    expect(formatDate('invalid')).toBe('Invalid Date');
  });
});

describe('isOverdue', () => {
  it('returns true for past dates', () => {
    const pastDate = '2025-01-01';
    expect(isOverdue(pastDate)).toBe(true);
  });
  
  it('returns false for future dates', () => {
    const futureDate = '2027-01-01';
    expect(isOverdue(futureDate)).toBe(false);
  });
});
```

### 8.3 Component Test Example (Testing Library)

```typescript
// src/components/__tests__/TaskCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '123',
    title: 'Test Task',
    status: 'todo',
    priority: 'high',
    deadline: '2026-02-01'
  };
  
  it('renders task title', () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} onDelete={vi.fn()} />);
    
    fireEvent.click(screen.getByText('تعديل'));
    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

---

## 9. Documentation Standards

### 9.1 Code Comments

**When to Comment:**

```typescript
// ✅ GOOD: Complex logic explained
// Calculate prayer time offset based on user's timezone
// AlAdhan API returns Cairo time (UTC+2), we need to convert
const prayerTimeLocal = new Date(prayerTime);
prayerTimeLocal.setHours(prayerTimeLocal.getHours() + timezoneOffset);

// ✅ GOOD: Non-obvious business rule
// Clients can only approve tasks, not edit them (per Phase 2 spec)
if (userRole === 'client' && action === 'edit') {
  throw new Error('Clients cannot edit tasks');
}

// ❌ BAD: Obvious comment
// Set loading to true
setLoading(true);

// ❌ BAD: Out-of-date comment
// TODO: Fix this later (commented 6 months ago, still not fixed)
```

### 9.2 JSDoc for Public APIs

```typescript
/**
 * Fetches tasks for a workspace with optional filtering
 * 
 * @param workspaceId - UUID of the workspace
 * @param filters - Optional filters (status, priority, assignee)
 * @returns Promise resolving to array of tasks
 * @throws {Error} If workspace not found or user lacks permission
 * 
 * @example
 * ```typescript
 * const tasks = await getWorkspaceTasks('workspace-123', {
 *   status: 'todo',
 *   priority: 'high'
 * });
 * ```
 */
export async function getWorkspaceTasks(
  workspaceId: string,
  filters?: TaskFilters
): Promise<Task[]> {
  // Implementation...
}
```

---

## 10. Performance Standards

### 10.1 Bundle Size Limits

| Metric | Limit | Current | Status |
|:-------|:------|:--------|:-------|
| **Initial JS** | < 500 KB | 420 KB | ✅ |
| **Initial CSS** | < 100 KB | 85 KB | ✅ |
| **Total (gzip)** | < 600 KB | 505 KB | ✅ |
| **Largest Asset** | < 200 KB | 180 KB | ✅ |

**Check Bundle Size:**

```bash
npm run build
npx vite-bundle-visualizer
```

### 10.2 Core Web Vitals Targets

| Metric | Target | Acceptable | Current |
|:-------|:-------|:-----------|:--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4s | 2.1s ✅ |
| **FID** (First Input Delay) | < 100ms | < 300ms | 85ms ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 | 0.08 ✅ |

### 10.3 Code Splitting

```typescript
// ✅ GOOD: Lazy load heavy components
const ClientPortal = lazy(() => import('@/components/ClientPortal'));
const AdsDashboard = lazy(() => import('@/components/AdsDashboard'));

// Usage
<Suspense fallback={<Loading />}>
  <ClientPortal />
</Suspense>
```

---

## 11. Next Steps

- [ ] Set up ESLint and Prettier in project root
- [ ] Configure VS Code settings for team
- [ ] Create PR template and issue templates
- [ ] Set up branch protection rules on GitHub
- [ ] Configure GitHub Actions workflows (lint, test, deploy)
- [ ] Create pre-commit hooks (Husky) for lint + format
- [ ] Document onboarding guide for new developers
- [ ] Set up Codecov for test coverage tracking
- [ ] Create component library documentation (Storybook)

---

## 12. References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [DevOps & Infrastructure Document](file:///e:/docs/docs/System%20Architecture/DevOps%20&%20Infrastructure%20Document.md)

---

## 13. Changelog

- **v1.0** (2026-01-24): Initial development standards document
  - Code style standards (ESLint, Prettier)
  - Comprehensive naming conventions table
  - TypeScript strict mode configuration
  - React component structure and organization
  - Git workflow (GitHub Flow) with branch protection
  - Pull request guidelines and size recommendations
  - Code review checklist and comment format
  - Testing standards with coverage requirements
  - Documentation standards (comments, JSDoc)
  - Performance standards (bundle size, Core Web Vitals)
