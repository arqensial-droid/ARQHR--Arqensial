-- ==============================================================================
-- MIGRATION 20261001000000: INITIAL ARQHR MULTI-TENANT SCHEMA
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
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

-- Users & Roles table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'super_admin', 'company_admin', 'hr_manager', 'team_leader', 
        'manager', 'employee', 'payroll_manager', 'recruiter'
    )),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    head_employee_id UUID,
    head_employee_name VARCHAR(200),
    employee_count INT DEFAULT 0,
    annual_budget_cents BIGINT DEFAULT 0,
    location VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_dept_code UNIQUE (tenant_id, code)
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    emp_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    department_name VARCHAR(150),
    designation VARCHAR(150) NOT NULL,
    reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    reporting_manager_name VARCHAR(200),
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-Time',
    joining_date DATE NOT NULL,
    exit_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Probation', 'Notice', 'Terminated')),
    location VARCHAR(150) DEFAULT 'Headquarters',
    work_shift VARCHAR(100) DEFAULT 'General Day Shift (9 AM - 6 PM)',
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    
    bank_details JSONB DEFAULT '{}'::jsonb,
    salary_structure JSONB DEFAULT '{}'::jsonb,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, emp_code)
);

-- Attendance Records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(200),
    emp_code VARCHAR(50),
    record_date DATE NOT NULL,
    check_in_time VARCHAR(20) NOT NULL,
    check_out_time VARCHAR(20),
    duration_hours NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Late', 'Half Day', 'Absent', 'On Leave', 'Holiday')),
    check_in_method VARCHAR(50) NOT NULL CHECK (check_in_method IN ('Web', 'Mobile', 'Biometric', 'Selfie')),
    location JSONB DEFAULT '{}'::jsonb,
    is_wfh BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    selfie_url TEXT,
    regularization_requested BOOLEAN DEFAULT FALSE,
    regularization_reason TEXT,
    regularization_status VARCHAR(50) CHECK (regularization_status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_attendance_date UNIQUE (tenant_id, employee_id, record_date)
);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(200),
    emp_code VARCHAR(50),
    department VARCHAR(150),
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    half_day BOOLEAN DEFAULT FALSE,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by VARCHAR(200),
    applied_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    manager_comment TEXT
);

-- Payroll Runs table
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    month VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_gross NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_net NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_employees INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processed', 'Locked', 'Disbursed')),
    processed_at TIMESTAMPTZ,
    disbursed_at TIMESTAMPTZ,
    processed_by VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payslips table
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(200) NOT NULL,
    emp_code VARCHAR(50) NOT NULL,
    designation VARCHAR(150),
    department VARCHAR(150),
    joining_date DATE,
    pan_number VARCHAR(50),
    uan_number VARCHAR(50),
    bank_account VARCHAR(100),
    bank_name VARCHAR(150),
    month VARCHAR(100) NOT NULL,
    days_worked INT NOT NULL DEFAULT 30,
    days_lop INT NOT NULL DEFAULT 0,
    basic NUMERIC(12,2) NOT NULL,
    hra NUMERIC(12,2) NOT NULL,
    special_allowance NUMERIC(12,2) NOT NULL,
    conveyance NUMERIC(12,2) NOT NULL,
    performance_bonus NUMERIC(12,2) NOT NULL,
    gross_earnings NUMERIC(12,2) NOT NULL,
    pf_deduction NUMERIC(12,2) NOT NULL,
    esi_deduction NUMERIC(12,2) NOT NULL,
    pt_deduction NUMERIC(12,2) NOT NULL,
    tds_deduction NUMERIC(12,2) NOT NULL,
    total_deductions NUMERIC(12,2) NOT NULL,
    net_payable NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Generated', 'Disbursed')),
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    action VARCHAR(200) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resource_type VARCHAR(100) NOT NULL,
    details TEXT
);
