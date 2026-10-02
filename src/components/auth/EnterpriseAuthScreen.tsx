import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Database,
  CheckCircle2,
  Users,
  Zap,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { UserRole } from '../../types';
import { isConfiguredForLiveSupabase } from '../../lib/supabase';
import { SupabaseAuthService } from '../../services/supabaseAuthService';
import { EmailTemplatePreviewModal } from './EmailTemplatePreviewModal';

type AuthStep =
  | 'signin'
  | 'register_company'
  | 'verify_company_otp'
  | 'forgot_password'
  | 'verify_reset_otp'
  | 'set_new_password'
  | 'accept_invite'
  | 'invite_set_password';

export const EnterpriseAuthScreen: React.FC = () => {
  const { login, signupTenant, tenants, currentTenant, isLoading } = useApp();

  const [step, setStep] = useState<AuthStep>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sign in state
  const [email, setEmail] = useState('rajesh.sharma@arqensial.com');
  const [password, setPassword] = useState('password123');
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || 'tenant-arqensial-01');
  const [selectedRole, setSelectedRole] = useState<UserRole>('company_admin');

  // Company registration state
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regAdminEmail, setRegAdminEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountry, setRegCountry] = useState('India');
  const [regPhone, setRegPhone] = useState('');
  const [regOtpToken, setRegOtpToken] = useState('');
  const [generatedRegOtp, setGeneratedRegOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [generatedResetOtp, setGeneratedResetOtp] = useState('');
  const [enteredResetOtp, setEnteredResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Invite acceptance state
  const [inviteTokenInput, setInviteTokenInput] = useState('');
  const [activeInvite, setActiveInvite] = useState<any | null>(null);
  const [enteredInviteOtp, setEnteredInviteOtp] = useState(['', '', '', '', '', '']);
  const [invitePassword, setInvitePassword] = useState('');

  // Email template preview modal
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailPreviewType, setEmailPreviewType] = useState<
    'company_otp' | 'employee_invite' | 'password_reset' | 'new_login_alert'
  >('employee_invite');

  const isLive = isConfiguredForLiveSupabase();

  // Helper for password strength
  const activePasswordForStrength =
    step === 'register_company'
      ? regPassword
      : step === 'set_new_password'
      ? newPassword
      : step === 'invite_set_password'
      ? invitePassword
      : '';
  const passwordStrength = SupabaseAuthService.validatePassword(activePasswordForStrength);

  // 1. Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide your corporate work email and password.');
      return;
    }

    const success = await login(email.trim(), password, selectedTenantId, selectedRole);
    if (!success) {
      setErrorMessage('Invalid authentication credentials or unauthorized tenant access.');
    }
  };

  // 2. Company Registration - Step 1: Initiate
  const handleInitiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regCompanyName.trim()) {
      setErrorMessage('Please enter legal organization name.');
      return;
    }
    if (!regAdminEmail.trim() || !regPassword) {
      setErrorMessage('Please provide corporate admin email and secure password.');
      return;
    }

    const res = await SupabaseAuthService.initiateCompanyRegistration({
      companyName: regCompanyName.trim(),
      adminEmail: regAdminEmail.trim(),
      password: regPassword,
      country: regCountry,
      phone: regPhone,
    });

    if (res.success) {
      setRegOtpToken(res.otpToken);
      setGeneratedRegOtp(res.generatedOtp);
      setEnteredOtp(res.generatedOtp.split(''));
      setStep('verify_company_otp');
    } else {
      setErrorMessage(res.error || 'Failed to initiate company registration.');
    }
  };

  // 2. Company Registration - Step 2: Verify OTP & Create Tenant
  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = enteredOtp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    const res = await SupabaseAuthService.verifyCompanyRegistrationOtp(regOtpToken, code);
    if (res.success && res.tenant) {
      // Complete tenant provisioning in AppContext
      const signRes = await signupTenant(res.tenant.name, res.adminUser.email, regPassword);
      if (signRes) {
        setSuccessBanner(`Organization workspace ${res.tenant.name} initialized successfully!`);
      }
    } else {
      setErrorMessage(res.error || 'Verification failed. Please check the code.');
    }
  };

  // 3. Forgot Password - Step 1: Request
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your registered work email.');
      return;
    }

    const res = await SupabaseAuthService.requestPasswordReset(resetEmail.trim(), selectedTenantId);
    if (res.success) {
      setResetToken(res.resetToken);
      setGeneratedResetOtp(res.generatedOtp);
      setEnteredResetOtp(res.generatedOtp.split(''));
      setStep('verify_reset_otp');
    } else {
      setErrorMessage(res.error || 'Could not issue password reset.');
    }
  };

  // 3. Forgot Password - Step 2: Verify Code
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const code = enteredResetOtp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit reset code.');
      return;
    }

    const res = await SupabaseAuthService.verifyPasswordResetOtp(resetToken, code);
    if (res.success) {
      setStep('set_new_password');
    } else {
      setErrorMessage(res.error || 'Invalid reset code.');
    }
  };

  // 3. Forgot Password - Step 3: Set New Password
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!passwordStrength.isValid) {
      setErrorMessage(passwordStrength.feedback.join('. '));
      return;
    }

    const res = await SupabaseAuthService.completePasswordReset(resetToken, newPassword);
    if (res.success) {
      setSuccessBanner('Password updated successfully. Please sign in with your new password.');
      setPassword(newPassword);
      setEmail(resetEmail);
      setStep('signin');
    } else {
      setErrorMessage(res.error || 'Password update failed.');
    }
  };

  // 4. Accept Invite - Step 1: Lookup Token
  const handleLookupInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!inviteTokenInput.trim()) {
      setErrorMessage('Please enter your invitation link or token.');
      return;
    }

    const cleanToken = inviteTokenInput.trim().replace(/.*token=/, '');
    const invite = SupabaseAuthService.findInviteByToken(cleanToken);
    if (!invite) {
      setErrorMessage('Invitation token is invalid or has expired.');
      return;
    }

    if (invite.status === 'accepted') {
      setErrorMessage('This invitation has already been accepted. Please sign in.');
      return;
    }

    setActiveInvite(invite);
    setEnteredInviteOtp(invite.otpCode.split(''));
    setStep('invite_set_password');
  };

  // 4. Accept Invite - Step 2: Verify & Activate
  const handleCompleteInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!activeInvite) return;

    const res = await SupabaseAuthService.acceptInvite(activeInvite.token, invitePassword);
    if (res.success) {
      // Auto-sign in to the newly activated tenant
      await login(activeInvite.email, invitePassword, activeInvite.tenantId, activeInvite.role);
    } else {
      setErrorMessage(res.error || 'Failed to activate invited account.');
    }
  };

  // Role persona switcher for Arqensial Technologies
  const selectPersona = (role: UserRole, targetEmail: string, tenantId = 'tenant-arqensial-01') => {
    setSelectedRole(role);
    setEmail(targetEmail);
    setSelectedTenantId(tenantId);
    setPassword('password123');
    setStep('signin');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-[#F8FAFC] font-sans selection:bg-[#0F766E]/30 selection:text-[#14B8A6]">
      {/* Left Column: Brand Hero & Production Architecture Highlights */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1E293B] bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#020617] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[#0F766E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center font-black text-lg text-white shadow-lg shadow-[#0F766E]/30">
              AQ
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-xl text-[#F8FAFC]">ARQENSIAL</span>
              <span className="text-[11px] block font-mono text-[#14B8A6] font-semibold tracking-wider uppercase">
                Enterprise Cloud HRMS Platform
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC] leading-tight">
              Enterprise Multi-Tenant Identity & Access Management
            </h1>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              Architected with Supabase Auth, Row Level Security (RLS) isolation, 6-digit OTP email verification, secure session management, device fingerprinting, and SOC2 immutable audit trails.
            </p>
          </div>

          {/* Architecture Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-lg">
            {[
              {
                title: 'Multi-Tenant Isolation',
                desc: 'Strict RLS policies ensure organizations only see their own staff and payroll.',
                icon: ShieldCheck,
                color: 'text-[#22C55E]',
              },
              {
                title: 'Supabase Auth & OTP',
                desc: 'Email verification, secure password reset, and cryptographic invite tokens.',
                icon: Zap,
                color: 'text-[#F59E0B]',
              },
              {
                title: 'Session Management',
                desc: 'Device & IP tracking, active token lifecycle, and idle session auto-timeout.',
                icon: Clock,
                color: 'text-[#14B8A6]',
              },
              {
                title: 'SOC2 Audit Logging',
                desc: 'Every login, OTP verification, and RBAC mutation recorded immutably.',
                icon: Database,
                color: 'text-[#06B6D4]',
              },
            ].map(f => (
              <div
                key={f.title}
                className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] backdrop-blur-xs space-y-1"
              >
                <div className="flex items-center gap-2">
                  <f.icon className={`w-4 h-4 ${f.color}`} />
                  <span className="text-xs font-bold text-[#F8FAFC]">{f.title}</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Email Templates Action Link */}
          <div className="pt-2">
            <button
              onClick={() => setEmailPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1E293B]/80 hover:bg-[#1E293B] text-[#14B8A6] border border-[#1E293B] transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Preview Security Email Templates (OTP / Invites)</span>
            </button>
          </div>
        </div>

        {/* Database backend badge */}
        <div className="relative z-10 pt-8 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#CBD5E1] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#22C55E] animate-pulse' : 'bg-[#14B8A6]'}`}
            />
            <span>Engine: {isLive ? 'Supabase Auth Cloud (PostgreSQL RLS)' : 'Enterprise PostgreSQL Auth & RLS'}</span>
          </div>
          <span className="text-[#14B8A6]">ARQHR v3.5 Security</span>
        </div>
      </div>

      {/* Right Column: Authentication & Organization Onboarding */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center bg-[#020617] overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mode Switcher Nav Tabs */}
          <div className="flex p-1 bg-[#0F172A] rounded-xl border border-[#1E293B] text-xs font-bold">
            <button
              onClick={() => {
                setErrorMessage(null);
                setStep('signin');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                step === 'signin'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setErrorMessage(null);
                setStep('register_company');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                step === 'register_company' || step === 'verify_company_otp'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
              }`}
            >
              Register Company
            </button>
            <button
              onClick={() => {
                setErrorMessage(null);
                setStep('accept_invite');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                step === 'accept_invite' || step === 'invite_set_password'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#CBD5E1] hover:text-[#F8FAFC]'
              }`}
            >
              Accept Invite
            </button>
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-[#EF4444] text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. SIGN IN FORM */}
          {/* ========================================================= */}
          {step === 'signin' && (
            <div className="space-y-4">
              {/* Quick Persona Access for Arqensial Technologies */}
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>Arqensial Technologies Personas</span>
                  </span>
                  <span className="text-[10px] text-[#14B8A6] font-mono">1-Click Test</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { role: 'company_admin', label: 'Company Admin', name: 'Rajesh Sharma (CEO)', email: 'rajesh.sharma@arqensial.com' },
                    { role: 'payroll_manager', label: 'Payroll Manager', name: 'Sunita Hegde', email: 'sunita.hegde@arqensial.com' },
                    { role: 'hr_manager', label: 'HR Manager', name: 'Ananya Iyer', email: 'ananya.iyer@arqensial.com' },
                    { role: 'team_leader', label: 'Senior Team Leader', name: 'Vikram Malhotra', email: 'vikram.malhotra@arqensial.com' },
                    { role: 'employee', label: 'Employee (Web Dev)', name: 'Aditya Verma', email: 'aditya.verma@arqensial.com' },
                    { role: 'super_admin', label: 'Super Admin', name: 'SaaS Platform Admin', email: 'admin@arqensial.io' },
                  ].map(p => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => selectPersona(p.role as UserRole, p.email)}
                      className={`p-2 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                        selectedRole === p.role && email === p.email
                          ? 'bg-[#0F766E]/25 border-[#0F766E] text-[#F8FAFC]'
                          : 'bg-[#0F172A] border-[#1E293B] text-[#CBD5E1] hover:text-[#F8FAFC] hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-[#F8FAFC] truncate">{p.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#CBD5E1]">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setResetEmail(email);
                        setStep('forgot_password');
                      }}
                      className="text-[11px] text-[#14B8A6] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Organization Tenant
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={e => setSelectedTenantId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:outline-hidden focus:border-[#0F766E] cursor-pointer"
                    >
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                      Authorization Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:outline-hidden focus:border-[#0F766E] cursor-pointer"
                    >
                      <option value="company_admin">Company Admin</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="payroll_manager">Payroll Manager</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="employee">Employee</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Organization</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. REGISTER COMPANY - STEP 1 */}
          {/* ========================================================= */}
          {step === 'register_company' && (
            <form onSubmit={handleInitiateRegistration} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Create New Organization Workspace</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provisions a multi-tenant PostgreSQL instance with strict Row Level Security (RLS)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Organization Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regCompanyName}
                    onChange={e => setRegCompanyName(e.target.value)}
                    placeholder="e.g. Acme Global Innovations Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Country</label>
                  <select
                    value={regCountry}
                    onChange={e => setRegCountry(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] focus:outline-hidden focus:border-[#0F766E] cursor-pointer"
                  >
                    <option value="India">India (INR, PF, ESIC, PT)</option>
                    <option value="United States">United States (USD, W-4)</option>
                    <option value="United Kingdom">United Kingdom (GBP, PAYE)</option>
                    <option value="UAE">UAE (AED, WPS)</option>
                    <option value="Singapore">Singapore (SGD, CPF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Corporate Phone</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="+91 22 6123 4500"
                    className="w-full px-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Company Admin Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regAdminEmail}
                    onChange={e => setRegAdminEmail(e.target.value)}
                    placeholder="admin@yourcompany.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">Create Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {regPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Security Strength:</span>
                      <span
                        className={`font-bold ${
                          passwordStrength.score >= 3
                            ? 'text-emerald-400'
                            : passwordStrength.score === 2
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 3
                            ? 'bg-emerald-500'
                            : passwordStrength.score === 2
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <p className="text-[10px] text-rose-400">
                        {passwordStrength.feedback[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Email Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 2. REGISTER COMPANY - STEP 2: VERIFY OTP */}
          {/* ========================================================= */}
          {step === 'verify_company_otp' && (
            <form onSubmit={handleVerifyRegistrationOtp} className="space-y-5">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setStep('register_company')}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white mb-2 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>
                <h3 className="text-base font-bold text-white">Enter 6-Digit Email Verification Code</h3>
                <p className="text-xs text-slate-400">
                  We sent a one-time verification code to <strong>{regAdminEmail}</strong>.
                </p>
              </div>

              {/* 6-Digit Inputs */}
              <div className="flex justify-between gap-2">
                {enteredOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const copy = [...enteredOtp];
                      copy[idx] = val;
                      setEnteredOtp(copy);
                      if (val && idx < 5) {
                        const next = document.getElementById(`otp-input-${idx + 1}`);
                        next?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !enteredOtp[idx] && idx > 0) {
                        const prev = document.getElementById(`otp-input-${idx - 1}`);
                        prev?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-lg font-bold font-mono rounded-lg border border-[#1E293B] bg-[#0F172A] text-white focus:outline-hidden focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  />
                ))}
              </div>

              {/* Simulated Delivery Helper */}
              <div className="p-3 rounded-lg bg-teal-950/30 border border-[#0F766E]/40 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#14B8A6] block">
                    Security Dispatch Preview
                  </span>
                  <span className="font-mono text-white text-xs font-semibold">
                    Code: {generatedRegOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailPreviewType('company_otp');
                    setEmailPreviewOpen(true);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition cursor-pointer"
                >
                  View Email
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <span>Verify & Provision Organization Tenant</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. FORGOT PASSWORD - STEP 1 */}
          {/* ========================================================= */}
          {step === 'forgot_password' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('signin')}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white mb-2 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your corporate email address to receive an authorization code
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                  Registered Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="rajesh.sharma@arqensial.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Send Reset Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. FORGOT PASSWORD - STEP 2: VERIFY OTP */}
          {/* ========================================================= */}
          {step === 'verify_reset_otp' && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('forgot_password')}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white mb-2 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-bold text-white">Verify Reset Authorization Code</h3>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit PIN sent to <strong>{resetEmail}</strong>
                </p>
              </div>

              {/* 6-Digit Inputs */}
              <div className="flex justify-between gap-2">
                {enteredResetOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const copy = [...enteredResetOtp];
                      copy[idx] = val;
                      setEnteredResetOtp(copy);
                    }}
                    className="w-12 h-12 text-center text-lg font-bold font-mono rounded-lg border border-[#1E293B] bg-[#0F172A] text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                ))}
              </div>

              <div className="p-3 rounded-lg bg-teal-950/30 border border-[#0F766E]/40 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#14B8A6] block">
                    Security Code
                  </span>
                  <span className="font-mono text-white text-xs font-semibold">
                    Code: {generatedResetOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailPreviewType('password_reset');
                    setEmailPreviewOpen(true);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-md transition cursor-pointer"
                >
                  View Email
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Authorize & Set New Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. FORGOT PASSWORD - STEP 3: SET NEW PASSWORD */}
          {/* ========================================================= */}
          {step === 'set_new_password' && (
            <form onSubmit={handleCompletePasswordReset} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Create New Secure Password</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Must meet enterprise password policies (min 8 chars, numbers, symbols)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-bold text-emerald-400">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Save New Password & Return to Login</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 4. ACCEPT EMPLOYEE INVITATION */}
          {/* ========================================================= */}
          {step === 'accept_invite' && (
            <form onSubmit={handleLookupInvite} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Accept Workspace Invitation</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter the invitation token or code provided in your onboarding email
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                  Invitation Token or Link
                </label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={inviteTokenInput}
                    onChange={e => setInviteTokenInput(e.target.value)}
                    placeholder="inv_..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {/* Sample invites shortcut */}
              <div className="p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Quick Demo Invitation Token
                </span>
                <button
                  type="button"
                  onClick={() => {
                    // Create a quick sample invite if not existing
                    const inv = SupabaseAuthService.createInvite({
                      tenantId: 'tenant-arqensial-01',
                      tenantName: 'Arqensial Technologies Pvt Ltd',
                      email: 'nikhil.kadam@arqensial.com',
                      fullName: 'Nikhil Kadam',
                      role: 'employee',
                      departmentName: 'SEO',
                      designationTitle: 'SEO Executive',
                      branchLocation: 'Mira Road Office',
                      invitedBy: 'ananya.iyer@arqensial.com',
                      invitedByName: 'Ananya Iyer (HR Executive)',
                    });
                    setInviteTokenInput(inv.token);
                  }}
                  className="text-left font-mono text-[11px] text-[#14B8A6] hover:underline cursor-pointer block truncate"
                >
                  Generate & Insert Valid Test Invite Token →
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Verify Invitation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'invite_set_password' && activeInvite && (
            <form onSubmit={handleCompleteInvite} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Welcome to {activeInvite.tenantName}!
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Activate account for <strong>{activeInvite.fullName}</strong> ({activeInvite.email})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Role:</span>
                  <span className="font-bold text-[#14B8A6] uppercase">{activeInvite.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{activeInvite.departmentName || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Work Location:</span>
                  <span className="text-white">{activeInvite.branchLocation || 'Mumbai HQ'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                  Create Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={invitePassword}
                    onChange={e => setInvitePassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] placeholder-slate-500 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Activate Account & Sign In</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Transactional Email Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        initialTemplate={emailPreviewType}
        inviteData={{
          companyName: regCompanyName || currentTenant?.name || 'Arqensial Technologies Pvt Ltd',
          employeeName: 'Aditya Verma',
          email: regAdminEmail || email,
          role: selectedRole,
          department: 'Development',
          otpCode: generatedRegOtp || generatedResetOtp || '492817',
          inviteToken: inviteTokenInput || 'inv_demo_9824_token',
        }}
      />
    </div>
  );
};
