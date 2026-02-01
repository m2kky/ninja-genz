<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PHASE 3 (Complete) — PRODUCTIVITY \& CULTURE

## Phase 3: Detailed Feature Implementation

---

## 1. سَنَد AI — Basic (Q\&A Only)

### 1.1 Overview

**Description:** AI assistant للإجابة على أسئلة داخل المنصة بناءً على context (Tasks, Projects, Analytics)[^1]

**Quota Decision:** **Per Agency** (50 سؤال/شهر للوكالة كلها)
**Rationale:** يشجع الاستخدام الجماعي، ويمنع abuse، وسهل التحكم في التكلفة.

**Phase 3 Capabilities (Basic):**

- ✅ Q\&A عن Tasks/Projects/Clients
- ✅ تلخيص Comments على Task
- ✅ شرح Activity Log
- ✅ إحصاءات بسيطة ("مين أكثر واحد عنده tasks overdue؟")
- ❌ لا يكتب أو يعدّل بيانات (Phase 4)
- ❌ لا meeting summaries (Phase 4)
- ❌ لا workflow automation (Phase 4)

---

### 1.2 Database Schema

```sql
-- AI Usage Tracking (Per Agency)
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL, -- Format: '2026-01'
  questions_count INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 50,
  last_reset_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agency_id, month_key)
);

-- AI Conversation History (Optional, for debugging/improvement)
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_type TEXT CHECK (context_type IN ('task', 'project', 'client', 'workspace', 'analytics')),
  context_id UUID, -- ID of task/project/etc
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_agency ON ai_conversations(agency_id);
CREATE INDEX idx_ai_usage_agency_month ON ai_usage(agency_id, month_key);

-- Enable RLS
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS: Users in same agency can view usage
CREATE POLICY "Users view agency AI usage"
ON ai_usage FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.agency_id = ai_usage.agency_id
      AND ur.user_id = auth.uid()
  )
);

-- RLS: Users view own conversations + Owner/Team Leader view all
CREATE POLICY "Users view AI conversations"
ON ai_conversations FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.agency_id = ai_conversations.agency_id
      AND ur.user_id = auth.uid()
      AND ur.role IN ('owner', 'team_leader')
  )
);
```

---

### 1.3 AI Service Implementation

**Technology Stack:**

- **Model:** OpenAI GPT-4o-mini (cost-effective, fast)
- **Context Window:** 8k tokens (enough for task details + comments)
- **Temperature:** 0.3 (factual, less creative)

**Supabase Edge Function:** `/functions/ai-ask`

