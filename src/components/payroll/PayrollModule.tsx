import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payslip, PayrollRun } from '../../types';
import { PayslipModal } from './PayslipModal';
import {
  Banknote,
  DollarSign,
  PlayCircle,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const PayrollModule: React.FC = () => {
  const {
    payrollRuns,
    payslips,
    runPayroll,
    disbursePayroll,
    employees,
    currentTenant,
    currentRole,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'runs' | 'slips' | 'components' | 'form16'>('runs');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const totalMonthlyPayroll = employees.reduce((acc, e) => acc + e.salaryStructure.monthlyGross, 0);
  const totalNetDisbursement = employees.reduce((acc, e) => acc + e.salaryStructure.netMonthly, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Payroll & Compensation Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Automated batch payroll processing, salary structures, tax deductions & payslips for {currentTenant.name}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F172A] p-1 rounded-lg border border-transparent dark:border-[#1E293B]">
          {[
            { id: 'runs', label: 'Payroll Batches' },
            { id: 'slips', label: `Generated Payslips (${payslips.length})` },
            { id: 'components', label: 'Salary Components' },
            { id: 'form16', label: 'Tax & Form 16' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                  : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Monthly Gross Payroll</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
            ${totalMonthlyPayroll.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block font-mono">Calculated for {employees.length} active personnel</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Electronic Take-Home</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#22C55E] tabular-nums">
            ${totalNetDisbursement.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#22C55E] mt-1 block font-mono">Direct ACH transfer batch</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Statutory Tax & PF Withholdings</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#EF4444] tabular-nums">
            ${(totalMonthlyPayroll - totalNetDisbursement).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block font-mono">US Federal, State & 401(k)/PF</span>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'runs' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Monthly Payroll Processing Runs</h2>
            <button
              onClick={() => runPayroll('October 2026')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs shadow-[#0F766E]/20 cursor-pointer transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Run October 2026 Payroll</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
            {payrollRuns.map(run => (
              <div key={run.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{run.month}</h3>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        run.status === 'Disbursed'
                          ? 'bg-emerald-50 text-[#22C55E] dark:bg-emerald-950/60 dark:text-emerald-400'
                          : run.status === 'Processed'
                          ? 'bg-blue-50 text-[#06B6D4] dark:bg-cyan-950/60 dark:text-cyan-400'
                          : 'bg-amber-50 text-[#F59E0B] dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
                    Coverage: {run.periodStart} to {run.periodEnd} · {run.totalEmployees} Enrolled Employees
                  </p>
                  {run.processedBy && (
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Processed by: {run.processedBy}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Net Payable</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                      ${run.totalNet.toLocaleString()}
                    </span>
                  </div>

                  {run.status === 'Processed' || run.status === 'Draft' ? (
                    <button
                      onClick={() => disbursePayroll(run.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Disburse Salaries</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#22C55E] font-semibold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Disbursed & Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'slips' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Generated Employee Payslips</h2>
            <span className="text-xs text-slate-400 font-mono">Total {payslips.length} Payslips</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#020617] border-b border-slate-200/80 dark:border-[#1E293B] text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B] text-xs">
                {payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{slip.employeeName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{slip.empCode} · {slip.designation}</p>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-[#CBD5E1]">
                      {slip.month}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-[#F8FAFC]">
                      ${slip.grossEarnings.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#EF4444]">
                      -${slip.totalDeductions.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#22C55E]">
                      ${slip.netPayable.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold text-[#22C55E] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        {slip.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(slip)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:bg-teal-50 dark:hover:bg-[#1E293B] rounded cursor-pointer inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
            Salary Structure Formula Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">
            Standard enterprise compensation breakdown applied dynamically during offer generation and CTC revisions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-3">
              <h3 className="font-bold text-xs uppercase text-[#22C55E]">Earnings Components</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">Basic Salary</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">50% of CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">20% of CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">Special Allowance</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">20% of CTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">Performance Incentive Pool</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">10% Variable</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-3">
              <h3 className="font-bold text-xs uppercase text-[#EF4444]">Statutory Deductions</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">Provident Fund (Employee 401k/PF)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">12% of Basic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">Professional Tax (PT)</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">$200 flat / month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-[#CBD5E1]">TDS / Income Tax Withholding</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">Projected Slab Brackets</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'form16' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Tax Projection & Form 16 Certificate</h2>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">Annual withholding summary certificate for FY 2026-2027</p>
            </div>
            <button
              onClick={() => addNotification('Form 16 Generated', 'Annual tax certificate exported successfully.', 'success')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Form 16 (Part A & B)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
              <span className="text-slate-400 block text-[11px]">Gross Taxable Income</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">$185,000</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
              <span className="text-slate-400 block text-[11px]">Standard Deduction</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">-$14,600</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
              <span className="text-slate-400 block text-[11px]">80C / Retirement Deductions</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">-$23,000</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1E293B]/50">
              <span className="text-slate-400 block text-[11px]">Net Tax Liability Paid</span>
              <span className="font-mono font-bold text-sm text-[#22C55E]">$29,400</span>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Viewer Modal */}
      <PayslipModal
        payslip={selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
      />
    </div>
  );
};
