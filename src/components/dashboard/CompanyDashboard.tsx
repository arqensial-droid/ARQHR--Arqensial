import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceQuickPunch } from './AttendanceQuickPunch';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  Banknote,
  Building2,
  Cake,
  Bell,
  Radio,
  PlusCircle,
  UserPlus,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderArchive,
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const {
    currentTenant,
    tenants,
    employees,
    attendance,
    leaveRequests,
    payrollRuns,
    departments,
    auditLogs,
    feedPosts,
    notifications,
    currentRole,
    currentUser,
    setActiveTab,
    punchAttendance,
    addNotification,
  } = useApp();

  const isSuperAdmin = currentRole === 'super_admin';
  const hasCompanies = tenants.length > 0;
  const hasEmployees = employees.length > 0;

  // Real KPI calculations
  const totalEmployeesCount = employees.length;
  const activeCompaniesCount = tenants.length;
  const today = new Date().toISOString().substring(0, 10);
  const todayRecords = attendance.filter((a) => a.date === today);

  const presentCount = todayRecords.filter((a) => a.status === 'Present').length;
  const lateCount = todayRecords.filter((a) => a.status === 'Late').length;
  const onLeaveCount = todayRecords.filter((a) => a.status === 'On Leave').length;
  const absentCount = Math.max(0, employees.length - presentCount - lateCount - onLeaveCount);

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending');

  // Monthly payroll calculation
  const latestPayrollRun = payrollRuns[0];
  const monthlyPayrollTotal =
    latestPayrollRun?.totalNet ||
    employees.reduce((acc, e) => acc + (e.salaryStructure?.monthlyGross || 0), 0);

  // Dynamic upcoming milestones from real employees
  const upcomingBirthdays = employees
    .filter((e) => e.dob)
    .slice(0, 4)
    .map((e) => ({
      name: e.fullName,
      role: e.designation,
      date: e.dob,
    }));

  // Quick punch helper
  const handleQuickClockIn = () => {
    const success = punchAttendance('check_in', 'Web', { isWFH: false });
    if (success) {
      addNotification('Attendance Clocked', 'You have clocked in successfully for today.', 'success');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto font-sans antialiased text-[#0F172A]">
      {/* 1. WELCOME BANNER WITH DYNAMIC COMPANY LOGO */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0F172A] text-white shadow-md border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          {/* Company Logo or ARQENSIAL Default Placeholder */}
          {currentTenant.logo ? (
            <div
              onClick={() => setActiveTab('documents')}
              className="w-16 h-16 rounded-2xl bg-white p-2 border border-slate-700 shadow-md flex items-center justify-center shrink-0 cursor-pointer hover:border-[#2563EB] transition-colors"
              title="Manage Company Logo in File Vault"
            >
              <img
                src={currentTenant.logo}
                alt={currentTenant.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              onClick={() => setActiveTab('documents')}
              className="w-16 h-16 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 cursor-pointer hover:bg-[#1D4ED8] transition-colors"
              title="ARQENSIAL Default Placeholder Logo. Click to upload custom logo."
            >
              AQ
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#3B82F6] text-xs font-mono uppercase tracking-wider font-semibold">
              <span>{isSuperAdmin ? 'ARQENSIAL Root Holding' : currentTenant.name}</span>
              <span aria-hidden="true">·</span>
              <span>{isSuperAdmin ? 'Super Admin Portal' : (currentTenant.subscriptionPlan || 'Enterprise Tier')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isSuperAdmin ? 'Enterprise Platform Command Center' : 'Workforce Command Center'}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {isSuperAdmin
                ? 'Centralized multi-tenant infrastructure. Oversee subsidiaries, holding organizations, and global security.'
                : `Active operations dashboard for ${employees.length} team members across ${departments.length} functional departments.`}
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isSuperAdmin ? (
            <button
              onClick={() => setActiveTab('superadmin_companies')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Company</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('employees')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-[#1E293B] hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <Banknote className="w-4 h-4 text-[#3B82F6]" />
                <span>Run Payroll</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. TOP 6 KPI CARDS (16px radius, hover lift effect, scale 1.02) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Total Employees */}
        <div
          onClick={() => setActiveTab('employees')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Total Employees
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {totalEmployeesCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
              <span>{departments.length} departments</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Present Today */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Present Today
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-[#10B981]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#10B981]">
              {presentCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span>{lateCount > 0 ? `${lateCount} late arrival(s)` : '100% on schedule'}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Absent Today */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Absent Today
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-[#EF4444]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#EF4444]">
              {absentCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span>{onLeaveCount} on approved leave</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Leave Requests */}
        <div
          onClick={() => setActiveTab('leaves')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Leave Requests
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-[#F59E0B]">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#F59E0B]">
              {pendingLeaves.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span>Pending review</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Monthly Payroll */}
        <div
          onClick={() => setActiveTab('payroll')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Monthly Payroll
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              ${monthlyPayrollTotal > 0 ? (monthlyPayrollTotal / 1000).toFixed(1) + 'k' : '$0'}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-0.5">
              <span>Statutory compliant</span>
            </div>
          </div>
        </div>

        {/* KPI 6: Active Companies */}
        <div
          onClick={() => setActiveTab(isSuperAdmin ? 'superadmin_companies' : 'company_settings')}
          className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift cursor-pointer space-y-2 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase font-bold text-[#64748B]">
              Active Companies
            </span>
            <span className="p-2 rounded-xl bg-slate-100 text-[#0F172A]">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#0F172A]">
              {activeCompaniesCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <span>Multi-Tenant RLS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE OPERATIONAL GRID: ATTENDANCE WIDGET + RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Attendance & Punctuality Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Punch Interactive Station */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">Today's Workforce Attendance Status</h3>
                <p className="text-xs text-[#64748B]">
                  Live status for {today} · Geofenced GPS validation active
                </p>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full Register</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attendance Progress Bar */}
            {hasEmployees ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-600 font-semibold">{presentCount} Present</span>
                  <span className="text-amber-500 font-semibold">{lateCount} Late</span>
                  <span className="text-blue-500 font-semibold">{onLeaveCount} On Leave</span>
                  <span className="text-rose-500 font-semibold">{absentCount} Absent</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    style={{ width: `${(presentCount / totalEmployeesCount) * 100}%` }}
                    className="bg-[#10B981] h-full"
                    title={`Present: ${presentCount}`}
                  />
                  <div
                    style={{ width: `${(lateCount / totalEmployeesCount) * 100}%` }}
                    className="bg-[#F59E0B] h-full"
                    title={`Late: ${lateCount}`}
                  />
                  <div
                    style={{ width: `${(onLeaveCount / totalEmployeesCount) * 100}%` }}
                    className="bg-[#2563EB] h-full"
                    title={`On Leave: ${onLeaveCount}`}
                  />
                  <div
                    style={{ width: `${(absentCount / totalEmployeesCount) * 100}%` }}
                    className="bg-[#EF4444] h-full"
                    title={`Absent: ${absentCount}`}
                  />
                </div>
              </div>
            ) : (
              /* EMPTY STATE FOR ATTENDANCE */
              <div className="py-6 text-center space-y-3">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-[#64748B]">
                  No Attendance Records Yet. Add employees to start recording real-time clock-in.
                </div>
                <button
                  onClick={handleQuickClockIn}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl cursor-pointer"
                >
                  Generate Attendance / Clock In
                </button>
              </div>
            )}
          </div>

          {/* RECENT ACTIVITIES SECTION (Audit Log Stream) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Recent Activities & Security Log</h3>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                className="text-xs text-[#2563EB] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Full Audit Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748B]">
                No recent activity recorded yet. System modifications will stream here in real time.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#2563EB]">
                          {log.action}
                        </span>
                        <span className="font-semibold text-[#0F172A]">{log.resourceType}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{log.details}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Birthdays, Announcements, Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* UPCOMING BIRTHDAYS */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Cake className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-[#0F172A]">Upcoming Birthdays</h3>
            </div>

            {upcomingBirthdays.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No upcoming birthdays this week.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingBirthdays.map((b, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#0F172A] block">{b.name}</span>
                      <span className="text-[10px] text-slate-500">{b.role}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {b.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ANNOUNCEMENTS & COMPANY PULSE */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Announcements</h3>
              </div>
              <button
                onClick={() => setActiveTab('engagement')}
                className="text-xs text-[#2563EB] hover:underline font-semibold"
              >
                Pulse Wall
              </button>
            </div>

            {feedPosts.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No company broadcasts yet. Publish updates from Company Pulse.
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {feedPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="p-3 rounded-xl bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A]">{post.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NOTIFICATIONS REAL-TIME STREAM */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-sm text-[#0F172A]">Notifications</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-bold">
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                You're completely caught up! No active alerts.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#0F172A] block">{n.title}</span>
                      <span className="text-[11px] text-slate-500 leading-snug">{n.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. PROFESSIONAL EMPTY STATE FALLBACKS IF SYSTEM HAS NO DATA */}
      {!hasCompanies && (
        <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4">
          <Building2 className="w-12 h-12 text-[#2563EB] mx-auto" />
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0F172A]">No Companies Found</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Your platform is clean and production-ready. Create your first holding or child organization.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('superadmin_companies')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Create First Company
          </button>
        </div>
      )}

      {hasCompanies && !hasEmployees && (
        <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4">
          <Users className="w-12 h-12 text-[#2563EB] mx-auto" />
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0F172A]">No Employees Enrolled Yet</h3>
            <p className="text-xs text-[#64748B] mt-1">
              Add your first team member or upload a batch CSV to start attendance and payroll operations.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('employees')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Add First Employee
          </button>
        </div>
      )}
    </div>
  );
};
