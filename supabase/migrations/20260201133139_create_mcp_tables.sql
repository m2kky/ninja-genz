-- Migration: Create MCP Server Tables
-- Created: 2026-02-01
-- Author: Trae (Backend Agent)

-- =====================================================
-- 1. Agent Status Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL UNIQUE CHECK (agent_name IN ('antigravity', 'trae')),
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'blocked')),
  current_task TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. Handoffs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.handoffs (
  id TEXT PRIMARY KEY,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- 3. Agent Status Log (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.agent_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  task TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 4. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_handoffs_to_agent ON public.handoffs(to_agent);
CREATE INDEX IF NOT EXISTS idx_handoffs_status ON public.handoffs(status);
CREATE INDEX IF NOT EXISTS idx_handoffs_created_at ON public.handoffs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_log_agent ON public.agent_status_log(agent_name);
CREATE INDEX IF NOT EXISTS idx_status_log_timestamp ON public.agent_status_log(timestamp DESC);

-- =====================================================
-- 5. Enable Realtime
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.handoffs;

-- =====================================================
-- 6. Initialize Agent Records
-- =====================================================
INSERT INTO public.agent_status (agent_name, status) VALUES 
  ('antigravity', 'idle'),
  ('trae', 'idle')
ON CONFLICT (agent_name) DO NOTHING;

-- =====================================================
-- 7. Triggers for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_status_updated_at BEFORE UPDATE ON public.agent_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_handoffs_updated_at BEFORE UPDATE ON public.handoffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. Enable RLS
-- =====================================================
ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_status_log ENABLE ROW LEVEL SECURITY;

-- Simple policies for now (authenticated access)
CREATE POLICY "Allow authenticated access to agent_status" ON public.agent_status FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to handoffs" ON public.handoffs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access to agent_status_log" ON public.agent_status_log FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 9. Comments
-- =====================================================
COMMENT ON TABLE public.agent_status IS 'Tracks the current operational status of AI agents';
COMMENT ON TABLE public.handoffs IS 'Manages task handoffs between different agents';
COMMENT ON TABLE public.agent_status_log IS 'Audit trail of all agent status changes';
