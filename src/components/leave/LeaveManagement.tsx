import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';
import {
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const {
    leaveRequests,
    leaveBalances,
    holidays,
    applyLeave,
    updateLeaveStatus,
    currentUser,
    currentRole,
    currentTenant,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'apply' | 'holidays'>('requests');

  // Form states for Apply Leave
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [daysCount, setDaysCount] = useState(1);
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');

  const balance = leaveBalances[currentUser.id] || {
    casualLeave: { total: 12, used: 2, balance: 10 },
    sickLeave: { total: 10, used: 1, balance: 9 },
    earnedLeave: { total: 18, used: 4, balance: 14 },
    compOff: { total: 2, used: 0, balance: 2 },
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addNotification('Missing Reason', 'Please specify a reason for your leave request.', 'warning');
      return;
    }

    applyLeave({
      leaveType,
      startDate,
      endDate,
      daysCount,
      halfDay,
      reason,
    });

    setReason('');
    setActiveTab('requests');
  };

  const isManagerOrAdmin = currentRole === 'company_admin' || currentRole === 'hr_manager' || currentRole === 'manager' || currentRole === 'super_admin';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Leave & Holiday Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Leave balance accruals, multi-level approvals and corporate holiday calendar for {currentTenant.name}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-lg">
          {[
            { id: 'requests', label: `Leave Requests (${leaveRequests.length})` },
            { id: 'apply', label: 'Apply for Leave' },
            { id: 'holidays', label: `Holidays (${holidays.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Casual Leave (CL)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6]">{balance.casualLeave.balance}</span>
            <span className="text-xs text-slate-400 font-mono">/ {balance.casualLeave.total} total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">{balance.casualLeave.used} days utilized</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sick Leave (SL)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{balance.sickLeave.balance}</span>
            <span className="text-xs text-slate-400 font-mono">/ {balance.sickLeave.total} total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">{balance.sickLeave.used} days utilized</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Earned / Privilege (EL)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{balance.earnedLeave.balance}</span>
            <span className="text-xs text-slate-400 font-mono">/ {balance.earnedLeave.total} total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">{balance.earnedLeave.used} days utilized</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Comp Off Quota</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{balance.compOff.balance}</span>
            <span className="text-xs text-slate-400 font-mono">/ {balance.compOff.total} total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">Weekend work accruals</span>
        </div>
      </div>

      {/* Main Tab content */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Leave Application Workflow</h2>
            <button
              onClick={() => setActiveTab('apply')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Apply Leave</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  {isManagerOrAdmin && <th className="py-3 px-4 text-right">Approval Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {leaveRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{req.employeeName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{req.empCode} · {req.department}</p>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {req.leaveType}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {req.startDate} to {req.endDate}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                      {req.daysCount} {req.halfDay ? '(Half)' : ''}
                    </td>

                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-400 truncate">
                      "{req.reason}"
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {isManagerOrAdmin && (
                      <td className="py-3 px-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => updateLeaveStatus(req.id, 'Approved', 'Approved by reporting authority')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-md cursor-pointer transition-colors"
                              title="Approve Leave"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(req.id, 'Rejected', 'Declined due to sprint deadlines')}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-md cursor-pointer transition-colors"
                              title="Reject Leave"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Decided by {req.approvedBy || 'Admin'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apply' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Submit Paid Time Off Application
          </h2>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Comp Off">Comp Off</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={daysCount}
                  onChange={e => setDaysCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="halfDayToggle"
                checked={halfDay}
                onChange={e => setHalfDay(e.target.checked)}
                className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
              />
              <label htmlFor="halfDayToggle" className="text-xs text-slate-700 dark:text-[#CBD5E1]">
                Apply as Half-Day session
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Reason / Remarks
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="State the purpose of your time off..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Submit Application
            </button>
          </form>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Annual Company Holiday Calendar 2026</h2>
            <span className="text-xs font-mono text-slate-400">Total: {holidays.length} Mandatory Days</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {holidays.map(h => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                  <p className="text-[11px] text-slate-500">{h.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{h.date}</span>
                  <span className="block text-[11px] text-slate-400">{h.day}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
