import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import {
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileText,
  LayoutDashboard,
  Receipt,
  Download,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';

interface CompanyLogoManagerProps {
  onOpenInvoicePreview?: () => void;
  onOpenReportPreview?: () => void;
}

export const CompanyLogoManager: React.FC<CompanyLogoManagerProps> = ({
  onOpenInvoicePreview,
  onOpenReportPreview,
}) => {
  const {
    currentTenant,
    tenants,
    currentRole,
    updateCompanyLogo,
    deleteCompanyLogo,
    addNotification,
  } = useApp();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(currentTenant.id);
  const targetTenant = tenants.find((t) => t.id === selectedTenantId) || currentTenant;

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePreviewContext, setActivePreviewContext] = useState<
    'sidebar' | 'dashboard' | 'reports' | 'invoices' | 'pdf'
  >('sidebar');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageLogo = currentRole === 'super_admin' || currentRole === 'company_admin';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const val = storageService.validateFile(file, 'company_logo');
    if (!val.valid) {
      setErrorMsg(val.error || 'Invalid logo file.');
      return;
    }

    setIsUploading(true);
    const res = await updateCompanyLogo(targetTenant.id, file);
    setIsUploading(false);

    if (res.success) {
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setErrorMsg(res.error || 'Failed to upload logo.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove the logo for ${targetTenant.name}? It will revert to the default ARQENSIAL placeholder logo.`)) {
      return;
    }
    await deleteCompanyLogo(targetTenant.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Company Selector (if Super Admin) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6]">
              <Building2 className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Enterprise Company Logo Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload, replace, and preview high-resolution vector and raster brand logos. Logos dynamically render across the application navigation sidebar, executive dashboards, formal compliance reports, official client invoices, and exported PDFs.
          </p>
        </div>

        {currentRole === 'super_admin' && tenants.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium">Select Company:</span>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Logo Card + Interactive Showcase Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Logo Asset Card */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-400">
                ACTIVE BRAND ASSET
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] font-semibold">
                {targetTenant.logo ? 'CUSTOM LOGO LOADED' : 'DEFAULT ARQENSIAL LOGO'}
              </span>
            </div>

            {/* Visual Box */}
            <div className="relative w-full h-48 rounded-xl bg-slate-100/80 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center p-6 overflow-hidden group">
              {targetTenant.logo ? (
                <img
                  src={targetTenant.logo}
                  alt={`${targetTenant.name} logo`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center select-none">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center text-xl font-black shadow-md">
                    AQ
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      ARQENSIAL Placeholder Logo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      No custom logo uploaded yet
                    </span>
                  </div>
                </div>
              )}

              {targetTenant.logo && (
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-[#0F172A]/90 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              )}
            </div>

            {/* Specifications Details */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-[#1E293B]/40 rounded-xl border border-slate-200/60 dark:border-[#1E293B] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Storage Folder:</span>
                <span className="font-mono text-[11px] text-[#0F766E] dark:text-[#14B8A6]">
                  /companies/{targetTenant.id}/logos
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max File Size:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  10 MB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accepted Formats:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  PNG, JPG, SVG, WebP
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recommended Ratio:</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  Square or 3:1 Horizontal
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1E293B] flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {canManageLogo ? (
              <>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading Logo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{targetTenant.logo ? 'Replace Company Logo' : 'Upload Company Logo'}</span>
                    </>
                  )}
                </button>

                {targetTenant.logo && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                    title="Delete Logo & Restore ARQENSIAL Default"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Only Company Admin & Super Admin have permissions to update the official brand logo.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Surface Display Showcase */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Live Brand Display Surfaces
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant interactive simulation of your logo across key ERP system touchpoints
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#020617] p-1 rounded-xl border border-slate-200 dark:border-[#1E293B]">
              {(
                [
                  { id: 'sidebar', label: 'Sidebar', icon: Building2 },
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'invoices', label: 'Invoices', icon: Receipt },
                  { id: 'pdf', label: 'Exported PDF', icon: Download },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isSelected = activePreviewContext === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewContext(tab.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 min-h-[280px] p-5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] flex flex-col justify-center">
            {/* 1. SIDEBAR PREVIEW */}
            {activePreviewContext === 'sidebar' && (
              <div className="max-w-xs mx-auto w-full bg-[#0F172A] p-4 rounded-xl border border-[#1E293B] text-white shadow-lg space-y-3">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Sidebar Top Brand Bar
                </div>
                <div className="flex items-center gap-2.5 pt-1">
                  {targetTenant.logo ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-white/10 flex items-center justify-center p-1">
                      <img
                        src={targetTenant.logo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-sm">
                      AQ
                    </div>
                  )}
                  <div>
                    <span className="font-extrabold text-sm text-[#F8FAFC] tracking-wide block truncate">
                      {targetTenant.name}
                    </span>
                    <span className="text-[10px] text-[#14B8A6] font-mono block -mt-0.5">
                      Enterprise Cloud
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DASHBOARD PREVIEW */}
            {activePreviewContext === 'dashboard' && (
              <div className="w-full bg-[#0F172A] p-5 rounded-xl border border-[#1E293B] text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {targetTenant.logo ? (
                      <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center shadow-xs">
                        <img
                          src={targetTenant.logo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white font-black flex items-center justify-center text-base shadow-xs">
                        AQ
                      </div>
                    )}
                    <div>
                      <div className="text-[11px] font-mono text-[#14B8A6] uppercase tracking-wider">
                        {targetTenant.name} · Enterprise Workspace
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight">
                        Executive Operations Command Center
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-teal-900/40 text-[#14B8A6] px-2 py-0.5 rounded border border-[#0F766E]/40">
                    LIVE REFRESH
                  </span>
                </div>
              </div>
            )}

            {/* 3. REPORTS PREVIEW */}
            {activePreviewContext === 'reports' && (
              <div className="w-full bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#1E293B] pb-3">
                  <div className="flex items-center gap-3">
                    {targetTenant.logo ? (
                      <img
                        src={targetTenant.logo}
                        alt="Logo"
                        className="h-8 max-w-[120px] object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-[#0F766E]">
                        <span className="w-7 h-7 rounded bg-[#0F766E] text-white text-xs flex items-center justify-center">
                          AQ
                        </span>
                        <span>ARQENSIAL</span>
                      </div>
                    )}
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                      <span className="text-xs font-bold block">{targetTenant.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        GSTIN: {targetTenant.gstNumber || '27AAACA0000A1Z5'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    AUDITED WORKFORCE REPORT
                    <span className="block text-slate-600 dark:text-slate-300 font-bold">
                      OCT 2026 CYCLE
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 italic">
                  Report headers carry this branded emblem on all digital records & compliance exports.
                </div>
              </div>
            )}

            {/* 4. INVOICES PREVIEW */}
            {activePreviewContext === 'invoices' && (
              <div className="w-full bg-white dark:bg-[#0F172A] p-5 rounded-xl border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#1E293B] pb-3">
                  <div className="flex items-center gap-3">
                    {targetTenant.logo ? (
                      <img
                        src={targetTenant.logo}
                        alt="Logo"
                        className="h-9 max-w-[140px] object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-bold text-[#0F766E]">
                        <span className="w-8 h-8 rounded-lg bg-[#0F766E] text-white text-xs flex items-center justify-center font-bold">
                          AQ
                        </span>
                        <span className="text-sm font-black">ARQENSIAL</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold block">{targetTenant.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {targetTenant.city || 'Bangalore'}, {targetTenant.state || 'Karnataka'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
                      TAX INVOICE #INV-2026-089
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Amount Due: $14,250.00
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Corporate Billing Header Verification</span>
                  {onOpenInvoicePreview && (
                    <button
                      onClick={onOpenInvoicePreview}
                      className="text-[#0F766E] dark:text-[#14B8A6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Full Invoice Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 5. EXPORTED PDF PREVIEW */}
            {activePreviewContext === 'pdf' && (
              <div className="w-full bg-white text-slate-900 p-5 rounded-xl border border-slate-300 shadow-sm space-y-3 font-sans">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                  <div className="flex items-center gap-2.5">
                    {targetTenant.logo ? (
                      <img
                        src={targetTenant.logo}
                        alt="PDF Logo"
                        className="h-8 max-w-[120px] object-contain"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-[#0F766E] text-white font-bold flex items-center justify-center text-xs">
                        AQ
                      </div>
                    )}
                    <span className="font-bold text-sm tracking-wide">{targetTenant.name}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600">
                    CERTIFIED EXPORTED PDF · 300 DPI VECTOR READY
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When users export reports or payslips to PDF, the exact company logo is embedded with transparent background support and correct print resolution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {previewModalOpen && targetTenant.logo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {targetTenant.name} — Logo Asset Inspector
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-64 rounded-xl bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center p-6">
              <img
                src={targetTenant.logo}
                alt="Logo Full View"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={targetTenant.logo}
                download={`${targetTenant.name}-logo.png`}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </a>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
