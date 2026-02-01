<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PHASE 4 — ADVANCED \& INTEGRATIONS

## Phase 4 Overview

**Timeline:** Month 8-10 (12 weeks / 6 sprints)
**Goal:** تحويل workit لـ "All-in-One Platform" — AI متقدم + ربط Ads + Competitor Monitoring + Mockup Previews + Custom Properties
**Team:** 3 Frontend Devs, 1 Backend Dev, 1 Integration Specialist, 1 Designer, 1 QA Engineer

---

## Phase 4: Feature List (7 Features)

1. **سَنَد AI Pro** (Task creation، workflow automation، meeting summaries)
2. **Meta Ads Monitoring** (Read-only dashboard لـ Facebook/Instagram Ads)
3. **Google Ads Monitoring** (Read-only dashboard)
4. **Competitor Monitoring** (n8n automation لمتابعة منافسين)
5. **Mockup Preview System** (Preview تصاميم على FB/IG/LinkedIn/Twitter)
6. **Advanced Analytics** (Cross-workspace، forecasting، anomaly detection)
7. **Custom Properties \& Formulas** (Fields مخصصة + حسابات تلقائية)

---

## 1. سَنَد AI Pro (Unlimited + Advanced Features)

### 1.1 Overview

**Upgrade from Basic (Phase 3):** من Q\&A فقط → AI يكتب، يخطط، ويحلل

**New Capabilities:**

- ✅ **Task Creation from Chat:** "Create 5 tasks for Instagram content calendar next week"
- ✅ **Meeting Summaries:** رفع meeting recording/transcript → سَنَد يلخص + يستخرج action items
- ✅ **Workflow Automation Suggestions:** "Based on your workflow, I suggest automating status change when client approves"
- ✅ **Proactive Insights:** سَنَد يشوف patterns ويرسل suggestions بدون سؤال
- ✅ **Unlimited Questions** (vs 50/month في Basic)

---

### 1.2 Data Requirements

**New Tables:**

**ai_generated_tasks:**

- Links AI conversation → Tasks created
- Tracks accuracy: User accepted/modified/rejected

**meeting_transcripts:**

- Stores meeting audio/text + summary + action items
- Links to projects/clients

**ai_automation_rules:**

- User-created rules: "If client approves → change status to done"
- AI suggests rules based on repetitive patterns

**ai_proactive_insights:**

- Stores insights sent proactively (not in response to questions)
- User feedback: helpful/not helpful (للتحسين)

---

### 1.3 Feature A: Task Creation from Chat

**User Story:** كـ Team Leader، أقول لـ سَنَد "Create 5 Instagram posts for Nike Ramadan campaign next week" فيولد 5 tasks مع titles + deadlines + assignments (based on team availability)

**UI Flow:**

```
سَنَد Chat:
┌──────────────────────────────────────────────────────────┐
│ 👤 You:                                                  │
│ Create 5 Instagram carousel posts for Nike Ramadan      │
│ campaign. Deadlines between Jan 28 - Feb 3. Assign to   │
│ Ahmed (designer).                                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 🤖 سَنَد:                                                │
│ تمام! سأنشئ 5 مهام. دعني أراجع معك:                    │
│                                                          │
│ 📋 Proposed Tasks:                                       │
│                                                          │
│ 1. ✏️ Design Carousel Post #1 - Product Highlight       │
│    Assigned: Ahmed (Designer)                            │
│    Deadline: Jan 28, 2026                                │
│    Project: Nike - Ramadan Campaign 2026                 │
│                                                          │
│ 2. ✏️ Design Carousel Post #2 - Lifestyle               │
│    Assigned: Ahmed                                       │
│    Deadline: Jan 29, 2026                                │
│                                                          │
│ 3. ✏️ Design Carousel Post #3 - Behind-the-Scenes       │
│    Assigned: Ahmed                                       │
│    Deadline: Jan 30, 2026                                │
│                                                          │
│ 4. ✏️ Design Carousel Post #4 - Customer Testimonial    │
│    Assigned: Ahmed                                       │
│    Deadline: Feb 1, 2026                                 │
│                                                          │
│ 5. ✏️ Design Carousel Post #5 - Call-to-Action          │
│    Assigned: Ahmed                                       │
│    Deadline: Feb 3, 2026                                 │
│                                                          │
│ [✅ Create All Tasks] [✏️ Edit Details] [❌ Cancel]     │
└──────────────────────────────────────────────────────────┘
```

