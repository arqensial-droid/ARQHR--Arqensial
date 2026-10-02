import {
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  PayrollRun,
  Payslip,
  JobRequisition,
  Candidate,
  OnboardingTask,
  ResignationRequest,
  GoalOKR,
  Asset,
  ExpenseClaim,
  HelpdeskTicket,
  CompanyDocument,
  FeedPost,
  AuditLog,
  AppraisalReview,
} from '../../types';
import { TENANT_ARQENSIAL_ID } from './company';
import { PRODUCTION_EMPLOYEES } from './employees';

// ==========================================
// 1. 20 ATTENDANCE RECORDS PER EMPLOYEE (500 RECORDS)
// ==========================================
const WORKDAYS = [
  '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04',
  '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11',
  '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18',
  '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
  '2026-09-28',
];

export const PRODUCTION_ATTENDANCE: AttendanceRecord[] = [];

PRODUCTION_EMPLOYEES.forEach((emp, empIdx) => {
  WORKDAYS.forEach((dateStr, dayIdx) => {
    const isMumbai = emp.location === 'Mumbai HQ';
    const baseLat = isMumbai ? 19.0657 : 19.2812;
    const baseLng = isMumbai ? 72.8687 : 72.8561;
    const addr = isMumbai
      ? 'BKC Bandra East, Mumbai HQ Office'
      : 'Silver Park Plaza, Mira Road Office';

    const cycle = (empIdx * 7 + dayIdx) % 20;
    let status: AttendanceRecord['status'] = 'Present';
    let checkIn = '09:25 AM';
    let checkOut = '06:35 PM';
    let duration = 9.1;

    if (cycle === 4) {
      status = 'Late';
      checkIn = '10:05 AM';
      checkOut = '06:40 PM';
      duration = 8.5;
    } else if (cycle === 9) {
      status = 'Half Day';
      checkIn = '09:30 AM';
      checkOut = '02:00 PM';
      duration = 4.5;
    } else if (cycle === 14) {
      status = 'On Leave';
      checkIn = '--';
      checkOut = '--';
      duration = 0;
    }

    const methods: AttendanceRecord['checkInMethod'][] = ['Biometric', 'Web', 'Selfie', 'Mobile'];
    const method = status === 'On Leave' ? 'Web' : methods[(empIdx + dayIdx) % methods.length];

    PRODUCTION_ATTENDANCE.push({
      id: `att-${emp.id}-${dayIdx + 1}`,
      tenantId: TENANT_ARQENSIAL_ID,
      employeeId: emp.id,
      employeeName: emp.fullName,
      empCode: emp.empCode,
      date: dateStr,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      durationHours: duration,
      status,
      checkInMethod: method,
      location: {
        lat: baseLat + (dayIdx % 3 === 0 ? 0.0001 : 0),
        lng: baseLng - (dayIdx % 2 === 0 ? 0.0001 : 0),
        address: addr,
        withinGeoFence: true,
      },
      isWFH: cycle === 7,
      ipAddress: isMumbai ? '182.72.138.42' : '115.112.245.18',
    });
  });
});

// ==========================================
// 2. 3 ACTIVE RECRUITMENTS & CANDIDATES
// ==========================================
export const PRODUCTION_JOB_REQUISITIONS: JobRequisition[] = [
  {
    id: 'req-01',
    tenantId: TENANT_ARQENSIAL_ID,
    jobCode: 'DEV-2026-01',
    title: 'Senior Full-Stack Web Developer',
    department: 'Development',
    location: 'Mumbai HQ',
    employmentType: 'Full-Time',
    experienceRequired: '4-6 Years',
    openPositions: 2,
    status: 'Active',
    salaryRange: '₹12,00,000 - ₹18,00,000',
    createdDate: '2026-08-15',
    hiringManager: 'Vikram Malhotra',
    applicantsCount: 18,
    description: 'Lead engineering for Arqensial enterprise customer portals and internal SaaS modules using React, Node.js, and TypeScript.',
    requirements: ['Solid experience with React 19, TypeScript, Node.js', 'Experience with PostgreSQL or Supabase', 'Strong knowledge of REST and GraphQL'],
  },
  {
    id: 'req-02',
    tenantId: TENANT_ARQENSIAL_ID,
    jobCode: 'UIUX-2026-02',
    title: 'Lead UI/UX Product Designer',
    department: 'UI/UX',
    location: 'Mumbai HQ',
    employmentType: 'Full-Time',
    experienceRequired: '3-5 Years',
    openPositions: 1,
    status: 'Active',
    salaryRange: '₹10,00,000 - ₹15,00,000',
    createdDate: '2026-08-20',
    hiringManager: 'Sneha Kulkarni',
    applicantsCount: 14,
    description: 'Drive human-centered design for client digital web platforms, design system tokens, and interactive wireframes.',
    requirements: ['Expert proficiency in Figma & interactive prototyping', 'Deep understanding of accessibility WCAG 2.1', 'Experience establishing scalable design systems'],
  },
  {
    id: 'req-03',
    tenantId: TENANT_ARQENSIAL_ID,
    jobCode: 'SEO-2026-03',
    title: 'Senior SEO Strategist & Technical Auditor',
    department: 'SEO',
    location: 'Mira Road Office',
    employmentType: 'Full-Time',
    experienceRequired: '3-5 Years',
    openPositions: 2,
    status: 'Active',
    salaryRange: '₹7,00,000 - ₹11,00,000',
    createdDate: '2026-09-01',
    hiringManager: 'Rohan Deshmukh',
    applicantsCount: 22,
    description: 'Manage organic performance and technical SEO audits for client portals, schema architectures, and Google Search Console optimization.',
    requirements: ['Hands-on mastery of Ahrefs, SEMrush, Screaming Frog', 'Proven record in international & local SEO growth', 'Core Web Vitals auditing experience'],
  },
];

