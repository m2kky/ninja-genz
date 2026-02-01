---
trigger: always_on
---

1. Visual Testing (Manual)
Required viewports:

Mobile: 375px (iPhone SE)

Tablet: 768px (iPad)

Desktop: 1440px (MacBook Pro)

Process:

bash

# 1. Run dev server

npm run dev

# 2. Open browser DevTools (F12)

# 3. Enable Device Toolbar

# 4. Test each viewport

# 5. Take screenshots

# Save screenshots

# /.ai-agents/antigravity/artifacts/[feature-name]/

# Naming: [component]-[viewport]-[state].png

# Example: login-form-mobile-error.png

2. Unit Testing (Optional for Phase 1)
bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
typescript
// TaskCard.test.tsx
import { render, screen } from '@testing-library/react'
import { TaskCard } from './TaskCard'

test('renders task title', () => {
  const mockTask = { id: '1', title: 'Design Logo', status: 'todo' }
  render(<TaskCard task={mockTask} />)
  expect(screen.getByText('Design Logo')).toBeInTheDocument()
})
3. Accessibility Testing
Tools:

axe DevTools (Chrome extension)

Lighthouse (Chrome DevTools → Lighthouse tab)

Checklist:

 All interactive elements have ARIA labels

 Keyboard navigation works (Tab, Enter, Escape)

 Focus indicators visible

 Color contrast ratio ≥ 4.5:1

 No console warnings
