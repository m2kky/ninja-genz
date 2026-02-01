<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# PHASE 5 — SCALE & ENTERPRISE (Month 11-14)

## Phase 5 Overview

**Timeline:** 4 أشهر (16 أسبوع / 8 سبرنت)
**Goal:** تحويل **Ninja Gen Z** لمنصة **Enterprise-Ready** قابلة للتوسع والتخصيص الكامل
**Target Audience:** الشركات الكبيرة (50+ مستخدم)، الوكالات الراغبة في White-label، المطورين الخارجيين

---

## Phase 5: Feature List (8 Features)

1. **Public API** (للتكامل الخارجي مع أدوات المطورين)
2. **SSO (Single Sign-On)** (SAML + OAuth للشركات)
3. **Custom Roles & Permissions** (صلاحيات مخصصة بالكامل)
4. **White-labeling** (شعار، ألوان، نطاق مخصص)
5. **Advanced Integrations** (Slack، Google Drive، Zapier)
6. **Mobile Apps** (iOS + Android Native)
7. **Enterprise Security & Compliance** (SOC2، GDPR، Audit Logs)
8. **Performance Optimization** (Scale to 10,000+ users)

---

## 1. Public API (REST API for Developers)

### 1.1 Overview

**Description:** API عامة تسمح للمطورين الخارجيين بالتكامل مع **Ninja Gen Z** (قراءة/كتابة البيانات)[^2]

**Use Cases:**

- شركة تريد ربط **Ninja Gen Z** مع نظام CRM خاص بها
- مطور يريد بناء تطبيق يستخدم بيانات **Ninja Gen Z**
- أتمتة مخصصة (مثال: إنشاء task تلقائياً من نظام آخر)

---

### 1.2 API Architecture

**Base URL:** `https://api.ninja-gen-z.com/v1`
**Authentication:** Bearer Token (API Keys)[^1]
**Format:** JSON
**Versioning:** `/v1`, `/v2` (للتوافقية المستقبلية)[^1]

---

### 1.3 API Authentication

**API Keys Management:**

**Location:** `/workspace/:id/settings/api-keys`

```
┌──────────────────────────────────────────────────────────┐
│ 🔑 API Keys - E-commerce Workspace                       │
│                                                          │
│ [+ Generate New API Key]                                 │
│                                                          │
│ Active API Keys (2):                                     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Production Key                                     │  │
│ │ Key: ngz_live_abc123...xyz (hidden) [Show] [Copy]  │  │
│ │ Created: Jan 10, 2026 | Last used: 2 hours ago    │  │
│ │ Permissions: Read + Write                          │  │
│ │ Rate Limit: 1000 requests/hour                     │  │
│ │ [Regenerate] [Revoke]                              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Development Key                                    │  │
│ │ Key: ngz_test_def456...abc                          │  │
│ │ Created: Jan 5, 2026 | Last used: Never           │  │
│ │ Permissions: Read Only                             │  │
│ │ Rate Limit: 100 requests/hour                      │  │
│ │ [Regenerate] [Revoke]                              │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ 📖 [View API Documentation]                              │
│ └──────────────────────────────────────────────────────────┘
```

**API Key Format:**

- `ngz_live_` للـ production
- `ngz_test_` للـ development

---

### 1.4 Rate Limiting

**Tiers:**[^1]


| Plan       | Requests/Hour | Burst Limit |
| :--------- | :------------ | :---------- |
| Free       | 100           | 20/minute   |
| Pro        | 1,000         | 50/minute   |
| Enterprise | 10,000+       | Custom      |

