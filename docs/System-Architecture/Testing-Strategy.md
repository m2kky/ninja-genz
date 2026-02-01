<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Testing Strategy Document

**Version:** 1.0
**Platform:** Ninja Gen Z
**Date:** January 24, 2026

***

## 1. Testing Philosophy \& Principles

### 1.1 Core Principles

**"Test the behavior, not the implementation"**

- Focus on what users experience, not internal code structure
- Tests should survive refactoring
- Mock only external dependencies, not internal functions

**Pyramid Approach:**

```
              ┌─────────────┐
             /   E2E Tests   \      ← Few (10%) - Slow, expensive
            /    (Playwright) \
           /─────────────────────\
          /  Integration Tests   \  ← Some (30%) - Medium speed
         /   (API + DB tests)     \
        /───────────────────────────\
       /      Unit Tests            \  ← Many (60%) - Fast, cheap
      /   (Vitest + RTL)             \
     /───────────────────────────────────\
```

**Coverage Targets:**

- **Overall:** 80%+ code coverage
- **Critical paths:** 100% (auth, payments, data mutations)
- **UI components:** 70%+ (focus on logic, not styling)
- **Utility functions:** 95%+ (pure functions easy to test)

***

### 1.2 Testing Stack

| Test Type | Tool | Purpose |
| :-- | :-- | :-- |
| **Unit Tests** | Vitest | Test individual functions/components |
| **Component Tests** | React Testing Library | Test React components in isolation |
| **Integration Tests** | Vitest + Supabase | Test API + database interactions |
| **E2E Tests** | Playwright | Test complete user flows |
| **Visual Regression** | Percy (future) | Detect UI changes |
| **Performance Tests** | Lighthouse CI | Monitor Core Web Vitals |
| **Security Tests** | npm audit + Snyk | Vulnerability scanning |


***

## 2. Unit Testing (Vitest + React Testing Library)

### 2.1 Setup

**`vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**`src/test/setup.ts`:**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```


***

### 2.2 Unit Test Examples

#### **Test 1: Utility Function (Pure Logic)**

**`src/utils/formatDate.ts`:**

```typescript
export function formatDate(date: Date | string, locale: string = 'ar-EG'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
}
```

**`src/utils/formatDate.test.ts`:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, getRelativeTime } from './formatDate';

