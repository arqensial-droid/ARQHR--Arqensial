-- ==============================================================================
-- MIGRATION 20261001000001: ROW LEVEL SECURITY & MULTI-TENANT ISOLATION POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for JWT claims
CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.current_user_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_role', '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Tenants Policy: Super admins read all; tenant users only read their own tenant
CREATE POLICY tenant_isolation_tenants ON public.tenants
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR id = auth.current_tenant_id()
  );

-- Employees Policy: Strict tenant isolation
CREATE POLICY tenant_isolation_employees ON public.employees
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  )
  WITH CHECK (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );

-- Attendance Records Policy
CREATE POLICY tenant_isolation_attendance ON public.attendance_records
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );

-- Leave Requests Policy
CREATE POLICY tenant_isolation_leave ON public.leave_requests
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );

-- Payroll Runs Policy: Only payroll/company admins or super admin
CREATE POLICY tenant_isolation_payroll ON public.payroll_runs
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR (
        tenant_id = auth.current_tenant_id()
        AND auth.current_user_role() IN ('company_admin', 'payroll_manager', 'hr_manager')
    )
  );

-- Payslips Policy: Employees only access their own slip; Admins view all within tenant
CREATE POLICY tenant_isolation_payslips ON public.payslips
  FOR SELECT
  USING (
    auth.current_user_role() = 'super_admin'
    OR (
      tenant_id = auth.current_tenant_id()
      AND (
        auth.current_user_role() IN ('company_admin', 'payroll_manager', 'hr_manager')
        OR employee_id IN (
            SELECT id FROM public.employees 
            WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
        )
      )
    )
  );

-- Audit Logs Policy
CREATE POLICY tenant_isolation_audit ON public.audit_logs
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );
