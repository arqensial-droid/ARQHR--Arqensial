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

// Zero seeded operational records - Fresh production state
export const PRODUCTION_ATTENDANCE: AttendanceRecord[] = [];
export const PRODUCTION_JOB_REQUISITIONS: JobRequisition[] = [];
export const PRODUCTION_CANDIDATES: Candidate[] = [];
export const PRODUCTION_LEAVE_REQUESTS: LeaveRequest[] = [];
export const PRODUCTION_LEAVE_BALANCES: Record<string, LeaveBalance> = {};
export const PRODUCTION_PAYROLL_RUNS: PayrollRun[] = [];
export const PRODUCTION_PAYSLIPS: Payslip[] = [];
export const PRODUCTION_EXPENSES: ExpenseClaim[] = [];
export const PRODUCTION_TICKETS: HelpdeskTicket[] = [];
export const PRODUCTION_PERFORMANCE_REVIEWS: AppraisalReview[] = [];
export const PRODUCTION_GOALS: GoalOKR[] = [];
export const PRODUCTION_ASSETS: Asset[] = [];
export const PRODUCTION_DOCUMENTS: CompanyDocument[] = [];
export const PRODUCTION_FEED_POSTS: FeedPost[] = [];
export const PRODUCTION_AUDIT_LOGS: AuditLog[] = [];
export const PRODUCTION_ONBOARDING_TASKS: OnboardingTask[] = [];
export const PRODUCTION_RESIGNATIONS: ResignationRequest[] = [];
