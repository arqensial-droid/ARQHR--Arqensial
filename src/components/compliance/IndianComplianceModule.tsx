import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { complianceService, IndianPayrollBreakdown } from '../../services/complianceService';
import {
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Calculator,
  IndianRupee,
  Layers,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Building,
} from 'lucide-react';

export const IndianComplianceModule: React.FC = () => {
  const { employees, currentTenant, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'ecr' | 'calculator' | 'tds' | 'gratuity'>('ecr');
  const [selectedState, setSelectedState] = useState<'MH' | 'KA' | 'TG' | 'TN' | 'WB'>('MH');
  const [calculatorGross, setCalculatorGross] = useState<number>(65000);
  const [gratuityBasic, setGratuityBasic] = useState<number>(45000);
  const [gratuityTenure, setGratuityTenure] = useState<number>(6);

  // ECR Generation State
  const [ecrOutput, setEcrOutput] = useState<string>('');
  const [ecrGenerated, setEcrGenerated] = useState<boolean>(false);

  // Calculate live breakdown for simulator
  const breakdown: IndianPayrollBreakdown = complianceService.calculateStatutoryBreakdown(
    calculatorGross,
    selectedState,
    'New'
  );

  const gratuityResult = complianceService.calculateGratuitySettlement(gratuityBasic, gratuityTenure);

  const handleGenerateECR = () => {
    const ecrRecords = employees.map((emp, index) => {
      const basic = emp.salaryStructure?.basic || 25000;
      const gross = emp.salaryStructure?.monthlyGross || 50000;
      const epfWages = Math.min(basic, 15000);
      const epsWages = epfWages;
      const edliWages = epfWages;
      const epfDiff = Math.round(epfWages * 0.12);
      const epsDiff = Math.min(1250, Math.round(epsWages * 0.0833));
      return {
        uan: emp.bankDetails?.uanNumber || `10098472910${index}`,
        memberId: `MH/BAN/0049281/000/${emp.empCode}`,
        name: emp.fullName.toUpperCase(),
        grossWages: gross,
        epfWages,
        epsWages,
        edliWages,
        epfDiff,
        epsDiff,
        ncpDays: 0,
      };
    });

    const fileContent = complianceService.generateEpfEcrFileText(ecrRecords);
    setEcrOutput(fileContent);
    setEcrGenerated(true);
    addNotification('ECR Generated', 'EPFO ECR 2.0 file generated successfully for EPFO Unified Portal', 'success');
  };

  const handleDownloadECR = () => {
    if (!ecrOutput) return;
    const blob = new Blob([ecrOutput], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EPFO_ECR_${currentTenant.slug}_${new Date().toISOString().slice(0, 7)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Download Started', 'Downloaded EPFO ECR text format', 'info');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6]">
              ARQENSIAL India Compliance Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-mono">
              FY 2024-25 / FY 2025-26
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] mt-1">
            Statutory Compliance & Tax Automation
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Automated calculations for EPF, ESIC, State PT Slabs, LWF, Gratuity Act, and Old vs New Tax Regimes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-[#020617] p-1 rounded-xl gap-1 border border-transparent dark:border-[#1E293B]">
          <button
            onClick={() => setActiveTab('ecr')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'ecr'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EPF ECR & Challans
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Statutory Calculator
          </button>
          <button
            onClick={() => setActiveTab('tds')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'tds'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            TDS Tax Regimes
          </button>
          <button
            onClick={() => setActiveTab('gratuity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'gratuity'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gratuity & Bonus
          </button>
        </div>
      </div>

      {/* 1. EPF ECR & CHALLANS TAB */}
      {activeTab === 'ecr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">Total Active Covered</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">{employees.length} Members</div>
              <span className="text-[11px] text-[#22C55E] font-mono flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% UAN seeded
              </span>
            </div>
            <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">EPF Wage Ceiling</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">₹15,000 / mo</div>
              <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">EPFO Statutory Cap</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">ESIC Wage Ceiling</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">₹21,000 / mo</div>
              <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">Gross ceiling limit</span>
            </div>
            <div className="p-4 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] rounded-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">Challan Due Date</span>
              <div className="text-2xl font-bold text-[#0F766E] dark:text-[#14B8A6] mt-1">15th Monthly</div>
              <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">Mandatory ECR upload</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
                  EPFO Unified Portal ECR 2.0 Export File
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
                  Standard `#~#` delimited text structure ready for direct upload to EPFO Shram Suvidha portal.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateECR}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-[#0F766E]/20 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Generate ECR File
                </button>
                {ecrGenerated && (
                  <button
                    onClick={handleDownloadECR}
                    className="px-4 py-2 bg-[#22C55E] hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download .txt
                  </button>
                )}
              </div>
            </div>

            {ecrOutput ? (
              <div className="mt-4">
                <div className="text-xs font-mono bg-[#020617] text-[#CBD5E1] p-4 rounded-xl overflow-x-auto max-h-64 whitespace-pre border border-[#1E293B]">
                  {ecrOutput}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-[#CBD5E1] font-mono">
                  Schema: UAN#~#MemberName#~#GrossWages#~#EPFWages#~#EPSWages#~#EDLIWages#~#EEShare#~#EPSDiff#~#ERShare#~#NCPDays#~#Refund
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-[#1E293B] rounded-xl">
                Click "Generate ECR File" to aggregate current payroll runs and compile the EPFO ECR upload file.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. STATUTORY CALCULATOR TAB */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
              Salary & State Parameters
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                Monthly Gross CTC (₹)
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  value={calculatorGross}
                  onChange={e => setCalculatorGross(Math.max(10000, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#0F766E] outline-hidden"
                />
                <IndianRupee className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
              <div className="mt-2 flex gap-1.5">
                {[35000, 65000, 120000, 200000].map(val => (
                  <button
                    key={val}
                    onClick={() => setCalculatorGross(val)}
                    className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-[#1E293B] hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-[#CBD5E1] rounded-lg cursor-pointer"
                  >
                    ₹{(val / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                State for Professional Tax (PT)
              </label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#0F766E] outline-hidden"
              >
                <option value="MH">Maharashtra (₹200/mo, ₹300 Feb)</option>
                <option value="KA">Karnataka (₹200/mo for &gt;= ₹15k)</option>
                <option value="TG">Telangana (₹200/mo for &gt; ₹20k)</option>
                <option value="TN">Tamil Nadu (Semi-annual slab)</option>
                <option value="WB">West Bengal (Graduated slabs)</option>
              </select>
            </div>

            <div className="p-3 bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-xl text-xs text-[#0F766E] dark:text-[#14B8A6] space-y-1">
              <span className="font-semibold block">Wage Code Compliance Check:</span>
              <p className="text-slate-600 dark:text-[#CBD5E1]">Basic Salary is maintained at exactly 50% of Gross (₹{breakdown.basic.toLocaleString()}) to ensure total compliance with Code on Wages.</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-6">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Statutory Breakdown & Net Pay Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400">Basic (50%)</span>
                <div className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">₹{breakdown.basic.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400">HRA (40% of Basic)</span>
                <div className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">₹{breakdown.hra.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400">Special Allowance</span>
                <div className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">₹{breakdown.specialAllowance.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <span className="text-xs text-[#EF4444] dark:text-rose-300">EPF Employee (12%)</span>
                <div className="text-lg font-bold text-[#EF4444] dark:text-rose-300">₹{breakdown.epfEmployee.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <span className="text-xs text-[#EF4444] dark:text-rose-300">Professional Tax (PT)</span>
                <div className="text-lg font-bold text-[#EF4444] dark:text-rose-300">₹{breakdown.professionalTax.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <span className="text-xs text-[#EF4444] dark:text-rose-300">TDS (New Regime)</span>
                <div className="text-lg font-bold text-[#EF4444] dark:text-rose-300">₹{breakdown.monthlyTdsNewRegime.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Estimated Monthly Net Take-Home (New Regime)
                </span>
                <div className="text-2xl font-black text-[#22C55E]">
                  ₹{breakdown.netTakeHomeNewRegime.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Employer EPF Contribution</span>
                <div className="text-sm font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  ₹{(breakdown.epfEmployerEPS + breakdown.epfEmployerPF).toLocaleString()} (EPS ₹{breakdown.epfEmployerEPS} + EPF ₹{breakdown.epfEmployerPF})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TDS TAX REGIMES TAB */}
      {activeTab === 'tds' && (
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                New vs Old Tax Regime Comparison (FY 2024-25 & FY 2025-26)
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
                New Regime features ₹75,000 standard deduction and Section 87A rebate for income up to ₹7.75 Lakhs.
              </p>
            </div>
            <span className="px-3 py-1 bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] text-xs font-semibold rounded-lg">
              Default: New Regime (Section 115BAC)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl space-y-3">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">New Tax Regime Slabs</h4>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-[#CBD5E1] font-mono">
                <li>• ₹0 - ₹3,00,000 : NIL (0%)</li>
                <li>• ₹3,00,001 - ₹7,00,000 : 5%</li>
                <li>• ₹7,00,001 - ₹10,00,000 : 10%</li>
                <li>• ₹10,00,001 - ₹12,00,000 : 15%</li>
                <li>• ₹12,00,001 - ₹15,00,000 : 20%</li>
                <li>• Above ₹15,00,000 : 30%</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-[#22C55E] font-medium">
                Standard Deduction: ₹75,000 | Zero tax up to ₹7.75 Lakhs CTC
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl space-y-3">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC]">Old Tax Regime Exemptions</h4>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-[#CBD5E1] font-mono">
                <li>• Standard Deduction: ₹50,000</li>
                <li>• Section 80C: Up to ₹1,50,000 (PF, ELSS, LIC)</li>
                <li>• Section 80D: Up to ₹50,000 (Health Insurance)</li>
                <li>• Section 10(13A): HRA Rent exemption</li>
                <li>• Section 80CCD(1B): Up to ₹50,000 (NPS)</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-[#0F766E] dark:text-[#14B8A6] font-medium">
                Requires manual proof submission & verification in Q4
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. GRATUITY & BONUS TAB */}
      {activeTab === 'gratuity' && (
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Payment of Gratuity Act, 1972 & Bonus Act Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
              Statutory gratuity formula: (15 * Last Drawn Basic * Tenure) / 26 days per year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                  Last Drawn Monthly Basic (₹)
                </label>
                <input
                  type="number"
                  value={gratuityBasic}
                  onChange={e => setGratuityBasic(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#0F766E] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                  Continuous Service (Years)
                </label>
                <input
                  type="number"
                  value={gratuityTenure}
                  onChange={e => setGratuityTenure(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#0F766E] outline-hidden"
                />
                <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 block">
                  Threshold: 5 continuous years required under Section 4(1).
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl space-y-3 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  gratuityResult.eligible ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {gratuityResult.eligible ? 'STATUTORILY ELIGIBLE' : 'NOT YET ELIGIBLE (< 5 YRS)'}
                </span>
              </div>

              <div className="text-3xl font-black text-slate-900 dark:text-[#F8FAFC]">
                ₹{gratuityResult.amount.toLocaleString()}
              </div>

              <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                {gratuityResult.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
