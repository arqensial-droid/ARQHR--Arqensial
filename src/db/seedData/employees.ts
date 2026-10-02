import {
  Employee,
  SalaryStructure,
  BankDetails,
  UserRole,
  DigitalIdCard,
  EmployeeBankAccount,
  ActivityTimelineItem,
} from '../../types';
import { TENANT_ARQENSIAL_ID, TENANT_NORTHSTAR_ID, TENANT_VERTEX_ID, TENANT_VASTRA_ID } from './company';

function createSalary(ctc: number): SalaryStructure {
  const monthlyGross = Math.round(ctc / 12);
  const basic = Math.round(monthlyGross * 0.5);
  const hra = Math.round(basic * 0.4);
  const conveyance = 1600;
  const specialAllowance = Math.max(0, monthlyGross - basic - hra - conveyance);
  const pfEmployee = Math.round(Math.min(basic, 15000) * 0.12);
  const pfEmployer = pfEmployee;
  const esi = monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0;
  const professionalTax = 200;
  const annualTax = ctc > 700000 ? Math.round((ctc - 700000) * 0.1) : 0;
  const tdsMonthly = Math.round(annualTax / 12);
  const netMonthly = monthlyGross - pfEmployee - esi - professionalTax - tdsMonthly;

  return {
    annualCTC: ctc,
    monthlyGross,
    basic,
    hra,
    specialAllowance,
    conveyance,
    performanceBonus: Math.round(ctc * 0.08),
    pfEmployee,
    pfEmployer,
    esi,
    professionalTax,
    tdsMonthly,
    netMonthly,
  };
}

interface RawEmployee {
  id: string;
  code: string;
  first: string;
  last: string;
  email: string;
  phone: string;
  deptId: string;
  deptName: string;
  designation: string;
  role: UserRole;
  managerId?: string;
  managerName?: string;
  branch: 'Mumbai HQ' | 'Mira Road Office';
  ctc: number;
  joinDate: string;
  pan: string;
  skills: string[];
}

