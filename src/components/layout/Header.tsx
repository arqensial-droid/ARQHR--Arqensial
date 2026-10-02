import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { NotificationDrawer } from './NotificationDrawer';
import { SupabaseConnectModal } from '../database/SupabaseConnectModal';
import { AuthModal } from '../auth/AuthModal';
import { isConfiguredForLiveSupabase } from '../../lib/supabase';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Clock,
  CheckCircle,
  Menu,
  ShieldCheck,
  Search,
  Database,
  LogIn,
  LogOut,
  RefreshCw,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebarMobile }) => {
  const {
    tenants,
    currentTenant,
    switchTenant,
    currentRole,
    setCurrentRole,
    currentUser,
    isDarkMode,
    toggleDarkMode,
    notifications,
    attendance,
    setActiveTab,
    logout,
    refreshFromDatabase,
    loadDemoCompany,
  } = useApp();

  const [time, setTime] = useState<string>('');
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isLiveSupabase = isConfiguredForLiveSupabase();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today's attendance status for current user
  const today = new Date().toISOString().substring(0, 10);
  const userPunch = attendance.find(a => a.employeeId === currentUser.id && a.date === today);

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
    company_admin: { label: 'Company Admin', badge: 'bg-teal-50 text-[#0F766E] dark:bg-[#0F766E]/20 dark:text-[#14B8A6]' },
    hr_manager: { label: 'HR Manager', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
    team_leader: { label: 'Team Leader', badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
    manager: { label: 'Manager', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
    employee: { label: 'Employee', badge: 'bg-slate-100 text-slate-700 dark:bg-[#1E293B] dark:text-[#CBD5E1]' },
    payroll_manager: { label: 'Payroll Manager', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
    recruiter: { label: 'Recruiter', badge: 'bg-teal-50/80 text-[#06B6D4] dark:bg-[#06B6D4]/15 dark:text-[#06B6D4]' },
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E293B] px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Zone 1: Mobile Hamburger + Brand title & Tenant Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg text-slate-950 dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span className="w-7 h-7 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-black text-xs shadow-xs">
                AQ
              </span>
              ARQENSIAL
            </span>

            <span className="text-slate-300 dark:text-slate-700 text-sm hidden sm:inline">/</span>

            {/* Tenant switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-[#1E293B] dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-200 dark:border-[#1E293B] cursor-pointer max-w-[180px] sm:max-w-[240px]"
                title="Switch Multi-Tenant Portal"
              >
                <Building2 className="w-3.5 h-3.5 text-[#14B8A6] shrink-0" />
                <span className="truncate">{currentTenant.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {tenantDropdownOpen && (
                <div
                  className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl shadow-xl py-1.5 z-50 animate-fade-in"
                  onMouseLeave={() => setTenantDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-[#1E293B]">
                    Switch Enterprise Portal
                  </div>
                  {tenants.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenant(t.id);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1E293B]/70 cursor-pointer ${
                        t.id === currentTenant.id ? 'bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] font-semibold' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{t.domain} · {t.employeeCount} staff</div>
                      </div>
                      {t.id === currentTenant.id && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                  <div className="pt-1.5 border-t border-slate-100 dark:border-[#1E293B] px-2 space-y-1">
                    <button
                      onClick={() => {
                        loadDemoCompany();
                        setTenantDropdownOpen(false);
                      }}
                      className="w-full text-left py-1.5 px-2 text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-semibold bg-[#0F766E]/10 dark:bg-[#0F766E]/20 rounded-md hover:bg-[#0F766E]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Load Demo Company (Arqensial)</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentRole('super_admin');
                        setActiveTab('superadmin_companies');
                        setTenantDropdownOpen(false);
                      }}
                      className="w-full text-center py-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer"
                    >
                      Manage All Companies in Super Admin →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zone 2: Search & Live Clock Status */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees, payroll, policies (Cmd + K)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/70 dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0F766E] focus:bg-white dark:focus:bg-[#020617] transition-all"
            />
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{time || '09:00:00 AM'}</span>
          </div>

          {/* Attendance status */}
          <div className="shrink-0">
            {userPunch ? (
              <span className="flex items-center gap-1 text-[11px] text-[#22C55E] font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Punched In ({userPunch.checkInTime})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-[#1E293B] px-2 py-0.5 rounded-md">
                Not Clocked In Today
              </span>
            )}
          </div>
        </div>

        {/* Zone 3: Supabase status, Role Switcher, PWA Button, Notifications, Theme, User */}
        <div className="flex items-center gap-2 shrink-0">
          {/* One-click Load Demo Company Button */}
          <button
            onClick={loadDemoCompany}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] text-white shadow-xs hover:shadow-sm transition-all cursor-pointer transform active:scale-95"
            title="Load Demo Company: Arqensial Technologies Pvt Ltd (25 Employees, 8 Departments, 4 Payroll Runs, 20 Attendance records/emp)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-medium whitespace-nowrap">Load Demo Company</span>
          </button>

          {/* Supabase Database Connection Pill */}
          <button
            onClick={() => setSupabaseModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
              isLiveSupabase
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#1E293B] dark:text-slate-300 dark:border-[#1E293B]'
            }`}
            title="Configure Supabase Database & RLS"
          >
            <Database className={`w-3.5 h-3.5 ${isLiveSupabase ? 'text-[#22C55E]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">DB:</span>
            <span className="font-semibold">{isLiveSupabase ? 'Supabase Live' : 'PostgreSQL Engine'}</span>
          </button>

          {/* Sign In / Auth Switcher */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-[#1E293B] transition cursor-pointer"
            title="Authenticate / Change User Identity"
          >
            <LogIn className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span className="hidden md:inline">Auth</span>
          </button>

          {/* Role Switcher Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-[#1E293B] rounded-lg transition-colors cursor-pointer bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Switch user perspective role (Super Admin, HR, Manager, Employee, etc.)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span className="hidden sm:inline font-mono text-[11px]">Role:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {roleLabels[currentRole].label}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl shadow-xl py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100 dark:border-[#1E293B]">
                  Switch Active Role Persona
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map(roleKey => (
                  <button
                    key={roleKey}
                    onClick={() => {
                      setCurrentRole(roleKey);
                      if (roleKey === 'super_admin') {
                        setActiveTab('superadmin_companies');
                      } else if (roleKey === 'employee') {
                        setActiveTab('ess_portal');
                      } else {
                        setActiveTab('dashboard');
                      }
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1E293B]/70 cursor-pointer ${
                      currentRole === roleKey
                        ? 'bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] font-semibold'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{roleLabels[roleKey].label}</span>
                    {currentRole === roleKey && <CheckCircle className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Notifications Button with Badge */}
          <button
            onClick={() => setNotifDrawerOpen(true)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
            )}
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark/light mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile dropdown */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-[#1E293B]">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity text-left"
              title={`${currentUser.fullName} (${currentUser.designation})`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white dark:ring-[#0F172A] shadow-xs">
                {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate max-w-[120px]">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                  {currentUser.empCode}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0F172A] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E293B] py-1.5 z-50 animate-fade-in font-sans">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-[#1E293B]">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] font-semibold uppercase">
                    {currentRole.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      if (currentRole === 'employee') {
                        setActiveTab('ess_portal');
                      } else {
                        setActiveTab('employees');
                      }
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      refreshFromDatabase();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Sync Database Records</span>
                  </button>

                  <button
                    onClick={() => {
                      setSupabaseModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Supabase Connection</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1E293B]/60 flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-500" />
                    <span>Switch User Persona</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-[#1E293B]">
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />

      {/* Supabase Connect Modal */}
      <SupabaseConnectModal isOpen={supabaseModalOpen} onClose={() => setSupabaseModalOpen(false)} />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
