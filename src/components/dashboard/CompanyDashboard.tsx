import React from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceQuickPunch } from './AttendanceQuickPunch';
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  Banknote,
  Cake,
  Award,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
  UserPlus,
  Building2,
  DollarSign,
  PlusCircle,
  ShieldCheck,
  Shield,
  Layers,
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
    currentRole,
    setActiveTab,
  } = useApp();

  const isSuperAdmin = currentRole === 'super_admin';
  const hasCompanies = tenants.length > 0;

  // Real KPI calculations (zero hardcoded values)
  const totalCompaniesCount = tenants.length;
  const totalEmployeesCount = employees.length;
  const totalUsersCount = tenants.reduce((acc, t) => acc + (t.employeeCount || 0), 0);
  const totalClientsCount = tenants.length;
  const totalRevenue = tenants.reduce((acc, t) => acc + (t.mrr || 0), 0);

  const today = new Date().toISOString().substring(0, 10);
  const todayRecords = attendance.filter(a => a.date === today);

  const presentCount = todayRecords.filter(a => a.status === 'Present').length;
  const lateCount = todayRecords.filter(a => a.status === 'Late').length;
  const onLeaveCount = todayRecords.filter(a => a.status === 'On Leave').length;
  const absentCount = Math.max(0, employees.length - presentCount - lateCount - onLeaveCount);

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const draftPayroll = payrollRuns.find(p => p.status === 'Draft');

  // Dynamic upcoming milestones from real employees
  const upcomingBirthdays = employees
    .filter(e => e.dob)
    .slice(0, 3)
    .map(e => ({
      name: e.fullName,
      role: e.designation,
      date: e.dob,
    }));

  const upcomingAnniversaries = employees
    .filter(e => e.joiningDate)
    .slice(0, 3)
    .map(e => ({
      name: e.fullName,
      role: e.designation,
      date: e.joiningDate,
    }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] rounded-2xl p-6 text-[#F8FAFC] shadow-sm border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-[#14B8A6] text-xs font-mono uppercase tracking-wider">
            <span>{isSuperAdmin ? 'ARQENSIAL Root Authority' : currentTenant.name}</span>
            <span>·</span>
            <span>{isSuperAdmin ? 'Platform Super Admin' : (currentTenant.planName || 'Enterprise Plan')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-[#F8FAFC] tracking-tight">
            {isSuperAdmin ? 'Enterprise Platform Command Center' : 'Workforce Command Center'}
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1 max-w-xl">
            {isSuperAdmin
              ? 'Multi-tenant cloud orchestration engine. Full administrative control across all organizations.'
              : `Live workspace overview for ${employees.length} team members across ${departments.length} departments.`}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin ? (
            <button
              onClick={() => setActiveTab('superadmin_companies')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Company Management</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('employees')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#CBD5E1] bg-[#1E293B] hover:bg-slate-700 rounded-lg transition-colors border border-[#1E293B] cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Employee</span>
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#CBD5E1] bg-[#1E293B] hover:bg-slate-700 rounded-lg transition-colors border border-[#1E293B] cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Run Payroll</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUPER ADMIN OR EMPTY STATE METRICS STRIP (Total Companies: 0, Total Users: 0, Total Employees: 0, Total Clients: 0, Total Revenue: 0) */}
      {(isSuperAdmin || !hasCompanies) && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Companies</span>
              <Building2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
              {totalCompaniesCount}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Isolated multi-tenant instances</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
              {totalUsersCount}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">System authenticated accounts</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Employees</span>
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
              {totalEmployeesCount}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Active personnel records</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Clients</span>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
              {totalClientsCount}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Enterprise accounts</span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Subscription monthly MRR</span>
          </div>
        </div>
      )}

      {/* Zero Companies Production State Notice */}
      {!hasCompanies && (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0F172A] border-2 border-dashed border-slate-200 dark:border-[#1E293B] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              ARQHR ERP Clean Production State
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              All demo datasets, sample records, and test instances have been removed. System launched as a fresh ERP platform. You are logged in with the root <strong>ARQENSIAL Super Admin</strong> account.
            </p>
          </div>
          <div>
            <button
              onClick={() => setActiveTab('superadmin_companies')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Go to Company Management</span>
            </button>
          </div>
        </div>
      )}

      {/* Tenant-level cards (shown when a company context is active) */}
      {hasCompanies && (
        <>
          <AttendanceQuickPunch />

          {/* Primary KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div
              onClick={() => setActiveTab('employees')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Total Staff</span>
                <Users className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                {employees.length}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Enrolled personnel
              </div>
            </div>

            <div
              onClick={() => setActiveTab('attendance')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#22C55E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Present</span>
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                {presentCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-[#CBD5E1] font-mono">
                {employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0}% on duty
              </div>
            </div>

            <div
              onClick={() => setActiveTab('attendance')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#F59E0B] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Late Marks</span>
                <Clock className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                {lateCount}
              </div>
              <div className="mt-1 text-[11px] text-[#F59E0B]">
                Recorded today
              </div>
            </div>

            <div
              onClick={() => setActiveTab('attendance')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#EF4444] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Absent</span>
                <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                {absentCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Unplanned absence
              </div>
            </div>

            <div
              onClick={() => setActiveTab('leaves')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Leave Approvals</span>
                <CalendarDays className="w-4 h-4 text-[#14B8A6]" />
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                {pendingLeaves.length}
              </div>
              <div className="mt-1 text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-medium">
                Requires action
              </div>
            </div>

            <div
              onClick={() => setActiveTab('payroll')}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Payroll Cycle</span>
                <Banknote className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="mt-2 text-sm font-bold font-mono text-slate-900 dark:text-[#F8FAFC] truncate">
                {draftPayroll ? 'Draft Pending' : 'Current Batch'}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                {payrollRuns.length} runs on record
              </div>
            </div>
          </div>

          {/* Department Breakdown & Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Department Headcount & Allocation</h2>
                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">Distribution across operational units</p>
                </div>
                <button
                  onClick={() => setActiveTab('org_structure')}
                  className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Org Hierarchy <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {departments.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No departments created yet for this organization.
                  </div>
                ) : (
                  departments.map(dept => {
                    const count = employees.filter(e => e.departmentId === dept.id || e.departmentName === dept.name).length;
                    const total = employees.length || 1;
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={dept.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                            {dept.name} ({dept.code})
                          </span>
                          <span className="font-mono text-slate-500 dark:text-[#CBD5E1] tabular-nums">
                            {count} staff · {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-[#1E293B] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0F766E] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Pending Approvals</h2>
                  <span className="text-xs font-mono px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-[#F59E0B] rounded font-semibold">
                    {pendingLeaves.length} items
                  </span>
                </div>

                <div className="mt-3 divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {pendingLeaves.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      All employee requests cleared
                    </div>
                  ) : (
                    pendingLeaves.slice(0, 3).map(req => (
                      <div key={req.id} className="py-2.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                            {req.employeeName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] truncate">
                            {req.leaveType} · {req.daysCount} Day(s)
                          </p>
                          <p className="text-[10px] text-slate-400 italic truncate mt-0.5">
                            "{req.reason}"
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('leaves')}
                          className="px-2 py-1 text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:bg-teal-50 dark:hover:bg-[#1E293B] rounded cursor-pointer shrink-0"
                        >
                          Review
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  onClick={() => setActiveTab('leaves')}
                  className="w-full text-center py-2 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:bg-teal-50 dark:hover:bg-[#1E293B]/50 rounded-lg transition-colors cursor-pointer"
                >
                  View All Approvals Workflow →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
