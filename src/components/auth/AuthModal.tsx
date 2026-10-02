import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, Building, ShieldCheck, UserCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    tenants,
    currentTenant,
    switchTenant,
    currentRole,
    setCurrentRole,
    login,
    signupTenant,
    currentUser,
    isLoading,
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('password123');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>(currentRole);
  const [selectedTenantId, setSelectedTenantId] = useState(currentTenant.id);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !email.includes('@')) {
      setFormError('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!companyName.trim()) {
        setFormError('Company name is required.');
        return;
      }
      const ok = await signupTenant(companyName.trim(), email.trim(), password);
      if (ok) {
        onClose();
      }
    } else {
      const ok = await login(email.trim(), password, selectedTenantId, role);
      if (ok) {
        onClose();
      }
    }
  };

  const handleQuickPersona = (targetRole: UserRole, targetEmail: string) => {
    setRole(targetRole);
    setEmail(targetEmail);
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/15 flex items-center justify-center text-[#0F766E] dark:text-[#14B8A6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                {mode === 'signin' ? 'Sign In to ARQENSIAL' : 'Register Enterprise Organization'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">
                Multi-Tenant SSO & Role-Based Access Control (PostgreSQL Engine)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="mx-6 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-[#EF4444] text-[#EF4444] dark:text-rose-300 text-xs">
            {formError}
          </div>
        )}

        {/* Quick Role Persona Selector for Evaluation */}
        {mode === 'signin' && (
          <div className="px-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Quick Switch Role Persona (Instant Demo Access)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { r: 'company_admin', label: 'Company Admin', email: 'sarah.jenkins@apexglobal.com' },
                { r: 'manager', label: 'Manager', email: 'marcus.vance@apexglobal.com' },
                { r: 'payroll_manager', label: 'Payroll Manager', email: 'david.sterling@apexglobal.com' },
                { r: 'employee', label: 'Employee', email: 'maya.patel@apexglobal.com' },
              ].map(p => (
                <button
                  key={p.r}
                  type="button"
                  onClick={() => handleQuickPersona(p.r as UserRole, p.email)}
                  className={`px-2 py-1.5 rounded-md text-[10px] font-semibold text-left border transition-all cursor-pointer ${
                    role === p.r
                      ? 'bg-[#0F766E]/15 border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6]'
                      : 'border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-slate-600 dark:text-[#CBD5E1]'
                  }`}
                >
                  <span className="block truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
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
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          {mode === 'signup' ? (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Organization Legal Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Apex Global Technologies"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                  Tenant Workspace
                </label>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC]"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                  Role Persona
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC]"
                >
                  <option value="company_admin">Company Admin</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="manager">Manager</option>
                  <option value="team_leader">Team Leader</option>
                  <option value="employee">Employee</option>
                  <option value="payroll_manager">Payroll Manager</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{mode === 'signin' ? 'Sign In & Access Workspace' : 'Register Enterprise Organization'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#020617] border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setMode(mode === 'signin' ? 'signup' : 'signin');
            }}
            className="text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer font-medium"
          >
            {mode === 'signin' ? '+ Register New Company Organization' : '← Back to Sign In'}
          </button>
          <span className="text-[10px] text-slate-400 font-mono">SOC2 & HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
};
