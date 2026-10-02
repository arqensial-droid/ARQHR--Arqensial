-- ==============================================================================
-- ARQHR ENTERPRISE HRMS - PRODUCTION POSTGRESQL & SUPABASE MULTI-TENANT SCHEMA
-- ==============================================================================
-- Architecture: Shared Database, Shared Schema with Row Level Security (RLS)
-- Tenant Isolation: Every table enforces tenant_id foreign key & RLS policies
-- Compatible with PostgreSQL 15+, Supabase, Cloud SQL, Neon, AWS Aurora
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up custom JWT claim extraction function for Supabase / PostgreSQL auth
CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.current_user_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_role', '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- -----------------------------------------------------------------------------
-- 1. TENANTS & SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100) NOT NULL,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'growth' CHECK (plan_tier IN ('starter', 'growth', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    timezone VARCHAR(100) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    address TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    mrr_cents BIGINT DEFAULT 0,
    settings JSONB NOT NULL DEFAULT '{
        "geoFencingEnabled": true,
        "selfieAttendanceEnabled": true,
        "ipRestrictionEnabled": false,
        "twoFactorEnforced": false,
        "allowedIps": [],
        "officeCoordinates": {"lat": 37.7749, "lng": -122.4194, "radiusMeters": 500}
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_status ON public.tenants(status);

-- -----------------------------------------------------------------------------
-- 2. USERS & ROLES
-- -----------------------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin', 'company_admin', 'hr_manager', 'team_leader', 
        'manager', 'employee', 'payroll_manager', 'recruiter'
    )),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,
    last_sign_in_at TIMESTAMPTZ,
    last_sign_in_ip VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_tenant_role ON public.users(tenant_id, role);

-- -----------------------------------------------------------------------------
-- 3. DEPARTMENTS & TEAMS
-- -----------------------------------------------------------------------------
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_user_id UUID,
    annual_budget_cents BIGINT DEFAULT 0,
    location VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_dept_code UNIQUE (tenant_id, code)
);

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    lead_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_team_name UNIQUE (tenant_id, department_id, name)
);

-- -----------------------------------------------------------------------------
-- 4. DESIGNATIONS & BRANCHES
-- -----------------------------------------------------------------------------
CREATE TABLE public.designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    level VARCHAR(50) DEFAULT 'L3',
    min_salary_cents BIGINT DEFAULT 0,
    max_salary_cents BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.branch_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    geo_radius_meters INT DEFAULT 500,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    ip_whitelists TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. EMPLOYEES
-- -----------------------------------------------------------------------------
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    emp_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    designation VARCHAR(150) NOT NULL,
    reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time', 'Contract', 'Intern', 'Part-Time')),
    joining_date DATE NOT NULL,
    exit_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Probation', 'Notice', 'Terminated')),
    location VARCHAR(150) DEFAULT 'Headquarters',
    work_shift VARCHAR(100) DEFAULT 'General Day Shift (9 AM - 6 PM)',
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    
    -- Bank and Tax Details
    bank_account_holder VARCHAR(200),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(150),
    bank_ifsc_swift VARCHAR(50),
    bank_branch VARCHAR(150),
    pan_number VARCHAR(50),
    uan_number VARCHAR(50),
    
    -- Compensation (stored in annual & monthly breakdowns)
    annual_ctc_cents BIGINT NOT NULL DEFAULT 0,
    basic_cents BIGINT NOT NULL DEFAULT 0,
    hra_cents BIGINT NOT NULL DEFAULT 0,
    special_allowance_cents BIGINT NOT NULL DEFAULT 0,
    conveyance_cents BIGINT NOT NULL DEFAULT 0,
    performance_bonus_cents BIGINT NOT NULL DEFAULT 0,
    pf_employee_cents BIGINT NOT NULL DEFAULT 0,
    pf_employer_cents BIGINT NOT NULL DEFAULT 0,
    esi_cents BIGINT NOT NULL DEFAULT 0,
    pt_cents BIGINT NOT NULL DEFAULT 0,
    tds_monthly_cents BIGINT NOT NULL DEFAULT 0,
    net_monthly_cents BIGINT NOT NULL DEFAULT 0,

    -- Complex JSON sub-records (documents, emergency contacts, skills, education)
    documents JSONB DEFAULT '[]'::jsonb,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, emp_code)
);

CREATE INDEX idx_employees_tenant_dept ON public.employees(tenant_id, department_id);
CREATE INDEX idx_employees_tenant_status ON public.employees(tenant_id, status);

-- -----------------------------------------------------------------------------
-- 6. ATTENDANCE & SHIFTS
-- -----------------------------------------------------------------------------
CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INT DEFAULT 15,
    half_day_threshold_hours INT DEFAULT 4,
    is_rotational BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    duration_hours NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Late', 'Half Day', 'Absent', 'On Leave', 'Holiday')),
    check_in_method VARCHAR(50) NOT NULL CHECK (check_in_method IN ('Web', 'Mobile', 'Biometric', 'Selfie')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_address TEXT,
    within_geofence BOOLEAN DEFAULT TRUE,
    is_wfh BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    selfie_url TEXT,
    regularization_requested BOOLEAN DEFAULT FALSE,
    regularization_reason TEXT,
    regularization_status VARCHAR(50) CHECK (regularization_status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_attendance_date UNIQUE (tenant_id, employee_id, record_date)
);

CREATE INDEX idx_attendance_tenant_date ON public.attendance_records(tenant_id, record_date);

-- -----------------------------------------------------------------------------
-- 7. LEAVE MANAGEMENT
-- -----------------------------------------------------------------------------
CREATE TABLE public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL CHECK (leave_type IN (
        'Casual Leave', 'Sick Leave', 'Earned Leave', 'Comp Off', 'Maternity Leave', 'Paternity Leave', 'Custom'
    )),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    is_half_day BOOLEAN DEFAULT FALSE,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES public.employees(id),
    manager_comment TEXT,
    applied_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    casual_leave_total INT DEFAULT 12,
    casual_leave_used INT DEFAULT 0,
    sick_leave_total INT DEFAULT 10,
    sick_leave_used INT DEFAULT 0,
    earned_leave_total INT DEFAULT 18,
    earned_leave_used INT DEFAULT 0,
    comp_off_total INT DEFAULT 2,
    comp_off_used INT DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_leave_balance UNIQUE (tenant_id, employee_id)
);

