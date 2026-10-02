-- ==============================================================================
-- ARQHR ENTERPRISE MIGRATION: 20261001_enterprise_audit_migration.sql
-- Production Indian Statutory Compliance, Workflow Engine, AI Intelligence, and SaaS Licensing
-- ==============================================================================

-- 1. INDIA STATUTORY CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.statutory_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    epf_enabled BOOLEAN NOT NULL DEFAULT true,
    epf_wage_limit NUMERIC(10,2) NOT NULL DEFAULT 15000.00,
    epf_employee_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    epf_employer_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    epf_edli_rate NUMERIC(5,2) NOT NULL DEFAULT 0.50,
    epf_admin_rate NUMERIC(5,2) NOT NULL DEFAULT 0.50,
    esic_enabled BOOLEAN NOT NULL DEFAULT true,
    esic_wage_limit NUMERIC(10,2) NOT NULL DEFAULT 21000.00,
    esic_employee_rate NUMERIC(5,2) NOT NULL DEFAULT 0.75,
    esic_employer_rate NUMERIC(5,2) NOT NULL DEFAULT 3.25,
    state_pt_code VARCHAR(10) NOT NULL DEFAULT 'MH',
    lwf_enabled BOOLEAN NOT NULL DEFAULT true,
    gratuity_enabled BOOLEAN NOT NULL DEFAULT true,
    bonus_act_rate NUMERIC(5,2) NOT NULL DEFAULT 8.33,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_statutory_configs_tenant UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_statutory_configs_tenant ON public.statutory_configs(tenant_id);

-- 2. EMPLOYEE TAX REGIME DECLARATIONS (OLD vs NEW REGIME)
CREATE TABLE IF NOT EXISTS public.tax_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    financial_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    chosen_regime VARCHAR(10) NOT NULL DEFAULT 'New' CHECK (chosen_regime IN ('Old', 'New')),
    section_80c NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    section_80d NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    nps_80ccd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    hra_rent_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    home_loan_interest NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    other_income NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Verified', 'Locked')),
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tax_declarations_emp_fy UNIQUE (tenant_id, employee_id, financial_year)
);

CREATE INDEX IF NOT EXISTS idx_tax_declarations_tenant_emp ON public.tax_declarations(tenant_id, employee_id);

-- 3. STATUTORY CHALLANS & ECR RETURNS (PF, ESIC, PT, TDS)
CREATE TABLE IF NOT EXISTS public.statutory_challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    challan_type VARCHAR(50) NOT NULL CHECK (challan_type IN ('EPF_ECR', 'ESIC_MONTHLY', 'PT_CHALLAN', 'TDS_24Q')),
    total_employees_covered INT NOT NULL DEFAULT 0,
    total_wages NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    employee_contribution NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    employer_contribution NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_challan_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    trn_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Generated', 'Submitted_To_Portal', 'Paid')),
    file_payload TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statutory_challans_tenant_month ON public.statutory_challans(tenant_id, month);

-- 4. MULTI-TIER APPROVAL WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.workflow_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    workflow_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    approval_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_rules_tenant_type ON public.workflow_rules(tenant_id, workflow_type);

-- 5. SALARY REVISIONS & ARREARS WORKFLOW
CREATE TABLE IF NOT EXISTS public.salary_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    current_ctc NUMERIC(14,2) NOT NULL,
    proposed_ctc NUMERIC(14,2) NOT NULL,
    percentage_hike NUMERIC(6,2) NOT NULL,
    effective_date DATE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    arrears_applicable BOOLEAN NOT NULL DEFAULT false,
    arrears_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending_Manager', 'Pending_HR', 'Pending_Finance', 'Approved', 'Implemented', 'Rejected')),
    approvals_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salary_revisions_tenant_emp ON public.salary_revisions(tenant_id, employee_id);

-- 6. PROMOTIONS & TRANSFERS WORKFLOW
CREATE TABLE IF NOT EXISTS public.employee_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    current_designation VARCHAR(100) NOT NULL,
    current_department VARCHAR(100) NOT NULL,
    proposed_designation VARCHAR(100) NOT NULL,
    proposed_department VARCHAR(100) NOT NULL,
    new_salary_ctc NUMERIC(14,2) NOT NULL,
    effective_date DATE NOT NULL,
    justification TEXT,
    manager_sign_off BOOLEAN NOT NULL DEFAULT false,
    hr_sign_off BOOLEAN NOT NULL DEFAULT false,
    vp_sign_off BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending_Approval' CHECK (status IN ('Pending_Approval', 'Approved', 'Completed', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_promotions_tenant ON public.employee_promotions(tenant_id);

