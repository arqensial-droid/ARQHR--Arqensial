-- ==============================================================================
-- MIGRATION 20261002000000: MULTI-TENANT ENTERPRISE AUTH, INVITES, SESSIONS & RLS
-- ==============================================================================

-- 1. Helper functions for JWT claims extraction
CREATE OR REPLACE FUNCTION auth.jwt_tenant_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id',
    current_setting('request.jwt.claims', true)::json->>'tenant_id'
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.jwt_user_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->>'user_role'
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.is_super_admin() RETURNS BOOLEAN AS $$
  SELECT auth.jwt_user_role() = 'super_admin';
$$ LANGUAGE SQL STABLE;

-- 2. User Invites Table
CREATE TABLE IF NOT EXISTS public.user_invites (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  department_id TEXT,
  department_name TEXT,
  designation_id TEXT,
  designation_title TEXT,
  branch_location TEXT,
  token TEXT NOT NULL UNIQUE,
  otp_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'expired', 'revoked'
  invited_by TEXT NOT NULL,
  invited_by_name TEXT NOT NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookup on token and tenant
CREATE INDEX IF NOT EXISTS idx_user_invites_token ON public.user_invites(token);
CREATE INDEX IF NOT EXISTS idx_user_invites_tenant_email ON public.user_invites(tenant_id, email);

-- Enable RLS on user_invites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- User Invites RLS Policy
CREATE POLICY user_invites_tenant_isolation ON public.user_invites
  FOR ALL
  USING (
    auth.is_super_admin()
    OR tenant_id = auth.jwt_tenant_id()
  )
  WITH CHECK (
    auth.is_super_admin()
    OR (
      tenant_id = auth.jwt_tenant_id()
      AND auth.jwt_user_role() IN ('company_admin', 'hr_manager')
    )
  );

-- 3. Active User Sessions Table (Device & IP Tracking)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  device_type TEXT NOT NULL,
  device_name TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  location TEXT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_tenant ON public.user_sessions(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip ON public.user_sessions(ip_address);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- User Sessions RLS Policy
CREATE POLICY user_sessions_isolation ON public.user_sessions
  FOR ALL
  USING (
    auth.is_super_admin()
    OR (
      tenant_id = auth.jwt_tenant_id()
      AND (
        auth.jwt_user_role() = 'company_admin'
        OR user_id = auth.uid()::TEXT
        OR user_email = auth.email()
      )
    )
  );

-- 4. Login History & Threat Monitoring Table
CREATE TABLE IF NOT EXISTS public.login_history (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tenant_name TEXT,
  user_id TEXT,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  device TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'otp_required', 'blocked'
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_tenant_created ON public.login_history(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON public.login_history(email);

-- Enable RLS on login_history
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Login History RLS Policy
CREATE POLICY login_history_isolation ON public.login_history
  FOR ALL
  USING (
    auth.is_super_admin()
    OR (
      tenant_id = auth.jwt_tenant_id()
      AND (
        auth.jwt_user_role() IN ('company_admin', 'hr_manager')
        OR email = auth.email()
      )
    )
  );

-- 5. Enhanced Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL, -- 'authentication', 'rbac', 'tenant', 'security', 'compliance'
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_tenant_action ON public.security_audit_logs(tenant_id, action, created_at DESC);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Security Audit Logs RLS Policy: Immutable; insert allowed, select scoped to company_admin or super_admin
CREATE POLICY security_audit_logs_select ON public.security_audit_logs
  FOR SELECT
  USING (
    auth.is_super_admin()
    OR (
      tenant_id = auth.jwt_tenant_id()
      AND auth.jwt_user_role() IN ('company_admin', 'hr_manager')
    )
  );

CREATE POLICY security_audit_logs_insert ON public.security_audit_logs
  FOR INSERT
  WITH CHECK (
    auth.is_super_admin()
    OR tenant_id = auth.jwt_tenant_id()
  );
