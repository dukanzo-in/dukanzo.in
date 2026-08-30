-- Table to track Baileys WhatsApp connection status
CREATE TABLE public.whatsapp_connection (
    id TEXT PRIMARY KEY DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    phone_number TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to store Baileys authentication state (keys, creds)
CREATE TABLE public.whatsapp_auth_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.whatsapp_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_auth_state ENABLE ROW LEVEL SECURITY;

-- Only service role can access auth state. NO PUBLIC ACCESS.
CREATE POLICY "Service role full access to auth_state"
ON public.whatsapp_auth_state
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Only service role can access connection. NO PUBLIC ACCESS.
CREATE POLICY "Service role full access to connection"
ON public.whatsapp_connection
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create a single default row for the connection
INSERT INTO public.whatsapp_connection (id, status) VALUES ('default', 'NOT_CONNECTED');
