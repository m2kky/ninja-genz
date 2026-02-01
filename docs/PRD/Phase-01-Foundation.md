# PHASE 1 (UPDATED) - FOUNDATION

## Phase 1 Overview

**Timeline:** Month 1-3 (12 weeks / 6 sprints)
**Goal:** Build foundational platform with core workflow management, audit trail, and user profiles
**Team:** 2 Frontend Devs, 1 Backend Dev, 1 Designer, 1 QA Engineer

---

## Phase 1: Complete Feature List (Updated)

## ✅ Core Features (11 Features Total)

1. **Authentication & Authorization** (RBAC - 4 roles)
2. **Hierarchical Structure** (Agency → Workspace → Client → Project → Task)
3. **Task Management** (CRUD + Assignment + Status)
4. **Task View Modes** (Side Peek / Center Modal / Full Page) ⭐ NEW
5. **Views & Visualization** (Table View + Kanban Board)
6. **Activity Log / Audit Trail** (Complete change tracking) ⭐ NEW
7. **Brand Kit** (Basic: colors, fonts, logos)
8. **Comments System** (Task discussions)
9. **User Profiles & Settings** (Preferences + Stats) ⭐ NEW
10. **Notifications** (In-app only, Phase 1)
11. **Files** (Upload infrastructure ready, full features Phase 2)

---

## 1. Authentication & Authorization

## 1.1 User Registration & Login

**Description:** Secure authentication via Supabase Auth[[ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/57205511/b6ce3aa9-da3c-453f-8882-5c93d2f18fea/Product-Vision-Document1.1.md)]****

**Features:**

* Email + password registration
* Email verification (required)
* Password reset via email
* Session management (7-day remember me)
* Logout (single device or all devices)

**Acceptance Criteria:**

* ✅ Password policy: min 8 chars, 1 uppercase, 1 number, 1 special character
* ✅ Verification email sent within 30 seconds
* ✅ User cannot login until email verified
* ✅ Password reset link expires after 1 hour
* ✅ JWT tokens with httpOnly cookies
* ✅ TLS 1.3 encryption

---

## 1.2 Role-Based Access Control (RBAC)

**4 Roles (Phase 1):**


| Role            | Permissions                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Owner**       | Full access to everything, manage workspaces, view all analytics, invite/remove users        |
| **Team Leader** | Access assigned workspaces only, manage clients/projects in workspace, view team performance |
| **Team Member** | View assigned projects/tasks, create tasks (self-assigned), comment, upload files            |
| **Client**      | Client portal only (Phase 2), view own projects, approve/reject work                         |