**If user clicks "Create All Tasks":**

- سَنَد calls API: `POST /tasks/bulk-create`
- Database: inserts 5 tasks
- Notifications: Ahmed receives "5 new tasks assigned by سَنَد AI"
- Activity Log: "Tasks created by AI assistant (via Team Leader request)"

**Acceptance Criteria:**

- ✅ سَنَد parses natural language request (quantity, type, assignee, date range)
- ✅ Generates realistic task titles based on project context
- ✅ Assigns to available team members (checks workload)
- ✅ User can edit before creating
- ✅ Bulk creation < 3 seconds for 10 tasks
- ✅ All tasks logged in activity_logs with "created_by: AI"

---

### 1.4 Feature B: Meeting Summaries

**User Story:** كـ Team Leader، أرفع meeting recording (or paste transcript)، سَنَد يلخص + يستخرج action items + يربطها بـ tasks/projects

**UI Flow:**

```
سَنَد → New Feature: [📹 Summarize Meeting]

Upload Meeting:
┌──────────────────────────────────────────────────────────┐
│ 📹 Upload Meeting Recording or Transcript                │
│                                                          │
│ [Drag & drop audio/video file or paste text transcript] │
│                                                          │
│ Supported formats: MP3, MP4, WAV, TXT                    │
│ Max size: 100MB                                          │
│                                                          │
│ Meeting Details (optional):                              │
│ Meeting Title: [Weekly Review - Nike Campaign____]      │
│ Project: [Nike - Ramadan Campaign 2026 ▼]               │
│ Attendees: [Select team members...]                     │
│                                                          │
│          [Upload & Summarize]                            │
└──────────────────────────────────────────────────────────┘
```

**After Processing (2-5 minutes for 1-hour meeting):**

```
┌──────────────────────────────────────────────────────────┐
│ 📋 Meeting Summary                                       │
│ Weekly Review - Nike Campaign                            │
│ Date: January 24, 2026 | Duration: 45 minutes            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📝 Summary                                               │
│                                                          │
│ The team reviewed progress on the Ramadan campaign.      │
│ Main discussion points:                                  │
│ • Instagram content calendar on track                    │
│ • Client requested logo size increase on carousel #1     │
│ • Need to finalize video edits by Jan 28                 │
│ • Budget allocation approved for paid ads                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ✅ Action Items (5)                                      │
│                                                          │
│ 1. [ ] Ahmed: Increase logo size on carousel #1         │
│    Deadline: Jan 25 | Priority: High                     │
│    [Create Task]                                         │
│                                                          │
│ 2. [ ] Khaled: Finalize video edits                     │
│    Deadline: Jan 28 | Priority: High                     │
│    [Create Task]                                         │
│                                                          │
│ 3. [ ] Sara: Prepare ad copy for Facebook campaign      │
│    Deadline: Jan 30 | Priority: Medium                   │
│    [Create Task]                                         │
│                                                          │
│ 4. [ ] Layla: Submit budget report to client            │
│    Deadline: Feb 1 | Priority: Medium                    │
│    [Create Task]                                         │
│                                                          │
│ 5. [ ] Team: Schedule follow-up meeting                 │
│    Deadline: Jan 31 | Priority: Low                      │
│    [Create Task]                                         │
│                                                          │
│ [Create All Action Items as Tasks]                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🔗 Related Tasks/Projects                                │
│ • Task: Design Carousel Post #1 (linked to action #1)   │
│ • Project: Nike - Ramadan Campaign 2026                  │
│                                                          │
│ [Download Full Transcript] [Share Summary]              │
└──────────────────────────────────────────────────────────┘
```

