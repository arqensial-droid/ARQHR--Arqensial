import { CountryCode, CountryDefinition, TenantCountryConfig, CompanyPayrollSettings } from '../types';

export const SUPPORTED_COUNTRIES: CountryDefinition[] = [
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    defaultTimezone: 'Asia/Kolkata (IST)',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultTimeFormat: '12h',
    phoneCode: '+91',
    financialYear: 'April - March',
    taxIdLabel: 'PAN / TAN / GSTIN',
    taxIdPlaceholder: 'AAAAA0000A / 27AAAAA0000A1Z5',
    registrationNumberLabel: 'Corporate Identity Number (CIN)',
    statutoryIdentLabel: 'UAN / PF Number / ESIC IP',
    routingCodeLabel: 'IFSC Code',
    statutoryFields: [
      { id: 'pan', label: 'Permanent Account Number (PAN)', placeholder: 'ABCDE1234F', required: true, formatRegex: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' },
      { id: 'uan', label: 'Universal Account Number (UAN)', placeholder: '100987654321', required: true, formatRegex: '^[0-9]{12}$' },
      { id: 'pfNumber', label: 'EPF Member ID', placeholder: 'MH/BAN/0012345/000/0001', required: false },
      { id: 'esicIp', label: 'ESIC Insurance Number', placeholder: '31001234560001001', required: false },
      { id: 'aadhaar', label: 'Aadhaar (Optional/Masked)', placeholder: '•••• •••• 1234', required: false, masked: true },
      { id: 'ptState', label: 'Professional Tax State', placeholder: 'Maharashtra', required: true },
    ],
    payrollRules: {
      salaryCycleOptions: ['Monthly', 'Biweekly'],
      defaultSalaryCycle: 'Monthly',
      standardDivisor: 'Calendar Days',
      statutoryComponents: [
        { id: 'pf_employee', name: 'Provident Fund (Employee 12%)', type: 'deduction', isStatutory: true, formulaDescription: '12% of Basic (capped at ₹1,800/month or uncapped)' },
        { id: 'pf_employer', name: 'Provident Fund (Employer 12%)', type: 'deduction', isStatutory: true, formulaDescription: '3.67% EPF + 8.33% EPS' },
        { id: 'esic', name: 'ESIC (Employee 0.75%)', type: 'deduction', isStatutory: true, formulaDescription: '0.75% of Gross if Gross <= ₹21,000' },
        { id: 'pt', name: 'Professional Tax (PT)', type: 'deduction', isStatutory: true, formulaDescription: '₹200/month (₹300 in Feb for Maharashtra)' },
        { id: 'tds', name: 'Income Tax (TDS / Sec 192)', type: 'deduction', isStatutory: true, formulaDescription: 'Monthly deduction based on tax regime declaration' },
      ],
    },
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    defaultTimezone: 'America/New_York (EST)',
    defaultDateFormat: 'MM/DD/YYYY',
    defaultTimeFormat: '12h',
    phoneCode: '+1',
    financialYear: 'January - December',
    taxIdLabel: 'Federal Employer ID (EIN)',
    taxIdPlaceholder: 'XX-XXXXXXX',
    registrationNumberLabel: 'State Business Filing ID',
    statutoryIdentLabel: 'Social Security Number (SSN - Masked)',
    routingCodeLabel: 'ABA Routing Transit Number',
    statutoryFields: [
      { id: 'ssn', label: 'Social Security Number (SSN)', placeholder: '•••-••-1234', required: true, masked: true, formatRegex: '^\\d{3}-\\d{2}-\\d{4}$' },
      { id: 'w4Status', label: 'W-4 Filing Status', placeholder: 'Single / Married Filing Jointly', required: true },
      { id: 'stateTaxId', label: 'State Unemployment / Withholding ID', placeholder: 'State ID', required: true },
      { id: 'workAuthorization', label: 'Work Authorization (I-9 / Citizen / H1B)', placeholder: 'US Citizen / Permanent Resident / Visa', required: true },
    ],
    payrollRules: {
      salaryCycleOptions: ['Biweekly', 'Semi-Monthly', 'Monthly', 'Weekly'],
      defaultSalaryCycle: 'Biweekly',
      standardDivisor: 'Working Days',
      statutoryComponents: [
        { id: 'fed_tax', name: 'Federal Income Tax (FIT)', type: 'deduction', isStatutory: true, formulaDescription: 'Calculated using W-4 withholding brackets' },
        { id: 'social_security', name: 'Social Security (OASDI 6.2%)', type: 'deduction', isStatutory: true, formulaDescription: '6.2% up to annual wage base limit' },
        { id: 'medicare', name: 'Medicare (1.45%)', type: 'deduction', isStatutory: true, formulaDescription: '1.45% un-capped (+0.9% additional for high earners)' },
        { id: 'state_tax', name: 'State Income Tax (SIT)', type: 'deduction', isStatutory: true, formulaDescription: 'State-specific withholding rate' },
        { id: 'k401', name: '401(k) Retirement Elective', type: 'deduction', isStatutory: false, formulaDescription: 'Pre-tax employee contribution elective' },
      ],
    },
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    defaultTimezone: 'Europe/London (GMT/BST)',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultTimeFormat: '24h',
    phoneCode: '+44',
    financialYear: '6 April - 5 April',
    taxIdLabel: 'PAYE Reference / HMRC VAT',
    taxIdPlaceholder: '123/AB45678',
    registrationNumberLabel: 'Companies House Registration No.',
    statutoryIdentLabel: 'National Insurance (NI) Number',
    routingCodeLabel: 'Bank Sort Code',
    statutoryFields: [
      { id: 'niNumber', label: 'National Insurance (NI) Number', placeholder: 'QQ 12 34 56 A', required: true, formatRegex: '^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$' },
      { id: 'taxCode', label: 'HMRC Tax Code', placeholder: '1257L', required: true },
      { id: 'pensionEnrolment', label: 'Workplace Pension Status', placeholder: 'Auto-enrolled (5% employee / 3% employer)', required: true },
      { id: 'studentLoan', label: 'Student Loan Plan', placeholder: 'Plan 1 / Plan 2 / Plan 4 / None', required: false },
    ],
    payrollRules: {
      salaryCycleOptions: ['Monthly', 'Weekly', 'Biweekly'],
      defaultSalaryCycle: 'Monthly',
      standardDivisor: 'Working Days',
      statutoryComponents: [
        { id: 'paye_tax', name: 'PAYE Income Tax', type: 'deduction', isStatutory: true, formulaDescription: 'Basic 20%, Higher 40%, Additional 45% based on tax code' },
        { id: 'employee_ni', name: 'National Insurance Class 1 (8%)', type: 'deduction', isStatutory: true, formulaDescription: '8% between Primary Threshold and Upper Limit, 2% above' },
        { id: 'workplace_pension', name: 'Workplace Auto-Enrolment Pension (5%)', type: 'deduction', isStatutory: true, formulaDescription: '5% qualifying earnings employee contribution' },
      ],
    },
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    currencySymbol: 'AED ',
    flag: '🇦🇪',
    defaultTimezone: 'Asia/Dubai (GST)',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultTimeFormat: '12h',
    phoneCode: '+971',
    financialYear: 'January - December',
    taxIdLabel: 'Tax Registration No. (TRN)',
    taxIdPlaceholder: '100XXXXXXXXX003',
    registrationNumberLabel: 'Trade License Number (DED / Freezone)',
    statutoryIdentLabel: 'Emirates ID (EID) & Labour Card No.',
    routingCodeLabel: 'IBAN / Routing Code',
    statutoryFields: [
      { id: 'emiratesId', label: 'Emirates ID (EID)', placeholder: '784-1990-1234567-1', required: true, formatRegex: '^784-[0-9]{4}-[0-9]{7}-[0-9]{1}$' },
      { id: 'labourCardNumber', label: 'MOHRE Labour Card / Personal No.', placeholder: '12345678', required: true },
      { id: 'wpsRoutingCode', label: 'WPS Bank/Exchange Agent Code', placeholder: 'ENBD001 / ALANS01', required: true },
      { id: 'visaStatus', label: 'Residency Visa File No.', placeholder: '201/2024/1234567', required: true },
    ],
    payrollRules: {
      salaryCycleOptions: ['Monthly'],
      defaultSalaryCycle: 'Monthly',
      standardDivisor: 'Fixed 30 Days',
      statutoryComponents: [
        { id: 'wps_charge', name: 'WPS SIF Compliance Processing', type: 'deduction', isStatutory: true, formulaDescription: 'WPS compliant Wage Protection SIF upload' },
        { id: 'gratuity_accrual', name: 'End of Service Gratuity (Provision)', type: 'earning', isStatutory: true, formulaDescription: '21 days basic pay per year for first 5 years' },
      ],
    },
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$',
    flag: '🇸🇬',
    defaultTimezone: 'Asia/Singapore (SGT)',
    defaultDateFormat: 'DD/MM/YYYY',
    defaultTimeFormat: '24h',
    phoneCode: '+65',
    financialYear: 'January - December',
    taxIdLabel: 'Unique Entity Number (UEN)',
    taxIdPlaceholder: '202412345A',
    registrationNumberLabel: 'ACRA Registration No.',
    statutoryIdentLabel: 'NRIC / FIN Number',
    routingCodeLabel: 'SWIFT / Bank Code',
    statutoryFields: [
      { id: 'nricFin', label: 'NRIC / FIN Number', placeholder: 'S••••567A', required: true, masked: true, formatRegex: '^[STFG]\\d{7}[A-Z]$' },
      { id: 'cpfCategory', label: 'CPF Contribution Tier', placeholder: 'Singapore Citizen / PR Year 1/2/3', required: true },
      { id: 'ethnicSelfHelp', label: 'Self-Help Group Fund (CDAC/SINDA/MBMF)', placeholder: 'Auto-assessed based on race', required: false },
    ],
    payrollRules: {
      salaryCycleOptions: ['Monthly', 'Semi-Monthly'],
      defaultSalaryCycle: 'Monthly',
      standardDivisor: 'Working Days',
      statutoryComponents: [
        { id: 'cpf_employee', name: 'CPF Employee (20%)', type: 'deduction', isStatutory: true, formulaDescription: '20% of ordinary wage (capped at $6,800 salary ceiling)' },
        { id: 'cpf_employer', name: 'CPF Employer (17%)', type: 'deduction', isStatutory: true, formulaDescription: '17% of ordinary wage employer contribution' },
        { id: 'shg_fund', name: 'Self-Help Group Contribution', type: 'deduction', isStatutory: true, formulaDescription: 'Tiered monthly donation to CDAC, MBMF, SINDA or ECF' },
      ],
    },
  },
];