```typescript
// supabase/functions/ai-ask/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY');

serve(async (req) => {
  try {
    const { question, context_type, context_id } = await req.json();
    const authHeader = req.headers.get('Authorization');
  
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);
  
    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    // Get user's agency
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('agency_id')
      .eq('user_id', user.id)
      .single();
  
    const agencyId = userRole?.agency_id;
    const monthKey = new Date().toISOString().slice(0, 7); // '2026-01'
  
    // Check quota
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('month_key', monthKey)
      .single();
  
    if (usage && usage.questions_count >= usage.quota_limit) {
      return new Response(
        JSON.stringify({ 
          error: 'Quota exceeded',
          message: `You've used all ${usage.quota_limit} questions this month. Upgrade to Pro for unlimited.`
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  
    // Fetch context data based on type
    let contextData = '';
  
    if (context_type === 'task' && context_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects(name, client:clients(name)),
          assigned_user:user_profiles!assigned_to(full_name),
          comments(content, user_profiles(full_name), created_at)
        `)
        .eq('id', context_id)
        .single();
    
      if (task) {
        contextData = `
Task: ${task.title}
Client: ${task.project.client.name}
Project: ${task.project.name}
Status: ${task.status}
Priority: ${task.priority}
Assigned to: ${task.assigned_user?.full_name || 'Unassigned'}
Deadline: ${task.deadline || 'No deadline'}
Description: ${task.description || 'No description'}

Comments (${task.comments.length}):
${task.comments.slice(0, 5).map((c: any) => 
  `- ${c.user_profiles.full_name}: ${c.content}`
).join('\n')}
        `;
      }
    }
  
    // Prepare OpenAI messages
    const messages = [
      {
        role: 'system',
        content: `You are سَنَد, an AI assistant for "workit", a marketing agency management platform in Arabic/English. 
You help team members understand their tasks, projects, and team performance.
- Be concise and helpful
- Use Arabic or English based on user's question language
- Provide actionable insights
- Reference specific data when available
- Don't make up information; say "I don't have that information" if unsure`
      },
      {
        role: 'user',
        content: contextData 
          ? `Context:\n${contextData}\n\nQuestion: ${question}`
          : `Question: ${question}`
      }
    ];
  
    // Call OpenAI
    const startTime = Date.now();
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.3,
        max_tokens: 500
      })
    });
  
    const aiData = await openaiResponse.json();
    const answer = aiData.choices[^0].message.content;
    const tokensUsed = aiData.usage.total_tokens;
    const responseTime = Date.now() - startTime;
  
    // Update usage count
    await supabase.rpc('increment_ai_usage', {
      p_agency_id: agencyId,
      p_month_key: monthKey
    });
  
    // Save conversation
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        agency_id: agencyId,
        question,
        answer,
        context_type,
        context_id,
        tokens_used: tokensUsed,
        response_time_ms: responseTime
      });
  
    return new Response(
      JSON.stringify({ 
        answer,
        tokens_used: tokensUsed,
        remaining_quota: usage ? usage.quota_limit - usage.questions_count - 1 : 49
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Database Function:**

```sql
-- Function to increment AI usage atomically
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_agency_id UUID,
  p_month_key TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage (agency_id, month_key, questions_count, quota_limit)
  VALUES (p_agency_id, p_month_key, 1, 50)
  ON CONFLICT (agency_id, month_key)
  DO UPDATE SET 
    questions_count = ai_usage.questions_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 1.4 UI Implementation

**سَنَد Chat Widget** (Floating button in bottom-right)

```
┌──────────────────────────────────────────────┐
│                                    [سَنَد AI]│ ← Floating button
└──────────────────────────────────────────────┘
```

**Click button opens drawer:**

```
┌──────────────────────────────────────────────────────────┐
│ سَنَد AI Assistant                    [X]  [15/50 Q]    │
├──────────────────────────────────────────────────────────┤
│ Context: [This Task ▼]                                   │
│ Options: This Task, Current Project, Workspace, General  │
├──────────────────────────────────────────────────────────┤
│ 💬 Conversation                                          │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🤖 سَنَد                                           │  │
│ │ مرحباً! كيف أقدر أساعدك اليوم؟                    │  │
│ │ يمكنك سؤالي عن:                                   │  │
│ │ • تفاصيل المهام والمشاريع                         │  │
│ │ • ملخصات التعليقات                               │  │
│ │ • إحصاءات الفريق                                  │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 👤 You (2 min ago)                                 │  │
│ │ ما هو التقدم في هذه المهمة؟                       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🤖 سَنَد (typing...)                              │  │
│ │ المهمة "Design Instagram Carousel" حالياً في      │  │
│ │ مرحلة "In Progress" وتم تعيينها لـ Ahmed.        │  │
│ │                                                    │  │
│ │ التقدم:                                            │  │
│ │ • تم رفع 3 ملفات تصميم منذ 2 ساعة                │  │
│ │ • آخر تعليق من Layla: "تصميم جيد، اجعل الشعار   │  │
│ │   أكبر"                                            │  │
│ │ • الموعد النهائي: 28 يناير (بعد 4 أيام)          │  │
│ │                                                    │  │
│ │ [📋 View Task] [📎 Copy Answer]                   │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [Clear Chat]                                             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Ask a question...                            [Send →]    │
└──────────────────────────────────────────────────────────┘

⚠️ 15/50 questions used this month. Upgrade to Pro for unlimited.
```

**Examples of Questions:**

- "ما هي المهام المتأخرة في workspace E-commerce؟"
- "لخص التعليقات على هذه المهمة"
- "من هو أكثر شخص عنده مهام overdue؟"
- "ما هو متوسط وقت إكمال المهام لـ Ahmed؟"

---

### 1.5 Acceptance Criteria

**Phase 3 (Must Have):**

- ✅ Quota enforcement: 50 سؤال/شهر per agency
- ✅ Quota counter visible in UI (X/50)
- ✅ Context selector: Task, Project, Workspace, General
- ✅ Responses within 3 seconds (95th percentile)
- ✅ AI cannot write/modify database (read-only)
- ✅ Conversation history saved (last 10 questions per user)
- ✅ "Copy Answer" button works
- ✅ Error handling: Quota exceeded, API failure, invalid context

**Phase 4 (Future - Pro):**

- ⏳ Unlimited questions
- ⏳ AI creates tasks from conversation
- ⏳ Meeting summaries
- ⏳ Workflow automation suggestions

---

## 2. Prayer Reminders

### 2.1 Overview

**Description:** اختياري per user—حساب مواقيت الصلاة + إشعارات قبل الأذان[^3]

**API Used:** AlAdhan.com (Free, reliable, supports multiple calculation methods)[^2]

**Calculation Methods:**[^3]

- Egyptian General Authority of Survey (method 5) — default للمنطقة العربية
- University of Islamic Sciences, Karachi (method 1)
- Islamic Society of North America (method 2)
- Muslim World League (method 3)
- Umm Al-Qura University, Makkah (method 4)

---

### 2.2 Database Schema (Already defined above)

```sql
CREATE TABLE prayer_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  city TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  calculation_method INTEGER DEFAULT 5, -- Egyptian method
  fajr_offset_min INTEGER DEFAULT 0,
  dhuhr_offset_min INTEGER DEFAULT 0,
  asr_offset_min INTEGER DEFAULT 0,
  maghrib_offset_min INTEGER DEFAULT 0,
  isha_offset_min INTEGER DEFAULT 0,
  remind_before_min INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
```

---

### 2.3 Prayer Times Fetching (Edge Function)

**Supabase Edge Function:** `/functions/fetch-prayer-times`

```typescript
// Runs daily at 3:00 AM via pg_cron
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  );
  
  // Get all users with prayer reminders enabled
  const { data: users } = await supabase
    .from('prayer_settings')
    .select('*')
    .eq('enabled', true);
  
  if (!users || users.length === 0) {
    return new Response('No users with prayer reminders', { status: 200 });
  }
  
  // Fetch for next 7 days
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[^0]; // YYYY-MM-DD
  });
  
  for (const user of users) {
    for (const date of dates) {
      // Check if already cached
      const { data: cached } = await supabase
        .from('prayer_times_cache')
        .select('*')
        .eq('user_id', user.user_id)
        .eq('date', date)
        .single();
    
      if (cached) continue; // Already cached
    
      // Fetch from AlAdhan API
      let apiUrl = '';
      if (user.latitude && user.longitude) {
        apiUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${user.latitude}&longitude=${user.longitude}&method=${user.calculation_method}`;
      } else if (user.city && user.country) {
        apiUrl = `https://api.aladhan.com/v1/timingsByCity/${date}?city=${user.city}&country=${user.country}&method=${user.calculation_method}`;
      } else {
        continue; // Skip if no location
      }
    
      const response = await fetch(apiUrl);
      const data = await response.json();
    
      if (data.code === 200) {
        const timings = data.data.timings;
      
        // Parse times and convert to timestamps
        const parseTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const dt = new Date(date);
          dt.setHours(parseInt(hours), parseInt(minutes), 0);
          return dt.toISOString();
        };
      
        // Save to cache
        await supabase
          .from('prayer_times_cache')
          .insert({
            user_id: user.user_id,
            date,
            fajr: parseTime(timings.Fajr),
            dhuhr: parseTime(timings.Dhuhr),
            asr: parseTime(timings.Asr),
            maghrib: parseTime(timings.Maghrib),
            isha: parseTime(timings.Isha),
            source: 'aladhan'
          });
      }
    }
  }
  
  return new Response('Prayer times cached successfully', { status: 200 });
});
```

**Schedule via pg_cron:**

```sql
-- Run daily at 3:00 AM
SELECT cron.schedule(
  'fetch-prayer-times',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/fetch-prayer-times',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb
  );
  $$
);
```

---

### 2.4 Prayer Reminder Notifications

**Edge Function:** `/functions/send-prayer-reminders`

```typescript
// Runs every 5 minutes
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_KEY')!
  );
  
  const now = new Date();
  const currentDate = now.toISOString().split('T')[^0];
  
  // Get upcoming prayer times (within next 15 minutes)
  const { data: prayerTimes } = await supabase
    .from('prayer_times_cache')
    .select(`
      *,
      prayer_settings!inner(remind_before_min)
    `)
    .eq('date', currentDate)
    .gte('fajr', now.toISOString())
    .lte('fajr', new Date(now.getTime() + 15 * 60000).toISOString());
  
  if (!prayerTimes) return new Response('No upcoming prayers', { status: 200 });
  
  for (const pt of prayerTimes) {
    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
    for (const prayer of prayers) {
      const prayerTime = new Date(pt[prayer]);
      const remindAt = new Date(
        prayerTime.getTime() - pt.prayer_settings.remind_before_min * 60000
      );
    
      // Check if reminder time is now (within ±2 minutes)
      const diff = Math.abs(now.getTime() - remindAt.getTime());
      if (diff <= 2 * 60000) {
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: pt.user_id,
            type: 'prayer_reminder',
            title: `⏰ وقت ${getPrayerNameAr(prayer)}`,
            message: `حان وقت ${getPrayerNameAr(prayer)} بعد ${pt.prayer_settings.remind_before_min} دقائق`,
            link: null
          });
      }
    }
  }
  
  return new Response('Prayer reminders sent', { status: 200 });
});