**Rate Limit Headers:**[^1]

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1674820800
```

**Response عند تجاوز الـ Limit:**

```json
{
  "error": "rate_limit_exceeded",
  "message": "You have exceeded your rate limit of 1000 requests per hour",
  "retry_after": 1800
}
```

---

### 1.5 Core API Endpoints

**Tasks:**

```
GET    /v1/tasks              - List tasks
GET    /v1/tasks/:id          - Get task details
POST   /v1/tasks              - Create task
PATCH  /v1/tasks/:id          - Update task
DELETE /v1/tasks/:id          - Delete task
POST   /v1/tasks/:id/comments - Add comment
```

**Projects:**

```
GET    /v1/projects           - List projects
GET    /v1/projects/:id       - Get project
POST   /v1/projects           - Create project
PATCH  /v1/projects/:id       - Update project
```

**Users:**

```
GET    /v1/users              - List users
GET    /v1/users/:id          - Get user profile
```

**Clients:**

```
GET    /v1/clients            - List clients
GET    /v1/clients/:id        - Get client
POST   /v1/clients            - Create client
```

**Files:**

```
GET    /v1/files              - List files
POST   /v1/files              - Upload file
DELETE /v1/files/:id          - Delete file
```

**Analytics:**

```
GET    /v1/analytics/tasks    - Task analytics
GET    /v1/analytics/users    - User performance
```

---

### 1.6 Example API Calls

**Create Task:**

```bash
curl -X POST https://api.ninja-gen-z.com/v1/tasks \
  -H "Authorization: Bearer ngz_live_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Instagram Post",
    "project_id": "proj_123",
    "assigned_to": "user_456",
    "deadline": "2026-02-01",
    "priority": "high",
    "status": "todo"
  }'
```

**Response:**

```json
{
  "id": "task_789",
  "title": "Design Instagram Post",
  "project_id": "proj_123",
  "assigned_to": "user_456",
  "deadline": "2026-02-01T00:00:00Z",
  "priority": "high",
  "status": "todo",
  "created_at": "2026-01-24T12:30:00Z",
  "updated_at": "2026-01-24T12:30:00Z"
}
```

---

### 1.7 Webhooks

**Description:** إشعارات تلقائية للأحداث المهمة

**Events:**

- `task.created`
- `task.updated`
- `task.deleted`
- `task.status_changed`
- `comment.created`
- `file.uploaded`
- `project.completed`

**Webhook Setup UI:**

```
┌──────────────────────────────────────────────────────────┐
│ 🔗 Webhooks                                              │
│                                                          │
│ [+ Add Webhook]                                          │
│                                                          │
│ Active Webhooks (1):                                     │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Task Updates Webhook                               │  │
│ │ URL: https://app.ninja-gen-z.com/webhooks/ninja-gen-z  │  │
│ │ Events: task.created, task.updated                 │  │
│ │ Status: ✅ Active | Last delivery: 5 min ago       │  │
│ │ Success rate: 98.5% (last 100 deliveries)         │  │
│ │ [Edit] [Test] [Disable]                            │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Webhook Payload Example:**

```json
{
  "event": "task.updated",
  "timestamp": "2026-01-24T12:35:00Z",
  "data": {
    "task_id": "task_789",
    "changes": {
      "status": { "old": "todo", "new": "in_progress" }
    }
  }
}
```

---

### 1.8 API Documentation

**Auto-generated docs:** Swagger/OpenAPI format
**URL:** `https://api.ninja-gen-z.com/docs`

**Features:**

- Interactive playground (Try API calls directly)
- Code examples (cURL، Python، JavaScript، PHP)
- Error codes reference
- Rate limit guidelines

---

### 1.9 Acceptance Criteria

**Phase 5:**

- ✅ Public API supports all core resources (Tasks، Projects، Users، Clients، Files)
- ✅ Rate limiting enforced with headers[^1]
- ✅ API keys revocable/regeneratable
- ✅ Webhooks deliver events within 5 seconds
- ✅ API documentation complete and interactive
- ✅ 99.9% uptime SLA

---

## 2. SSO (Single Sign-On) — Enterprise Authentication

### 2.1 Overview

**Description:** الشركات الكبيرة تسجل دخول موظفيها عبر نظام واحد (Okta، Azure AD، Google Workspace) بدون كلمات مرور منفصلة[^4][^5]

