import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Holiday,
  CompanyPayrollSettings,
  AttendancePayrollSummary,
  Payslip,
  CountryCode,
} from '../types';
import { countryConfigService } from './countryConfigService';

export interface CalculationInput {
  tenantId: string;
  countryCode: CountryCode;
  month: string; // e.g. 'September 2026'
  periodStart: string; // e.g. '2026-09-01'
  periodEnd: string; // e.g. '2026-09-30'
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  holidays: Holiday[];
  settings: CompanyPayrollSettings;
}

export interface PayrollRunResult {
  payrollRunId: string;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  summaries: Record<string, AttendancePayrollSummary>;
  payslips: Payslip[];
}

export class PayrollCalculationEngine {
  /**
   * Calculate attendance summary for an employee over the payroll period
   */
  calculateAttendanceSummary(
    employee: Employee,
    periodStart: string,
    periodEnd: string,
    attendance: AttendanceRecord[],
    leaveRequests: LeaveRequest[],
    holidays: Holiday[],
    settings: CompanyPayrollSettings
  ): AttendancePayrollSummary {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    const totalMonthDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Filter attendance in period for this employee
    const empPunches = attendance.filter(
      a => a.employeeId === employee.id && a.date >= periodStart && a.date <= periodEnd
    );

    // Filter approved leaves in period
    const empLeaves = leaveRequests.filter(
      l =>
        l.employeeId === employee.id &&
        l.status === 'Approved' &&
        l.startDate <= periodEnd &&
        l.endDate >= periodStart
    );

    let presentDays = 0;
    let halfDays = 0;
    let lateMarksCount = 0;
    let absentDays = 0;
    let wfhDays = 0;
    let overtimeHours = 0;

    empPunches.forEach(p => {
      if (p.isWFH) wfhDays++;
      if (p.durationHours > 9) {
        overtimeHours += Math.round((p.durationHours - 9) * 10) / 10;
      }

      if (p.status === 'Present') {
        presentDays++;
      } else if (p.status === 'Half Day') {
        halfDays++;
      } else if (p.status === 'Late') {
        lateMarksCount++;
        // If late mark exceeds grace, still counted as present day unless penalised
        presentDays++;
      } else if (p.status === 'Absent') {
        absentDays++;
      }
    });

    // Leaves calculation
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    empLeaves.forEach(l => {
      const isUnpaid = l.leaveType === 'Custom' || l.reason.toLowerCase().includes('unpaid') || l.reason.toLowerCase().includes('lop');
      if (isUnpaid) {
        unpaidLeaveDays += l.daysCount;
      } else {
        paidLeaveDays += l.daysCount;
      }
    });

    // Holidays in period
    const holidaysCount = holidays.filter(h => h.date >= periodStart && h.date <= periodEnd).length;

    // Week-offs (standard Saturdays & Sundays in month, approx 8 days)
    let weekOffsCount = 0;
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const day = cur.getDay();
      if (day === 0 || day === 6) {
        weekOffsCount++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Late penalty rule
    let latePenaltyLopDays = 0;
    if (settings.lateMarkRule.enabled && lateMarksCount > settings.lateMarkRule.maxLateAllowedPerMonth) {
      const excess = lateMarksCount - settings.lateMarkRule.maxLateAllowedPerMonth;
      latePenaltyLopDays = excess * settings.lateMarkRule.lopDaysPerExcessLate;
    }

    // Half days penalty (half day gives 0.5 payable, 0.5 unpaid)
    const halfDayUnpaid = halfDays * 0.5;

    // Total LOP
    const totalLopDays = unpaidLeaveDays + absentDays + latePenaltyLopDays + halfDayUnpaid;

    // Proration check for joining / exiting mid-month
    let isProrated = false;
    let prorateReason = '';
    let joiningCutDays = 0;

    if (employee.joiningDate > periodStart) {
      isProrated = true;
      const joinD = new Date(employee.joiningDate);
      joiningCutDays = Math.max(0, Math.round((joinD.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      prorateReason = `Joined mid-month on ${employee.joiningDate} (${joiningCutDays} days pre-joining)`;
    }

    if (employee.exitDate && employee.exitDate < periodEnd) {
      isProrated = true;
      prorateReason += ` Exited on ${employee.exitDate}`;
    }

    // Payable Days formula
    // If attendance records exist, payable days = totalMonthDays - totalLopDays - joiningCutDays
    const rawPayable = Math.max(0, totalMonthDays - totalLopDays - joiningCutDays);
    const payableDays = Math.min(totalMonthDays, Math.round(rawPayable * 10) / 10);

    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      empCode: employee.empCode,
      totalMonthDays,
      payableDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      absentDays,
      halfDays,
      lateMarksCount,
      latePenaltyLopDays,
      holidaysCount,
      weekOffsCount,
      wfhDays,
      overtimeHours,
      totalLopDays: Math.round(totalLopDays * 10) / 10,
      isProrated,
      prorateReason: prorateReason || undefined,
    };
  }

  /**
   * Process complete payroll run for all employees
   */
  processPayrollRun(input: CalculationInput): PayrollRunResult {
    const { tenantId, countryCode, month, periodStart, periodEnd, employees, attendance, leaveRequests, holidays, settings } = input;
    const runId = `payrun-${month.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const country = countryConfigService.getCountry(countryCode);

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    const summaries: Record<string, AttendancePayrollSummary> = {};
    const payslips: Payslip[] = [];

    employees.forEach((emp, idx) => {
      const summary = this.calculateAttendanceSummary(
        emp,
        periodStart,
        periodEnd,
        attendance,
        leaveRequests,
        holidays,
        settings
      );
      summaries[emp.id] = summary;

      // Determine Divisor
      let divisor = summary.totalMonthDays; // Calendar days by default
      if (settings.payrollDivisor === 'Fixed 30 Days') {
        divisor = 30;
      } else if (settings.payrollDivisor === 'Working Days') {
        divisor = Math.max(20, summary.totalMonthDays - summary.weekOffsCount);
      } else if (settings.payrollDivisor === 'Custom' && settings.customDivisorDays) {
        divisor = settings.customDivisorDays;
      }

      // Pro-rata ratio based on actual attendance payable days
      const ratio = Math.min(1.0, Math.max(0, summary.payableDays / divisor));

      const s = emp.salaryStructure;
      const baseMonthlyGross = s.monthlyGross;

      // Prorated earnings
      const basic = Math.round(s.basic * ratio);
      const hra = Math.round(s.hra * ratio);
      const conveyance = Math.round(s.conveyance * ratio);
      const specialAllowance = Math.round(s.specialAllowance * ratio);

      // Overtime Pay
      const hourlyRate = (s.monthlyGross / divisor) / 8;
      const overtimePay = Math.round(summary.overtimeHours * hourlyRate * (settings.overtimeCalculationRule.rateMultiplier || 1.5));

      const grossEarnings = basic + hra + conveyance + specialAllowance + overtimePay;

      // Country-specific Statutory Deductions
      let pfDeduction = 0;
      let esiDeduction = 0;
      let ptDeduction = 0;
      let tdsDeduction = 0;
      const deductionsBreakdown: Array<{ name: string; amount: number; isStatutory?: boolean }> = [];
      const earningsBreakdown: Array<{ name: string; amount: number; isTaxable?: boolean }> = [
        { name: countryCode === 'AE' || countryCode === 'GB' ? 'Basic Salary' : 'Basic Pay', amount: basic, isTaxable: true },
        { name: countryCode === 'AE' ? 'Housing Allowance' : countryCode === 'US' ? 'Housing / Base Allowance' : 'House Rent Allowance (HRA)', amount: hra, isTaxable: true },
        { name: 'Special Allowance', amount: specialAllowance, isTaxable: true },
        { name: 'Conveyance / Transport Allowance', amount: conveyance, isTaxable: false },
      ];

      if (overtimePay > 0) {
        earningsBreakdown.push({ name: `Overtime Pay (${summary.overtimeHours} hrs @ ${settings.overtimeCalculationRule.rateMultiplier}x)`, amount: overtimePay, isTaxable: true });
      }

      if (countryCode === 'IN') {
        // India statutory rules
        pfDeduction = Math.round(Math.min(basic, 15000) * 0.12);
        esiDeduction = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;
        ptDeduction = 200; // standard Maharashtra slab
        tdsDeduction = Math.round(s.tdsMonthly * ratio);

        deductionsBreakdown.push({ name: 'Employee Provident Fund (EPF 12%)', amount: pfDeduction, isStatutory: true });
        if (esiDeduction > 0) {
          deductionsBreakdown.push({ name: 'ESIC (Employee 0.75%)', amount: esiDeduction, isStatutory: true });
        }
        deductionsBreakdown.push({ name: 'Professional Tax (PT)', amount: ptDeduction, isStatutory: true });
        if (tdsDeduction > 0) {
          deductionsBreakdown.push({ name: 'TDS (Income Tax Sec 192)', amount: tdsDeduction, isStatutory: true });
        }
      } else if (countryCode === 'US') {
        // US statutory rules: Federal Income Tax, Social Security, Medicare, State Tax
        const socialSecurity = Math.round(grossEarnings * 0.062);
        const medicare = Math.round(grossEarnings * 0.0145);
        const fedTax = Math.round(grossEarnings * 0.12);
        const stateTax = Math.round(grossEarnings * 0.04);

        deductionsBreakdown.push({ name: 'Federal Income Tax (FIT Withholding)', amount: fedTax, isStatutory: true });
        deductionsBreakdown.push({ name: 'Social Security (OASDI 6.2%)', amount: socialSecurity, isStatutory: true });
        deductionsBreakdown.push({ name: 'Medicare (1.45%)', amount: medicare, isStatutory: true });
        deductionsBreakdown.push({ name: 'State Income Tax (SIT)', amount: stateTax, isStatutory: true });

        tdsDeduction = fedTax + stateTax;
        pfDeduction = socialSecurity + medicare;
      } else if (countryCode === 'GB') {
        // UK statutory rules: PAYE, Employee NI (8%), Workplace Pension (5%)
        const paye = Math.round(grossEarnings * 0.20);
        const ni = Math.round(grossEarnings * 0.08);
        const pension = Math.round(grossEarnings * 0.05);

        deductionsBreakdown.push({ name: 'PAYE Income Tax', amount: paye, isStatutory: true });
        deductionsBreakdown.push({ name: 'National Insurance Class 1 (8%)', amount: ni, isStatutory: true });
        deductionsBreakdown.push({ name: 'Workplace Auto-Enrolment Pension (5%)', amount: pension, isStatutory: true });

        tdsDeduction = paye;
        pfDeduction = ni + pension;
      } else if (countryCode === 'AE') {
        // UAE: No personal income tax! WPS compliance processing
        const wpsProcessing = 15;
        deductionsBreakdown.push({ name: 'WPS SIF Payroll Routing Fee', amount: wpsProcessing, isStatutory: true });
        ptDeduction = wpsProcessing;
      } else if (countryCode === 'SG') {
        // Singapore: CPF Employee (20%), Self-Help Group ($2)
        const cpfEmployee = Math.round(Math.min(grossEarnings, 6800) * 0.20);
        const shgFund = 2;

        deductionsBreakdown.push({ name: 'Central Provident Fund (CPF 20%)', amount: cpfEmployee, isStatutory: true });
        deductionsBreakdown.push({ name: 'Self-Help Group Fund (SHG)', amount: shgFund, isStatutory: true });

        pfDeduction = cpfEmployee;
        ptDeduction = shgFund;
      }

      const totalEmpDeductions = deductionsBreakdown.reduce((sum, d) => sum + d.amount, 0);
      const netPayable = Math.max(0, grossEarnings - totalEmpDeductions);

      totalGross += grossEarnings;
      totalNet += netPayable;
      totalDeductions += totalEmpDeductions;

      const payslipNum = `PS-${countryCode}-${month.replace(/\s+/g, '').toUpperCase()}-${emp.empCode}`;

      payslips.push({
        id: `ps-${emp.id}-${runId}`,
        tenantId,
        payrollRunId: runId,
        payslipNumber: payslipNum,
        countryCode,
        currency: country.currency,
        currencySymbol: country.currencySymbol,
        employeeId: emp.id,
        employeeName: emp.fullName,
        empCode: emp.empCode,
        designation: emp.designation,
        department: emp.departmentName,
        joiningDate: emp.joiningDate,
        panNumber: emp.bankDetails.panNumber,
        uanNumber: emp.bankDetails.uanNumber,
        taxIdMasked: countryConfigService.maskTaxId(emp.bankDetails.panNumber),
        bankAccount: emp.bankDetails.accountNumber,
        bankAccountMasked: countryConfigService.maskAccountNumber(emp.bankDetails.accountNumber),
        bankName: emp.bankDetails.bankName,
        month,
        totalCalendarDays: summary.totalMonthDays,
        daysWorked: summary.payableDays,
        presentDays: summary.presentDays,
        paidLeaveDays: summary.paidLeaveDays,
        unpaidLeaveDays: summary.unpaidLeaveDays,
        daysLop: summary.totalLopDays,
        holidaysCount: summary.holidaysCount,
        weekOffsCount: summary.weekOffsCount,
        overtimeHours: summary.overtimeHours,
        overtimePay,
        basic,
        hra,
        specialAllowance,
        conveyance,
        performanceBonus: 0,
        grossEarnings,
        earningsBreakdown,
        deductionsBreakdown,
        pfDeduction,
        esiDeduction,
        ptDeduction,
        tdsDeduction,
        totalDeductions: totalEmpDeductions,
        netPayable,
        netPayInWords: countryConfigService.numberToWords(netPayable, country.currency),
        qrVerificationToken: `VERIFY-${tenantId}-${emp.empCode}-${payslipNum}`,
        status: 'Generated',
        generatedDate: new Date().toISOString().substring(0, 10),
      });
    });

    return {
      payrollRunId: runId,
      totalEmployees: employees.length,
      totalGross,
      totalNet,
      totalDeductions,
      summaries,
      payslips,
    };
  }
}

export const payrollCalculationEngine = new PayrollCalculationEngine();
