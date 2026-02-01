<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PHASE 4 (تكملة)

## 5. Mockup Preview System

### 5.1 Overview

**Description:** معاينة التصاميم كأنها منشورة على المنصات الفعلية (Facebook، Instagram، LinkedIn، Twitter/X) قبل التسليم للعميل

**Why Critical:**

- Designer يشوف كيف التصميم هيظهر في السياق الحقيقي
- Client يتخيل المنشور النهائي بدون الحاجة للنشر الفعلي
- يكشف مشاكل: text مقطوع، logo صغير، aspect ratio خاطئ

---

### 5.2 Supported Platforms \& Formats

**Instagram:**

- Feed Post (1:1 square, 4:5 portrait)
- Stories (9:16 vertical)
- Reels (9:16 vertical)
- Carousel (1:1 per slide)

**Facebook:**

- Feed Post (any aspect ratio, recommended 1.91:1)
- Stories (9:16)
- Cover Photo (820x312)

**LinkedIn:**

- Feed Post (1.91:1 recommended)
- Article Header (1200x627)

**Twitter/X:**

- Tweet (16:9 recommended)
- Header (1500x500)

---

### 5.3 Data Model

**mockup_previews:**

- `task_id`: FK
- `file_id`: FK (الملف المراد معاينته)
- `platform`: instagram_feed، facebook_post، linkedin_post، twitter_tweet
- `format`: feed، story، reel، carousel
- `preview_config`: JSON (caption، username، profile pic، etc.)
- `preview_url`: رابط الـ preview المولّد (screenshot)
- `created_at`: تاريخ التوليد

---

### 5.4 Mockup Generator UI

**Location:** Task Detail → Files tab → Click file → "Generate Mockup Preview"

**Step 1: Select Platform \& Format**

```
┌──────────────────────────────────────────────────────────┐
│ 📱 Generate Mockup Preview                               │
│ File: nike_ramadan_post.png                              │
│                                                          │
│ Select Platform:                                         │
│ [Instagram] [Facebook] [LinkedIn] [Twitter/X]           │
│                                                          │
│ Select Format:                                           │
│ • Feed Post (1:1) ✓                                     │
│ • Stories (9:16)                                         │
│ • Reels (9:16)                                           │
│ • Carousel (multiple slides)                             │
│                                                          │
│              [Next: Customize →]                         │
└──────────────────────────────────────────────────────────┘
```

**Step 2: Customize Details**

```
┌──────────────────────────────────────────────────────────┐
│ 📱 Instagram Feed Post Preview                           │
│                                                          │
│ Profile Details:                                         │
│ Username: [@nikeegypt_______]                           │
│ Profile Picture: [Upload or use default]                │
│ Verified Badge: [✓]                                     │
│                                                          │
│ Post Caption:                                            │
│ ┌────────────────────────────────────────────────────┐  │
│ │ استعد لرمضان مع تشكيلتنا الجديدة 🌙              │  │
│ │ #Nike #Ramadan2026 #Egypt                          │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Engagement (Optional):                                   │
│ Likes: [2,400]  Comments: [^180]                         │
│                                                          │
│              [Generate Preview]                          │
└──────────────────────────────────────────────────────────┘
```

**Step 3: Preview Generated**

```
┌──────────────────────────────────────────────────────────┐
│ ✅ Mockup Preview Generated                              │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │                                                    │  │
│ │  ┌──────────────────────────────────────┐         │  │
│ │  │ [Profile pic] nikeegypt ✓   •••     │         │  │
│ │  ├──────────────────────────────────────┤         │  │
│ │  │                                      │         │  │
│ │  │         [Uploaded Image]             │         │  │
│ │  │      nike_ramadan_post.png           │         │  │
│ │  │                                      │         │  │
│ │  ├──────────────────────────────────────┤         │  │
│ │  │ ❤️ 💬 📤                             │         │  │
│ │  ├──────────────────────────────────────┤         │  │
│ │  │ 2,400 likes                          │         │  │
│ │  │ nikeegypt استعد لرمضان مع...       │         │  │
│ │  │ #Nike #Ramadan2026 #Egypt            │         │  │
│ │  │ View all 180 comments                │         │  │
│ │  │ 2 HOURS AGO                          │         │  │
│ │  └──────────────────────────────────────┘         │  │
│ │                                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [💾 Save Mockup] [📤 Share with Client] [🔄 Regenerate] │
│ [⬇️ Download as Image]                                   │
└──────────────────────────────────────────────────────────┘
```

