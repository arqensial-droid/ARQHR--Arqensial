export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'hr_manager'
  | 'team_leader'
  | 'manager'
  | 'employee'
  | 'payroll_manager'
  | 'recruiter';

export type CountryCode = 'IN' | 'US' | 'GB' | 'AE' | 'SG';

export interface CountryStatutoryFieldDef {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  masked?: boolean;
  helperText?: string;
  formatRegex?: string;
}

export interface CountryDefinition {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  defaultTimezone: string;
  defaultDateFormat: string;
  defaultTimeFormat: '12h' | '24h';
  phoneCode: string;
  financialYear: string;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  registrationNumberLabel: string;
  statutoryIdentLabel: string;
  routingCodeLabel: string;
  statutoryFields: CountryStatutoryFieldDef[];
  payrollRules: {
    salaryCycleOptions: ('Monthly' | 'Weekly' | 'Biweekly' | 'Semi-Monthly')[];
    defaultSalaryCycle: 'Monthly' | 'Weekly' | 'Biweekly' | 'Semi-Monthly';
    standardDivisor: 'Calendar Days' | 'Working Days' | 'Fixed 30 Days';
    statutoryComponents: Array<{
      id: string;
      name: string;
      type: 'earning' | 'deduction';
      isStatutory: boolean;
      formulaDescription: string;
    }>;
  };
}

export interface TenantCountryConfig {
  tenantId: string;
  countryCode: CountryCode;
  legalCompanyName: string;
  companyTaxId: string;
  registrationNumber: string;
  stateProvince: string;
  city: string;
  financialYear: string;
  salaryCycle: 'Monthly' | 'Weekly' | 'Biweekly' | 'Semi-Monthly' | 'Custom';
  salaryPaymentDate: number;
  weeklyWorkingDays: number;
  weekendDays: string[];
  officialLanguage: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  payrollEnabled: boolean;
  attendanceEnabled: boolean;
  leaveEnabled: boolean;
  statutoryComplianceEnabled: boolean;
  countrySpecificData?: Record<string, any>;
}

export interface CompanyPayrollSettings {
  tenantId: string;
  salaryCycle: 'Monthly' | 'Weekly' | 'Biweekly' | 'Semi-Monthly' | 'Custom';
  payrollCutOffDay: number;
  salaryProcessingDay: number;
  salaryPaymentDay: number;
  attendanceLockDay: number;
  leaveLockDay: number;
  payrollDivisor: 'Calendar Days' | 'Working Days' | 'Fixed 30 Days' | 'Custom';
  customDivisorDays?: number;
  gracePeriodMinutes: number;
  lateMarkRule: {
    enabled: boolean;
    maxLateAllowedPerMonth: number;
    actionAfterThreshold: 'Half Day LOP' | 'Full Day LOP' | 'Warning Only' | 'Custom Deduction';
    lopDaysPerExcessLate: number;
  };
  halfDayThresholdHours: number;
  overtimeCalculationRule: {
    enabled: boolean;
    rateMultiplier: number;
    minMinutesForOvertime: number;
  };
  lopRule: {
    enabled: boolean;
    deductFromBasicOnly: boolean;
    deductFromGross: boolean;
  };
  weekendRule: {
    isPaid: boolean;
    requiresPresentAdjacent: boolean;
  };
  holidayRule: {
    isPaid: boolean;
  };
}

export interface AttendancePayrollSummary {
  employeeId: string;
  employeeName: string;
  empCode: string;
  totalMonthDays: number;
  payableDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  halfDays: number;
  lateMarksCount: number;
  latePenaltyLopDays: number;
  holidaysCount: number;
  weekOffsCount: number;
  wfhDays: number;
  overtimeHours: number;
  totalLopDays: number;
  isProrated: boolean;
  prorateReason?: string;
}

export interface DigitalIdCard {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  designation: string;
  department: string;
  photoUrl: string;
  companyName: string;
  companyLogo: string;
  bloodGroup?: string;
  joiningDate: string;
  workLocation: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  validityDate: string;
  qrVerificationToken: string;
  verifiedStatus: 'Active' | 'Revoked' | 'Expired';
}

