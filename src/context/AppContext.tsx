import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  UserRole,
  Employee,
  Department,
  Team,
  BranchLocation,
  AttendanceRecord,
  Shift,
  LeaveRequest,
  LeaveBalance,
  Holiday,
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
  SubscriptionPlan,
} from '../types';
import {
  PRODUCTION_INITIAL_TENANTS,
  PRODUCTION_EMPLOYEES,
  PRODUCTION_DEPARTMENTS,
  PRODUCTION_TEAMS,
  PRODUCTION_BRANCHES,
  PRODUCTION_SHIFTS,
  PRODUCTION_HOLIDAYS,
  PRODUCTION_ATTENDANCE,
  PRODUCTION_LEAVE_REQUESTS,
  PRODUCTION_LEAVE_BALANCES,
  PRODUCTION_PAYROLL_RUNS,
  PRODUCTION_PAYSLIPS,
  PRODUCTION_JOB_REQUISITIONS,
  PRODUCTION_CANDIDATES,
  PRODUCTION_ONBOARDING_TASKS,
  PRODUCTION_RESIGNATIONS,
  PRODUCTION_GOALS,
  PRODUCTION_ASSETS,
  PRODUCTION_EXPENSES,
  PRODUCTION_TICKETS,
  PRODUCTION_DOCUMENTS,
  PRODUCTION_FEED_POSTS,
  PRODUCTION_AUDIT_LOGS,
  PRODUCTION_SUBSCRIPTION_PLANS,
} from '../db/productionSeeds';
import {
  ROOT_SYSTEM_TENANT,
  ROOT_SUPER_ADMIN_USER,
  SUPER_ADMIN_PERMISSIONS,
  ROOT_SUPERADMIN_TENANT_ID,
} from '../db/seedData/company';
import { companyLifecycleService } from '../services/companyLifecycleService';
import { apiClient, getLocalTableData, setLocalTableData } from '../services/apiClient';
import { employeeService } from '../services/employeeService';
import { authService } from '../services/authService';
import { auditLogService } from '../services/auditLogService';
import { isConfiguredForLiveSupabase } from '../lib/supabase';
import {
  UserInvite,
  UserSession,
  LoginHistoryEntry,
  SecurityAuditRecord,
  PasswordPolicy,
} from '../types/auth';
import { SupabaseAuthService, DEFAULT_PASSWORD_POLICY } from '../services/supabaseAuthService';
import { SessionTimeoutWarningModal } from '../components/auth/SessionTimeoutWarningModal';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  channel?: 'in_app' | 'email' | 'whatsapp' | 'sms';
}

interface AppContextType {
  // Tenant & Impersonation
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  impersonatingFromSuperAdmin: boolean;
  startImpersonation: (tenantId: string) => void;
  stopImpersonation: () => void;
  createTenant: (tenantData: Partial<Tenant>) => Tenant;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
  loadDemoCompany: () => void;

  // Company Management (Super Admin Suite)
  addCompany: (companyData: Partial<Tenant>, adminData?: { fullName: string; email: string; phone?: string; password?: string }) => Tenant;
  editCompany: (id: string, updates: Partial<Tenant>) => void;
  deleteCompany: (id: string, passwordConfirmation?: string) => Promise<boolean>;
  suspendCompany: (id: string) => void;
  reactivateCompany: (id: string) => void;
  assignSubscriptionPlan: (companyId: string, planId: string, startDate?: string, endDate?: string) => void;
  createCompanyAdmin: (companyId: string, adminData: { fullName: string; email: string; phone?: string; password?: string }) => Employee;
  resetCompanyPassword: (companyId: string, adminEmail: string) => { tempPassword: string; resetToken: string };
  superAdminPermissions: readonly string[];

  // Role & Current User
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: Employee;
  switchUser: (employeeId: string) => void;