describe('formatDate', () => {
  it('formats Date object correctly in Arabic', () => {
    const date = new Date('2026-01-24T10:00:00Z');
    const formatted = formatDate(date, 'ar-EG');
    expect(formatted).toContain('يناير');
    expect(formatted).toContain('2026');
  });

  it('formats string date correctly', () => {
    const formatted = formatDate('2026-01-24', 'ar-EG');
    expect(formatted).toContain('يناير');
  });

  it('uses default locale (ar-EG) when not specified', () => {
    const date = new Date('2026-01-24');
    const formatted = formatDate(date);
    expect(formatted).toContain('يناير'); // Arabic month name
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "الآن" for very recent dates', () => {
    const now = new Date('2026-01-24T10:00:00Z');
    vi.setSystemTime(now);
    
    const recent = new Date('2026-01-24T09:59:30Z'); // 30 seconds ago
    expect(getRelativeTime(recent)).toBe('الآن');
  });

  it('returns minutes ago for dates < 1 hour', () => {
    const now = new Date('2026-01-24T10:00:00Z');
    vi.setSystemTime(now);
    
    const past = new Date('2026-01-24T09:45:00Z'); // 15 mins ago
    expect(getRelativeTime(past)).toBe('منذ 15 دقيقة');
  });

  it('returns hours ago for dates < 24 hours', () => {
    const now = new Date('2026-01-24T10:00:00Z');
    vi.setSystemTime(now);
    
    const past = new Date('2026-01-24T07:00:00Z'); // 3 hours ago
    expect(getRelativeTime(past)).toBe('منذ 3 ساعة');
  });

  it('returns days ago for dates >= 24 hours', () => {
    const now = new Date('2026-01-24T10:00:00Z');
    vi.setSystemTime(now);
    
    const past = new Date('2026-01-22T10:00:00Z'); // 2 days ago
    expect(getRelativeTime(past)).toBe('منذ 2 يوم');
  });
});
```


***

#### **Test 2: React Component (Presentational)**

**`src/components/TaskCard.tsx`:**

```typescript
import { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const statusColors = {
    todo: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    review: 'bg-yellow-500',
    done: 'bg-green-500',
  };

  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md cursor-pointer"
      onClick={onClick}
      data-testid="task-card"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{task.title}</h3>
        <Badge className={statusColors[task.status]}>
          {task.status}
        </Badge>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        {task.assigned_user && (
          <div className="flex items-center gap-2">
            <Avatar 
              src={task.assigned_user.avatar_url} 
              alt={task.assigned_user.full_name}
            />
            <span className="text-sm">{task.assigned_user.full_name}</span>
          </div>
        )}
        
        {task.deadline && (
          <span className="text-sm text-gray-500">
            {new Date(task.deadline).toLocaleDateString('ar-EG')}
          </span>
        )}
      </div>
    </div>
  );
}
```

**`src/components/TaskCard.test.tsx`:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { Task } from '@/types';

const mockTask: Task = {
  id: 'task-1',
  title: 'Design Instagram post',
  description: 'Create 3 variations for Nike campaign',
  status: 'in_progress',
  priority: 'high',
  deadline: '2026-01-28T18:00:00Z',
  assigned_user: {
    id: 'user-1',
    full_name: 'Ahmed Mohamed',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  created_at: '2026-01-20T10:00:00Z',
  updated_at: '2026-01-24T10:00:00Z',
};

describe('TaskCard', () => {
  it('renders task title correctly', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Design Instagram post')).toBeInTheDocument();
  });

  it('renders task description when provided', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/Create 3 variations/)).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const taskWithoutDesc = { ...mockTask, description: undefined };
    render(<TaskCard task={taskWithoutDesc} />);
    expect(screen.queryByText(/Create 3 variations/)).not.toBeInTheDocument();
  });

  it('renders status badge with correct color', () => {
    const { container } = render(<TaskCard task={mockTask} />);
    const badge = screen.getByText('in_progress');
    expect(badge).toHaveClass('bg-blue-500');
  });

  it('renders assigned user name and avatar', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Ahmed Mohamed')).toBeInTheDocument();
    expect(screen.getByAltText('Ahmed Mohamed')).toBeInTheDocument();
  });

  it('renders deadline in Arabic locale', () => {
    render(<TaskCard task={mockTask} />);
    // Check that deadline is rendered (exact format may vary by locale)
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    
    const card = screen.getByTestId('task-card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not crash when onClick is not provided', () => {
    render(<TaskCard task={mockTask} />);
    const card = screen.getByTestId('task-card');
    fireEvent.click(card);
    // No assertion needed - just checking it doesn't throw
  });
});
```


***

#### **Test 3: Custom Hook**

**`src/hooks/useTasks.ts`:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';

interface UseTasksFilters {
  status?: string;
  assigned_to?: string;
  project_id?: string;
}

export function useTasks(filters: UseTasksFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name),
          assigned_user:user_profiles(full_name, avatar_url)
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**`src/hooks/useTasks.test.ts`:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from './useTasks';
import { supabase } from '@/lib/supabase';

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks successfully', async () => {
    const mockTasks = [
      { id: 'task-1', title: 'Task 1', status: 'todo' },
      { id: 'task-2', title: 'Task 2', status: 'in_progress' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: mockTasks,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockTasks);
  });

  it('applies status filter', async () => {
    const selectMock = vi.fn().mockReturnValue({
      data: [],
      error: null,
    });
    const eqMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: eqMock,
      }),
    } as any);

    renderHook(() => useTasks({ status: 'in_progress' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(eqMock).toHaveBeenCalledWith('status', 'in_progress');
    });
  });

  it('handles errors correctly', async () => {
    const mockError = new Error('Database connection failed');

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      }),
    } as any);

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(mockError);
  });
});
```


***

### 2.3 Running Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test src/utils/formatDate.test.ts

# Run tests matching pattern
npm run test -- TaskCard
```