**Technical Implementation:**

**Audio Transcription:**

- Service: OpenAI Whisper API (or AssemblyAI for Arabic support)
- Process: Upload → Transcribe → Store transcript

**Summarization:**

- Model: GPT-4o (better context understanding)
- Prompt: "Summarize this meeting transcript. Extract action items with assignee, deadline, priority. Format as JSON."

**Action Item Extraction:**

- Regex + NLP لاستخراج: Who، What، When
- Matching assignee names to users في database

**Acceptance Criteria:**

- ✅ Supports audio (MP3/MP4/WAV) and text transcripts
- ✅ Transcription accuracy >90% (English/Arabic)
- ✅ Summary generated within 5 minutes for 1-hour meeting
- ✅ Action items extracted with assignees correctly matched
- ✅ User can edit action items before creating tasks
- ✅ Meeting summary stored and linked to project

---

### 1.5 Feature C: Workflow Automation Suggestions

**User Story:** سَنَد يشوف repetitive actions ويقترح automation rules

**Example Patterns Detected:**

1. **Pattern:** Team Leader manually changes status من "Review" لـ "Done" كل ما client يعمل approve
   **Suggestion:** "Automate: When client approves → change status to Done"
2. **Pattern:** Tasks assigned to Ahmed always take 3-5 hours، Designer Sara takes 2-3 hours
   **Suggestion:** "Route simple design tasks to Sara, complex to Ahmed"
3. **Pattern:** Every Friday، Team Leader creates 5 tasks for next week
   **Suggestion:** "Create weekly task template for recurring workflows"

**UI for Suggestions:**

```
🤖 سَنَد Insights (Proactive):

┌──────────────────────────────────────────────────────────┐
│ 💡 New Automation Suggestion                             │
│                                                          │
│ I noticed you manually change task status to "Done"     │
│ every time a client approves. Would you like to         │
│ automate this?                                           │
│                                                          │
│ Proposed Rule:                                           │
│ WHEN: Client approves task in portal                    │
│ THEN: Change task status to "Done"                      │
│       AND notify assignee                                │
│                                                          │
│ This will save you ~15 actions per week.                │
│                                                          │
│ [✅ Enable Automation] [❌ Dismiss] [⚙️ Customize]      │
└──────────────────────────────────────────────────────────┘
```

**If user clicks "Enable Automation":**

- Rule saved في `ai_automation_rules` table
- Webhook/trigger setup لمراقبة client approvals
- Next approval → rule executes automatically

**Acceptance Criteria:**

- ✅ سَنَد detects at least 3 common patterns per agency
- ✅ Suggestions appear in notifications (not intrusive)
- ✅ User can enable/disable/customize rules
- ✅ Automation logs في activity_logs: "Status changed by automation rule"
- ✅ User can pause/delete automation rules anytime

---

### 1.6 Feature D: Proactive Insights

**User Story:** سَنَد يرسل insights بدون سؤال (مرة/أسبوع) بناءً على patterns

**Examples:**

- "⚠️ Ahmed has 8 overdue tasks. Consider redistributing workload."
- "🎉 Your team completed 20% more tasks this week compared to last week!"
- "📊 Client 'Adidas Egypt' requires 2.5x more revisions than average. Review brief clarity?"
- "💡 Tasks assigned on Monday have 15% higher completion rate than Friday. Consider batching important work early in week."

**UI:**

```
Notification Center:

┌──────────────────────────────────────────────────────────┐
│ 🤖 سَنَد Weekly Insights (Jan 24, 2026)                 │
│                                                          │
│ 📊 Your Team This Week:                                 │
│ • 18 tasks completed (+3 vs last week) 📈               │
│ • 87% on-time delivery rate (↑5%)                       │
│ • 3 tasks overdue (Ahmed: 2, Sara: 1)                   │
│                                                          │
│ ⚠️ Attention Needed:                                     │
│ • Ahmed is overloaded (8 active tasks). Consider        │
│   reassigning 2-3 tasks to Khaled (4 active tasks).     │
│                                                          │
│ 💡 Opportunity:                                          │
│ • Your team works best Monday-Wednesday (92% on-time).  │
│   Schedule critical tasks early in the week.            │
│                                                          │
│ 🏆 Top Performer:                                        │
│ • Khaled: 7 tasks done, 0 overdue, 3.2h avg per task    │
│                                                          │
│ [View Detailed Report] [Dismiss] [⚙️ Adjust Frequency]  │
└──────────────────────────────────────────────────────────┘
```