**Protocols Supported:**

- **SAML 2.0** (الأكثر شيوعاً في Enterprise)[^5]
- **OAuth 2.0** (Google، Microsoft)

---

### 2.2 SAML Flow

```
User → Ninja Gen Z Login → Redirect to Company IdP (Okta)
→ User authenticates → SAML Response → Ninja Gen Z validates 
→ User logged in ✅
```

---

### 2.3 SSO Configuration UI

**Route:** `/workspace/:id/settings/sso` (Owner only)

```
┌──────────────────────────────────────────────────────────┐
│ 🔐 Single Sign-On (SSO) - Enterprise Feature            │
│                                                          │
│ Enable SSO: [✓]                                         │
│                                                          │
│ SSO Provider:                                            │
│ • Okta ✓                                                │
│ • Azure AD (Microsoft Entra ID)                          │
│ • Google Workspace                                       │
│ • OneLogin                                               │
│ • Custom SAML 2.0                                        │
│                                                          │
│ ─── SAML Configuration ───                               │
│                                                          │
│ Identity Provider Details:                               │
│ SSO URL: [https://your-company.okta.com/app/abc123/sso] │
│ Entity ID: [http://www.okta.com/abc123_________________] │
│ X.509 Certificate: [Upload .pem file] [Uploaded ✓]     │
│                                                          │
│ Service Provider Details (Ninja Gen Z):                       │
│ ACS URL: https://app.ninja-gen-z.com/auth/saml/callback      │
│ Entity ID: https://app.ninja-gen-z.com/saml/metadata         │
│                                                          │
│ [Copy to clipboard] (to paste in Okta)                  │
│                                                          │
│ ─── User Provisioning ───                                │
│                                                          │
│ Auto-provision users: [✓]                               │
│ (New users from SSO automatically get accounts)          │
│                                                          │
│ Default Role: [Team Member ▼]                           │
│ Assign to Workspace: [Main Workspace ▼]                 │
│                                                          │
│ [Test SSO Connection]  [Save Configuration]             │
└──────────────────────────────────────────────────────────┘
```

---

### 2.4 SSO Benefits

**للشركات:**

- **أمان أعلى:** كلمات مرور مركزية، 2FA إلزامي[^3]
- **إدارة سهلة:** موظف جديد؟ أضفه مرة واحدة في Okta ويدخل تلقائياً على Ninja Gen Z[^6]
- **Compliance:** يتوافق مع SOC2، ISO 27001[^7]

**للمستخدمين:**

- **راحة:** دخول واحد لكل الأدوات[^3]
- **سرعة:** بدون إدخال بيانات متكررة

---

### 2.5 Acceptance Criteria

**Phase 5:**

- ✅ SAML 2.0 integration مع Okta، Azure AD، Google[^4]
- ✅ Auto-provisioning: مستخدم جديد في IdP = حساب تلقائي في Ninja Gen Z[^6]
- ✅ Auto-deprovisioning: حذف من IdP = تعطيل في Ninja Gen Z
- ✅ SSO configuration UI سهلة (بدون تعقيد تقني)
- ✅ Fallback: لو SSO تعطل، Owner يقدر يدخل بـ email/password

---

## 3. Custom Roles & Permissions (Granular Access Control)

### 3.1 Overview

**Description:** بدلاً من 4 أدوار فقط (Owner، Team Leader، Member، Client)، الآن Owner يقدر يعمل أدوار مخصصة بالكامل مع صلاحيات دقيقة

**Example Custom Roles:**

- **Media Buyer:** يقدر يشوف Ads Dashboard بس، مايقدرش يعدل Projects
- **Finance Manager:** يشوف Time Logs + Invoices، مايشوفش Client Portal
- **Junior Designer:** يقدر ينشئ Tasks لنفسه بس، مايعينش لغيره

---

### 3.2 Permissions Matrix

**Categories:**


