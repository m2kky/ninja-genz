# PHASE 3 — Productivity \& Culture (Month 6–7)

## Phase 3 Overview

**Timeline:** شهرين (8 أسابيع / 4 سبرنت)
**Goal:** إطلاق الميزات “التمييزية” للمنصة: إنتاجية صحية + ثقافة + AI مساعد، مع إضافة Views متقدمة (Timeline/Gallery/Charts) وربطها بالـ workflow الحالي.

**Prerequisites:** Phase 1 + Phase 2 شغالين (Client Portal, Time Logs, Files, Approvals, Activity Log, Profiles/Settings).

---

## Goals \& Success Metrics

- تقليل التأخير: خفض معدل الـ overdue tasks بنسبة 20% خلال 6 أسابيع من إطلاق Phase 3.
- رفع جودة التسليم: خفض متوسط الـ revisions لكل Task بنسبة 15% (باستخدام Performance Insights).
- رفع الالتزام: 40% من المستخدمين النشطين يستخدمون Smart Work System 3 مرات/أسبوع.
- Adoption للـ Views الجديدة: 60% من الـ Designers يستخدموا Gallery View أسبوعيًا، و50% من الـ Team Leaders يستخدموا Timeline أو Charts مرة/أسبوع.

---

## Feature Requirements (Phase 3)

### 1) سَنَد AI — Basic (Q\&A فقط) (50 سؤال/شهر)

**Scope:** سؤال/جواب داخل المنصة، بدون إنشاء Tasks أو تعديل بيانات (ده في Pro Phase 4).
**AI Interface:** مبني على نمط “chat completions” (رسائل بأدوار system/user/assistant).[^1]

**User Stories**

- كـ Team Member: أسأل “إيه المطلوب في task دي؟” فيرد بناءً على وصف التاسك + التعليقات + ملفات metadata.
- كـ Team Leader: أسأل “مين أكتر شخص متأخر الأسبوع ده؟” فيرد بمؤشرات من analytics view.

**Acceptance Criteria**

- ✅ Limit: 50 سؤال/شهر لكل Agency (أو Workspace—اختيارك في الـ billing) مع عدّاد واضح داخل UI.
- ✅ AI لا يكتب/يعدل DB في Basic (read-only).
- ✅ Responses تظهر مع “Sources داخلية” (Links للـ Task/Project/Client) وليس نصوص منسوخة.

---

### 2) Prayer Reminders (اختياري لكل User)

**Approach:** حساب مواقيت الصلاة حسب المدينة/الإحداثيات + method (اختلاف طرق الحساب).[^3]

**User Stories**

- كـ Member: أفعّل Prayer Reminders وأحدد المدينة/الـ method وأستقبل reminder قبل الأذان بـ 10 دقائق.
- كـ Owner: أريد الإعدادات “اختيارية” وليست إجبارية على كل الفريق.

**Acceptance Criteria**

- ✅ User يقدر يختار: enable/disable، city/lat-lng، calculation method، offset دقائق قبل/بعد.[^2]
- ✅ Reminders تظهر In-app + Browser notifications (Mobile push في Phase 5).
- ✅ لا تؤثر على أداء التطبيق (الحساب يتم يوميًا/أسبوعيًا وتُخزَّن النتائج).

---

### 3) Smart Work System (90min Work / 15min Break)

**Scope:** نظام جلسات تركيز مع استراحات، مدمج مع Tasks وTime Tracking (Phase 2).

**User Stories**

- كـ Designer: أبدأ Session على Task معينة، وبعد 90 دقيقة يطلع Break 15 دقيقة، وبعدها يرجّعني للـ work.
- كـ Team Leader: أشوف “Focus adherence” خفيف للفريق (اختياري) بدون مراقبة مزعجة.

**Acceptance Criteria**

- ✅ Start session من داخل Task + من “Floating Focus Bar”.
- ✅ Automatically suggest: Start timer (time_logs) عند بدء session (إعداد optional).
- ✅ Logs للجلسات + break completion + إحصاءات أسبوعية لكل مستخدم.

---

### 4) Timeline View (Gantt)

**Scope:** عرض المشاريع/التاسكات على Timeline مع start/end وdependencies (بسيطة).

**User Stories**

- كـ Team Leader: أسحب Task على Timeline لتغيير start/end مع تأكيد.
- كـ Owner: أشوف critical path بسيط عبر dependencies (blocking).

**Acceptance Criteria**

- ✅ Drag to reschedule يحدّث DB + يسجل Activity Log + يرسل إشعار للـ assignee.
- ✅ Filters: Project, Assignee, Status, Priority.
- ✅ Read-only للـ Members إلا لو عندهم صلاحية تعديل deadlines.

---

### 5) Gallery View (للتصميم والميديا)

**Scope:** Grid thumbnails من ملفات Images/Videos المرتبطة بتاسكات، مع meta (client/project/status).

**User Stories**

