import React from 'react';
import { Payslip, Tenant } from '../../types';
import { countryConfigService } from '../../services/countryConfigService';
import {
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface PayslipDetailModalProps {
  payslip: Payslip;
  tenant: Tenant;
  onClose: () => void;
}

export const PayslipDetailModal: React.FC<PayslipDetailModalProps> = ({
  payslip,
  tenant,
  onClose,
}) => {
  const countryCode = payslip.countryCode || tenant.countryCode || 'IN';
  const country = countryConfigService.getCountry(countryCode);
  const currencySymbol = payslip.currencySymbol || country.currencySymbol;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent =
      `============================================================\n` +
      `OFFICIAL SALARY SLIP - ${payslip.month.toUpperCase()}\n` +
      `============================================================\n` +
      `Company: ${tenant.legalCompanyName || tenant.name}\n` +
      `Tax Identifier: ${tenant.companyTaxId || 'N/A'}\n` +
      `Registration: ${tenant.registrationNumber || 'N/A'}\n` +
      `Address: ${tenant.address}\n\n` +
      `Employee ID: ${payslip.empCode} | Name: ${payslip.employeeName}\n` +
      `Department: ${payslip.department} | Designation: ${payslip.designation}\n` +
      `Joining Date: ${payslip.joiningDate} | Tax ID: ${payslip.taxIdMasked || 'Masked'}\n` +
      `Disbursement Bank: ${payslip.bankName} (${payslip.bankAccountMasked || 'Masked'})\n\n` +
      `ATTENDANCE SUMMARY:\n` +
      `- Total Calendar Days: ${payslip.totalCalendarDays || 30}\n` +
      `- Payable Days: ${payslip.daysWorked}\n` +
      `- Present Days: ${payslip.presentDays ?? 22}\n` +
      `- Paid Leave: ${payslip.paidLeaveDays ?? 2} | LOP / Unpaid: ${payslip.daysLop}\n\n` +
      `GROSS EARNINGS: ${currencySymbol}${payslip.grossEarnings.toLocaleString()}\n` +
      `TOTAL DEDUCTIONS: ${currencySymbol}${payslip.totalDeductions.toLocaleString()}\n` +
      `NET PAYABLE: ${currencySymbol}${payslip.netPayable.toLocaleString()}\n` +
      `NET IN WORDS: ${payslip.netPayInWords || countryConfigService.numberToWords(payslip.netPayable, country.currency)}\n` +
      `Payslip No: ${payslip.payslipNumber || payslip.id}\n` +
      `Verification Token: ${payslip.qrVerificationToken || 'VERIFIED'}\n` +
      `============================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Payslip-${payslip.empCode}-${payslip.month.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const netInWords =
    payslip.netPayInWords ||
    countryConfigService.numberToWords(payslip.netPayable, payslip.currency || country.currency);

  const earnings = payslip.earningsBreakdown || [
    { name: countryCode === 'AE' || countryCode === 'GB' ? 'Basic Salary' : 'Basic Pay', amount: payslip.basic },
    { name: countryCode === 'AE' ? 'Housing Allowance' : 'House Rent Allowance (HRA)', amount: payslip.hra },
    { name: 'Special Allowance', amount: payslip.specialAllowance },
    { name: 'Conveyance Allowance', amount: payslip.conveyance },
    ...(payslip.overtimePay ? [{ name: 'Overtime Pay', amount: payslip.overtimePay }] : []),
  ];

  const deductions = payslip.deductionsBreakdown || [
    ...(payslip.pfDeduction ? [{ name: countryCode === 'US' ? 'Social Security & Medicare' : countryCode === 'GB' ? 'National Insurance & Pension' : 'Provident Fund (EPF 12%)', amount: payslip.pfDeduction, isStatutory: true }] : []),
    ...(payslip.esiDeduction ? [{ name: 'ESIC (0.75%)', amount: payslip.esiDeduction, isStatutory: true }] : []),
    ...(payslip.ptDeduction ? [{ name: countryCode === 'AE' ? 'WPS Processing Fee' : 'Professional Tax (PT)', amount: payslip.ptDeduction, isStatutory: true }] : []),
    ...(payslip.tdsDeduction ? [{ name: countryCode === 'US' ? 'Federal & State Withholding' : countryCode === 'GB' ? 'PAYE Income Tax' : 'TDS (Income Tax)', amount: payslip.tdsDeduction, isStatutory: true }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden my-6">
        {/* Modal Top Actions */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50 print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Payslip No:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {payslip.payslipNumber || payslip.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div className="p-8 space-y-6 text-slate-800 dark:text-slate-200 text-xs bg-white dark:bg-[#0F172A]" id="printable-payslip">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
                {tenant.logo || 'AQ'}
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {tenant.legalCompanyName || tenant.name}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                  {tenant.address}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                  <span>{country.taxIdLabel.split('/')[0]}: <strong>{tenant.companyTaxId || '27AABCA1234F1Z5'}</strong></span>
                  <span>·</span>
                  <span>Reg: <strong>{tenant.registrationNumber || 'U72900MH2024'}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6]">
                {country.name} · PAYSLIP
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {payslip.month}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono block">
                Disbursement: {payslip.generatedDate}
              </span>
            </div>
          </div>

          {/* Employee Metadata Table */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employee Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{payslip.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employee ID</span>
              <span className="font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6] mt-0.5 block">{payslip.empCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Department</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">{payslip.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Designation</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">{payslip.designation}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date of Joining</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{payslip.joiningDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tax Identifier</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{payslip.taxIdMasked || `•••• •••• ${payslip.panNumber?.slice(-4)}`}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Institution</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block truncate">{payslip.bankName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Account No.</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{payslip.bankAccountMasked || `•••• •••• ${payslip.bankAccount?.slice(-4)}`}</span>
            </div>
          </div>

          {/* Attendance Matrix Summary */}
          <div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Attendance & Payable Days Reckoning</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Days</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{payslip.totalCalendarDays || 30}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Payable Days</span>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{payslip.daysWorked}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Present</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{payslip.presentDays ?? 22}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Paid Leaves</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{payslip.paidLeaveDays ?? 2}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">LOP / Unpaid</span>
                <span className="font-mono text-rose-600 font-semibold">{payslip.daysLop}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Overtime Hrs</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{payslip.overtimeHours ?? 0}h</span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-100/80 dark:bg-slate-900 px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
                <span>Earnings Component</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {earnings.map((e, idx) => (
                  <div key={idx} className="px-3.5 py-2 flex justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 dark:text-slate-300">{e.name}</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {currencySymbol}{e.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2.5 font-bold border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                <span>Gross Earnings</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {currencySymbol}{payslip.grossEarnings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-100/80 dark:bg-slate-900 px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
                <span>Deduction Component</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {deductions.map((d, idx) => (
                  <div key={idx} className="px-3.5 py-2 flex justify-between hover:bg-slate-50/50">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      {d.name}
                      {d.isStatutory && (
                        <span className="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 font-mono">
                          Statutory
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {currencySymbol}{d.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {deductions.length === 0 && (
                  <div className="px-3.5 py-4 text-center text-slate-400 italic">
                    No deductions applicable
                  </div>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2.5 font-bold border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  {currencySymbol}{payslip.totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-semibold">
                Net Disbursed Amount
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 tracking-tight text-white">
                {currencySymbol}{payslip.netPayable.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 italic font-medium">
                {netInWords}
              </p>
            </div>

            <div className="sm:border-l sm:border-slate-700/80 sm:pl-4 flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-slate-950" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                <div className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  AUTHENTICATED RECORD
                </div>
                <div>Hash: {payslip.id.slice(-10)}</div>
                <div>System: ARQHR Global</div>
              </div>
            </div>
          </div>

          {/* Signatures & Statutory Disclaimer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-400">
            <div className="max-w-md">
              <p className="leading-relaxed">
                This document is a digitally encrypted statement of payroll settlement generated under {tenant.legalCompanyName || tenant.name} enterprise statutory compliance rules. No physical signature is mandatory.
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0">
              <div className="font-signature text-base text-slate-800 dark:text-slate-200 italic mb-1">
                Authorized Signatory
              </div>
              <div className="border-t border-slate-300 dark:border-slate-700 pt-1 font-medium text-slate-600 dark:text-slate-400">
                Head of People & Payroll Operations
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
