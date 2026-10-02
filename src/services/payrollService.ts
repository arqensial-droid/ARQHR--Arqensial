import { PayrollRun, Payslip, Employee } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const payrollService = {
  async getRuns(tenantId: string): Promise<ApiResponse<PayrollRun[]>> {
    return apiClient.query<PayrollRun>('payroll_runs', tenantId, {
      order: { column: 'created_at', ascending: false },
    });
  },

  async getPayslips(tenantId: string, employeeId?: string): Promise<ApiResponse<Payslip[]>> {
    const eq = employeeId ? { employeeId } : undefined;
    return apiClient.query<Payslip>('payslips', tenantId, {
      eq,
      order: { column: 'generated_date', ascending: false },
    });
  },

  calculatePayslip(emp: Employee, month: string, payrollRunId: string): Payslip {
    const s = emp.salaryStructure;
    return {
      id: `slip-${Date.now()}-${emp.id}`,
      tenantId: emp.tenantId,
      payrollRunId,
      employeeId: emp.id,
      employeeName: emp.fullName,
      empCode: emp.empCode,
      designation: emp.designation,
      department: emp.departmentName,
      joiningDate: emp.joiningDate,
      panNumber: emp.bankDetails?.panNumber || 'USA-SSN-XXXX',
      uanNumber: emp.bankDetails?.uanNumber || '1004XXXXXXXX',
      bankAccount: emp.bankDetails?.accountNumber || '••••••••0000',
      bankName: emp.bankDetails?.bankName || 'Direct Deposit Bank',
      month,
      daysWorked: 30,
      daysLop: 0,
      basic: s.basic,
      hra: s.hra,
      specialAllowance: s.specialAllowance,
      conveyance: s.conveyance,
      performanceBonus: s.performanceBonus,
      grossEarnings: s.monthlyGross,
      pfDeduction: s.pfEmployee,
      esiDeduction: s.esi,
      ptDeduction: s.professionalTax,
      tdsDeduction: s.tdsMonthly,
      totalDeductions: s.monthlyGross - s.netMonthly,
      netPayable: s.netMonthly,
      status: 'Generated',
      generatedDate: new Date().toISOString().substring(0, 10),
    };
  },

  async createRun(run: PayrollRun): Promise<ApiResponse<PayrollRun>> {
    return apiClient.insert<PayrollRun>('payroll_runs', run);
  },

  async savePayslips(slips: Payslip[]): Promise<ApiResponse<Payslip[]>> {
    const results: Payslip[] = [];
    for (const slip of slips) {
      const res = await apiClient.insert<Payslip>('payslips', slip);
      if (res.data) results.push(res.data);
    }
    return { data: results, error: null };
  },

  async disburse(runId: string): Promise<ApiResponse<PayrollRun>> {
    return apiClient.update<PayrollRun>('payroll_runs', runId, {
      status: 'Disbursed',
      disbursedAt: new Date().toISOString(),
    });
  },
};
