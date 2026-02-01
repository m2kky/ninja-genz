---
title: "Architecture Decision Records (ADR)"
version: "1.0"
last_updated: "2026-01-24"
priority: "P3"
---

# سجلات القرارات المعمارية (ADR)

## ADR-001: استخدام Supabase كمنصة Backend-as-a-Service
*   **الحالة:** مقبول ✅
*   **التاريخ:** 2026-01-10
*   **السياق:** نحتاج لبناء MVP سريع مع دعم Realtime و Auth.
*   **القرار:** استخدام Supabase بدلاً من بناء Custom Backend (Express/Django).
*   **المبررات:**
    *   يوفر Auth و Database و APIs جاهزة.
    *   دعم ممتاز لـ PostgreSQL (RLS).
    *   يوفر الوقت والجهد في الـ DevOps.

## ADR-002: اعتماد Tailwind CSS للتصميم
*   **الحالة:** مقبول ✅
*   **التاريخ:** 2026-01-12
*   **السياق:** نحتاج لنظام تصميم مرن ويدعم الوضع الداكن (Dark Mode) و RTL.
*   **القرار:** استخدام Tailwind CSS مع Shadcn/ui.
*   **المبررات:**
    *   سرعة التطوير.
    *   دعم ممتاز للـ RTL (start/end logic).
    *   حجم ملف CSS صغير (PurgeCSS).

## ADR-003: تخزين الصور باستخدام Cloudinary للموكأب
*   **الحالة:** مقبول ✅
*   **التاريخ:** 2026-01-15
*   **السياق:** نحتاج لتوليد صور Mockup ديناميكية (وضع التصميم داخل شاشة هاتف).
*   **القرار:** استخدام Cloudinary Transformations.
*   **المبررات:**
    *   لا يتطلب معالجة صور معقدة على السيرفر.
    *   سريع ويدعم التحجيم التلقائي.
