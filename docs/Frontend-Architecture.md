# 🎨 Frontend Architecture

> **Stack:** React 18, Vite, Tailwind CSS, TypeScript
> **Agent:** Antigravity

---

## 1. Directory Structure

We follow a modified **Atomic Design** pattern:

\\\plaintext
src/
 components/
    atoms/          # Basic building blocks (Button, Input, Icon)
│   ├── molecules/      # Combinations (FormGroup, SearchBar)
│   ├── organisms/      # Complex sections (Header, TaskBoard)
    templates/      # Page layouts (DashboardLayout, AuthLayout)
    views/          # Route views (DashboardPage, ProfilePage)
 features/           # Feature-based modules (optional for complex logic)
 hooks/              # Custom React Hooks
 lib/                # Utilities & Configurations (supabase, utils)
 services/           # API Clients (mcp-client, api)
 stores/             # Global State (Zustand)
 types/              # TypeScript Definitions
\\\

---

## 2. Component Guidelines

*   **Functional Components**: Use \unction Name() {}\ syntax.
*   **Typed Props**: Always define an interface \NameProps\.
*   **Tailwind Styling**: Use utility classes. For complex conditionals, use \clsx\ or \	ailwind-merge\.
*   **No Logic in UI**: Move business logic to custom hooks (\useTaskLogic\).

### Example Atom
\\\	sx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        className
      )}
      {...props}
    />
  );
}
\\\

---

## 3. State Management

### Server State (Async Data)
Use **TanStack Query (React Query)**.
*   Caching, deduplication, and background updates.
*   Keys: \['tasks', workspaceId]\, \['user', userId]\.

### Client State (UI)
Use **Zustand**.
*   Sidebar toggle, Modal visibility, Theme preference.
*   Avoid Context API for frequent updates to prevent re-renders.

---

## 4. MCP Integration (Agent Communication)

The frontend connects to the local MCP Server to receive real-time updates from Trae/Backend.

*   **Service**: \src/services/mcp-client.ts\
*   **Connection**: Server-Sent Events (SSE) to \http://localhost:3000/mcp/sse\.
*   **Usage**:
    \\\	s
    // In a component
    const { status } = useAgentStatus();
    
    useEffect(() => {
      // Listen for task handoffs
      mcpClient.on('handoff', (data) => {
        toast.info(\New task from Trae: \\);
      });
    }, []);
    \\\

---

## 5. Routing

Use **React Router v6**.
*   **Layouts**: \RootLayout\, \AuthLayout\, \DashboardLayout\.
*   **Protected Routes**: Wrap dashboard routes in \<RequireAuth>\.
*   **Lazy Loading**: Use \React.lazy()\ for top-level views.

---

## 6. Testing

*   **Unit**: Vitest + React Testing Library (Components).
*   **E2E**: Playwright (Critical flows: Login, Create Task).