- كـ Graphic Designer: أشوف كل التصميمات الخاصة بعميل Nike في Gallery وأفلتر “Review”.
- كـ Client (Phase 2 portal): لاحقًا يمكن إعادة استخدام نفس gallery في portal (لكن Phase 3 داخلي فقط).

**Acceptance Criteria**

- ✅ يعتمد على thumbnails/metadata من Files (Phase 2).
- ✅ Clicking item يفتح Task في Task View Mode المفضل.

---

### 6) Charts View (داخل المشروع/الـ workspace)

**Scope:** Dashboards مصغّرة: tasks by status، throughput أسبوعي، hours logged by user، revisions trend (Phase 3).

**Acceptance Criteria**

- ✅ Presets جاهزة + Filters (date range, workspace, client).
- ✅ Export CSV (Phase 2 موجود)، وCharts view يستخدم نفس مصادر البيانات.

---

### 7) Performance Insights (Revision Tracking + Accountability Insights)

**Scope:** “لماذا اتأخرت التاسك؟” اعتمادًا على Activity Logs + Approvals + Time logs.

**Examples of Insights**

- “Deadline اتغير 3 مرات” (من activity_logs)
- “Task اتنقلت Review → In Progress 2 مرات بسبب revisions” (من approvals/revision_count)
- “Time logged عالي مقارنة بمتوسط الفريق لنفس النوع” (من time_logs + tags لاحقًا)

**Acceptance Criteria**

- ✅ يظهر Panel داخل Task: “Insights” (read-only) مع أرقام واضحة + links للسجل.
- ✅ Metrics محسوبة بدون queries ثقيلة (باستخدام views/materialized views عند الحاجة).

---

## System Design Changes (Phase 3)

### Database Additions (Phase 3)

```sql
-- AI usage quota
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  month_key TEXT NOT NULL, -- '2026-01'
  questions_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  UNIQUE(agency_id, user_id, month_key)
);

-- Prayer reminder settings
CREATE TABLE prayer_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  city TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  calculation_method INTEGER DEFAULT 5, -- mapped to AlAdhan methods
  fajr_offset_min INTEGER DEFAULT 0,
  dhuhr_offset_min INTEGER DEFAULT 0,
  asr_offset_min INTEGER DEFAULT 0,
  maghrib_offset_min INTEGER DEFAULT 0,
  isha_offset_min INTEGER DEFAULT 0,
  remind_before_min INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cached prayer times (avoid calling API frequently)
CREATE TABLE prayer_times_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fajr TIMESTAMP NOT NULL,
  dhuhr TIMESTAMP NOT NULL,
  asr TIMESTAMP NOT NULL,
  maghrib TIMESTAMP NOT NULL,
  isha TIMESTAMP NOT NULL,
  source TEXT DEFAULT 'aladhan',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Smart Work sessions
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  work_minutes INTEGER DEFAULT 90,
  break_minutes INTEGER DEFAULT 15,
  status TEXT DEFAULT 'running' CHECK (status IN ('running','break','completed','cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Timeline/Gantt
ALTER TABLE tasks
ADD COLUMN start_at TIMESTAMP,
ADD COLUMN end_at TIMESTAMP;

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'finish_to_start' CHECK (type IN ('finish_to_start','start_to_start')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);
```

### Security \& RLS

- كل الجداول الجديدة لازم RLS عليها ومقفولة افتراضيًا، لأن Supabase يوصي بتفعيل RLS لأي جدول في schema مكشوفة وإلا البيانات لن تكون محمية بشكل كافٍ عند استخدام anon key.[^4]

### API Endpoints (Phase 3)

- `POST /ai/ask` (Phase 3): body `{ question, context: { workspaceId?, taskId? } }` + enforcing quota.
- `GET /users/me/prayer-settings` / `PATCH /users/me/prayer-settings`
- `POST /focus-sessions/start` / `POST /focus-sessions/:id/stop` / `POST /focus-sessions/:id/break`
- `GET /projects/:id/timeline` (tasks + dependencies)
- `GET /workspace/:id/gallery` (files + task refs + filters)

---

## Delivery Plan (8 weeks)

### Sprint 11 (Weeks 21–22)

- Prayer Reminders: settings + cache table + in-app reminders (cron/edge function)[^3]
- Smart Work System: focus_sessions + UI Focus Bar + notifications

### Sprint 12 (Weeks 23–24)

- سَنَد AI Basic: quota tracking + `/ai/ask` + UI chat داخل Task/Workspace[^1]
- Minimal “Insights” panel يعتمد على activity_logs + time_logs + approvals

### Sprint 13 (Weeks 25–26)

- Timeline (Gantt): start/end fields + dependencies + UI + drag reschedule + logging

### Sprint 14 (Weeks 27–28)

- Gallery View + Charts View + تحسينات الأداء + QA + تحسين RTL على الـ views الجديدة

سؤال واحد قبل ما نعتمد Phase 3 نهائيًا: quota بتاع سَنَد (50 سؤال/شهر) تحبه **لكل Agency** ولا **لكل User**؟
</span>

<div align="center">⁂</div>

=
