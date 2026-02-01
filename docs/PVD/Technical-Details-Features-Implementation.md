القسم الثالث: Technical Details, Features \& Implementation (المُعدّل)

```markdown
#### **Safety & Confirmation System:**

**Confirmation Required Actions:**
- ✅ إضافة/تعديل/حذف tasks
- ✅ جدولة/إلغاء meetings
- ✅ Assign tasks لأعضاء الفريق
- ✅ تغيير deadlines
- ✅ نقل tasks بين stages
- ✅ إرسال notifications للفريق
- ✅ Bulk operations (مثل تعديل عدة tasks مرة واحدة)

**كل action يظهر في format:**

```

🤖 سَنَد يقترح:
"إضافة task: تصميم بوست لعميل XYZ
Project: Ramadan Campaign
المسؤول: أحمد (Designer)
Deadline: 25 يناير 2026
Priority: High"

[✓ تأكيد]  [✗ إلغاء]  [✏️ تعديل]

```

**No Confirmation Needed (Safe Actions):**
- الإجابة على الأسئلة
- عرض المعلومات
- الاقتراحات والتوصيات
- جمل التحفيز
- التذكيرات

#### **AI Permissions & Control System:**

**Owner Control Panel:**

Owner يقدر يحدد لكل workspace:

| Permission | الوصف | Default |
|:----------|:------|:--------|
| **Can Create Tasks** | سَنَد يقدر يضيف tasks | ✓ Enabled |
| **Can Assign Tasks** | سَنَد يقدر يعمل assign لأعضاء الفريق | ✓ Enabled |
| **Can Schedule Meetings** | سَنَد يقدر يجدول اجتماعات | ✓ Enabled |
| **Can Modify Deadlines** | سَنَد يقدر يغير deadlines | ✗ Disabled |
| **Can Delete Items** | سَنَد يقدر يحذف tasks/meetings | ✗ Disabled |
| **Can Send Client Messages** | سَنَد يقدر يرسل رسائل للعملاء | ✗ Disabled |
| **Can Access Financial Data** | سَنَد يقدر يشوف pricing/invoices | ✗ Disabled |
| **Auto-Execute Actions** | تنفيذ بدون confirmation (غير مُنصح به) | ✗ Disabled |

**User-Level Permissions:**
- كل user يقدر يعطل سَنَد من settings الخاصة به
- كل user يقدر يحدد إيه الـ notifications اللي يستقبلها من سَنَد
- Team Leader يقدر يحدد permissions لفريقه فقط

#### **Workspace Context Awareness:**

**كيف سَنَد يفهم السياق:**

**Data Hierarchy (Hierarchical Structure):**
```

Agency (Tenant)
│
└── Workspace
│
├── Team Members
│   ├── Owner
│   ├── Team Leader
│   ├── Designer
│   ├── Media Buyer
│   └── ...
│
└── Clients
│
└── Client
│
├── Client Info
│   ├── Name, Contact, Email
│   ├── Status (Active/Paused/Archived)
│   ├── Satisfaction Score
│   └── Portal Access
│
├── Brand Kit
│   ├── Logos (primary, secondary, icon)
│   ├── Colors (primary, secondary, accent)
│   ├── Fonts (headings, body, special)
│   ├── Moodboard (images, references)
│   ├── Guidelines (PDF, docs)
│   └── Assets (photos, icons, patterns)
│
├── Strategy
│   ├── Content Strategy
│   ├── Paid Ads Strategy
│   ├── SEO Strategy
│   ├── Competitor Analysis
│   └── KPIs \& Goals
│
└── Projects
│
└── Project
│
├── Project Info
│   ├── Name, Description
│   ├── Status (Planning/Active/On Hold/Completed)
│   ├── Type (Campaign/Retainer/One-time)
│   ├── Start \& End Dates
│   ├── Budget (optional)
│   └── Assigned Team
│
├── Tasks
│   └── Task
│       ├── Title, Description
│       ├── Assignee
│       ├── Status (To Do/In Progress/Review/Done)
│       ├── Priority (High/Medium/Low)
│       ├── Deadline
│       ├── Time Logged
│       ├── Revisions Count
│       ├── Files
│       └── Comments
│
├── Meetings
│   └── Meeting
│       ├── Title, Date, Time
│       ├── Attendees
│       ├── Agenda
│       ├── Notes
│       └── Action Items
│
├── Files
│   ├── Designs
│   ├── Videos
│   ├── Documents
│   └── Reports
│
└── Timeline
└── Gantt Chart View

```

**Context Detection (4 Levels):**

سَنَد يفهم السياق على 4 مستويات:

**Level 1: Agency-wide (Owner only)**
- سَنَد يقدر يشوف كل الـ workspaces والـ clients
- Access: All data across all workspaces
- مثال: "قارن performance جميع الـ clients في Q1"
- مثال: "إيه الـ clients اللي satisfaction score أقل من 70%؟"

**Level 2: Workspace-level**
- سَنَد يشوف كل الـ clients والـ team members في الـ workspace دي
- Access: All clients and projects within workspace
- مثال: "إيه الـ clients الـ active في Workspace E-commerce؟"
- مثال: "مين الـ designer الأسرع في workspace دي؟"

**Level 3: Client-level**
- سَنَد يشوف كل حاجة خاصة بالـ client ده (Brand Kit, Strategy, Projects)
- Access: Brand Kit, Strategy, All projects for this client
- مثال: "إيه الـ brand colors لـ Nike؟" → يروح على Client: Nike → Brand Kit → Colors
- مثال: "إيه الـ content strategy لـ Adidas؟" → يروح على Client: Adidas → Strategy → Content Strategy

**Level 4: Project/Task-level**
- سَنَد يشوف تفاصيل الـ project أو الـ task
- Access: Tasks, Meetings, Files, Timeline for this project
- مثال: "إيه الـ tasks المتأخرة في Ramadan Campaign؟"
- مثال: "مين المسؤول عن task design posts؟"

**أمثلة واقعية للتفاعل:**

**Scenario 1: Client Brand Kit Query**
```

