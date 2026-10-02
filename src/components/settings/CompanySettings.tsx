import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  Sliders,
  DollarSign,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { DeleteCompanyModal } from './DeleteCompanyModal';
import { ResetCompanyModal } from './ResetCompanyModal';
import { FreshStartWizard } from '../organization/FreshStartWizard';
import { companyLifecycleService } from '../../services/companyLifecycleService';

export const CompanySettings: React.FC = () => {
  const {
    currentTenant,
    currentRole,
    currentUser,
    employees,
    updateTenantSettings,
    addNotification,
    tenants,
    switchTenant,
    logout,
  } = useApp();

  // Local state for editable company profile
  const [companyName, setCompanyName] = useState(currentTenant.name);
  const [industry, setIndustry] = useState(currentTenant.industry);
  const [contactEmail, setContactEmail] = useState(currentTenant.contactEmail);
  const [contactPhone, setContactPhone] = useState(currentTenant.contactPhone || '');
  const [address, setAddress] = useState(currentTenant.address || '');
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [purgingDemo, setPurgingDemo] = useState(false);

  const activeEmployeesCount = employees.filter(e => e.tenantId === currentTenant.id && e.status === 'Active').length;
  const isAuthorized = currentRole === 'super_admin' || currentRole === 'company_admin';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateTenantSettings({
      ...currentTenant.settings,
    });
    addNotification('Profile Updated', 'Company information and settings saved successfully.', 'success');
    setIsSaving(false);
  };

  // Handler for confirmed delete
  const handleConfirmDelete = async (password: string): Promise<boolean> => {
    const res = await companyLifecycleService.deleteCompany(
      currentTenant.id,
      {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentRole,
      },
      password
    );

    if (res.success) {
      setDeleteModalOpen(false);
      addNotification('Company Deleted', res.message || 'Workspace deleted successfully.', 'success');

      // Check if there is another tenant to switch to, or trigger Fresh Start Wizard
      const remainingTenants = tenants.filter(t => t.id !== currentTenant.id);
      if (remainingTenants.length > 0) {
        switchTenant(remainingTenants[0].id);
      } else {
        // No remaining tenants: open Fresh Start Wizard
        setWizardOpen(true);
      }
      return true;
    } else {
      addNotification('Deletion Failed', res.error || 'Failed to delete company.', 'error');
      return false;
    }
  };

  // Handler for confirmed reset
  const handleConfirmReset = async (password: string): Promise<boolean> => {
    const res = await companyLifecycleService.resetCompanyData(
      currentTenant.id,
      {
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentRole,
      },
      password
    );

    if (res.success) {
      setResetModalOpen(false);
      addNotification('Company Data Reset', res.message || 'Transactional data purged.', 'success');
      // Launch Fresh Start Wizard so the owner can reconfigure stores, initial staff, and workflow
      setWizardOpen(true);
      return true;
    } else {
      addNotification('Reset Failed', res.error || 'Failed to reset data.', 'error');
      return false;
    }
  };

  // Handler for purging all demo data platform-wide (Clean Production State)
  const handlePurgeAllDemoData = async () => {
    if (!window.confirm('Are you sure you want to permanently purge all sample demo companies, mock inventory, and placeholder employees? The system will be left in a clean production state.')) {
      return;
    }

    setPurgingDemo(true);
    const res = await companyLifecycleService.purgeAllDemoData();
    setPurgingDemo(false);

    if (res.success) {
      addNotification('Production State Ready', res.message, 'success');
      window.location.reload();
    } else {
      addNotification('Purge Failed', res.message, 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto font-sans text-slate-800 dark:text-slate-200">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#0F766E] dark:text-[#14B8A6] font-bold uppercase tracking-wider">
              Organization Governance
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6]">
              {currentTenant.companyCode || 'WORKSPACE'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Company Settings & Data Lifecycle
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage organization metadata, operational modules, clean-slate resets, and complete company deletion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-[#0F766E]/15 border border-[#0F766E]/30 rounded-xl hover:bg-teal-100 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fresh Start Wizard</span>
          </button>
        </div>
      </div>

      {/* 1. Company Profile & Overview Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/50 dark:bg-[#020617]/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-[#020617] text-white flex items-center justify-center font-bold text-sm border border-slate-700 shadow-xs">
              {currentTenant.logo || 'CO'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {currentTenant.name}
              </h2>
              <p className="text-xs text-slate-500">
                {currentTenant.legalCompanyName || `${currentTenant.name} Private Limited`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {currentTenant.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Display Grid of Required Properties */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-[#0F172A]">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Company Name</span>
            <div className="mt-1 font-bold text-xs text-slate-900 dark:text-white truncate">
              {currentTenant.name}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Code: {currentTenant.companyCode || 'N/A'}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Industry</span>
            <div className="mt-1 font-bold text-xs text-slate-900 dark:text-white truncate">
              {currentTenant.industry}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Timezone: {currentTenant.timezone}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Business Email</span>
            <div className="mt-1 font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
              {currentTenant.contactEmail}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Phone: {currentTenant.contactPhone || 'N/A'}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Subscription Plan</span>
            <div className="mt-1 font-bold text-xs text-[#0F766E] dark:text-[#14B8A6] truncate">
              {currentTenant.planName || 'Enterprise Managed Instance'}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono mt-0.5 block">Unlimited User Licenses</span>
          </div>

          <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Registered Address</span>
            <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              {currentTenant.address || 'Commercial Center, Main City Boulevard'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Created Date</span>
            <div className="mt-1 font-mono text-xs text-slate-900 dark:text-white">
              {new Date(currentTenant.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Currency: {currentTenant.currency}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-[#1E293B] bg-slate-50/40 dark:bg-[#020617]/40">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Active Users</span>
            <div className="mt-1 font-mono font-bold text-lg text-slate-900 dark:text-white">
              {activeEmployeesCount} Enrolled
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Isolated PostgreSQL RLS</span>
          </div>
        </div>
      </div>

      {/* 2. RESET ZONE (Orange Border Card) */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border-2 border-amber-400/80 dark:border-amber-600/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-100">
                Reset Company Business Data
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Keep company account active, purge transactional data to start with a clean slate
              </p>
            </div>
          </div>

          {isAuthorized && (
            <button
              onClick={() => setResetModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Company Data</span>
            </button>
          )}
        </div>

        <div className="p-6 text-xs text-slate-600 dark:text-slate-300 space-y-3">
          <p className="leading-relaxed">
            The <strong>Reset Company Data</strong> feature allows company owners to clear out test transactions, demo orders, sample products, attendance punches, and historical records while keeping their primary login credentials, workspace URL, and license settings intact.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-1">
              <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block uppercase">
                Purged Data (Cleaned Out):
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[11px]">
                <li>Products, Categories & Inventory Records</li>
                <li>Customer Orders, Purchases & Transactions</li>
                <li>Attendance Punches & Shift Clock-ins</li>
                <li>Leave Requests & Historical Payslips</li>
                <li>Expense Claims, Invoices & Hardware Assets</li>
                <li>Analytics Reports & Audit Events</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block uppercase">
                Preserved Data (Retained):
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[11px]">
                <li>Company Profile, Code & Legal Name</li>
                <li>Primary Company Owner User Account</li>
                <li>Subscription License & Billing Status</li>
                <li>Owner Login Credentials & Passwords</li>
                <li>Tenant Isolation Identifiers</li>
                <li>Fresh Start Wizard Redirection Ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DANGER ZONE (Red Border Card) */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border-2 border-rose-500/80 dark:border-rose-600/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950 dark:text-rose-100">
                Danger Zone: Delete Company Workspace
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Permanently delete this organization, stores, staff, and all database records
              </p>
            </div>
          </div>

          {isAuthorized && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Company</span>
            </button>
          )}
        </div>

        <div className="p-6 text-xs text-slate-600 dark:text-slate-300 space-y-3">
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] text-rose-700 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>This action is irreversible. All company data will be permanently deleted.</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Once you delete <strong>{currentTenant.name}</strong>, there is no going back. All branches, stores, employees, user accounts, roles, products, inventory, orders, payroll history, and uploaded documents will be permanently purged from the database.
            </p>
          </div>

          <p className="text-slate-500 text-[11px]">
            Security Protection: Deletion requires confirming the exact company name, ticking the acknowledgment checkbox, and entering your account password. Only users with <strong>Company Owner</strong> or <strong>Super Admin</strong> roles can authorize deletion.
          </p>
        </div>
      </div>

      {/* 4. Super Admin Tool: Clean Production State (Purge All Demo Data) */}
      {currentRole === 'super_admin' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#1E293B] shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Purge All Demo Data (Deliver Clean Production State)
              </h3>
              <p className="text-xs text-slate-500">
                Removes all sample companies, placeholder employees, test orders, and mock inventory across the platform.
              </p>
            </div>
          </div>

          <button
            onClick={handlePurgeAllDemoData}
            disabled={purgingDemo}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${purgingDemo ? 'animate-spin' : ''}`} />
            <span>Purge Demo Datasets</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <DeleteCompanyModal
        isOpen={deleteModalOpen}
        tenant={currentTenant}
        onClose={() => setDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />

      <ResetCompanyModal
        isOpen={resetModalOpen}
        tenant={currentTenant}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      <FreshStartWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialCompanyName={currentTenant.name}
      />
    </div>
  );
};
