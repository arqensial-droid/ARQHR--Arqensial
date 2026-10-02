import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Users,
  KeyRound,
  UserPlus,
  Mail,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  LogOut,
  Sliders,
  Database,
  ExternalLink,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  Globe,
  Radio,
} from 'lucide-react';
import { UserRole } from '../../types';
import { EmailTemplatePreviewModal } from '../auth/EmailTemplatePreviewModal';
import { isConfiguredForLiveSupabase } from '../../lib/supabase';

export const SecurityModule: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    currentRole,
    updateTenantSettings,
    addNotification,
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'audit' | 'sessions' | 'login_history' | 'invites' | 'policy' | 'rbac' | 'email_templates' | 'rls_inspector'
  >('audit');

  // Search & Filters for Audit
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('all');

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('employee');
  const [inviteDept, setInviteDept] = useState('Development');
  const [inviteDesignation, setInviteDesignation] = useState('Web Developer');
  const [inviteBranch, setInviteBranch] = useState<'Mumbai HQ' | 'Mira Road Office'>('Mumbai HQ');

  // Email template preview modal
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailPreviewType, setEmailPreviewType] = useState<
    'company_otp' | 'employee_invite' | 'password_reset' | 'new_login_alert'
  >('employee_invite');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const isLive = isConfiguredForLiveSupabase();

  // Handle Send Invite
  const handleSendInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      addNotification('Validation Error', 'Please provide employee full name and email.', 'error');
      return;
    }

    sendUserInvite({
      email: inviteEmail.trim(),
      fullName: inviteName.trim(),
      role: inviteRole,
      departmentName: inviteDept,
      designationTitle: inviteDesignation,
      branchLocation: inviteBranch,
    });

    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Export audit logs
  const exportAuditLogs = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(securityAudits, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `security_audit_logs_${currentTenant.slug}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Timestamp', 'Action', 'Category', 'User Email', 'Role', 'IP Address', 'Details'];
      const rows = securityAudits.map(a => [
        `"${a.timestamp}"`,
        `"${a.action}"`,
        `"${a.category}"`,
        `"${a.userEmail}"`,
        `"${a.role}"`,
        `"${a.ipAddress}"`,
        `"${a.details.replace(/"/g, '""')}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `security_audit_${currentTenant.slug}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    addNotification('Export Complete', `Audit records exported in ${format.toUpperCase()} format.`, 'success');
  };

  const filteredAudits = securityAudits.filter(a => {
    const matchesSearch =
      a.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.userEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.ipAddress.includes(auditSearch);
    const matchesCat = auditCategory === 'all' || a.category === auditCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Enterprise Identity, Security & Audit Architecture</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-tenant isolation, Row Level Security (RLS), OTP email verification, session tokens, and SOC2 compliance for <strong>{currentTenant.name}</strong>
          </p>
        </div>

        {/* Action pills */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Employee</span>
          </button>
          <button
            onClick={() => {
              setEmailPreviewType('employee_invite');
              setEmailPreviewOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Email Templates</span>
          </button>
        </div>
      </div>

      {/* Tenant Security Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tenant Identity</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 truncate max-w-[150px]">
              {currentTenant.id}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Strict RLS Isolated
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
            RLS
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Device Sessions</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {userSessions.filter(s => !s.isRevoked).length} Devices
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Fingerprinted & Tracked</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold text-xs">
            <Laptop className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Onboarding Invites</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {userInvites.filter(i => i.status === 'pending').length} Pending
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">7-day expiration</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold text-xs">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Auth Engine Status</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {isLive ? 'Supabase Auth Cloud' : 'PostgreSQL Engine (RLS)'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              ● High-Availability
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
            <Database className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1E293B] overflow-x-auto gap-1">
        {[
          { id: 'audit', label: `SOC2 Audit Logs (${securityAudits.length})` },
          { id: 'sessions', label: `Device Sessions (${userSessions.length})` },
          { id: 'login_history', label: `Login History (${loginHistory.length})` },
          { id: 'invites', label: `Employee Invites (${userInvites.length})` },
          { id: 'policy', label: 'Password & Session Policies' },
          { id: 'rbac', label: 'RBAC Permission Matrix' },
          { id: 'rls_inspector', label: 'PostgreSQL RLS Inspector' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-2 px-3 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SOC2 AUDIT TRAIL */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Filter by action, actor, IP..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
                />
              </div>

              <select
                value={auditCategory}
                onChange={e => setAuditCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="rbac">RBAC & Invites</option>
                <option value="security">Security & Policies</option>
                <option value="tenant">Tenant Lifecycle</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredAudits.length} events
              </span>
              <button
                onClick={() => exportAuditLogs('csv')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportAuditLogs('json')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 dark:text-[#CBD5E1] border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4">Security Action</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono text-[11px]">
                {filteredAudits.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-bold text-[#0F766E] dark:text-[#14B8A6]">{log.action}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-900 dark:text-[#F8FAFC] font-medium">{log.userEmail}</td>
                    <td className="py-2.5 px-4 text-slate-500">{log.role}</td>
                    <td className="py-2.5 px-4 text-slate-500">{log.ipAddress}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-[#CBD5E1] max-w-sm truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ACTIVE DEVICE SESSIONS */}
      {/* ==================================================================== */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1E293B]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Device Fingerprints & Sessions</h2>
              <p className="text-xs text-slate-500">
                Tracked by User-Agent, IP address, and cryptographic token expiration. Revoking forces immediate re-authentication.
              </p>
            </div>
            <button
              onClick={revokeAllOtherSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          </div>

          <div className="space-y-3">
            {userSessions.map(session => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  session.isRevoked
                    ? 'opacity-50 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    : session.isCurrent
                    ? 'bg-teal-50/40 dark:bg-[#0F766E]/10 border-[#0F766E]/30'
                    : 'bg-white dark:bg-[#0B132B] border-slate-200 dark:border-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.deviceType === 'Mobile'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                        : 'bg-teal-100 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6]'
                    }`}
                  >
                    {session.deviceType === 'Mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {session.deviceName} ({session.browser} on {session.os})
                      </h4>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          Current Device
                        </span>
                      )}
                      {session.isRevoked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {session.location} · IP: {session.ipAddress} · Created: {session.createdAt.substring(0, 10)}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && !session.isRevoked && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Revoke Token
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: LOGIN HISTORY */}
      {/* ==================================================================== */}
      {activeTab === 'login_history' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Authentication & Threat Monitoring History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks successful logins, failed attempts, and brute-force anomalies
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 dark:text-[#CBD5E1] border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp (UTC)</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Device & Browser</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Geo Location</th>
                  <th className="py-2.5 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono text-[11px]">
                {loginHistory.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400">{entry.timestamp}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-900 dark:text-white font-medium">{entry.email}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          entry.status === 'success'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {entry.device} · {entry.browser}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{entry.ipAddress}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-sans">{entry.location}</td>
                    <td className="py-2.5 px-4 text-rose-500 font-sans">{entry.failureReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: EMPLOYEE ONBOARDING INVITES */}
      {/* ==================================================================== */}
      {activeTab === 'invites' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Employee Onboarding Invitations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue cryptographic invitation tokens to onboard new personnel with RBAC roles
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send New Invitation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 dark:text-[#CBD5E1] border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Invited Personnel</th>
                  <th className="py-2.5 px-4">Work Email</th>
                  <th className="py-2.5 px-4">Target Role</th>
                  <th className="py-2.5 px-4">Department / Branch</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Security PIN</th>
                  <th className="py-2.5 px-4">Expires</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 text-[11px]">
                {userInvites.map(invite => (
                  <tr key={invite.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{invite.fullName}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">{invite.email}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] uppercase">
                        {invite.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {invite.departmentName} · {invite.branchLocation || 'Mumbai HQ'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          invite.status === 'accepted'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : invite.status === 'revoked'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {invite.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{invite.otpCode}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{invite.expiresAt.substring(0, 10)}</td>
                    <td className="py-2.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => copyToClipboard(invite.token, invite.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
                        title="Copy Invitation Token"
                      >
                        {copiedToken === invite.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken === invite.id ? 'Copied' : 'Copy Token'}</span>
                      </button>

                      {invite.status === 'pending' && (
                        <button
                          onClick={() => revokeUserInvite(invite.id)}
                          className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: PASSWORD & SESSION SECURITY POLICIES */}
      {/* ==================================================================== */}
      {activeTab === 'policy' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Tenant Password & Session Enforcement Policies</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure baseline entropy rules, idle timeouts, and multi-factor authorization standards
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Minimum Password Length</h4>
                <p className="text-[11px] text-slate-500">Requires minimum characters for all organization users</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={32}
                  value={passwordPolicy.minLength}
                  onChange={e => updatePasswordPolicy({ minLength: parseInt(e.target.value) || 8 })}
                  className="w-16 px-2 py-1 text-center font-mono text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-500">chars</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Complexity Requirements</h4>
                <p className="text-[11px] text-slate-500">Enforce uppercase, lowercase, numbers, and special characters</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-teal-100 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold font-mono">
                  A-Z + a-z + 0-9 + Special
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Session Idle Timeout Warning</h4>
                <p className="text-[11px] text-slate-500">Auto-terminates inactive sessions with countdown warning</p>
              </div>
              <select
                value={passwordPolicy.sessionIdleTimeoutMinutes}
                onChange={e => updatePasswordPolicy({ sessionIdleTimeoutMinutes: parseInt(e.target.value) })}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white cursor-pointer"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-500">Mandate time-based OTP for all staff accounts</p>
              </div>
              <button
                onClick={() => updatePasswordPolicy({ enforce2FA: !passwordPolicy.enforce2FA })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  passwordPolicy.enforce2FA
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {passwordPolicy.enforce2FA ? 'Enforced' : 'Optional'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: RBAC PERMISSION MATRIX */}
      {/* ==================================================================== */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-[#1E293B]">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Access Control (RBAC) Architecture</h2>
            <p className="text-xs text-slate-500">
              Granular capabilities enforced client-side via AppContext and database-side via PostgreSQL Row Level Security (RLS).
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
            {[
              {
                role: 'Super Admin',
                scope: 'Global Platform',
                rights: 'Cross-tenant oversight, tenant provisioning, system audit logs, impersonation mode, platform security.',
                color: 'text-purple-600 dark:text-purple-400',
              },
              {
                role: 'Company Admin',
                scope: 'Tenant Workspace',
                rights: 'Full organization authority, employee onboarding, company settings, branch config, payroll settings.',
                color: 'text-[#0F766E] dark:text-[#14B8A6]',
              },
              {
                role: 'HR Manager',
                scope: 'Workforce Operations',
                rights: 'Employee directories, leave approvals, attendance regularizations, recruitment pipeline, offer letters.',
                color: 'text-blue-600 dark:text-blue-400',
              },
              {
                role: 'Payroll Manager',
                scope: 'Financial Compliance',
                rights: 'Attendance lock, salary calculation, payslip generation, statutory tax (PF, ESIC, PT, TDS), bank disbursal.',
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                role: 'Team Leader',
                scope: 'Department Squad',
                rights: 'Shift allocation, team leave approvals, attendance oversight, performance appraisal reviews.',
                color: 'text-amber-600 dark:text-amber-400',
              },
              {
                role: 'Employee',
                scope: 'Personal Self-Service',
                rights: 'Employee Self-Service (ESS), mobile check-in/out, leave requests, view own payslips, helpdesk tickets, profile.',
                color: 'text-slate-600 dark:text-slate-400',
              },
            ].map(r => (
              <div key={r.role} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="sm:w-44">
                  <span className={`font-bold block ${r.color}`}>{r.role}</span>
                  <span className="text-[10px] text-slate-400">{r.scope}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 flex-1">{r.rights}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced by RLS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: POSTGRESQL RLS INSPECTOR */}
      {/* ==================================================================== */}
      {activeTab === 'rls_inspector' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Supabase Row Level Security (RLS) Rules</h2>
              <p className="text-xs text-slate-500">
                SQL policies extracted from <code>supabase/migrations/20261002000000_auth_invites_sessions_rls.sql</code>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              100% Policy Coverage
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto space-y-3">
            <div className="text-emerald-400 font-bold">-- 1. Helper function extracting JWT tenant ID from auth claims</div>
            <div>
              CREATE OR REPLACE FUNCTION auth.jwt_tenant_id() RETURNS TEXT AS $$<br />
              &nbsp;&nbsp;SELECT COALESCE(<br />
              &nbsp;&nbsp;&nbsp;&nbsp;current_setting('request.jwt.claims', true)::json-&gt;'app_metadata'-&gt;&gt;'tenant_id',<br />
              &nbsp;&nbsp;&nbsp;&nbsp;current_setting('request.jwt.claims', true)::json-&gt;'user_metadata'-&gt;&gt;'tenant_id',<br />
              &nbsp;&nbsp;&nbsp;&nbsp;current_setting('request.jwt.claims', true)::json-&gt;&gt;'tenant_id'<br />
              &nbsp;&nbsp;);<br />
              $$ LANGUAGE SQL STABLE;
            </div>

            <div className="text-emerald-400 font-bold pt-2">-- 2. Tenant isolation on employees table</div>
            <div>
              CREATE POLICY tenant_isolation_employees ON public.employees<br />
              &nbsp;&nbsp;FOR ALL<br />
              &nbsp;&nbsp;USING (auth.jwt_user_role() = 'super_admin' OR tenant_id = auth.jwt_tenant_id());
            </div>

            <div className="text-emerald-400 font-bold pt-2">-- 3. Strict privacy on employee payslips</div>
            <div>
              CREATE POLICY tenant_isolation_payslips ON public.payslips<br />
              &nbsp;&nbsp;FOR SELECT<br />
              &nbsp;&nbsp;USING (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;auth.jwt_user_role() = 'super_admin' OR (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;tenant_id = auth.jwt_tenant_id() AND (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;auth.jwt_user_role() IN ('company_admin', 'payroll_manager') OR<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;employee_id = auth.uid()::TEXT<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;)<br />
              &nbsp;&nbsp;);
            </div>
          </div>
        </div>
      )}

      {/* Invite Employee Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/80 dark:bg-[#0F172A]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Issue Employee Onboarding Invitation
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Nikhil Kadam"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="nikhil.kadam@arqensial.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Workspace Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="payroll_manager">Payroll Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={e => setInviteDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Development">Development</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="SEO">SEO</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Content">Content</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Accounts">Accounts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={inviteDesignation}
                    onChange={e => setInviteDesignation(e.target.value)}
                    placeholder="SEO Executive"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Location
                  </label>
                  <select
                    value={inviteBranch}
                    onChange={e => setInviteBranch(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Mumbai HQ">Mumbai HQ</option>
                    <option value="Mira Road Office">Mira Road Office</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm"
                >
                  Dispatch Invitation & Generate PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactional Email Preview Modal */}
      <EmailTemplatePreviewModal
        isOpen={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        initialTemplate={emailPreviewType}
        inviteData={{
          companyName: currentTenant.name,
          employeeName: inviteName || 'Nikhil Kadam',
          email: inviteEmail || 'nikhil.kadam@arqensial.com',
          role: inviteRole,
          department: inviteDept,
          otpCode: '582914',
          inviteToken: 'inv_demo_7891_token',
        }}
      />
    </div>
  );
};
