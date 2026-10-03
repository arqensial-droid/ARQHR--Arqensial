import {
  Tenant,
  Department,
  Designation,
  BranchLocation,
  Shift,
  Holiday,
  Team,
  SubscriptionPlan,
  Employee,
} from '../../types';

export const ROOT_PLATFORM_NAME = 'ARQENSIAL';
export const ROOT_SUPERADMIN_TENANT_ID = 'tenant-arqensial-root';

export const SUPER_ADMIN_PERMISSIONS = [
  'Full System Control',
  'Create Company',
  'Edit Company',
  'Delete Company',
  'Suspend Company',
  'Activate Company',
  'Manage Users',
  'Manage Roles',
  'Manage Permissions',
  'Manage Subscription Plans',
  'Manage Billing',
  'View All Companies',
  'View All Data',
  'Delete Any Record',
  'Access Audit Logs',
  'System Settings Access',
  'Database Management Access',
] as const;

// Fallback System Root Tenant (Used only for Super Admin Root session when 0 companies exist)
export const ROOT_SYSTEM_TENANT: Tenant = {
  id: ROOT_SUPERADMIN_TENANT_ID,
  name: 'ARQENSIAL',
  slug: 'arqensial',
  domain: 'arqensial.io',
  logo: 'AQ',
  industry: 'Enterprise ERP Platform',
  companyCode: 'ROOT',
  employeeCount: 0,
  status: 'active',
  timezone: 'Asia/Kolkata (IST)',
  currency: 'INR (₹)',
  currencySymbol: '₹',
  address: 'ARQENSIAL Enterprise Headquarters, Mumbai',
  contactEmail: 'admin@arqensial.com',
  contactPhone: '+91 22 6123 4500',
  mrr: 0,
  createdAt: '2026-01-01T00:00:00Z',
  settings: {
    attendanceEnabled: true,
    leaveEnabled: true,
    payrollEnabled: true,
    forcePasswordChangeOnFirstLogin: false,
    geoFencingEnabled: true,
    selfieAttendanceEnabled: true,
    ipRestrictionEnabled: false,
    twoFactorEnforced: true,
    allowedIps: [],
    officeCoordinates: { lat: 19.0657, lng: 72.8687, radiusMeters: 500 },
  },
};

// Root Super Admin User Account
export const ROOT_SUPER_ADMIN_USER: Employee = {
  id: 'usr-arqensial-root',
  tenantId: ROOT_SUPERADMIN_TENANT_ID,
  empCode: 'ROOT-001',
  firstName: 'Super',
  lastName: 'Admin',
  fullName: 'Super Admin',
  email: 'admin@arqensial.com',
  phone: '+91 22 6123 4500',
  departmentId: 'dept-root',
  departmentName: 'Root Administration',
  department: 'Root Administration',
  designation: 'Root System Administrator',
  role: 'super_admin',
  joiningDate: '2026-01-01',
  dateOfJoining: '2026-01-01',
  workShift: 'Root 24x7',
  employmentType: 'Full-Time',
  status: 'Active',
  location: 'ARQENSIAL HQ',
  gender: 'Other',
  dob: '1990-01-01',
  bloodGroup: 'O+',
  address: 'ARQENSIAL Enterprise Headquarters, Mumbai',
  emergencyContact: '+91 22 6123 4500',
  documents: [],
  emergencyContacts: [],
  skills: ['Full System Control', 'Root Administration', 'Platform Security'],
  experience: [],
  education: [],
  notes: [],
  bankDetails: {
    accountHolder: 'Super Admin',
    accountNumber: 'N/A',
    bankName: 'Corporate Treasury',
    ifscSwift: 'N/A',
    branch: 'ARQENSIAL HQ',
    panNumber: 'N/A',
    uanNumber: 'N/A',
  },
  salaryStructure: {
    annualCTC: 0,
    monthlyGross: 0,
    basic: 0,
    hra: 0,
    specialAllowance: 0,
    conveyance: 0,
    performanceBonus: 0,
    pfEmployee: 0,
    pfEmployer: 0,
    esi: 0,
    professionalTax: 0,
    tdsMonthly: 0,
    netMonthly: 0,
  },
};

// Aliases for any legacy references
export const TENANT_ARQENSIAL_ID = ROOT_SUPERADMIN_TENANT_ID;
export const TENANT_NORTHSTAR_ID = 'tenant-none';
export const TENANT_VERTEX_ID = 'tenant-none';
export const TENANT_VASTRA_ID = 'tenant-none';

// Completely empty production state: Zero demo companies or departments
export const PRODUCTION_INITIAL_TENANTS: Tenant[] = [];
export const PRODUCTION_BRANCHES: BranchLocation[] = [];
export const PRODUCTION_DEPARTMENTS: Department[] = [];
export const PRODUCTION_DESIGNATIONS: Designation[] = [];
export const PRODUCTION_TEAMS: Team[] = [];
export const PRODUCTION_SHIFTS: Shift[] = [];
export const PRODUCTION_HOLIDAYS: Holiday[] = [];

// Available Subscription Plans to assign when creating companies
export const PRODUCTION_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    pricePerUserMonthly: 499,
    maxUsers: 25,
    features: ['Employee Directory', 'Attendance & Shifts', 'Leave Approvals', 'Basic Payroll'],
    storageLimit: '50 GB',
    supportLevel: 'Standard Support',
  },
  {
    id: 'growth',
    name: 'Professional Plan',
    pricePerUserMonthly: 999,
    maxUsers: 100,
    features: ['Complete HRMS Core', 'Multi-tier Payroll & Tax', 'Biometric & Geofencing', 'Document Vault', 'Audit Logs'],
    storageLimit: '250 GB',
    supportLevel: 'Priority 24/7 Support',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    pricePerUserMonthly: 1999,
    maxUsers: 999999,
    features: ['Unlimited Staff', 'Dedicated Multi-Tenant Isolation', 'Custom Roles & RLS', 'Full ERP Suite', 'API Integrations'],
    storageLimit: 'Unlimited',
    supportLevel: 'Dedicated Account Manager',
  },
];