**`package.json` scripts:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```


***

## 3. Integration Testing

### 3.1 API + Database Tests

**Purpose:** Test interactions between frontend and Supabase (API + DB)

**`src/test/integration/tasks.integration.test.ts`:**

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Use test database (separate from production)
const supabase = createClient(
  process.env.VITE_SUPABASE_TEST_URL!,
  process.env.VITE_SUPABASE_TEST_KEY!
);

describe('Tasks API Integration', () => {
  let testUserId: string;
  let testWorkspaceId: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Create test user
    const { data: { user }, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Test123!@#',
    });
    if (error) throw error;
    testUserId = user!.id;

    // Create test workspace
    const { data: workspace } = await supabase
      .from('workspaces')
      .insert({ name: 'Test Workspace', owner_id: testUserId })
      .select()
      .single();
    testWorkspaceId = workspace!.id;

    // Create test project
    const { data: project } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        workspace_id: testWorkspaceId,
      })
      .select()
      .single();
    testProjectId = project!.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await supabase.from('tasks').delete().eq('project_id', testProjectId);
    await supabase.from('projects').delete().eq('id', testProjectId);
    await supabase.from('workspaces').delete().eq('id', testWorkspaceId);
    await supabase.auth.admin.deleteUser(testUserId);
  });

  beforeEach(async () => {
    // Clean tasks before each test
    await supabase.from('tasks').delete().eq('project_id', testProjectId);
  });

  it('creates a task successfully', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: 'Test Task',
        status: 'todo',
        project_id: testProjectId,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      title: 'Test Task',
      status: 'todo',
      project_id: testProjectId,
    });
    expect(data.id).toBeDefined();
  });

  it('enforces RLS policies (cannot access other workspace tasks)', async () => {
    // Create another user's workspace
    const { data: { user: otherUser } } = await supabase.auth.signUp({
      email: 'other@example.com',
      password: 'Test123!@#',
    });

    const { data: otherWorkspace } = await supabase
      .from('workspaces')
      .insert({ name: 'Other Workspace', owner_id: otherUser!.id })
      .select()
      .single();

    const { data: otherProject } = await supabase
      .from('projects')
      .insert({
        name: 'Other Project',
        workspace_id: otherWorkspace!.id,
      })
      .select()
      .single();

    await supabase
      .from('tasks')
      .insert({
        title: 'Other Task',
        project_id: otherProject!.id,
      });

    // Try to fetch as first user (should not see other's tasks)
    const { data } = await supabase
      .from('tasks')
      .select()
      .eq('project_id', otherProject!.id);

    expect(data).toEqual([]); // RLS blocks access
  });

  it('updates task status', async () => {
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Task to Update',
        status: 'todo',
        project_id: testProjectId,
      })
      .select()
      .single();

    const { data: updated, error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', task!.id)
      .select()
      .single();

    expect(error).toBeNull();
    expect(updated!.status).toBe('done');
  });

  it('deletes task', async () => {
    const { data: task } = await supabase
      .from('tasks')
      .insert({
        title: 'Task to Delete',
        project_id: testProjectId,
      })
      .select()
      .single();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task!.id);

    expect(error).toBeNull();

    const { data: deleted } = await supabase
      .from('tasks')
      .select()
      .eq('id', task!.id);

    expect(deleted).toEqual([]);
  });
});
```


***

### 3.2 Running Integration Tests

```bash
# Run integration tests (separate from unit tests)
npm run test:integration

# Use test database (set in .env.test)
VITE_SUPABASE_TEST_URL=https://test-ref.supabase.co \
VITE_SUPABASE_TEST_KEY=test-key \
npm run test:integration
```


***

## 4. End-to-End (E2E) Testing (Playwright)

### 4.1 Setup

**Install Playwright:**

```bash
npm install -D @playwright/test
npx playwright install
```

**`playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```


***

### 4.2 E2E Test Examples