function getPrayerNameAr(prayer: string): string {
  const names: Record<string, string> = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء'
  };
  return names[prayer] || prayer;
}
```

**Schedule:**

```sql
SELECT cron.schedule(
  'send-prayer-reminders',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-prayer-reminders',
    headers := '{"Authorization": "Bearer SERVICE_KEY"}'::jsonb
  );
  $$
);
```

---

### 2.5 Prayer Settings UI

**Route:** `/profile/settings` → Tab: "Productivity"

```
┌──────────────────────────────────────────────────────────┐
│ ⚙️ Settings                                              │
│ [Account] [Preferences] [Notifications] [Productivity]   │
├──────────────────────────────────────────────────────────┤
│ 🕌 Prayer Reminders                                      │
│                                                          │
│ Enable Prayer Reminders: [✓]                            │
│                                                          │
│ 📍 Location                                              │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Method: [Auto (GPS) ▼]                             │  │
│ │ Options: Auto, Manual (City), Custom (Lat/Lng)    │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ City: [Cairo___________]  Country: [Egypt_______] │  │
│ │ (or)                                               │  │
│ │ Latitude: [30.0444]  Longitude: [31.2357]         │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ⚙️ Calculation Method                                   │
│ [Egyptian General Authority ▼]                          │
│                                                          │
│ ⏰ Reminder Timing                                       │
│ Remind me [^10] minutes before prayer time               │
│                                                          │
│ 🔧 Advanced (Optional)                                   │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Adjust prayer times (minutes):                     │  │
│ │ Fajr:    [^0]                                       │  │
│ │ Dhuhr:   [^0]                                       │  │
│ │ Asr:     [^0]                                       │  │
│ │ Maghrib: [^0]                                       │  │
│ │ Isha:    [^0]                                       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 📅 Today's Prayer Times (Preview):                      │
│ Fajr: 5:15 AM, Dhuhr: 12:30 PM, Asr: 3:45 PM,          │
│ Maghrib: 6:00 PM, Isha: 7:30 PM                        │
│                                                          │
│          [Cancel]  [Save Settings]                       │
└──────────────────────────────────────────────────────────┘
```

**Browser Notification (When reminder triggered):**

```
┌──────────────────────────────────────┐
│ ⏰ workit                            │
├──────────────────────────────────────┤
│ وقت الظهر                            │
│ حان وقت صلاة الظهر بعد 10 دقائق      │
│                                      │
│ [Dismiss] [Snooze 5 min]            │
└──────────────────────────────────────┘
```

**Acceptance Criteria:**

- ✅ User can enable/disable prayer reminders
- ✅ User can choose city OR lat/lng
- ✅ User can select calculation method (default: Egyptian)
- ✅ User can adjust offset per prayer (advanced)
- ✅ Preview shows today's times before saving
- ✅ Reminders trigger on time (±2 minutes accuracy)
- ✅ In-app notification + Browser notification[^5]
- ✅ User can request browser permission on first enable
- ✅ Reminders don't trigger if user disabled notifications

---

## 3. Smart Work System (90min / 15min)

### 3.1 Overview

**Description:** نظام جلسات تركيز (Pomodoro مطوّر): 90 دقيقة عمل + 15 دقيقة استراحة

**Why 90/15 instead of 25/5?**

- Deep work research: 90 minutes optimal for focused work (Cal Newport)
- Gen Z feedback: 25 minutes too short for design/creative work
- 15 minutes break sufficient for physical rest without losing momentum

---

### 3.2 Database Schema (Already defined)

```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  work_minutes INTEGER DEFAULT 90,
  break_minutes INTEGER DEFAULT 15,
  status TEXT DEFAULT 'running' CHECK (status IN ('running','break','completed','cancelled')),
  break_snoozed BOOLEAN DEFAULT false, -- Track if break was snoozed
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task ON focus_sessions(task_id);
```

---

### 3.3 Focus Bar UI

**Location:** Sticky at top of page (desktop) or bottom (mobile)

**State 1: Not Running**

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 Focus Mode                               [Start] [⚙️] │
└──────────────────────────────────────────────────────────┘
```