export interface EmployeeBankAccount {
  id: string;
  tenantId: string;
  employeeId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  routingOrIfscOrSortCode: string;
  routingLabel: string;
  branchName: string;
  accountType: 'Savings' | 'Checking' | 'Current' | 'Salary';
  paymentMethod: 'Direct Deposit' | 'WPS Transfer' | 'NEFT/RTGS' | 'BACS' | 'GIRO' | 'Cheque';
  upiId?: string;
  currency: string;
  countryCode: CountryCode;
  isVerified: boolean;
  updatedAt: string;
}

export interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  type: 'Joined' | 'Promoted' | 'Salary Revised' | 'Transferred' | 'Manager Changed' | 'Leave Approved' | 'Asset Assigned' | 'Performance Review' | 'Resignation' | 'Exit Completed' | 'Document Uploaded';
  title: string;
  description: string;
  actor: string;
  badge?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo: string;
  industry: string;
  companyCode?: string;
  website?: string;
  gstNumber?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  subscriptionPlan?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  planId?: 'starter' | 'growth' | 'enterprise' | 'managed';
  planName?: string;
  employeeCount: number;
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  countryCode?: CountryCode;
  legalCompanyName?: string;
  companyTaxId?: string;
  registrationNumber?: string;
  timezone: string;
  currency: string;
  currencySymbol?: string;
  contactEmail: string;
  contactPhone: string;
  mrr: number;
  createdAt: string;
  countryConfig?: TenantCountryConfig;
  payrollSettings?: CompanyPayrollSettings;
  settings: {
    attendanceEnabled?: boolean;
    leaveEnabled?: boolean;
    payrollEnabled?: boolean;
    forcePasswordChangeOnFirstLogin?: boolean;
    geoFencingEnabled: boolean;
    selfieAttendanceEnabled: boolean;
    ipRestrictionEnabled: boolean;
    twoFactorEnforced: boolean;
    allowedIps: string[];
    officeCoordinates: {
      lat: number;
      lng: number;
      radiusMeters: number;
    };
  };
}

export interface CreateCompanyFormValues {
  companyName: string;
  companyCode: string;
  country: string;
  countryCode?: CountryCode;
  timezone: string;
  logo: string;
  businessType?: string;
  primaryAdmin: {
    fullName: string;
    email: string;
    mobileNumber: string;
    temporaryPassword?: string;
    forcePasswordChange?: boolean;
    sendWelcomeEmail?: boolean;
  };
  settings: {
    attendanceEnabled: boolean;
    leaveEnabled: boolean;
    payrollEnabled: boolean;
  };
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'ID Proof' | 'Offer Letter' | 'Degree Certificate' | 'Payslip Previous' | 'Tax Form' | 'Contract';
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  fileSize: string;
  verifiedBy?: string;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  ifscSwift: string;
  branch: string;
  panNumber: string;
  uanNumber: string;
}