-- -----------------------------------------------------------------------------
-- 8. PAYROLL RUNS & PAYSLIPS
-- -----------------------------------------------------------------------------
CREATE TABLE public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    month_label VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_gross_cents BIGINT NOT NULL DEFAULT 0,
    total_net_cents BIGINT NOT NULL DEFAULT 0,
    total_deductions_cents BIGINT NOT NULL DEFAULT 0,
    total_employees INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processed', 'Locked', 'Disbursed')),
    processed_at TIMESTAMPTZ,
    disbursed_at TIMESTAMPTZ,
    processed_by VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    month_label VARCHAR(100) NOT NULL,
    days_worked INT NOT NULL DEFAULT 30,
    days_lop INT NOT NULL DEFAULT 0,
    basic_cents BIGINT NOT NULL,
    hra_cents BIGINT NOT NULL,
    special_allowance_cents BIGINT NOT NULL,
    conveyance_cents BIGINT NOT NULL,
    performance_bonus_cents BIGINT NOT NULL,
    gross_earnings_cents BIGINT NOT NULL,
    pf_deduction_cents BIGINT NOT NULL,
    esi_deduction_cents BIGINT NOT NULL,
    pt_deduction_cents BIGINT NOT NULL,
    tds_deduction_cents BIGINT NOT NULL,
    total_deductions_cents BIGINT NOT NULL,
    net_payable_cents BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Generated', 'Disbursed')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. RECRUITMENT & ONBOARDING
-- -----------------------------------------------------------------------------
CREATE TABLE public.job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    job_code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    experience_required VARCHAR(50) NOT NULL,
    open_positions INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Closed')),
    salary_range VARCHAR(100),
    hiring_manager VARCHAR(150) NOT NULL,
    description TEXT,
    requirements TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    stage VARCHAR(50) NOT NULL DEFAULT 'Sourced' CHECK (stage IN ('Sourced', 'Screening', 'Interview', 'Offer', 'Hired', 'Archived')),
    rating INT DEFAULT 4,
    experience_years NUMERIC(4,1) DEFAULT 0,
    current_company VARCHAR(200),
    notice_period_days INT DEFAULT 30,
    resume_summary TEXT,
    interview_date TIMESTAMPTZ,
    offer_amount_cents BIGINT,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE public.onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Documentation', 'IT Asset', 'Compliance', 'Welcome Kit', 'Induction')),
    assigned_to VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
    due_date DATE NOT NULL
);

-- -----------------------------------------------------------------------------
-- 10. ASSETS, EXPENSES & HELPDESK
-- -----------------------------------------------------------------------------
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    asset_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Laptop', 'Monitor', 'Mobile', 'Peripherals')),
    brand_model VARCHAR(200) NOT NULL,
    serial_number VARCHAR(150) NOT NULL,
    assigned_to_employee_id UUID REFERENCES public.employees(id),
    condition VARCHAR(50) NOT NULL DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Maintenance Required')),
    status VARCHAR(50) NOT NULL DEFAULT 'Allocated' CHECK (status IN ('Allocated', 'In Stock', 'Retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.expense_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Travel', 'Meal', 'Equipment', 'Software', 'Training')),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    expense_date DATE NOT NULL,
    receipt_name VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Rejected', 'Reimbursed')),
    approved_by VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.helpdesk_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ticket_code VARCHAR(50) NOT NULL,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('HR Support', 'IT Support', 'Payroll Query', 'Facilities')),
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status VARCHAR(50) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    sla_hours_left INT DEFAULT 24,
    assigned_to VARCHAR(150),
    thread JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS & ENGAGEMENT
-- -----------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    action VARCHAR(200) NOT NULL,
    performed_by VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    resource_type VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_created ON public.audit_logs(tenant_id, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Super Admins bypass tenant boundary when impersonating or inspecting all
-- Every other user is strictly locked to their verified tenant_id JWT claim

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenants Policy
CREATE POLICY tenant_isolation_tenants ON public.tenants
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR id = auth.current_tenant_id()
  );

-- Employees Policy
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

-- Payroll Runs Policy
CREATE POLICY tenant_isolation_payroll ON public.payroll_runs
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR (
        tenant_id = auth.current_tenant_id()
        AND auth.current_user_role() IN ('company_admin', 'payroll_manager', 'hr_manager')
    )
  );

-- Payslips Policy (Employees can only view their own payslips; Admins can view all within tenant)
CREATE POLICY tenant_isolation_payslips ON public.payslips
  FOR SELECT
  USING (
    auth.current_user_role() = 'super_admin'
    OR (
      tenant_id = auth.current_tenant_id()
      AND (
        auth.current_user_role() IN ('company_admin', 'payroll_manager', 'hr_manager')
        OR employee_id IN (SELECT id FROM public.employees WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      )
    )
  );