User: "إيه الـ brand colors لـ Nike؟"

سَنَد: "🎨 Brand Kit - Nike Egypt

Primary Colors:

- Black: \#000000
- White: \#FFFFFF

Secondary Colors:

- Orange: \#FF6B35

Fonts:

- Headings: Futura Bold
- Body: Helvetica Neue

Logo Files: 3 versions متاحة
Moodboard: Athletic, Bold, Inspiring

هل تحتاج الملفات؟"

```

**Scenario 2: Multi-level Navigation**
```

User: "إيه الـ projects الـ active؟"

سَنَد: "في أي workspace؟

- E-commerce Clients
- Healthcare Clients
- Internal Projects"

User: "E-commerce"

سَنَد: "تمام! في Workspace E-commerce عندك 3 clients active:

📦 Nike Egypt

- Ramadan Campaign (5 tasks - 2 متأخرين)
- Monthly Social Media (12 tasks - كلهم on track)

👟 Adidas Egypt

- Product Launch (8 tasks - 1 متأخر)

🏃 Puma Egypt

- Influencer Campaign (3 tasks - كلهم on track)

هل تحتاج تفاصيل أي project؟"

```

**Scenario 3: Task Creation with Context**
```

User: "اعمل task جديد لـ Nike"

سَنَد: "تمام! Nike Egypt عندها 2 projects active:

1. Ramadan Campaign
2. Monthly Social Media

في أي project تحب تضيف الـ task؟"

User: "Ramadan Campaign"

سَنَد: "ممتاز! إيه تفاصيل الـ task؟"

User: "تصميم 5 بوستات، deadline بكرة"

سَنَد: "🤖 سَنَد يقترح:

