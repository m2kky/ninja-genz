Pricing Model Document (Final v1 — Confirmed)
تم—اعتمدنا نموذج Planable-like: التسعير per workspace (Client Group) + seats limits لكل workspace، والـClient reviewers مجانيين (مش seats ومفيش عليهم add-on) لكن عليهم cap حسب الخطة.

1) Packaging & billing units
Workspace = Client Group داخل نفس الـAgency.
​

Monthly bill = 
∑
∑ (Plan price per workspace) + Add-ons (Extra seats + Extra storage + AI Pro + AI credits).
​

2) Pricing tiers (Global USD base)
الأسعار دي Base، وبعدها بنطبق “Regional price books” (USD لكن سعر مختلف حسب بلد الفوترة).
​

Tier	Price	Target
Free	0$ 
​	تجربة / فريلانسر
Starter	30$ / workspace / month 
​	وكالة صغيرة
Pro	70$ / workspace / month 
​	وكالة متوسطة
Enterprise	Custom (أو Starting at 500$/month) 
شركات/وكالات كبيرة
3) Seat model + Client reviewers (per workspace)
A) Internal seats (بتتحسب)
دي المقاعد اللي بتدخل الـMain platform (Owner/Team Leader/Team Member).
​

Tier	Internal seats / workspace	Storage / workspace
Free	5 
​	1GB 
​
Starter	10 
​	50GB 
​
Pro	30 
​	200GB 
​
Enterprise	Unlimited 
​	Unlimited 
​
B) Client reviewers (مجانيين)
Client reviewers = Users role “Client” داخل Client Portal فقط (Review/Approve/Feedback)، ومذكور إننا ندعم دعوة أكثر من مستخدم للعميل.
​

Tier	Client reviewers / workspace	Billing
Free	1	Free
Starter	3	Free
Pro	5	Free
Enterprise	Custom/Unlimited	Free ضمن العقد
لا يوجد أي SKU/charge لزيادة client reviewers؛ الـUpgrade يكون فقط بتغيير الخطة لو احتاجوا cap أكبر.
​

4) Add-ons (per workspace)
Seats add-on (Internal only)
+5 internal seats = 12$ / workspace / month (v1)

+20 internal seats = 39$ / workspace / month (v1)

Storage add-on
+50GB = 10$ / workspace / month (v1)

+200GB = 30$ / workspace / month (v1)

AI add-ons
AI Pro add-on: 15$ / workspace / month (كما في التسعير الحالي).
​

AI Credits add-on: باكدجات pay-as-you-go لاستهلاك “AI actions” الثقيلة (تلخيص اجتماعات/عمليات bulk/تحليلات).
​

اقتراح AI credits (v1):

100 credits = 12$

500 credits = 49$

2000 credits = 149$

5) Enterprise fences (عشان البيع يبقى واضح)
White‑label (custom domain/branding/custom emails/hide powered by) = Enterprise فقط.
​

SSO + Custom roles/permissions + Public API/Webhooks + أعلى rate limits = Enterprise (Phase 5).
​

لو عايز، الخطوة اللي بعدها: أطلع لك Pricing page copy (Arabic/English)، + جدول “What’s included” جاهز للـLanding page، + Stripe/Paddle price IDs structure (نموذج).