export const PRODUCTION_CANDIDATES: Candidate[] = [
  {
    id: 'cand-01',
    tenantId: TENANT_ARQENSIAL_ID,
    requisitionId: 'req-01',
    requisitionTitle: 'Senior Full-Stack Web Developer',
    name: 'Abhishek Sawant',
    email: 'abhishek.sawant@outlook.com',
    phone: '+91 98334 11223',
    stage: 'Interview',
    rating: 5,
    experienceYears: 5,
    currentCompany: 'Infosys BPM Mumbai',
    noticePeriodDays: 30,
    resumeSummary: 'Full-stack developer with 5 years in React, Node, and AWS serverless architectures. Excellent system design skills.',
    interviewDate: '2026-10-05',
    appliedDate: '2026-09-12',
  },
  {
    id: 'cand-02',
    tenantId: TENANT_ARQENSIAL_ID,
    requisitionId: 'req-02',
    requisitionTitle: 'Lead UI/UX Product Designer',
    name: 'Pallavi Chhabra',
    email: 'pallavi.designs@gmail.com',
    phone: '+91 98190 22334',
    stage: 'Offer',
    rating: 5,
    experienceYears: 4,
    currentCompany: 'CleverTap Digital',
    noticePeriodDays: 15,
    resumeSummary: 'Product designer with portfolio covering FinTech and B2B SaaS web applications. Strong user journey research.',
    offerAmount: 1350000,
    appliedDate: '2026-08-25',
  },
  {
    id: 'cand-03',
    tenantId: TENANT_ARQENSIAL_ID,
    requisitionId: 'req-03',
    requisitionTitle: 'Senior SEO Strategist & Technical Auditor',
    name: 'Nikhil Kadam',
    email: 'nikhil.kadam92@gmail.com',
    phone: '+91 98205 33445',
    stage: 'Screening',
    rating: 4,
    experienceYears: 4,
    currentCompany: 'Performics India',
    noticePeriodDays: 30,
    resumeSummary: 'Specialized in technical crawl audits, semantic schema, and programmatic SEO for eCommerce websites.',
    appliedDate: '2026-09-15',
  },
];