**Frequency Settings:**

- Daily digest (too noisy - optional)
- Weekly insights (default)
- Monthly summary
- Real-time alerts for critical issues only

**Acceptance Criteria:**

- ✅ Insights sent weekly to Owner/Team Leader
- ✅ At least 3 insight types per report (performance, attention needed, opportunity)
- ✅ Insights actionable (with links to tasks/users)
- ✅ User can adjust frequency or disable
- ✅ سَنَد learns from user feedback (helpful/not helpful)

---

### 1.7 Pricing \& Quota

**Basic (Phase 3):** 50 questions/month per agency — \$0 (included)
**Pro (Phase 4):** Unlimited questions + all advanced features — **\$50/month per agency** (add-on)

---

## 2. Meta Ads Monitoring (Facebook/Instagram)

### 2.1 Overview

**Description:** Dashboard read-only لمراقبة أداء الإعلانات على Facebook/Instagram بدون الحاجة للذهاب لـ Ads Manager

**Use Case:** Media Buyer يشوف performance metrics (impressions, clicks, conversions, spend) جنباً إلى جنب مع tasks

**Integration:** Meta Marketing API (Graph API) [OAuth 2.0]

---

### 2.2 Required Setup

**Prerequisites:**

1. Agency creates Facebook Business Account
2. Agency creates Meta App في developers.facebook.com
3. Agency grants workit permissions:
   - `ads_read` (read ads data)
   - `ads_management` (read campaigns/ad sets/ads)
   - `read_insights` (performance metrics)
4. User connects Meta account via OAuth في workit settings

---

### 2.3 Data Model

**New Tables:**

**meta_ad_accounts:**

- `agency_id`: ربط بالوكالة
- `account_id`: Meta Ad Account ID
- `account_name`: اسم الحساب
- `access_token`: encrypted OAuth token
- `is_active`: تفعيل/تعطيل المزامنة

**meta_campaigns:**

- `ad_account_id`: FK
- `campaign_id`: Meta campaign ID
- `campaign_name`: اسم الحملة
- `objective`: REACH، CONVERSIONS، etc.
- `status`: ACTIVE، PAUSED، DELETED
- `daily_budget`: الميزانية اليومية
- `project_id`: ربط اختياري بمشروع في workit

**meta_campaign_insights:**

- `campaign_id`: FK
- `date`: تاريخ البيانات
- `impressions`: عدد الظهور
- `clicks`: عدد النقرات
- `spend`: المبلغ المصروف
- `conversions`: التحويلات
- `ctr`: نسبة النقر (click-through rate)
- `cpc`: تكلفة النقرة
- `cpm`: تكلفة الألف ظهور

**Sync Frequency:** كل 6 ساعات (or on-demand refresh)

---

### 2.4 Ads Dashboard UI