---

### 5.5 Technical Implementation

**Approach 1: HTML + CSS Mockup → Screenshot (Recommended)**

1. **Frontend:** React component يعرض mockup بالـ HTML/CSS (يحاكي UI الحقيقي للمنصة)
2. **Screenshot:** استخدام `html-to-image` library أو Puppeteer لتحويل HTML → PNG
3. **Storage:** حفظ الـ PNG في Supabase Storage
4. **Preview URL:** رابط للـ image المحفوظ

**Example Code (Simplified):**

```typescript
// MockupGenerator.tsx
import { toBlob } from 'html-to-image';

const InstagramFeedMockup = ({ imageUrl, username, caption, likes }) => {
  return (
    <div className="instagram-mockup" style={{ width: '375px', background: '#fff' }}>
      {/* Instagram UI structure */}
      <div className="header">
        <img src={profilePic} className="profile-pic" />
        <span className="username">{username}</span>
        <span className="verified">✓</span>
      </div>
    
      <img src={imageUrl} className="post-image" style={{ width: '100%' }} />
    
      <div className="actions">
        <span>❤️</span> <span>💬</span> <span>📤</span>
      </div>
    
      <div className="likes">{likes.toLocaleString()} likes</div>
      <div className="caption">
        <strong>{username}</strong> {caption}
      </div>
    </div>
  );
};

async function generateMockup(config) {
  const node = document.getElementById('mockup-preview');
  const blob = await toBlob(node);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('mockups')
    .upload(`mockup-${Date.now()}.png`, blob);
  
  return data.path; // Preview URL
}
```

---

**Approach 2: Template-based (Canva API or similar)**

- Use pre-made templates
- Replace placeholders (image، text، username)
- Generate via API
- More limited customization

---

### 5.6 Share with Client (Client Portal Integration)

**في Client Portal:**

```
Task: Design Instagram Ramadan Post

📱 Mockup Previews (2):

┌────────────────────────────────┐
│ Instagram Feed                 │
│ [Preview Image]                │
│ [View Full Size]               │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Instagram Stories              │
│ [Preview Image]                │
│ [View Full Size]               │
└────────────────────────────────┘

💬 Your Feedback:
[Text area for client comments...]

[Approve] [Request Changes]
```

**Client Benefits:**

- يشوف كيف المنشور هيظهر للجمهور
- أسهل في اتخاذ القرار (approve/reject)
- يقلل revisions (المشاكل واضحة من البداية)

---

### 5.7 API Endpoints

**POST /mockups/generate**

- Body: `{ file_id, platform, format, config: { username, caption, likes, ... } }`
- Returns: `{ mockup_id, preview_url }`

**GET /mockups/:id**

- Returns mockup details + preview URL

**DELETE /mockups/:id**

- Deletes mockup and file from storage

---

### 5.8 Acceptance Criteria

**Phase 4:**

- ✅ Supports 4 platforms (Instagram، Facebook، LinkedIn، Twitter)
- ✅ At least 2 formats per platform (Feed، Stories for Instagram)
- ✅ Mockup generates within 5 seconds
- ✅ Preview accurate to real platform UI (90% visual match)
- ✅ Client can view mockups in portal
- ✅ Designer can download mockup as PNG
- ✅ Mockups stored and linked to task

**Phase 5 (Future):**

- ⏳ Video mockups (Reels، TikTok)
- ⏳ Animated mockups (carousel swipe simulation)
- ⏳ Mobile device frame options (iPhone، Android)
- ⏳ Bulk mockup generation (all platforms at once)

---

