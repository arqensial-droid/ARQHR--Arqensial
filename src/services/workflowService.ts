import {
  WorkflowRule,
  SalaryRevisionRecord,
  PromotionRecord,
  ResignationRequest,
  UserRole,
} from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const workflowService = {
  // Compute Arrears for Retroactive Salary Revisions
  calculateArrears(
    currentMonthlyGross: number,
    newMonthlyGross: number,
    effectiveDate: string,
    implementationDate: string = new Date().toISOString()
  ): { monthsRetroactive: number; arrearsTotal: number } {
    const eff = new Date(effectiveDate);
    const imp = new Date(implementationDate);

    // Approximate months difference
    const yearDiff = imp.getFullYear() - eff.getFullYear();
    const monthDiff = imp.getMonth() - eff.getMonth();
    const totalMonths = Math.max(0, yearDiff * 12 + monthDiff);

    const monthlyDelta = Math.max(0, newMonthlyGross - currentMonthlyGross);
    const arrearsTotal = monthlyDelta * totalMonths;

    return {
      monthsRetroactive: totalMonths,
      arrearsTotal,
    };
  },

  // Get Default Workflow Rules
  getDefaultRules(tenantId: string): WorkflowRule[] {
    return [
      {
        id: `rule-sal-${tenantId}`,
        tenantId,
        workflowType: 'salary_revision',
        name: 'Salary Revision 3-Tier Approval',
        description: 'Requires Reporting Manager approval, HR Manager sign-off, and Finance/Payroll authorization.',
        approvalSteps: [
          { stepNumber: 1, stepName: 'Reporting Manager Review', approverRole: 'manager', slaHours: 48 },
          { stepNumber: 2, stepName: 'HR Compensation Verification', approverRole: 'hr_manager', slaHours: 24 },
          { stepNumber: 3, stepName: 'Finance & Payroll Sign-off', approverRole: 'payroll_manager', slaHours: 48 },
        ],
        isActive: true,
      },
      {
        id: `rule-promo-${tenantId}`,
        tenantId,
        workflowType: 'promotion_transfer',
        name: 'Executive Promotion Review',
        description: 'Multi-stakeholder review for grade elevation, designation updates, and comp adjustments.',
        approvalSteps: [
          { stepNumber: 1, stepName: 'Department Head Endorsement', approverRole: 'manager', slaHours: 72 },
          { stepNumber: 2, stepName: 'HR Talent Review', approverRole: 'hr_manager', slaHours: 48 },
          { stepNumber: 3, stepName: 'Executive Management Approval', approverRole: 'company_admin', slaHours: 72 },
        ],
        isActive: true,
      },
      {
        id: `rule-exit-${tenantId}`,
        tenantId,
        workflowType: 'exit_clearance',
        name: '4-Department Exit Clearance & FnF',
        description: 'Mandatory cross-department clearances before Full & Final settlement release.',
        approvalSteps: [
          { stepNumber: 1, stepName: 'IT Asset Handover & Account Deactivation', approverRole: 'company_admin', slaHours: 24 },
          { stepNumber: 2, stepName: 'Admin & Access Badge Surrender', approverRole: 'hr_manager', slaHours: 24 },
          { stepNumber: 3, stepName: 'Finance Loans & Advances Clearance', approverRole: 'payroll_manager', slaHours: 24 },
          { stepNumber: 4, stepName: 'HR Exit Interview & Gratuity Release', approverRole: 'hr_manager', slaHours: 48 },
        ],
        isActive: true,
      },
    ];
  },

  // Fetch Salary Revisions
  async getSalaryRevisions(tenantId: string): Promise<ApiResponse<SalaryRevisionRecord[]>> {
    return apiClient.query<SalaryRevisionRecord>('salary_revisions', tenantId, {
      order: { column: 'effectiveDate', ascending: false },
    });
  },

  // Create Salary Revision
  async createSalaryRevision(revision: SalaryRevisionRecord): Promise<ApiResponse<SalaryRevisionRecord>> {
    return apiClient.insert<SalaryRevisionRecord>('salary_revisions', revision);
  },

  // Approve / Update Salary Revision
  async approveSalaryRevision(
    revision: SalaryRevisionRecord,
    stepName: string,
    approverName: string,
    remarks: string,
    nextStatus: SalaryRevisionRecord['status']
  ): Promise<ApiResponse<SalaryRevisionRecord>> {
    const updatedApprovals = [
      ...revision.approvals,
      {
        step: stepName,
        approverName,
        action: 'Approved' as const,
        timestamp: new Date().toISOString(),
        remarks,
      },
    ];

    const updatedRecord: SalaryRevisionRecord = {
      ...revision,
      status: nextStatus,
      approvals: updatedApprovals,
    };

    return apiClient.upsert<SalaryRevisionRecord>('salary_revisions', updatedRecord);
  },

  // Fetch Promotions
  async getPromotions(tenantId: string): Promise<ApiResponse<PromotionRecord[]>> {
    return apiClient.query<PromotionRecord>('employee_promotions', tenantId);
  },

  // Create Promotion
  async createPromotion(promo: PromotionRecord): Promise<ApiResponse<PromotionRecord>> {
    return apiClient.insert<PromotionRecord>('employee_promotions', promo);
  },
};