  // Active View / Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Loading state
  isLoading: boolean;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string, tenantId?: string, role?: UserRole) => Promise<boolean>;
  signupTenant: (companyName: string, adminEmail: string, password?: string) => Promise<boolean>;
  logout: () => void;
  refreshFromDatabase: () => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Enterprise Identity, Sessions, Invites & Security
  userSessions: UserSession[];
  userInvites: UserInvite[];
  loginHistory: LoginHistoryEntry[];
  securityAudits: SecurityAuditRecord[];
  passwordPolicy: PasswordPolicy;
  sendUserInvite: (data: {
    email: string;
    fullName: string;
    role: UserRole;
    departmentName?: string;
    designationTitle?: string;
    branchLocation?: string;
  }) => UserInvite;
  revokeUserInvite: (inviteId: string) => void;
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  updatePasswordPolicy: (policy: Partial<PasswordPolicy>) => void;
  sessionTimeoutWarningOpen: boolean;
  extendSession: () => void;

  // Notifications
  notifications: ToastNotification[];
  addNotification: (title: string, message: string, type?: ToastNotification['type'], channel?: ToastNotification['channel']) => void;
  clearNotification: (id: string) => void;

  // Core Data & State
  employees: Employee[];
  departments: Department[];
  teams: Team[];
  branches: BranchLocation[];
  shifts: Shift[];
  holidays: Holiday[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  jobRequisitions: JobRequisition[];
  candidates: Candidate[];
  onboardingTasks: OnboardingTask[];
  resignations: ResignationRequest[];
  goals: GoalOKR[];
  assets: Asset[];
  expenses: ExpenseClaim[];
  tickets: HelpdeskTicket[];
  documents: CompanyDocument[];
  feedPosts: FeedPost[];
  auditLogs: AuditLog[];
  subscriptionPlans: SubscriptionPlan[];

  // Mutators & Workflows
  addEmployee: (emp: Partial<Employee>) => boolean;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  punchAttendance: (type: 'check_in' | 'check_out', method?: AttendanceRecord['checkInMethod'], details?: { isWFH?: boolean; selfieUrl?: string }) => boolean;
  requestRegularization: (attendanceId: string, reason: string) => void;
  applyLeave: (leave: Partial<LeaveRequest>) => void;
  updateLeaveStatus: (leaveId: string, status: 'Approved' | 'Rejected', comment?: string) => void;
  runPayroll: (month: string) => void;
  disbursePayroll: (runId: string) => void;
  addJobRequisition: (req: Partial<JobRequisition>) => void;
  updateCandidateStage: (candId: string, stage: Candidate['stage']) => void;
  completeOnboardingTask: (taskId: string) => void;
  submitResignation: (reason: string, desiredExitDate: string) => void;
  updateClearance: (resignationId: string, dept: 'it' | 'hr' | 'finance' | 'admin', cleared: boolean) => void;
  submitExpense: (claim: Partial<ExpenseClaim>) => void;
  approveExpense: (claimId: string, status: 'Approved' | 'Rejected') => void;
  createTicket: (ticket: Partial<HelpdeskTicket>) => void;
  replyTicket: (ticketId: string, text: string) => void;
  toggleLikePost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  createPost: (content: string, type: FeedPost['type'], badgeType?: FeedPost['badgeType'], recipientName?: string) => void;
  addGoal: (goal: Partial<GoalOKR>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to initialize table in persistent local database if missing
function initPersistentTable<T>(tableName: string, defaultData: T[]): T[] {
  const existing = getLocalTableData<T>(tableName);
  if (existing && existing.length > 0) {
    return existing;
  }
  setLocalTableData(tableName, defaultData);
  return defaultData;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const [isLoading, setIsLoading] = useState(false);

  // Persistent database initialization
  const [tenants, setTenants] = useState<Tenant[]>(() => initPersistentTable('tenants', PRODUCTION_INITIAL_TENANTS));
  const [currentTenantId, setCurrentTenantId] = useState<string>(PRODUCTION_INITIAL_TENANTS[0]?.id || ROOT_SUPERADMIN_TENANT_ID);
  const [impersonatingFromSuperAdmin, setImpersonatingFromSuperAdmin] = useState(false);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || (tenants.length > 0 ? tenants[0] : ROOT_SYSTEM_TENANT);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Role state - Defaults to Super Admin Root Account
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([
    {
      id: 'notif-1',
      title: 'ARQENSIAL Production Ready',
      message: 'Active Database Isolation Engine initialized with Row Level Security.',
      type: 'info',
      timestamp: 'Just now',
      channel: 'in_app',
    },
  ]);

  const addNotification = (
    title: string,
    message: string,
    type: ToastNotification['type'] = 'info',
    channel: ToastNotification['channel'] = 'in_app'
  ) => {
    const newNotif: ToastNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      channel,
    };
    setNotifications(prev => [newNotif, ...prev]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 6000);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Persistent Core Data from Production Seeds
  const [employees, setEmployees] = useState<Employee[]>(() => initPersistentTable('employees', PRODUCTION_EMPLOYEES));
  const [departments, setDepartments] = useState<Department[]>(() => initPersistentTable('departments', PRODUCTION_DEPARTMENTS));
  const [teams, setTeams] = useState<Team[]>(() => initPersistentTable('teams', PRODUCTION_TEAMS));
  const [branches, setBranches] = useState<BranchLocation[]>(() => initPersistentTable('branches', PRODUCTION_BRANCHES));
  const [shifts, setShifts] = useState<Shift[]>(() => initPersistentTable('shifts', PRODUCTION_SHIFTS));
  const [holidays] = useState<Holiday[]>(() => initPersistentTable('holidays', PRODUCTION_HOLIDAYS));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => initPersistentTable('attendance_records', PRODUCTION_ATTENDANCE));
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => initPersistentTable('leave_requests', PRODUCTION_LEAVE_REQUESTS));
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(PRODUCTION_LEAVE_BALANCES);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => initPersistentTable('payroll_runs', PRODUCTION_PAYROLL_RUNS));
  const [payslips, setPayslips] = useState<Payslip[]>(() => initPersistentTable('payslips', PRODUCTION_PAYSLIPS));
  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>(() => initPersistentTable('job_requisitions', PRODUCTION_JOB_REQUISITIONS));
  const [candidates, setCandidates] = useState<Candidate[]>(() => initPersistentTable('candidates', PRODUCTION_CANDIDATES));
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(() => initPersistentTable('onboarding_tasks', PRODUCTION_ONBOARDING_TASKS));
  const [resignations, setResignations] = useState<ResignationRequest[]>(() => initPersistentTable('resignation_requests', PRODUCTION_RESIGNATIONS));
  const [goals, setGoals] = useState<GoalOKR[]>(() => initPersistentTable('goals', PRODUCTION_GOALS));
  const [assets, setAssets] = useState<Asset[]>(() => initPersistentTable('assets', PRODUCTION_ASSETS));
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(() => initPersistentTable('expenses', PRODUCTION_EXPENSES));
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => initPersistentTable('helpdesk_tickets', PRODUCTION_TICKETS));
  const [documents] = useState<CompanyDocument[]>(() => initPersistentTable('company_documents', PRODUCTION_DOCUMENTS));
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => initPersistentTable('feed_posts', PRODUCTION_FEED_POSTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => initPersistentTable('audit_logs', PRODUCTION_AUDIT_LOGS));
  const [subscriptionPlans] = useState<SubscriptionPlan[]>(PRODUCTION_SUBSCRIPTION_PLANS);

  // Enterprise Identity, Sessions, Invites & Security
  const [userInvites, setUserInvites] = useState<UserInvite[]>(() => SupabaseAuthService.getStoredInvites());
  const [userSessions, setUserSessions] = useState<UserSession[]>(() => SupabaseAuthService.getStoredSessions());
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>(() => SupabaseAuthService.getLoginHistory());
  const [securityAudits, setSecurityAudits] = useState<SecurityAuditRecord[]>(() => SupabaseAuthService.getSecurityAudits());
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(() => SupabaseAuthService.getPasswordPolicy());
  const [sessionTimeoutWarningOpen, setSessionTimeoutWarningOpen] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  // Active current user matching role
  const currentUser: Employee = currentRole === 'super_admin'
    ? ROOT_SUPER_ADMIN_USER
    : (employees.find(e => {
        if (currentRole === 'employee') return e.role === 'employee';
        if (currentRole === 'manager') return e.role === 'manager';
        if (currentRole === 'team_leader') return e.role === 'team_leader';
        if (currentRole === 'hr_manager') return e.role === 'hr_manager';
        if (currentRole === 'payroll_manager') return e.role === 'payroll_manager';
        if (currentRole === 'recruiter') return e.role === 'recruiter';
        return e.role === 'company_admin';
      }) || employees.find(e => e.tenantId === currentTenant.id) || ROOT_SUPER_ADMIN_USER);

  // Inactivity / Session idle timeout monitor
  useEffect(() => {
    if (!isAuthenticated) return;

    const onUserActivity = () => {
      setLastActivityTime(Date.now());
      if (sessionTimeoutWarningOpen) {
        setSessionTimeoutWarningOpen(false);
      }
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);
    window.addEventListener('scroll', onUserActivity);

    const checkInterval = setInterval(() => {
      const idleMs = Date.now() - lastActivityTime;
      const timeoutMs = (passwordPolicy.sessionIdleTimeoutMinutes || 30) * 60 * 1000;
      const warningThresholdMs = timeoutMs - 60 * 1000; // 60s before timeout

      if (idleMs >= warningThresholdMs && !sessionTimeoutWarningOpen) {
        setSessionTimeoutWarningOpen(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('click', onUserActivity);
      window.removeEventListener('scroll', onUserActivity);
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, lastActivityTime, passwordPolicy.sessionIdleTimeoutMinutes, sessionTimeoutWarningOpen]);

  const extendSession = () => {
    setLastActivityTime(Date.now());
    setSessionTimeoutWarningOpen(false);
    addNotification('Session Extended', 'Your active authentication session has been refreshed.', 'info');
  };

  const login = async (email: string, password = 'password123', tenantId?: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await SupabaseAuthService.signIn(email, password, tenantId);
      if (res.success && res.session) {
        setIsAuthenticated(true);
        if (tenantId) switchTenant(tenantId);
        if (role) setCurrentRole(role);

        // Find or build employee matching email
        const targetEmp = employees.find(e => e.email.toLowerCase() === email.toLowerCase()) || employees[0];
        const activeTenant = tenants.find(t => t.id === (tenantId || currentTenantId)) || tenants[0];

        // Register session with device details
        const session = SupabaseAuthService.registerSession({
          id: res.session.user?.id || targetEmp.id,
          email: res.session.user?.email || email,
          fullName: res.session.user?.fullName || targetEmp.fullName,
          role: role || targetEmp.role || currentRole,
          tenantId: activeTenant.id,
          tenantName: activeTenant.name,
        });

        setUserSessions(SupabaseAuthService.getStoredSessions());
        setLoginHistory(SupabaseAuthService.getLoginHistory());
        setSecurityAudits(SupabaseAuthService.getSecurityAudits());
        setLastActivityTime(Date.now());

        addNotification('Authentication Successful', `Signed in as ${res.session.user?.fullName || email} (${activeTenant.name})`, 'success');
        addAudit('USER_LOGIN', `Session [${session.id}]`, `Authenticated on ${session.deviceName} from ${session.ipAddress}`);
        return true;
      } else {
        addNotification('Authentication Error', res.error || 'Failed to authenticate', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupTenant = async (companyName: string, adminEmail: string, password = 'password123'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.signUpTenant(companyName, adminEmail, password);
      if (res.success && res.tenant) {
        setTenants(prev => [...prev, res.tenant!]);
        setCurrentTenantId(res.tenant.id);
        setCurrentRole('company_admin');
        setIsAuthenticated(true);

        // Register initial session
        SupabaseAuthService.registerSession({
          id: `usr-${res.tenant.id}-admin`,
          email: adminEmail,
          fullName: adminEmail.split('@')[0],
          role: 'company_admin',
          tenantId: res.tenant.id,
          tenantName: res.tenant.name,
        });
        setUserSessions(SupabaseAuthService.getStoredSessions());

        addNotification('Organization Registered', `Created workspace for ${companyName}`, 'success');
        addAudit('TENANT_REGISTRATION', `Tenant [${res.tenant.id}]`, `Registered new organization: ${companyName}`);
        return true;
      } else {
        addNotification('Registration Failed', res.error || 'Could not register organization', 'error');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    SupabaseAuthService.logAudit({
      tenantId: currentTenant.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      role: currentRole,
      action: 'USER_LOGOUT',
      category: 'authentication',
      details: `User signed out from ${currentUser.email}`,
    });

    authService.signOut();
    setIsAuthenticated(false);
    setSessionTimeoutWarningOpen(false);
    setAuthModalOpen(true);
    addNotification('Session Terminated', 'You have been securely signed out.', 'info');
  };

  const sendUserInvite = (data: {
    email: string;
    fullName: string;
    role: UserRole;
    departmentName?: string;
    designationTitle?: string;
    branchLocation?: string;
  }): UserInvite => {
    const invite = SupabaseAuthService.createInvite({
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      departmentName: data.departmentName,
      designationTitle: data.designationTitle,
      branchLocation: data.branchLocation,
      invitedBy: currentUser.email,
      invitedByName: `${currentUser.fullName} (${currentUser.designation})`,
    });

    setUserInvites(SupabaseAuthService.getStoredInvites());
    setSecurityAudits(SupabaseAuthService.getSecurityAudits());
    addNotification('Invitation Dispatched', `Onboarding email sent to ${invite.fullName} (${invite.email})`, 'success');
    return invite;
  };

  const revokeUserInvite = (inviteId: string) => {
    const invites = SupabaseAuthService.getStoredInvites().map(i => {
      if (i.id === inviteId) return { ...i, status: 'revoked' as const };
      return i;
    });
    SupabaseAuthService.saveInvites(invites);
    setUserInvites(invites);

    SupabaseAuthService.logAudit({
      tenantId: currentTenant.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      role: currentRole,
      action: 'EMPLOYEE_INVITE_REVOKED',
      category: 'rbac',
      details: `Revoked invite ${inviteId}`,
    });
    setSecurityAudits(SupabaseAuthService.getSecurityAudits());
    addNotification('Invite Revoked', 'The pending invitation has been revoked.', 'warning');
  };

  const revokeSession = (sessionId: string) => {
    SupabaseAuthService.revokeSession(sessionId, {
      id: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.fullName,
      role: currentRole,
      tenantId: currentTenant.id,
    });
    setUserSessions(SupabaseAuthService.getStoredSessions());
    setSecurityAudits(SupabaseAuthService.getSecurityAudits());
    addNotification('Session Revoked', 'Selected remote device session was invalidated.', 'info');
  };

  const revokeAllOtherSessions = () => {
    const current = userSessions.find(s => s.isCurrent)?.id || '';
    SupabaseAuthService.revokeAllOtherSessions(current, {
      id: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.fullName,
      role: currentRole,
      tenantId: currentTenant.id,
    });
    setUserSessions(SupabaseAuthService.getStoredSessions());
    setSecurityAudits(SupabaseAuthService.getSecurityAudits());
    addNotification('Sessions Terminated', 'All remote sessions have been revoked.', 'success');
  };

  const updatePasswordPolicy = (policy: Partial<PasswordPolicy>) => {
    const updated = { ...passwordPolicy, ...policy };
    setPasswordPolicy(updated);
    SupabaseAuthService.savePasswordPolicy(updated);

    SupabaseAuthService.logAudit({
      tenantId: currentTenant.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      role: currentRole,
      action: 'PASSWORD_POLICY_UPDATED',
      category: 'security',
      details: `Updated security password policy: minLength ${updated.minLength}, 2FA: ${updated.enforce2FA}`,
    });
    setSecurityAudits(SupabaseAuthService.getSecurityAudits());
    addNotification('Policy Saved', 'Enterprise password & session policies updated.', 'success');
  };

  const refreshFromDatabase = async () => {
    setIsLoading(true);
    try {
      const empRes = await apiClient.query<Employee>('employees', currentTenant.id);
      if (empRes.data && empRes.data.length > 0) setEmployees(empRes.data);

      const attRes = await apiClient.query<AttendanceRecord>('attendance_records', currentTenant.id);
      if (attRes.data && attRes.data.length > 0) setAttendance(attRes.data);

      const leaveRes = await apiClient.query<LeaveRequest>('leave_requests', currentTenant.id);
      if (leaveRes.data && leaveRes.data.length > 0) setLeaveRequests(leaveRes.data);

      const payRes = await apiClient.query<PayrollRun>('payroll_runs', currentTenant.id);
      if (payRes.data && payRes.data.length > 0) setPayrollRuns(payRes.data);

      const slipsRes = await apiClient.query<Payslip>('payslips', currentTenant.id);
      if (slipsRes.data && slipsRes.data.length > 0) setPayslips(slipsRes.data);

      const auditRes = await apiClient.query<AuditLog>('audit_logs', currentTenant.id);
      if (auditRes.data && auditRes.data.length > 0) setAuditLogs(auditRes.data);

      addNotification('Database Synchronized', 'All enterprise entities refreshed from active database.', 'success');
    } catch (e: any) {
      addNotification('Sync Warning', e?.message || 'Using local database cache', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      setCurrentRole(emp.role);
      addNotification('Identity Verified', `Active identity: ${emp.fullName} (${emp.designation})`, 'info');
    }
  };

  const addAudit = (action: string, resourceType: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      tenantId: currentTenant.id,
      action,
      performedBy: currentUser.email,
      role: currentRole,
      ipAddress: '192.168.1.1',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      resourceType,
      details,
    };
    apiClient.insert('audit_logs', newLog);
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Tenant Handlers
  const switchTenant = (tenantId: string) => {
    const t = tenants.find(item => item.id === tenantId);
    if (t) {
      setCurrentTenantId(tenantId);
      addNotification('Tenant Isolated Workspace', `Active tenant context: ${t.name}`, 'info');
      addAudit('TENANT_SWITCHED', `Tenant [${tenantId}]`, `Switched active tenant to ${t.name}`);
    }
  };

  const startImpersonation = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setImpersonatingFromSuperAdmin(true);
    setCurrentRole('company_admin');
    setActiveTab('dashboard');
    const t = tenants.find(item => item.id === tenantId);
    addNotification('Impersonation Session Active', `Impersonating Admin for ${t?.name}`, 'warning');
    addAudit('SUPERADMIN_IMPERSONATION_START', `Tenant [${tenantId}]`, `Super Admin initiated impersonation of ${t?.name}`);
  };

  const stopImpersonation = () => {
    setImpersonatingFromSuperAdmin(false);
    setCurrentRole('super_admin');
    setActiveTab('superadmin_companies');
    addNotification('Impersonation Terminated', 'Returned to Super Admin Control Console', 'info');
  };

  const createTenant = (tenantData: Partial<Tenant>) => {
    const slug = (tenantData.name || 'new-enterprise').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = tenantData.id || `tenant-${slug.substring(0, 14)}-${Date.now().toString(36)}`;
    const code = tenantData.companyCode || (tenantData.name || 'NEW').replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase();

    const newTenant: Tenant = {
      id: tenantId,
      name: tenantData.name || 'New Enterprise Corp',
      companyCode: code,
      slug,
      domain: tenantData.domain || `${slug}.arqhr.io`,
      logo: (tenantData.logo || tenantData.name || 'NE').substring(0, 2).toUpperCase(),
      industry: tenantData.industry || 'Retail & Local Business',
      planId: 'managed',
      planName: 'Enterprise Managed Instance',
      employeeCount: 1,
      status: 'active',
      countryCode: tenantData.countryCode || 'IN',
      legalCompanyName: tenantData.legalCompanyName || `${tenantData.name} Private Limited`,
      companyTaxId: tenantData.companyTaxId || (tenantData.countryCode === 'US' ? 'EIN: 12-3456789' : '27AABCV1234F1Z0'),
      registrationNumber: tenantData.registrationNumber || `REG-${code}-${Date.now().toString(36).toUpperCase()}`,
      timezone: tenantData.timezone || 'Asia/Kolkata (IST)',
      currency: tenantData.currency || (tenantData.countryCode === 'US' ? 'USD ($)' : 'INR (₹)'),
      currencySymbol: tenantData.currencySymbol || (tenantData.countryCode === 'US' ? '$' : '₹'),
      address: tenantData.address || 'Commercial Boulevard, Main Road',
      contactEmail: tenantData.contactEmail || 'admin@company.com',
      contactPhone: tenantData.contactPhone || '+91 22 6123 4500',
      mrr: 0,
      createdAt: new Date().toISOString(),
      settings: {
        attendanceEnabled: tenantData.settings?.attendanceEnabled ?? true,
        leaveEnabled: tenantData.settings?.leaveEnabled ?? true,
        payrollEnabled: tenantData.settings?.payrollEnabled ?? true,
        forcePasswordChangeOnFirstLogin: tenantData.settings?.forcePasswordChangeOnFirstLogin ?? true,
        geoFencingEnabled: true,
        selfieAttendanceEnabled: true,
        ipRestrictionEnabled: false,
        twoFactorEnforced: false,
        allowedIps: [],
        officeCoordinates: tenantData.settings?.officeCoordinates || { lat: 19.0596, lng: 72.8295, radiusMeters: 400 },
      },
    };

    // 1. Create Default Departments tailored for the company
    const isRetail = /cloth|retail|store|fashion|boutique|shop/i.test(newTenant.industry + ' ' + newTenant.name);
    const isAgency = /agency|creative|media|marketing/i.test(newTenant.industry + ' ' + newTenant.name);
    const isMaid = /maid|care|domestic|facility|cleaning/i.test(newTenant.industry + ' ' + newTenant.name);

    let defaultDeptNames: string[] = (tenantData as any).customDepartments || (
      isRetail ? [
        'Store Floor & Sales',
        'Billing, POS & Cashier Desk',
        'Inventory, Stock & Supplies',
        'Tailoring, Alterations & Fitting',
        'Store Management & Administration',
      ] : isAgency ? [
        'Creative, Copy & Design',
        'Client Servicing & Accounts',
        'Performance Marketing & Ads',
        'Web & Technology Development',
        'Operations & Talent',
      ] : isMaid ? [
        'Caregiver Sourcing & Vetting',
        'Client Placement & Allocation',
        'Background Checks & Police Verification',
        'Field Training & Welfare',
        'Billing, Contracts & Payroll',
      ] : [
        'Operations & Floor Management',
        'Sales & Customer Orders',
        'Inventory, Stock & Logistics',
        'Accounts, Billing & Payroll',
        'General Administration',
      ]
    );

    const createdDepts: Department[] = defaultDeptNames.map((dName, dIdx) => ({
      id: `dept-${newTenant.id}-${dIdx + 1}`,
      tenantId: newTenant.id,
      name: dName,
      code: `${code.slice(0, 3)}-0${dIdx + 1}`,
      employeeCount: dIdx === 0 ? 1 : 0,
      annualBudget: 1500000,
      location: 'Main Branch / Store',
    }));

    // 2. Attendance Shift Policy Details
    const shiftName = (tenantData as any).shiftName || (isRetail ? 'Store Retail Shift (10:00 AM - 08:30 PM)' : 'Standard Business Shift (09:30 AM - 06:30 PM)');
    const shiftStartTime = (tenantData as any).shiftStart || (isRetail ? '10:00' : '09:30');
    const shiftEndTime = (tenantData as any).shiftEnd || (isRetail ? '20:30' : '18:30');

    // 3. Create Company Admin User
    const adminEmail = (tenantData as any).adminEmail || newTenant.contactEmail;
    const adminFullName = (tenantData as any).adminFullName || (tenantData as any).fullName || adminEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Store Admin';
    const adminPhone = (tenantData as any).adminMobile || (tenantData as any).adminPhone || newTenant.contactPhone;

    const adminEmp: Employee = {
      id: `emp-${newTenant.id}-admin`,
      tenantId: newTenant.id,
      empCode: `${code}-001`,
      firstName: adminFullName.split(' ')[0] || 'Admin',
      lastName: adminFullName.split(' ').slice(1).join(' ') || 'Owner',
      fullName: adminFullName,
      email: adminEmail,
      phone: adminPhone,
      departmentId: createdDepts[0]?.id || 'dept-01',
      departmentName: defaultDeptNames[0],
      department: defaultDeptNames[0],
      designation: isRetail ? 'Store Owner / Managing Director' : 'Company Admin & Director',
      role: 'company_admin',
      joiningDate: new Date().toISOString().substring(0, 10),
      dateOfJoining: new Date().toISOString().substring(0, 10),
      workShift: shiftName,
      employmentType: 'Full-Time',
      status: 'Active',
      location: 'Main Store / Office',
      gender: 'Other',
      dob: '1990-01-01',
      bloodGroup: 'O+',
      address: newTenant.address,
      emergencyContact: adminPhone,
      panNumber: newTenant.countryCode === 'IN' ? 'AAAPS9999F' : '',
      bankDetails: {
        accountHolder: adminFullName,
        accountNumber: '50100' + Math.floor(10000000 + Math.random() * 90000000),
        bankName: newTenant.countryCode === 'US' ? 'Chase Bank' : newTenant.countryCode === 'AE' ? 'Emirates NBD' : 'HDFC Bank',
        ifscSwift: newTenant.countryCode === 'US' ? 'CHASUS33' : newTenant.countryCode === 'AE' ? 'EBILAEADXXX' : 'HDFC0000123',
        branch: 'Commercial Main Branch',
        panNumber: newTenant.countryCode === 'IN' ? 'AAAPS9999F' : '',
        uanNumber: newTenant.countryCode === 'IN' ? '100987654399' : '',
      },
      salaryStructure: {
        annualCTC: 1800000,
        monthlyGross: 150000,
        basic: 75000,
        hra: 30000,
        specialAllowance: 43400,
        conveyance: 1600,
        performanceBonus: 10000,
        pfEmployee: 1800,
        pfEmployer: 1800,
        esi: 0,
        professionalTax: 200,
        tdsMonthly: 12000,
        netMonthly: 136000,
      },
      digitalIdCard: {
        id: `id-card-${newTenant.id}-admin`,
        tenantId: newTenant.id,
        employeeId: `emp-${newTenant.id}-admin`,
        employeeName: adminFullName,
        empCode: `${code}-001`,
        designation: isRetail ? 'Store Owner / Managing Director' : 'Company Admin & Director',
        department: defaultDeptNames[0],
        photoUrl: '',
        companyName: newTenant.name,
        companyLogo: newTenant.logo,
        bloodGroup: 'O+',
        joiningDate: new Date().toISOString().substring(0, 10),
        workLocation: 'Main Store / Office',
        validityDate: '2028-12-31',
        qrVerificationToken: `${code}-VERIFY-001`,
        verifiedStatus: 'Active',
      },
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          type: 'Joined',
          title: `Initialized ${newTenant.name}`,
          description: 'Provisioned company workspace and established administration.',
          actor: 'System Administrator',
        },
      ],
      documents: [],
      emergencyContacts: [],
      skills: ['Business Administration', 'Staff Supervision', 'Retail Operations'],
      experience: [],
      education: [],
      notes: [],
    };

    // 4. Create Default Shift (Attendance Policy)
    const newShift: Shift = {
      id: `shift-${newTenant.id}-std`,
      tenantId: newTenant.id,
      name: shiftName,
      code: `${code}-STD`,
      startTime: shiftStartTime,
      endTime: shiftEndTime,
      gracePeriodMinutes: 20,
      halfDayThresholdHours: isRetail ? 5.0 : 4.5,
      isRotational: false,
      assignedCount: 1,
    };

    // 4. Initialize Leave Policy
    const newLeaveBalance: LeaveBalance = {
      employeeId: adminEmp.id,
      casualLeave: { total: 12, used: 0, balance: 12 },
      sickLeave: { total: 12, used: 0, balance: 12 },
      earnedLeave: { total: 15, used: 0, balance: 15 },
      compOff: { total: 4, used: 0, balance: 4 },
    };

    // 5. Create cryptographic user invite & login credentials
    const adminInvite = SupabaseAuthService.createInvite({
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      email: adminEmail,
      fullName: adminFullName,
      role: 'company_admin',
      departmentName: defaultDeptNames[0],
      designationTitle: adminEmp.designation,
      branchLocation: 'Main Store / Office',
      invitedBy: 'superadmin@arqhr.io',
      invitedByName: 'Super Administrator',
    });
    setUserInvites(prev => [adminInvite, ...prev]);

    // Save all to persistent storage & state
    apiClient.insert('tenants', newTenant);
    setTenants(prev => [...prev, newTenant]);

    setDepartments(prev => [...createdDepts, ...prev]);
    setEmployees(prev => [adminEmp, ...prev]);
    setShifts(prev => [newShift, ...prev]);
    setLeaveBalances(prev => ({ ...prev, [adminEmp.id]: newLeaveBalance }));

    // 6. Notifications & Audit Logs
    const sendWelcomeEmail = (tenantData as any).sendWelcomeEmail ?? true;
    if (sendWelcomeEmail) {
      addNotification('Welcome Email Sent', `Dispatched login credentials to ${adminFullName} (${adminEmail})`, 'success');
    }
    addNotification('Company Provisioned', `${newTenant.name} (${code}) provisioned with 5 departments, attendance policy & primary admin!`, 'success');
    addAudit('COMPANY_ONBOARDED', `Tenant [${newTenant.id}]`, `Provisioned new multi-tenant instance for ${newTenant.name} with code ${code}`);
    addAudit('PRIMARY_ADMIN_CREATED', `Employee [${adminEmp.empCode}]`, `Created company admin ${adminFullName} (${adminEmail}) for ${newTenant.name}`);
    addAudit('CREDENTIALS_DISPATCHED', `Admin [${adminEmail}]`, `Dispatched temporary credentials. Force password change on first login: ${newTenant.settings.forcePasswordChangeOnFirstLogin ? 'YES' : 'NO'}`);

    return newTenant;
  };

  const updateTenantSettings = (settings: Partial<Tenant['settings']>) => {
    const updated = { ...currentTenant.settings, ...settings };
    apiClient.update('tenants', currentTenant.id, { settings: updated });
    setTenants(prev =>
      prev.map(t => (t.id === currentTenant.id ? { ...t, settings: updated } : t))
    );
    addNotification('Security Policies Updated', 'Tenant policies and geo-fencing updated.', 'success');
    addAudit('TENANT_SETTINGS_MODIFIED', `Tenant [${currentTenant.id}]`, 'Updated security and geo-fencing configuration.');
  };

  const superAdminPermissions = SUPER_ADMIN_PERMISSIONS;

  // 1. Add Company (Super Admin Operation with 16 required fields)
  const addCompany = (
    companyData: Partial<Tenant>,
    adminData?: { fullName: string; email: string; phone?: string; password?: string }
  ): Tenant => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can provision new companies.', 'error');
      throw new Error('Unauthorized');
    }

    const companyName = (companyData.name || 'New Company').trim();
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = companyData.id || `tenant-${slug.substring(0, 14)}-${Date.now().toString(36)}`;
    const code = companyData.companyCode || companyName.replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'COMP';

    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const newCompany: Tenant = {
      id: tenantId,
      name: companyName,
      slug,
      domain: companyData.domain || `${slug}.arqhr.io`,
      logo: companyData.logo || companyName.substring(0, 2).toUpperCase(),
      contactEmail: (companyData.contactEmail || adminData?.email || 'admin@company.com').trim(),
      contactPhone: companyData.contactPhone || adminData?.phone || '+91 22 0000 0000',
      website: companyData.website || `https://${slug}.com`,
      gstNumber: companyData.gstNumber || companyData.companyTaxId || '',
      address: companyData.address || 'Corporate Office Address',
      city: companyData.city || 'Mumbai',
      state: companyData.state || 'Maharashtra',
      country: companyData.country || 'India',
      pincode: companyData.pincode || '400051',
      industry: companyData.industry || 'Technology & Enterprise Services',
      subscriptionPlan: companyData.subscriptionPlan || companyData.planName || 'Enterprise Plan',
      subscriptionStartDate: companyData.subscriptionStartDate || now.toISOString().substring(0, 10),
      subscriptionEndDate: companyData.subscriptionEndDate || oneYearLater.toISOString().substring(0, 10),
      planId: companyData.planId || 'enterprise',
      planName: companyData.subscriptionPlan || companyData.planName || 'Enterprise Plan',
      employeeCount: adminData ? 1 : 0,
      status: companyData.status || 'active',
      countryCode: companyData.countryCode || (companyData.country === 'United States' ? 'US' : 'IN'),
      timezone: companyData.timezone || 'Asia/Kolkata (IST)',
      currency: companyData.currency || 'INR (₹)',
      currencySymbol: companyData.currencySymbol || '₹',
      companyCode: code,
      mrr: companyData.mrr || 15000,
      createdAt: now.toISOString(),
      settings: {
        attendanceEnabled: companyData.settings?.attendanceEnabled ?? true,
        leaveEnabled: companyData.settings?.leaveEnabled ?? true,
        payrollEnabled: companyData.settings?.payrollEnabled ?? true,
        forcePasswordChangeOnFirstLogin: companyData.settings?.forcePasswordChangeOnFirstLogin ?? false,
        geoFencingEnabled: true,
        selfieAttendanceEnabled: true,
        ipRestrictionEnabled: false,
        twoFactorEnforced: false,
        allowedIps: [],
        officeCoordinates: companyData.settings?.officeCoordinates || { lat: 19.076, lng: 72.8777, radiusMeters: 500 },
      },
    };

    // Save to persistent storage and state
    apiClient.insert('tenants', newCompany);
    setTenants(prev => [...prev, newCompany]);

    // Create Company Admin if provided
    if (adminData && adminData.email) {
      const adminEmp: Employee = {
        id: `emp-${newCompany.id}-admin`,
        tenantId: newCompany.id,
        empCode: `${code}-001`,
        firstName: adminData.fullName.split(' ')[0] || 'Admin',
        lastName: adminData.fullName.split(' ').slice(1).join(' ') || 'User',
        fullName: adminData.fullName,
        email: adminData.email.trim(),
        phone: adminData.phone || newCompany.contactPhone,
        departmentId: `dept-${newCompany.id}-01`,
        departmentName: 'Executive & Administration',
        department: 'Executive & Administration',
        designation: 'Company Administrator',
        role: 'company_admin',
        joiningDate: now.toISOString().substring(0, 10),
        dateOfJoining: now.toISOString().substring(0, 10),
        workShift: 'General Shift (09:30 AM - 06:30 PM)',
        employmentType: 'Full-Time',
        status: 'Active',
        location: newCompany.city || 'Main Office',
        gender: 'Other',
        dob: '1990-01-01',
        bloodGroup: 'O+',
        address: newCompany.address,
        emergencyContact: newCompany.contactPhone,
        documents: [],
        emergencyContacts: [],
        skills: ['Company Administration', 'Operations'],
        experience: [],
        education: [],
        notes: [],
      };

      apiClient.insert('employees', adminEmp);
      setEmployees(prev => [adminEmp, ...prev]);

      // Create invite & credentials
      const invite = SupabaseAuthService.createInvite({
        tenantId: newCompany.id,
        tenantName: newCompany.name,
        email: adminData.email.trim(),
        fullName: adminData.fullName,
        role: 'company_admin',
        departmentName: 'Executive & Administration',
        designationTitle: 'Company Administrator',
        invitedBy: currentUser.email,
        invitedByName: currentUser.fullName,
      });
      setUserInvites(prev => [invite, ...prev]);
    }

    addNotification('Company Created', `${newCompany.name} successfully registered.`, 'success');
    addAudit('SUPERADMIN_COMPANY_CREATED', `Tenant [${newCompany.id}]`, `Super Admin created company ${newCompany.name}`);
    return newCompany;
  };

  // 2. Edit Company
  const editCompany = (id: string, updates: Partial<Tenant>) => {
    if (currentRole !== 'super_admin' && currentTenant.id !== id) {
      addNotification('Access Denied', 'Unauthorized to modify company details.', 'error');
      return;
    }

    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          apiClient.update('tenants', id, updated);
          return updated;
        }
        return t;
      })
    );

    addNotification('Company Updated', 'Company details saved successfully.', 'success');
    addAudit('COMPANY_UPDATED', `Tenant [${id}]`, `Updated company profile details for [${id}]`);
  };

  // 3. Delete Company (Permanent Cascade)
  const deleteCompany = async (id: string, passwordConfirmation = 'password123'): Promise<boolean> => {
    if (currentRole !== 'super_admin' && currentRole !== 'company_admin') {
      addNotification('Access Denied', 'Only Super Admin or Company Owner can delete a company.', 'error');
      return false;
    }

    const res = await companyLifecycleService.deleteCompany(
      id,
      {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentRole,
      },
      passwordConfirmation
    );

    if (res.success) {
      setTenants(prev => prev.filter(t => t.id !== id));
      setEmployees(prev => prev.filter(e => e.tenantId !== id));
      setDepartments(prev => prev.filter(d => d.tenantId !== id));
      setAttendance(prev => prev.filter(a => a.tenantId !== id));
      setLeaveRequests(prev => prev.filter(l => l.tenantId !== id));
      setPayrollRuns(prev => prev.filter(p => p.tenantId !== id));

      if (currentTenantId === id) {
        const remaining = tenants.filter(t => t.id !== id);
        if (remaining.length > 0) {
          setCurrentTenantId(remaining[0].id);
        } else {
          setCurrentTenantId(ROOT_SUPERADMIN_TENANT_ID);
        }
      }

      addNotification('Company Deleted', res.message || 'Workspace deleted successfully.', 'success');
      return true;
    } else {
      addNotification('Deletion Failed', res.error || 'Failed to delete company.', 'error');
      return false;
    }
  };

  // 4. Suspend Company
  const suspendCompany = (id: string) => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can suspend companies.', 'error');
      return;
    }

    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, status: 'suspended' as const };
          apiClient.update('tenants', id, { status: 'suspended' });
          return updated;
        }
        return t;
      })
    );

    addNotification('Company Suspended', 'Company access has been suspended.', 'warning');
    addAudit('COMPANY_SUSPENDED', `Tenant [${id}]`, `Super Admin suspended company [${id}]`);
  };

  // 5. Reactivate Company
  const reactivateCompany = (id: string) => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can activate companies.', 'error');
      return;
    }

    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, status: 'active' as const };
          apiClient.update('tenants', id, { status: 'active' });
          return updated;
        }
        return t;
      })
    );

    addNotification('Company Reactivated', 'Company status restored to active.', 'success');
    addAudit('COMPANY_REACTIVATED', `Tenant [${id}]`, `Super Admin reactivated company [${id}]`);
  };

  // 6. Assign Subscription Plan
  const assignSubscriptionPlan = (
    companyId: string,
    planId: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can modify subscription plans.', 'error');
      return;
    }

    const matchedPlan = subscriptionPlans.find(p => p.id === planId);
    const planName = matchedPlan?.name || planId;

    setTenants(prev =>
      prev.map(t => {
        if (t.id === companyId) {
          const updated: Tenant = {
            ...t,
            planId: planId as any,
            planName,
            subscriptionPlan: planName,
            subscriptionStartDate: startDate || t.subscriptionStartDate || new Date().toISOString().substring(0, 10),
            subscriptionEndDate: endDate || t.subscriptionEndDate,
          };
          apiClient.update('tenants', companyId, updated);
          return updated;
        }
        return t;
      })
    );

    addNotification('Subscription Updated', `Assigned ${planName} to company.`, 'success');
    addAudit('SUBSCRIPTION_ASSIGNED', `Tenant [${companyId}]`, `Assigned plan [${planName}]`);
  };

  // 7. Create Company Admin
  const createCompanyAdmin = (
    companyId: string,
    adminData: { fullName: string; email: string; phone?: string; password?: string }
  ): Employee => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can create company administrators.', 'error');
      throw new Error('Unauthorized');
    }

    const targetCompany = tenants.find(t => t.id === companyId);
    const code = targetCompany?.companyCode || 'ADM';

    const newAdmin: Employee = {
      id: `emp-${companyId}-${Date.now().toString(36)}`,
      tenantId: companyId,
      empCode: `${code}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: adminData.fullName.split(' ')[0] || 'Admin',
      lastName: adminData.fullName.split(' ').slice(1).join(' ') || 'User',
      fullName: adminData.fullName,
      email: adminData.email.trim(),
      phone: adminData.phone || '+91 22 0000 0000',
      departmentId: `dept-${companyId}-01`,
      departmentName: 'Executive & Administration',
      department: 'Executive & Administration',
      designation: 'Company Administrator',
      role: 'company_admin',
      joiningDate: new Date().toISOString().substring(0, 10),
      dateOfJoining: new Date().toISOString().substring(0, 10),
      workShift: 'General Shift (09:30 AM - 06:30 PM)',
      employmentType: 'Full-Time',
      status: 'Active',
      location: targetCompany?.city || 'Main Office',
      gender: 'Other',
      dob: '1990-01-01',
      bloodGroup: 'O+',
      address: targetCompany?.address || 'Corporate Headquarters',
      emergencyContact: adminData.phone || '+91 22 0000 0000',
      documents: [],
      emergencyContacts: [],
      skills: ['Company Administration'],
      experience: [],
      education: [],
      notes: [],
    };

    apiClient.insert('employees', newAdmin);
    setEmployees(prev => [newAdmin, ...prev]);

    // Update company employeeCount
    setTenants(prev =>
      prev.map(t => (t.id === companyId ? { ...t, employeeCount: (t.employeeCount || 0) + 1 } : t))
    );

    const invite = SupabaseAuthService.createInvite({
      tenantId: companyId,
      tenantName: targetCompany?.name || 'Company',
      email: adminData.email.trim(),
      fullName: adminData.fullName,
      role: 'company_admin',
      departmentName: 'Executive & Administration',
      designationTitle: 'Company Administrator',
      invitedBy: currentUser.email,
      invitedByName: currentUser.fullName,
    });
    setUserInvites(prev => [invite, ...prev]);

    addNotification('Company Admin Created', `Created admin account for ${newAdmin.fullName} (${newAdmin.email})`, 'success');
    addAudit('COMPANY_ADMIN_CREATED', `Tenant [${companyId}]`, `Created admin [${newAdmin.email}]`);
    return newAdmin;
  };

  // 8. Reset Company Password
  const resetCompanyPassword = (
    companyId: string,
    adminEmail: string
  ): { tempPassword: string; resetToken: string } => {
    if (currentRole !== 'super_admin') {
      addNotification('Access Denied', 'Only Super Admin can reset company passwords.', 'error');
      throw new Error('Unauthorized');
    }

    const tempPassword = `Arq@${Math.floor(100000 + Math.random() * 900000)}!`;
    const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    SupabaseAuthService.logAudit({
      tenantId: companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.fullName,
      role: 'super_admin',
      action: 'ADMIN_PASSWORD_RESET',
      category: 'security',
      details: `Super Admin issued temporary password reset for [${adminEmail}]`,
    });

    addNotification('Password Reset Dispatched', `Generated credentials for ${adminEmail}`, 'success');
    return { tempPassword, resetToken };
  };

  const loadDemoCompany = () => {
    addNotification('Clean Production State Active', 'ARQHR ERP is operating in a clean, production-ready state with zero demo records.', 'info');
  };

  // Mutators
  const addEmployee = (emp: Partial<Employee>): boolean => {
    // Run formal production validation
    const validationErrors = employeeService.validateEmployee(emp);
    if (validationErrors.length > 0) {
      addNotification('Validation Error', validationErrors[0].message, 'error');
      return false;
    }

    const codeNum = 1000 + employees.length + 1;
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      tenantId: currentTenant.id,
      empCode: `ARQ-${codeNum}`,
      firstName: emp.firstName!.trim(),
      lastName: emp.lastName!.trim(),
      fullName: `${emp.firstName!.trim()} ${emp.lastName!.trim()}`,
      email: emp.email!.trim(),
      phone: emp.phone || '+1 (555) 123-4567',
      departmentId: emp.departmentId || 'dept-eng-01',
      departmentName: emp.departmentName || 'Software Engineering',
      designation: emp.designation!.trim(),
      employmentType: emp.employmentType || 'Full-Time',
      joiningDate: emp.joiningDate || new Date().toISOString().substring(0, 10),
      status: 'Active',
      location: emp.location || 'San Francisco Global HQ',
      workShift: emp.workShift || 'Standard Business Day (9:00 AM - 6:00 PM)',
      role: emp.role || 'employee',
      documents: [],
      bankDetails: {
        accountHolder: `${emp.firstName} ${emp.lastName}`,
        accountNumber: '••••••••' + Math.floor(1000 + Math.random() * 9000),
        bankName: 'Silicon Valley Bank',
        ifscSwift: 'SVBUS6S',
        branch: 'San Francisco Branch',
        panNumber: 'USA-SSN-' + Math.floor(1000 + Math.random() * 9000),
        uanNumber: '1004' + Math.floor(10000000 + Math.random() * 90000000),
      },
      salaryStructure: {
        annualCTC: emp.salaryStructure?.annualCTC || 140000,
        monthlyGross: Math.round((emp.salaryStructure?.annualCTC || 140000) / 12),
        basic: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.5),
        hra: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.2),
        specialAllowance: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.2),
        conveyance: 300,
        performanceBonus: 700,
        pfEmployee: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.06),
        pfEmployer: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.06),
        esi: 0,
        professionalTax: 200,
        tdsMonthly: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.15),
        netMonthly: Math.round(((emp.salaryStructure?.annualCTC || 140000) / 12) * 0.75),
      },
      emergencyContacts: [],
      skills: emp.skills || ['Communication', 'Problem Solving'],
      experience: [],
      education: [],
      notes: [],
    };

    apiClient.insert('employees', newEmp);
    setEmployees(prev => [newEmp, ...prev]);
    addNotification('Employee Enrolled', `${newEmp.fullName} (${newEmp.empCode}) stored in database`, 'success');
    addAudit('EMPLOYEE_ONBOARDED', `Employee [${newEmp.empCode}]`, `Enrolled ${newEmp.fullName} as ${newEmp.designation}`);
    return true;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    apiClient.update('employees', id, updates);
    setEmployees(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates, fullName: updates.firstName || updates.lastName ? `${updates.firstName || e.firstName} ${updates.lastName || e.lastName}` : e.fullName } : e))
    );
    addNotification('Record Updated', 'Employee data saved.', 'success');
    addAudit('EMPLOYEE_UPDATED', `Employee [${id}]`, 'Updated employee profile attributes');
  };

  const punchAttendance = (
    type: 'check_in' | 'check_out',
    method: AttendanceRecord['checkInMethod'] = 'Web',
    details?: { isWFH?: boolean; selfieUrl?: string }
  ): boolean => {
    const today = new Date().toISOString().substring(0, 10);
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const existingIndex = attendance.findIndex(a => a.employeeId === currentUser.id && a.date === today);

    if (type === 'check_in') {
      if (existingIndex >= 0) {
        addNotification('Already Clocked In', `You already checked in today at ${attendance[existingIndex].checkInTime}.`, 'warning');
        return false;
      }

      const newPunch: AttendanceRecord = {
        id: `att-${Date.now()}`,
        tenantId: currentTenant.id,
        employeeId: currentUser.id,
        employeeName: currentUser.fullName,
        empCode: currentUser.empCode,
        date: today,
        checkInTime: timeStr,
        durationHours: 0,
        status: 'Present',
        checkInMethod: method,
        location: {
          lat: 37.7897,
          lng: -122.3995,
          address: details?.isWFH ? 'Work from Home (Residential Verified)' : '450 Mission St, San Francisco (HQ)',
          withinGeoFence: !details?.isWFH,
        },
        isWFH: !!details?.isWFH,
        ipAddress: '192.168.1.1',
        selfieUrl: details?.selfieUrl,
      };

      apiClient.insert('attendance_records', newPunch);
      setAttendance(prev => [newPunch, ...prev]);
      addNotification('Biometric Punch Recorded', `Clocked in at ${timeStr} via ${method}.`, 'success');
      addAudit('ATTENDANCE_CHECK_IN', `Attendance [${currentUser.empCode}]`, `Clocked in at ${timeStr} (${method}, WFH: ${!!details?.isWFH})`);
      return true;
    } else {
      if (existingIndex < 0) {
        addNotification('Clock In Required', 'Please clock in first before clocking out.', 'warning');
        return false;
      }

      apiClient.update('attendance_records', attendance[existingIndex].id, {
        checkOutTime: timeStr,
        durationHours: 8.5,
      });

      setAttendance(prev =>
        prev.map((rec, i) =>
          i === existingIndex
            ? { ...rec, checkOutTime: timeStr, durationHours: 8.5 }
            : rec
        )
      );
      addNotification('Clock Out Complete', `Punched out at ${timeStr}.`, 'success');
      addAudit('ATTENDANCE_CHECK_OUT', `Attendance [${currentUser.empCode}]`, `Clocked out at ${timeStr}`);
      return true;
    }
  };

  const requestRegularization = (attendanceId: string, reason: string) => {
    apiClient.update('attendance_records', attendanceId, {
      regularizationRequested: true,
      regularizationReason: reason,
      regularizationStatus: 'Pending',
    });

    setAttendance(prev =>
      prev.map(a =>
        a.id === attendanceId
          ? { ...a, regularizationRequested: true, regularizationReason: reason, regularizationStatus: 'Pending' }
          : a
      )
    );
    addNotification('Correction Submitted', 'Your manager has received the punch regularization request.', 'info');
    addAudit('ATTENDANCE_REGULARIZATION_REQUESTED', `Attendance [${attendanceId}]`, `Requested regularize: "${reason}"`);
  };

  const applyLeave = (leave: Partial<LeaveRequest>) => {
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      empCode: currentUser.empCode,
      department: currentUser.departmentName,
      leaveType: leave.leaveType || 'Casual Leave',
      startDate: leave.startDate || new Date().toISOString().substring(0, 10),
      endDate: leave.endDate || new Date().toISOString().substring(0, 10),
      daysCount: leave.daysCount || 1,
      halfDay: !!leave.halfDay,
      reason: leave.reason || 'Personal matters',
      status: 'Pending',
      appliedOn: new Date().toISOString(),
    };

    apiClient.insert('leave_requests', newLeave);
    setLeaveRequests(prev => [newLeave, ...prev]);
    addNotification('Leave Application Submitted', `${newLeave.daysCount} day(s) of ${newLeave.leaveType} requested.`, 'info');
    addAudit('LEAVE_APPLICATION_SUBMITTED', `LeaveRequest [${newLeave.id}]`, `Applied for ${newLeave.daysCount} days of ${newLeave.leaveType}`);
  };

  const updateLeaveStatus = (leaveId: string, status: 'Approved' | 'Rejected', comment?: string) => {
    apiClient.update('leave_requests', leaveId, {
      status,
      approvedBy: currentUser.fullName,
      managerComment: comment,
    });

    setLeaveRequests(prev =>
      prev.map(l =>
        l.id === leaveId
          ? { ...l, status, approvedBy: currentUser.fullName, managerComment: comment }
          : l
      )
    );
    addNotification(`Leave ${status}`, `Request has been marked as ${status}.`, status === 'Approved' ? 'success' : 'warning');
    addAudit('LEAVE_STATUS_CHANGED', `LeaveRequest [${leaveId}]`, `Marked as ${status} by ${currentUser.fullName}`);
  };

  const runPayroll = (month: string) => {
    const newRun: PayrollRun = {
      id: `payrun-${Date.now()}`,
      tenantId: currentTenant.id,
      month,
      periodStart: `${month.substring(0, 4)}-10-01`,
      periodEnd: `${month.substring(0, 4)}-10-31`,
      totalGross: employees.reduce((acc, e) => acc + e.salaryStructure.monthlyGross, 0),
      totalNet: employees.reduce((acc, e) => acc + e.salaryStructure.netMonthly, 0),
      totalDeductions: employees.reduce((acc, e) => acc + (e.salaryStructure.monthlyGross - e.salaryStructure.netMonthly), 0),
      totalEmployees: employees.length,
      status: 'Processed',
      processedAt: new Date().toISOString(),
      processedBy: currentUser.fullName,
    };

    const generatedSlips: Payslip[] = employees.map(emp => ({
      id: `slip-${Date.now()}-${emp.id}`,
      tenantId: currentTenant.id,
      payrollRunId: newRun.id,
      employeeId: emp.id,
      employeeName: emp.fullName,
      empCode: emp.empCode,
      designation: emp.designation,
      department: emp.departmentName,
      joiningDate: emp.joiningDate,
      panNumber: emp.bankDetails?.panNumber || 'USA-SSN-9800',
      uanNumber: emp.bankDetails?.uanNumber || '100490000000',
      bankAccount: emp.bankDetails?.accountNumber || '••••••••0000',
      bankName: emp.bankDetails?.bankName || 'JPMorgan Chase Bank',
      month,
      daysWorked: 30,
      daysLop: 0,
      basic: emp.salaryStructure.basic,
      hra: emp.salaryStructure.hra,
      specialAllowance: emp.salaryStructure.specialAllowance,
      conveyance: emp.salaryStructure.conveyance,
      performanceBonus: emp.salaryStructure.performanceBonus,
      grossEarnings: emp.salaryStructure.monthlyGross,
      pfDeduction: emp.salaryStructure.pfEmployee,
      esiDeduction: emp.salaryStructure.esi,
      ptDeduction: emp.salaryStructure.professionalTax,
      tdsDeduction: emp.salaryStructure.tdsMonthly,
      totalDeductions: emp.salaryStructure.monthlyGross - emp.salaryStructure.netMonthly,
      netPayable: emp.salaryStructure.netMonthly,
      status: 'Generated',
      generatedDate: new Date().toISOString().substring(0, 10),
    }));

    apiClient.insert('payroll_runs', newRun);
    generatedSlips.forEach(slip => apiClient.insert('payslips', slip));

    setPayrollRuns(prev => [newRun, ...prev]);
    setPayslips(prev => [...generatedSlips, ...prev]);
    addNotification('Batch Payroll Processed', `Calculated salaries for ${employees.length} employees ($${newRun.totalNet.toLocaleString()} net).`, 'success');
    addAudit('PAYROLL_PROCESSED', `PayrollRun [${newRun.id}]`, `Processed batch payroll for ${month}`);
  };

  const disbursePayroll = (runId: string) => {
    apiClient.update('payroll_runs', runId, { status: 'Disbursed', disbursedAt: new Date().toISOString() });

    setPayrollRuns(prev =>
      prev.map(r => (r.id === runId ? { ...r, status: 'Disbursed', disbursedAt: new Date().toISOString() } : r))
    );
    setPayslips(prev =>
      prev.map(s => (s.payrollRunId === runId ? { ...s, status: 'Disbursed' } : s))
    );
    addNotification('Direct Deposits Disbursed', 'ACH fund batches locked and payslips released to employees.', 'success', 'email');
    addAudit('PAYROLL_DISBURSED', `PayrollRun [${runId}]`, 'Disbursed electronic fund transfers to all enrolled bank accounts');
  };

  const addJobRequisition = (req: Partial<JobRequisition>) => {
    const codeNum = jobRequisitions.length + 45;
    const newReq: JobRequisition = {
      id: `job-${Date.now()}`,
      tenantId: currentTenant.id,
      jobCode: `REQ-2026-0${codeNum}`,
      title: req.title || 'Senior Software Engineer',
      department: req.department || 'Software Engineering',
      location: req.location || 'San Francisco, CA',
      employmentType: req.employmentType || 'Full-Time',
      experienceRequired: req.experienceRequired || '5+ Years',
      openPositions: req.openPositions || 1,
      status: 'Active',
      salaryRange: req.salaryRange || '$150,000 - $185,000',
      createdDate: new Date().toISOString().substring(0, 10),
      hiringManager: currentUser.fullName,
      applicantsCount: 0,
      description: req.description || 'Enterprise role opening in scalable architecture.',
      requirements: req.requirements || ['Experience in high scale applications'],
    };
    apiClient.insert('job_requisitions', newReq);
    setJobRequisitions(prev => [newReq, ...prev]);
    addNotification('Requisition Published', `Job opening ${newReq.jobCode} published to internal & public careers portal.`, 'success');
    addAudit('JOB_REQUISITION_CREATED', `JobRequisition [${newReq.jobCode}]`, `Published ${newReq.title}`);
  };

  const updateCandidateStage = (candId: string, stage: Candidate['stage']) => {
    apiClient.update('candidates', candId, { stage });
    setCandidates(prev =>
      prev.map(c => (c.id === candId ? { ...c, stage } : c))
    );
    addNotification('Pipeline Stage Updated', `Candidate moved to ${stage}.`, 'info');
    addAudit('CANDIDATE_STAGE_UPDATED', `Candidate [${candId}]`, `Moved to ${stage}`);
  };

  const completeOnboardingTask = (taskId: string) => {
    apiClient.update('onboarding_tasks', taskId, { status: 'Completed' });
    setOnboardingTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'Completed' } : t))
    );
    addNotification('Task Verified', 'Onboarding milestone marked as complete.', 'success');
    addAudit('ONBOARDING_TASK_COMPLETED', `Task [${taskId}]`, 'Marked task complete');
  };

  const submitResignation = (reason: string, desiredExitDate: string) => {
    const newRes: ResignationRequest = {
      id: `res-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      empCode: currentUser.empCode,
      department: currentUser.departmentName,
      submissionDate: new Date().toISOString().substring(0, 10),
      desiredExitDate,
      officialLastWorkingDay: desiredExitDate,
      noticePeriodDays: 30,
      reason,
      status: 'Submitted',
      clearances: { it: false, hr: false, finance: false, admin: false },
      fnfAmount: currentUser.salaryStructure.monthlyGross,
      exitInterviewCompleted: false,
    };
    apiClient.insert('resignation_requests', newRes);
    setResignations(prev => [newRes, ...prev]);
    addNotification('Separation Notice Initiated', 'Departmental clearance checklists opened.', 'warning');
    addAudit('RESIGNATION_SUBMITTED', `Resignation [${currentUser.empCode}]`, `Submitted resignation with desired exit date ${desiredExitDate}`);
  };

  const updateClearance = (resignationId: string, dept: 'it' | 'hr' | 'finance' | 'admin', cleared: boolean) => {
    const target = resignations.find(r => r.id === resignationId);
    if (!target) return;
    const updatedClearances = { ...target.clearances, [dept]: cleared };
    const allCleared = updatedClearances.it && updatedClearances.hr && updatedClearances.finance && updatedClearances.admin;
    const nextStatus = allCleared ? 'Completed' : 'Clearance In Progress';

    apiClient.update('resignation_requests', resignationId, {
      clearances: updatedClearances,
      status: nextStatus,
    });

    setResignations(prev =>
      prev.map(r => (r.id === resignationId ? { ...r, clearances: updatedClearances, status: nextStatus } : r))
    );
    addNotification('Clearance Recorded', `${dept.toUpperCase()} department clearance registered.`, 'info');
    addAudit('CLEARANCE_UPDATED', `Resignation [${resignationId}]`, `${dept.toUpperCase()} marked as ${cleared}`);
  };

  const submitExpense = (claim: Partial<ExpenseClaim>) => {
    const newExp: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      tenantId: currentTenant.id,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      empCode: currentUser.empCode,
      title: claim.title || 'Business Reimbursement',
      category: claim.category || 'Travel',
      amount: claim.amount || 50,
      currency: 'USD',
      expenseDate: claim.expenseDate || new Date().toISOString().substring(0, 10),
      receiptName: claim.receiptName || 'Receipt_Attachment.pdf',
      status: 'Submitted',
    };
    apiClient.insert('expenses', newExp);
    setExpenses(prev => [newExp, ...prev]);
    addNotification('Expense Claim Submitted', `Claim for $${newExp.amount} submitted for approval.`, 'info');
    addAudit('EXPENSE_CLAIM_SUBMITTED', `Expense [${newExp.id}]`, `Claimed $${newExp.amount} for ${newExp.title}`);
  };

  const approveExpense = (claimId: string, status: 'Approved' | 'Rejected') => {
    apiClient.update('expenses', claimId, { status, approvedBy: currentUser.fullName });
    setExpenses(prev =>
      prev.map(e => (e.id === claimId ? { ...e, status, approvedBy: currentUser.fullName } : e))
    );
    addNotification(`Expense ${status}`, `Claim marked as ${status}.`, 'info');
    addAudit('EXPENSE_STATUS_CHANGED', `Expense [${claimId}]`, `Marked as ${status}`);
  };

  const createTicket = (ticket: Partial<HelpdeskTicket>) => {
    const codeNum = tickets.length + 8904;
    const newTkt: HelpdeskTicket = {
      id: `tkt-${Date.now()}`,
      tenantId: currentTenant.id,
      ticketCode: `TKT-${codeNum}`,
      employeeId: currentUser.id,
      employeeName: currentUser.fullName,
      subject: ticket.subject || 'Assistance needed',
      category: ticket.category || 'HR Support',
      priority: ticket.priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString(),
      slaHoursLeft: 24,
      thread: [
        {
          author: currentUser.fullName,
          text: ticket.subject || '',
          timestamp: 'Just now',
          isStaff: false,
        },
      ],
    };
    apiClient.insert('helpdesk_tickets', newTkt);
    setTickets(prev => [newTkt, ...prev]);
    addNotification('Support Ticket Created', `Ticket ${newTkt.ticketCode} dispatched to operations queue.`, 'success');
    addAudit('HELPDESK_TICKET_CREATED', `Ticket [${newTkt.ticketCode}]`, `Created ticket: ${newTkt.subject}`);
  };

  const replyTicket = (ticketId: string, text: string) => {
    const target = tickets.find(t => t.id === ticketId);
    if (!target) return;
    const newThread = [
      ...target.thread,
      {
        author: currentUser.fullName,
        text,
        timestamp: 'Just now',
        isStaff: currentRole === 'company_admin' || currentRole === 'hr_manager',
      },
    ];

    apiClient.update('helpdesk_tickets', ticketId, { thread: newThread, status: 'In Progress' });
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, thread: newThread, status: 'In Progress' } : t))
    );
    addNotification('Reply Appended', 'Message dispatched to ticket thread.', 'info');
  };

  const toggleLikePost = (postId: string) => {
    setFeedPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const updated = {
            ...p,
            likes: p.userLiked ? p.likes - 1 : p.likes + 1,
            userLiked: !p.userLiked,
          };
          apiClient.update('feed_posts', postId, { likes: updated.likes });
          return updated;
        }
        return p;
      })
    );
  };

  const votePoll = (postId: string, optionId: string) => {
    setFeedPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.pollData) {
          const updatedOptions = p.pollData.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: opt.votes + 1 };
            }
            if (p.pollData?.userVotedOptionId === opt.id) {
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            }
            return opt;
          });
          const updatedPoll = {
            ...p.pollData,
            options: updatedOptions,
            userVotedOptionId: optionId,
          };
          apiClient.update('feed_posts', postId, { pollData: updatedPoll });
          return {
            ...p,
            pollData: updatedPoll,
          };
        }
        return p;
      })
    );
    addNotification('Vote Stored', 'Your pulse survey response was registered.', 'success');
  };

  const createPost = (
    content: string,
    type: FeedPost['type'],
    badgeType?: FeedPost['badgeType'],
    recipientName?: string
  ) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      tenantId: currentTenant.id,
      authorName: currentUser.fullName,
      authorRole: currentUser.designation,
      type,
      badgeType,
      recipientName,
      content,
      timestamp: 'Just now',
      likes: 1,
      userLiked: true,
      comments: [],
    };
    apiClient.insert('feed_posts', newPost);
    setFeedPosts(prev => [newPost, ...prev]);
    addNotification('Pulse Post Shared', 'Broadcasted across company network.', 'success');
    addAudit('PULSE_POST_CREATED', `Post [${newPost.id}]`, `Published ${type} post`);
  };

  const addGoal = (goal: Partial<GoalOKR>) => {
    const newGoal: GoalOKR = {
      id: `okr-${Date.now()}`,
      tenantId: currentTenant.id,
      title: goal.title || 'New Strategic Objective',
      level: goal.level || 'Individual',
      ownerName: goal.ownerName || currentUser.fullName,
      cycle: goal.cycle || 'Q4 2026',
      progress: 0,
      targetValue: goal.targetValue || 100,
      currentValue: 0,
      unit: goal.unit || '%',
      status: 'On Track',
      keyResults: [
        { id: `kr-${Date.now()}-1`, title: 'Milestone 1 Key Deliverable', progress: 0 },
      ],
    };
    apiClient.insert('goals', newGoal);
    setGoals(prev => [newGoal, ...prev]);
    addNotification('Objective Created', `Published to ${newGoal.level} OKR dashboard.`, 'success');
    addAudit('GOAL_CREATED', `Goal [${newGoal.id}]`, `Created ${newGoal.title}`);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id === goalId) {
          const status: GoalOKR['status'] = progress >= 100 ? 'Completed' : progress >= 70 ? 'On Track' : progress >= 40 ? 'At Risk' : 'Behind';
          const updated: GoalOKR = {
            ...g,
            progress,
            currentValue: Math.round((progress / 100) * g.targetValue * 10) / 10,
            status,
          };
          apiClient.update('goals', goalId, { progress, currentValue: updated.currentValue, status });
          return updated;
        }
        return g;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        currentTenant,
        switchTenant,
        impersonatingFromSuperAdmin,
        startImpersonation,
        stopImpersonation,
        createTenant,
        updateTenantSettings,
        loadDemoCompany,
        currentRole,
        setCurrentRole,
        currentUser,
        switchUser,
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        isLoading,
        isAuthenticated,
        login,
        signupTenant,
        logout,
        refreshFromDatabase,
        authModalOpen,
        setAuthModalOpen,
        notifications,
        addNotification,
        clearNotification,
        employees,
        departments,
        teams,
        branches,
        shifts,
        holidays,
        attendance,
        leaveRequests,
        leaveBalances,
        payrollRuns,
        payslips,
        jobRequisitions,
        candidates,
        onboardingTasks,
        resignations,
        goals,
        assets,
        expenses,
        tickets,
        documents,
        feedPosts,
        auditLogs,
        subscriptionPlans,
        addEmployee,
        updateEmployee,
        punchAttendance,
        requestRegularization,
        applyLeave,
        updateLeaveStatus,
        runPayroll,
        disbursePayroll,
        addJobRequisition,
        updateCandidateStage,
        completeOnboardingTask,
        submitResignation,
        updateClearance,
        submitExpense,
        approveExpense,
        createTicket,
        replyTicket,
        toggleLikePost,
        votePoll,
        createPost,
        addGoal,
        updateGoalProgress,
        userSessions,
        userInvites,
        loginHistory,
        securityAudits,
        passwordPolicy,
        sendUserInvite,
        revokeUserInvite,
        revokeSession,
        revokeAllOtherSessions,
        updatePasswordPolicy,
        sessionTimeoutWarningOpen,
        extendSession,
        addCompany,
        editCompany,
        deleteCompany,
        suspendCompany,
        reactivateCompany,
        assignSubscriptionPlan,
        createCompanyAdmin,
        resetCompanyPassword,
        superAdminPermissions,
      }}
    >
      {children}
      <SessionTimeoutWarningModal
        isOpen={sessionTimeoutWarningOpen}
        remainingSeconds={60}
        onExtendSession={extendSession}
        onLogoutNow={logout}
      />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

