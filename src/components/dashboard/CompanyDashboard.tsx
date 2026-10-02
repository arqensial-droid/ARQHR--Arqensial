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
  Sparkles,
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const {
    currentTenant,
    employees,
    attendance,
    leaveRequests,
    payrollRuns,
    departments,
    setActiveTab,
    loadDemoCompany,
  } = useApp();

  const today = new Date().toISOString().substring(0, 10);
  const todayRecords = attendance.filter(a => a.date === today);

  const presentCount = todayRecords.filter(a => a.status === 'Present').length;
  const lateCount = todayRecords.filter(a => a.status === 'Late').length;
  const onLeaveCount = todayRecords.filter(a => a.status === 'On Leave').length;
  const absentCount = Math.max(0, employees.length - presentCount - lateCount - onLeaveCount);

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const draftPayroll = payrollRuns.find(p => p.status === 'Draft');

  const upcomingBirthdays = [
    { name: 'David Chen', role: 'Lead UI/UX Architect', date: 'Oct 04', daysLeft: 'In 3 days' },
    { name: 'Priya Sharma', role: 'Director of Product', date: 'Oct 09', daysLeft: 'In 8 days' },
  ];

  const upcomingAnniversaries = [
    { name: 'Sarah Jenkins', role: 'Chief People Officer', years: '4 Years', date: 'Oct 15' },
    { name: 'Alex Rivera', role: 'VP of Engineering', years: '5 Years', date: 'Nov 01' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] rounded-2xl p-5 text-[#F8FAFC] shadow-sm border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-[#14B8A6] text-xs font-mono uppercase tracking-wider">
            <span>{currentTenant.name}</span>
            <span>·</span>
            <span>{currentTenant.planName} Plan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-[#F8FAFC] tracking-tight">
            Workforce Command Center
          </h1>
          <p className="text-xs text-[#CBD5E1] mt-1 max-w-xl">
            Live tenant overview for {employees.length} team members across {departments.length} departments.
          </p>
        </div>

        {/* Quick actions buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadDemoCompany}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
            title="One-click load Arqensial Technologies Pvt Ltd (25 Employees, 8 Departments, 4 Payroll Runs, 20 Attendance records/emp)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Demo Company</span>
          </button>
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
        </div>
      </div>

      {/* Attendance Clock Quick Card */}
      <AttendanceQuickPunch />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Employees */}
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
          <div className="mt-1 text-[11px] text-[#22C55E] flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +4 this month
          </div>
        </div>

        {/* Present Today */}
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
            {Math.round((presentCount / Math.max(1, employees.length)) * 100)}% on duty
          </div>
        </div>

        {/* Late Today */}
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
            Grace: 15 mins
          </div>
        </div>

        {/* Absent */}
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

        {/* Leave Requests */}
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

        {/* Payroll Status */}
        <div
          onClick={() => setActiveTab('payroll')}
          className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1]">Payroll Cycle</span>
            <Banknote className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="mt-2 text-sm font-bold font-mono text-slate-900 dark:text-[#F8FAFC] truncate">
            {draftPayroll ? 'Draft Pending' : 'Disbursed'}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Oct 2026 Batch
          </div>
        </div>
      </div>

      {/* Mid Section: Department Breakdown & Pending Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Analytics */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Department Headcount & Allocation</h2>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">Distribution across operational functional units</p>
            </div>
            <button
              onClick={() => setActiveTab('org_structure')}
              className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Org Hierarchy <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {departments.map(dept => {
              const count = dept.employeeCount;
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
                      {count} staff · {percentage}% · Head: {dept.headEmployeeName}
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
            })}
          </div>
        </div>

        {/* Pending Approval Actions Card */}
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

      {/* Bottom Section: Celebrations & Fast Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Birthdays & Milestones */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Cake className="w-4 h-4 text-[#14B8A6]" />
              <span>Upcoming Birthdays & Milestones</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">October 2026</span>
          </div>

          <div className="mt-3 space-y-3">
            {upcomingBirthdays.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold text-xs">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">{b.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">{b.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] font-mono">{b.date}</span>
                  <span className="block text-[10px] text-slate-400">{b.daysLeft}</span>
                </div>
              </div>
            ))}

            {upcomingAnniversaries.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#F59E0B] flex items-center justify-center font-bold text-xs">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">{a.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">{a.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#F59E0B] font-mono">{a.years}</span>
                  <span className="block text-[10px] text-slate-400">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick System Hub */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>HR Operations Hub</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">Direct launchpads for company workflows</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('recruitment')}
              className="p-3 text-left rounded-lg bg-slate-50 dark:bg-[#1E293B]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6]">
                Recruitment Pipeline
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">3 active job openings</div>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className="p-3 text-left rounded-lg bg-slate-50 dark:bg-[#1E293B]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6]">
                Q4 Goals & OKRs
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">79% overall on track</div>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className="p-3 text-left rounded-lg bg-slate-50 dark:bg-[#1E293B]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6]">
                Document Vault
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">Policies & e-signs</div>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="p-3 text-left rounded-lg bg-slate-50 dark:bg-[#1E293B]/50 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer group"
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6]">
                Compliance Reports
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">CSV & PDF Exports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
