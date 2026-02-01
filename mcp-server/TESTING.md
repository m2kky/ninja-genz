# 🧪 MCP Server Testing Guide - Pre-Phase 2 Verification

## Overview
قبل ما Antigravity يبدأ Phase 2، يجب اختبار MCP Server اللي Trae عمله للتأكد إنه شغال 100%.

---

## ⚠️ IMPORTANT: Prerequisites

### 1. Supabase Configuration Required
Trae's server لن يشتغل بدون Supabase credentials!

**Action Required by Trae:**

```bash
cd mcp-server
# Edit .env file and add your Supabase credentials
nano .env  # or use any text editor
```

**Required in .env:**

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
```

**Get these from:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your Ninja Gen Z project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`

---

## 🎯 Testing Plan

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 1A** | 5 min | Database Verification |
| **Phase 1B** | 5 min | Server Startup |
| **Phase 1C** | 5 min | Health Checks |
| **Phase 1D** | 10 min | Manual Connection Test |
| **Phase 1E** | 10 min | Database Integration Test |
| **Total** | **~35 minutes** | |

---

## 📋 PHASE 1A: Database Verification

### Objective
تأكد إن الـ Database schema اتنشر صح في Supabase.

### Steps

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **Navigate to Table Editor**
   - Click "Table Editor" في الـ sidebar

3. **Verify Tables Exist**
   
   يجب أن تشاهد 3 جداول:

   | Table Name | Rows | Status |
   |------------|------|--------|
   | `agent_status` | 2 | ✅ Should exist |
   | `handoffs` | 0 | ✅ Should exist |
   | `agent_status_log` | 0 | ✅ Should exist |

4. **Check agent_status Data**
   
   افتح جدول `agent_status`، يجب يكون فيه:

   | agent_name | status | current_task | last_seen |
   |------------|--------|--------------|-----------|
   | antigravity | idle | null | (timestamp) |
   | trae | idle | null | (timestamp) |

5. **Verify Realtime**
   - اضغط على أي جدول
   - اضغط "..." menu → "View table details"
   - في قسم "Realtime", تأكد إن الـ toggle **ON** ✅

### Expected Result
- ✅ All 3 tables exist
- ✅ `agent_status` has 2 rows
- ✅ Realtime enabled on `agent_status` and `handoffs`

### If Failed

**❌ Tables don't exist:** Run the migration manually:
```sql
-- Go to Supabase SQL Editor and paste the contents of:
-- supabase/migrations/20260201133139_create_mcp_tables.sql
```

**❌ Realtime not enabled:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE agent_status;
ALTER PUBLICATION supabase_realtime ADD TABLE handoffs;
```

---

## 📋 PHASE 1B: Server Startup Test

### Objective
تأكد إن الـ MCP Server يشتغل بدون أخطاء.

### Steps

1. **Navigate to mcp-server directory**
   ```bash
   cd d:/Codes_Projects/ninja-genz/mcp-server
   ```

2. **Verify .env exists and has credentials**
   ```bash
   # Windows PowerShell
   Get-Content .env
   
   # Expected output (with actual values):
   # PORT=3000
   # NODE_ENV=development
   # SUPABASE_URL=https://xxx.supabase.co
   # SUPABASE_ANON_KEY=ey...
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

### Expected Output

```
> mcp-server@1.0.0 dev
> tsx watch src/server.ts

✅ Supabase client initialized

============================================================
🎯 NINJA GEN Z - MCP SERVER OPERATIONAL
============================================================
📍 Server URL: http://localhost:3000
🔗 SSE Endpoint: http://localhost:3000/mcp/sse
💚 Health Check: http://localhost:3000/health
📊 Status: http://localhost:3000/mcp/status
============================================================

⏳ Waiting for agents to connect...
```

### Possible Errors & Solutions

**❌ Error: Missing Supabase environment variables**
```
Solution: Create .env file with Supabase credentials
```

