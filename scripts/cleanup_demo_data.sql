-- ==============================================================================
-- CLEANUP SCRIPT: PURGE ALL DEMO DATA & INITIALIZE CLEAN PRODUCTION STATE
-- ==============================================================================
-- This script removes all demo tenants (Northstar, Vertex, demo staff, test orders,
-- mock inventory, demo tickets) and leaves the platform in a clean, production-ready state.

BEGIN;

-- 1. Remove non-primary or demo tenant records
DELETE FROM public.attendance_records WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.leave_requests WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.payslips WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.payroll_runs WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.onboarding_tasks WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.candidates WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.job_requisitions WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.resignation_requests WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.hardware_assets WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.expense_claims WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.helpdesk_tickets WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.kudos_feed WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.pulse_surveys WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.company_documents WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.user_invites WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.user_sessions WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.login_history WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');

DELETE FROM public.employees WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.departments WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.branches WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.users WHERE tenant_id IN ('tenant-northstar-02', 'tenant-vertex-03');
DELETE FROM public.tenants WHERE id IN ('tenant-northstar-02', 'tenant-vertex-03');

-- Record cleanup in audit log
INSERT INTO public.company_deletion_audits (
    company_id,
    company_name,
    action_type,
    requested_by_user_id,
    requested_by_email,
    requested_by_role,
    records_purged_summary,
    timestamp
) VALUES (
    'SYSTEM',
    'PLATFORM_WIDE',
    'DEMO_DATA_PURGED',
    'system-admin',
    'admin@arqhr.io',
    'super_admin',
    '{"status": "cleaned_production_state", "purgedDemoTenants": ["tenant-northstar-02", "tenant-vertex-03"]}'::jsonb,
    NOW()
);

COMMIT;
