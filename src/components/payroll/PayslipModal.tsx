import React from 'react';
import { Payslip } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Building2 } from 'lucide-react';

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  const { currentTenant } = useApp();

  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Action Header */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Confidential Electronic Payslip
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 print:p-0 print:border-none">
          {/* Company Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">{currentTenant.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{currentTenant.address}</p>
              <p className="text-xs text-slate-500">Corporate Domain: {currentTenant.domain}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0F766E] dark:text-[#14B8A6] block">
                PAYSLIP FOR {payslip.month.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block mt-1">
                Ref: {payslip.id}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                Generated: {payslip.generatedDate}
              </span>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee Name</span>
              <span className="font-bold">{payslip.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Employee Code</span>
              <span className="font-mono font-bold">{payslip.empCode}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Designation</span>
              <span className="font-semibold">{payslip.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Department</span>
              <span className="font-semibold">{payslip.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Account</span>
              <span className="font-mono">{payslip.bankAccount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Name</span>
              <span>{payslip.bankName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tax ID / PAN</span>
              <span className="font-mono">{payslip.panNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Paid Days / LOP</span>
              <span className="font-mono font-bold">{payslip.daysWorked} Days / {payslip.daysLop} LOP</span>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Earnings
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                  <span className="font-mono font-medium">${payslip.basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-medium">${payslip.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Special Allowance</span>
                  <span className="font-mono font-medium">${payslip.specialAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Conveyance Allowance</span>
                  <span className="font-mono font-medium">${payslip.conveyance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Performance Incentive</span>
                  <span className="font-mono font-medium">${payslip.performanceBonus.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-emerald-600">${payslip.grossEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Deductions
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Provident Fund (Employee)</span>
                  <span className="font-mono font-medium">${payslip.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                  <span className="font-mono font-medium">${payslip.ptDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">TDS / Income Tax Withheld</span>
                  <span className="font-mono font-medium">${payslip.tdsDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">State Disability / Other</span>
                  <span className="font-mono font-medium">$0.00</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-rose-600">
                  <span>Total Deductions</span>
                  <span className="font-mono">-${payslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="p-5 rounded-xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 border border-[#0F766E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6] block">
                Net Salary Payable
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-[#F8FAFC] tabular-nums">
                ${payslip.netPayable.toLocaleString()}.00
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-[#CBD5E1] text-right font-medium">
              Payment Mode: Direct ACH Transfer · Status: {payslip.status}
            </div>
          </div>

          {/* Legal signoff */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>This is a computer-generated authorized document and does not require a physical signature.</span>
            <span className="font-mono text-[#0F766E] dark:text-[#14B8A6] font-semibold">ARQENSIAL Enterprise Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