## 6. Advanced Analytics (Cross-Workspace + Forecasting)

### 6.1 Overview

**Description:** تحليلات متقدمة للـ Owner عبر كل الـ workspaces + predictive insights

**New Capabilities (vs Phase 2 Basic Analytics):**

- **Cross-Workspace Analysis:** مقارنة أداء workspaces مع بعض
- **Forecasting:** توقع task completion dates بناءً على velocity
- **Anomaly Detection:** اكتشاف patterns غريبة (productivity drops، client churn risks)
- **Cohort Analysis:** تتبع team members performance over time
- **Resource Utilization:** مين overbooked، مين underutilized

---

### 6.2 Data Requirements

**New Views/Materialized Views:**

**workspace_metrics_daily:**

- Aggregates daily: tasks_created، tasks_completed، hours_logged، revisions_requested
- Per workspace

**user_velocity_weekly:**

- Tasks completed per week per user
- Rolling average (4 weeks)

**client_health_score:**

- Composite score: revisions rate + hours per task + response time
- Scale: 0-100 (100 = healthy)

---

### 6.3 Advanced Analytics Dashboard

**Route:** `/analytics/advanced` (Owner only)

**UI Layout:**

```
┌──────────────────────────────────────────────────────────┐
│ 🧠 Advanced Analytics                                    │
│                                                          │
│ [Overview] [Forecasting] [Anomalies] [Resources]        │
│                                                          │
│ Date Range: [Last 90 Days ▼]  Compare: [Previous 90]   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📊 Agency-Wide Overview                                  │
│                                                          │
│ ┌─────────┬─────────┬─────────┬─────────┬──────────┐    │
│ │ Worksp. │ Tasks   │ Hours   │ Team    │ Revenue  │    │
│ │ Active  │ Done    │ Logged  │ Size    │ (Est.)   │    │
│ ├─────────┼─────────┼─────────┼─────────┼──────────┤    │
│ │   8     │  1,248  │ 3,420h  │   42    │ $125,000 │    │
│ │  -1     │  +18%   │  +12%   │   +5    │  +22%    │    │
│ └─────────┴─────────┴─────────┴─────────┴──────────┘    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 🏆 Workspace Performance Comparison                      │
│                                                          │
│ [Sort by: Tasks Done ▼]                                 │
│                                                          │
│ ┌──────────────┬────────┬────────┬───────┬──────────┐   │
│ │ Workspace    │ Tasks  │ Hours  │Velocity│ Health  │   │
│ ├──────────────┼────────┼────────┼───────┼──────────┤   │
│ │ E-commerce   │  320   │  850h  │ 80/wk │ 92 🟢   │   │
│ │ Fashion      │  280   │  720h  │ 70/wk │ 88 🟢   │   │
│ │ Food & Bev   │  250   │  680h  │ 62/wk │ 85 🟢   │   │
│ │ Real Estate  │  180   │  520h  │ 45/wk │ 78 🟡   │   │
│ │ Healthcare   │  120   │  450h  │ 30/wk │ 65 🔴   │   │
│ └──────────────┴────────┴────────┴───────┴──────────┘   │
│                                                          │
│ 💡 Insights:                                             │
│ • Healthcare workspace velocity declining (-12% vs Q3)   │
│ • E-commerce team overutilized (avg 50h/week per member)│
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📈 Charts                                                │
│                                                          │
│ ┌──────────────────────┬──────────────────────┐         │
│ │ Tasks by Workspace   │ Hours by Workspace   │         │
│ │ [Stacked Bar Chart]  │ [Line Chart]         │         │
│ └──────────────────────┴──────────────────────┘         │
│                                                          │
│ [View Detailed Report →]                                │
└──────────────────────────────────────────────────────────┘
```

---

### 6.4 Feature A: Forecasting

**Route:** `/analytics/advanced/forecasting`

**UI:**

