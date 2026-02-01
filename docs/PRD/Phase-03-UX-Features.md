<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Phase 3 (تكملة) — تفاصيل التنفيذ

هنكمّل Phase 3 بتفاصيل UX + الـ automation + الـ APIs بحيث الفريق يقدر يشتغل مباشرة على التنفيذ بدون غموض. هنثبت كمان قرارات “quota + reminders + views” كـ defaults قابلة للتعديل من Settings.

## UX Features (Phase 3)

- سَنَد AI Basic (Q\&A): UI داخل Workspace/Task كـ Drawer chat، مع Context selector (Task/Project/Client/Workspace) + عدّاد “X/50” للشهر + زر “Copy answer” وزر “Create note” (لكن ما يكتبش DB في Basic).
- Prayer Reminders: Settings داخل Profile → Productivity، وتشمل enable/disable، city أو lat/lng، calculation method + offset دقائق قبل الأذان، وظهور Reminder كـ in-app + Browser notification (اختياري).
- Smart Work System: “Focus Bar” ثابتة أعلى/أسفل الشاشة (حسب desktop/mobile)، Start session على Task أو بدون Task، وBreak overlay 15 دقيقة مع خيار “Snooze 5 min” مرة واحدة فقط لكل session لمنع التساهل.

## Views \& Insights (Phase 3)

- Timeline (Gantt): يعتمد على `tasks.start_at/end_at` + `task_dependencies`، ويدعم drag-reschedule مع confirmation ثم Activity Log + Notification للـ assignee.
- Gallery View: مصدره files thumbnails + ربط كل thumbnail بتاسكها، مع فلاتر (Client/Project/Status/Assignee) وQuick open حسب Task View Mode المفضل.
- Charts View + Performance Insights: Widgets جاهزة (status distribution، throughput أسبوعي، hours logged by user، revisions trend) + “Insights panel” داخل Task يطلع أسباب التأخير (deadline changed مرات، revisions، time spikes) من activity_logs/time_logs/approvals.

## Automation (Supabase + n8n)

- Prayer Times caching: Edge Function يوميًا تسحب مواقيت اليوم/الأسبوع وتملأ `prayer_times_cache` لتقليل الاعتماد على calls مباشرة وقت runtime، وبعدين Worker يطلق notifications قبل الأذان حسب `remind_before_min`.
- Quota reset: Job شهري يعمل reset/rollover على `ai_usage` حسب `month_key` (بدون ما نعدّل سجلات قديمة، فقط نبدأ شهر جديد).
- Smart Work stats: Job أسبوعي يحسب “Focus adherence” و“sessions count” ويكتبها في view/materialized view لتغذية Charts بدون ضغط على queries.

## APIs + Permissions (Phase 3)

- Browser notifications لازم permission صريح من المستخدم عبر `Notification.requestPermission()` قبل عرض إشعارات على مستوى النظام.[^2]
- Scheduling jobs على Supabase يتم عبر pg_cron لاستدعاء Edge Function دوريًا (مثال: كل دقيقة/كل يوم) كما هو موضح في توثيق “Scheduling Edge Functions”.[^3]
- Timeline drag/drop: في FullCalendar، callback `eventDrop` بيتنادي عند نقل الـ event لوقت/يوم مختلف، ومعه `info.revert()` لو المستخدم رفض التأكيد.[^5]

## Roadmap + قرارات لازم نثبتها

- قرار quota (لازم قبل Sprint 12):
  - Option A: 50 سؤال/شهر لكل User (أفضل للـ adoption).
  - Option B: 50 سؤال/شهر لكل Agency (أفضل للتحكم في التكلفة).
  - Option C: 50/Agency + “Top-up” مدفوع (أفضل للـ monetization).
- Risks (Phase 3):
  - Load على activity_logs/time_logs لو عملنا insights بـ queries مباشرة؛ الحل: views/materialized views + pagination.
  - Prayer reminders accuracy حسب city/method؛ الحل: نخزن method/offset per user ونستخدم caching + اختبارات على مدن MENA الأساسية.

عايز تثبت أي اختيار للـ AI quota (Per user / Per agency / Hybrid)؟
<span style="display:none">[^11][^13][^15][^17][^6][^8][^9]</span>