**Database Schema:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> user_roles </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  agency_id UUID </span><span class="token token">REFERENCES</span><span> agencies</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  role </span><span class="token token">TEXT</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>role </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'owner'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'team_leader'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'member'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'client'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">UNIQUE</span><span class="token token punctuation">(</span><span>user_id</span><span class="token token punctuation">,</span><span> agency_id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">INDEX</span><span> idx_user_roles_user </span><span class="token token">ON</span><span> user_roles</span><span class="token token punctuation">(</span><span>user_id</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">INDEX</span><span> idx_user_roles_agency </span><span class="token token">ON</span><span> user_roles</span><span class="token token punctuation">(</span><span>agency_id</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Permissions enforced at database level (RLS policies)
* ✅ API returns 403 Forbidden for unauthorized actions
* ✅ UI elements hide/show based on user role
* ✅ Owner can perform all actions across entire agency
* ✅ Team Leader limited to assigned workspaces

---

## 2. Hierarchical Structure

## 2.1 Agency (Tenant)

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> agencies </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  name </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  slug </span><span class="token token">TEXT</span><span> </span><span class="token token">UNIQUE</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  logo_url </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  timezone </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'Africa/Cairo'</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  currency </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'EGP'</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">language</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'ar'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">language</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'ar'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'en'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  owner_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 2.2 Workspace

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> workspaces </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  agency_id UUID </span><span class="token token">REFERENCES</span><span> agencies</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  name </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  description </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  color </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span> </span><span class="token token">-- Hex color for visual identification</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_by UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> user_workspace_access </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  workspace_id UUID </span><span class="token token">REFERENCES</span><span> workspaces</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  role </span><span class="token token">TEXT</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>role </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'team_leader'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'member'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token punctuation">(</span><span>user_id</span><span class="token token punctuation">,</span><span> workspace_id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 2.3 Client

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> clients </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  workspace_id UUID </span><span class="token token">REFERENCES</span><span> workspaces</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  name </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  contact_person </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  email </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  phone </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  company_website </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">status</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'active'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">status</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'active'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'paused'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'archived'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  avatar_url </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_by UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 2.4 Project

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> projects </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  client_id UUID </span><span class="token token">REFERENCES</span><span> clients</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  name </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  description </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">type</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">type</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'campaign'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'retainer'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'one_time'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">status</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'planning'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">status</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'planning'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'active'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'on_hold'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'completed'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  start_date </span><span class="token token">DATE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  end_date </span><span class="token token">DATE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_by UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> project_team_members </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  project_id UUID </span><span class="token token">REFERENCES</span><span> projects</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  role </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span> </span><span class="token token">-- e.g., "Lead Designer"</span><span>
</span></span><span><span>  added_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token punctuation">(</span><span>project_id</span><span class="token token punctuation">,</span><span> user_id</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 2.5 Task

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> tasks </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  project_id UUID </span><span class="token token">REFERENCES</span><span> projects</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  title </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  description </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  assigned_to UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">SET</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">status</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'todo'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">status</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'todo'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'in_progress'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'review'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'done'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  priority </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'medium'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>priority </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'high'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'medium'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'low'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  deadline </span><span class="token token">TIMESTAMP</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  estimated_hours </span><span class="token token">NUMERIC</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_by UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  updated_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

---

## 3. Task Management

## 3.1 Task CRUD Operations

**Create Task:**

* Modal with fields: Title (required), Description, Assignee, Status, Priority, Deadline, Estimated Hours
* Save button disabled until title filled
* Auto-link to current project/client
* Creator and assignee notified

**Update Task:**

* Edit any field (permissions enforced)
* Changes logged in Activity Log
* Realtime updates via Supabase

**Delete Task:**

* Confirmation required: "Delete this task? This cannot be undone."
* Only Owner/Team Leader can delete
* Logged in Activity Log

**Acceptance Criteria:**

* ✅ Task creation < 1 second
* ✅ Realtime updates within 2 seconds
* ✅ Validation: title not empty, deadline not in past
* ✅ Notifications sent immediately

---

## 4. Task View Modes ⭐ NEW

## Overview

Users can open tasks in 3 different view modes (like Notion)

## 4.1 Side Peek (400px Drawer)

**Description:** Slides from right, task list remains visible on left

**Use Case:** Quick view while browsing tasks

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>┌────────────────────┬───────────────────────┐
</span></span><span>│                    │                       │
</span><span>│  Task List         │  ← Task Detail (400px)│
</span><span>│  (remains visible) │                       │
</span><span>│                    │  Title: Design IG...  │
</span><span>│  ☐ Task 1         │  Status: [In Progress] │
</span><span>│  ☐ Task 2         │  Assigned: Ahmed       │
</span><span>│  ☑ Task 3         │                       │
</span><span>│                    │  Description:          │
</span><span>│                    │  Create 3 posts...     │
</span><span>│                    │                       │
</span><span>│                    │  [Comments] [Activity] │
</span><span>│                    │                       │
</span><span>│                    │  [⊡ Center] [⊞ Full]  │
</span><span>└────────────────────┴───────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Implementation:**

* Radix UI Dialog or shadcn/ui Drawer component
* Backdrop: semi-transparent blur
* Keyboard: `ESC` to close, `Cmd+1` to toggle

---

## 4.2 Center Modal (800px)

**Description:** Centered modal with full backdrop

**Use Case:** Focused editing without distraction

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>┌─────────────────────────────────────────────┐
</span></span><span>│         ╔════════════════════════╗          │
</span><span>│         ║                        ║          │
</span><span>│         ║  Task Detail (800px)   ║          │
</span><span>│         ║                        ║          │
</span><span>│         ║  Title: Design IG Post ║          │
</span><span>│         ║  Status: [In Progress] ║          │
</span><span>│         ║                        ║          │
</span><span>│         ║  Description:          ║          │
</span><span>│         ║  [Full editor space]   ║          │
</span><span>│         ║                        ║          │
</span><span>│         ║  [Comments] [Activity] ║          │
</span><span>│         ║  [Files]               ║          │
</span><span>│         ║                        ║          │
</span><span>│         ║  [⊟ Side] [⊞ Full]     ║          │
</span><span>│         ╚════════════════════════╝          │
</span><span>└─────────────────────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Implementation:**

* Radix UI Dialog with max-width: 800px
* Center aligned, backdrop blur + dark overlay
* Keyboard: `Cmd+2` to toggle

---

## 4.3 Full Page (100% Width)

**Description:** Dedicated route with browser navigation

**Use Case:** Maximum space for rich content, long descriptions, many comments

**Route:**`/workspace/:workspaceId/project/:projectId/task/:taskId`

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>┌─────────────────────────────────────────────────────┐
</span></span><span>│ workit Logo  [Workspace] [Projects]  [Profile] [🔔] │ ← Header
</span><span>├─────────────────────────────────────────────────────┤
</span><span>│ ← Back to Project                                   │
</span><span>│                                                     │
</span><span>│ Task: Design Instagram Post for Ramadan            │
</span><span>│ Status: [In Progress ▼]  Priority: [High ▼]       │
</span><span>│                                                     │
</span><span>│ Description:                                        │
</span><span>│ [Full-width rich text editor]                      │
</span><span>│                                                     │
</span><span>│ Assigned to: Ahmed (Designer)                      │
</span><span>│ Deadline: January 28, 2026                         │
</span><span>│                                                     │
</span><span>│ [Comments] [Activity] [Files]                      │
</span><span>│                                                     │
</span><span>│ [Full-width content area]                          │
</span><span>│                                                     │
</span><span>│ [⊟ Side] [⊡ Center]                                │
</span><span>│                                                     │
</span><span>└─────────────────────────────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Implementation:**

* React Router route
* Browser back button returns to previous view
* Keyboard: `Cmd+3` to toggle

---

## 4.4 Mode Persistence

**Database Schema:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">-- Added to user_profiles table</span><span>
</span></span><span><span></span><span class="token token">ALTER</span><span> </span><span class="token token">TABLE</span><span> user_profiles 
</span></span><span><span></span><span class="token token">ADD</span><span> </span><span class="token token">COLUMN</span><span> task_view_mode </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'center'</span><span> 
</span></span><span><span></span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>task_view_mode </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'side'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'center'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'full'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

**Behavior:**

* User's last selected mode saved to database
* Default mode applied on next task open
* Toggle buttons in task header switch between modes
* Keyboard shortcuts: `Cmd+1` (side), `Cmd+2` (center), `Cmd+3` (full)

**Acceptance Criteria:**

* ✅ All 3 modes functional and switch seamlessly
* ✅ Mode preference persists across sessions
* ✅ Keyboard shortcuts work on Mac/Windows (Cmd/Ctrl)
* ✅ Mobile: defaults to full-page modal (responsive)

---

## 5. Views & Visualization

## 5.1 Table View

**Features:**

* Columns: Checkbox, Title, Client, Project, Assignee, Status, Priority, Deadline
* Sortable columns (click header)
* Filterable (status, priority, assignee, client)
* Searchable (task title)
* Bulk actions: Change status, Reassign, Delete
* Pagination: 50 tasks per page

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>Search: [_________] 🔍  [All Status ▼] [All Priority ▼] [All Assignees ▼]
</span></span><span>
</span><span>┌─┬───────────────────┬──────────────┬──────────┬───────────┬──────────┬──────────┐
</span><span>│☐│ Task Title        │ Client       │ Assignee │ Status    │ Priority │ Deadline │
</span><span>├─┼───────────────────┼──────────────┼──────────┼───────────┼──────────┼──────────┤
</span><span>│☐│ Design IG Post    │ Nike Egypt   │ Ahmed    │ Progress  │ 🔴 High  │ Jan 28   │
</span><span>│☐│ Write ad copy     │ Adidas Egypt │ Sara     │ To Do     │ 🟡 Medium│ Jan 29   │
</span><span>│☐│ Edit video        │ Nike Egypt   │ Khaled   │ Review    │ 🟢 Low   │ Feb 1    │
</span><span>└─┴───────────────────┴──────────────┴──────────┴───────────┴──────────┴──────────┘
</span><span>
</span><span>[< Previous]  Page 1 of 5  [Next >]
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Loads 500 tasks < 1 second
* ✅ Sorting instant for < 100 tasks, server-side for more
* ✅ Click row opens task in user's preferred view mode
* ✅ Bulk select + actions work for up to 50 tasks simultaneously

---

## 5.2 Kanban Board View

**Features:**

* 4 columns: To Do, In Progress, Review, Done
* Drag-and-drop between columns (updates status)
* Task cards show: Title, Assignee avatar, Priority badge, Deadline
* Filtering (same as Table View)
* Realtime updates (cards move for all viewers)

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>[Table View] [Kanban View]
</span></span><span>
</span><span>┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
</span><span>│ To Do (3)       │ In Progress (5) │ Review (2)      │ Done (12)       │
</span><span>├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
</span><span>│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │
</span><span>│ │ Design IG   │ │ │ Write ad... │ │ │ Client rep..│ │ │ Campaign... │ │
</span><span>│ │ 👤 Ahmed    │ │ │ 👤 Sara     │ │ │ 👤 Khaled   │ │ │ ✓ Completed │ │
</span><span>│ │ 🔴 High     │ │ │ 🟡 Medium   │ │ │ 🟢 Low      │ │ │             │ │
</span><span>│ │ 📅 Jan 28   │ │ │ 📅 Jan 29   │ │ │ 📅 Feb 1    │ │ │             │ │
</span><span>│ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │
</span><span>└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Drag-and-drop smooth (< 100ms animation)
* ✅ Status updates in database immediately
* ✅ Realtime: other users see card move within 2 seconds
* ✅ Mobile: swipe gestures for moving cards

---

## 6. Activity Log / Audit Trail ⭐ NEW

## 6.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> activity_logs </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  entity_type </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>entity_type </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'task'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'project'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'client'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'workspace'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'comment'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'file'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'user'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  entity_id UUID </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">SET</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">action</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">action</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span>
</span></span><span><span>    </span><span class="token token">'created'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'updated'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'deleted'</span><span class="token token punctuation">,</span><span> 
</span></span><span><span>    </span><span class="token token">'status_changed'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'assigned'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'unassigned'</span><span class="token token punctuation">,</span><span> 
</span></span><span><span>    </span><span class="token token">'deadline_changed'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'priority_changed'</span><span class="token token punctuation">,</span><span> 
</span></span><span><span>    </span><span class="token token">'commented'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'file_uploaded'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'file_deleted'</span><span class="token token punctuation">,</span><span>
</span></span><span><span>    </span><span class="token token">'archived'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'restored'</span><span>
</span></span><span><span>  </span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  field_name </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  old_value JSONB</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  new_value JSONB</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  ip_address INET</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_agent </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">INDEX</span><span> idx_activity_logs_entity </span><span class="token token">ON</span><span> activity_logs</span><span class="token token punctuation">(</span><span>entity_type</span><span class="token token punctuation">,</span><span> entity_id</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">INDEX</span><span> idx_activity_logs_entity_created </span><span class="token token">ON</span><span> activity_logs</span><span class="token token punctuation">(</span><span>entity_type</span><span class="token token punctuation">,</span><span> entity_id</span><span class="token token punctuation">,</span><span> created_at </span><span class="token token">DESC</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 6.2 Automatic Logging (Triggers)

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token operator">OR</span><span> </span><span class="token token">REPLACE</span><span> </span><span class="token token">FUNCTION</span><span> log_task_changes</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token">RETURNS</span><span> </span><span class="token token">TRIGGER</span><span> </span><span class="token token">AS</span><span> $$
</span></span><span><span></span><span class="token token">BEGIN</span><span>
</span></span><span><span>  </span><span class="token token">IF</span><span> TG_OP </span><span class="token token operator">=</span><span> </span><span class="token token">'INSERT'</span><span> </span><span class="token token">THEN</span><span>
</span></span><span><span>    </span><span class="token token">INSERT</span><span> </span><span class="token token">INTO</span><span> activity_logs </span><span class="token token punctuation">(</span><span>entity_type</span><span class="token token punctuation">,</span><span> entity_id</span><span class="token token punctuation">,</span><span> user_id</span><span class="token token punctuation">,</span><span> </span><span class="token token">action</span><span class="token token punctuation">)</span><span>
</span></span><span><span>    </span><span class="token token">VALUES</span><span> </span><span class="token token punctuation">(</span><span class="token token">'task'</span><span class="token token punctuation">,</span><span> NEW</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">,</span><span> auth</span><span class="token token punctuation">.</span><span>uid</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span> </span><span class="token token">'created'</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span>  </span><span class="token token">END</span><span> </span><span class="token token">IF</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span>  </span><span class="token token">IF</span><span> OLD</span><span class="token token punctuation">.</span><span class="token token">status</span><span> </span><span class="token token operator">!=</span><span> NEW</span><span class="token token punctuation">.</span><span class="token token">status</span><span> </span><span class="token token">THEN</span><span>
</span></span><span><span>    </span><span class="token token">INSERT</span><span> </span><span class="token token">INTO</span><span> activity_logs </span><span class="token token punctuation">(</span><span>
</span></span><span><span>      entity_type</span><span class="token token punctuation">,</span><span> entity_id</span><span class="token token punctuation">,</span><span> user_id</span><span class="token token punctuation">,</span><span> </span><span class="token token">action</span><span class="token token punctuation">,</span><span> field_name</span><span class="token token punctuation">,</span><span> old_value</span><span class="token token punctuation">,</span><span> new_value
</span></span><span><span>    </span><span class="token token punctuation">)</span><span> </span><span class="token token">VALUES</span><span> </span><span class="token token punctuation">(</span><span>
</span></span><span><span>      </span><span class="token token">'task'</span><span class="token token punctuation">,</span><span> NEW</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">,</span><span> auth</span><span class="token token punctuation">.</span><span>uid</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span> </span><span class="token token">'status_changed'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'status'</span><span class="token token punctuation">,</span><span> to_jsonb</span><span class="token token punctuation">(</span><span>OLD</span><span class="token token punctuation">.</span><span class="token token">status</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span> to_jsonb</span><span class="token token punctuation">(</span><span>NEW</span><span class="token token punctuation">.</span><span class="token token">status</span><span class="token token punctuation">)</span><span>
</span></span><span><span>    </span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span><span>  </span><span class="token token">END</span><span> </span><span class="token token">IF</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span>  </span><span class="token token">-- Log assignee, deadline, priority changes...</span><span>
</span></span><span><span>  </span><span class="token token">RETURN</span><span> NEW</span><span class="token token punctuation">;</span><span>
</span></span><span><span></span><span class="token token">END</span><span class="token token punctuation">;</span><span>
</span></span><span><span>$$ </span><span class="token token">LANGUAGE</span><span> plpgsql SECURITY </span><span class="token token">DEFINER</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">TRIGGER</span><span> task_changes_trigger
</span></span><span><span>  </span><span class="token token">AFTER</span><span> </span><span class="token token">INSERT</span><span> </span><span class="token token operator">OR</span><span> </span><span class="token token">UPDATE</span><span> </span><span class="token token">ON</span><span> tasks
</span></span><span><span>  </span><span class="token token">FOR EACH ROW</span><span> </span><span class="token token">EXECUTE</span><span> </span><span class="token token">FUNCTION</span><span> log_task_changes</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 6.3 Activity Timeline UI

**Location:** Task Detail → Tab: "Activity"

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>[Comments (5)] [Activity (12)] [Files (3)]
</span></span><span>
</span><span>┌────────────────────────────────────────┐
</span><span>│ 🕒 Activity (12)                       │
</span><span>│                                        │
</span><span>│ Today                                  │
</span><span>│ ● Ahmed changed status                 │
</span><span>│   From: In Progress → Done             │
</span><span>│   2 hours ago                          │
</span><span>│                                        │
</span><span>│ ● Layla reassigned task                │
</span><span>│   From: Sara → Ahmed                   │
</span><span>│   5 hours ago                          │
</span><span>│                                        │
</span><span>│ Yesterday                              │
</span><span>│ ● Sara changed deadline                │
</span><span>│   From: Jan 25 → Jan 28                │
</span><span>│   Yesterday at 4:32 PM                 │
</span><span>│                                        │
</span><span>│ ● Khaled created task                  │
</span><span>│   Jan 23 at 10:15 AM                   │
</span><span>│                                        │
</span><span>│ [Load More...]                         │
</span><span>└────────────────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ All task changes logged automatically
* ✅ Timeline displays in chronological order (newest first)
* ✅ Grouped by date (Today, Yesterday, specific dates)
* ✅ User name + avatar for each activity
* ✅ Relative timestamps ("2 hours ago")
* ✅ Realtime updates (new activities appear immediately)
* ✅ Pagination (20 activities per page)

---

## 7. Brand Kit (Basic)

## 7.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> brand_kits </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  client_id UUID </span><span class="token token">UNIQUE</span><span> </span><span class="token token">REFERENCES</span><span> clients</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  primary_color </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  secondary_color </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  accent_color </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  primary_font </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  secondary_font </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  logo_primary_url </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  logo_secondary_url </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  notes </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  updated_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 7.2 Features (Phase 1)

* Color picker for primary/secondary/accent colors
* Text fields for font names
* Logo upload (PNG/JPG/SVG, max 5MB)
* Notes field for additional guidelines

## 7.3 UI Display

**In Task Detail (Sidebar):**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>Brand Kit - Nike Egypt
</span></span><span>━━━━━━━━━━━━━━━━━━━━
</span><span>Colors:
</span><span>⬛ #000000  ⬜ #FFFFFF  🟧 #FF6B35
</span><span>
</span><span>Fonts:
</span><span>• Futura Bold
</span><span>• Helvetica Neue
</span><span>
</span><span>Logo: [View] nike-logo.png
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Brand kit editable by Owner/Team Leader only
* ✅ Displays in task sidebar automatically (based on client)
* ✅ Logo upload to Supabase Storage
* ✅ Color values copyable (click to copy hex code)

---

## 8. Comments System

## 8.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> comments </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  task_id UUID </span><span class="token token">REFERENCES</span><span> tasks</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  content </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  updated_at </span><span class="token token">TIMESTAMP</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  is_edited </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">false</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 8.2 Features

* Add comment (text only Phase 1, rich text Phase 2)
* Edit own comment (within 5 minutes)
* Delete own comment (or Team Leader/Owner can delete any)
* Realtime updates

## 8.3 UI

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>💬 Comments (5)
</span></span><span>┌───────────────────────────────────────┐
</span><span>│ 👤 Layla (Team Leader) - 2 hours ago │
</span><span>│ يرجى التركيز على الخط العربي      │
</span><span>│ [Edit] [Delete]                       │
</span><span>├───────────────────────────────────────┤
</span><span>│ 👤 Ahmed (Designer) - 1 hour ago     │
</span><span>│ تمام، سأستخدم خط الثلث             │
</span><span>└───────────────────────────────────────┘
</span><span>
</span><span>Add comment:
</span><span>[Text area___________________________]
</span><span>[Send]
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Comments appear in chronological order
* ✅ Realtime updates (new comments within 2 seconds)
* ✅ Edit button visible only on own comments (< 5 min)
* ✅ User avatar + name + timestamp for each comment

---

## 9. User Profiles & Settings ⭐ NEW

## 9.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> user_profiles </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  full_name </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  avatar_url </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  bio </span><span class="token token">TEXT</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>LENGTH</span><span class="token token punctuation">(</span><span>bio</span><span class="token token punctuation">)</span><span> </span><span class="token token operator"><=</span><span> </span><span class="token token">200</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  phone </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  job_title </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  timezone </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'Africa/Cairo'</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">language</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'ar'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span class="token token">language</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'ar'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'en'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  date_format </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'DD/MM/YYYY'</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  time_format </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'24h'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>time_format </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'12h'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'24h'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  task_view_mode </span><span class="token token">TEXT</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">'center'</span><span> </span><span class="token token">CHECK</span><span> </span><span class="token token punctuation">(</span><span>task_view_mode </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'side'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'center'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'full'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span>  
</span><span><span>  </span><span class="token token">-- Notification Preferences</span><span>
</span></span><span><span>  notify_task_assigned </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">true</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  notify_task_due </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">true</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  notify_task_status_changed </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">true</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  notify_comment_added </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">true</span><span class="token token punctuation">,</span><span>
</span></span><span>  
</span><span><span>  profile_visible </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">true</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  updated_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span>
</span><span><span></span><span class="token token">-- User Stats (Computed View)</span><span>
</span></span><span><span></span><span class="token token">CREATE</span><span> </span><span class="token token">VIEW</span><span> user_stats </span><span class="token token">AS</span><span>
</span></span><span><span></span><span class="token token">SELECT</span><span> 
</span></span><span><span>  u</span><span class="token token punctuation">.</span><span>id </span><span class="token token">as</span><span> user_id</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">COUNT</span><span class="token token punctuation">(</span><span>t</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">)</span><span> FILTER </span><span class="token token punctuation">(</span><span class="token token">WHERE</span><span> t</span><span class="token token punctuation">.</span><span class="token token">status</span><span> </span><span class="token token operator">=</span><span> </span><span class="token token">'done'</span><span class="token token punctuation">)</span><span> </span><span class="token token">as</span><span> tasks_completed</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">COUNT</span><span class="token token punctuation">(</span><span>t</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">)</span><span> FILTER </span><span class="token token punctuation">(</span><span class="token token">WHERE</span><span> t</span><span class="token token punctuation">.</span><span class="token token">status</span><span> </span><span class="token token operator">IN</span><span> </span><span class="token token punctuation">(</span><span class="token token">'todo'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'in_progress'</span><span class="token token punctuation">,</span><span> </span><span class="token token">'review'</span><span class="token token punctuation">)</span><span class="token token punctuation">)</span><span> </span><span class="token token">as</span><span> tasks_active</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">COUNT</span><span class="token token punctuation">(</span><span>t</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">)</span><span> FILTER </span><span class="token token punctuation">(</span><span class="token token">WHERE</span><span> t</span><span class="token token punctuation">.</span><span>deadline </span><span class="token token operator"><</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span> </span><span class="token token operator">AND</span><span> t</span><span class="token token punctuation">.</span><span class="token token">status</span><span> </span><span class="token token operator">!=</span><span> </span><span class="token token">'done'</span><span class="token token punctuation">)</span><span> </span><span class="token token">as</span><span> tasks_overdue</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">COUNT</span><span class="token token punctuation">(</span><span>c</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">as</span><span> total_comments</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  up</span><span class="token token punctuation">.</span><span>created_at </span><span class="token token">as</span><span> joined_date
</span></span><span><span></span><span class="token token">FROM</span><span> auth</span><span class="token token punctuation">.</span><span>users u
</span></span><span><span></span><span class="token token">LEFT</span><span> </span><span class="token token">JOIN</span><span> user_profiles up </span><span class="token token">ON</span><span> up</span><span class="token token punctuation">.</span><span>user_id </span><span class="token token operator">=</span><span> u</span><span class="token token punctuation">.</span><span>id
</span></span><span><span></span><span class="token token">LEFT</span><span> </span><span class="token token">JOIN</span><span> tasks t </span><span class="token token">ON</span><span> t</span><span class="token token punctuation">.</span><span>assigned_to </span><span class="token token operator">=</span><span> u</span><span class="token token punctuation">.</span><span>id
</span></span><span><span></span><span class="token token">LEFT</span><span> </span><span class="token token">JOIN</span><span> comments c </span><span class="token token">ON</span><span> c</span><span class="token token punctuation">.</span><span>user_id </span><span class="token token operator">=</span><span> u</span><span class="token token punctuation">.</span><span>id
</span></span><span><span></span><span class="token token">GROUP</span><span> </span><span class="token token">BY</span><span> u</span><span class="token token punctuation">.</span><span>id</span><span class="token token punctuation">,</span><span> up</span><span class="token token punctuation">.</span><span>created_at</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 9.2 Profile Page

**Route:**`/profile/:userId`

**UI:**

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>┌──────────────────────────────┐
</span></span><span>│ ← Back      [Edit] [⚙️]      │
</span><span>├──────────────────────────────┤
</span><span>│       ╔═══════════╗          │
</span><span>│       ║  Avatar   ║          │
</span><span>│       ╚═══════════╝          │
</span><span>│                              │
</span><span>│     Ahmed Hassan             │
</span><span>│     Senior Designer          │
</span><span>│     @ahmed.hassan            │
</span><span>│                              │
</span><span>│  "Passionate designer..."    │
</span><span>│                              │
</span><span>│  📍 Cairo, Egypt             │
</span><span>│  🗓️ Joined Dec 2025          │
</span><span>│                              │
</span><span>├──────────────────────────────┤
</span><span>│  📊 Stats                    │
</span><span>├──────────────────────────────┤
</span><span>│  ┌───────┐ ┌───────┐        │
</span><span>│  │  48   │ │  12   │        │
</span><span>│  │ Done  │ │Active │        │
</span><span>│  └───────┘ └───────┘        │
</span><span>│  ┌───────┐ ┌───────┐        │
</span><span>│  │  3    │ │  47   │        │
</span><span>│  │Overdue│ │Comments        │
</span><span>│  └───────┘ └───────┘        │
</span><span>└──────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

## 9.3 Settings Page

**Route:**`/profile/settings`

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>┌──────────────────────────────┐
</span></span><span>│ ← Settings                   │
</span><span>├──────────────────────────────┤
</span><span>│ 👤 Account                   │
</span><span>│ Full Name: [Ahmed Hassan]    │
</span><span>│ Email: ahmed@agency.com      │
</span><span>│ Phone: [+20 123 456 789]     │
</span><span>│ Bio: [Text area_______]      │
</span><span>│                              │
</span><span>│ 🌍 Preferences               │
</span><span>│ Language: [العربية ▼]        │
</span><span>│ Timezone: [Africa/Cairo ▼]   │
</span><span>│ Date Format: [DD/MM/YYYY ▼]  │
</span><span>│ Time Format: [24-hour ▼]     │
</span><span>│ Task View: [Center Modal ▼]  │
</span><span>│                              │
</span><span>│ 🔔 Notifications             │
</span><span>│ Task Assigned      [✓]       │
</span><span>│ Task Due Soon      [✓]       │
</span><span>│ Status Changed     [✓]       │
</span><span>│ Comments Added     [✓]       │
</span><span>│                              │
</span><span>│ 🔒 Privacy                   │
</span><span>│ Profile Visible    [✓]       │
</span><span>│                              │
</span><span>│ 🔐 Security                  │
</span><span>│ [Change Password]            │
</span><span>│                              │
</span><span>│      [Cancel]  [Save]        │
</span><span>└──────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ User can upload avatar (max 5MB, PNG/JPG)
* ✅ Profile stats update in realtime
* ✅ Settings saved immediately on change
* ✅ Avatar displays throughout app (comments, activity, assignee dropdown)
* ✅ Timezone affects all date/time displays
* ✅ Language preference switches UI language

---

## 10. Notifications (In-App)

## 10.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> notifications </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  user_id UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  </span><span class="token token">type</span><span> </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  title </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  message </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  link </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  is_read </span><span class="token token">BOOLEAN</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token boolean">false</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 10.2 Notification Types (Phase 1)

* Task assigned to you
* Task status changed (if you're assignee or creator)
* Comment added to your task
* Task deadline approaching (24 hours before)
* Task overdue

## 10.3 UI

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">text</div></div><div><span><code><span><span>Header: [Ninja Gen Z] [Projects] [🔔 5] [Profile ▼]
</span></span><span>
</span><span>Notification Dropdown:
</span><span>┌──────────────────────────────────┐
</span><span>│ Notifications (5 unread)         │
</span><span>├──────────────────────────────────┤
</span><span>│ ● New task assigned              │
</span><span>│   Layla assigned: Design IG Post │
</span><span>│   2 hours ago                    │
</span><span>├──────────────────────────────────┤
</span><span>│ ● Comment added                  │
</span><span>│   Ahmed: "سأبدأ الآن"          │
</span><span>│   4 hours ago                    │
</span><span>├──────────────────────────────────┤
</span><span>│      [Mark all as read]          │
</span><span>└──────────────────────────────────┘
</span><span></span></code></span></div></div></div></pre>

**Acceptance Criteria:**

* ✅ Bell icon shows unread count badge
* ✅ Clicking notification marks as read and navigates to task
* ✅ Notifications auto-delete after 30 days
* ✅ Respects user's notification preferences in Settings

---

## 11. Files (Infrastructure Only)

## 11.1 Database Schema

<pre class="not-prose w-full rounded font-mono text-sm font-extralight"><div class="codeWrapper text-light selection:text-super selection:bg-super/10 my-md relative flex flex-col rounded-lg font-mono text-sm font-normal bg-subtler"><div class="translate-y-xs -translate-x-xs bottom-xl mb-xl flex h-0 items-start justify-end sm:sticky sm:top-xs"><div class="overflow-hidden rounded-full border-subtlest ring-subtlest divide-subtlest bg-base"><div class="border-subtlest ring-subtlest divide-subtlest bg-subtler"><button data-testid="copy-code-button" aria-label="Copy code" type="button" class="focus-visible:bg-subtle hover:bg-subtle text-quiet  hover:text-foreground dark:hover:bg-subtle font-sans focus:outline-none outline-none outline-transparent transition duration-300 ease-out select-none items-center relative group/button font-semimedium justify-center text-center items-center rounded-full cursor-pointer active:scale-[0.97] active:duration-150 active:ease-outExpo origin-center whitespace-nowrap inline-flex text-sm h-8 aspect-square" data-state="closed"><div class="flex items-center min-w-0 gap-two justify-center"><div class="flex shrink-0 items-center justify-center size-4"><svg role="img" class="inline-flex fill-current shrink-0" width="16" height="16"><use xlink:href="#pplx-icon-copy"></use></svg></div></div></button></div></div></div><div class="-mt-xl"><div><div data-testid="code-language-indicator" class="text-quiet bg-subtle py-xs px-sm inline-block rounded-br rounded-tl-lg text-xs font-thin">sql</div></div><div><span><code><span><span class="token token">CREATE</span><span> </span><span class="token token">TABLE</span><span> files </span><span class="token token punctuation">(</span><span>
</span></span><span><span>  id UUID </span><span class="token token">PRIMARY</span><span> </span><span class="token token">KEY</span><span> </span><span class="token token">DEFAULT</span><span> uuid_generate_v4</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  task_id UUID </span><span class="token token">REFERENCES</span><span> tasks</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span> </span><span class="token token">ON</span><span> </span><span class="token token">DELETE</span><span> </span><span class="token token">CASCADE</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  filename </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  file_url </span><span class="token token">TEXT</span><span> </span><span class="token token operator">NOT</span><span> </span><span class="token token boolean">NULL</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  file_type </span><span class="token token">TEXT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  file_size_bytes </span><span class="token token">BIGINT</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  uploaded_by UUID </span><span class="token token">REFERENCES</span><span> auth</span><span class="token token punctuation">.</span><span>users</span><span class="token token punctuation">(</span><span>id</span><span class="token token punctuation">)</span><span class="token token punctuation">,</span><span>
</span></span><span><span>  created_at </span><span class="token token">TIMESTAMP</span><span> </span><span class="token token">DEFAULT</span><span> </span><span class="token token">NOW</span><span class="token token punctuation">(</span><span class="token token punctuation">)</span><span>
</span></span><span><span></span><span class="token token punctuation">)</span><span class="token token punctuation">;</span><span>
</span></span><span></span></code></span></div></div></div></pre>

## 11.2 Phase 1 Features

* Upload button in task detail (Supabase Storage integration)
* File list display (name, size, uploader, date)
* Download file
* Delete file (uploader or Owner/Team Leader)

**Phase 2:** Full file management (preview, drag-and-drop, versioning)

---

## Phase 1: Sprint Planning (Updated)

## Sprint 1: Foundation (Weeks 1-2)

* [ ]  Project setup (React + Vite + Tailwind + Supabase)
* [ ]  Authentication (register, login, email verification)
* [ ]  Database schema (all tables including activity\_logs, user\_profiles)
* [ ]  RLS policies
* [ ]  Design system (colors, typography, components)
* [ ]  CI/CD pipeline

## Sprint 2: Hierarchical Structure (Weeks 3-4)

* [ ]  Agency/Workspace/Client/Project CRUD
* [ ]  RBAC implementation
* [ ]  User roles assignment
* [ ]  Navigation sidebar (workspace tree)
* [ ]  Dashboard page

## Sprint 3: Task Management + Activity Log (Weeks 5-6)

* [ ]  Task CRUD operations
* [ ]  Task assignment
* [ ]  Table View (with sorting/filtering)
* [ ]  Activity Log triggers (all automatic logging)
* [ ]  Activity Timeline UI (in task detail)

## Sprint 4: Task View Modes + Kanban (Weeks 7-8)

* [ ]  Task View Modes (Side/Center/Full)
* [ ]  Keyboard shortcuts (Cmd+1/2/3)
* [ ]  Mode persistence (save to user\_profiles)
* [ ]  Kanban Board
* [ ]  Drag-and-drop
* [ ]  Realtime sync

## Sprint 5: User Profiles + Brand Kit + Comments (Weeks 9-10)

* [ ]  User profile page (with stats)
* [ ]  Settings page (all preferences)
* [ ]  Avatar upload
* [ ]  Brand Kit form (colors, fonts, logos)
* [ ]  Brand Kit display in task sidebar
* [ ]  Comments system
* [ ]  Realtime comments

## Sprint 6: Notifications + Polish (Weeks 11-12)

* [ ]  Notification center UI
* [ ]  Notification triggers
* [ ]  Files upload infrastructure
* [ ]  Performance optimization
* [ ]  Mobile responsive testing
* [ ]  Arabic RTL fixes
* [ ]  Security audit
* [ ]  Load testing (50 concurrent users)
* [ ]  Bug fixing sprint

---

## Phase 1: Success Criteria

**At end of Month 3:**

✅ **Functional:**

* Internal team (10-15 users) using Ninja Gen Z daily instead of Notion/ClickUp
* All core workflows operational (workspace → client → project → task)
* Complete audit trail of all actions
* User profiles with preferences functional

✅ **Technical:**

* System handles 50 concurrent users, < 2s page load
* Zero P0 bugs, < 10 P1 bugs
* 99% uptime over 1-week testing
* All 3 task view modes working seamlessly

✅ **User Feedback:**

* 90%+ say "easier than previous tools"
* Task completion time reduced 20%
* "Activity log helps accountability" feedback positive

✅ **Business:**

* Platform ready for closed beta (Phase 2)
* Demo-ready for potential customers
* Foundation solid (no major refactoring needed)

---

**Phase 1 الآن كامل ومُحدّث! 🚀**

**هل تريد:**

1. نكمل Phase 2 و Phase 3؟
2. نبدأ Part 3 (Complete System Design - Database Schema + Architecture)?
3. نكتب الـ Mobile UI Specifications بالتفصيل؟
