---
title: "Developer Onboarding Guide"
version: "1.0"
last_updated: "2026-01-24"
status: "Draft"
author: "Antigravity Agent"
related_docs:
  - "Development Standards Document"
  - "System Architecture"
priority: "P2"
---

# دليل تهيئة المطورين (Developer Onboarding)

## 👋 مرحباً بك في فريق Ninja Gen Z!

هذا الدليل سيساعدك على إعداد بيئة التطوير والبدء في كتابة الكود خلال **30 دقيقة**.

---

## 1. المتطلبات المسبقة (Prerequisites)

- **Node.js:** v18.x أو أحدث (نوصي باستخدام `nvm`).
- **Git:** أحدث إصدار.
- **VS Code:** المحرر المعتمد مع الإضافات التالية:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Supabase (اختياري)
- **Supabase CLI:** لإدارة قاعدة البيانات محلياً.

### 1.2 إضافات المتصفح (Browser Extensions)
- **React Developer Tools:** [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- **Redux DevTools:** (يعمل مع Zustand) [Chrome](https://chrome.google.com/webstore/detail/redux-devtools)

### 1.3 مراجع مفيدة (Resources)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)
- [dnd-kit](https://dndkit.com)
- [Sonner](https://sonner.emilkowal.ski/)
- [i18next](https://www.i18next.com)
- [Tiptap](https://tiptap.dev)
- [React Hotkeys Hook](https://react-hotkeys-hook.vercel.app/)
- [React Dropzone](https://react-dropzone.js.org/)
- [React Helmet Async](https://github.com/staylor/react-helmet-async)
- [React PDF](https://react-pdf.org/)
- [TanStack Table](https://tanstack.com/table/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [CMDK](https://cmdk.paco.me/)
- [Magic UI](https://magicui.design)
- [Aceternity UI](https://ui.aceternity.com)
- [Template: shadcn-admin](https://github.com/satnaing/shadcn-admin)
- [Template: nixn](https://github.com/arifszn/nixn)


---

## 2. إعداد المشروع (Local Setup)

### الخطوة 1: استنساخ المستودع
```bash
git clone https://github.com/your-org/ninja-gen-z.git
cd ninja-gen-z
```

### الخطوة 2: تثبيت الاعتمادات
```bash
npm install
```

### الخطوة 3: إعداد المتغيرات البيئية
انسخ ملف المثال وقم بتعديله:
```bash
cp .env.example .env.local
```
*اطلب مفاتيح التطوير (Dev Keys) من مدير الفريق التقني.*

### الخطوة 4: تشغيل السيرفر المحلي
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:5173`

---

## 3. التعامل مع قاعدة البيانات (Supabase)

نستخدم Supabase محلياً للتطوير:

1. **تشغيل Supabase:**
   ```bash
   npx supabase start
   ```

2. **تطبيق الترحيلات (Migrations):**
   ```bash
   npx supabase db reset
   ```

3. **توليد الأنواع (Types):**
   ```bash
   npm run update-types
   ```
   *يجب تشغيل هذا الأمر بعد أي تعديل في قاعدة البيانات.*

---

## 4. هيكلية المشروع (Folder Structure)

```
/src
  /components     # UI Components (Shadcn/ui)
  /hooks          # Custom React Hooks
  /lib            # Utilities & API Clients
  /pages          # Page Components (Routing)
  /types          # TypeScript Definitions
  /styles         # Global CSS & Tailwind
```

---

## 5. سير العمل (Workflow)

1. **انشاء فرع جديد:** `git checkout -b feature/amazing-feature`
2. **كتابة الكود:** التزم بـ [معايير التطوير](../Development-Standards-Document.md).
3. **الاختبار:** `npm run test`
4. **Pull Request:** افتح PR وانتظر المراجعة.

---

## ❓ تحتاج مساعدة؟

- قناة Discord للمطورين: `#dev-chat`
- الوثائق التقنية: `/docs`
- قائد الفريق: `tech-lead@ninjagenzy.com`