**Route:** `/ads/meta` (Owner/Team Leader only، أو Media Buyer role)

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Meta Ads Dashboard                                    │
│                                                          │
│ Ad Account: [Nike Egypt - Meta ▼]                       │
│ Date Range: [Last 30 Days ▼]                            │
│                                                          │
│ [Refresh Data] Last synced: 2 hours ago                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 💰 Overview (Last 30 Days)                              │
│                                                          │
│ ┌──────────┬──────────┬──────────┬──────────┬─────────┐ │
│ │ Spend    │ Impress. │ Clicks   │ Conv.    │ ROAS    │ │
│ ├──────────┼──────────┼──────────┼──────────┼─────────┤ │
│ │ $4,250   │ 1.2M     │ 15,400   │ 320      │ 3.2x    │ │
│ │ +12%     │ +8%      │ +15%     │ +22%     │ +18%    │ │
│ └──────────┴──────────┴──────────┴──────────┴─────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📈 Campaigns Performance                                 │
│                                                          │
│ [Sort by: Spend ▼] [Filter: Active ▼]                  │
│                                                          │
│ ┌────────────────┬────────┬────────┬────────┬────────┐  │
│ │ Campaign       │ Status │ Spend  │ Clicks │ Conv.  │  │
│ ├────────────────┼────────┼────────┼────────┼────────┤  │
│ │ 🟢 Ramadan Sale│ Active │ $1,850 │ 6,200  │ 140    │  │
│ │   (Conversion) │        │        │ CTR: 2.8%│ROAS:3.5│  │
│ │   [View Details] [Link to Project]                │  │
│ ├────────────────┼────────┼────────┼────────┼────────┤  │
│ │ 🟢 Brand Aware │ Active │ $1,200 │ 4,800  │ 90     │  │
│ │   (Reach)      │        │        │ CTR: 2.1%│       │  │
│ │   [View Details] [Link to Project]                │  │
│ ├────────────────┼────────┼────────┼────────┼────────┤  │
│ │ 🟡 Product Lau │ Paused │ $1,200 │ 4,400  │ 90     │  │
│ │   (Traffic)    │        │        │ CTR: 1.9%│       │  │
│ │   [View Details] [Link to Project]                │  │
│ └────────────────┴────────┴────────┴────────┴────────┘  │
│                                                          │
│ [Export to CSV]                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Spend Over Time (Line Chart)                         │
│ [Chart showing daily spend for last 30 days]            │
│                                                          │
│ 📊 CTR by Campaign (Bar Chart)                          │
│ [Comparison of click-through rates]                     │
└──────────────────────────────────────────────────────────┘
```

---

### 2.5 Campaign Detail View

**Click "View Details" on campaign:**

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Ads Dashboard                                  │
│                                                          │
│ Campaign: Ramadan Sale                                   │
│ Objective: Conversions | Status: Active 🟢               │
│ Date Range: [Last 30 Days ▼]                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 💰 Campaign Summary                                      │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Total Spend: $1,850                                │  │
│ │ Daily Budget: $60                                  │  │
│ │ Impressions: 450,000                               │  │
│ │ Clicks: 6,200 (CTR: 2.8%)                         │  │
│ │ Conversions: 140 (CVR: 2.3%)                      │  │
│ │ CPC: $0.30 | CPM: $4.11 | CPA: $13.21            │  │
│ │ ROAS: 3.5x ($6,475 revenue / $1,850 spend)       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Performance Breakdown                                 │
│                                                          │
│ [Chart: Impressions, Clicks, Conversions over time]     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🎯 Ad Sets (3)                                           │
│                                                          │
│ ┌────────────────┬────────┬────────┬────────┬────────┐  │
│ │ Ad Set         │ Status │ Spend  │ Clicks │ Conv.  │  │
│ ├────────────────┼────────┼────────┼────────┼────────┤  │
│ │ Cairo 25-34    │ Active │ $850   │ 2,800  │ 65     │  │
│ │ Alexandria 25-3│ Active │ $600   │ 2,100  │ 45     │  │
│ │ Giza 35-44     │ Active │ $400   │ 1,300  │ 30     │  │
│ └────────────────┴────────┴────────┴────────┴────────┘  │
│                                                          │
│ 💡 Insights:                                             │
│ • Best performing ad set: Cairo 25-34 (2.3% CVR)        │
│ • Consider increasing budget for top performer           │
│ • CPC trending down (-5% vs last week) 📉               │
│                                                          │
│ 🔗 Linked Project: Nike - Ramadan Campaign 2026         │
│ [View Project Tasks]                                     │
│                                                          │
│ [Export Campaign Data]                                   │
└──────────────────────────────────────────────────────────┘
```

---

### 2.6 Integration with workit Workflow

**Link Campaign to Project:**

