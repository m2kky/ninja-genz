-- تأكد من الـ schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'agent_status';

-- شوف الـ data
SELECT * FROM public.agent_status;

-- لو مفيش data، أدخلها
INSERT INTO public.agent_status (agent_name, status)
VALUES 
  ('antigravity', 'idle'),
  ('trae', 'idle')
ON CONFLICT (agent_name) 
DO UPDATE SET 
  status = EXCLUDED.status,
  last_seen = NOW();