**State 2: Running (Work phase)**

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 Focus: Design IG Post   ⏱️ 01:23:45 / 01:30:00       │
│ [⏸️ Pause] [⏹️ Stop]                                     │
└──────────────────────────────────────────────────────────┘
```

**State 3: Break Time**

```
┌──────────────────────────────────────────────────────────┐
│          Full-screen overlay (blur background)           │
│                                                          │
│                  ☕ Break Time!                          │
│                                                          │
│              ⏱️ 14:32 remaining                          │
│                                                          │
│        استرح قليلاً، اشرب ماء، تمدد              │
│                                                          │
│        [Snooze 5 min]  [End Break Early]                │
│                                                          │
│  ⚠️ You can snooze only once per session                │
└──────────────────────────────────────────────────────────┘
```

---

### 3.4 Focus Session Flow

```typescript
// Start session
async function startFocusSession(taskId?: string) {
  // Check if another session running
  const { data: activeSession } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['running', 'break'])
    .single();
  
  if (activeSession) {
    showError('You already have an active focus session');
    return;
  }
  
  // Create session
  const { data: session } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: userId,
      task_id: taskId,
      started_at: new Date(),
      work_minutes: 90,
      break_minutes: 15,
      status: 'running'
    })
    .select()
    .single();
  
  // If task selected, auto-start timer (optional setting)
  if (taskId && user.settings.auto_start_timer) {
    await startTaskTimer(taskId);
  }
  
  // Change task status to in_progress if todo
  if (taskId) {
    const { data: task } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .single();
  
    if (task?.status === 'todo') {
      await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);
    }
  }
  
  // Start countdown timer (browser)
  startFocusCountdown(session);
}