#### **Test 1: Authentication Flow**

**`e2e/auth.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show user name in navbar
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Ahmed');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPass');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=تسجيل الخروج');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```


***

#### **Test 2: Task Management Flow**

**`e2e/tasks.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create new task', async ({ page }) => {
    await page.goto('/tasks');
    
    // Click "New Task" button
    await page.click('button:has-text("مهمة جديدة")');

    // Fill task form
    await page.fill('input[name="title"]', 'E2E Test Task');
    await page.fill('textarea[name="description"]', 'This is a test task');
    await page.selectOption('select[name="status"]', 'todo');
    await page.selectOption('select[name="priority"]', 'high');

    // Submit
    await page.click('button[type="submit"]');

    // Should see success message
    await expect(page.locator('[role="status"]')).toContainText('تم إنشاء المهمة');

    // Should appear in task list
    await expect(page.locator('[data-testid="task-list"]')).toContainText('E2E Test Task');
  });

  test('should update task status via drag and drop', async ({ page }) => {
    await page.goto('/tasks?view=board');

    // Find task in "To Do" column
    const task = page.locator('[data-testid="task-card"]').first();
    const taskTitle = await task.locator('h3').textContent();

    // Drag to "In Progress" column
    const inProgressColumn = page.locator('[data-column="in_progress"]');
    await task.dragTo(inProgressColumn);

    // Verify task moved
    await expect(inProgressColumn).toContainText(taskTitle!);
  });

  test('should filter tasks by status', async ({ page }) => {
    await page.goto('/tasks');

    // Apply filter
    await page.selectOption('select[name="status"]', 'in_progress');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // All visible tasks should have "in_progress" status
    const tasks = await page.locator('[data-testid="task-card"]').all();
    for (const task of tasks) {
      await expect(task.locator('[data-testid="status-badge"]')).toContainText('in_progress');
    }
  });

  test('should add comment to task', async ({ page }) => {
    await page.goto('/tasks');

    // Open first task
    await page.locator('[data-testid="task-card"]').first().click();

    // Add comment
    await page.fill('textarea[name="comment"]', 'This is a test comment');
    await page.click('button:has-text("إضافة تعليق")');

    // Comment should appear
    await expect(page.locator('[data-testid="comments-list"]')).toContainText('This is a test comment');
  });
});
```


***

#### **Test 3: File Upload**

**`e2e/file-upload.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should upload file to task', async ({ page }) => {
    await page.goto('/tasks');
    await page.locator('[data-testid="task-card"]').first().click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-image.png'));

    // Wait for upload
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });

    // File should appear in list
    await expect(page.locator('[data-testid="file-list"]')).toContainText('test-image.png');
  });

  test('should reject files larger than 100MB', async ({ page }) => {
    await page.goto('/tasks');
    await page.locator('[data-testid="task-card"]').first().click();

    // Try to upload large file (mock)
    const fileInput = page.locator('input[type="file"]');
    
    // Intercept upload request
    await page.route('**/storage/v1/object/**', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'File too large' }),
      });
    });

    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'large-file.zip'));

    // Should show error
    await expect(page.locator('[role="alert"]')).toContainText('File too large');
  });
});
```


***

### 4.3 Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report