- User clicks "Link to Project" في campaign row
- Modal: Select project من dropdown
- Database: `meta_campaigns.project_id = project_id`

**Benefits:**

- Task detail page يعرض linked campaign metrics في sidebar
- Team sees ad performance while working on designs/copy
- Reports combine task completion + ad performance

**Example (Task Sidebar):**

```
Task: Design Carousel Post #1

📊 Linked Ad Performance:
Campaign: Ramadan Sale
Impressions: 45,000 (last 7 days)
Clicks: 620 (CTR: 2.8%)
Conversions: 14
Spend: $185

[View Full Campaign →]
```

---

### 2.7 API Endpoints

**POST /integrations/meta/connect**

- Initiates OAuth flow
- Redirects to Meta login
- Saves access token (encrypted)

**GET /integrations/meta/accounts**

- Returns list of ad accounts user has access to

**POST /integrations/meta/sync**

- Triggers manual sync (fetches latest data from Meta API)

**GET /ads/meta/campaigns**

- Query params: `account_id`, `date_range`, `status`
- Returns campaigns with insights

**GET /ads/meta/campaigns/:id**

- Returns detailed campaign data + ad sets

---

### 2.8 Acceptance Criteria

**Phase 4:**

- ✅ User can connect Meta account via OAuth
- ✅ System syncs campaigns every 6 hours automatically
- ✅ Dashboard displays key metrics (spend, impressions, clicks, conversions)
- ✅ User can link campaigns to workit projects
- ✅ Campaign details show breakdown by ad sets
- ✅ Charts visualize performance trends
- ✅ Export to CSV works
- ✅ Data encrypted at rest (access tokens)
- ✅ Error handling: Expired tokens, API limits

**Phase 5 (Future):**

- ⏳ Write access: Create campaigns from workit
- ⏳ Budget alerts: Notify when campaign reaches 80% budget
- ⏳ A/B test tracking

---

## 3. Google Ads Monitoring

### 3.1 Overview

**Description:** نفس فكرة Meta Ads، لكن لـ Google Ads (Search، Display، Video، Shopping)

**Integration:** Google Ads API (OAuth 2.0)

**Permissions Required:**

- Read campaigns
- Read ad groups
- Read ads
- Read performance reports

---

### 3.2 Data Model

**Similar to Meta:**

**google_ad_accounts:**

- `customer_id`: Google Ads customer ID
- `account_name`: اسم الحساب
- `access_token`: encrypted
- `refresh_token`: for token renewal

**google_campaigns:**

- Campaign details
- `project_id`: link to workit project

**google_campaign_insights:**

- Daily metrics (impressions, clicks, conversions, cost)

---

### 3.3 Ads Dashboard UI

**Route:** `/ads/google`

**Similar layout to Meta dashboard، مع metrics خاصة بـ Google:**

- Search campaigns: Keywords، Quality Score، Avg. Position
- Display campaigns: Placements، CTR
- Video (YouTube): Views، View Rate، Watch Time

---

### 3.4 Acceptance Criteria

**Phase 4:**

- ✅ OAuth integration with Google Ads
- ✅ Sync campaigns every 6 hours
- ✅ Dashboard shows key Google metrics
- ✅ Link campaigns to projects
- ✅ Export to CSV

---

## 4. Competitor Monitoring (n8n Automation)

### 4.1 Overview

**Description:** مراقبة تلقائية لنشاط المنافسين على Social Media + تخزين insights

**How it Works:**

1. User يضيف competitors (brand names + social handles)
2. n8n workflows تجمع بيانات يومياً:
   - Instagram: New posts، engagement (likes/comments)
   - Facebook: Page posts، reactions
   - Twitter/X: Tweets، retweets
   - LinkedIn: Company updates
3. Data يتخزن في workit
4. Dashboard يعرض competitor activity + trends

---

### 4.2 Data Model

**competitor_profiles:**

- `client_id`: التابع لأي عميل
- `name`: اسم المنافس
- `instagram_handle`: @competitor
- `facebook_page_id`: Page ID
- `twitter_handle`: @competitor
- `linkedin_company_id`: Company ID