const RAW_EMPLOYEES: RawEmployee[] = [
  { id: 'emp-01', code: 'AQ-1001', first: 'Rajesh', last: 'Sharma', email: 'rajesh.sharma@arqensial.com', phone: '+91 98201 12345', deptId: 'dept-dev', deptName: 'Development', designation: 'CEO', role: 'company_admin', branch: 'Mumbai HQ', ctc: 4800000, joinDate: '2022-01-10', pan: 'ABFPS1234A', skills: ['Executive Leadership', 'System Architecture', 'Strategy'] },
  { id: 'emp-02', code: 'AQ-1002', first: 'Priya', last: 'Nair', email: 'priya.nair@arqensial.com', phone: '+91 98202 23456', deptId: 'dept-accounts', deptName: 'Accounts', designation: 'Operations Manager', role: 'manager', managerId: 'emp-01', managerName: 'Rajesh Sharma', branch: 'Mumbai HQ', ctc: 1800000, joinDate: '2022-03-15', pan: 'BCDPN2345B', skills: ['Operations Management', 'Vendor Relations', 'Financial Auditing'] },
  { id: 'emp-03', code: 'AQ-1003', first: 'Vikram', last: 'Malhotra', email: 'vikram.malhotra@arqensial.com', phone: '+91 98203 34567', deptId: 'dept-dev', deptName: 'Development', designation: 'Senior Team Leader', role: 'team_leader', managerId: 'emp-01', managerName: 'Rajesh Sharma', branch: 'Mumbai HQ', ctc: 1650000, joinDate: '2022-04-01', pan: 'CDEVM3456C', skills: ['React', 'Node.js', 'System Architecture', 'Cloud Services'] },
  { id: 'emp-04', code: 'AQ-1004', first: 'Sneha', last: 'Kulkarni', email: 'sneha.kulkarni@arqensial.com', phone: '+91 98204 45678', deptId: 'dept-uiux', deptName: 'UI/UX', designation: 'Team Leader', role: 'team_leader', managerId: 'emp-01', managerName: 'Rajesh Sharma', branch: 'Mumbai HQ', ctc: 1400000, joinDate: '2022-05-12', pan: 'DEFSM4567D', skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'] },
  { id: 'emp-05', code: 'AQ-1005', first: 'Rohan', last: 'Deshmukh', email: 'rohan.deshmukh@arqensial.com', phone: '+91 98205 56789', deptId: 'dept-seo', deptName: 'SEO', designation: 'Team Leader', role: 'team_leader', managerId: 'emp-02', managerName: 'Priya Nair', branch: 'Mira Road Office', ctc: 1250000, joinDate: '2022-06-20', pan: 'EFGRD5678E', skills: ['Technical SEO', 'Schema Markup', 'Ahrefs', 'Core Web Vitals'] },
  { id: 'emp-06', code: 'AQ-1006', first: 'Ananya', last: 'Iyer', email: 'ananya.iyer@arqensial.com', phone: '+91 98206 67890', deptId: 'dept-hr', deptName: 'HR', designation: 'HR Executive', role: 'hr_manager', managerId: 'emp-01', managerName: 'Rajesh Sharma', branch: 'Mumbai HQ', ctc: 850000, joinDate: '2022-07-01', pan: 'FGHAI6789F', skills: ['Talent Acquisition', 'HR Policies', 'Statutory Compliance', 'Employee Engagement'] },
  { id: 'emp-07', code: 'AQ-1007', first: 'Aditya', last: 'Verma', email: 'aditya.verma@arqensial.com', phone: '+91 98207 78901', deptId: 'dept-dev', deptName: 'Development', designation: 'Web Developer', role: 'employee', managerId: 'emp-03', managerName: 'Vikram Malhotra', branch: 'Mumbai HQ', ctc: 950000, joinDate: '2022-08-15', pan: 'GHIJV7890G', skills: ['TypeScript', 'Next.js', 'PostgreSQL', 'Tailwind CSS'] },
  { id: 'emp-08', code: 'AQ-1008', first: 'Pooja', last: 'Patil', email: 'pooja.patil@arqensial.com', phone: '+91 98208 89012', deptId: 'dept-dev', deptName: 'Development', designation: 'Web Developer', role: 'employee', managerId: 'emp-03', managerName: 'Vikram Malhotra', branch: 'Mira Road Office', ctc: 900000, joinDate: '2022-09-01', pan: 'HIJKP8901H', skills: ['Vue.js', 'Express', 'Docker', 'REST APIs'] },
  { id: 'emp-09', code: 'AQ-1009', first: 'Amit', last: 'Trivedi', email: 'amit.trivedi@arqensial.com', phone: '+91 98209 90123', deptId: 'dept-dev', deptName: 'Development', designation: 'Web Developer', role: 'employee', managerId: 'emp-03', managerName: 'Vikram Malhotra', branch: 'Mumbai HQ', ctc: 850000, joinDate: '2022-10-10', pan: 'IJKLT9012I', skills: ['React', 'Redux', 'Microservices', 'Git'] },
  { id: 'emp-10', code: 'AQ-1010', first: 'Neha', last: 'Gupta', email: 'neha.gupta@arqensial.com', phone: '+91 98210 01234', deptId: 'dept-dev', deptName: 'Development', designation: 'Web Developer', role: 'employee', managerId: 'emp-03', managerName: 'Vikram Malhotra', branch: 'Mira Road Office', ctc: 800000, joinDate: '2022-11-15', pan: 'JKLNG0123J', skills: ['Fullstack JavaScript', 'GraphQL', 'MongoDB', 'AWS'] },
  { id: 'emp-11', code: 'AQ-1011', first: 'Kunal', last: 'Joshi', email: 'kunal.joshi@arqensial.com', phone: '+91 98211 12345', deptId: 'dept-uiux', deptName: 'UI/UX', designation: 'UI Designer', role: 'employee', managerId: 'emp-04', managerName: 'Sneha Kulkarni', branch: 'Mumbai HQ', ctc: 750000, joinDate: '2023-01-05', pan: 'KLMOJ1234K', skills: ['UI Design', 'Wireframing', 'Illustrator', 'Design Tokens'] },
  { id: 'emp-12', code: 'AQ-1012', first: 'Riya', last: 'Sen', email: 'riya.sen@arqensial.com', phone: '+91 98212 23456', deptId: 'dept-uiux', deptName: 'UI/UX', designation: 'UI Designer', role: 'employee', managerId: 'emp-04', managerName: 'Sneha Kulkarni', branch: 'Mira Road Office', ctc: 700000, joinDate: '2023-02-20', pan: 'LMNOP2345L', skills: ['Visual Design', 'Mobile App UI', 'Interaction Design'] },
  { id: 'emp-13', code: 'AQ-1013', first: 'Sameer', last: 'Khan', email: 'sameer.khan@arqensial.com', phone: '+91 98213 34567', deptId: 'dept-seo', deptName: 'SEO', designation: 'SEO Executive', role: 'employee', managerId: 'emp-05', managerName: 'Rohan Deshmukh', branch: 'Mira Road Office', ctc: 600000, joinDate: '2023-03-01', pan: 'MNOPK3456M', skills: ['On-Page SEO', 'Keyword Research', 'Google Analytics', 'Backlinks'] },
  { id: 'emp-14', code: 'AQ-1014', first: 'Divya', last: 'Menon', email: 'divya.menon@arqensial.com', phone: '+91 98214 45678', deptId: 'dept-seo', deptName: 'SEO', designation: 'SEO Executive', role: 'employee', managerId: 'emp-05', managerName: 'Rohan Deshmukh', branch: 'Mumbai HQ', ctc: 580000, joinDate: '2023-04-10', pan: 'NOPMD4567N', skills: ['Competitor Analysis', 'Site Audit', 'Google Search Console'] },
  { id: 'emp-15', code: 'AQ-1015', first: 'Arjun', last: 'Rampal', email: 'arjun.rampal@arqensial.com', phone: '+91 98215 56789', deptId: 'dept-mktg', deptName: 'Digital Marketing', designation: 'Senior Team Leader', role: 'team_leader', managerId: 'emp-02', managerName: 'Priya Nair', branch: 'Mumbai HQ', ctc: 1500000, joinDate: '2023-05-01', pan: 'OPQRA5678O', skills: ['PPC Ads', 'Google Ads', 'Meta Ads', 'Funnel Optimization'] },
  { id: 'emp-16', code: 'AQ-1016', first: 'Kavita', last: 'Rao', email: 'kavita.rao@arqensial.com', phone: '+91 98216 67890', deptId: 'dept-mktg', deptName: 'Digital Marketing', designation: 'Sales Executive', role: 'employee', managerId: 'emp-15', managerName: 'Arjun Rampal', branch: 'Mumbai HQ', ctc: 650000, joinDate: '2023-06-15', pan: 'PQRKR6789P', skills: ['Inbound Lead Nurturing', 'CRM Management', 'Campaign Analytics'] },
  { id: 'emp-17', code: 'AQ-1017', first: 'Rahul', last: 'Mehta', email: 'rahul.mehta@arqensial.com', phone: '+91 98217 78901', deptId: 'dept-content', deptName: 'Content', designation: 'Content Writer', role: 'employee', managerId: 'emp-02', managerName: 'Priya Nair', branch: 'Mumbai HQ', ctc: 620000, joinDate: '2023-07-01', pan: 'QRSMR7890Q', skills: ['Technical Copywriting', 'SEO Articles', 'Case Studies', 'Press Releases'] },
  { id: 'emp-18', code: 'AQ-1018', first: 'Shweta', last: 'Tiwari', email: 'shweta.tiwari@arqensial.com', phone: '+91 98218 89012', deptId: 'dept-content', deptName: 'Content', designation: 'Content Writer', role: 'employee', managerId: 'emp-17', managerName: 'Rahul Mehta', branch: 'Mira Road Office', ctc: 520000, joinDate: '2023-08-01', pan: 'RSTST8901R', skills: ['Social Media Copy', 'Email Newsletters', 'Blog Writing'] },
  { id: 'emp-19', code: 'AQ-1019', first: 'Tanvi', last: 'Agarwal', email: 'tanvi.agarwal@arqensial.com', phone: '+91 98219 90123', deptId: 'dept-content', deptName: 'Content', designation: 'Content Writer', role: 'employee', managerId: 'emp-17', managerName: 'Rahul Mehta', branch: 'Mumbai HQ', ctc: 500000, joinDate: '2023-09-10', pan: 'STUAT9012S', skills: ['Creative Writing', 'Video Scripting', 'Content Strategy'] },
  { id: 'emp-20', code: 'AQ-1020', first: 'Manoj', last: 'Pandey', email: 'manoj.pandey@arqensial.com', phone: '+91 98220 01234', deptId: 'dept-hr', deptName: 'HR', designation: 'HR Executive', role: 'employee', managerId: 'emp-06', managerName: 'Ananya Iyer', branch: 'Mira Road Office', ctc: 550000, joinDate: '2023-10-05', pan: 'TUVPM0123T', skills: ['Employee Onboarding', 'Leave Management', 'Statutory Records'] },
  { id: 'emp-21', code: 'AQ-1021', first: 'Siddharth', last: 'Singhania', email: 'siddharth.singhania@arqensial.com', phone: '+91 98221 12345', deptId: 'dept-sales', deptName: 'Sales', designation: 'Sales Executive', role: 'employee', managerId: 'emp-01', managerName: 'Rajesh Sharma', branch: 'Mumbai HQ', ctc: 920000, joinDate: '2023-11-01', pan: 'UVWSS1234U', skills: ['B2B Sales', 'Key Account Management', 'Enterprise Proposals'] },
  { id: 'emp-22', code: 'AQ-1022', first: 'Meera', last: 'Chawla', email: 'meera.chawla@arqensial.com', phone: '+91 98222 23456', deptId: 'dept-sales', deptName: 'Sales', designation: 'Sales Executive', role: 'employee', managerId: 'emp-21', managerName: 'Siddharth Singhania', branch: 'Mumbai HQ', ctc: 720000, joinDate: '2023-12-01', pan: 'VWXCM2345V', skills: ['Client Demos', 'Contract Negotiation', 'Lead Pipeline'] },
  { id: 'emp-23', code: 'AQ-1023', first: 'Varun', last: 'Bhatt', email: 'varun.bhatt@arqensial.com', phone: '+91 98223 34567', deptId: 'dept-sales', deptName: 'Sales', designation: 'Sales Executive', role: 'employee', managerId: 'emp-21', managerName: 'Siddharth Singhania', branch: 'Mira Road Office', ctc: 680000, joinDate: '2024-01-15', pan: 'WXYBV3456W', skills: ['Cold Outreach', 'Client Follow-ups', 'CRM Reporting'] },
  { id: 'emp-24', code: 'AQ-1024', first: 'Sunita', last: 'Hegde', email: 'sunita.hegde@arqensial.com', phone: '+91 98224 45678', deptId: 'dept-accounts', deptName: 'Accounts', designation: 'Senior Team Leader', role: 'payroll_manager', managerId: 'emp-02', managerName: 'Priya Nair', branch: 'Mumbai HQ', ctc: 1450000, joinDate: '2022-02-01', pan: 'XYZHS4567X', skills: ['TallyPrime', 'Payroll Processing', 'GST Filings', 'TDS & ECR'] },
  { id: 'emp-25', code: 'AQ-1025', first: 'Deepak', last: 'Nambiar', email: 'deepak.nambiar@arqensial.com', phone: '+91 98225 56789', deptId: 'dept-accounts', deptName: 'Accounts', designation: 'Operations Manager', role: 'employee', managerId: 'emp-24', managerName: 'Sunita Hegde', branch: 'Mira Road Office', ctc: 980000, joinDate: '2024-02-10', pan: 'YZAND5678Y', skills: ['Invoicing', 'Bank Reconciliation', 'Expense Audit'] },
];

export const ARQENSIAL_EMPLOYEES: Employee[] = RAW_EMPLOYEES.map((raw, idx) => {
  const bankNames = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'];
  const bankName = bankNames[idx % bankNames.length];
  const branchName = raw.branch === 'Mumbai HQ' ? 'BKC Branch' : 'Mira Road East Branch';
  const ifsc = raw.branch === 'Mumbai HQ' ? 'HDFC0000123' : 'ICIC0004567';
  const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-'];
  const bloodGroup = bloodGroups[idx % bloodGroups.length];
  const accNum = `50100${12345678 + idx}`;
  const maskedAcc = `•••• •••• ${accNum.slice(-4)}`;

  const bankDetails: BankDetails = {
    accountHolder: `${raw.first} ${raw.last}`,
    accountNumber: accNum,
    bankName,
    ifscSwift: ifsc,
    branch: branchName,
    panNumber: raw.pan,
    uanNumber: `10098765${4320 + idx}`,
  };

  const bankAccountDetails: EmployeeBankAccount = {
    id: `bank-${raw.id}`,
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: raw.id,
    accountHolderName: `${raw.first} ${raw.last}`,
    bankName,
    accountNumber: accNum,
    maskedAccountNumber: maskedAcc,
    routingOrIfscOrSortCode: ifsc,
    routingLabel: 'IFSC Code',
    branchName,
    accountType: 'Salary',
    paymentMethod: 'NEFT/RTGS',
    upiId: `${raw.first.toLowerCase()}@okhdfcbank`,
    currency: 'INR',
    countryCode: 'IN',
    isVerified: true,
    updatedAt: raw.joinDate,
  };

  const idCard: DigitalIdCard = {
    id: `idcard-${raw.id}`,
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: raw.id,
    employeeName: `${raw.first} ${raw.last}`,
    empCode: raw.code,
    designation: raw.designation,
    department: raw.deptName,
    photoUrl: '',
    companyName: 'Arqensial Technologies Pvt Ltd',
    companyLogo: 'AQ',
    bloodGroup,
    joiningDate: raw.joinDate,
    workLocation: raw.branch,
    emergencyContact: `${raw.last} Family`,
    emergencyPhone: `+91 99200 ${11100 + idx}`,
    validityDate: '2028-12-31',
    qrVerificationToken: `AQ-VERIFY-${raw.code}-2026`,
    verifiedStatus: 'Active',
  };

  const activityTimeline: ActivityTimelineItem[] = [
    { id: `act-${raw.id}-1`, timestamp: `${raw.joinDate} 09:30`, type: 'Joined', title: 'Joined Arqensial Technologies', description: `Welcomed into ${raw.deptName} team as ${raw.designation}.`, actor: 'Ananya Iyer (HR)', badge: 'Onboarding' },
    { id: `act-${raw.id}-2`, timestamp: '2024-04-01 10:00', type: 'Salary Revised', title: 'Annual Compensation Increment', description: 'Annual appraisal increment finalized and reflected in payroll system.', actor: 'Rajesh Sharma (CEO)', badge: 'Compensation' },
    { id: `act-${raw.id}-3`, timestamp: '2026-09-20 14:00', type: 'Asset Assigned', title: 'Corporate Workstation Hardware Tagged', description: 'Assigned official IT hardware asset and access badges.', actor: 'IT Helpdesk BKC', badge: 'IT Asset' },
  ];

  return {
    id: raw.id,
    tenantId: TENANT_ARQENSIAL_ID,
    empCode: raw.code,
    firstName: raw.first,
    lastName: raw.last,
    fullName: `${raw.first} ${raw.last}`,
    email: raw.email,
    phone: raw.phone,
    countryCode: 'IN',
    departmentId: raw.deptId,
    departmentName: raw.deptName,
    designation: raw.designation,
    reportingManagerId: raw.managerId,
    reportingManagerName: raw.managerName,
    employmentType: 'Full-Time',
    joiningDate: raw.joinDate,
    status: 'Active',
    location: raw.branch,
    workShift: raw.branch === 'Mumbai HQ' ? 'Mumbai Day Shift (Regular)' : 'Mira Road Shift',
    role: raw.role,
    bloodGroup,
    idCard,
    bankAccountDetails,
    activityTimeline,
    statutoryData: {
      pan: raw.pan,
      uan: `10098765${4320 + idx}`,
      esic: `3100123456000100${idx + 1}`,
      ptState: 'Maharashtra',
    },
    documents: [
      { id: `doc-pan-${raw.id}`, name: 'PAN Card Copy', type: 'ID Proof', uploadedAt: raw.joinDate, status: 'Verified', fileSize: '1.2 MB' },
      { id: `doc-aadhaar-${raw.id}`, name: 'Aadhaar Card Copy', type: 'ID Proof', uploadedAt: raw.joinDate, status: 'Verified', fileSize: '1.4 MB' },
      { id: `doc-offer-${raw.id}`, name: 'Signed Appointment Letter', type: 'Offer Letter', uploadedAt: raw.joinDate, status: 'Verified', fileSize: '850 KB' },
    ],
    bankDetails,
    salaryStructure: createSalary(raw.ctc),
    emergencyContacts: [
      { name: `${raw.last} Family`, relation: 'Parent / Spouse', phone: `+91 99200 ${11100 + idx}` }
    ],
    skills: raw.skills,
    experience: [
      { company: 'Premier Tech Solutions Mumbai', role: raw.designation, duration: '2 Years', description: 'Handled key deliverables in digital and technology domains.' }
    ],
    education: [
      { degree: 'Bachelor of Engineering / Science', institution: 'University of Mumbai', year: '2020', grade: 'First Class with Distinction' }
    ],
    notes: [
      { id: `note-${raw.id}-1`, author: 'HR Operations', date: raw.joinDate, text: 'Completed background verification and document onboarding with clear status.' }
    ],
  };
});

// Northstar (US) Demo Employees
export const NORTHSTAR_EMPLOYEES: Employee[] = [
  {
    id: 'emp-ns-01',
    tenantId: TENANT_NORTHSTAR_ID,
    empCode: 'ND-1001',
    firstName: 'David',
    lastName: 'Miller',
    fullName: 'David Miller',
    email: 'david.miller@northstardigital.io',
    phone: '+1 (212) 555-0144',
    countryCode: 'US',
    departmentId: 'dept-ns-eng',
    departmentName: 'Engineering',
    designation: 'VP of Engineering',
    employmentType: 'Full-Time',
    joiningDate: '2023-01-15',
    status: 'Active',
    location: 'New York HQ',
    workShift: 'US East Coast Standard Shift',
    role: 'company_admin',
    bloodGroup: 'O+',
    salaryStructure: {
      annualCTC: 195000,
      monthlyGross: 16250,
      basic: 11000,
      hra: 3500,
      specialAllowance: 1750,
      conveyance: 0,
      performanceBonus: 15000,
      pfEmployee: 1007, // Social Security + Medicare approx
      pfEmployer: 1007,
      esi: 0,
      professionalTax: 0,
      tdsMonthly: 2437, // Federal & State Income Tax withholding
      netMonthly: 12806,
    },
    bankDetails: {
      accountHolder: 'David Miller',
      accountNumber: '88492019482',
      bankName: 'JPMorgan Chase Bank, N.A.',
      ifscSwift: '021000021', // ABA routing
      branch: 'Manhattan 48th St',
      panNumber: '•••-••-8492', // Masked SSN
      uanNumber: 'W-4: Married Filing Jointly',
    },
    bankAccountDetails: {
      id: 'bank-ns-01',
      tenantId: TENANT_NORTHSTAR_ID,
      employeeId: 'emp-ns-01',
      accountHolderName: 'David Miller',
      bankName: 'JPMorgan Chase Bank, N.A.',
      accountNumber: '88492019482',
      maskedAccountNumber: '•••• •••• 9482',
      routingOrIfscOrSortCode: '021000021',
      routingLabel: 'ABA Routing Number',
      branchName: 'Manhattan Branch',
      accountType: 'Checking',
      paymentMethod: 'Direct Deposit',
      currency: 'USD',
      countryCode: 'US',
      isVerified: true,
      updatedAt: '2023-01-15',
    },
    idCard: {
      id: 'idcard-ns-01',
      tenantId: TENANT_NORTHSTAR_ID,
      employeeId: 'emp-ns-01',
      employeeName: 'David Miller',
      empCode: 'ND-1001',
      designation: 'VP of Engineering',
      department: 'Engineering',
      photoUrl: '',
      companyName: 'Northstar Digital Inc.',
      companyLogo: 'ND',
      bloodGroup: 'O+',
      joiningDate: '2023-01-15',
      workLocation: 'New York HQ',
      validityDate: '2027-12-31',
      qrVerificationToken: 'ND-VERIFY-1001-2026',
      verifiedStatus: 'Active',
    },
    activityTimeline: [
      { id: 'act-ns-1', timestamp: '2023-01-15 09:00', type: 'Joined', title: 'Joined Northstar Digital Inc.', description: 'Onboarded as VP of Engineering.', actor: 'People Ops' }
    ],
    statutoryData: {
      ssn: '•••-••-8492',
      w4Status: 'Married Filing Jointly',
      stateTaxId: 'NYS-TAX-01',
      workAuthorization: 'US Citizen',
    },
    documents: [],
    emergencyContacts: [{ name: 'Sarah Miller', relation: 'Spouse', phone: '+1 (212) 555-0188' }],
    skills: ['Cloud Architecture', 'Kubernetes', 'Go', 'System Security'],
    experience: [],
    education: [],
    notes: [],
  },
];

// Vertex (UAE) Demo Employees
export const VERTEX_EMPLOYEES: Employee[] = [
  {
    id: 'emp-vx-01',
    tenantId: TENANT_VERTEX_ID,
    empCode: 'VC-1001',
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    fullName: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@vertexconsulting.ae',
    phone: '+971 50 123 4567',
    countryCode: 'AE',
    departmentId: 'dept-vx-advisory',
    departmentName: 'Management Advisory',
    designation: 'Managing Director',
    employmentType: 'Full-Time',
    joiningDate: '2023-05-01',
    status: 'Active',
    location: 'Dubai Downtown HQ',
    workShift: 'Dubai General Shift',
    role: 'company_admin',
    bloodGroup: 'A+',
    salaryStructure: {
      annualCTC: 420000,
      monthlyGross: 35000,
      basic: 21000,
      hra: 10500, // Housing Allowance
      specialAllowance: 3500,
      conveyance: 0,
      performanceBonus: 30000,
      pfEmployee: 0, // No income tax in UAE
      pfEmployer: 0,
      esi: 0,
      professionalTax: 15, // WPS processing
      tdsMonthly: 0,
      netMonthly: 34985,
    },
    bankDetails: {
      accountHolder: 'Tariq Al-Mansoor',
      accountNumber: 'AE070331234567890123456',
      bankName: 'Emirates NBD',
      ifscSwift: 'EBNBAEAD',
      branch: 'Downtown Dubai',
      panNumber: '784-1988-1234567-1', // Emirates ID
      uanNumber: 'MOL: 8849201', // Labour Card
    },
    bankAccountDetails: {
      id: 'bank-vx-01',
      tenantId: TENANT_VERTEX_ID,
      employeeId: 'emp-vx-01',
      accountHolderName: 'Tariq Al-Mansoor',
      bankName: 'Emirates NBD',
      accountNumber: 'AE070331234567890123456',
      maskedAccountNumber: 'AE07 •••• •••• 3456',
      routingOrIfscOrSortCode: 'EBNBAEAD',
      routingLabel: 'IBAN / SWIFT Code',
      branchName: 'Downtown Dubai Branch',
      accountType: 'Salary',
      paymentMethod: 'WPS Transfer',
      currency: 'AED',
      countryCode: 'AE',
      isVerified: true,
      updatedAt: '2023-05-01',
    },
    idCard: {
      id: 'idcard-vx-01',
      tenantId: TENANT_VERTEX_ID,
      employeeId: 'emp-vx-01',
      employeeName: 'Tariq Al-Mansoor',
      empCode: 'VC-1001',
      designation: 'Managing Director',
      department: 'Management Advisory',
      photoUrl: '',
      companyName: 'Vertex Consulting LLC',
      companyLogo: 'VC',
      bloodGroup: 'A+',
      joiningDate: '2023-05-01',
      workLocation: 'Dubai Downtown HQ',
      validityDate: '2028-12-31',
      qrVerificationToken: 'VC-VERIFY-1001-2026',
      verifiedStatus: 'Active',
    },
    activityTimeline: [
      { id: 'act-vx-1', timestamp: '2023-05-01 09:00', type: 'Joined', title: 'Joined Vertex Consulting LLC', description: 'Established Dubai management advisory practice.', actor: 'Operations' }
    ],
    statutoryData: {
      emiratesId: '784-1988-1234567-1',
      labourCardNumber: '8849201',
      wpsRoutingCode: 'ENBD001',
      visaStatus: 'Residence Visa Valid',
    },
    documents: [],
    emergencyContacts: [{ name: 'Huda Al-Mansoor', relation: 'Spouse', phone: '+971 50 987 6543' }],
    skills: ['Strategic Management', 'Fintech Advisory', 'Cross-Border M&A'],
    experience: [],
    education: [],
    notes: [],
  },
];

export const VASTRA_EMPLOYEES: Employee[] = [
  {
    id: 'emp-vv-01',
    empCode: 'VV-1001',
    firstName: 'Priya',
    lastName: 'Sharma',
    fullName: 'Priya Sharma',
    email: 'admin@vastravatika.com',
    phone: '+91 98200 12345',
    designation: 'Managing Director & Store Owner',
    departmentId: 'dept-vv-sales',
    departmentName: 'Store Floor & Sales',
    department: 'Store Floor & Sales',
    role: 'company_admin',
    joiningDate: '2023-01-10',
    dateOfJoining: '2023-01-10',
    workShift: 'Vastra Retail Store Shift (10:00 AM - 08:30 PM)',
    employmentType: 'Full-Time',
    status: 'Active',
    location: 'Bandra West Flagship Boutique',
    tenantId: TENANT_VASTRA_ID,
    gender: 'Female',
    dob: '1989-08-14',
    bloodGroup: 'B+',
    address: 'Bandra West, Mumbai 400050',
    emergencyContact: '+91 98200 99999',
    panNumber: 'AAAPS1234F',
    bankDetails: {
      accountHolder: 'Priya Sharma',
      accountNumber: '501008899123',
      bankName: 'HDFC Bank',
      ifscSwift: 'HDFC0000123',
      branch: 'Linking Road Branch',
      panNumber: 'AAAPS1234F',
      uanNumber: '100987654321',
    },
    salaryStructure: createSalary(1800000),
    digitalIdCard: {
      id: 'id-card-vv-01',
      tenantId: TENANT_VASTRA_ID,
      employeeId: 'emp-vv-01',
      employeeName: 'Priya Sharma',
      empCode: 'VV-1001',
      designation: 'Managing Director & Store Owner',
      department: 'Store Floor & Sales',
      photoUrl: '',
      companyName: 'Vastra Vatika',
      companyLogo: 'VV',
      bloodGroup: 'B+',
      joiningDate: '2023-01-10',
      workLocation: 'Bandra West Flagship Boutique',
      validityDate: '2028-12-31',
      qrVerificationToken: 'VV-VERIFY-1001-2026',
      verifiedStatus: 'Active',
    },
    activityTimeline: [
      { id: 'act-vv-1', timestamp: '2023-01-10 10:00', type: 'Joined', title: 'Founded Vastra Vatika', description: 'Established flagship boutique in Bandra West.', actor: 'Administration' }
    ],
    documents: [],
    emergencyContacts: [{ name: 'Deepak Sharma', relation: 'Spouse', phone: '+91 98200 99999' }],
    skills: ['Retail Store Management', 'Fashion Merchandising', 'Apparel Sourcing', 'Customer Experience'],
    experience: [],
    education: [],
    notes: [],
  },
  {
    id: 'emp-vv-02',
    empCode: 'VV-1002',
    firstName: 'Kavita',
    lastName: 'Joshi',
    fullName: 'Kavita Joshi',
    email: 'kavita@vastravatika.com',
    phone: '+91 98200 23456',
    designation: 'Billing & POS Cashier Lead',
    departmentId: 'dept-vv-billing',
    departmentName: 'Billing, POS & Cashier Desk',
    department: 'Billing, POS & Cashier Desk',
    role: 'payroll_manager',
    joiningDate: '2023-03-15',
    dateOfJoining: '2023-03-15',
    workShift: 'Vastra Retail Store Shift (10:00 AM - 08:30 PM)',
    employmentType: 'Full-Time',
    status: 'Active',
    location: 'Bandra West Flagship Boutique',
    tenantId: TENANT_VASTRA_ID,
    gender: 'Female',
    dob: '1995-11-20',
    bloodGroup: 'O+',
    address: 'Khar West, Mumbai',
    emergencyContact: '+91 98200 88888',
    panNumber: 'BCDPJ2345K',
    bankDetails: {
      accountHolder: 'Kavita Joshi',
      accountNumber: '501008899124',
      bankName: 'ICICI Bank',
      ifscSwift: 'ICIC0000456',
      branch: 'Bandra Branch',
      panNumber: 'BCDPJ2345K',
      uanNumber: '100987654322',
    },
    salaryStructure: createSalary(650000),
    digitalIdCard: {
      id: 'id-card-vv-02',
      tenantId: TENANT_VASTRA_ID,
      employeeId: 'emp-vv-02',
      employeeName: 'Kavita Joshi',
      empCode: 'VV-1002',
      designation: 'Billing & POS Cashier Lead',
      department: 'Billing, POS & Cashier Desk',
      photoUrl: '',
      companyName: 'Vastra Vatika',
      companyLogo: 'VV',
      bloodGroup: 'O+',
      joiningDate: '2023-03-15',
      workLocation: 'Bandra West Flagship Boutique',
      validityDate: '2028-12-31',
      qrVerificationToken: 'VV-VERIFY-1002-2026',
      verifiedStatus: 'Active',
    },
    activityTimeline: [],
    documents: [],
    emergencyContacts: [],
    skills: ['Point of Sale (POS)', 'Cash Handling', 'Tally', 'GST Billing'],
    experience: [],
    education: [],
    notes: [],
  },
  {
    id: 'emp-vv-03',
    empCode: 'VV-1003',
    firstName: 'Rohan',
    lastName: 'Gaikwad',
    fullName: 'Rohan Gaikwad',
    email: 'rohan@vastravatika.com',
    phone: '+91 98200 34567',
    designation: 'Store Sales & Inventory Associate',
    departmentId: 'dept-vv-sales',
    departmentName: 'Store Floor & Sales',
    department: 'Store Floor & Sales',
    role: 'employee',
    joiningDate: '2023-06-01',
    dateOfJoining: '2023-06-01',
    workShift: 'Vastra Retail Store Shift (10:00 AM - 08:30 PM)',
    employmentType: 'Full-Time',
    status: 'Active',
    location: 'Bandra West Flagship Boutique',
    tenantId: TENANT_VASTRA_ID,
    gender: 'Male',
    dob: '1998-05-12',
    bloodGroup: 'A+',
    address: 'Santacruz West, Mumbai',
    emergencyContact: '+91 98200 77777',
    panNumber: 'CDEFG3456R',
    bankDetails: {
      accountHolder: 'Rohan Gaikwad',
      accountNumber: '501008899125',
      bankName: 'State Bank of India',
      ifscSwift: 'SBIN0001234',
      branch: 'Santacruz Branch',
      panNumber: 'CDEFG3456R',
      uanNumber: '100987654323',
    },
    salaryStructure: createSalary(480000),
    digitalIdCard: {
      id: 'id-card-vv-03',
      tenantId: TENANT_VASTRA_ID,
      employeeId: 'emp-vv-03',
      employeeName: 'Rohan Gaikwad',
      empCode: 'VV-1003',
      designation: 'Store Sales & Inventory Associate',
      department: 'Store Floor & Sales',
      photoUrl: '',
      companyName: 'Vastra Vatika',
      companyLogo: 'VV',
      bloodGroup: 'A+',
      joiningDate: '2023-06-01',
      workLocation: 'Bandra West Flagship Boutique',
      validityDate: '2028-12-31',
      qrVerificationToken: 'VV-VERIFY-1003-2026',
      verifiedStatus: 'Active',
    },
    activityTimeline: [],
    documents: [],
    emergencyContacts: [],
    skills: ['Customer Assistance', 'Garment Stocking', 'Visual Merchandising', 'Stock Audits'],
    experience: [],
    education: [],
    notes: [],
  },
];

export const PRODUCTION_EMPLOYEES: Employee[] = [
  ...ARQENSIAL_EMPLOYEES,
  ...NORTHSTAR_EMPLOYEES,
  ...VERTEX_EMPLOYEES,
  ...VASTRA_EMPLOYEES,
];
