---
title: "UI/UX Design System Document"
version: "1.0"
last_updated: "2026-01-24"
status: "Approved"
author: "Antigravity Agent"
related_docs:
  - "Product Vision Document"
  - "Development Standards Document"
  - "User Flow Diagrams"
priority: "P1"
estimated_implementation_time: "2 weeks"
---

# UI/UX Design System — Ninja Gen Z Platform

## TL;DR

This document defines the complete design system for the Ninja Gen Z platform, a **dark-mode-first, Gen Z-optimized, Arabic-RTL** interface. The system uses **Shadcn/ui** components built on **Radix UI** + **Tailwind CSS** with a **cyberpunk/neon color palette** (purples, pinks, blues). Design tokens include semantic color scales (`primary`, `accent`, `muted`), typography (Inter font family, sizes from `text-xs` to `text-4xl`), and spacing (0.25rem increments). The platform supports **RTL layout** for Arabic with mirrored components, **dark mode** as default (with light mode toggle), and follows **WCAG 2.1 AA** accessibility standards. Animations are **fast and snappy** (< 300ms), using `transition-all` for smooth interactions.

---

## Table of Contents

- [1. Design Philosophy](#1-design-philosophy)
- [2. Design Tokens](#2-design-tokens)
- [3. Typography](#3-typography)
- [4. Color System](#4-color-system)
- [5. Spacing & Layout](#5-spacing--layout)
- [6. Component Library](#6-component-library)
- [7. Dark Mode Implementation](#7-dark-mode-implementation)
- [8. RTL Layout (Arabic)](#8-rtl-layout-arabic)
- [9. Accessibility Standards](#9-accessibility-standards)
- [10. Animation Guidelines](#10-animation-guidelines)
- [11. Responsive Design](#11-responsive-design)
- [12. Next Steps](#12-next-steps)
- [13. References](#13-references)
- [14. Changelog](#14-changelog)

---

## 1. Design Philosophy

### 1.1 Core Principles

**1. Gen Z Aesthetic First**
- **Dark mode default**: Light mode as optional toggle
- **Vibrant colors**: Neon purples, pinks, blues (cyberpunk-inspired)
- **Premium feel**: Glassmorphism, subtle gradients, smooth animations

**2. Arabic-First Interface**
- **RTL layout**: Natural reading direction for Arabic users
- **Arabic typography**: Optimized font rendering (Noto Sans Arabic fallback)
- **Bilingual support**: Seamless switching between Arabic and English

**3. Speed & Simplicity**
- **Fast animations**: < 300ms transitions (no slow fades)
- **Minimal clicks**: 2-click rule for common actions
- **Instant feedback**: Visual confirmation for all interactions

**4. Accessible by Default**
- **WCAG 2.1 AA compliant**: Color contrast, keyboard navigation
- **Screen reader support**: Semantic HTML, ARIA labels
- **Reduced motion**: Respect `prefers-reduced-motion`

### 1.2 Design Inspiration

**Reference Platforms:**
- **Linear**: Clean, fast, dark-mode-first
- **Notion**: Flexible layouts, smooth interactions
- **Raycast**: Command palette, keyboard-first
- **Discord**: Dark mode, vibrant accents, Gen Z appeal

---

## 2. Design Tokens

### 2.1 Tailwind Configuration

**Reference:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          purple: '#9333ea', // Primary brand color
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
        },
        
        // Semantic colors (Shadcn/ui compatible)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### 2.2 CSS Variables (Dark Mode)

**Reference:** `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 270 91% 55%; /* Purple #9333ea */
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 270 91% 55%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%; /* Very dark background */
    --foreground: 0 0% 98%;
    --card: 240 10% 8%; /* Slightly lighter than background */
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 8%;
    --popover-foreground: 0 0% 98%;
    --primary: 270 91% 55%; /* Purple #9333ea */
    --primary-foreground: 0 0% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 270 91% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}
```

---

## 3. Typography

### 3.1 Font Stack

**Primary Font:** Inter (Google Fonts)
**Arabic Fallback:** Noto Sans Arabic
**Monospace:** JetBrains Mono (code blocks)

**Import Fonts:**

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Size Class | Font Size | Line Height | Usage |
|:-----------|:----------|:------------|:------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) | Small labels, captions |
| `text-sm` | 0.875rem (14px) | 1.25rem (20px) | Body text (secondary) |
| `text-base` | 1rem (16px) | 1.5rem (24px) | Body text (default) |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) | Subtitles, large body |
| `text-xl` | 1.25rem (20px) | 1.75rem (28px) | H4 headings |
| `text-2xl` | 1.5rem (24px) | 2rem (32px) | H3 headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem (36px) | H2 headings |
| `text-4xl` | 2.25rem (36px) | 2.5rem (40px) | H1 headings |

### 3.3 Font Weights

```css
font-normal   → 400 (body text)
font-medium   → 500 (emphasis, buttons)
font-semibold → 600 (headings, labels)
font-bold     → 700 (strong emphasis)
```

### 3.4 Typography Examples

```tsx
// Headings
<h1 className="text-4xl font-bold">مرحباً بك في Ninja Gen Z</h1>
<h2 className="text-3xl font-semibold">المشاريع</h2>
<h3 className="text-2xl font-semibold">المهام</h3>

// Body text
<p className="text-base text-muted-foreground">
  وصف المهمة هنا...
</p>

// Small text
<span className="text-sm text-muted-foreground">
  آخر تحديث: منذ 5 دقائق
</span>
```

---

## 4. Color System

### 4.1 Brand Colors

```css
/* Primary brand color (Purple) */
bg-brand-purple → #9333ea

/* Accent colors */
bg-brand-pink   → #ec4899
bg-brand-blue   → #3b82f6
bg-brand-cyan   → #06b6d4
```

### 4.2 Semantic Colors

| Purpose | Light Mode | Dark Mode | Usage |
|:--------|:-----------|:----------|:------|
| **Background** | White (#fff) | Very dark gray (#0a0a0f) | Page background |
| **Card** | White | Dark gray (#1a1a24) | Container backgrounds |
| **Primary** | Purple (#9333ea) | Purple (#9333ea) | Buttons, links, highlights |
| **Muted** | Light gray | Dark gray | Disabled states, borders |
| **Destructive** | Red (#ef4444) | Dark red (#991b1b) | Delete, errors |

### 4.3 Color Usage Examples

```tsx
// Background colors
<div className="bg-background">Page background</div>
<div className="bg-card">Card background</div>

// Text colors
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>

// Brand accents
<button className="bg-primary text-primary-foreground">
  إنشاء مهمة جديدة
</button>

// Status colors
<Badge variant="destructive">متأخر</Badge>
<Badge variant="default" className="bg-green-500">مكتمل</Badge>
```

### 4.4 Glassmorphism Effect

```css
/* Glass card effect */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Dark mode glass */
.dark .glass-card {
  background: rgba(26, 26, 36, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Usage:**

```tsx
<div className="glass-card rounded-lg p-6">
  <h3 className="text-xl font-semibold">إحصائيات الأداء</h3>
  {/* Content */}
</div>
```

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

```css
/* Tailwind spacing (0.25rem = 4px increments) */
p-0   → 0px
p-1   → 4px
p-2   → 8px
p-3   → 12px
p-4   → 16px (most common)
p-6   → 24px
p-8   → 32px
p-12  → 48px
p-16  → 64px
```

### 5.2 Layout Grid

**12-column grid with responsive gaps:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### 5.3 Container Widths

```css
/* Max container widths */
max-w-sm   → 384px  (small forms)
max-w-md   → 448px  (modals)
max-w-lg   → 512px  (dialogs)
max-w-2xl  → 672px  (content areas)
max-w-4xl  → 896px  (dashboards)
max-w-7xl  → 1280px (full-width pages)
```

---

## 6. Component Library

### 6.1 Shadcn/ui Components

**Installed Components:**

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
```

### 6.2 Button Component

**Variants:**

```tsx
import { Button } from '@/components/ui/button';

// Primary button (default)
<Button>حفظ</Button>

// Secondary button
<Button variant="secondary">إلغاء</Button>

// Destructive button
<Button variant="destructive">حذف</Button>

// Ghost button
<Button variant="ghost">تعديل</Button>

// Outline button
<Button variant="outline">عرض المزيد</Button>

// Sizes
<Button size="sm">صغير</Button>
<Button size="default">عادي</Button>
<Button size="lg">كبير</Button>

// With icon
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  إضافة مهمة
</Button>
```

### 6.3 Card Component

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">محتوى البطاقة هنا...</p>
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">إلغاء</Button>
    <Button>حفظ</Button>
  </CardFooter>
</Card>
```

### 6.4 Form Components

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-4">
  <div>
    <Label htmlFor="title">عنوان المهمة</Label>
    <Input 
      id="title" 
      placeholder="أدخل العنوان..." 
      className="mt-1"
    />
  </div>
  
  <div>
    <Label htmlFor="description">الوصف</Label>
    <textarea 
      id="description"
      className="w-full rounded-md border px-3 py-2"
      rows={4}
      placeholder="وصف المهمة..."
    />
  </div>
</div>
```

---

## 7. Dark Mode Implementation

### 7.1 Theme Provider

```tsx
// src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'dark',
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### 7.2 Theme Toggle Component

```tsx
// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## 8. RTL Layout (Arabic)

### 8.1 RTL Configuration

```tsx
// src/main.tsx
import { useEffect } from 'react';

function App() {
  const language = localStorage.getItem('language') || 'ar';

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return <div>{/* App content */}</div>;
}
```

### 8.2 RTL-Aware Spacing

```tsx
// Use logical properties (automatically reversed in RTL)
<div className="ms-4">   {/* margin-inline-start (right in RTL) */}
<div className="me-4">   {/* margin-inline-end (left in RTL) */}
<div className="ps-4">   {/* padding-inline-start */}
<div className="pe-4">   {/* padding-inline-end */}

// ❌ Avoid fixed directions
<div className="ml-4">   {/* Always left margin, NOT RTL-aware */}
<div className="mr-4">   {/* Always right margin, NOT RTL-aware */}
```

### 8.3 Icon Mirroring

```css
/* Auto-mirror directional icons in RTL */
.rtl-mirror {
  transform: scaleX(-1);
}
```

```tsx
// Icons that should flip in RTL
<ChevronRightIcon className="rtl:rotate-180" />
<ArrowLeftIcon className="rtl:rotate-180" />
```

---

## 9. Accessibility Standards

### 9.1 WCAG 2.1 AA Compliance

**Color Contrast Requirements:**

| Element | Contrast Ratio | Example |
|:--------|:---------------|:--------|
| **Normal text** | 4.5:1 | Body text on background |
| **Large text** (18px+) | 3:1 | Headings |
| **UI components** | 3:1 | Buttons, borders |

**Check Contrast:**

```bash
# Use WebAIM Contrast Checker
https://webaim.org/resources/contrastchecker/

# Purple #9333ea on dark bg #0a0a0f → Pass ✅
# Purple #9333ea on white → Fail ❌ (use darker shade)
```

### 9.2 Keyboard Navigation

**Tab Order:**

```tsx
// Ensure logical tab order
<form>
  <Input tabIndex={1} />
  <Input tabIndex={2} />
  <Button tabIndex={3}>Submit</Button>
</form>

// Skip navigation link (assistive tech)
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

### 9.3 ARIA Labels

```tsx
// Icon-only buttons
<Button aria-label="حذف المهمة">
  <TrashIcon className="h-4 w-4" />
</Button>

// Loading states
<Button disabled aria-busy="true">
  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
  جاري التحميل...
</Button>

// Form errors
<Input
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby="email-error"
/>
{error && (
  <p id="email-error" className="text-sm text-destructive">
    {error}
  </p>
)}
```

### 9.4 Screen Reader Support

```tsx
// Hide decorative elements
<div aria-hidden="true" className="decorative-gradient" />

// Announce live updates
<div role="status" aria-live="polite">
  تم حفظ التغييرات ✓
</div>

// Semantic HTML
<nav aria-label="التنقل الرئيسي">
  <ul>
    <li><a href="/dashboard">لوحة التحكم</a></li>
    <li><a href="/tasks">المهام</a></li>
  </ul>
</nav>
```

---

## 10. Animation Guidelines

### 10.1 Animation Speeds

```css
/* Fast animations (Gen Z preference) */
transition-all duration-150 → 150ms (hover states)
transition-all duration-200 → 200ms (modals, dropdowns)
transition-all duration-300 → 300ms (page transitions)

/* ❌ Avoid slow animations */
transition-all duration-500 → Too slow for Gen Z
```

### 10.2 Common Animations

**Hover Effects:**

```tsx
<Button className="hover:scale-105 hover:shadow-lg transition-all duration-150">
  إنشاء مهمة
</Button>
```

**Fade In:**

```tsx
<div className="animate-in fade-in duration-200">
  {/* Content */}
</div>
```

**Slide In:**

```tsx
<div className="animate-in slide-in-from-right duration-200">
  <Sidebar />
</div>
```

### 10.3 Reduced Motion

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Responsive Design

### 11.1 Breakpoints

```css
/* Tailwind breakpoints */
sm:  640px  → Small tablets
md:  768px  → Tablets
lg:  1024px → Desktop
xl:  1280px → Large desktop
2xl: 1536px → Extra large
```

### 11.2 Responsive Patterns

**Mobile-First Approach:**

```tsx
// Mobile: Stack vertically
// Desktop: 2 columns
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <Card>Column 1</Card>
  <Card>Column 2</Card>
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">
  <Sidebar />
</div>

// Show on mobile, hide on desktop
<Button className="lg:hidden">
  <MenuIcon />
</Button>
```

---

## 12. Next Steps

- [ ] Install Shadcn/ui components (button, card, input, etc.)
- [ ] Set up Tailwind CSS with custom configuration
- [ ] Implement ThemeProvider with dark mode toggle
- [ ] Configure RTL layout for Arabic
- [ ] Add Google Fonts (Inter, Noto Sans Arabic)
- [ ] Create reusable component library in Storybook
- [ ] Conduct accessibility audit (aXe DevTools)
- [ ] Test on real devices (iOS Safari, Android Chrome)
- [ ] Optimize for Core Web Vitals (LCP, FID, CLS)

---

## 13. References

- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Product Vision Document](file:///e:/docs/docs/PVD/Product%20Vision%20Document1.1.md)

---

## 14. Changelog

- **v1.0** (2026-01-24): Initial UI/UX design system
  - Design philosophy and core principles (Gen Z, Arabic-first, accessible)
  - Complete design tokens (colors, typography, spacing)
  - Tailwind configuration with dark mode support
  - Shadcn/ui component library setup
  - Dark mode implementation with theme provider
  - RTL layout configuration for Arabic
  - WCAG 2.1 AA accessibility standards
  - Animation guidelines (fast, < 300ms)
  - Responsive design patterns (mobile-first)
