import React, { useState } from 'react';
import { CompanyPayrollSettings, Tenant } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  X,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface CompanyPayrollSettingsModalProps {
  tenant: Tenant;
  onClose: () => void;
  onSaveSettings: (settings: CompanyPayrollSettings) => void;
}

export const CompanyPayrollSettingsModal: React.FC<CompanyPayrollSettingsModalProps> = ({
  tenant,
  onClose,
  onSaveSettings,
}) => {
  const { addNotification } = useApp();

  const current = tenant.payrollSettings || {
    tenantId: tenant.id,
    salaryCycle: 'Monthly',
    payrollCutOffDay: 25,
    salaryProcessingDay: 28,
    salaryPaymentDay: 1,
    attendanceLockDay: 26,
    leaveLockDay: 25,
    payrollDivisor: 'Calendar Days',
    gracePeriodMinutes: 15,
    lateMarkRule: {
      enabled: true,
      maxLateAllowedPerMonth: 3,
      actionAfterThreshold: 'Half Day LOP' as const,
      lopDaysPerExcessLate: 0.5,
    },
    halfDayThresholdHours: 4.5,
    overtimeCalculationRule: {
      enabled: true,
      rateMultiplier: 1.5,
      minMinutesForOvertime: 60,
    },
    lopRule: {
      enabled: true,
      deductFromBasicOnly: false,
      deductFromGross: true,
    },
    weekendRule: {
      isPaid: true,
      requiresPresentAdjacent: false,
    },
    holidayRule: {
      isPaid: true,
    },
  };

  const [salaryCycle, setSalaryCycle] = useState(current.salaryCycle);
  const [cutoffDay, setCutoffDay] = useState(current.payrollCutOffDay);
  const [processingDay, setProcessingDay] = useState(current.salaryProcessingDay);
  const [paymentDay, setPaymentDay] = useState(current.salaryPaymentDay);
  const [attendanceLockDay, setAttendanceLockDay] = useState(current.attendanceLockDay);
  const [leaveLockDay, setLeaveLockDay] = useState(current.leaveLockDay);
  const [divisor, setDivisor] = useState(current.payrollDivisor);
  const [customDivisorDays, setCustomDivisorDays] = useState(current.customDivisorDays || 30);
  const [gracePeriod, setGracePeriod] = useState(current.gracePeriodMinutes);
  const [halfDayHours, setHalfDayHours] = useState(current.halfDayThresholdHours);

  // Late mark rule
  const [lateEnabled, setLateEnabled] = useState(current.lateMarkRule.enabled);
  const [maxLateAllowed, setMaxLateAllowed] = useState(current.lateMarkRule.maxLateAllowedPerMonth);
  const [latePenalty, setLatePenalty] = useState(current.lateMarkRule.lopDaysPerExcessLate);

  // Overtime rule
  const [otEnabled, setOtEnabled] = useState(current.overtimeCalculationRule.enabled);
  const [otMultiplier, setOtMultiplier] = useState(current.overtimeCalculationRule.rateMultiplier);

  // Weekend & Holiday
  const [paidWeekends, setPaidWeekends] = useState(current.weekendRule.isPaid);
  const [paidHolidays, setPaidHolidays] = useState(current.holidayRule.isPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CompanyPayrollSettings = {
      tenantId: tenant.id,
      salaryCycle,
      payrollCutOffDay: Number(cutoffDay),
      salaryProcessingDay: Number(processingDay),
      salaryPaymentDay: Number(paymentDay),
      attendanceLockDay: Number(attendanceLockDay),
      leaveLockDay: Number(leaveLockDay),
      payrollDivisor: divisor,
      customDivisorDays: divisor === 'Custom' ? Number(customDivisorDays) : undefined,
      gracePeriodMinutes: Number(gracePeriod),
      lateMarkRule: {
        enabled: lateEnabled,
        maxLateAllowedPerMonth: Number(maxLateAllowed),
        actionAfterThreshold: 'Half Day LOP',
        lopDaysPerExcessLate: Number(latePenalty),
      },
      halfDayThresholdHours: Number(halfDayHours),
      overtimeCalculationRule: {
        enabled: otEnabled,
        rateMultiplier: Number(otMultiplier),
        minMinutesForOvertime: 60,
      },
      lopRule: {
        enabled: true,
        deductFromBasicOnly: false,
        deductFromGross: true,
      },
      weekendRule: {
        isPaid: paidWeekends,
        requiresPresentAdjacent: false,
      },
      holidayRule: {
        isPaid: paidHolidays,
      },
    };

    onSaveSettings(updated);
    addNotification('Payroll Policy Saved', 'Company-specific payroll and attendance deduction rules updated.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Company Payroll Settings & Calculation Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure salary cycle, cutoff lock dates, divisors, late mark penalties, and overtime for {tenant.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* Section 1: Cycle & Lock Dates */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Salary Cycle & Cut-off Dates</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Salary Cycle Frequency
                </label>
                <select
                  value={salaryCycle}
                  onChange={e => setSalaryCycle(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Biweekly">Bi-weekly</option>
                  <option value="Semi-Monthly">Semi-Monthly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payroll Cut-off Day (1-31)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={cutoffDay}
                  onChange={e => setCutoffDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Salary Processing Day (1-31)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={processingDay}
                  onChange={e => setProcessingDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Disbursement Payment Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={paymentDay}
                  onChange={e => setPaymentDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Attendance Lock Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={attendanceLockDay}
                  onChange={e => setAttendanceLockDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leave Lock Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={leaveLockDay}
                  onChange={e => setLeaveLockDay(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payroll Divisor & Calculation */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Payroll Divisor & Daily Rate Formula</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Salary Divisor Basis *
                </label>
                <select
                  value={divisor}
                  onChange={e => setDivisor(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="Calendar Days">Calendar Days (28, 29, 30, 31 according to month)</option>
                  <option value="Working Days">Actual Working Days (Excluding Weekends/Holidays)</option>
                  <option value="Fixed 30 Days">Fixed 30 Days (Standard Enterprise Divisor)</option>
                  <option value="Custom">Custom Days Divisor</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Formula: (Monthly Gross ÷ Divisor) × Payable Days
                </span>
              </div>

              {divisor === 'Custom' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Custom Divisor (Days)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={31}
                    value={customDivisorDays}
                    onChange={e => setCustomDivisorDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Shift Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={gracePeriod}
                  onChange={e => setGracePeriod(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Half-Day Threshold (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={2}
                  max={6}
                  value={halfDayHours}
                  onChange={e => setHalfDayHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Late Mark & Overtime Policies */}
          <div>
            <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Late Mark Penalties & Overtime Multipliers</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={lateEnabled} onChange={e => setLateEnabled(e.target.checked)} className="rounded text-[#0F766E]" />
                  <span>Enforce Late Mark Deductions</span>
                </label>
                {lateEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Grace Late/Month:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={maxLateAllowed}
                        onChange={e => setMaxLateAllowed(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">LOP / Excess Late:</span>
                      <select
                        value={latePenalty}
                        onChange={e => setLatePenalty(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs mt-0.5"
                      >
                        <option value={0.5}>0.5 Day LOP</option>
                        <option value={1.0}>1.0 Day LOP</option>
                        <option value={0.25}>0.25 Day LOP</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={otEnabled} onChange={e => setOtEnabled(e.target.checked)} className="rounded text-[#0F766E]" />
                  <span>Calculate Overtime Hours</span>
                </label>
                {otEnabled && (
                  <div className="pt-1 text-[11px]">
                    <span className="text-slate-400 block">Hourly Overtime Rate Multiplier:</span>
                    <select
                      value={otMultiplier}
                      onChange={e => setOtMultiplier(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs mt-0.5"
                    >
                      <option value={1.25}>1.25x Normal Rate</option>
                      <option value={1.5}>1.50x Normal Rate (Standard)</option>
                      <option value={2.0}>2.00x Double Rate (Weekend/Holiday)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" checked={paidWeekends} onChange={e => setPaidWeekends(e.target.checked)} className="rounded text-[#0F766E]" />
                  <span>Paid Weekend Days (Included in Payable Days)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" checked={paidHolidays} onChange={e => setPaidHolidays(e.target.checked)} className="rounded text-[#0F766E]" />
                  <span>Paid Statutory Holidays</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer"
            >
              Save Payroll Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