export interface SalaryStructure {
  annualCTC: number;
  monthlyGross: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  performanceBonus: number;
  pfEmployee: number;
  pfEmployer: number;
  esi: number;
  professionalTax: number;
  tdsMonthly: number;
  netMonthly: number;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface ExperienceRecord {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface EducationRecord {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

export interface EmployeeNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  empCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  departmentId: string;
  departmentName: string;
  department?: string;
  designation: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  employmentType: 'Full-Time' | 'Contract' | 'Intern' | 'Part-Time';
  joiningDate: string;
  dateOfJoining?: string;
  exitDate?: string;
  status: 'Active' | 'Probation' | 'Notice' | 'Terminated';
  location: string;
  workShift: string;
  role: UserRole;
  gender?: string;
  dob?: string;
  address?: string;
  emergencyContact?: string;
  panNumber?: string;
  signatureUrl?: string;
  bloodGroup?: string;
  countryCode?: CountryCode;
  idCard?: DigitalIdCard;
  digitalIdCard?: any;
  bankAccountDetails?: EmployeeBankAccount;
  activityTimeline?: ActivityTimelineItem[];
  statutoryData?: Record<string, string>;
  documents: EmployeeDocument[];
  bankDetails: BankDetails;
  salaryStructure: SalaryStructure;
  emergencyContacts: EmergencyContact[];
  skills: string[];
  experience: ExperienceRecord[];
  education: EducationRecord[];
  notes: EmployeeNote[];
}

export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  headEmployeeId?: string;
  headEmployeeName?: string;
  employeeCount: number;
  annualBudget: number;
  location: string;
}

export interface Team {
  id: string;
  tenantId: string;
  departmentId: string;
  departmentName: string;
  name: string;
  leadEmployeeId: string;
  leadEmployeeName: string;
  memberCount: number;
}

export interface Designation {
  id: string;
  tenantId: string;
  title: string;
  departmentId: string;
  departmentName: string;
  level: string;
  minSalary: number;
  maxSalary: number;
}

export interface BranchLocation {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  geoRadiusMeters: number;
  latitude: number;
  longitude: number;
  ipWhitelists: string[];
  activeEmployees: number;
}

export interface CostCenter {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  allocatedBudget: number;
  spentBudget: number;
  managerName: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  durationHours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Holiday';
  checkInMethod: 'Web' | 'Mobile' | 'Biometric' | 'Selfie';
  location: {
    lat: number;
    lng: number;
    address: string;
    withinGeoFence: boolean;
  };
  isWFH: boolean;
  ipAddress: string;
  selfieUrl?: string;
  regularizationRequested?: boolean;
  regularizationReason?: string;
  regularizationStatus?: 'Pending' | 'Approved' | 'Rejected';
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  halfDayThresholdHours: number;
  isRotational: boolean;
  assignedCount: number;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  department: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp Off' | 'Maternity Leave' | 'Paternity Leave' | 'Custom';
  startDate: string;
  endDate: string;
  daysCount: number;
  halfDay: boolean;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  appliedOn: string;
  managerComment?: string;
}

export interface LeaveBalance {
  employeeId: string;
  casualLeave: { total: number; used: number; balance: number };
  sickLeave: { total: number; used: number; balance: number };
  earnedLeave: { total: number; used: number; balance: number };
  compOff: { total: number; used: number; balance: number };
}

export interface Holiday {
  id: string;
  tenantId: string;
  name: string;
  date: string;
  day: string;
  type: 'Mandatory' | 'Optional';
  description: string;
}

export interface PayrollRun {
  id: string;
  tenantId: string;
  month: string;
  periodStart: string;
  periodEnd: string;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  totalEmployees: number;
  status: 'Draft' | 'Processed' | 'Locked' | 'Disbursed';
  processedAt?: string;
  disbursedAt?: string;
  processedBy?: string;
}

export interface Payslip {
  id: string;
  tenantId: string;
  payrollRunId: string;
  payslipNumber?: string;
  countryCode?: CountryCode;
  currency?: string;
  currencySymbol?: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  designation: string;
  department: string;
  joiningDate: string;
  panNumber: string;
  uanNumber: string;
  taxIdMasked?: string;
  bankAccount: string;
  bankAccountMasked?: string;
  bankName: string;
  month: string;
  totalCalendarDays?: number;
  daysWorked: number;
  presentDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  daysLop: number;
  holidaysCount?: number;
  weekOffsCount?: number;
  overtimeHours?: number;
  overtimePay?: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  performanceBonus: number;
  grossEarnings: number;
  earningsBreakdown?: Array<{ name: string; amount: number; isTaxable?: boolean }>;
  deductionsBreakdown?: Array<{ name: string; amount: number; isStatutory?: boolean }>;
  pfDeduction: number;
  esiDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  totalDeductions: number;
  netPayable: number;
  netPayInWords?: string;
  qrVerificationToken?: string;
  status: 'Generated' | 'Disbursed';
  generatedDate: string;
  disbursedDate?: string;
}

export interface JobRequisition {
  id: string;
  tenantId: string;
  jobCode: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'Full-Time' | 'Contract' | 'Remote';
  experienceRequired: string;
  openPositions: number;
  status: 'Active' | 'Draft' | 'Closed';
  salaryRange: string;
  createdDate: string;
  hiringManager: string;
  applicantsCount: number;
  description: string;
  requirements: string[];
}

export interface Candidate {
  id: string;
  tenantId: string;
  requisitionId: string;
  requisitionTitle: string;
  name: string;
  email: string;
  phone: string;
  stage: 'Sourced' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Archived';
  rating: number;
  experienceYears: number;
  currentCompany: string;
  noticePeriodDays: number;
  resumeSummary: string;
  interviewDate?: string;
  interviewNotes?: string;
  offerAmount?: number;
  appliedDate: string;
}

export interface OnboardingTask {
  id: string;
  tenantId: string;
  candidateId: string;
  candidateName: string;
  role: string;
  title: string;
  category: 'Documentation' | 'IT Asset' | 'Compliance' | 'Welcome Kit' | 'Induction';
  assignedTo: string;
  status: 'Pending' | 'Completed';
  dueDate: string;
}

export interface ResignationRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  department: string;
  submissionDate: string;
  desiredExitDate: string;
  officialLastWorkingDay: string;
  noticePeriodDays: number;
  reason: string;
  status: 'Submitted' | 'Approved' | 'Clearance In Progress' | 'Completed';
  clearances: {
    it: boolean;
    hr: boolean;
    finance: boolean;
    admin: boolean;
  };
  fnfAmount?: number;
  exitInterviewCompleted: boolean;
  exitFeedback?: string;
}

