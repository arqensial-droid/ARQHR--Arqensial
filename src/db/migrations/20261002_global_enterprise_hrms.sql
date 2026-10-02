-- =============================================================================
-- ARQHR Global Enterprise HRMS Platform Schema & RLS Policies
-- Migration: 20261002_global_enterprise_hrms.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COUNTRIES & REGIONAL DIRECTORY
CREATE TABLE IF NOT EXISTS public.countries (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    flag_emoji VARCHAR(10) NOT NULL,
    default_timezone VARCHAR(100) NOT NULL,
    default_date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    default_time_format VARCHAR(10) NOT NULL DEFAULT '12h',
    phone_code VARCHAR(10) NOT NULL,
    financial_year_cycle VARCHAR(50) NOT NULL,
    tax_id_label VARCHAR(100) NOT NULL,
    statutory_ident_label VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COUNTRY STATUTORY FIELDS DEFINITIONS
CREATE TABLE IF NOT EXISTS public.country_statutory_fields (
    id VARCHAR(64) PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL REFERENCES public.countries(code) ON DELETE CASCADE,
    field_key VARCHAR(64) NOT NULL,
    label VARCHAR(100) NOT NULL,
    placeholder VARCHAR(100),
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_masked BOOLEAN NOT NULL DEFAULT false,
    validation_regex TEXT,
    helper_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TENANT COUNTRY CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.tenant_country_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    country_code VARCHAR(3) NOT NULL REFERENCES public.countries(code),
    legal_company_name VARCHAR(255) NOT NULL,
    company_tax_id VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100),
    state_province VARCHAR(100),
    city VARCHAR(100),
    financial_year VARCHAR(50) NOT NULL,
    salary_cycle VARCHAR(30) NOT NULL DEFAULT 'Monthly',
    salary_payment_date INTEGER NOT NULL DEFAULT 1 CHECK (salary_payment_date BETWEEN 1 AND 31),
    weekly_working_days INTEGER NOT NULL DEFAULT 5 CHECK (weekly_working_days BETWEEN 4 AND 7),
    weekend_days JSONB NOT NULL DEFAULT '["Saturday", "Sunday"]'::jsonb,
    official_language VARCHAR(50) NOT NULL DEFAULT 'English',
    date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    time_format VARCHAR(10) NOT NULL DEFAULT '12h',
    payroll_enabled BOOLEAN NOT NULL DEFAULT true,
    attendance_enabled BOOLEAN NOT NULL DEFAULT true,
    leave_enabled BOOLEAN NOT NULL DEFAULT true,
    statutory_compliance_enabled BOOLEAN NOT NULL DEFAULT true,
    country_specific_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(64),
    CONSTRAINT uq_tenant_country UNIQUE (tenant_id, country_code)
);

-- 4. COMPANY PAYROLL SETTINGS
CREATE TABLE IF NOT EXISTS public.company_payroll_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL UNIQUE,
    salary_cycle VARCHAR(30) NOT NULL DEFAULT 'Monthly',
    payroll_cut_off_day INTEGER NOT NULL DEFAULT 25 CHECK (payroll_cut_off_day BETWEEN 1 AND 31),
    salary_processing_day INTEGER NOT NULL DEFAULT 28 CHECK (salary_processing_day BETWEEN 1 AND 31),
    salary_payment_day INTEGER NOT NULL DEFAULT 1 CHECK (salary_payment_day BETWEEN 1 AND 31),
    attendance_lock_day INTEGER NOT NULL DEFAULT 26 CHECK (attendance_lock_day BETWEEN 1 AND 31),
    leave_lock_day INTEGER NOT NULL DEFAULT 25 CHECK (leave_lock_day BETWEEN 1 AND 31),
    payroll_divisor VARCHAR(30) NOT NULL DEFAULT 'Calendar Days',
    custom_divisor_days INTEGER CHECK (custom_divisor_days BETWEEN 1 AND 31),
    grace_period_minutes INTEGER NOT NULL DEFAULT 15,
    late_mark_rule JSONB NOT NULL DEFAULT '{"enabled": true, "maxLateAllowedPerMonth": 3, "actionAfterThreshold": "Half Day LOP", "lopDaysPerExcessLate": 0.5}'::jsonb,
    half_day_threshold_hours NUMERIC(4,2) NOT NULL DEFAULT 4.5,
    overtime_rule JSONB NOT NULL DEFAULT '{"enabled": true, "rateMultiplier": 1.5, "minMinutesForOvertime": 60}'::jsonb,
    lop_rule JSONB NOT NULL DEFAULT '{"enabled": true, "deductFromGross": true}'::jsonb,
    weekend_rule JSONB NOT NULL DEFAULT '{"isPaid": true}'::jsonb,
    holiday_rule JSONB NOT NULL DEFAULT '{"isPaid": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMPLOYEE DIGITAL ID CARDS
