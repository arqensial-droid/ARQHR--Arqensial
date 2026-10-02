import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceQuickPunch } from '../dashboard/AttendanceQuickPunch';
import { PayslipModal } from '../payroll/PayslipModal';
import {
  User,
  Banknote,
  CalendarDays,
  Receipt,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  Eye,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { Payslip } from '../../types';

export const EmployeeSelfService: React.FC = () => {
  const {
    currentUser,
    currentTenant,
    payslips,
    leaveBalances,
    leaveRequests,
    expenses,
    tickets,
    setActiveTab,
  } = useApp();

  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Filter current user's records
  const myPayslips = payslips.filter(p => p.employeeId === currentUser.id);
  const myLeaves = leaveRequests.filter(l => l.employeeId === currentUser.id);
  const myExpenses = expenses.filter(e => e.employeeId === currentUser.id);
  const myTickets = tickets.filter(t => t.employeeId === currentUser.id);

  const balance = leaveBalances[currentUser.id] || {
    casualLeave: { total: 12, used: 2, balance: 10 },
    sickLeave: { total: 10, used: 1, balance: 9 },
    earnedLeave: { total: 18, used: 4, balance: 14 },
    compOff: { total: 2, used: 0, balance: 2 },
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#0F172A] rounded-2xl p-6 text-[#F8FAFC] border border-[#1E293B] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white font-bold text-xl flex items-center justify-center ring-4 ring-[#0F766E]/20 shadow-md">
            {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#14B8A6] uppercase tracking-widest block font-semibold">
              ARQENSIAL Employee Self Service (ESS)
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-0.5">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="text-xs text-[#CBD5E1] mt-1">
              {currentUser.designation} · {currentUser.departmentName} · {currentUser.empCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leaves')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className="px-3.5 py-2 text-xs font-semibold text-[#CBD5E1] bg-[#1E293B] hover:bg-slate-700 rounded-lg border border-[#1E293B] cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Receipt className="w-4 h-4 text-[#14B8A6]" />
            <span>Claim Expense</span>
          </button>
        </div>
      </div>

      {/* Clock In / Out Module */}
      <AttendanceQuickPunch />

      {/* Quota & Quick Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Casual Leave (CL)</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">
            {balance.casualLeave.balance} <span className="text-xs text-slate-400">/ {balance.casualLeave.total}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">Available days</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Earned Leave (EL)</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#22C55E]">
            {balance.earnedLeave.balance} <span className="text-xs text-slate-400">/ {balance.earnedLeave.total}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">Annual vacation</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Net Salary</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
            ${currentUser.salaryStructure.netMonthly.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#22C55E] mt-1 block">Direct deposit active</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open IT / HR Tickets</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#06B6D4]">
            {myTickets.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">Support queue</span>
        </div>
      </div>

      {/* Main 2-column view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payslips */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#14B8A6]" />
              <span>My Salary Payslips</span>
            </h2>
            <button
              onClick={() => setActiveTab('payroll')}
              className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-semibold hover:underline"
            >
              Tax Statement →
            </button>
          </div>

          {myPayslips.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No payslips generated for this period.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
              {myPayslips.map(slip => (
                <div key={slip.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{slip.month}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Net Take-Home: ${slip.netPayable.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPayslip(slip)}
                    className="px-2.5 py-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:bg-teal-50 dark:hover:bg-[#1E293B] rounded cursor-pointer inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Payslip</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Leaves */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#22C55E]" />
              <span>My Recent Leave Applications</span>
            </h2>
            <button
              onClick={() => setActiveTab('leaves')}
              className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-semibold hover:underline"
            >
              View All →
            </button>
          </div>

          {myLeaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No leave applications submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
              {myLeaves.map(leave => (
                <div key={leave.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{leave.leaveType}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {leave.startDate} to {leave.endDate} ({leave.daysCount} days)
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-50 text-[#22C55E] dark:bg-emerald-950/60 dark:text-emerald-400'
                        : leave.status === 'Rejected'
                        ? 'bg-rose-50 text-[#EF4444] dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-50 text-[#F59E0B] dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
};