export interface GoalOKR {
  id: string;
  tenantId: string;
  title: string;
  level: 'Company' | 'Department' | 'Individual';
  ownerName: string;
  cycle: string;
  progress: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  keyResults: Array<{ id: string; title: string; progress: number }>;
}

export interface AppraisalReview {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  cycle: string;
  selfRating: number;
  managerRating: number;
  peerRating: number;
  finalScore: number;
  feedbackSummary: string;
  status: 'Draft' | 'Submitted' | 'Completed';
  reviewedBy: string;
  submittedAt: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  assetCode: string;
  name: string;
  category: 'Laptop' | 'Monitor' | 'Mobile' | 'Peripherals';
  brandModel: string;
  serialNumber: string;
  assignedToEmployeeId?: string;
  assignedToEmployeeName?: string;
  assignedDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Maintenance Required';
  status: 'Allocated' | 'In Stock' | 'Retired';
}

export interface ExpenseClaim {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  title: string;
  category: 'Travel' | 'Meal' | 'Equipment' | 'Software' | 'Training';
  amount: number;
  currency: string;
  expenseDate: string;
  receiptName: string;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Reimbursed';
  approvedBy?: string;
  notes?: string;
}

export interface HelpdeskTicket {
  id: string;
  tenantId: string;
  ticketCode: string;
  employeeId: string;
  employeeName: string;
  subject: string;
  category: 'HR Support' | 'IT Support' | 'Payroll Query' | 'Facilities';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  slaHoursLeft: number;
  assignedTo?: string;
  thread: Array<{
    author: string;
    text: string;
    timestamp: string;
    isStaff: boolean;
  }>;
}

export interface CompanyDocument {
  id: string;
  tenantId: string;
  title: string;
  category: 'Policy' | 'Handbook' | 'Template' | 'Legal';
  version: string;
  updatedDate: string;
  fileType: string;
  fileSize: string;
  requiresEsign: boolean;
  signedCount?: number;
}

export interface FeedPost {
  id: string;
  tenantId: string;
  authorName: string;
  authorRole: string;
  type: 'Announcement' | 'Birthday' | 'Anniversary' | 'Kudos' | 'Poll';
  content: string;
  timestamp: string;
  likes: number;
  userLiked: boolean;
  badgeType?: 'Star Performer' | 'Innovation Champion' | 'Team Player' | 'Customer Hero';
  recipientName?: string;
  pollData?: {
    question: string;
    options: Array<{ id: string; text: string; votes: number }>;
    userVotedOptionId?: string;
  };
  comments: Array<{
    author: string;
    text: string;
    timestamp: string;
  }>;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  action: string;
  performedBy: string;
  role: string;
  ipAddress: string;
  timestamp: string;
  resourceType: string;
  details: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerUserMonthly: number;
  maxUsers: number;
  features: string[];
  storageLimit: string;
  supportLevel: string;
}

// -----------------------------------------------------------------------------
// INDIA STATUTORY COMPLIANCE & PAYROLL TYPES
// -----------------------------------------------------------------------------
export interface StatutoryConfig {
  tenantId: string;
  epfEnabled: boolean;
  epfWageLimit: number; // ₹15,000 ceiling
  epfEmployeeRate: number; // 12%
  epfEmployerRate: number; // 12% (3.67% EPF + 8.33% EPS)
  epfEdliRate: number; // 0.5%
  epfAdminRate: number; // 0.5%
  esicEnabled: boolean;
  esicWageLimit: number; // ₹21,000 ceiling
  esicEmployeeRate: number; // 0.75%
  esicEmployerRate: number; // 3.25%
  statePtCode: 'MH' | 'KA' | 'TN' | 'TG' | 'DL' | 'WB';
  lwfEnabled: boolean;
  gratuityEnabled: boolean;
  bonusActRate: number; // 8.33% minimum to 20%
}