**competitor_posts:**

- `competitor_id`: FK
- `platform`: instagram، facebook، twitter، linkedin
- `post_url`: رابط المنشور
- `content`: نص المنشور
- `media_urls`: صور/فيديوهات
- `engagement_score`: مجموع likes + comments + shares
- `posted_at`: تاريخ النشر

**competitor_insights:**

- `competitor_id`: FK
- `metric`: post_frequency، avg_engagement، top_hashtags
- `value`: قيمة المؤشر
- `date`: تاريخ الحساب

---

### 4.3 n8n Workflow Setup

**Workflow 1: Instagram Competitor Monitoring**

```
Trigger: Schedule (Daily at 9:00 AM)
  ↓
HTTP Request: Fetch Instagram posts (via RapidAPI or Apify)
  Input: @competitor_handle
  Output: Array of posts (last 24 hours)
  ↓
Loop through posts
  ↓
Supabase Insert: Save to competitor_posts
  ↓
Calculate engagement score: likes + comments
  ↓
Supabase Update: competitor_insights (avg_engagement)
  ↓
IF: engagement_score > threshold (e.g., 1000)
  ↓
Create Notification: "Competitor X had viral post: [link]"
```

**Workflow 2: Facebook Page Monitoring**

- Similar structure، using Facebook Graph API

**Workflow 3: Twitter/X Monitoring**

- Twitter API v2 (requires API access)

---

### 4.4 Competitor Dashboard UI

**Route:** `/clients/:id/competitors`

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ Competitor Analysis - Nike Egypt                         │
│                                                          │
│ [+ Add Competitor]                                       │
│                                                          │
│ Competitors (3):                                         │
│ • Adidas Egypt                                           │
│ • Puma Egypt                                             │
│ • Reebok Egypt                                           │
│                                                          │
│ Date Range: [Last 30 Days ▼]                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Overview                                              │
│                                                          │
│ ┌────────────┬────────────┬────────────┬────────────┐   │
│ │ Total Posts│ Avg Engage │ Top Topic  │ Sentiment  │   │
│ ├────────────┼────────────┼────────────┼────────────┤   │
│ │    95      │   1,250    │ Ramadan    │ Positive   │   │
│ └────────────┴────────────┴────────────┴────────────┘   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📈 Competitor Activity (Last 30 Days)                    │
│                                                          │
│ [Chart: Posts per day for each competitor]              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🏆 Top Performing Posts                                  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔥 Adidas Egypt - Instagram                        │  │
│ │ "Check out our new Ramadan collection 🌙"        │  │
│ │ 📷 [Image preview]                                 │  │
│ │ 👍 2,400 likes | 💬 180 comments | 🔄 45 shares  │  │
│ │ Posted: Jan 20, 2026                               │  │
│ │ [View Full Post] [Save to Strategy]               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Puma Egypt - Facebook                              │  │
│ │ "Win a free pair of shoes! 🎁"                    │  │
│ │ 👍 1,850 reactions | 💬 320 comments              │  │
│ │ Posted: Jan 22, 2026                               │  │
│ │ [View Full Post] [Save to Strategy]               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 💡 Insights                                              │
│ • Adidas posted 15% more than last month                 │
│ • "Ramadan" is the most used keyword (32 mentions)      │
│ • Giveaway posts get 3x higher engagement                │
│                                                          │
│ [Export Report] [Schedule Weekly Summary]               │
└──────────────────────────────────────────────────────────┘
```

---

### 4.5 Acceptance Criteria

**Phase 4:**

- ✅ User can add competitors (name + social handles)
- ✅ n8n workflows scrape data daily
- ✅ Dashboard displays competitor posts + engagement
- ✅ Charts show activity trends
- ✅ Top posts highlighted
- ✅ "Save to Strategy" adds post to client_strategies

**Limitations:**

- Instagram: Public profiles only (no private accounts)
- Rate limits: Respect platform APIs
- Data retention: 90 days (older data archived)