export class CountryConfigService {
  getCountry(code: CountryCode | string): CountryDefinition {
    const found = SUPPORTED_COUNTRIES.find(c => c.code === code);
    return found || SUPPORTED_COUNTRIES[0];
  }

  getAllCountries(): CountryDefinition[] {
    return SUPPORTED_COUNTRIES;
  }

  getDefaultPayrollSettings(countryCode: CountryCode): CompanyPayrollSettings {
    const country = this.getCountry(countryCode);
    return {
      tenantId: '',
      salaryCycle: country.payrollRules.defaultSalaryCycle,
      payrollCutOffDay: 25,
      salaryProcessingDay: 28,
      salaryPaymentDay: 1,
      attendanceLockDay: 26,
      leaveLockDay: 25,
      payrollDivisor: country.payrollRules.standardDivisor,
      gracePeriodMinutes: 15,
      lateMarkRule: {
        enabled: true,
        maxLateAllowedPerMonth: 3,
        actionAfterThreshold: 'Half Day LOP',
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
  }

  getDefaultTenantCountryConfig(tenantId: string, countryCode: CountryCode): TenantCountryConfig {
    const c = this.getCountry(countryCode);
    return {
      tenantId,
      countryCode,
      legalCompanyName: '',
      companyTaxId: '',
      registrationNumber: '',
      stateProvince: '',
      city: '',
      financialYear: c.financialYear,
      salaryCycle: c.payrollRules.defaultSalaryCycle,
      salaryPaymentDate: 1,
      weeklyWorkingDays: countryCode === 'AE' ? 5 : 5,
      weekendDays: countryCode === 'AE' ? ['Saturday', 'Sunday'] : ['Saturday', 'Sunday'],
      officialLanguage: 'English',
      dateFormat: c.defaultDateFormat,
      timeFormat: c.defaultTimeFormat,
      payrollEnabled: true,
      attendanceEnabled: true,
      leaveEnabled: true,
      statutoryComplianceEnabled: true,
    };
  }

  formatCurrency(amount: number, countryCode: CountryCode = 'IN'): string {
    const country = this.getCountry(countryCode);
    const symbol = country.currencySymbol;
    if (countryCode === 'IN') {
      return `${symbol}${amount.toLocaleString('en-IN')}`;
    }
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  maskTaxId(val: string): string {
    if (!val || val.length < 4) return '••••';
    const lastFour = val.slice(-4);
    return `••••••••${lastFour}`;
  }

  maskAccountNumber(val: string): string {
    if (!val || val.length < 4) return '•••• •••• ••••';
    const lastFour = val.slice(-4);
    return `•••• •••• ${lastFour}`;
  }

  numberToWords(num: number, currency: string = 'INR'): string {
    const rounded = Math.round(num);
    if (rounded === 0) return 'Zero';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : ' ');
    };

    let result = '';

    if (currency === 'INR') {
      const crore = Math.floor(rounded / 10000000);
      const lakh = Math.floor((rounded % 10000000) / 100000);
      const thousand = Math.floor((rounded % 100000) / 1000);
      const hundred = Math.floor((rounded % 1000) / 100);
      const remainder = rounded % 100;

      if (crore) result += inWords(crore) + 'Crore ';
      if (lakh) result += inWords(lakh) + 'Lakh ';
      if (thousand) result += inWords(thousand) + 'Thousand ';
      if (hundred) result += inWords(hundred) + 'Hundred ';
      if (remainder) result += (result ? 'and ' : '') + inWords(remainder);
      return `Rupees ${result.trim()} Only`;
    }

    // Standard Western Numbering (USD, GBP, AED, SGD)
    const million = Math.floor(rounded / 1000000);
    const thousand = Math.floor((rounded % 1000000) / 1000);
    const hundred = Math.floor((rounded % 1000) / 100);
    const remainder = rounded % 100;

    if (million) result += inWords(million) + 'Million ';
    if (thousand) result += inWords(thousand) + 'Thousand ';
    if (hundred) result += inWords(hundred) + 'Hundred ';
    if (remainder) result += (result ? 'and ' : '') + inWords(remainder);

    const currencyNames: Record<string, string> = {
      USD: 'US Dollars',
      GBP: 'Pounds Sterling',
      AED: 'Emirati Dirhams',
      SGD: 'Singapore Dollars',
    };

    const cName = currencyNames[currency] || currency;
    return `${result.trim()} ${cName} Only`;
  }
}

export const countryConfigService = new CountryConfigService();