export interface TaxRegimeDeclaration {
  id: string;
  employeeId: string;
  tenantId: string;
  financialYear: string;
  chosenRegime: 'Old' | 'New';
  section80C: number;
  section80D: number;
  nps80CCD: number;
  hraExemptionRentPaid: number;
  homeLoanInterest80EEA: number;
  otherIncome: number;
  status: 'Draft' | 'Submitted' | 'Verified' | 'Locked';
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface StatutoryChallanECR {
  id: string;
  tenantId: string;
  month: string;
  challanType: 'EPF_ECR' | 'ESIC_MONTHLY' | 'PT_CHALLAN' | 'TDS_24Q';
  totalEmployeesCovered: number;
  totalWages: number;
  employeeContribution: number;
  employerContribution: number;
  totalChallanAmount: number;
  trnNumber?: string;
  status: 'Generated' | 'Submitted_To_Portal' | 'Paid';
  generatedAt: string;
  fileData?: string;
}

// -----------------------------------------------------------------------------
// WORKFLOW LIFECYCLE & MULTI-TIER APPROVAL TYPES
// -----------------------------------------------------------------------------
export type WorkflowType = 
  | 'onboarding_joining'
  | 'promotion_transfer'
  | 'salary_revision'
  | 'exit_clearance'
  | 'leave_approval'
  | 'expense_reimbursement';

export interface WorkflowRule {
  id: string;
  tenantId: string;
  workflowType: WorkflowType;
  name: string;
  description: string;
  approvalSteps: Array<{
    stepNumber: number;
    stepName: string;
    approverRole: UserRole;
    slaHours: number;
    canAutoApproveIfUnderThreshold?: number;
  }>;
  isActive: boolean;
}

export interface SalaryRevisionRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  currentCTC: number;
  proposedCTC: number;
  percentageHike: number;
  effectiveDate: string;
  reason: 'Annual Appraisal' | 'Promotion' | 'Market Correction' | 'Retention';
  arrearsApplicable: boolean;
  arrearsAmount: number;
  status: 'Draft' | 'Pending_Manager' | 'Pending_HR' | 'Pending_Finance' | 'Approved' | 'Implemented' | 'Rejected';
  approvals: Array<{
    step: string;
    approverName: string;
    action: 'Approved' | 'Rejected';
    timestamp: string;
    remarks: string;
  }>;
}

export interface PromotionRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  currentDesignation: string;
  currentDepartment: string;
  proposedDesignation: string;
  proposedDepartment: string;
  newSalaryCTC: number;
  effectiveDate: string;
  justification: string;
  status: 'Pending_Approval' | 'Approved' | 'Completed' | 'Rejected';
  managerSignOff: boolean;
  hrSignOff: boolean;
  vpSignOff: boolean;
}

// -----------------------------------------------------------------------------
// AI INTELLIGENCE SUITE TYPES
// -----------------------------------------------------------------------------
export interface CandidateScreeningScore {
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  overallMatchScore: number; // 0-100%
  skillsMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  keyStrengths: string[];
  missingKeywords: string[];
  recommendation: 'Strong Hire' | 'Shortlist' | 'Borderline' | 'Reject';
  aiSummary: string;
}

export interface AttritionRiskProfile {
  employeeId: string;
  employeeName: string;
  department: string;
  tenureMonths: number;
  riskScore: number; // 0-100%
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  topDrivers: string[];
  recommendedRetentionActions: string[];
}

export interface PayrollAnomalyAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  anomalyType: 'Sudden LOP Spike' | 'Overtime Outlier' | 'TDS Discrepancy' | 'Negative Net Pay Risk' | 'Arrears Mismatch';
  severity: 'Critical' | 'Warning' | 'Info';
  description: string;
  variancePercentage: number;
  suggestedResolution: string;
}

export interface EnterpriseUsageStats {
  tenantId: string;
  activeLicenses: number;
  allocatedLicenses: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
  apiRequestsThisMonth: number;
  apiMonthlyLimit: number;
  customDomainConfigured: boolean;
  whiteLabelTheme: {
    primaryColor: string;
    brandName: string;
    logoUrl?: string;
  };
}

export * from './files';
