import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseClaim } from '../../types';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';

export const ExpenseManagement: React.FC = () => {
  const { expenses, submitExpense, approveExpense, currentRole, currentTenant } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseClaim['category']>('Travel');
  const [amount, setAmount] = useState<number>(75);
  const [receiptName, setReceiptName] = useState('Uber_Receipt_Sept.pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    submitExpense({
      title,
      category,
      amount,
      receiptName,
    });

    setShowAddModal(false);
    setTitle('');
  };

  const isManagerOrAdmin = currentRole === 'company_admin' || currentRole === 'hr_manager' || currentRole === 'manager' || currentRole === 'super_admin';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Expense Claims & Travel Reimbursements</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Corporate receipts, per diem & reimbursement approval workflows for {currentTenant.name}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Claim Expense</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#020617]/60 border-b border-slate-200/80 dark:border-[#1E293B] text-[11px] font-bold text-slate-500 dark:text-[#CBD5E1] uppercase tracking-wider">
                <th className="py-3 px-4">Claimant</th>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                {isManagerOrAdmin && <th className="py-3 px-4 text-right">Approval</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 text-xs">
              {expenses.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {claim.employeeName}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {claim.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-[#CBD5E1]">
                      {claim.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {claim.expenseDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-mono">
                      <FileText className="w-3 h-3" /> {claim.receiptName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900 dark:text-white">
                    ${claim.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        claim.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : claim.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>

                  {isManagerOrAdmin && (
                    <td className="py-3 px-4 text-right">
                      {claim.status === 'Submitted' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveExpense(claim.id, 'Approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded cursor-pointer"
                            title="Approve Reimbursement"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => approveExpense(claim.id, 'Rejected')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded cursor-pointer"
                            title="Reject Claim"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Approved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Claim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-5 shadow-2xl border border-slate-200 dark:border-[#1E293B] space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Submit New Expense Claim</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Travel taxi from airport to conference venue"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseClaim['category'])}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Meal">Meal & Entertainment</option>
                    <option value="Equipment">Hardware & Equipment</option>
                    <option value="Software">Software & Subscriptions</option>
                    <option value="Training">Training & Conferences</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] font-mono focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Receipt Attachment</label>
                <input
                  type="text"
                  value={receiptName}
                  onChange={e => setReceiptName(e.target.value)}
                  placeholder="Receipt_Filename.pdf"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] font-mono focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer transition-colors"
                >
                  Submit Reimbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
