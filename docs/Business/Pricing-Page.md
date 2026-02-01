Pricing page copy (جاهزة للـLanding)
Hero (Arabic)
Ninja Gen Z: إدارة وكالة التسويق “على نظام” — لكل عميل Workspace، وكل فريق ليه مقاعد واضحة، والعميل يراجع الشغل من البورتال بدون واتساب.

ابدأ مجانًا، وادفع لما تكبر: Workspaces أكثر، Seats أكثر، Storage أكثر، وذكاء اصطناعي أقوى.
​

Hero (English)
Ninja Gen Z: Agency operations built for client delivery — one workspace per client group, clear internal seats, and a client portal that replaces WhatsApp reviews.

Start free, then scale by adding workspaces, seats, storage, and AI.
​

CTAs
Primary: Start Free

Secondary: Book a Demo (Enterprise)

Trust/clarity microcopy
Prices shown in USD; your final price may vary by billing country (regional pricing).
​

Client reviewers are free (not counted as seats) with plan limits.
​

Pricing table (v1 — per workspace)
Workspace = Client Group.
​

Plan	Price (USD base)	Internal seats / workspace	Client reviewers / workspace	Storage / workspace	Best for
Free	0$ 
​	5 
​	1 (free)	1GB 
​	تجربة سريعة + فريلانسر
Starter	30$ 
​	10 
​	3 (free)	50GB 
​	Small agency + 1–2 clients
Pro	70$ 
​	30 
​	5 (free)	200GB 
​	Team Leaders + Media Buyers
Enterprise	Custom / Starting 500$ 
Unlimited 
​	Custom/Unlimited	Unlimited 
​	White‑label + SSO + API
“Most popular” badge
حط “Most Popular” على Pro لأنه فيه Ads monitoring + Priority support حسب التسعير الحالي.
​

Add-ons section (copy + prices)
Seats (internal only)
+5 seats: 12$ / workspace / month

+20 seats: 39$ / workspace / month

Storage
+50GB: 10$ / workspace / month

+200GB: 30$ / workspace / month

AI
AI Pro: 15$ / workspace / month (Unlimited QA + advanced workflows).
​

AI Credits packs (Pay‑as‑you‑go): 100 credits = 12$, 500 credits = 49$, 2000 credits = 149$.

“What’s included” (مختصر للـPricing page)
Core (all plans)
Agency → Workspace → Client → Project → Task hierarchy.
​

Comments + notifications + audit trail style activity log (foundation).
​

Starter adds (client delivery)
Client Portal (subdomain) + approvals/feedback بدل واتساب.
​

Time tracking + calendar + file management + strategy docs + email notifications (Phase 2).
​

Pro adds (performance)
Ads monitoring + priority support (حسب التسعير الحالي).
​

AI Pro works best here for planners + team leads.
​

Enterprise adds (IT + branding)
White‑label (custom domain/branding/custom emails).
​

SSO + custom roles/permissions + public API/webhooks (Phase 5).
​

Billing implementation (Stripe/Paddle) — blueprint
Price objects (minimal clean structure)
اعمل Product واحد اسمه “Ninja Gen Z – Workspace Plan” وPrices منفصلة لكل tier: Free/Starter/Pro/Enterprise.
​
للـRegional pricing: اعمل “price book” mapping (billing_country → tier_price_id) بدل ما تبني منطق معقد في الفرونت.

Required SKUs (Stripe products) — v1
Workspace Plan: Starter (monthly), Pro (monthly)
​

Add-on: AI Pro (monthly per workspace)
​

Add-on: Seats +5, Seats +20 (monthly per workspace)

Add-on: Storage +50GB, Storage +200GB (monthly per workspace)

One-time: AI Credits 100/500/2000 (one-time)

UX notes (pricing page layout)
خلي tiers واضحة وبسيطة وتوضح “مين الخطة دي ليه” بسرعة، وقلّل الزحمة في الجدول عشان التحويل أعلى.

عايزني أطلع لك دلوقتي:

نسخة “Pricing page components” جاهزة كـReact + Tailwind (جدول + toggle شهري/سنوي placeholder + badge + FAQ)، ولا

وثيقة “Stripe/Paddle Data Model” (price IDs + checkout flows + entitlement rules per workspace)؟