**❌ Error: Port 3000 already in use**
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart: npm run dev
```

**❌ Error: Cannot find module '@modelcontextprotocol/sdk'**
```bash
npm install
npm run dev
```

**❌ Error: TypeScript compilation errors**
```bash
npm run build
# Fix any errors shown, then:
npm run dev
```

### Success Criteria
- ✅ Server starts without errors
- ✅ Shows "NINJA GEN Z - MCP SERVER OPERATIONAL"
- ✅ No red error messages
- ✅ Console shows "Waiting for agents to connect..."

---

## 📋 PHASE 1C: Health Check Tests

### Objective
تأكد إن الـ endpoints بتاعة السيرفر شغالة.

**Keep server running from Phase 1B**

### Test 1: Health Endpoint

Open new terminal/PowerShell window (leave server running)

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "server": "ninja-genz-mcp-hub",
  "version": "1.0.0",
  "timestamp": "2026-02-01T11:37:00.000Z",
  "connectedAgents": [],
  "totalConnections": 0
}
```

### Test 2: Status Endpoint

```bash
curl http://localhost:3000/mcp/status
```

**Expected Response:**
```json
{
  "agents": [
    {
      "id": "uuid-here",
      "agent_name": "antigravity",
      "status": "idle",
      "current_task": null,
      "last_seen": "2026-02-01T11:33:00.000Z"
    },
    {
      "id": "uuid-here",
      "agent_name": "trae",
      "status": "idle",
      "current_task": null,
      "last_seen": "2026-02-01T11:33:00.000Z"
    }
  ],
  "connected": []
}
```

### Test 3: Invalid Endpoint (Should 404)

```bash
curl http://localhost:3000/invalid
```

**Expected:** HTML 404 error page (this is OK)

### Success Criteria
- ✅ `/health` returns status "ok"
- ✅ `/mcp/status` returns 2 agents (antigravity, trae)
- ✅ Both agents show status "idle"
- ✅ `connectedAgents` array is empty (normal, no clients connected yet)

### If Failed

**❌ Connection refused:**
- Server not running → Go back to Phase 1B
- Wrong port → Check `.env` PORT value

**❌ /mcp/status returns empty agents array:**
- Database not seeded → Run insert statements from migration file

---

## 📋 PHASE 1D: Manual Connection Test

### Objective
محاكاة agent connection يدوياً باستخدام curl.

### Test: SSE Connection Attempt

```bash
# This will keep connection open - press Ctrl+C to stop after 5 seconds
curl -N -H "X-Agent-Name: test-agent" http://localhost:3000/mcp/sse
```

**Expected Behavior:**
1. Command hangs (connection stays open) - هذا طبيعي!
2. Check server logs, يجب تشوف:
   ```
   📡 Agent "test-agent" attempting to connect...
   ❌ Connection error for agent "test-agent": [error about invalid agent name]
   ```
3. Press Ctrl+C to stop

> This error is EXPECTED because "test-agent" is not in the allowed list.

### Test with Valid Agent Name

```bash
curl -N -H "X-Agent-Name: antigravity" http://localhost:3000/mcp/sse
```

**Expected in server logs:**
```
📡 Agent "antigravity" attempting to connect...
✅ Agent "antigravity" connected successfully
📊 Total connected agents: 1
```

**In curl terminal:** Connection stays open, showing:
```
event: endpoint
data: /mcp/messages
```

Press Ctrl+C to disconnect

**Expected in server logs:**
```
👋 Agent "antigravity" disconnected
📊 Remaining agents: 0
```

### Verify in Database

```bash
curl http://localhost:3000/mcp/status
```

Check `last_seen` timestamp for antigravity - should be updated!

### Success Criteria
- ✅ Server accepts connection with valid agent name
- ✅ Server rejects connection with invalid agent name
- ✅ Server logs show connection/disconnection events
- ✅ Database `agent_status` updates on connection
- ✅ Clean disconnection when Ctrl+C pressed

---

## 📋 PHASE 1E: Database Integration Test

### Objective
تأكد إن السيرفر يقدر يكتب ويقرأ من Supabase بنجاح.

### Test 1: Manual Database Insert

Open Supabase SQL Editor:

```sql
-- Insert a test handoff
INSERT INTO handoffs (
  id,
  from_agent,
  to_agent,
  priority,
  title,
  description,
  status
) VALUES (
  'HANDOFF-TEST-001',
  'antigravity',
  'trae',
  'high',
  'Test Database Integration',
  'Testing if server can read from database',
  'pending'
);

-- Verify insert
SELECT * FROM handoffs WHERE id = 'HANDOFF-TEST-001';
```