// End work phase → Start break
async function startBreak(sessionId: string) {
  await supabase
    .from('focus_sessions')
    .update({ status: 'break' })
    .eq('id', sessionId);
  
  // Show full-screen break overlay
  showBreakOverlay();
  
  // Play notification sound
  playSound('break-time.mp3');
  
  // Send browser notification
  if (Notification.permission === 'granted') {
    new Notification('⏰ Break Time!', {
      body: 'استرح قليلاً، اشرب ماء، تمدد',
      icon: '/icons/focus-break.png'
    });
  }
}

// End break → Back to work
async function endBreak(sessionId: string) {
  await supabase
    .from('focus_sessions')
    .update({ 
      status: 'completed',
      ended_at: new Date()
    })
    .eq('id', sessionId);
  
  // Close break overlay
  closeBreakOverlay();
  
  // Show summary
  showSessionSummary(sessionId);
}

// Snooze break (once only)
async function snoozeBreak(sessionId: string) {
  const { data: session } = await supabase
    .from('focus_sessions')
    .select('break_snoozed')
    .eq('id', sessionId)
    .single();
  
  if (session?.break_snoozed) {
    showError('You can only snooze once per session');
    return;
  }
  
  await supabase
    .from('focus_sessions')
    .update({ 
      break_snoozed: true,
      break_minutes: 20 // Add 5 minutes
    })
    .eq('id', sessionId);
  
  // Extend countdown by 5 minutes
  extendBreakCountdown(5);
}
```

---

### 3.5 Session Summary

**After session completes:**

```
┌──────────────────────────────────────────────────────────┐
│ 🎉 Focus Session Complete!                               │
├──────────────────────────────────────────────────────────┤
│ Task: Design Instagram Carousel Posts                    │
│                                                          │
│ ⏱️ Time Focused: 1 hour 30 minutes                      │
│ ☕ Break Taken: 15 minutes                               │
│                                                          │
│ 📊 Your Focus Stats (This Week):                        │
│ • Sessions completed: 12                                 │
│ • Total focus time: 18 hours                             │
│ • Streak: 5 days 🔥                                     │
│                                                          │
│ 💡 Keep it up! You're in the top 20% of focused users.  │
│                                                          │
│       [Start Another Session]  [Close]                   │
└──────────────────────────────────────────────────────────┘
```

---

### 3.6 Focus Analytics (Settings Page)

**Route:** `/profile/settings` → Productivity

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 Smart Work System                                     │
│                                                          │
│ 📊 Your Focus Stats (Last 30 Days)                      │
│                                                          │
│ ┌──────────────┬──────────────┬──────────────────────┐  │
│ │ Sessions     │ Total Hours  │ Avg per Day          │  │
│ ├──────────────┼──────────────┼──────────────────────┤  │
│ │     48       │    72 hours  │    2.4 hours         │  │
│ └──────────────┴──────────────┴──────────────────────┘  │
│                                                          │
│ 📈 Focus Trend (Last 7 Days)                            │
│ [Bar chart: hours per day]                               │
│                                                          │
│ ⚙️ Settings                                              │
│ Work Duration: [^90] minutes                              │
│ Break Duration: [^15] minutes                             │
│ Allow break snooze: [✓]                                 │
│ Auto-start timer when starting focus: [✓]               │
│ Break reminder sound: [✓]                               │
│                                                          │
│          [Save Settings]                                 │
└──────────────────────────────────────────────────────────┘
```

---

### 3.7 Acceptance Criteria

**Phase 3 (Must Have):**

- ✅ User can start focus session with or without task
- ✅ Countdown accurate (1-second updates)
- ✅ Break overlay full-screen, blocks work (can be dismissed early)
- ✅ Snooze allowed once per session only
- ✅ Session logged in database
- ✅ Stats display in settings (sessions count, total hours, trend)
- ✅ Browser notification at break time[^4]
- ✅ Sound notification (optional, can be disabled)
- ✅ Mobile: Focus bar sticky at bottom, responsive