Task: تصميم 5 بوستات
Client: Nike Egypt
Project: Ramadan Campaign
Assignee: أحمد (Designer - Nike's usual designer)
Deadline: 24 يناير 2026، 11:59 PM
Priority: High (لأن deadline قريب)
Estimated Time: 5 hours

ملاحظة: أحمد عنده 3 tasks تانية deadline بكرة. هل تحب:

- تأكيد (أحمد capacity: 70%)
- Assign لمصمم تاني؟
- تغيير الـ deadline؟

[✓ تأكيد]  [✏️ تعديل]  [✗ إلغاء]"

```

**Scenario 4: Strategy Reference**
```

User: "إيه الـ content pillars لـ Adidas؟"

سَنَد: "📋 Content Strategy - Adidas Egypt

Content Pillars:

1. Product Innovation (40%)
2. Athlete Stories (30%)
3. Sustainability (20%)
4. Community Events (10%)

Tone of Voice: Energetic, Motivational, Youth-focused

Posting Frequency:

- Instagram: 5 posts/week
- Facebook: 3 posts/week
- TikTok: 2 videos/week

هل تحتاج الـ content calendar؟"

```

**Scenario 5: Cross-Client Analysis**
```

User (Owner): "قارن satisfaction score لكل الـ clients"

سَنَد: "📊 Client Satisfaction Comparison

Workspace: E-commerce Clients

- Nike Egypt: 92% ⭐⭐⭐⭐⭐
- Adidas Egypt: 78% ⭐⭐⭐⭐
- Puma Egypt: 85% ⭐⭐⭐⭐

Workspace: Healthcare Clients

- Hospital X: 95% ⭐⭐⭐⭐⭐
- Clinic Y: 68% ⚠️ ⭐⭐⭐

⚠️ تنبيه: Clinic Y satisfaction منخفض!
السبب المحتمل:

- 60% rejection rate على التصاميم
- متوسط التأخير: 2.5 أيام

هل تحب تشوف التفاصيل؟"

```

**Scenario 6: Project-specific Query**
```

User: "إيه status الـ tasks في Ramadan Campaign؟"

سَنَد: "📊 Ramadan Campaign - Nike Egypt

Tasks Overview:
✅ Done: 12 tasks
🔄 In Progress: 3 tasks
⏰ To Do: 5 tasks
⚠️ Overdue: 2 tasks

Overdue Tasks:

1. Design carousel posts (Deadline: 22 يناير)
   Assignee: أحمد
2. Write ad copy (Deadline: 23 يناير)
   Assignee: سارة

هل تحب:

- تذكير أحمد وسارة؟
- إعادة جدولة الـ tasks؟
- طلب مساعدة من الفريق؟"

```

**Cross-Workspace Access (Owner Only):**

```

Owner: "إيه الـ designer الأسرع في كل الـ workspaces؟"

سَنَد: "🏆 Top Designers Performance (All Workspaces)

1. أحمد - E-commerce Workspace
   - Avg completion time: 4.2 hours/task
   - Quality score: 92%
   - Tasks completed: 47 (this month)
2. مريم - Healthcare Workspace
   - Avg completion time: 5.1 hours/task
   - Quality score: 88%
   - Tasks completed: 35 (this month)
3. خالد - Internal Projects
   - Avg completion time: 5.8 hours/task
   - Quality score: 85%
   - Tasks completed: 28 (this month)

أحمد هو الأسرع والأعلى جودة! 🔥"

```

#### **Privacy & Security Considerations:**

**Data Privacy:**

1. **Data Isolation:**
   - سَنَد لا يشارك بيانات بين agencies مختلفة (tenants)
   - كل agency بياناتها محفوظة منفصلة تماماً
   - سَنَد لا يتعلم من agency ويطبق على agency تانية

2. **What سَنَد Can Access:**
   - Workspace structure (clients, projects, tasks)
   - Brand Kits (logos, colors, fonts - non-sensitive)
   - Strategy documents (content plans, competitor analysis)
   - Team member names وroles (لا يشمل personal info زي رقم الهاتف أو عنوان)
   - Client names (لا يشمل contracts أو financial details unless permitted)
   - Task details (titles, descriptions, deadlines, status)
   - Performance metrics (إذا User له permission)
   - Meeting titles and agendas (لا يشمل confidential discussions)
   - Chat history مع سَنَد نفسه

3. **What سَنَد Cannot Access (Default):**
   - كلمات السر وtokens
   - Financial data (invoices، pricing، salaries، client retainers)
   - HR sensitive data (تقييمات سرية، مشاكل تأديبية، salary negotiations)
   - Personal conversations في chat بين أعضاء الفريق (إلا إذا Owner سمح)
   - Client portal conversations (إلا إذا Owner سمح)
   - Banking information وpayment details
   - Legal documents and contracts (unless explicitly shared)

4. **Hierarchy-based Access Control:**
   - **Owner:** سَنَد يقدر يشوف كل حاجة في الـ agency
   - **Team Leader:** سَنَد يقدر يشوف workspace(s) المعين عليها فقط
   - **Team Member:** سَنَد يقدر يشوف الـ clients والـ projects المعين عليها فقط
   - **Client:** سَنَد لا يظهر للـ clients (they don't have access)

5. **Data Sent to AI Provider:**
   - نرسل فقط الـ context الضروري (task name، client name، basic info)
   - نعمل anonymization للبيانات الحساسة قبل إرسالها
   - نستخدم encryption في النقل (TLS 1.3)
   - نستخدم hashing للـ IDs الداخلية

6. **Data Retention:**
   - Chat history مع سَنَد يتحفظ لمدة 90 يوم (قابل للتخصيص)
   - User يقدر يمسح chat history أي وقت من Settings
   - عند إلغاء الاشتراك، كل البيانات تُحذف نهائياً خلال 30 يوم
   - Audit logs تُحفظ لمدة 1 سنة (compliance)

**Compliance:**
- GDPR compliant (EU users)
- CCPA compliant (California users)
- نوضح في Terms of Service إيه البيانات اللي بتتشارك مع AI provider
- User consent واضح قبل تفعيل سَنَد
- Right to deletion (GDPR Article 17)
- Data portability (GDPR Article 20)

**Transparency:**
- في Settings → AI Permissions يقدر يشوف: "إيه البيانات اللي سَنَد عنده access عليها"
- Audit log لكل actions سَنَد عملها (viewable by Owner/Team Leader)
- Explainability: سَنَد يقول على أساس إيه عمل suggestion معين

#### **سَنَد Personality & System Prompt Guidelines:**

**Personality Traits:**
- **Helpful & Supportive:** دايماً جاهز يساعد
- **Professional but Friendly:** مش جامد أوي، مش casual أوي
- **Motivational:** يشجع ويحفز
- **Cultural Awareness:** يفهم الثقافة العربية (يذكر بالصلاة، يحترم الإجازات، يستخدم مصطلحات محلية)
- **Clear & Concise:** إجابات واضحة ومختصرة
- **Proactive:** يقترح حلول قبل ما User يطلب
- **Patient:** ما يزعلش من الأسئلة المتكررة
- **Context-Aware:** يفهم الهيكل الهرمي ويستخدمه في إجاباته

**Tone Examples:**

✅ **جيد:**
- "تمام! هضيف الـ task دي لأحمد في Project: Ramadan Campaign. هل تحب أذكره بيها؟"
- "لاحظت إن عندك 3 tasks deadline بكرة في Nike Egypt، محتاج مساعدة في الأولويات؟"
- "مبروك! أنجزت كل الـ tasks اليوم لـ Adidas Project 🎉 استحقيت 50 نقطة في الـ Dojo"
- "Client Nike Egypt عنده brand colors: Black #000 و White #FFF، هل تحتاج الـ logo files؟"

❌ **سيئ:**
- "تم تنفيذ الأمر." (جاف أوي)
- "يا أخي انت ليه متأخر؟!" (مش محترم)
- "ما أقدرش أساعدك في دي" بدون بديل (مش helpful)
- "في tasks كتير" بدون تفاصيل (مش clear)

**Language:**
- يدعم العربية (فصحى مبسطة + عامية مصرية خفيفة)
- يدعم الإنجليزية
- يفهم code-switching (مزيج عربي/إنجليزي)
- يستخدم emojis بشكل معتدل ومناسب (🎨 للـ brand kit، 📊 للـ analytics، ⚠️ للتنبيهات)

**Hierarchical Context in Responses:**

سَنَد دايماً يذكر الهيكل في إجاباته علشان الوضوح:

✅ **واضح:**
- "Task: تصميم بوست → Project: Ramadan Campaign → Client: Nike Egypt"
- "Brand Kit → Client: Adidas → Colors: #000, #FFF"

❌ **مش واضح:**
- "Task: تصميم بوست" (مش معروف لمين؟)
- "الألوان: #000, #FFF" (ألوان انهو client؟)

#### **AI Subscription Model:**

**Two Options:**

**Option A: سَنَد Basic (Free)**
- رد على الأسئلة البسيطة (50 سؤال/شهر)
- تذكير بالمواعيد
- جمل تحفيزية بسيطة
- Dojo motivation (basic level)
- Context memory: 7 days
- Access: Current workspace only

**Option B: سَنَد Pro ($15/month per workspace)**
- Unlimited Q&A
- Task creation & management
- Meeting scheduling
- Workflow optimization
- Pattern detection & learning
- Bulk operations
- Advanced Dojo motivation
- Client communication assistance
- Sentiment analysis
- Context memory: 90 days
- Cross-client insights
- Priority AI response times
- Access: Full workspace hierarchy (Client → Projects → Tasks)
- Proactive suggestions

**Enterprise Add-on (+$30/month for agency):**
- Cross-workspace analysis (Owner only)
- Custom AI personality
- Dedicated AI instance (faster responses)
- Advanced analytics and reporting
- API access للـ AI capabilities

**Bundle Offer:**
- إذا Agency اشتركت في Pro Plan + سَنَد Pro → خصم 20%
- Enterprise Plan يشمل سَنَد Pro مجاناً لكل workspaces

#### **Technical Approach:**

- **LLM Backend:** OpenAI GPT-4o (primary) / Anthropic Claude 3.5 Sonnet (backup) / Open-source Llama (cost optimization)
- **Context Awareness:** RAG (Retrieval Augmented Generation) للوصول لبيانات المشروع مع فهم الـ hierarchy
- **Multi-turn Conversations:** Session management للمحادثات الطبيعية مع حفظ السياق
- **Function Calling:** تنفيذ actions في النظام (add task to project, schedule meeting, fetch brand kit, etc.)
- **Memory:** Vector database (Pinecone/Weaviate) للـ long-term memory مع hierarchy indexing
- **Caching:** Redis لتخزين الأسئلة المتكررة وتقليل التكلفة
- **Graph Database (Optional):** Neo4j لتخزين الـ relationships بين (Client → Projects → Tasks) بشكل أسرع

#### **UI/UX:**

- **Chat Interface:** دردشة جانبية زي Slack أو sidebar يفتح/يقفل
- **Avatar & Name:** "سَنَد" مع avatar عربي ودود
- **Quick Actions:** أزرار سريعة للأوامر الشائعة:
  - Add Task
  - Schedule Meeting
  - Show Client Info
  - View Brand Kit
  - Show Stats
- **Breadcrumb Navigation في الـ Chat:**
```

Home > Workspace: E-commerce > Client: Nike > Project: Ramadan Campaign

```
- **Notifications:** إشعارات ذكية غير مزعجة
- **Voice Input (Future Phase):** تفعيل voice commands
- **Mobile Support:** نفس القدرات على الموبايل
- **Context Pills:** عرض السياق الحالي بشكل visual (مثلاً pill يقول "Currently viewing: Nike Egypt")

#### **سَنَد Use Cases (أمثلة واقعية):**

**Scenario 1: Morning Routine**
```

User: "صباح الخير يا سَنَد، إيه المطلوب مني النهاردة؟"

سَنَد: "صباح النور! 🌅

📋 Your Today's Tasks (5 tasks):

📦 Nike Egypt → Ramadan Campaign
⚠️ Task 1: مراجعة تصميم بوست (Priority: High, Deadline: 5 PM)

👟 Adidas Egypt → Product Launch
🔄 Task 2: كتابة ad copy (In Progress, Deadline: Tomorrow)

📦 Nike Egypt → Monthly Social
📝 Task 3: تحضير content calendar (To Do, Deadline: 26 يناير)

🕐 Meetings Today:

- 11:00 AM - Team sync (Nike Ramadan Campaign)

⏰ Prayer Reminder: Dhuhr at 12:15 PM

هل تحب تبدأ بالـ High Priority task؟"

```

**Scenario 2: Client Review Overload**
```

User: "عميل Nike رفض 5 تصاميم في Ramadan Campaign، مش عارف المشكلة فين"

سَنَد: "خليني أشوف... 🔍

📊 Analysis - Nike Egypt → Ramadan Campaign

Rejection Pattern:

- 4 من 5 rejections: 'الألوان مش مناسبة'
- 1 rejection: 'الـ logo size صغير'

🎨 Brand Kit Check:
Nike Brand Colors:

- Primary: \#000000 (Black)
- Secondary: \#FFFFFF (White)
- Accent: \#FF6B35 (Orange)

المصمم استخدم: \#FF0000 (Red) ❌

⚠️ المشكلة: الألوان المستخدمة مش من الـ Brand Kit

💡 Suggestions:

1. هل تحب أذكّر الفريق بمراجعة Brand Kit قبل التصميم؟
2. نعمل checklist للـ brand guidelines في كل task؟
3. نضيف approval step داخلي قبل إرسال للعميل؟

[✓ Apply All]  [✏️ Custom]  [✗ Dismiss]"

```

**Scenario 3: Meeting Scheduling**
```

User: "اعمل meeting مع فريق Nike الأسبوع الجاي"

سَنَد: "تمام! 📅

Workspace: E-commerce
Client: Nike Egypt
Projects:

- Ramadan Campaign
- Monthly Social Media

Team Members assigned to Nike:

- أحمد (Designer)
- سارة (Media Buyer)
- محمد (Content Writer)

🗓️ Team Availability (Next Week):

الاثنين 27 يناير:
✅ 10:00-12:00 AM: الكل متاح
✅ 2:00-4:00 PM: الكل متاح

الثلاثاء 28 يناير:
⚠️ 10:00-12:00 AM: سارة غير متاحة
✅ 2:00-4:00 PM: الكل متاح

الأربعاء 29 يناير:
✅ 11:00-1:00 PM: الكل متاح

💡 أفضل وقت: الاثنين 27 يناير، 10:00 AM

Meeting Details:

- Title: Nike Egypt - Weekly Sync
- Duration: 1 hour
- Agenda: Review Ramadan Campaign progress

هل تحب أضيف الـ meeting؟

[✓ تأكيد]  [✏️ وقت تاني]  [✗ إلغاء]"

```

**Scenario 4: Performance Insight**
```

سَنَد (Proactive): "مرحباً! 👋

📊 Weekly Performance Insight

Client: Adidas Egypt
Project: Product Launch

🏆 أحمد (Designer) كان نجم الأسبوع:

- Completed: 15 tasks
- Avg time: 4.1 hours/task (أسرع من المتوسط بـ 40%)
- Client satisfaction: 95%
- Zero revisions: 80% من التصاميم

مقارنة بالمتوسط:

- Team average: 10 tasks/week
- Avg time: 6.8 hours/task

💡 Suggestions:

1. إرسال تهنئة لأحمد؟
2. إضافة +100 Dojo points (bonus)؟
3. مشاركة إنجازه مع الفريق للتحفيز؟
4. ترقية أحمد لـ Senior Designer في Nike projects؟

[Choose Action]"

```

**Scenario 5: Deadline Crisis**
```

سَنَد (Alert): "⚠️ تنبيه مهم!

Nike Egypt → Ramadan Campaign

عندك 3 tasks deadline بكرة ومتأخرين:

1. ⚠️ Campaign design (Deadline: 24 يناير، 6 PM)
   Assignee: أحمد
   Time remaining: 8 hours
   Status: In Progress (60% done)
2. ⚠️ Ad copy writing (Deadline: 24 يناير، 5 PM)
   Assignee: محمد
   Time remaining: 7 hours
   Status: Not started ❌
3. ⚠️ Monthly report (Deadline: 24 يناير، 11 PM)
   Assignee: سارة
   Time remaining: 13 hours
   Status: Not started ❌

🤖 Smart Suggestions:

Option 1: Re-prioritize

- أحمد يكمل campaign design (على المسار الصحيح)
- أجّل Monthly report لـ 26 يناير (low impact)
- أطلب من ليلى (Content Writer) تساعد محمد في Ad copy

Option 2: Extend Deadlines

- Extend all deadlines بـ 2 أيام
- إبلاغ Client Nike بالتأخير مع اعتذار

Option 3: Emergency Mode

- Request overtime من الفريق
- Priority support من سَنَد Pro
- تذكير كل ساعة

إيه الأفضل؟

[Option 1]  [Option 2]  [Option 3]  [Custom]"

```

### 11.4 Properties & Views (Notion-like Flexibility)

**الوصف:**

نظام مرن لتخصيص طريقة عرض وتنظيم البيانات، يجمع قوة Notion مع بساطة الاستخدام. يعمل على جميع المستويات: Clients, Projects, Tasks.

**Property Types:**

يمكن إضافة properties مختلفة لأي item (client, project, task, meeting, etc.):

- **Text:** نص حر (مثل: Description, Notes)
- **Number:** أرقام (مثل: Budget, Hours, Revisions count)
- **Date:** تواريخ (مثل: Deadline, Start date, End date, Created date)
- **Select:** اختيار واحد من قائمة (مثل: Status: To Do, In Progress, Done)
- **Multi-select:** اختيار متعدد من قائمة (مثل: Tags, Categories, Platforms)
- **People:** تعيين أشخاص من الفريق (مثل: Assignee, Reviewer, Team)
- **Files:** مرفقات (مثل: Designs, Videos, Documents)
- **Relation:** ربط مع items أخرى (مثل: ربط task بـ project, project بـ client)
- **Calculate:** حسابات تلقائية (مثل: Total hours, Progress %, Budget spent)
- **Link:** روابط URLs (مثل: Live campaign link, Google Drive folder)
- **Client Reference:** ربط بـ client (لعرض Brand Kit, Strategy تلقائياً)
- **Project Reference:** ربط بـ project (لعرض Tasks, Timeline)

**كل property:**
- قابل للتسمية والتخصيص بالكامل
- له options مع ألوان مخصصة (للـ select/multi-select)
- قابل للفلترة والترتيب
- يمكن إخفاؤه أو إظهاره حسب الحاجة
- قابل للنسخ من template

**View Types (6 أنواع):**

**1. Table View:**
- صفوف وأعمدة كلاسيكية (زي Excel/Notion)
- مناسب للـ: task lists, client lists, project overview
- Features: 
  - Sort (ascending/descending)
  - Filter (multiple conditions)
  - Group by any property
  - Hide/show columns
  - Column width adjustment
  - Freeze first column
- مثال: جدول بكل الـ tasks مع (Client, Project, Assignee, Deadline, Status)

**2. Kanban Board:**
- بطاقات مرتبة حسب columns
- مناسب للـ: workflow stages (To Do → In Progress → Review → Done)
- Drag & drop لنقل البطاقات
- Group by any property (Status, Assignee, Priority, Client, Project, etc.)
- Swimlanes (تقسيمات أفقية) للتنظيم الأفضل
- Card customization (إيه يظهر على الكارت)
- مثال: Kanban لكل الـ tasks grouped by Status, with swimlanes by Client

**3. Calendar View:**
- جدولة بالتواريخ
- مناسب للـ: content calendar, deadlines, meetings, campaigns
- يوم/أسبوع/شهر views
- Drag to reschedule
- Color-coded by Client/Project/Priority
- Multi-calendar support (عرض عدة calendars في نفس الوقت)
- مثال: Content calendar showing all posts for all clients

**4. Timeline (Gantt Chart):**
- خط زمني للمشاريع
- مناسب للـ: project planning, campaign timelines, dependencies tracking
- يوضح start date و end date
- يظهر overlapping tasks
- Dependencies visualization (Task A يجب ينتهي قبل Task B)
- Milestones markers
- Progress bars على كل task/project
- مثال: Timeline showing Nike Ramadan Campaign from start to finish

**5. Charts View:**
- رسوم بيانية للإحصائيات
- مناسب للـ: performance metrics, progress tracking, analytics
- أنواع: 
  - Bar chart (مقارنة)
  - Line chart (trends)
  - Pie chart (نسب)
  - Donut chart (نسب محسّنة)
  - Stacked bar (مقارنة متعددة)
- Group by أي property وعرض الأرقام
- مثال: Bar chart showing tasks completed per client this month

**6. Gallery View:**
- عرض بصري بالصور (Pinterest-style)
- مناسب للـ: designs, brand assets, mockups, portfolio
- Grid layout مع thumbnails كبيرة
- Hover للتفاصيل السريعة
- Full-screen preview على الضغط
- Filter & sort بنفس طريقة Table view
- مثال: Gallery of all approved designs for Nike Egypt

**Group By Feature:**

يمكن عمل grouping حسب أي property في جميع الـ views:

- **Group by Client:** 
```

📦 Nike Egypt (15 tasks)
├── Task 1
├── Task 2
└── ...

👟 Adidas Egypt (8 tasks)
├── Task 1
└── ...

```

- **Group by Project:**
```

🎯 Ramadan Campaign (12 tasks)
📱 Monthly Social (10 tasks)
🚀 Product Launch (6 tasks)

```

- **Group by Status:**
```

✅ Done (20)
🔄 In Progress (5)
📋 To Do (8)
⚠️ Overdue (2)

```

- **Group by Assignee:**
```

أحمد (Designer) - 12 tasks
سارة (Media Buyer) - 8 tasks
محمد (Writer) - 5 tasks

```

- **Group by Priority:**
```

🔴 High (5)
🟡 Medium (12)
🟢 Low (8)

```

**Multiple Views per Database:**

يمكن إنشاء عدة views لنفس البيانات مع save للفلاتر والإعدادات:

**مثال: Tasks Database**

| View Name | Type | Group By | Filter | Use Case |
|:----------|:-----|:---------|:-------|:---------|
| My Tasks | Kanban | Status | Assignee = Me | الموظف يشوف tasks بتاعته |
| Nike Overview | Table | Project | Client = Nike | Team Leader يشوف كل Nike tasks |
| This Week | Calendar | - | Deadline = This week | Content calendar الأسبوع ده |
| Team Workload | Chart | Assignee | Status != Done | Owner يشوف workload distribution |
| Design Gallery | Gallery | Client | Type = Design | عرض بصري لكل التصاميم |
| Timeline View | Timeline | Client | - | عرض الـ projects timeline |

كل view:
- يُحفظ تلقائياً
- له URL خاص (shareable)
- Permissions منفصلة (من يقدر يشوفه)
- يمكن نسخه وتعديله

**Filters & Sorting:**

**Filters (متقدمة):**
- شروط متعددة (AND/OR logic)
- مثال:
```

Show tasks where:
Client = Nike Egypt
AND Status = In Progress
AND Deadline = This week

```
- Filter groups للتعقيد الأكبر:
```

Show tasks where:
(Client = Nike OR Client = Adidas)
AND (Priority = High OR Status = Overdue)

```
- Saved filters (حفظ الفلتر لاستخدام متكرر)

**Sorting:**
- Primary sort + Secondary sort
- مثال: Sort by Deadline (ascending), then by Priority (High first)
- Save sort preferences لكل view

**القيمة:**
- مرونة كاملة في طريقة العرض
- كل دور يستخدم الـ view المناسب له
- تنظيم أفضل حسب احتياجات كل مستخدم
- لا حاجة لأدوات متعددة
- نفس البيانات، views مختلفة حسب السياق
- Integration مع الهيكل الهرمي (Client → Project → Task) يخلي الفلترة أقوى

### 11.5 Mockup Preview System

**الوصف:**
- معاينة التصاميم بشكل mockup واقعي على المنصات المختلفة
- يساعد العميل يشوف التصميم بشكله النهائي قبل النشر
- يساعد الفريق الداخلي يتأكد من المقاسات والشكل

**المنصات المدعومة:**
- **Facebook:** Post, Story, Cover Photo, Ad
- **Instagram:** Post (Square, Portrait), Story, Reel, IGTV Cover
- **LinkedIn:** Post, Article cover, Company page banner
- **Twitter/X:** Post, Header image
- **TikTok:** Video preview with UI overlay
- **YouTube:** Thumbnail, Channel banner
- **Snapchat:** Ad preview
- **Pinterest:** Pin preview

**كيفية العمل:**

1. **Upload:**
 - المصمم يرفع التصميم في الـ task
 - يحدد نوع التصميم (Post/Story/Ad/etc.)
 - يحدد المنصة (FB/IG/LinkedIn/etc.)

2. **Auto-Detection (Optional):**
 - النظام يحدد نوع التصميم تلقائياً بناءً على الأبعاد:
   - 1080x1080 → Instagram Square Post
   - 1080x1920 → Instagram Story
   - 1200x628 → Facebook Post
   - etc.

3. **Mockup Generation:**
 - النظام يحمل mockup template للمنصة
 - يضع التصميم في المكان الصحيح
 - يضيف UI elements (likes, comments, profile pic - كلها dummy data)

4. **Preview in Client Portal:**
 - عند إرسال للـ Client Portal، يظهر التصميم في mockup واقعي
 - العميل يشوف التصميم كأنه منشور حقيقي على المنصة
 - Client يقدر يبدل بين views (Original design vs Mockup)

5. **Interactive Preview:**
 - Carousel posts: التنقل بين الصور
 - Video mockups: Play/pause
 - Story mockups: Tap to advance (like real Stories)

**Mockup Customization:**
- استخدام Client's brand info:
- Profile name: Nike Egypt
- Profile picture: من الـ Brand Kit
- Verified badge (if applicable)
- Caption preview (if task includes copy)
- Hashtags preview
- Location tag preview

**Technical Implementation:**
- Mockup templates (PNG/SVG) مخزنة في CDN
- Image manipulation على الـ backend (Sharp.js أو ImageMagick)
- Caching للـ generated mockups
- Lazy loading للسرعة

**القيمة:**
- تجربة أفضل للعميل (يشوف الشكل النهائي)
- تقليل سوء الفهم ("كنت فاكره هيبقى أكبر!")
- موافقات أسرع (العميل واثق من الشكل)
- احترافية أعلى
- Quality control للفريق الداخلي

### 11.6 Competitor Monitoring via n8n

**الوصف:**
- نوفر n8n workflows جاهزة للمستخدمين
- الـ workflow يراقب:
- Social media accounts (posts, engagement, followers)
- Websites (changes, new pages, new products)
- Hashtags and trends
- Google rankings (SEO monitoring)
- يضيف الـ webhook URL من Ninja Gen Z
- تظهر التحديثات في dashboard مخصص داخل Ninja Gen Z

**Setup Steps:**

1. **User exports workflow من Ninja Gen Z:**
 - نوفر n8n workflow template (JSON file)
 - User يحمّله في n8n instance بتاعته (self-hosted أو n8n cloud)

2. **Configuration:**
 - User يضيف competitor URLs/accounts
 - يحدد frequency (كل ساعة / كل 6 ساعات / يومي)
 - يضيف الـ webhook URL من Ninja Gen Z

3. **Data Collection:**
 - n8n workflow يجمع البيانات من:
   - Social media APIs (if available)
   - Web scraping (if no API)
   - RSS feeds
   - Google Alerts

4. **Data Sent to Ninja Gen Z:**
 - n8n يرسل البيانات على webhook
 - Ninja Gen Z يستقبل البيانات ويخزنها في DB
 - تظهر في "Competitor Insights" dashboard

**Use Cases:**

**1. Social Media Monitoring:**
```

Competitor: Adidas Egypt
Platform: Instagram
New Post Detected:

- Post URL: [link]
- Caption: "New summer collection..."
- Engagement: 2,453 likes, 187 comments
- Posted: 2 hours ago
- Hashtags: \#AdidasEgypt \#Summer2026

Insights:

- This post performing 40% better than their average
- Using new hashtag strategy
- Posted at 6 PM (peak engagement time)

```

**2. Website Change Detection:**
```

Competitor: Nike Egypt
Website: nike.com.eg
Change Detected:

- New product page: "Air Max 2026"
- Price: 3,999 EGP
- Added: Today at 10 AM

Screenshot: [thumbnail]

```

**3. Hashtag Tracking:**
```

Hashtag: \#RamadanSale
Trend: ↑ 250% increase in usage (last 7 days)
Top Posts:

1. Nike Egypt: 15K likes
2. Adidas Egypt: 12K likes
3. Puma Egypt: 8K likes

Opportunity: Your client should join this trend!

```

**Workflow Templates نوفرها:**

| Template Name | What It Monitors | Frequency |
|:--------------|:-----------------|:----------|
| Instagram Competitor Monitor | New posts, stories, engagement | Every 6 hours |
| Facebook Page Monitor | New posts, videos, events | Every 6 hours |
| Website Change Detector | Homepage, new pages, pricing | Daily |
| Google Ranking Tracker | Keyword positions | Weekly |
| Hashtag Trend Tracker | Hashtag volume, top posts | Daily |
| LinkedIn Company Monitor | New posts, job postings | Daily |

**Documentation & Support:**
- PDF guide: "How to setup n8n workflows for workit"
- Video tutorial (YouTube + in-app)
- Pre-configured workflow JSON files (download ready)
- Support من فريقنا (email/chat)

**Pricing Note:**
- الـ feature مجاني في Pro plan
- User يحتاج n8n instance (self-hosted مجاني / n8n cloud من $20/month)
- Alternative: نوفر managed n8n service كـ add-on (+$15/month)

**القيمة:**
- ميزة فريدة جدًا (لا توجد في المنافسين)
- توفير وقت البحث اليدوي (ساعات كل أسبوع)
- اكتشاف فرص وtrends مبكرًا
- Competitive advantage للعميل
- Data-driven insights

---

## 12. Technical Considerations (High-Level)

*(سيتم التفصيل في Technical Requirements Document)*

**Data Model (Hierarchical):**

```

Tenant (Agency)
│
└── Workspace
│
├── Team Members
│   └── User
│       ├── Role (Owner/Team Leader/Designer/etc.)
│       ├── Permissions
│       ├── Assigned Clients
│       └── Assigned Projects
│
└── Clients
└── Client
│
├── Client Info
├── Brand Kit
├── Strategy
│
└── Projects
└── Project
├── Tasks
├── Meetings
├── Files
└── Timeline

```
insights
**Multi-tenancy:**
- كل agency = tenant منفصل
- عزل كامل للبيانات (data isolation)
- Shared infrastructure مع data isolation
- Schema: `tenant_id` في كل table

**Scalability:**
- بنية مصممة للنمو (10,000+ users, 1,000+ agencies)
- Cloud-native architecture (AWS/GCP/Azure)
- Horizontal scaling (load balancers)
- Database sharding (إذا لزم)
- CDN للـ static assets

**Security:**
- Encryption at rest (database encryption)
- Encryption in transit (TLS 1.3)
- RBAC دقيق (role-based + resource-based permissions)
- GDPR compliant
- Regular security audits
- Two-factor authentication (2FA)
- Session management (JWT tokens)

**Database Design:**
- PostgreSQL (main relational data)
- Redis (caching, sessions, real-time data)
- S3/Cloudinary (file storage)
- Vector DB (Pinecone/Weaviate) for AI memory
- (Optional) Neo4j for relationship graphs

**Key Tables:**
- `tenants` (agencies)
- `workspaces`
- `users` (team members)
- `clients`
- `brand_kits`
- `strategies`
- `projects`
- `tasks`
- `meetings`
- `files`
- `time_logs`
- `comments`
- `notifications`
- `ai_conversations` (سَنَد chat history)

**Integrations:**
- **Meta Ads API** (OAuth 2.0) - ads monitoring
- **Google Ads API** (OAuth 2.0) - ads monitoring
- **Social media platforms APIs:**
  - Facebook Graph API
  - Instagram Graph API
  - LinkedIn API
  - Twitter API
- **Email services:** SendGrid/Mailgun (notifications)
- **Storage services:** AWS S3 / Cloudinary (files)
- **Prayer Times API:** Aladhan API / Islamic Finder API
- **n8n webhooks** (competitor monitoring)
- **Payment:** Stripe/Paddle (subscriptions)

**AI Teammate Infrastructure:**
- **LLM integration:** OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet / Open-source Llama
- **Function calling system:** لتنفيذ actions في النظام
- **Context management:** RAG with hierarchy awareness
- **Rate limiting:** للتحكم في التكلفة
- **Cost optimization:** Caching frequent queries, token usage monitoring
- **Fallback mechanisms:** إذا الـ AI service down → basic functionality still works
- **Vector database:** Pinecone/Weaviate للـ long-term memory

**Tech Stack (Initial Recommendation):**

**Frontend:**
- React/Next.js 14 (App Router)
- TypeScript (type safety)
- TailwindCSS (styling - dark/cyberpunk theme)
- Zustand or React Query (state management)
- React Query (data fetching)
- Framer Motion (animations)
- shadcn/ui (component library)
- dnd-kit (Kanban drag & drop)
- sonner (toasts)
- use-sound & react-confetti (gamification)
- i18next (localization)
- Tiptap (headless rich text editor)
- react-hotkeys-hook (keyboard shortcuts)
- react-dropzone (file uploads)
- react-helmet-async (SEO & dynamic head)
- @react-pdf/renderer (PDF invoices & reports)
- @tanstack/react-table (advanced data tables)
- @tanstack/react-virtual (virtualization for long lists)
- cmdk (fast command palette)
- Magic UI (advanced animations)
- Aceternity UI (cinematic effects)

**Backend:**
- Node.js + NestJS (TypeScript framework) أو Python + FastAPI
- PostgreSQL 15 (main database)
- Prisma ORM (type-safe DB access)
- Redis 7 (caching + pub/sub)
- BullMQ (job queues)

**File Storage:**
- AWS S3 أو Cloudinary
- Image optimization pipeline
- CDN (CloudFront/CloudFlare)

**Real-time:**
- WebSockets (Socket.io) للـ live updates
- Server-Sent Events (alternative)

**DevOps:**
- Docker + Docker Compose (containerization)
- Kubernetes (orchestration - production)
- GitHub Actions (CI/CD)
- Terraform (infrastructure as code)

**Monitoring:**
- Sentry (error tracking)
- DataDog/Grafana (monitoring + logs)
- PostHog/Mixpanel (analytics)

**Testing:**
- Jest (unit tests)
- Playwright (E2E tests)
- Cypress (integration tests)

---

## 13. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|:-----|:----------|:-------|:-------------------|
| **المنافسون يضيفون دعم العربية** | Medium | High | التركيز على features فريدة (سَنَد، Hierarchical structure، time tracking، ads monitoring) + بناء community قوي + التحسين المستمر + first-mover advantage |
| **Adoption بطيئة** | Medium | High | استراتيجية word-of-mouth قوية + incentives للـ early adopters + free tier جذاب + محتوى تعليمي مكثف + case studies |
| **Hierarchical structure معقدة للـ users** | Low | Medium | Onboarding واضح + tooltips + video tutorials + سَنَد يساعد في الـ navigation + default structure suggestions |
| **التكلفة التقنية عالية** | Low | Medium | استخدام cloud services وopen-source tools + تحسين الـ infrastructure بالتدريج + monitoring للتكاليف + efficient caching |
| **API changes من Meta/Google** | Medium | Medium | بناء abstraction layer + monitoring للتغييرات + backup plans + documentation واضح للـ users + quick response team |
| **فريق صغير** | High | Medium | البدء بـ MVP والتوسع بالتدريج + outsourcing لبعض المهام + أتمتة ما أمكن + focus على الأولويات + hire gradually |
| **صعوبة monetization** | Low | High | تسعير تنافسي + قيمة واضحة + success stories مبكرة + multiple revenue streams (subscription + AI add-on + enterprise) |
| **AI costs escalate** | Medium | High | استخدام hybrid approach (basic AI مجاني، advanced مدفوع) + rate limiting + aggressive caching + open-source models عند الإمكان + token usage optimization |
| **AI يعمل أخطاء في الـ hierarchy** | Low | Medium | Confirmation prompts للـ critical actions + clear breadcrumb navigation + easy undo + extensive testing + human-in-the-loop |
| **Users لا يثقون في AI** | Low | Medium | Transparency في كيفية عمل الـ AI + إمكانية التعطيل + success stories + بدء بـ features بسيطة وزيادتها تدريجيًا + audit logs |
| **Data privacy concerns** | Medium | High | GDPR compliance + واضح privacy policy + user control على البيانات + encryption شامل + regular audits + transparency about AI data access |
| **Database performance مع الـ hierarchy** | Low | Medium | Proper indexing + query optimization + caching layers + database sharding if needed + monitor slow queries |

---

## 14. Next Steps

**Immediate Actions:**
1. ✅ Product Vision Document (مكتمل)
2. ⏳ Product Requirements Document (PRD) - with updated hierarchy
3. ⏳ Database Schema Design (ERD) - reflecting Client → Project → Task hierarchy
4. ⏳ C4 Architecture Diagrams
5. ⏳ UI/UX Wireframes & Mockups - showing hierarchical navigation
6. ⏳ Technical Requirements Specification
7. ⏳ API Specification Document
8. ⏳ Development Roadmap & Sprint Planning

**Timeline:**
- **Documentation Phase:** 2-3 weeks
- **Design Phase:** 2 weeks (with hierarchy UX focus)
- **Development Phase (MVP):** 3-4 months
- **Beta Testing:** 1-2 months
- **Launch:** Month 6-7

**MVP Priority Features:**
1. User authentication & RBAC
2. Hierarchical structure (Workspace → Client → Project → Task)
3. Brand Kit management (per client)
4. Task management (create, assign, track, multiple views)
5. Time tracking أساسي
6. Client portal للمراجعة والموافقة (client-scoped)
7. Basic analytics dashboard (hierarchy-aware)
8. سَنَد Basic (Q&A only، hierarchy-aware context)
9. Prayer reminders
10. Smart work system

**Post-MVP Features:**
- Strategy management (per client)
- Ads monitoring integration
- سَنَد Pro (full capabilities with proactive suggestions)
- Competitor monitoring (n8n integration)
- Mockup preview system
- Advanced analytics (cross-client insights)
- Mobile apps
- Third-party integrations (Slack, Google Drive, etc.)
- Custom fields
<span style="display:none">[^1]</span>

<div align="center">⁂</div>
insights
[^1]: 1.-ld-lkthr-stkhdman-flwTn-l-rby-ldr-l.md```

```