// ==========================================
// 3. 12 LEAVE REQUESTS
// ==========================================
export const PRODUCTION_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'leave-01', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-07', employeeName: 'Aditya Verma', empCode: 'AQ-1007', department: 'Development', leaveType: 'Casual Leave', startDate: '2026-10-12', endDate: '2026-10-13', daysCount: 2, halfDay: false, reason: 'Family function and personal commitments in Pune', status: 'Approved', approvedBy: 'Vikram Malhotra', appliedOn: '2026-09-28' },
  { id: 'leave-02', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-08', employeeName: 'Pooja Patil', empCode: 'AQ-1008', department: 'Development', leaveType: 'Sick Leave', startDate: '2026-09-18', endDate: '2026-09-18', daysCount: 1, halfDay: false, reason: 'Viral fever and physician recommended rest', status: 'Approved', approvedBy: 'Vikram Malhotra', appliedOn: '2026-09-17' },
  { id: 'leave-03', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-11', employeeName: 'Kunal Joshi', empCode: 'AQ-1011', department: 'UI/UX', leaveType: 'Earned Leave', startDate: '2026-10-21', endDate: '2026-10-23', daysCount: 3, halfDay: false, reason: 'Diwali festive holiday extension with parents in Nashik', status: 'Approved', approvedBy: 'Sneha Kulkarni', appliedOn: '2026-09-25' },
  { id: 'leave-04', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-13', employeeName: 'Sameer Khan', empCode: 'AQ-1013', department: 'SEO', leaveType: 'Comp Off', startDate: '2026-10-06', endDate: '2026-10-06', daysCount: 1, halfDay: false, reason: 'Compensatory leave for weekend client production deployment', status: 'Approved', approvedBy: 'Rohan Deshmukh', appliedOn: '2026-09-30' },
  { id: 'leave-05', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-14', employeeName: 'Divya Menon', empCode: 'AQ-1014', department: 'SEO', leaveType: 'Casual Leave', startDate: '2026-10-15', endDate: '2026-10-16', daysCount: 2, halfDay: false, reason: 'Attending cousin wedding in Kerala', status: 'Pending', appliedOn: '2026-10-01' },
  { id: 'leave-06', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-16', employeeName: 'Kavita Rao', empCode: 'AQ-1016', department: 'Digital Marketing', leaveType: 'Sick Leave', startDate: '2026-09-22', endDate: '2026-09-22', daysCount: 1, halfDay: false, reason: 'Severe migraine consultation', status: 'Approved', approvedBy: 'Arjun Rampal', appliedOn: '2026-09-22' },
  { id: 'leave-07', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-18', employeeName: 'Shweta Tiwari', empCode: 'AQ-1018', department: 'Content', leaveType: 'Casual Leave', startDate: '2026-10-09', endDate: '2026-10-09', daysCount: 1, halfDay: false, reason: 'Home renovation paperwork and registrar appointment', status: 'Pending', appliedOn: '2026-10-01' },
  { id: 'leave-08', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-19', employeeName: 'Tanvi Agarwal', empCode: 'AQ-1019', department: 'Content', leaveType: 'Earned Leave', startDate: '2026-11-09', endDate: '2026-11-13', daysCount: 5, halfDay: false, reason: 'Annual family pilgrimage tour', status: 'Approved', approvedBy: 'Rahul Mehta', appliedOn: '2026-09-20' },
  { id: 'leave-09', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-22', employeeName: 'Meera Chawla', empCode: 'AQ-1022', department: 'Sales', leaveType: 'Casual Leave', startDate: '2026-10-14', endDate: '2026-10-14', daysCount: 1, halfDay: true, reason: 'Bank documentation for home loan processing (second half)', status: 'Approved', approvedBy: 'Siddharth Singhania', appliedOn: '2026-09-29' },
  { id: 'leave-10', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-23', employeeName: 'Varun Bhatt', empCode: 'AQ-1023', department: 'Sales', leaveType: 'Sick Leave', startDate: '2026-09-14', endDate: '2026-09-15', daysCount: 2, halfDay: false, reason: 'Gastroenteritis recovery under medical care', status: 'Approved', approvedBy: 'Siddharth Singhania', appliedOn: '2026-09-14' },
  { id: 'leave-11', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-09', employeeName: 'Amit Trivedi', empCode: 'AQ-1009', department: 'Development', leaveType: 'Casual Leave', startDate: '2026-10-05', endDate: '2026-10-07', daysCount: 3, halfDay: false, reason: 'Personal domestic exigency', status: 'Rejected', approvedBy: 'Vikram Malhotra', managerComment: 'Critical sprint release window, please adjust dates.', appliedOn: '2026-09-24' },
  { id: 'leave-12', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-25', employeeName: 'Deepak Nambiar', empCode: 'AQ-1025', department: 'Accounts', leaveType: 'Casual Leave', startDate: '2026-10-16', endDate: '2026-10-16', daysCount: 1, halfDay: false, reason: 'Parents routine medical checkup in Thane', status: 'Pending', appliedOn: '2026-10-02' },
];

export const PRODUCTION_LEAVE_BALANCES: Record<string, LeaveBalance> = {};
PRODUCTION_EMPLOYEES.forEach(emp => {
  PRODUCTION_LEAVE_BALANCES[emp.id] = {
    employeeId: emp.id,
    casualLeave: { total: 12, used: 3, balance: 9 },
    sickLeave: { total: 12, used: 2, balance: 10 },
    earnedLeave: { total: 15, used: 4, balance: 11 },
    compOff: { total: 4, used: 1, balance: 3 },
  };
});

// ==========================================
// 4. 4 PAYROLL RUNS & PAYSLIPS
// ==========================================
export const PRODUCTION_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'payrun-2026-06',
    tenantId: TENANT_ARQENSIAL_ID,
    month: 'June 2026',
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    totalGross: 2085000,
    totalNet: 1792000,
    totalDeductions: 293000,
    totalEmployees: 25,
    status: 'Disbursed',
    processedAt: '2026-06-30T17:00:00Z',
    disbursedAt: '2026-07-01T10:30:00Z',
    processedBy: 'Sunita Hegde',
  },
  {
    id: 'payrun-2026-07',
    tenantId: TENANT_ARQENSIAL_ID,
    month: 'July 2026',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    totalGross: 2085000,
    totalNet: 1792000,
    totalDeductions: 293000,
    totalEmployees: 25,
    status: 'Disbursed',
    processedAt: '2026-07-31T17:00:00Z',
    disbursedAt: '2026-08-01T10:30:00Z',
    processedBy: 'Sunita Hegde',
  },
  {
    id: 'payrun-2026-08',
    tenantId: TENANT_ARQENSIAL_ID,
    month: 'August 2026',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    totalGross: 2085000,
    totalNet: 1792000,
    totalDeductions: 293000,
    totalEmployees: 25,
    status: 'Disbursed',
    processedAt: '2026-08-31T17:00:00Z',
    disbursedAt: '2026-09-01T10:30:00Z',
    processedBy: 'Sunita Hegde',
  },
  {
    id: 'payrun-2026-09',
    tenantId: TENANT_ARQENSIAL_ID,
    month: 'September 2026',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    totalGross: 2085000,
    totalNet: 1792000,
    totalDeductions: 293000,
    totalEmployees: 25,
    status: 'Processed',
    processedAt: '2026-09-30T17:00:00Z',
    processedBy: 'Sunita Hegde',
  },
];

export const PRODUCTION_PAYSLIPS: Payslip[] = [];

['September 2026', 'August 2026'].forEach((monthName, mIdx) => {
  const runId = mIdx === 0 ? 'payrun-2026-09' : 'payrun-2026-08';
  PRODUCTION_EMPLOYEES.forEach(emp => {
    const s = emp.salaryStructure;
    const totalDeductions = s.pfEmployee + s.esi + s.professionalTax + s.tdsMonthly;

    const payslipNum = `PS-IN-${monthName.replace(/\s+/g, '').toUpperCase()}-${emp.empCode}`;
    const earningsBreakdown = [
      { name: 'Basic Pay', amount: s.basic, isTaxable: true },
      { name: 'House Rent Allowance (HRA)', amount: s.hra, isTaxable: true },
      { name: 'Special Allowance', amount: s.specialAllowance, isTaxable: true },
      { name: 'Conveyance Allowance', amount: s.conveyance, isTaxable: false },
    ];
    const deductionsBreakdown = [
      { name: 'Employee Provident Fund (EPF 12%)', amount: s.pfEmployee, isStatutory: true },
      ...(s.esi > 0 ? [{ name: 'ESIC (Employee 0.75%)', amount: s.esi, isStatutory: true }] : []),
      { name: 'Professional Tax (PT)', amount: s.professionalTax, isStatutory: true },
      ...(s.tdsMonthly > 0 ? [{ name: 'Income Tax (TDS / Sec 192)', amount: s.tdsMonthly, isStatutory: true }] : []),
    ];

    PRODUCTION_PAYSLIPS.push({
      id: `ps-${emp.id}-${runId}`,
      tenantId: TENANT_ARQENSIAL_ID,
      payrollRunId: runId,
      payslipNumber: payslipNum,
      countryCode: 'IN',
      currency: 'INR',
      currencySymbol: '₹',
      employeeId: emp.id,
      employeeName: emp.fullName,
      empCode: emp.empCode,
      designation: emp.designation,
      department: emp.departmentName,
      joiningDate: emp.joiningDate,
      panNumber: emp.bankDetails.panNumber,
      uanNumber: emp.bankDetails.uanNumber,
      taxIdMasked: `••••••••${emp.bankDetails.panNumber.slice(-4)}`,
      bankAccount: emp.bankDetails.accountNumber,
      bankAccountMasked: `•••• •••• ${emp.bankDetails.accountNumber.slice(-4)}`,
      bankName: emp.bankDetails.bankName,
      month: monthName,
      totalCalendarDays: 30,
      daysWorked: 26,
      presentDays: 22,
      paidLeaveDays: 2,
      unpaidLeaveDays: 0,
      daysLop: 0,
      holidaysCount: 2,
      weekOffsCount: 4,
      overtimeHours: 0,
      overtimePay: 0,
      basic: s.basic,
      hra: s.hra,
      specialAllowance: s.specialAllowance,
      conveyance: s.conveyance,
      performanceBonus: Math.round(s.performanceBonus / 12),
      grossEarnings: s.monthlyGross,
      earningsBreakdown,
      deductionsBreakdown,
      pfDeduction: s.pfEmployee,
      esiDeduction: s.esi,
      ptDeduction: s.professionalTax,
      tdsDeduction: s.tdsMonthly,
      totalDeductions,
      netPayable: s.netMonthly,
      netPayInWords: 'Indian Rupees Only',
      qrVerificationToken: `AQ-VERIFY-${emp.empCode}-${payslipNum}`,
      status: mIdx === 0 ? 'Generated' : 'Disbursed',
      generatedDate: mIdx === 0 ? '2026-09-30' : '2026-08-31',
    });
  });
});

// ==========================================
// 5. 15 EXPENSE CLAIMS
// ==========================================
export const PRODUCTION_EXPENSES: ExpenseClaim[] = [
  { id: 'exp-01', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-03', employeeName: 'Vikram Malhotra', empCode: 'AQ-1003', title: 'AWS Serverless Architecture Certification Fee', category: 'Training', amount: 12500, currency: 'INR', expenseDate: '2026-09-10', receiptName: 'aws-certification-invoice.pdf', status: 'Reimbursed', approvedBy: 'Priya Nair', notes: 'Completed AWS Solutions Architect Associate exam with 92%.' },
  { id: 'exp-02', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-04', employeeName: 'Sneha Kulkarni', empCode: 'AQ-1004', title: 'Figma Enterprise Organization Monthly Seat', category: 'Software', amount: 3750, currency: 'INR', expenseDate: '2026-09-05', receiptName: 'figma-monthly-seat.pdf', status: 'Approved', approvedBy: 'Priya Nair', notes: 'Design sprint collaboration tool for UI team.' },
  { id: 'exp-03', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-05', employeeName: 'Rohan Deshmukh', empCode: 'AQ-1005', title: 'Ahrefs Advanced Agency Subscription (Mira Road)', category: 'Software', amount: 16800, currency: 'INR', expenseDate: '2026-09-02', receiptName: 'ahrefs-agency-tax-invoice.pdf', status: 'Reimbursed', approvedBy: 'Priya Nair', notes: 'Core SEO tracking for organic client audits.' },
  { id: 'exp-04', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-21', employeeName: 'Siddharth Singhania', empCode: 'AQ-1021', title: 'Enterprise Client Dinner Meeting at Trident BKC', category: 'Meal', amount: 8450, currency: 'INR', expenseDate: '2026-09-12', receiptName: 'trident-bkc-dinner.pdf', status: 'Approved', approvedBy: 'Rajesh Sharma', notes: 'Contract signing dinner with Fintech partner CTO and VP.' },
  { id: 'exp-05', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-21', employeeName: 'Siddharth Singhania', empCode: 'AQ-1021', title: 'Airport Taxi Travel to Pune Client Site', category: 'Travel', amount: 4200, currency: 'INR', expenseDate: '2026-09-14', receiptName: 'uber-intercity-pune.pdf', status: 'Reimbursed', approvedBy: 'Priya Nair', notes: 'On-site proposal presentation in Hinjewadi Phase 1.' },
  { id: 'exp-06', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-07', employeeName: 'Aditya Verma', empCode: 'AQ-1007', title: 'Ergonomic Vertical Mouse and Laptop Stand', category: 'Equipment', amount: 3200, currency: 'INR', expenseDate: '2026-09-18', receiptName: 'amazon-hardware-bill.pdf', status: 'Approved', approvedBy: 'Vikram Malhotra', notes: 'Workstation ergonomics upgrade.' },
  { id: 'exp-07', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-15', employeeName: 'Arjun Rampal', empCode: 'AQ-1015', title: 'Google Marketing Live Conference Entry Pass', category: 'Training', amount: 9500, currency: 'INR', expenseDate: '2026-09-20', receiptName: 'google-marketing-ticket.pdf', status: 'Approved', approvedBy: 'Priya Nair', notes: 'Paid media optimization workshop and keynote passes.' },
  { id: 'exp-08', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-06', employeeName: 'Ananya Iyer', empCode: 'AQ-1006', title: 'HR Conclave 2026 Pass at Grand Hyatt Mumbai', category: 'Training', amount: 7500, currency: 'INR', expenseDate: '2026-09-22', receiptName: 'hr-summit-registration.pdf', status: 'Reimbursed', approvedBy: 'Rajesh Sharma', notes: 'Networking and talent sourcing trends session.' },
  { id: 'exp-09', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-11', employeeName: 'Kunal Joshi', empCode: 'AQ-1011', title: 'Color Calibration Tool for Display Monitors', category: 'Equipment', amount: 6200, currency: 'INR', expenseDate: '2026-09-24', receiptName: 'datacolor-spyder-receipt.pdf', status: 'Submitted', notes: 'Accurate color proofing for web and mobile client assets.' },
  { id: 'exp-10', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-17', employeeName: 'Rahul Mehta', empCode: 'AQ-1017', title: 'Grammarly Business Annual Team License', category: 'Software', amount: 11200, currency: 'INR', expenseDate: '2026-09-15', receiptName: 'grammarly-invoice.pdf', status: 'Approved', approvedBy: 'Priya Nair', notes: 'Editorial consistency across content deliverables.' },
  { id: 'exp-11', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-13', employeeName: 'Sameer Khan', empCode: 'AQ-1013', title: 'Screaming Frog SEO Spider Annual License', category: 'Software', amount: 14500, currency: 'INR', expenseDate: '2026-09-25', receiptName: 'screamingfrog-uk-tax-invoice.pdf', status: 'Approved', approvedBy: 'Rohan Deshmukh', notes: 'Technical website crawling for high-volume enterprise clients.' },
  { id: 'exp-12', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-22', employeeName: 'Meera Chawla', empCode: 'AQ-1022', title: 'Client Lunch with Banking Prospects at BKC', category: 'Meal', amount: 4800, currency: 'INR', expenseDate: '2026-09-26', receiptName: 'bkc-lunch-gst-bill.pdf', status: 'Submitted', notes: 'Quarterly review with leading private sector bank digital lead.' },
  { id: 'exp-13', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-10', employeeName: 'Neha Gupta', empCode: 'AQ-1010', title: 'High-speed Fiber Broadband Allowance (WFH)', category: 'Equipment', amount: 1800, currency: 'INR', expenseDate: '2026-09-28', receiptName: 'airtel-broadband-sept.pdf', status: 'Approved', approvedBy: 'Vikram Malhotra', notes: 'Monthly remote development connectivity reimbursement.' },
  { id: 'exp-14', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-23', employeeName: 'Varun Bhatt', empCode: 'AQ-1023', title: 'Cab Travel for Mira Road to BKC Strategy Meeting', category: 'Travel', amount: 1250, currency: 'INR', expenseDate: '2026-09-29', receiptName: 'uber-ride-receipt.pdf', status: 'Approved', approvedBy: 'Siddharth Singhania', notes: 'Attended all-hands business review at Mumbai HQ.' },
  { id: 'exp-15', tenantId: TENANT_ARQENSIAL_ID, employeeId: 'emp-24', employeeName: 'Sunita Hegde', empCode: 'AQ-1024', title: 'TallyPrime Server Multi-User Renewal & AMC', category: 'Software', amount: 18500, currency: 'INR', expenseDate: '2026-09-30', receiptName: 'tally-amc-tax-bill.pdf', status: 'Submitted', notes: 'Annual statutory accounting and GST filing software maintenance.' },
];

// ==========================================
// 6. 10 HELPDESK TICKETS
// ==========================================
export const PRODUCTION_TICKETS: HelpdeskTicket[] = [
  {
    id: 'tkt-01',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1001',
    employeeId: 'emp-07',
    employeeName: 'Aditya Verma',
    subject: 'MacBook Pro M3 battery diagnostic and charger replacement',
    category: 'IT Support',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-09-28 10:15',
    slaHoursLeft: 12,
    assignedTo: 'IT Desk Mumbai',
    thread: [
      { author: 'Aditya Verma', text: 'My laptop charger gets excessively warm and drops connection after 45 minutes of intensive build jobs.', timestamp: '2026-09-28 10:15', isStaff: false },
      { author: 'IT Desk Mumbai', text: 'Replacement 96W MagSafe charger allocated. Please collect from BKC 5th floor IT store.', timestamp: '2026-09-28 11:30', isStaff: true },
    ],
  },
  {
    id: 'tkt-02',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1002',
    employeeId: 'emp-08',
    employeeName: 'Pooja Patil',
    subject: 'Form 16 Part B tax deduction mismatch clarification',
    category: 'Payroll Query',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-09-25 14:20',
    slaHoursLeft: 0,
    assignedTo: 'Sunita Hegde',
    thread: [
      { author: 'Pooja Patil', text: 'Hi Sunita, checking if the 80D health insurance deduction has been accurately credited in the Q1 TDS summary.', timestamp: '2026-09-25 14:20', isStaff: false },
      { author: 'Sunita Hegde', text: 'Verified with Traces portal. An updated Form 16 Part B revised certificate has been uploaded to your ESS documents.', timestamp: '2026-09-26 11:00', isStaff: true },
    ],
  },
  {
    id: 'tkt-03',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1003',
    employeeId: 'emp-05',
    employeeName: 'Rohan Deshmukh',
    subject: 'Mira Road office air conditioning maintenance in 2nd floor wing',
    category: 'Facilities',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-09-29 09:40',
    slaHoursLeft: 24,
    assignedTo: 'Mira Road Admin',
    thread: [
      { author: 'Rohan Deshmukh', text: 'The cooling in the SEO and Content workstation zone is fluctuating during afternoon hours.', timestamp: '2026-09-29 09:40', isStaff: false },
      { author: 'Mira Road Admin', text: 'Daikin technician service scheduled for tomorrow morning at 10:00 AM.', timestamp: '2026-09-29 12:15', isStaff: true },
    ],
  },
  {
    id: 'tkt-04',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1004',
    employeeId: 'emp-09',
    employeeName: 'Amit Trivedi',
    subject: 'VPN credentials renewal for staging deployment cluster',
    category: 'IT Support',
    priority: 'Critical',
    status: 'Resolved',
    createdAt: '2026-09-27 16:00',
    slaHoursLeft: 0,
    assignedTo: 'IT Desk Mumbai',
    thread: [
      { author: 'Amit Trivedi', text: 'WireGuard VPN key expired, cannot push Docker images to internal test registry.', timestamp: '2026-09-27 16:00', isStaff: false },
      { author: 'IT Desk Mumbai', text: 'New 2048-bit certificate issued and profile updated in OpenVPN connect.', timestamp: '2026-09-27 16:25', isStaff: true },
    ],
  },
  {
    id: 'tkt-05',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1005',
    employeeId: 'emp-12',
    employeeName: 'Riya Sen',
    subject: 'Medical insurance family floater top-up policy details',
    category: 'HR Support',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-10-01 11:10',
    slaHoursLeft: 40,
    assignedTo: 'Ananya Iyer',
    thread: [
      { author: 'Riya Sen', text: 'Would like to add parents to the group Mediclaim insurance during the annual open enrollment.', timestamp: '2026-10-01 11:10', isStaff: false },
    ],
  },
  {
    id: 'tkt-06',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1006',
    employeeId: 'emp-10',
    employeeName: 'Neha Gupta',
    subject: 'Ergonomic chair request for development workstation #14',
    category: 'Facilities',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-10-01 14:30',
    slaHoursLeft: 48,
    assignedTo: 'Facilities BKC',
    thread: [
      { author: 'Neha Gupta', text: 'Lumbar support adjustment knob broken on current chair at workstation 14.', timestamp: '2026-10-01 14:30', isStaff: false },
    ],
  },
  {
    id: 'tkt-07',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1007',
    employeeId: 'emp-14',
    employeeName: 'Divya Menon',
    subject: 'Access provisioning for Google Search Console and SEMrush client projects',
    category: 'IT Support',
    priority: 'High',
    status: 'Resolved',
    createdAt: '2026-09-26 10:00',
    slaHoursLeft: 0,
    assignedTo: 'Rohan Deshmukh',
    thread: [
      { author: 'Divya Menon', text: 'Need analyst permissions on the new banking client Search Console property.', timestamp: '2026-09-26 10:00', isStaff: false },
      { author: 'Rohan Deshmukh', text: 'Delegated owner access granted through Google Workspace group.', timestamp: '2026-09-26 10:45', isStaff: true },
    ],
  },
  {
    id: 'tkt-08',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1008',
    employeeId: 'emp-23',
    employeeName: 'Varun Bhatt',
    subject: 'August 2026 client travel allowance reimbursement query',
    category: 'Payroll Query',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-09-15 15:30',
    slaHoursLeft: 0,
    assignedTo: 'Sunita Hegde',
    thread: [
      { author: 'Varun Bhatt', text: 'Checking if my Ola corporate rides for August have been processed with September payroll.', timestamp: '2026-09-15 15:30', isStaff: false },
      { author: 'Sunita Hegde', text: 'Yes Varun, ₹3,240 added under non-taxable travel reimbursement in August payslip.', timestamp: '2026-09-16 10:10', isStaff: true },
    ],
  },
  {
    id: 'tkt-09',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1009',
    employeeId: 'emp-18',
    employeeName: 'Shweta Tiwari',
    subject: 'Mira Road office biometric fingerprint re-registration',
    category: 'Facilities',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: '2026-09-30 09:20',
    slaHoursLeft: 18,
    assignedTo: 'IT Desk Mira Road',
    thread: [
      { author: 'Shweta Tiwari', text: 'Biometric device at front entrance reports sensor timeout on right index finger.', timestamp: '2026-09-30 09:20', isStaff: false },
      { author: 'IT Desk Mira Road', text: 'Please visit reception desk at 2:00 PM for 2-minute sensor re-calibration.', timestamp: '2026-09-30 10:00', isStaff: true },
    ],
  },
  {
    id: 'tkt-10',
    tenantId: TENANT_ARQENSIAL_ID,
    ticketCode: 'TKT-1010',
    employeeId: 'emp-11',
    employeeName: 'Kunal Joshi',
    subject: 'Dual monitor 4K HDMI adapter requirement for design desk',
    category: 'IT Support',
    priority: 'Medium',
    status: 'Open',
    createdAt: '2026-10-02 09:15',
    slaHoursLeft: 20,
    assignedTo: 'IT Desk Mumbai',
    thread: [
      { author: 'Kunal Joshi', text: 'Need a USB-C to dual HDMI 60Hz adapter for Figma design reviews on external monitors.', timestamp: '2026-10-02 09:15', isStaff: false },
    ],
  },
];

// ==========================================
// 7. 5 PERFORMANCE REVIEWS
// ==========================================
export const PRODUCTION_PERFORMANCE_REVIEWS: AppraisalReview[] = [
  {
    id: 'rev-01',
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: 'emp-03',
    employeeName: 'Vikram Malhotra',
    cycle: 'H1 2026 (Apr - Sep)',
    selfRating: 4.8,
    managerRating: 4.9,
    peerRating: 4.7,
    finalScore: 4.8,
    feedbackSummary: 'Vikram has been exemplary in mentoring the 5 web developers, ensuring code reviews adhere to clean architecture, and driving zero downtime during all staging-to-production releases.',
    status: 'Completed',
    reviewedBy: 'Rajesh Sharma',
    submittedAt: '2026-09-28',
  },
  {
    id: 'rev-02',
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: 'emp-04',
    employeeName: 'Sneha Kulkarni',
    cycle: 'H1 2026 (Apr - Sep)',
    selfRating: 4.6,
    managerRating: 4.8,
    peerRating: 4.8,
    finalScore: 4.7,
    feedbackSummary: 'Sneha spearheaded the unified Arqensial UI component library, slashing design-to-development cycle times by 35%. Exceptional team collaboration and empathy in user research.',
    status: 'Completed',
    reviewedBy: 'Rajesh Sharma',
    submittedAt: '2026-09-27',
  },
  {
    id: 'rev-03',
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: 'emp-05',
    employeeName: 'Rohan Deshmukh',
    cycle: 'H1 2026 (Apr - Sep)',
    selfRating: 4.5,
    managerRating: 4.7,
    peerRating: 4.6,
    finalScore: 4.6,
    feedbackSummary: 'Rohan delivered outstanding organic growth for our key healthcare and financial clients, growing organic search volume by over 48% through technical Core Web Vitals remediation.',
    status: 'Completed',
    reviewedBy: 'Priya Nair',
    submittedAt: '2026-09-29',
  },
  {
    id: 'rev-04',
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: 'emp-07',
    employeeName: 'Aditya Verma',
    cycle: 'H1 2026 (Apr - Sep)',
    selfRating: 4.4,
    managerRating: 4.6,
    peerRating: 4.5,
    finalScore: 4.5,
    feedbackSummary: 'Aditya demonstrated superior TypeScript craftsmanship, refactoring high-traffic API modules with strict typing and unit tests. Ready for Senior Developer leadership progression.',
    status: 'Completed',
    reviewedBy: 'Vikram Malhotra',
    submittedAt: '2026-09-26',
  },
  {
    id: 'rev-05',
    tenantId: TENANT_ARQENSIAL_ID,
    employeeId: 'emp-21',
    employeeName: 'Siddharth Singhania',
    cycle: 'H1 2026 (Apr - Sep)',
    selfRating: 4.9,
    managerRating: 4.8,
    peerRating: 4.7,
    finalScore: 4.8,
    feedbackSummary: 'Siddharth surpassed his H1 enterprise sales targets by 124%, closing two landmark long-term web technology contracts in the BKC financial district.',
    status: 'Completed',
    reviewedBy: 'Rajesh Sharma',
    submittedAt: '2026-09-30',
  },
];

// ==========================================
// 8. SUPPORTING OKRs, ASSETS, DOCS, POSTS, AUDIT
// ==========================================
export const PRODUCTION_GOALS: GoalOKR[] = [
  {
    id: 'okr-01',
    tenantId: TENANT_ARQENSIAL_ID,
    title: 'Achieve ₹50M Annual Recurring Revenue Run Rate',
    level: 'Company',
    ownerName: 'Rajesh Sharma',
    cycle: 'FY 2026-27',
    progress: 74,
    targetValue: 50,
    currentValue: 37,
    unit: '₹M ARR',
    status: 'On Track',
    keyResults: [
      { id: 'kr-1', title: 'Close 12 enterprise digital transformation retainers', progress: 83 },
      { id: 'kr-2', title: 'Maintain net client retention at > 96%', progress: 95 },
      { id: 'kr-3', title: 'Expand cross-selling SEO + Development bundles', progress: 68 },
    ],
  },
  {
    id: 'okr-02',
    tenantId: TENANT_ARQENSIAL_ID,
    title: 'Elevate Web Architecture to 99.99% Availability & Sub-100ms API Latency',
    level: 'Department',
    ownerName: 'Vikram Malhotra',
    cycle: 'Q3 2026',
    progress: 88,
    targetValue: 100,
    currentValue: 88,
    unit: '% Health',
    status: 'On Track',
    keyResults: [
      { id: 'kr-4', title: 'Migrate core APIs to distributed edge caching', progress: 100 },
      { id: 'kr-5', title: 'Implement automated regression test suites on CI/CD', progress: 85 },
      { id: 'kr-6', title: 'Achieve zero security audit vulnerabilities', progress: 92 },
    ],
  },
];

export const PRODUCTION_ASSETS: Asset[] = [
  { id: 'ast-01', tenantId: TENANT_ARQENSIAL_ID, assetCode: 'AQ-LAP-001', name: 'MacBook Pro 16" M3 Pro 36GB', category: 'Laptop', brandModel: 'Apple MacBook Pro M3', serialNumber: 'C02G1234MD6R', assignedToEmployeeId: 'emp-01', assignedToEmployeeName: 'Rajesh Sharma', assignedDate: '2024-01-10', condition: 'Excellent', status: 'Allocated' },
  { id: 'ast-02', tenantId: TENANT_ARQENSIAL_ID, assetCode: 'AQ-LAP-003', name: 'MacBook Pro 14" M3 18GB', category: 'Laptop', brandModel: 'Apple MacBook Pro M3', serialNumber: 'C02G2345MD7S', assignedToEmployeeId: 'emp-03', assignedToEmployeeName: 'Vikram Malhotra', assignedDate: '2024-01-12', condition: 'Excellent', status: 'Allocated' },
  { id: 'ast-03', tenantId: TENANT_ARQENSIAL_ID, assetCode: 'AQ-MON-004', name: 'Dell UltraSharp 27" 4K Monitor', category: 'Monitor', brandModel: 'Dell U2723QE', serialNumber: 'CN-0M8921-742', assignedToEmployeeId: 'emp-04', assignedToEmployeeName: 'Sneha Kulkarni', assignedDate: '2024-01-15', condition: 'Excellent', status: 'Allocated' },
  { id: 'ast-04', tenantId: TENANT_ARQENSIAL_ID, assetCode: 'AQ-LAP-007', name: 'Dell Latitude 7440 Intel Core i7', category: 'Laptop', brandModel: 'Dell Latitude 7440', serialNumber: 'DL-99482-IN', assignedToEmployeeId: 'emp-07', assignedToEmployeeName: 'Aditya Verma', assignedDate: '2024-01-20', condition: 'Good', status: 'Allocated' },
];

export const PRODUCTION_DOCUMENTS: CompanyDocument[] = [
  { id: 'doc-01', tenantId: TENANT_ARQENSIAL_ID, title: 'Arqensial Comprehensive Employee Handbook & Workplace Code 2026', category: 'Handbook', version: '4.0', updatedDate: '2026-01-01', fileSize: '2.4 MB', fileType: 'PDF', requiresEsign: true, signedCount: 25 },
  { id: 'doc-02', tenantId: TENANT_ARQENSIAL_ID, title: 'Information Security & Dual-Factor Data Protection Standards', category: 'Policy', version: '2.3', updatedDate: '2026-03-15', fileSize: '1.6 MB', fileType: 'PDF', requiresEsign: true, signedCount: 25 },
  { id: 'doc-03', tenantId: TENANT_ARQENSIAL_ID, title: 'Prevention of Sexual Harassment (POSH) Statutory Policy', category: 'Policy', version: '3.1', updatedDate: '2026-01-10', fileSize: '1.2 MB', fileType: 'PDF', requiresEsign: true, signedCount: 25 },
];

export const PRODUCTION_FEED_POSTS: FeedPost[] = [
  {
    id: 'feed-01',
    tenantId: TENANT_ARQENSIAL_ID,
    authorName: 'Rajesh Sharma',
    authorRole: 'CEO',
    type: 'Announcement',
    content: '🚀 Proud to announce that Arqensial Technologies has officially crossed 25 team members across our Mumbai HQ and Mira Road offices! Big congratulations to all departments for delivering exceptional outcomes for our enterprise clients.',
    timestamp: '2 hours ago',
    likes: 24,
    userLiked: true,
    comments: [
      { author: 'Vikram Malhotra', text: 'Incredible milestone! Engineering team is firing on all cylinders.', timestamp: '1 hour ago' },
      { author: 'Ananya Iyer', text: 'Welcome to all our new joiners across both offices!', timestamp: '45 mins ago' },
    ],
  },
  {
    id: 'feed-02',
    tenantId: TENANT_ARQENSIAL_ID,
    authorName: 'Sneha Kulkarni',
    authorRole: 'Team Leader - UI/UX',
    type: 'Kudos',
    badgeType: 'Star Performer',
    recipientName: 'Kunal Joshi',
    content: 'Kudos to Kunal Joshi for designing our stunning new dark-mode design token system! Client review scores reached 9.8/10.',
    timestamp: '1 day ago',
    likes: 19,
    userLiked: true,
    comments: [
      { author: 'Kunal Joshi', text: 'Thank you Sneha! Glad the accessibility contrast passed WCAG AAA.', timestamp: '18 hours ago' },
    ],
  },
];

export const PRODUCTION_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-01', tenantId: TENANT_ARQENSIAL_ID, action: 'TENANT_INITIALIZATION', performedBy: 'Rajesh Sharma', role: 'company_admin', ipAddress: '182.72.138.42', resourceType: 'ORGANIZATION', details: 'Arqensial Technologies Pvt Ltd enterprise tenant initialized with 25 employees across 8 departments.', timestamp: '2026-10-01 09:00:00 IST' },
  { id: 'log-02', tenantId: TENANT_ARQENSIAL_ID, action: 'PAYROLL_PROCESSED', performedBy: 'Sunita Hegde', role: 'payroll_manager', ipAddress: '182.72.138.42', resourceType: 'PAYROLL_RUN', details: 'September 2026 payroll batch payrun-2026-09 processed for 25 employees. Total Gross: ₹20,85,000.', timestamp: '2026-09-30 17:30:00 IST' },
  { id: 'log-03', tenantId: TENANT_ARQENSIAL_ID, action: 'POLICY_VERIFICATION', performedBy: 'Ananya Iyer', role: 'hr_manager', ipAddress: '182.72.138.42', resourceType: 'COMPLIANCE', details: 'EPFO ECR 2.0 and ESIC statutory registers reconciled with zero variance.', timestamp: '2026-09-29 14:15:00 IST' },
];

export const PRODUCTION_ONBOARDING_TASKS: OnboardingTask[] = [
  { id: 'onb-01', tenantId: TENANT_ARQENSIAL_ID, candidateId: 'cand-02', candidateName: 'Pallavi Chhabra', role: 'Lead UI/UX Product Designer', title: 'Generate Appointment Letter & EPF Declaration Form 11', category: 'Documentation', assignedTo: 'Ananya Iyer', status: 'Completed', dueDate: '2026-10-05' },
  { id: 'onb-02', tenantId: TENANT_ARQENSIAL_ID, candidateId: 'cand-02', candidateName: 'Pallavi Chhabra', role: 'Lead UI/UX Product Designer', title: 'Provision Apple M3 MacBook & BKC Office Access Card', category: 'IT Asset', assignedTo: 'IT Desk Mumbai', status: 'Pending', dueDate: '2026-10-08' },
];

export const PRODUCTION_RESIGNATIONS: ResignationRequest[] = [];
