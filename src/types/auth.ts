import { UserRole } from './index';

export type AuthMode =
  | 'signin'
  | 'register_company'
  | 'verify_company_otp'
  | 'forgot_password'
  | 'verify_reset_otp'
  | 'set_new_password'
  | 'accept_invite'
  | 'verify_invite_otp';

export interface UserInvite {
  id: string;
  tenantId: string;
  tenantName: string;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  designationId?: string;
  designationTitle?: string;
  branchLocation?: string;
  token: string;
  otpCode: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy: string;
  invitedByName: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tenantId: string;
  tenantName: string;
  role: UserRole;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  tenantId: string;
  tenantName?: string;
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  status: 'success' | 'failed' | 'otp_required' | 'blocked';
  failureReason?: string;
  timestamp: string;
}

export interface SecurityAuditRecord {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  action:
    | 'USER_LOGIN'
    | 'USER_LOGOUT'
    | 'LOGIN_FAILED'
    | 'COMPANY_REGISTERED'
    | 'EMAIL_VERIFIED'
    | 'OTP_REQUESTED'
    | 'OTP_VERIFIED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_COMPLETED'
    | 'EMPLOYEE_INVITE_SENT'
    | 'EMPLOYEE_INVITE_ACCEPTED'
    | 'EMPLOYEE_INVITE_REVOKED'
    | 'SESSION_REVOKED'
    | 'ALL_SESSIONS_REVOKED'
    | 'SESSION_TIMEOUT'
    | 'PASSWORD_POLICY_UPDATED'
    | 'TWO_FACTOR_TOGGLED'
    | 'ROLE_PERMISSIONS_CHANGED'
    | 'DATA_EXPORTED'
    | 'COMPANY_DELETED'
    | 'COMPANY_DATA_RESET'
    | 'DEMO_DATA_PURGED'
    | 'ADMIN_PASSWORD_RESET';
  category: 'authentication' | 'rbac' | 'tenant' | 'security' | 'compliance';
  ipAddress: string;
  userAgent: string;
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionIdleTimeoutMinutes: number;
  enforce2FA: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  feedback: string[];
  isValid: boolean;
}