# Run on specific browser
npx playwright test --project=chromium
```


***

## 5. Visual Regression Testing (Future - Phase 5)

**Tool:** Percy.io (visual diffing)

**Example:**

```typescript
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('visual regression - dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await percySnapshot(page, 'Dashboard - Light Mode');

  // Switch to dark mode
  await page.click('[data-testid="theme-toggle"]');
  await percySnapshot(page, 'Dashboard - Dark Mode');
});
```


***

## 6. Performance Testing

### 6.1 Lighthouse CI

**`.lighthouserc.js`:**

```javascript
module.exports = {
  ci: {
    collect: {
      url: ['https://staging.ninjagenzy.com'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

**Run in CI:**

```bash
npm install -g @lhci/cli
lhci autorun
```


***

### 6.2 Load Testing (Artillery)

**`artillery-config.yml`:**

```yaml
config:
  target: 'https://api.ninjagenzy.com'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 users per second
    - duration: 120
      arrivalRate: 50 # Ramp up to 50/sec
  defaults:
    headers:
      Authorization: 'Bearer {{ token }}'

scenarios:
  - name: 'Task List'
    flow:
      - get:
          url: '/rest/v1/tasks?limit=20'
      - think: 2
      - get:
          url: '/rest/v1/tasks/{{ taskId }}'

  - name: 'Create Task'
    flow:
      - post:
          url: '/rest/v1/tasks'
          json:
            title: 'Load Test Task'
            status: 'todo'
```

**Run:**

```bash
npm install -g artillery
artillery run artillery-config.yml
```


***

## 7. Code Coverage

### 7.1 Coverage Targets

| Component | Target | Critical |
| :-- | :-- | :-- |
| **Utils** | 95%+ | 100% |
| **Hooks** | 90%+ | 95% |
| **Components** | 70%+ | 80% (critical paths) |
| **Services** | 85%+ | 95% |
| **Overall** | 80%+ | 90% (auth, payments) |


***

### 7.2 Coverage Reports

**Run coverage:**

```bash
npm run test:coverage
```

**Output:**

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   82.15 |    76.83 |   81.25 |   82.15 |
 src/utils         |   95.23 |    91.67 |   94.44 |   95.23 |
  formatDate.ts    |     100 |      100 |     100 |     100 |
  validation.ts    |   92.85 |       90 |   91.66 |   92.85 |
 src/hooks         |   88.46 |    82.35 |   87.50 |   88.46 |
  useTasks.ts      |   90.90 |    85.71 |   88.88 |   90.90 |
  useAuth.ts       |   86.36 |       80 |      86 |   86.36 |
 src/components    |   73.91 |    68.42 |   75.00 |   73.91 |
  TaskCard.tsx     |   81.81 |    77.77 |      80 |   81.81 |
  Dashboard.tsx    |   65.21 |    58.33 |   66.66 |   65.21 |
-------------------|---------|----------|---------|---------|
```

**View HTML report:**

```bash
open coverage/index.html
```


***

## 8. Testing Best Practices

### 8.1 Writing Good Tests

✅ **DO:**

- Test behavior, not implementation
- Use descriptive test names: `it('should show error when password is less than 8 characters')`
- Arrange-Act-Assert pattern
- One assertion per test (when possible)
- Mock only external dependencies
- Clean up after tests (especially integration tests)

❌ **DON'T:**

- Test implementation details (internal state, private methods)
- Write tests that depend on each other
- Use hard-coded waits (`sleep(1000)`) - use `waitFor` instead
- Test third-party libraries (trust they work)
- Ignore flaky tests (fix or remove them)

***

### 8.2 AAA Pattern Example

```typescript
test('should calculate total price correctly', () => {
  // Arrange (setup)
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ];

  // Act (execute)
  const total = calculateTotal(items);

  // Assert (verify)
  expect(total).toBe(250);
});
```


***

### 8.3 Testing Async Code

```typescript
// ❌ Bad (missing await)
test('fetches user data', () => {
  const user = fetchUser('123'); // Returns Promise
  expect(user.name).toBe('Ahmed'); // FAILS - user is Promise
});

// ✅ Good (using async/await)
test('fetches user data', async () => {
  const user = await fetchUser('123');
  expect(user.name).toBe('Ahmed');
});

// ✅ Good (using waitFor for UI updates)
test('shows loading then data', async () => {
  render(<UserProfile id="123" />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Ahmed Mohamed')).toBeInTheDocument();
  });
});
```


***

## 9. Manual Testing Checklist

### 9.1 Pre-release Manual Tests

**Critical User Flows:**

```
Authentication
  □ Login with valid credentials
  □ Login with invalid credentials
  □ Logout
  □ Password reset flow
  □ Session persistence (refresh page)

Task Management
  □ Create task (all required fields)
  □ Create task (missing required field - should error)
  □ Update task status (drag & drop in board view)
  □ Update task details (edit form)
  □ Delete task
  □ Filter tasks (by status, assignee, project)
  □ Search tasks (by title)

File Upload
  □ Upload image (PNG, JPG)
  □ Upload document (PDF, DOCX)
  □ Upload large file (> 100MB - should reject)
  □ Download file
  □ Delete file

Comments
  □ Add comment to task
  □ Real-time update (open same task in 2 tabs)
  □ Mention user (@username)

Notifications
  □ Receive notification (task assigned)
  □ Mark notification as read
  □ Click notification (navigate to task)

Client Portal
  □ Client login (separate from agency login)
  □ Client views assigned tasks
  □ Client approves task
  □ Client requests changes

Responsive Design
  □ Mobile view (375px width)
  □ Tablet view (768px width)
  □ Desktop view (1920px width)
  □ RTL layout (Arabic)

Browser Compatibility
  □ Chrome (latest)
  □ Firefox (latest)
  □ Safari (latest)
  □ Edge (latest)
```


***

## 10. Testing in CI/CD

### 10.1 GitHub Actions Test Workflow

**`.github/workflows/test.yml`:**

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main, staging]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: https://staging.ninjagenzy.com
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```


***

## 11. Test Data Management

### 11.1 Test Fixtures

**`e2e/fixtures/test-data.ts`:**

```typescript
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!@#',
  },
  teamLeader: {
    email: 'leader@test.com',
    password: 'Leader123!@#',
  },
  member: {
    email: 'member@test.com',
    password: 'Member123!@#',
  },
};

export const testTasks = {
  todo: {
    title: 'Test Task - Todo',
    status: 'todo',
    priority: 'medium',
  },
  inProgress: {
    title: 'Test Task - In Progress',
    status: 'in_progress',
    priority: 'high',
  },
};
```


***

## 12. Testing Metrics Dashboard

**Track over time:**

- Test count (unit, integration, e2e)
- Code coverage %
- Test execution time
- Flaky test rate
- Bugs found by tests vs. production

**Goal:** Improve confidence in releases, reduce production bugs

***

**🎉 Testing Strategy Complete!**

**Summary:**

- ✅ 60% Unit tests (fast, many)
- ✅ 30% Integration tests (medium speed)
- ✅ 10% E2E tests (slow, critical flows)
- ✅ 80%+ code coverage target
- ✅ Automated in CI/CD
- ✅ Manual checklist for releases

**الوثائق اللي عملناها:**

1. ✅ System Architecture Document (SAD + C4 Diagrams)
2. ✅ API Specification
3. ✅ DevOps \& CI/CD Pipeline
4. ✅ Testing Strategy

**عايز حاجة تانية؟**

- Team Onboarding Guide (للـ developers الجدد)
- Security \& Compliance Document
- Performance Benchmarks
- User Documentation

قولي! 🚀
<span style="display:none">[^1][^10][^11][^12][^13][^14][^15][^16][^17][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: Pricing page.md

[^2]: Pricing Model.md

[^3]: PHASE 5 (تكملة).md

[^4]: PHASE 5 — SCALE \& ENTERPRISE (Month 11-14).md

[^5]: PHASE 4.2 Mockup Preview System.md

[^6]: PHASE 4.1 — ADVANCED \& INTEGRATIONS.md

[^7]: PHASE 3.3 (Complete) — PRODUCTIVITY \& CULTURE.md

[^8]: Phase 3.2 UX Features.md

[^9]: PHASE 3 — Productivity \& Culture (Month 6–7).md

[^10]: 3. Basic Analytics Dashboard.md
[^11]: 2. CLIENT \& TEAM ENHANCEMENT.md
[^12]: 1 (UPDATED) - FOUNDATION.md

[^13]: Technical Details, Features \& Implem.md

[^14]: Product Vision Document1.2.md

[^15]: Product Vision Document1.1.md

[^16]: PART 3_ SYSTEM DESIGN (تكملة).md

[^17]: PART 3_ COMPLETE SYSTEM DESIGN.md

