import {
  StatutoryConfig,
  TaxRegimeDeclaration,
  StatutoryChallanECR,
  SalaryStructure,
} from '../types';
import { apiClient, ApiResponse } from './apiClient';

export interface IndianPayrollBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  grossSalary: number;
  epfEmployee: number;
  epfEmployerEPS: number;
  epfEmployerPF: number;
  epfEdli: number;
  epfAdmin: number;
  esicEmployee: number;
  esicEmployer: number;
  professionalTax: number;
  lwfEmployee: number;
  lwfEmployer: number;
  monthlyTdsNewRegime: number;
  monthlyTdsOldRegime: number;
  gratuityAccrualMonthly: number;
  bonusProvisionMonthly: number;
  netTakeHomeNewRegime: number;
  netTakeHomeOldRegime: number;
}

export const complianceService = {
  // Default India Statutory Configuration for Enterprise
  getDefaultConfig(tenantId: string): StatutoryConfig {
    return {
      tenantId,
      epfEnabled: true,
      epfWageLimit: 15000,
      epfEmployeeRate: 12,
      epfEmployerRate: 12,
      epfEdliRate: 0.5,
      epfAdminRate: 0.5,
      esicEnabled: true,
      esicWageLimit: 21000,
      esicEmployeeRate: 0.75,
      esicEmployerRate: 3.25,
      statePtCode: 'MH',
      lwfEnabled: true,
      gratuityEnabled: true,
      bonusActRate: 8.33,
    };
  },

  // Calculate Complete Indian Statutory Deductions
  calculateStatutoryBreakdown(
    monthlyGross: number,
    state: 'MH' | 'KA' | 'TN' | 'TG' | 'DL' | 'WB' = 'MH',
    taxRegime: 'Old' | 'New' = 'New',
    declaration?: Partial<TaxRegimeDeclaration>
  ): IndianPayrollBreakdown {
    // 1. Component distribution
    const basic = Math.round(monthlyGross * 0.5); // 50% basic rule under New Wage Code
    const hra = Math.round(basic * 0.4); // 40% of basic
    const specialAllowance = Math.max(0, monthlyGross - (basic + hra));

    // 2. EPF Calculation
    // Wage ceiling ₹15,000 for statutory PF unless opted higher
    const epfWages = Math.min(basic, 15000);
    const epfEmployee = Math.round(epfWages * 0.12);
    // Employer 12% split: 8.33% to EPS (capped at 15k = ₹1250), balance 3.67% to EPF
    const epfEmployerEPS = Math.min(1250, Math.round(epfWages * 0.0833));
    const epfEmployerPF = Math.round(epfWages * 0.12) - epfEmployerEPS;
    const epfEdli = Math.round(epfWages * 0.005);
    const epfAdmin = Math.round(epfWages * 0.005);

    // 3. ESIC Calculation
    // Applicable if gross monthly salary <= ₹21,000
    let esicEmployee = 0;
    let esicEmployer = 0;
    if (monthlyGross <= 21000) {
      esicEmployee = Math.round(monthlyGross * 0.0075);
      esicEmployer = Math.round(monthlyGross * 0.0325);
    }

    // 4. Professional Tax (State specific slabs)
    let professionalTax = 0;
    if (state === 'MH') {
      // Maharashtra: Gross > 10,000 is ₹200/mo (₹300 in Feb)
      if (monthlyGross > 10000) professionalTax = 200;
    } else if (state === 'KA') {
      // Karnataka: Gross >= 15,000 is ₹200/mo
      if (monthlyGross >= 15000) professionalTax = 200;
    } else if (state === 'TG') {
      // Telangana
      if (monthlyGross > 20000) professionalTax = 200;
      else if (monthlyGross > 15000) professionalTax = 150;
    } else if (state === 'TN') {
      if (monthlyGross > 12500) professionalTax = 208;
    } else if (state === 'WB') {
      if (monthlyGross > 40000) professionalTax = 200;
      else if (monthlyGross > 25000) professionalTax = 150;
    }

    // 5. Labour Welfare Fund (LWF)
    const lwfEmployee = 25; // Typical half-yearly / monthly provision
    const lwfEmployer = 50;

    // 6. Income Tax TDS Calculation (FY 2024-25 / 2025-26 slabs)
    const annualGross = monthlyGross * 12;

    // New Regime Computation
    // Standard deduction = ₹75,000
    const newRegimeTaxable = Math.max(0, annualGross - 75000);
    let newRegimeTaxAnnual = 0;
    if (newRegimeTaxable > 1500000) {
      newRegimeTaxAnnual = 150000 + (newRegimeTaxable - 1500000) * 0.3;
    } else if (newRegimeTaxable > 1200000) {
      newRegimeTaxAnnual = 90000 + (newRegimeTaxable - 1200000) * 0.2;
    } else if (newRegimeTaxable > 1000000) {
      newRegimeTaxAnnual = 60000 + (newRegimeTaxable - 1000000) * 0.15;
    } else if (newRegimeTaxable > 700000) {
      newRegimeTaxAnnual = 15000 + (newRegimeTaxable - 700000) * 0.1;
    } else if (newRegimeTaxable > 300000) {
      newRegimeTaxAnnual = (newRegimeTaxable - 300000) * 0.05;
    }
    // Section 87A rebate: If total income <= ₹7,00,000 (effectively ₹7.75L with std deduction), zero tax
    if (annualGross <= 775000) {
      newRegimeTaxAnnual = 0;
    } else {
      // 4% Health & Education cess
      newRegimeTaxAnnual = newRegimeTaxAnnual * 1.04;
    }
    const monthlyTdsNewRegime = Math.round(newRegimeTaxAnnual / 12);

    // Old Regime Computation
    // Standard deduction = ₹50,000 + 80C + 80D + HRA
    const sec80C = Math.min(150000, declaration?.section80C || 0);
    const sec80D = Math.min(50000, declaration?.section80D || 0);
    const hraExemption = Math.min(hra * 12, declaration?.hraExemptionRentPaid || 0);
    const oldRegimeDeductions = 50000 + sec80C + sec80D + hraExemption;
    const oldRegimeTaxable = Math.max(0, annualGross - oldRegimeDeductions);
    let oldRegimeTaxAnnual = 0;
    if (oldRegimeTaxable > 1000000) {
      oldRegimeTaxAnnual = 112500 + (oldRegimeTaxable - 1000000) * 0.3;
    } else if (oldRegimeTaxable > 500000) {
      oldRegimeTaxAnnual = 12500 + (oldRegimeTaxable - 500000) * 0.2;
    } else if (oldRegimeTaxable > 250000) {
      oldRegimeTaxAnnual = (oldRegimeTaxable - 250000) * 0.05;
    }
    if (annualGross <= 500000) {
      oldRegimeTaxAnnual = 0;
    } else {
      oldRegimeTaxAnnual = oldRegimeTaxAnnual * 1.04;
    }
    const monthlyTdsOldRegime = Math.round(oldRegimeTaxAnnual / 12);

    // 7. Gratuity Accrual (Monthly provision under Payment of Gratuity Act 1972)
    // Formula: 15 days basic per year = (15 / 26) * Basic / 12 months = 4.81% of Basic
    const gratuityAccrualMonthly = Math.round((15 / 26) * (basic / 12));

    // 8. Payment of Bonus Act provision (Min 8.33% of Basic/Wage ceiling ₹7,000)
    const bonusBase = Math.min(basic, 7000);
    const bonusProvisionMonthly = Math.round(bonusBase * 0.0833);

    // 9. Net Take Home
    const employeeDeductionsNew = epfEmployee + esicEmployee + professionalTax + lwfEmployee + monthlyTdsNewRegime;
    const employeeDeductionsOld = epfEmployee + esicEmployee + professionalTax + lwfEmployee + monthlyTdsOldRegime;

    return {
      basic,
      hra,
      specialAllowance,
      grossSalary: monthlyGross,
      epfEmployee,
      epfEmployerEPS,
      epfEmployerPF,
      epfEdli,
      epfAdmin,
      esicEmployee,
      esicEmployer,
      professionalTax,
      lwfEmployee,
      lwfEmployer,
      monthlyTdsNewRegime,
      monthlyTdsOldRegime,
      gratuityAccrualMonthly,
      bonusProvisionMonthly,
      netTakeHomeNewRegime: Math.round(monthlyGross - employeeDeductionsNew),
      netTakeHomeOldRegime: Math.round(monthlyGross - employeeDeductionsOld),
    };
  },

  // Calculate Gratuity Settlement at Exit
  calculateGratuitySettlement(lastDrawnBasic: number, tenureInYears: number): {
    eligible: boolean;
    amount: number;
    statutoryCap: number;
    explanation: string;
  } {
    const statutoryCap = 2000000; // ₹20 Lakhs statutory limit
    if (tenureInYears < 5) {
      return {
        eligible: false,
        amount: 0,
        statutoryCap,
        explanation: 'Employee has not completed the statutory continuous service threshold of 5 years under Section 4 of Payment of Gratuity Act, 1972.',
      };
    }

    // Formula: (15 * Last Drawn Basic * Tenure) / 26
    const computed = Math.round((15 * lastDrawnBasic * tenureInYears) / 26);
    const amount = Math.min(computed, statutoryCap);

    return {
      eligible: true,
      amount,
      statutoryCap,
      explanation: `Eligible for ₹${amount.toLocaleString()} calculated as (15 * ₹${lastDrawnBasic.toLocaleString()} * ${tenureInYears} yrs) / 26 (capped at statutory ₹20,00,000 limit).`,
    };
  },

  // Generate EPF ECR Text format for EPFO Unified Portal upload
  generateEpfEcrFileText(
    records: Array<{
      uan: string;
      memberId: string;
      name: string;
      grossWages: number;
      epfWages: number;
      epsWages: number;
      edliWages: number;
      epfDiff: number;
      epsDiff: number;
      ncpDays: number;
    }>
  ): string {
    // Standard EPFO #~# delimited ECR version 2.0 structure
    const lines = records.map(r => {
      const eeShare = Math.round(r.epfWages * 0.12);
      const epsShare = Math.min(1250, Math.round(r.epsWages * 0.0833));
      const erShare = eeShare - epsShare;
      return `${r.uan}#~#${r.name}#~#${r.grossWages}#~#${r.epfWages}#~#${r.epsWages}#~#${r.edliWages}#~#${eeShare}#~#${epsShare}#~#${erShare}#~#${r.ncpDays}#~#0`;
    });
    return lines.join('\n');
  },

  // Save Tax Declaration
  async saveTaxDeclaration(declaration: TaxRegimeDeclaration): Promise<ApiResponse<TaxRegimeDeclaration>> {
    return apiClient.upsert<TaxRegimeDeclaration>('tax_declarations', declaration);
  },

  // Fetch Challans
  async getChallans(tenantId: string): Promise<ApiResponse<StatutoryChallanECR[]>> {
    return apiClient.query<StatutoryChallanECR>('statutory_challans', tenantId, {
      order: { column: 'generatedAt', ascending: false },
    });
  },

  // Create Challan
  async createChallan(challan: StatutoryChallanECR): Promise<ApiResponse<StatutoryChallanECR>> {
    return apiClient.insert<StatutoryChallanECR>('statutory_challans', challan);
  },
};
