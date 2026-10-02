import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LogOut,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';

export const ExitManagement: React.FC = () => {
  const { resignations, updateClearance, submitResignation, currentUser, currentTenant, addNotification } = useApp();
  const [showResignModal, setShowResignModal] = useState(false);
  const [exitReason, setExitReason] = useState('');
  const [desiredDate, setDesiredDate] = useState('2026-11-01');

  const handleResignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exitReason) {
      submitResignation(exitReason, desiredDate);
      setShowResignModal(false);
      setExitReason('');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <LogOut className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Exit & Separation Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Notice period tracking, multi-department clearances, exit interviews & Full and Final (F&F) settlements
          </p>
        </div>

        <button
          onClick={() => setShowResignModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0"
        >
          Submit Resignation Notice
        </button>
      </div>

      {/* Resignations and Clearances list */}
      <div className="space-y-4">
        {resignations.map(res => (
          <div
            key={res.id}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{res.employeeName}</h3>
                  <span className="font-mono text-xs text-slate-400">({res.empCode})</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-semibold">
                    {res.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notice Submitted: {res.submissionDate} · Official Last Working Day: {res.officialLastWorkingDay}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] italic mt-1">"{res.reason}"</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Estimated F&F Payout</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  ${res.fnfAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Clearance Checkpoints */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Departmental Clearance Verification
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* IT */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-[#F8FAFC]">IT & Hardware</span>
                    <span className="text-[10px] text-slate-400">Laptop, VPN keys</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={res.clearances.it}
                    onChange={e => updateClearance(res.id, 'it', e.target.checked)}
                    className="rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                  />
                </div>

                {/* HR */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-[#F8FAFC]">HR & People Ops</span>
                    <span className="text-[10px] text-slate-400">Exit interview</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={res.clearances.hr}
                    onChange={e => updateClearance(res.id, 'hr', e.target.checked)}
                    className="rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                  />
                </div>

                {/* Finance */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-[#F8FAFC]">Finance & Payroll</span>
                    <span className="text-[10px] text-slate-400">Expense & dues</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={res.clearances.finance}
                    onChange={e => updateClearance(res.id, 'finance', e.target.checked)}
                    className="rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                  />
                </div>

                {/* Admin */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-[#F8FAFC]">Facilities & Admin</span>
                    <span className="text-[10px] text-slate-400">Access card return</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={res.clearances.admin}
                    onChange={e => updateClearance(res.id, 'admin', e.target.checked)}
                    className="rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Letter Downloads */}
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => addNotification('Document Generated', `Official Relieving Letter generated for ${res.employeeName}.`, 'success')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B] flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-[#CBD5E1]"
              >
                <Download className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Download Relieving Letter</span>
              </button>
              <button
                onClick={() => addNotification('Certificate Generated', `Experience Certificate generated for ${res.employeeName}.`, 'success')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B] flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-[#CBD5E1]"
              >
                <Download className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Experience Letter</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resignation Modal */}
      {showResignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit Resignation</h3>
            <form onSubmit={handleResignSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Desired Last Working Day
                </label>
                <input
                  type="date"
                  required
                  value={desiredDate}
                  onChange={e => setDesiredDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Transition
                </label>
                <textarea
                  required
                  rows={3}
                  value={exitReason}
                  onChange={e => setExitReason(e.target.value)}
                  placeholder="State the context for departure..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResignModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                >
                  Submit Official Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
