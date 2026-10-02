import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant } from '../../types';
import {
  Building2,
  PlusCircle,
  ShieldAlert,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Store,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Briefcase,
} from 'lucide-react';
import { CompanyOnboardingModal } from '../organization/CompanyOnboardingModal';

export const SuperAdminPortal: React.FC = () => {
  const {
    tenants,
    startImpersonation,
    switchTenant,
    loadDemoCompany,
  } = useApp();

  const [showOnboardModal, setShowOnboardModal] = useState(false);

  const totalHeadcount = tenants.reduce((acc, t) => acc + (t.employeeCount || 0), 0);
  const vastraTenant = tenants.find(t => t.companyCode === 'VASTRA' || t.name.toLowerCase().includes('vastra'));

  const handleLaunchVastra = () => {
    if (vastraTenant) {
      startImpersonation(vastraTenant.id);
    } else {
      setShowOnboardModal(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-[#020617] via-[#0F172A] to-[#0F766E]/20 rounded-2xl p-6 text-white border border-[#1E293B] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#14B8A6] uppercase tracking-widest block font-bold">
            Root Authority · Administrator Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Managed Client Workspaces & Companies
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Centralized orchestration across all client instances. Manually provisioned for small businesses, retail stores, clothing boutiques, and service agencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {vastraTenant && (
            <button
              onClick={handleLaunchVastra}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition cursor-pointer"
              title="Launch Vastra Vatika Clothing Store Portal"
            >
              <Store className="w-4 h-4" />
              <span>Open Vastra Vatika (Store)</span>
            </button>
          )}

          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard New Company</span>
          </button>

          <button
            onClick={loadDemoCompany}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition cursor-pointer"
            title="Reset and reload default demo data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Vastra Vatika Quick Launch Card */}
      {vastraTenant && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 via-[#0F172A] to-slate-900 border border-[#0F766E]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              VV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{vastraTenant.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F766E]/20 text-[#14B8A6] border border-[#0F766E]/30">
                  {vastraTenant.companyCode || 'VASTRA'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Retail Operations
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bandra West Flagship Store · Ethnic Fashion & Apparel Boutique · 5 Initial Retail Departments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchVastra}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition cursor-pointer"
            >
              <span>Launch Store Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Metrics Strip (Zero Subscription, Zero Seat Limits) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled Companies</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">{tenants.length}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">100% active instances</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aggregated Staff & Employees</span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0F766E] dark:text-[#14B8A6] tabular-nums">
            {totalHeadcount.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Cross-tenant identities</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target Businesses Supported</span>
          <div className="mt-2 text-base font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Store className="w-4 h-4 text-[#14B8A6]" />
            <span>Retail, Clothing & Agencies</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Zero seat or plan limits</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Multi-Tenant Isolation</span>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>PostgreSQL RLS Active</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Zero data leakage</span>
        </div>
      </div>

      {/* Enrolled Companies Table */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Active Client Company Instances</h2>
            <p className="text-xs text-slate-500">Each organization operates within its own isolated tenant context</p>
          </div>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Onboard Another Company</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
          {tenants.map(tenant => (
            <div
              key={tenant.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/30 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-[#020617] text-white border border-transparent dark:border-[#1E293B] font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {tenant.logo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{tenant.name}</h3>
                    {tenant.companyCode && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6]">
                        {tenant.companyCode}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      {tenant.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tenant.industry} · {tenant.timezone}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Contact: {tenant.contactEmail} · Staff Enrolled: {tenant.employeeCount} · Currency: {tenant.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startImpersonation(tenant.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Impersonate Admin</span>
                </button>

                <button
                  onClick={() => switchTenant(tenant.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-[#0F766E]/20 hover:bg-teal-100 dark:hover:bg-[#0F766E]/30 border border-[#0F766E]/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Switch to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Audience Architecture Highlights (Replaces Subscription Plans) */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
            Tailored Workforce Architecture for Local Businesses & Retail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-configured operational workflows customized for high-touch retail stores, fashion boutiques, and agencies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Clothing & Retail Stores',
              example: 'Vastra Vatika',
              desc: 'Store floor sales, POS cashiers, tailoring & alterations, and receipt stock audits.',
              icon: Store,
            },
            {
              title: 'Small Retail Outlets',
              example: 'Corner Marts & Grocery',
              desc: 'Flexible shifts, mobile attendance check-in, daily cash management, and holiday overtime.',
              icon: Briefcase,
            },
            {
              title: 'Creative & Digital Agencies',
              example: 'Design & Marketing',
              desc: 'Client servicing, sprint deliverables, project time allocation, and expense claims.',
              icon: Layers,
            },
            {
              title: 'Care & Maid Agencies',
              example: 'Domestic & Facility Staffing',
              desc: 'Caregiver vetting, background police verification records, client placement, and wage tracking.',
              icon: Users,
            },
          ].map(aud => (
            <div
              key={aud.title}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#020617]/50 space-y-2"
            >
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <aud.icon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>{aud.title}</span>
              </div>
              <span className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] font-semibold block">
                Target: {aud.example}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">{aud.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Production Tenant Onboarding Modal */}
      {showOnboardModal && (
        <CompanyOnboardingModal
          onClose={() => setShowOnboardModal(false)}
        />
      )}
    </div>
  );
};