-- 7. AI CANDIDATE RESUME SCREENING & EMBEDDINGS
CREATE TABLE IF NOT EXISTS public.candidate_ai_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
    overall_match_score NUMERIC(5,2) NOT NULL,
    skills_match_score NUMERIC(5,2) NOT NULL,
    experience_match_score NUMERIC(5,2) NOT NULL,
    education_match_score NUMERIC(5,2) NOT NULL,
    key_strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendation VARCHAR(50) NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_ai_screenings_tenant ON public.candidate_ai_screenings(tenant_id, candidate_id);

-- 8. AI ATTRITION RISK PROFILES
CREATE TABLE IF NOT EXISTS public.attrition_risk_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    tenure_months INT NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    top_drivers JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_retention_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attrition_risk_tenant ON public.attrition_risk_profiles(tenant_id, risk_level);

-- 9. AI PAYROLL ANOMALY DETECTIONS
CREATE TABLE IF NOT EXISTS public.payroll_anomaly_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'Warning', 'Info')),
    description TEXT NOT NULL,
    variance_percentage NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    suggested_resolution TEXT,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_anomaly_tenant ON public.payroll_anomaly_logs(tenant_id, resolved);

-- 10. SAAS TENANT SEAT & STORAGE USAGE METERS
CREATE TABLE IF NOT EXISTS public.tenant_usage_meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    active_licenses INT NOT NULL DEFAULT 0,
    allocated_licenses INT NOT NULL DEFAULT 50,
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,
    storage_quota_bytes BIGINT NOT NULL DEFAULT 107374182400, -- 100 GB
    api_requests_this_month INT NOT NULL DEFAULT 0,
    api_monthly_limit INT NOT NULL DEFAULT 100000,
    custom_domain_configured BOOLEAN NOT NULL DEFAULT false,
    white_label_settings JSONB NOT NULL DEFAULT '{"primaryColor": "#4F46E5", "brandName": "ARQHR"}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_usage_meters_tenant UNIQUE (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_usage_meters_tenant ON public.tenant_usage_meters(tenant_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR NEW ENTERPRISE AUDIT TABLES
-- ==============================================================================

-- Enable RLS on all enterprise tables
ALTER TABLE public.statutory_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statutory_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_ai_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attrition_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_anomaly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_usage_meters ENABLE ROW LEVEL SECURITY;

-- 1. Statutory Configs RLS (Only HR Manager, Payroll Manager, Company Admin, Super Admin)
CREATE POLICY "tenant_statutory_configs_read" ON public.statutory_configs
    FOR SELECT USING (
        tenant_id = auth.current_tenant_id() OR auth.current_user_role() = 'super_admin'
    );

CREATE POLICY "tenant_statutory_configs_manage" ON public.statutory_configs
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'payroll_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 2. Tax Declarations RLS (Employees view/edit own; Payroll/HR view tenant)
CREATE POLICY "tenant_tax_declarations_emp_access" ON public.tax_declarations
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()))
        OR (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'hr_manager', 'payroll_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 3. Statutory Challans RLS (Only Payroll & Company Admin)
CREATE POLICY "tenant_statutory_challans_policy" ON public.statutory_challans
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'payroll_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 4. Workflow Rules RLS (Tenant isolation)
CREATE POLICY "tenant_workflow_rules_policy" ON public.workflow_rules
    FOR ALL USING (
        tenant_id = auth.current_tenant_id() OR auth.current_user_role() = 'super_admin'
    );

-- 5. Salary Revisions RLS (Strict isolation: HR/Finance/Admin and specific Approvers)
CREATE POLICY "tenant_salary_revisions_policy" ON public.salary_revisions
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'hr_manager', 'payroll_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 6. Promotions RLS
CREATE POLICY "tenant_employee_promotions_policy" ON public.employee_promotions
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'hr_manager', 'manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 7. AI Candidate Screenings RLS
CREATE POLICY "tenant_candidate_ai_screenings_policy" ON public.candidate_ai_screenings
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'hr_manager', 'recruiter'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 8. Attrition Risk Profiles RLS
CREATE POLICY "tenant_attrition_risk_policy" ON public.attrition_risk_profiles
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'hr_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 9. Payroll Anomaly Logs RLS
CREATE POLICY "tenant_payroll_anomaly_policy" ON public.payroll_anomaly_logs
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin', 'payroll_manager'))
        OR auth.current_user_role() = 'super_admin'
    );

-- 10. Tenant Usage Meters RLS
CREATE POLICY "tenant_usage_meters_policy" ON public.tenant_usage_meters
    FOR ALL USING (
        (tenant_id = auth.current_tenant_id() AND auth.current_user_role() IN ('company_admin'))
        OR auth.current_user_role() = 'super_admin'
    );