**Expected:** 1 row returned with your data

### Test 2: Verify Server Can Query

```bash
curl http://localhost:3000/mcp/status
```

الـ response مش هيجيب الـ handoffs (مش implemented بعد), بس المهم إنه مايديش error.

### Test 3: Clean Up

```sql
-- Remove test data
DELETE FROM handoffs WHERE id = 'HANDOFF-TEST-001';
```

### Test 4: Status Update Simulation

```sql
-- Simulate agent status change
UPDATE agent_status 
SET 
  status = 'working',
  current_task = 'Testing MCP Server',
  last_seen = NOW()
WHERE agent_name = 'trae';

-- Verify
SELECT * FROM agent_status WHERE agent_name = 'trae';
```

**Expected:** Status should be 'working' now

Check via API:
```bash
curl http://localhost:3000/mcp/status
```

Should show trae as "working"!

Reset:
```sql
UPDATE agent_status 
SET status = 'idle', current_task = NULL
WHERE agent_name = 'trae';
```

### Success Criteria
- ✅ Can insert into `handoffs` table
- ✅ Can query `agent_status` via API
- ✅ Can update `agent_status`
- ✅ Changes reflect in API responses
- ✅ No database connection errors

---

## ✅ FINAL CHECKLIST

Before declaring MCP Server ready for Phase 2:

### Database
- [ ] All 3 tables exist in Supabase
- [ ] `agent_status` has 2 rows (antigravity, trae)
- [ ] Realtime enabled on `agent_status` and `handoffs`
- [ ] Can insert/update/query successfully

### Server
- [ ] Server starts without errors
- [ ] Shows "MCP SERVER OPERATIONAL" message
- [ ] No TypeScript compilation errors
- [ ] Supabase client initializes successfully

### Endpoints
- [ ] `/health` returns status "ok"
- [ ] `/mcp/status` returns 2 agents
- [ ] `/mcp/sse` accepts connections (tested with curl)
- [ ] CORS headers present

### Connection Tests
- [ ] Accepts connection from valid agent (antigravity/trae)
- [ ] Rejects connection from invalid agent
- [ ] Logs connection/disconnection events
- [ ] Updates `agent_status.last_seen` on connection

---

## 🚀 READY FOR PHASE 2?

If all checkboxes above are ✅, then:

- ✅ MCP Server is VERIFIED and READY
- ✅ Antigravity can proceed with Phase 2
- ✅ No blockers remaining

---

## 📝 Create Test Report

After testing, Trae should create `.ai-agents/trae/test-reports/phase1-verification.md`:

```markdown
# Phase 1 MCP Server Verification Report

**Date**: 2026-02-01  
**Tester**: Trae  
**Duration**: 35 minutes

## Database Tests
- ✅ All tables exist
- ✅ Initial data seeded
- ✅ Realtime enabled
- ✅ Insert/update operations working

## Server Tests
- ✅ Server starts successfully
- ✅ No compilation errors
- ✅ Supabase connection established
- ✅ All endpoints responding

## Connection Tests
- ✅ SSE endpoint accepting connections
- ✅ Agent validation working
- ✅ Connection logging functional
- ✅ Clean disconnection handling

## Conclusion
✅ MCP Server is **PRODUCTION READY** for Phase 2.  
✅ Antigravity can proceed with client implementation.

## Server Info
- URL: http://localhost:3000
- Status: Operational
- Uptime: Stable
- Ready for agent connections
```

---

## 🎯 WHAT TO DO NOW

### For Trae:
1. Run all tests from this document (35 min)
2. Fix any issues if tests fail
3. Create test report in `.ai-agents/trae/test-reports/`
4. Update handoff to Antigravity confirming all tests passed
5. Keep server running for Antigravity's Phase 2

### For Antigravity:
**WAIT** until Trae confirms:
- ✅ All tests passed
- ✅ Server is running
- ✅ Ready for client connections

Then proceed with Phase 2.

---

**Testing Time**: 35-45 minutes  
**Importance**: 🔴 CRITICAL - Don't skip this!  
**Next Step**: Phase 2 (after all tests pass)
