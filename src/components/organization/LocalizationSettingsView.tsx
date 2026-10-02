import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_COUNTRIES, countryConfigService } from '../../services/countryConfigService';
import { CountryCode } from '../../types';
import {
  Globe,
  CheckCircle2,
  Calendar,
  Clock,
  Banknote,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { CompanyPayrollSettingsModal } from './CompanyPayrollSettingsModal';

export const LocalizationSettingsView: React.FC = () => {
  const { currentTenant, updateTenantSettings, addNotification } = useApp();
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(
    currentTenant.countryCode || 'IN'
  );
  const [showPayrollSettings, setShowPayrollSettings] = useState(false);

  const selectedCountry = countryConfigService.getCountry(selectedCountryCode);
  const isCurrentActive = currentTenant.countryCode === selectedCountryCode;

  const handleApplyCountry = (code: CountryCode) => {
    setSelectedCountryCode(code);
    const country = countryConfigService.getCountry(code);
    const newConfig = countryConfigService.getDefaultTenantCountryConfig(currentTenant.id, code);
    const newPayroll = countryConfigService.getDefaultPayrollSettings(code);

    updateTenantSettings({
      ...currentTenant.settings,
    });

    currentTenant.countryCode = code;
    currentTenant.currency = country.currency;
    currentTenant.currencySymbol = country.currencySymbol;
    currentTenant.timezone = country.defaultTimezone;
    currentTenant.countryConfig = newConfig;
    currentTenant.payrollSettings = newPayroll;

    addNotification(
      'Localization Updated',
      `Corporate workspace configured for ${country.name} (${country.currency}) with updated statutory rules.`,
      'success'
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Country Localization & Statutory Regulations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global regulatory engines, tax authority identifiers, currency formatting, and payroll defaults for {currentTenant.name}.
          </p>
        </div>

        <button
          onClick={() => setShowPayrollSettings(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Edit Payroll Rules</span>
        </button>
      </div>

      {/* Country Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SUPPORTED_COUNTRIES.map(country => {
          const isActive = selectedCountryCode === country.code;
          const isTenantPrimary = currentTenant.countryCode === country.code;

          return (
            <div
              key={country.code}
              onClick={() => setSelectedCountryCode(country.code)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative bg-white dark:bg-[#0F172A] ${
                isActive
                  ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {isTenantPrimary && (
                <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                  ACTIVE
                </span>
              )}

              <span className="text-2xl block">{country.flag}</span>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-2">
                {country.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {country.currency} ({country.currencySymbol})
              </p>
            </div>
          );
        })}
      </div>

      {/* Detailed Jurisdiction Configuration Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedCountry.name} Jurisdiction Standards
              </h2>
              <span className="text-xs text-slate-500">
                Official Currency: <strong>{selectedCountry.currency} ({selectedCountry.currencySymbol})</strong> · Financial Cycle: <strong>{selectedCountry.financialYear}</strong>
              </span>
            </div>
          </div>

          {!isCurrentActive ? (
            <button
              onClick={() => handleApplyCountry(selectedCountryCode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply {selectedCountry.name} as Primary</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Primary Tenant Jurisdiction
            </span>
          )}
        </div>

        {/* 3 Pillars: Tax & Identifiers, Statutory Deductions, Calendar & Formats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-xs">
          {/* Pillar 1: Tax & Regulatory Identifiers */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              Regulatory & Tax Fields
            </span>
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Corporate Tax ID Type</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.taxIdLabel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Registration Authority</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.registrationNumberLabel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Employee Statutory ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.statutoryIdentLabel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Banking Transit Identifier</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.routingCodeLabel}</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Statutory Payroll Rules */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <Banknote className="w-4 h-4 text-[#0F766E]" />
              Mandatory Statutory Deductions
            </span>
            <div className="space-y-2">
              {selectedCountry.payrollRules.statutoryComponents.map(comp => (
                <div key={comp.id} className="p-2 rounded bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{comp.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{comp.formulaDescription}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pillar 3: Calendar & Localization */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-3">
              <Calendar className="w-4 h-4 text-[#0F766E]" />
              Calendar & Time Standards
            </span>
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Default Timezone</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.defaultTimezone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Standard Date Format</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.defaultDateFormat}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Default Salary Divisor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCountry.payrollRules.standardDivisor}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">International Dialing Code</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCountry.phoneCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayrollSettings && (
        <CompanyPayrollSettingsModal
          tenant={currentTenant}
          onClose={() => setShowPayrollSettings(false)}
          onSaveSettings={settings => {
            currentTenant.payrollSettings = settings;
          }}
        />
      )}
    </div>
  );
};