| Category            | Permissions                                                                          |
| :------------------ | :----------------------------------------------------------------------------------- |
| **Workspace**       | view، create، edit، delete، manage_settings                                      |
| **Projects**        | view، create، edit، delete، archive                                              |
| **Tasks**           | view_all، view_own، create، edit_all، edit_own، delete، assign، change_status |
| **Clients**         | view، create، edit، delete، access_portal                                        |
| **Files**           | view، upload، download، delete                                                    |
| **Analytics**       | view_basic، view_advanced، export                                                  |
| **Time Tracking**   | log_own، log_others، edit، delete، approve                                       |
| **Approvals**       | request، approve، reject                                                           |
| **Team**            | view_members، invite، remove، edit_roles                                          |
| **Billing**         | view، edit_payment، download_invoices                                              |
| **Integrations**    | view، connect، disconnect، manage_api_keys                                        |
| **AI (سَنَد)** | use_basic، use_pro، manage_quota                                                   |

---

### 3.3 Create Custom Role UI

**Route:** `/workspace/:id/settings/roles`

```
┌──────────────────────────────────────────────────────────┐
│ 👥 Custom Roles & Permissions                            │
│                                                          │
│ [+ Create Custom Role]                                   │
│                                                          │
│ Existing Roles (6):                                      │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 👑 Owner (Default - Cannot Edit)                   │  │
│ │ Full access to everything | 2 users               │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📊 Media Buyer (Custom)                            │  │
│ │ Can view/edit Ads, limited project access         │  │
│ │ Permissions: 8 enabled | 3 users                  │  │
│ │ [Edit] [Duplicate] [Delete]                        │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 💰 Finance Manager (Custom)                        │  │
│ │ View time logs, billing, analytics only            │  │
│ │ Permissions: 5 enabled | 1 user                   │  │
│ │ [Edit] [Duplicate] [Delete]                        │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

### 3.4 Permission Builder

**Click "+ Create Custom Role":**

```
┌──────────────────────────────────────────────────────────┐
│ ➕ Create Custom Role                                     │
│                                                          │
│ Role Name: [Junior Designer_______________]             │
│ Description: [Can create tasks for self, limited edit]  │
│                                                          │
│ ─── Permissions ───                                      │
│                                                          │
│ 📁 Workspace                                             │
│ ☑ View workspace                                        │
│ ☐ Edit workspace settings                                │
│                                                          │
│ 📂 Projects                                              │
│ ☑ View projects                                         │
│ ☐ Create projects                                        │
│ ☐ Edit projects                                          │
│                                                          │
│ ✅ Tasks                                                 │
│ ☑ View own tasks                                        │
│ ☑ Create tasks (for self only)                         │
│ ☑ Edit own tasks                                        │
│ ☐ View all tasks                                         │
│ ☐ Edit any task                                          │
│ ☐ Delete tasks                                           │
│ ☐ Assign tasks to others                                 │
│                                                          │
│ 📎 Files                                                 │
│ ☑ View files                                            │
│ ☑ Upload files                                          │
│ ☐ Delete files                                           │
│                                                          │
│ 📊 Analytics                                             │
│ ☐ View analytics                                         │
│                                                          │
│ ⏱️ Time Tracking                                         │
│ ☑ Log own time                                          │
│ ☐ Edit time logs                                         │
│                                                          │
│ [30 more permission categories...]                       │
│                                                          │
│ Quick Templates:                                         │
│ [Use "View Only" Template] [Use "Editor" Template]      │
│                                                          │
│          [Cancel]  [Create Role]                         │
└──────────────────────────────────────────────────────────┘
```

---

### 3.5 Acceptance Criteria

**Phase 5:**

- ✅ Owner can create unlimited custom roles
- ✅ 40+ granular permissions across all features
- ✅ Permission templates (View Only، Editor، Manager)
- ✅ Permissions enforced in UI + API
- ✅ Audit log: "User X tried to access Y but was denied (permission missing)"
