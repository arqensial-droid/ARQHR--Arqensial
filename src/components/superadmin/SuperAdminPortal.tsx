import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant, Employee, SubscriptionPlan } from '../../types';
import {
  Building2,
  PlusCircle,
  ShieldAlert,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Briefcase,
  Search,
  Filter,
  Edit,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  KeyRound,
  CreditCard,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Globe,
  FileText,
  MapPin,
  X,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  UserPlus,
} from 'lucide-react';

export const SuperAdminPortal: React.FC = () => {
  const {
    tenants,
    employees,
    departments,
    payrollRuns,
    attendance,
    currentRole,
    currentUser,
    startImpersonation,
    switchTenant,
    addCompany,
    editCompany,
    deleteCompany,
    suspendCompany,
    reactivateCompany,
    assignSubscriptionPlan,
    createCompanyAdmin,
    resetCompanyPassword,
    subscriptionPlans,
    addNotification,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalTenant, setEditModalTenant] = useState<Tenant | null>(null);
  const [detailsModalTenant, setDetailsModalTenant] = useState<Tenant | null>(null);
  const [planModalTenant, setPlanModalTenant] = useState<Tenant | null>(null);
  const [adminModalTenant, setAdminModalTenant] = useState<Tenant | null>(null);
  const [resetModalTenant, setResetModalTenant] = useState<Tenant | null>(null);
  const [deleteModalTenant, setDeleteModalTenant] = useState<Tenant | null>(null);
  const [usageModalTenant, setUsageModalTenant] = useState<Tenant | null>(null);

  // Form state for Add Company (all 16 fields + Admin)
  const todayStr = new Date().toISOString().substring(0, 10);
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    industry: 'Technology & Enterprise Services',
    subscriptionPlan: 'Enterprise Plan',
    subscriptionStartDate: todayStr,
    subscriptionEndDate: nextYearStr,
    status: 'active' as const,
    // Company Admin
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
  });

  // Edit Company Form State
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});

  // Plan Assignment State
  const [selectedPlanId, setSelectedPlanId] = useState('enterprise');
  const [planStartDate, setPlanStartDate] = useState(todayStr);
  const [planEndDate, setPlanEndDate] = useState(nextYearStr);

  // Create Admin Form State
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Password Reset Output State
  const [tempPasswordResult, setTempPasswordResult] = useState<{ email: string; tempPass: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Delete Company Form State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.companyCode && t.companyCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalCompanies = tenants.length;
  const activeCompanies = tenants.filter(t => t.status === 'active').length;
  const suspendedCompanies = tenants.filter(t => t.status === 'suspended').length;
  const totalEmployeesAcrossTenants = employees.length;

  // 1. Handle Add Company Submit
  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyForm.name.trim()) {
      addNotification('Validation Error', 'Company Name is required.', 'error');
      return;
    }
    if (!newCompanyForm.contactEmail.trim()) {
      addNotification('Validation Error', 'Company Business Email is required.', 'error');
      return;
    }

    addCompany(
      {
        name: newCompanyForm.name.trim(),
        logo: newCompanyForm.logo.trim() || newCompanyForm.name.substring(0, 2).toUpperCase(),
        contactEmail: newCompanyForm.contactEmail.trim(),
        contactPhone: newCompanyForm.contactPhone.trim(),
        website: newCompanyForm.website.trim(),
        gstNumber: newCompanyForm.gstNumber.trim(),
        address: newCompanyForm.address.trim(),
        city: newCompanyForm.city.trim(),
        state: newCompanyForm.state.trim(),
        country: newCompanyForm.country.trim(),
        pincode: newCompanyForm.pincode.trim(),
        industry: newCompanyForm.industry.trim(),
        subscriptionPlan: newCompanyForm.subscriptionPlan,
        subscriptionStartDate: newCompanyForm.subscriptionStartDate,
        subscriptionEndDate: newCompanyForm.subscriptionEndDate,
        status: newCompanyForm.status,
      },
      newCompanyForm.adminEmail.trim()
        ? {
            fullName: newCompanyForm.adminFullName.trim() || `${newCompanyForm.name} Admin`,
            email: newCompanyForm.adminEmail.trim(),
            phone: newCompanyForm.adminPhone.trim(),
            password: newCompanyForm.adminPassword || 'Admin@123!',
          }
        : undefined
    );

    setAddModalOpen(false);
    setNewCompanyForm({
      name: '',
      logo: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      industry: 'Technology & Enterprise Services',
      subscriptionPlan: 'Enterprise Plan',
      subscriptionStartDate: todayStr,
      subscriptionEndDate: nextYearStr,
      status: 'active',
      adminFullName: '',
      adminEmail: '',
      adminPhone: '',
      adminPassword: '',
    });
  };

  // 2. Handle Edit Company Submit
  const handleEditCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalTenant) return;

    editCompany(editModalTenant.id, editForm);
    setEditModalTenant(null);
  };

  // 3. Handle Delete Company Confirm
  const handleDeleteCompanyConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalTenant) return;

    if (deleteConfirmText.trim() !== deleteModalTenant.name.trim()) {
      addNotification('Confirmation Mismatch', 'Entered company name does not match.', 'error');
      return;
    }
    if (!deleteAcknowledged) {
      addNotification('Checkbox Required', 'Please check the acknowledgment box.', 'warning');
      return;
    }

    setIsDeleting(true);
    const ok = await deleteCompany(deleteModalTenant.id, deletePassword || 'admin123');
    setIsDeleting(false);

    if (ok) {
      setDeleteModalTenant(null);
      setDeleteConfirmText('');
      setDeletePassword('');
      setDeleteAcknowledged(false);
    }
  };

  // 4. Handle Assign Plan
  const handleAssignPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planModalTenant) return;

    assignSubscriptionPlan(planModalTenant.id, selectedPlanId, planStartDate, planEndDate);
    setPlanModalTenant(null);
  };

  // 5. Handle Create Admin
  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminModalTenant) return;

    if (!newAdminForm.fullName.trim() || !newAdminForm.email.trim()) {
      addNotification('Validation Error', 'Admin Name and Email are required.', 'error');
      return;
    }

    createCompanyAdmin(adminModalTenant.id, newAdminForm);
    setAdminModalTenant(null);
    setNewAdminForm({ fullName: '', email: '', phone: '', password: '' });
  };

  // 6. Handle Password Reset
  const handleTriggerPasswordReset = (tenant: Tenant) => {
    const adminEmail = tenant.contactEmail;
    const res = resetCompanyPassword(tenant.id, adminEmail);
    setTempPasswordResult({
      email: adminEmail,
      tempPass: res.tempPassword,
    });
    setResetModalTenant(tenant);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner: Super Admin Authority */}
      <div className="bg-gradient-to-r from-[#020617] via-[#0F172A] to-[#0F766E]/20 rounded-2xl p-6 text-white border border-[#1E293B] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#14B8A6] uppercase tracking-widest font-bold">
              Root Authority · ARQENSIAL Super Admin
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0F766E]/20 text-[#14B8A6] border border-[#0F766E]/30">
              Root Access
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Company Management Suite
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Provision, monitor, edit, suspend, reactivate, or permanently delete client organizations. Full multi-tenant isolation and PostgreSQL Row Level Security enforced.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Global Status Bar: Total Companies: 0, Total Users: 0, etc. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Companies</span>
            <Building2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
            {totalCompanies}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Enrolled workspaces</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Instances</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {activeCompanies}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Running production workloads</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suspended</span>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {suspendedCompanies}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Temporarily locked</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Personnel</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">
            {totalEmployeesAcrossTenants}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Managed employees</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200/80 dark:border-[#1E293B]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, email, code, city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          {(['all', 'active', 'suspended', 'inactive'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Company List Table / Empty State */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Registered Companies & Workspaces ({filteredTenants.length})
            </h2>
            <p className="text-xs text-slate-500">
              Only Super Admin can create, modify, suspend, or permanently delete companies
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Company</span>
          </button>
        </div>

        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center mx-auto shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Total Companies: 0
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The database is completely clean and empty. No seeded records or demo accounts. Click below to add your first real company.
              </p>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-xs cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Company</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
            {filteredTenants.map(tenant => {
              const companyStaffCount = employees.filter(e => e.tenantId === tenant.id).length;
              const companyDeptCount = departments.filter(d => d.tenantId === tenant.id).length;

              return (
                <div
                  key={tenant.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/30 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-[#020617] text-white border border-slate-700 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {tenant.logo || tenant.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] truncate">
                          {tenant.name}
                        </h3>
                        {tenant.companyCode && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6]">
                            {tenant.companyCode}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            tenant.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : tenant.status === 'suspended'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {tenant.status}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-[#14B8A6] border border-teal-200 dark:border-teal-800">
                          {tenant.subscriptionPlan || tenant.planName || 'Enterprise'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                        <span>{tenant.industry}</span>
                        <span>·</span>
                        <span>{tenant.city || 'Headquarters'}, {tenant.country || 'India'}</span>
                        <span>·</span>
                        <span className="font-mono">{tenant.contactEmail}</span>
                        {tenant.contactPhone && (
                          <>
                            <span>·</span>
                            <span>{tenant.contactPhone}</span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>Staff: {companyStaffCount || tenant.employeeCount || 0}</span>
                        <span>·</span>
                        <span>Depts: {companyDeptCount}</span>
                        <span>·</span>
                        <span>Valid: {tenant.subscriptionStartDate || 'Active'} → {tenant.subscriptionEndDate || 'Unlimited'}</span>
                        {tenant.gstNumber && (
                          <>
                            <span>·</span>
                            <span>GST: {tenant.gstNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions Menu (All 10 Super Admin features) */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-[#1E293B]">
                    {/* View Details */}
                    <button
                      onClick={() => setDetailsModalTenant(tenant)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="View Company Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* View Usage */}
                    <button
                      onClick={() => setUsageModalTenant(tenant)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="View Usage & Telemetry"
                    >
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                    </button>

                    {/* Edit Company */}
                    <button
                      onClick={() => {
                        setEditModalTenant(tenant);
                        setEditForm(tenant);
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="Edit Company Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Assign Subscription */}
                    <button
                      onClick={() => {
                        setPlanModalTenant(tenant);
                        setSelectedPlanId(tenant.planId || 'enterprise');
                        setPlanStartDate(tenant.subscriptionStartDate || todayStr);
                        setPlanEndDate(tenant.subscriptionEndDate || nextYearStr);
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="Assign Subscription Plan"
                    >
                      <CreditCard className="w-4 h-4 text-[#14B8A6]" />
                    </button>

                    {/* Create Admin */}
                    <button
                      onClick={() => setAdminModalTenant(tenant)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="Create Company Admin"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-500" />
                    </button>

                    {/* Reset Password */}
                    <button
                      onClick={() => handleTriggerPasswordReset(tenant)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-lg transition cursor-pointer"
                      title="Reset Company Password"
                    >
                      <KeyRound className="w-4 h-4 text-amber-500" />
                    </button>

                    {/* Suspend / Reactivate */}
                    {tenant.status === 'suspended' ? (
                      <button
                        onClick={() => reactivateCompany(tenant.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
                        title="Reactivate Company"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => suspendCompany(tenant.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition cursor-pointer flex items-center gap-1"
                        title="Suspend Company Access"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Suspend</span>
                      </button>
                    )}

                    {/* Impersonate Mode */}
                    <button
                      onClick={() => startImpersonation(tenant.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Impersonate Company Admin"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Impersonate</span>
                    </button>

                    {/* Delete Company (Danger Zone) */}
                    <button
                      onClick={() => {
                        setDeleteModalTenant(tenant);
                        setDeleteConfirmText('');
                        setDeletePassword('');
                        setDeleteAcknowledged(false);
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                      title="Delete Company Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. ADD COMPANY MODAL (All 16 Fields + Admin Provisioning) */}
      {/* ========================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/50 dark:bg-[#020617]/50">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Add New Organization Workspace</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Fill all required organization fields and configure initial admin credentials
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCompanySubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Basic Company Info */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6] block border-b border-slate-100 dark:border-[#1E293B] pb-1">
                  1. Organization Profile & Metadata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Retail Global"
                      value={newCompanyForm.name}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Logo (Initials or URL)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AC or https://..."
                      value={newCompanyForm.logo}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, logo: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={newCompanyForm.contactEmail}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 22 1234 5678"
                      value={newCompanyForm.contactPhone}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      placeholder="https://acme.com"
                      value={newCompanyForm.website}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, website: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      placeholder="27AABCA1234F1Z0"
                      value={newCompanyForm.gstNumber}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, gstNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Industry
                    </label>
                    <select
                      value={newCompanyForm.industry}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, industry: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    >
                      <option value="Technology & Enterprise Services">Technology & Enterprise Services</option>
                      <option value="Retail & Clothing Store">Retail & Clothing Store</option>
                      <option value="Digital & Creative Agency">Digital & Creative Agency</option>
                      <option value="Healthcare & Domestic Staffing">Healthcare & Domestic Staffing</option>
                      <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                      <option value="Financial & Legal Services">Financial & Legal Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Active / Inactive Status
                    </label>
                    <select
                      value={newCompanyForm.status}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Address Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6] block border-b border-slate-100 dark:border-[#1E293B] pb-1">
                  2. Registered Address & Location
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      placeholder="Suite 500, Commercial Business Tower"
                      value={newCompanyForm.address}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={newCompanyForm.city}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={newCompanyForm.state}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, state: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="400051"
                      value={newCompanyForm.pincode}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Subscription Plan */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6] block border-b border-slate-100 dark:border-[#1E293B] pb-1">
                  3. Subscription License & Validity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subscription Plan
                    </label>
                    <select
                      value={newCompanyForm.subscriptionPlan}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, subscriptionPlan: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    >
                      <option value="Starter Plan">Starter Plan (25 Seats)</option>
                      <option value="Professional Plan">Professional Plan (100 Seats)</option>
                      <option value="Enterprise Plan">Enterprise Plan (Unlimited Seats)</option>
                      <option value="Custom Managed Instance">Custom Managed Instance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newCompanyForm.subscriptionStartDate}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, subscriptionStartDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newCompanyForm.subscriptionEndDate}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, subscriptionEndDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Primary Company Admin Provisioning */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#14B8A6] block border-b border-slate-100 dark:border-[#1E293B] pb-1">
                  4. Primary Company Administrator (Optional Initial User)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newCompanyForm.adminFullName}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, adminFullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Admin Login Email
                    </label>
                    <input
                      type="email"
                      placeholder="admin@company.com"
                      value={newCompanyForm.adminEmail}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, adminEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Admin Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98000 00000"
                      value={newCompanyForm.adminPhone}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, adminPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Temporary Password
                    </label>
                    <input
                      type="text"
                      placeholder="Admin@123!"
                      value={newCompanyForm.adminPassword}
                      onChange={e => setNewCompanyForm({ ...newCompanyForm, adminPassword: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Provision Company Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT COMPANY MODAL */}
      {/* ========================================================= */}
      {editModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Edit Company Profile ({editModalTenant.name})</span>
                </h3>
              </div>
              <button
                onClick={() => setEditModalTenant(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCompanySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.contactEmail || ''}
                    onChange={e => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.contactPhone || ''}
                    onChange={e => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website || ''}
                    onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={editForm.gstNumber || ''}
                    onChange={e => setEditForm({ ...editForm, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={editForm.industry || ''}
                    onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status || 'active'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subscription Plan
                  </label>
                  <input
                    type="text"
                    value={editForm.subscriptionPlan || editForm.planName || ''}
                    onChange={e => setEditForm({ ...editForm, subscriptionPlan: e.target.value, planName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setEditModalTenant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VIEW COMPANY DETAILS MODAL */}
      {/* ========================================================= */}
      {detailsModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/50 dark:bg-[#020617]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {detailsModalTenant.logo || detailsModalTenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {detailsModalTenant.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {detailsModalTenant.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalTenant(null)}
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Company Code</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                    {detailsModalTenant.companyCode || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block capitalize">
                    {detailsModalTenant.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription</span>
                  <span className="font-bold text-[#0F766E] dark:text-[#14B8A6] mt-1 block">
                    {detailsModalTenant.subscriptionPlan || detailsModalTenant.planName || 'Enterprise'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Email</span>
                  <span className="font-mono text-slate-900 dark:text-white mt-1 block truncate">
                    {detailsModalTenant.contactEmail}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                  <span className="text-slate-900 dark:text-white mt-1 block">
                    {detailsModalTenant.contactPhone || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Website</span>
                  <span className="font-mono text-slate-900 dark:text-white mt-1 block truncate">
                    {detailsModalTenant.website || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GST / Tax ID</span>
                  <span className="font-mono text-slate-900 dark:text-white mt-1 block">
                    {detailsModalTenant.gstNumber || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">City & State</span>
                  <span className="text-slate-900 dark:text-white mt-1 block">
                    {detailsModalTenant.city || 'Mumbai'}, {detailsModalTenant.state || 'Maharashtra'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Country & PIN</span>
                  <span className="text-slate-900 dark:text-white mt-1 block">
                    {detailsModalTenant.country || 'India'} - {detailsModalTenant.pincode || '400051'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-100 dark:border-[#1E293B]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Physical Address</span>
                <span className="text-slate-900 dark:text-white mt-1 block">
                  {detailsModalTenant.address || 'Corporate Headquarters'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <div>
                    <span className="font-bold text-xs block">PostgreSQL Row Level Security Active</span>
                    <span className="text-[11px] text-slate-500">Workspace data completely isolated from other tenants</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold">100% Isolated</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end">
              <button
                onClick={() => setDetailsModalTenant(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ASSIGN SUBSCRIPTION PLAN MODAL */}
      {/* ========================================================= */}
      {planModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>Assign Subscription Plan ({planModalTenant.name})</span>
              </h3>
              <button
                onClick={() => setPlanModalTenant(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPlanSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Plan Tier
                </label>
                <div className="space-y-2">
                  {subscriptionPlans.map(plan => (
                    <label
                      key={plan.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedPlanId === plan.id
                          ? 'border-[#0F766E] bg-teal-50/50 dark:bg-[#0F766E]/15'
                          : 'border-slate-200 dark:border-[#1E293B] hover:bg-slate-50 dark:hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan_choice"
                        value={plan.id}
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="mt-0.5 text-[#0F766E]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{plan.name}</span>
                          <span className="font-mono text-xs text-[#0F766E] font-bold">
                            ₹{plan.pricePerUserMonthly}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Limit: {plan.maxUsers > 1000 ? 'Unlimited Users' : `${plan.maxUsers} Users`} · Storage: {plan.storageLimit}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subscription Start Date
                  </label>
                  <input
                    type="date"
                    value={planStartDate}
                    onChange={e => setPlanStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subscription End Date
                  </label>
                  <input
                    type="date"
                    value={planEndDate}
                    onChange={e => setPlanEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setPlanModalTenant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Update Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CREATE COMPANY ADMIN MODAL */}
      {/* ========================================================= */}
      {adminModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <span>Create Company Admin ({adminModalTenant.name})</span>
              </h3>
              <button
                onClick={() => setAdminModalTenant(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newAdminForm.fullName}
                  onChange={e => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Corporate Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@organization.com"
                  value={newAdminForm.email}
                  onChange={e => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newAdminForm.phone}
                  onChange={e => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generated password"
                  value={newAdminForm.password}
                  onChange={e => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setAdminModalTenant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Provision Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. RESET COMPANY PASSWORD RESULT MODAL */}
      {/* ========================================================= */}
      {resetModalTenant && tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <span>Password Reset Generated</span>
              </h3>
              <button
                onClick={() => {
                  setResetModalTenant(null);
                  setTempPasswordResult(null);
                }}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                A temporary password has been generated for <strong>{resetModalTenant.name}</strong> admin account:
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admin Account</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{tempPasswordResult.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Temporary Password</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                      {tempPasswordResult.tempPass}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(tempPasswordResult.tempPass);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                The company administrator can sign in using this temporary password and will be prompted to set a permanent password.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalTenant(null);
                    setTempPasswordResult(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. VIEW COMPANY USAGE MODAL */}
      {/* ========================================================= */}
      {usageModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Company Usage & Resources ({usageModalTenant.name})</span>
              </h3>
              <button
                onClick={() => setUsageModalTenant(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Employees</span>
                  <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {employees.filter(e => e.tenantId === usageModalTenant.id).length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Departments</span>
                  <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {departments.filter(d => d.tenantId === usageModalTenant.id).length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Punches</span>
                  <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {attendance.filter(a => a.tenantId === usageModalTenant.id).length}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payroll Runs</span>
                  <span className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {payrollRuns.filter(p => p.tenantId === usageModalTenant.id).length}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Storage Utilization:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">12.4 MB / Unlimited</span>
                </div>
                <div className="flex justify-between">
                  <span>Database Isolation:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">PostgreSQL RLS Active</span>
                </div>
                <div className="flex justify-between">
                  <span>License Tier:</span>
                  <span className="font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                    {usageModalTenant.subscriptionPlan || usageModalTenant.planName || 'Enterprise'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setUsageModalTenant(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. DELETE COMPANY MODAL (Cascade Deletion Danger Zone) */}
      {/* ========================================================= */}
      {deleteModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden">
            <div className="px-6 py-4 border-b border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-950 dark:text-rose-100">
                    Delete Company Workspace
                  </h3>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                    Permanently delete {deleteModalTenant.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalTenant(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteCompanyConfirm} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>This action is irreversible. All company data will be permanently deleted.</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Cascade deleting <strong>{deleteModalTenant.name}</strong> will remove all associated records from the database: branches, stores, employees, user accounts, roles & permissions, products, inventory, orders, payroll history, and documents.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  To confirm, type the exact company name: <span className="font-mono text-rose-600 font-bold">{deleteModalTenant.name}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={deleteModalTenant.name}
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confirm_checkbox"
                  checked={deleteAcknowledged}
                  onChange={e => setDeleteAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600"
                />
                <label htmlFor="confirm_checkbox" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  I understand that this action is irreversible and all company data will be permanently purged.
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enter Super Admin Account Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setDeleteModalTenant(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText.trim() !== deleteModalTenant.name.trim() || !deleteAcknowledged}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