CREATE TABLE IF NOT EXISTS public.employee_id_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    employee_id VARCHAR(64) NOT NULL,
    emp_code VARCHAR(32) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    photo_url TEXT NOT NULL,
    blood_group VARCHAR(10),
    joining_date DATE NOT NULL,
    work_location VARCHAR(150) NOT NULL,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(50),
    validity_date DATE NOT NULL,
    qr_verification_token VARCHAR(128) NOT NULL UNIQUE,
    verified_status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (verified_status IN ('Active', 'Revoked', 'Expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_emp_id_card UNIQUE (tenant_id, employee_id)
);

-- 6. EMPLOYEE SECURE BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS public.employee_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    employee_id VARCHAR(64) NOT NULL UNIQUE,
    account_holder_name VARCHAR(150) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    masked_account_number VARCHAR(30) NOT NULL,
    routing_or_ifsc_code VARCHAR(50) NOT NULL,
    routing_label VARCHAR(50) NOT NULL DEFAULT 'Routing Code',
    branch_name VARCHAR(100),
    account_type VARCHAR(30) NOT NULL DEFAULT 'Salary',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Direct Deposit',
    upi_id VARCHAR(100),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    country_code VARCHAR(3) NOT NULL REFERENCES public.countries(code),
    is_verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ATTENDANCE PAYROLL SUMMARIES
CREATE TABLE IF NOT EXISTS public.attendance_payroll_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    employee_id VARCHAR(64) NOT NULL,
    payroll_period VARCHAR(30) NOT NULL,
    total_month_days INTEGER NOT NULL,
    payable_days NUMERIC(5,2) NOT NULL,
    present_days INTEGER NOT NULL DEFAULT 0,
    paid_leave_days NUMERIC(4,2) NOT NULL DEFAULT 0,
    unpaid_leave_days NUMERIC(4,2) NOT NULL DEFAULT 0,
    absent_days NUMERIC(4,2) NOT NULL DEFAULT 0,
    half_days INTEGER NOT NULL DEFAULT 0,
    late_marks_count INTEGER NOT NULL DEFAULT 0,
    late_penalty_lop_days NUMERIC(4,2) NOT NULL DEFAULT 0,
    holidays_count INTEGER NOT NULL DEFAULT 0,
    week_offs_count INTEGER NOT NULL DEFAULT 0,
    wfh_days INTEGER NOT NULL DEFAULT 0,
    overtime_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
    total_lop_days NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_prorated BOOLEAN NOT NULL DEFAULT false,
    prorate_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_emp_period_summary UNIQUE (tenant_id, employee_id, payroll_period)
);

-- 8. EXTENDED PAYROLL ITEMS
CREATE TABLE IF NOT EXISTS public.payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    payroll_run_id VARCHAR(64) NOT NULL,
    employee_id VARCHAR(64) NOT NULL,
    payslip_id VARCHAR(64),
    item_category VARCHAR(20) NOT NULL CHECK (item_category IN ('Earning', 'Deduction', 'EmployerContribution', 'Reimbursement')),
    item_name VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_statutory BOOLEAN NOT NULL DEFAULT false,
    is_taxable BOOLEAN NOT NULL DEFAULT true,
    formula_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tenant_country_configs_tenant ON public.tenant_country_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_bank_accounts_tenant_emp ON public.employee_bank_accounts(tenant_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_id_cards_token ON public.employee_id_cards(qr_verification_token);
CREATE INDEX IF NOT EXISTS idx_attendance_payroll_summaries_lookup ON public.attendance_payroll_summaries(tenant_id, employee_id, payroll_period);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON public.payroll_items(tenant_id, payroll_run_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.tenant_country_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_payroll_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

-- Helper to check tenant match
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('app.current_tenant_id', true),
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenant_id')
  );
$$ LANGUAGE sql STABLE;

-- Tenant Country Config Policy
CREATE POLICY "Tenant isolation for country configs"
ON public.tenant_country_configs
FOR ALL
USING (tenant_id = public.current_tenant_id());

-- Company Payroll Settings Policy
CREATE POLICY "Tenant isolation for payroll settings"
ON public.company_payroll_settings
FOR ALL
USING (tenant_id = public.current_tenant_id());

-- ID Cards: Visible to users in same tenant, limited verification token accessible
CREATE POLICY "Tenant isolation for employee ID cards"
ON public.employee_id_cards
FOR ALL
USING (tenant_id = public.current_tenant_id());

-- Bank Details: STRICT RBAC (Owner, Payroll Manager, Company Admin only)
CREATE POLICY "Strict employee bank details access"
ON public.employee_bank_accounts
FOR ALL
USING (
  tenant_id = public.current_tenant_id()
  AND (
    employee_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    OR (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') IN ('company_admin', 'payroll_manager', 'hr_manager', 'super_admin')
  )
);

-- Attendance Payroll Summaries: Tenant isolation
CREATE POLICY "Tenant isolation for attendance summaries"
ON public.attendance_payroll_summaries
FOR ALL
USING (tenant_id = public.current_tenant_id());

-- Payroll items isolation
CREATE POLICY "Tenant isolation for payroll items"
ON public.payroll_items
FOR ALL
USING (tenant_id = public.current_tenant_id());