```
┌──────────────────────────────────────────────────────────┐
│ 🔮 Forecasting & Predictions                             │
│                                                          │
│ Based on last 90 days of data                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 📅 Project Completion Predictions                        │
│                                                          │
│ Nike - Ramadan Campaign 2026                             │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Current Status: 65% complete (26/40 tasks done)    │  │
│ │                                                    │  │
│ │ Estimated Completion: February 5, 2026             │  │
│ │ Confidence: 85%                                    │  │
│ │                                                    │  │
│ │ ⚠️ Risk: 3 days later than planned deadline (Feb 2)│  │
│ │                                                    │  │
│ │ Recommendation: Add 1 team member or extend        │  │
│ │ deadline                                           │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [Chart: Burndown with forecast line]                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 👥 Team Capacity Forecast (Next 30 Days)                │
│                                                          │
│ ┌────────────┬──────────┬──────────┬──────────────┐     │
│ │ Team Member│ Current  │ Forecast │ Availability │     │
│ │            │ Load     │ Load     │ (hours)      │     │
│ ├────────────┼──────────┼──────────┼──────────────┤     │
│ │ Ahmed      │ 45h/wk   │ 50h/wk   │ ⚠️ Overload  │     │
│ │ Sara       │ 38h/wk   │ 40h/wk   │ ✅ Optimal   │     │
│ │ Khaled     │ 42h/wk   │ 48h/wk   │ ⚠️ Near Max  │     │
│ │ Mona       │ 30h/wk   │ 32h/wk   │ ✅ Available │     │
│ └────────────┴──────────┴──────────┴──────────────┘     │
│                                                          │
│ 💡 Suggestion: Reassign 2 tasks from Ahmed to Mona      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 💰 Revenue Forecast (Next Quarter)                      │
│                                                          │
│ Based on current pipeline + velocity:                    │
│ Q1 2026 Projected Revenue: $142,000 ± $12,000          │
│                                                          │
│ [Chart: Revenue trend with confidence interval]         │
└──────────────────────────────────────────────────────────┘
```

**Forecasting Algorithms:**

**Project Completion:**

- Calculate velocity: `avg_tasks_completed_per_week`
- Remaining tasks: `total_tasks - completed_tasks`
- Estimated weeks: `remaining / velocity`
- Add buffer: `± 15%` (confidence interval)

**Team Capacity:**

- Current load: `active_tasks * estimated_hours`
- Forecast: Linear regression based on past 8 weeks
- Flag overload: `> 45h/week sustained`

---

### 6.5 Feature B: Anomaly Detection

**Route:** `/analytics/advanced/anomalies`

**UI:**

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 Anomaly Detection                                     │
│                                                          │
│ Unusual patterns detected in last 30 days:              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ ⚠️ Productivity Drop                                     │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Healthcare Workspace                               │  │
│ │ Tasks completed: 30/week (down from 50/week avg)   │  │
│ │ Detected: Week of Jan 15                           │  │
│ │                                                    │  │
│ │ Possible Causes:                                   │  │
│ │ • 2 team members on vacation (confirmed)           │  │
│ │ • 1 high-complexity project started                │  │
│ │                                                    │  │
│ │ [View Details] [Mark as Resolved]                 │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 🔴 Client Churn Risk                                     │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Client: Adidas Egypt                               │  │
│ │ Health Score dropped: 85 → 65 (last 2 weeks)      │  │
│ │                                                    │  │
│ │ Warning Signals:                                   │  │
│ │ • 5 revision requests (2x normal)                  │  │
│ │ • Client portal logins decreased 60%               │  │
│ │ • Delayed feedback on last 3 tasks                 │  │
│ │                                                    │  │
│ │ Recommendation: Schedule check-in call with client │  │
│ │ [Create Task: Client Check-in Call]               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 🟡 Unusual Time Spike                                    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Task: Brand Guidelines for XYZ Corp                │  │
│ │ Time logged: 45 hours (3x typical 15h avg)        │  │
│ │ Assignee: Sara                                     │  │
│ │                                                    │  │
│ │ This may indicate:                                 │  │
│ │ • Scope creep (check activity log for deadline     │  │
│ │   changes)                                         │  │
│ │ • Skill gap (Sara may need training)               │  │
│ │ • Client indecision (check revision count)         │  │
│ │                                                    │  │
│ │ [View Task] [View Sara's Profile]                 │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Anomaly Detection Logic:**

**Statistical Approach:**

- Calculate mean + standard deviation for metrics
- Flag if value > `mean + 2*std_dev` (outlier)

**Examples:**

- Tasks completed < 70% of rolling average = productivity drop
- Client health score drops > 15 points in 2 weeks = churn risk
- Task time > 2x average = unusual spike

---

### 6.6 Feature C: Resource Utilization

**Route:** `/analytics/advanced/resources`

**Heatmap:** Shows team availability/workload across next 4 weeks

```
┌──────────────────────────────────────────────────────────┐
│ 📊 Resource Utilization (Next 4 Weeks)                   │
│                                                          │
│         Week 1    Week 2    Week 3    Week 4             │
│ Ahmed   🔴 95%   🔴 90%   🟡 75%   🟢 50%              │
│ Sara    🟢 60%   🟢 65%   🟢 60%   🟡 70%              │
│ Khaled  🟡 80%   🟡 85%   🔴 95%   🔴 90%              │
│ Mona    🟢 50%   🟢 55%   🟢 50%   🟢 50%              │
│                                                          │
│ 🔴 Overbooked (>85%)  🟡 Near Capacity (70-85%)         │
│ 🟢 Available (<70%)                                      │
│                                                          │
│ 💡 Recommendations:                                      │
│ • Redistribute tasks from Ahmed (Week 1-2) to Mona      │
│ • Consider hiring if sustained 85%+ utilization          │
│                                                          │
│ [Simulate Reallocation] [Export Report]                 │
└──────────────────────────────────────────────────────────┘
```

---

### 6.7 Acceptance Criteria

**Phase 4:**

- ✅ Cross-workspace analytics dashboard functional
- ✅ Project completion forecasting with 80%+ accuracy
- ✅ Anomaly detection flags at least 3 pattern types
- ✅ Resource utilization heatmap shows 4-week forecast
- ✅ Owner can export advanced reports (PDF/CSV)
- ✅ Dashboards load < 3 seconds for 10,000+ tasks

**Phase 5 (Future):**

- ⏳ Machine learning models for better forecasting
- ⏳ Sentiment analysis on client comments
- ⏳ Predictive churn modeling (90-day forecast)

---

## 7. Custom Properties \& Formulas

### 7.1 Overview

**Description:** Owner/Team Leader يقدر يضيف fields مخصصة للتاسكات + يعمل حسابات تلقائية (formulas)

**Use Cases:**

- **E-commerce agency:** Add "Product SKU" field
- **Video production:** Add "Video Duration" + "Editing Software"
- **Financial tracking:** Add "Budget" + "Actual Cost" + Formula: `Budget - Actual Cost = Remaining`
- **Priority scoring:** Formula: `(Urgency * 0.6) + (Impact * 0.4) = Priority Score`

---

### 7.2 Data Model

**custom_properties:**

- `workspace_id`: FK (custom fields per workspace)
- `property_name`: اسم الـ field
- `property_type`: text، number، date، select (dropdown)، checkbox، url
- `options`: JSON (for select type: array of options)
- `is_required`: هل إلزامي
- `default_value`: قيمة افتراضية
- `applies_to`: tasks، projects، clients

**custom_property_values:**

- `entity_type`: task، project، client
- `entity_id`: FK (ID of task/project/client)
- `property_id`: FK
- `value`: JSONB (supports any type)

**formulas:**

- `workspace_id`: FK
- `formula_name`: اسم الـ formula
- `formula_expression`: `BUDGET - ACTUAL_COST`
- `output_property_id`: FK (الـ field اللي هيتخزن فيه الناتج)
- `input_properties`: Array of property IDs used in formula

---

### 7.3 Create Custom Property UI

**Route:** `/workspace/:id/settings/custom-properties`

**UI:**

```
┌──────────────────────────────────────────────────────────┐
│ ⚙️ Custom Properties - E-commerce Workspace              │
│                                                          │
│ [+ Add Custom Property]                                  │
│                                                          │
│ Existing Properties (5):                                 │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📦 Product SKU                                     │  │
│ │ Type: Text | Applies to: Tasks | Required: No     │  │
│ │ [Edit] [Delete]                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 💰 Budget                                          │  │
│ │ Type: Number (Currency) | Applies to: Projects    │  │
│ │ Required: Yes | Default: $0                        │  │
│ │ [Edit] [Delete]                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 💵 Actual Cost                                     │  │
│ │ Type: Number (Currency) | Applies to: Tasks       │  │
│ │ Required: No | Default: $0                         │  │
│ │ [Edit] [Delete]                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🔢 Priority Score (Formula)                        │  │
│ │ Formula: (Urgency × 0.6) + (Impact × 0.4)         │  │
│ │ Applies to: Tasks | Auto-calculated               │  │
│ │ [Edit] [Delete]                                    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📅 Launch Date                                     │  │
│ │ Type: Date | Applies to: Projects | Required: No  │  │
│ │ [Edit] [Delete]                                    │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

### 7.4 Add Custom Property Form

**Click "+ Add Custom Property":**

```
┌──────────────────────────────────────────────────────────┐
│ ➕ Add Custom Property                                    │
│                                                          │
│ Property Name: [Product SKU_________________]           │
│                                                          │
│ Type:                                                    │
│ • Text                                                   │
│ • Number                                                 │
│ • Date                                                   │
│ • Select (Dropdown) ✓                                   │
│ • Checkbox (Yes/No)                                      │
│ • URL                                                    │
│ • Formula                                                │
│                                                          │
│ Dropdown Options:                                        │
│ [Option 1: SKU-001___________] [+]                      │
│ [Option 2: SKU-002___________] [+]                      │
│ [Option 3: SKU-003___________] [x Remove]               │
│ [+ Add Option]                                           │
│                                                          │
│ Applies To:                                              │
│ ☑ Tasks  ☐ Projects  ☐ Clients                         │
│                                                          │
│ Required: [✓]                                           │
│ Default Value: [None___________]                        │
│                                                          │
│          [Cancel]  [Save Property]                       │
└──────────────────────────────────────────────────────────┘
```

---

### 7.5 Formula Builder

**Select Type: "Formula":**

```
┌──────────────────────────────────────────────────────────┐
│ 🔢 Create Formula                                        │
│                                                          │
│ Formula Name: [Remaining Budget______________]          │
│                                                          │
│ Formula Expression:                                      │
│ ┌────────────────────────────────────────────────────┐  │
│ │ BUDGET - ACTUAL_COST                               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Available Fields (click to insert):                      │
│ [BUDGET] [ACTUAL_COST] [HOURS_LOGGED] [PRIORITY]       │
│ [DEADLINE] [STATUS]                                     │
│                                                          │
│ Operators:                                               │
│ [+] [-] [×] [÷] [( )] [IF] [SUM] [AVG] [COUNT]        │
│                                                          │
│ Preview Result:                                          │
│ Example: Budget=$5000, Actual=$3200                     │
│ → Result: $1800                                         │
│                                                          │
│ Applies To: ☑ Tasks  ☑ Projects                        │
│                                                          │
│          [Cancel]  [Save Formula]                        │
└──────────────────────────────────────────────────────────┘
```

**Supported Formula Functions:**

- **Arithmetic:** `+`, `-`, `*`, `/`, `()`, `^` (power)
- **Comparison:** `>`, `<`, `>=`, `<=`, `==`, `!=`
- **Logical:** `IF(condition, true_value, false_value)`، `AND`، `OR`
- **Aggregation:** `SUM(field)`، `AVG(field)`، `COUNT(field)`
- **Text:** `CONCAT(field1, field2)`، `UPPER(field)`، `LOWER(field)`
- **Date:** `DAYS_BETWEEN(date1, date2)`، `ADD_DAYS(date, n)`

---

### 7.6 Custom Properties in Task Detail

**Once properties created، they appear in task form:**

```
Task Detail:

Title: [Design Product Banner___________]
Description: [Text area_____________]
Status: [In Progress ▼]
Priority: [High ▼]
Assignee: [Ahmed ▼]
Deadline: [Jan 28, 2026]

─── Custom Properties ───

📦 Product SKU: [SKU-001 ▼]
💵 Actual Cost: [$150]
🔢 Priority Score: 8.2 (auto-calculated)

[Comments] [Activity] [Files] [Time Logs]
```

---

### 7.7 Formulas: Auto-Calculation

**When user updates input fields، formulas recalculate automatically:**

**Example:**

1. User changes `ACTUAL_COST` from \$150 to \$200
2. System detects formula depends on `ACTUAL_COST`
3. Recalculates: `BUDGET ($500) - ACTUAL_COST ($200) = $300`
4. Updates `REMAINING_BUDGET` field immediately
5. Logs in activity: "Formula recalculated: Remaining Budget = \$300"

---

### 7.8 Advanced Use Cases

**Use Case 1: Priority Scoring**

```
Formula: (URGENCY * 0.6) + (IMPACT * 0.4)

Where:
- URGENCY: 1-10 (custom property)
- IMPACT: 1-10 (custom property)
- PRIORITY_SCORE: auto-calculated (0-10)

Result: Tasks automatically sorted by priority score
```

**Use Case 2: Days Until Deadline**

```
Formula: DAYS_BETWEEN(TODAY(), DEADLINE)

Result: Shows "5 days left" in task card
Auto-updates daily
```

**Use Case 3: Budget Health**

```
Formula: IF(
  ACTUAL_COST > BUDGET * 0.9,
  "⚠️ Over Budget",
  IF(
    ACTUAL_COST > BUDGET * 0.75,
    "🟡 Near Budget",
    "🟢 On Budget"
  )
)

Result: Visual indicator in project dashboard
```

---

### 7.9 API Endpoints

**POST /workspace/:id/custom-properties**

- Body: `{ name, type, options, applies_to, is_required, default_value }`
- Creates custom property

**GET /workspace/:id/custom-properties**

- Returns all custom properties for workspace

**POST /tasks/:id/custom-values**

- Body: `{ property_id, value }`
- Sets custom property value

**POST /workspace/:id/formulas**

- Body: `{ name, expression, output_property_id, input_properties }`
- Creates formula

---

### 7.10 Acceptance Criteria

**Phase 4:**

- ✅ Owner/Team Leader can create custom properties (7 types supported)
- ✅ Custom properties appear in task/project/client forms
- ✅ Formulas support basic arithmetic + IF statements
- ✅ Formulas auto-recalculate when input values change
- ✅ Custom properties filterable in Table View
- ✅ Custom properties visible in exports (CSV)
- ✅ Validation: Required fields enforced، number fields accept numbers only

**Phase 5 (Future):**

- ⏳ Advanced formula functions (VLOOKUP، regex، etc.)
- ⏳ Cross-entity formulas (sum values across multiple tasks)
- ⏳ Conditional formatting based on formula results
- ⏳ Formula templates library

---

## Phase 4: Sprint Planning

### Sprint 15: سَنَد Pro — Task Creation (Weeks 29-30)

**Goals:** AI يكتب ويخطط

**Tasks:**

- [ ]  Upgrade quota system (unlimited for Pro tier)
- [ ]  Task creation from chat (NLP parsing)
- [ ]  Bulk task creation API
- [ ]  Task preview + edit before creating
- [ ]  AI-generated tasks logging
- [ ]  Meeting transcript upload UI

**Deliverables:**

- ✅ سَنَد creates tasks from natural language
- ✅ Meeting upload functional

---

### Sprint 16: سَنَد Pro — Summaries + Automation (Weeks 31-32)

**Goals:** Meeting summaries + automation suggestions

**Tasks:**

- [ ]  Audio transcription (Whisper API integration)
- [ ]  Meeting summary generation
- [ ]  Action item extraction + task linking
- [ ]  Automation rules database + engine
- [ ]  Pattern detection (repetitive actions)
- [ ]  Proactive insights scheduling (weekly)

**Deliverables:**

- ✅ Meeting summaries generated
- ✅ Automation rules suggested and enabled

---

### Sprint 17: Ads Monitoring (Meta + Google) (Weeks 33-34)

**Goals:** Read-only ads dashboards

**Tasks:**

- [ ]  Meta OAuth integration
- [ ]  Meta campaigns sync (Edge Function + cron)
- [ ]  Meta dashboard UI (overview + campaign details)
- [ ]  Link campaigns to projects
- [ ]  Google OAuth integration
- [ ]  Google campaigns sync
- [ ]  Google dashboard UI
- [ ]  Export ads data (CSV)

**Deliverables:**

- ✅ Meta Ads dashboard operational
- ✅ Google Ads dashboard operational

---

### Sprint 18: Competitor Monitoring + Mockups (Weeks 35-36)

**Goals:** Competitor tracking + design previews

**Tasks:**

- [ ]  Competitor profiles database
- [ ]  n8n workflows (Instagram، Facebook scraping)
- [ ]  Competitor dashboard UI
- [ ]  Top posts highlighting
- [ ]  Mockup preview generator (HTML → PNG)
- [ ]  Mockup UI (platform + format selector)
- [ ]  Share mockups with clients (portal integration)
- [ ]  Mockup storage (Supabase Storage)

**Deliverables:**

- ✅ Competitor monitoring functional
- ✅ Mockup preview system operational

---

### Sprint 19: Advanced Analytics (Weeks 37-38)

**Goals:** Cross-workspace + forecasting + anomalies

**Tasks:**

- [ ]  Cross-workspace analytics views
- [ ]  Workspace comparison dashboard
- [ ]  Forecasting algorithms (project completion، capacity)
- [ ]  Forecasting UI
- [ ]  Anomaly detection logic (productivity drops، churn risks، time spikes)
- [ ]  Anomaly alerts UI
- [ ]  Resource utilization heatmap
- [ ]  Export advanced reports (PDF)

**Deliverables:**

- ✅ Advanced analytics dashboard functional
- ✅ Forecasting 80%+ accurate

---

### Sprint 20: Custom Properties + Formulas + QA (Weeks 39-40)

**Goals:** Custom fields + formulas + testing

**Tasks:**

- [ ]  Custom properties database
- [ ]  Create property UI (all 7 types)
- [ ]  Property values storage + retrieval
- [ ]  Formulas engine (parser + evaluator)
- [ ]  Formula builder UI
- [ ]  Auto-recalculation on value changes
- [ ]  Custom properties in task forms
- [ ]  Custom properties in Table View filters
- [ ]  Performance optimization (caching، lazy loading)
- [ ]  Security audit (all new features)
- [ ]  Load testing (150 concurrent users)
- [ ]  Bug fixing sprint (P0، P1، P2)

**Deliverables:**

- ✅ Custom properties + formulas functional
- ✅ All Phase 4 features tested and stable

---

## Phase 4: Success Criteria

**End of Month 10:**

✅ **Adoption:**

- 20%+ agencies upgrade to سَنَد Pro
- 50%+ agencies connect Meta/Google Ads
- 30%+ agencies use competitor monitoring
- 60%+ designers use mockup preview system
- 40%+ workspaces create custom properties

✅ **Performance Impact:**

- AI task creation saves 2 hours/week per Team Leader
- Meeting summaries save 30 minutes/meeting
- Forecasting accuracy 80%+
- Anomaly detection catches 90%+ productivity drops

✅ **Technical:**

- System handles 150 concurrent users
- All integrations (Meta، Google، n8n) stable
- Advanced analytics load < 3 seconds
- Zero P0 bugs، < 5 P1 bugs

✅ **Business:**

- Phase 4 features drive 30% revenue increase (Pro tier + ads value)
- Customer retention 90%+ (vs 85% Phase 3)
- NPS score 50+ (promoters > detractors)

---
