import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import { ManagedFile, FileCategory, FileEntityType, DocumentTag } from '../../types/files';
import { CompanyLogoManager } from './CompanyLogoManager';
import { FileUploadModal } from './FileUploadModal';
import { FilePreviewModal } from './FilePreviewModal';
import { UserProfileModal } from '../profile/UserProfileModal';
import { InvoicePreviewModal } from '../finance/InvoicePreviewModal';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  FolderArchive,
  Image as ImageIcon,
  Building2,
  Users,
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  HardDrive,
  FileSpreadsheet,
  FileCheck,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const DocumentManagement: React.FC = () => {
  const {
    currentTenant,
    tenants,
    currentRole,
    currentUser,
    managedFiles,
    fileAuditLogs,
    downloadManagedFile,
    deleteManagedFile,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'all' | 'logos' | 'company_docs' | 'employee_docs' | 'client_docs' | 'media' | 'audit'
  >('all');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>(
    currentRole === 'super_admin' ? 'all' : currentTenant.id
  );

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDefaults, setUploadDefaults] = useState<{
    entityType: FileEntityType;
    category: FileCategory;
  }>({ entityType: 'company', category: 'company_document' });

  const [previewFile, setPreviewFile] = useState<ManagedFile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // RLS Filtering: Super Admin sees all (or filtered tenant), other roles see strictly their own tenant
  const userVisibleFiles = managedFiles.filter((f) => {
    // 1. Tenant boundary
    if (currentRole !== 'super_admin' && f.tenantId !== currentTenant.id) {
      return false;
    }
    if (currentRole === 'super_admin' && selectedTenantFilter !== 'all' && f.tenantId !== selectedTenantFilter) {
      return false;
    }

    // 2. Tab filtering
    if (activeTab === 'logos' && f.category !== 'company_logo') return false;
    if (activeTab === 'company_docs' && f.entityType !== 'company') return false;
    if (activeTab === 'employee_docs' && f.entityType !== 'employee' && f.category !== 'employee_document') return false;
    if (activeTab === 'client_docs' && f.entityType !== 'client' && f.category !== 'client_document') return false;
    if (
      activeTab === 'media' &&
      !['product_image', 'banner_image', 'media_file'].includes(f.category) &&
      !f.fileType.startsWith('image/')
    )
      return false;

    // 3. Category selector
    if (selectedCategoryFilter !== 'all' && f.category !== selectedCategoryFilter) return false;

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.fileName.toLowerCase().includes(q) || (f.originalName || '').toLowerCase().includes(q);
      const matchTag = (f.documentTag || '').toLowerCase().includes(q);
      const matchUser = (f.uploadedByName || f.uploadedBy).toLowerCase().includes(q);
      const matchPath = f.storagePath.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchUser && !matchPath) return false;
    }

    return true;
  });

  const openUploadWith = (entityType: FileEntityType, category: FileCategory) => {
    setUploadDefaults({ entityType, category });
    setUploadModalOpen(true);
  };

  const handleDeleteFile = async (fileId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }
    await deleteManagedFile(fileId);
  };

  // Filtered Audit Logs
  const visibleAuditLogs = fileAuditLogs.filter((log) => {
    if (currentRole !== 'super_admin' && log.companyId !== currentTenant.id) {
      return false;
    }
    if (currentRole === 'super_admin' && selectedTenantFilter !== 'all' && log.companyId !== selectedTenantFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.fileName.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.storagePath.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6]">
              <FolderArchive className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Centralized File & Media Management System
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            Enterprise storage vault for logos, employee KYC, compliance certificates, client agreements & product media for {currentRole === 'super_admin' && selectedTenantFilter === 'all' ? 'All Enterprise Tenants' : currentTenant.name}
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => openUploadWith('company', 'company_document')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-1">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'All Files Vault', count: managedFiles.length, icon: FolderArchive },
            { id: 'logos', label: 'Company Logos', icon: Building2 },
            { id: 'company_docs', label: 'Company Documents', icon: FileCheck },
            { id: 'employee_docs', label: 'Employee Documents', icon: Users },
            { id: 'client_docs', label: 'Client Documents', icon: Briefcase },
            { id: 'media', label: 'Media & Product Assets', icon: ImageIcon },
            { id: 'audit', label: 'Security & Audit Logs', count: fileAuditLogs.length, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E293B]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-[#1E293B] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Multi-Tenant Switcher for Super Admin */}
        {currentRole === 'super_admin' && tenants.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Tenant Filter:</span>
            <select
              value={selectedTenantFilter}
              onChange={(e) => setSelectedTenantFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Companies ({tenants.length})</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: COMPANY LOGO MANAGEMENT */}
      {activeTab === 'logos' && (
        <CompanyLogoManager
          onOpenInvoicePreview={() => setInvoiceModalOpen(true)}
          onOpenReportPreview={() => {
            addNotification('Reports Branded Header', 'Company logo loaded in reports.', 'info');
          }}
        />
      )}

      {/* TAB CONTENT 2: SECURITY & AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>File Storage Access & Modification Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cryptographic logging of all upload, update, delete, preview and download transactions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-[#020617]/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-[#1E293B]">
                  <tr>
                    <th className="py-3 px-4 text-left font-mono">Timestamp</th>
                    <th className="py-3 px-4 text-left">Action</th>
                    <th className="py-3 px-4 text-left">File Name</th>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Company</th>
                    <th className="py-3 px-4 text-left">Storage Path</th>
                    <th className="py-3 px-4 text-left">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {visibleAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No audit events recorded yet. Files uploaded, modified or downloaded will log here automatically.
                      </td>
                    </tr>
                  ) : (
                    visibleAuditLogs.map((log) => {
                      const actionColors: Record<string, string> = {
                        UPLOAD: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
                        UPDATE: 'bg-teal-50 text-[#0F766E] dark:bg-[#0F766E]/20 dark:text-[#14B8A6]',
                        DELETE: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
                        DOWNLOAD: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
                        PREVIEW: 'bg-slate-100 text-slate-700 dark:bg-[#1E293B] dark:text-slate-300',
                      };
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/30">
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                actionColors[log.action] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-[#F8FAFC] max-w-xs truncate">
                            {log.fileName}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            <div>{log.userName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.userRole?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                            {log.companyName || log.companyId}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-[#0F766E] dark:text-[#14B8A6] max-w-xs truncate">
                            {log.storagePath}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                            {log.fileSize || '0 B'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ALL / COMPANY / EMPLOYEE / CLIENT / MEDIA VAULT */}
      {activeTab !== 'logos' && activeTab !== 'audit' && (
        <div className="space-y-4">
          {/* Quick Context Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
            {/* Search and Category Filter */}
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by file name, tag, user or storage path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              {activeTab === 'all' && (
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All File Types</option>
                  <option value="company_logo">Company Logos</option>
                  <option value="company_document">Company Documents</option>
                  <option value="employee_document">Employee Documents</option>
                  <option value="client_document">Client Documents</option>
                  <option value="product_image">Product Images</option>
                  <option value="user_profile">User Profiles</option>
                  <option value="media_file">Media Assets</option>
                </select>
              )}
            </div>

            {/* View Mode Switcher & Tab-Specific Add Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#020617] p-1 rounded-xl border border-slate-200 dark:border-[#1E293B]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeTab === 'company_docs' && (
                <button
                  onClick={() => openUploadWith('company', 'company_document')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Company Doc</span>
                </button>
              )}

              {activeTab === 'employee_docs' && (
                <button
                  onClick={() => openUploadWith('employee', 'employee_document')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Employee Doc</span>
                </button>
              )}

              {activeTab === 'client_docs' && (
                <button
                  onClick={() => openUploadWith('client', 'client_document')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Client Contract</span>
                </button>
              )}

              {activeTab === 'media' && (
                <button
                  onClick={() => openUploadWith('product', 'product_image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Media Asset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Summary Cards */}
          {activeTab === 'all' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setActiveTab('company_docs')}
                className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs cursor-pointer hover:border-[#0F766E] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Company Docs
                  </span>
                  <Building2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {managedFiles.filter((f) => f.entityType === 'company').length}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  GST, PAN, Compliance
                </span>
              </div>

              <div
                onClick={() => setActiveTab('employee_docs')}
                className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs cursor-pointer hover:border-[#0F766E] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Employee Docs
                  </span>
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {managedFiles.filter((f) => f.entityType === 'employee').length}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Aadhaar, Resume, Offer
                </span>
              </div>

              <div
                onClick={() => setActiveTab('client_docs')}
                className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs cursor-pointer hover:border-[#0F766E] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Client Contracts
                  </span>
                  <Briefcase className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {managedFiles.filter((f) => f.entityType === 'client').length}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Agreements & KYC
                </span>
              </div>

              <div
                onClick={() => setActiveTab('media')}
                className="p-3.5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs cursor-pointer hover:border-[#0F766E] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                    Media & Products
                  </span>
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
                  {managedFiles.filter((f) => ['product_image', 'banner_image', 'media_file'].includes(f.category)).length}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Images, SVGs, Catalog
                </span>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {userVisibleFiles.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FolderArchive className="w-8 h-8 text-[#0F766E] dark:text-[#14B8A6]" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Storage Vault is Empty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  No records match your selected folder filter. Drag & drop or upload company compliance files, employee Aadhaar/PAN, client agreements, or product media assets.
                </p>
              </div>
              <button
                onClick={() => openUploadWith('company', 'company_document')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First File</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userVisibleFiles.map((file) => {
                const isImg = file.fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(file.extension);
                return (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] dark:hover:border-[#14B8A6] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail or File Type Icon */}
                      <div
                        onClick={() => setPreviewFile(file)}
                        className="relative w-full h-32 rounded-lg bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] flex items-center justify-center overflow-hidden cursor-pointer mb-3"
                      >
                        {isImg ? (
                          <img
                            src={file.thumbnailUrl || file.url}
                            alt={file.fileName}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : file.extension === 'pdf' ? (
                          <div className="flex flex-col items-center gap-1 text-rose-500">
                            <FileText className="w-10 h-10" />
                            <span className="text-[10px] font-mono font-bold uppercase">PDF</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-[#0F766E] dark:text-[#14B8A6]">
                            <FileSpreadsheet className="w-10 h-10" />
                            <span className="text-[10px] font-mono font-bold uppercase">{file.extension}</span>
                          </div>
                        )}

                        <span className="absolute top-2 right-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-white backdrop-blur-xs">
                          v{file.version || 1}
                        </span>
                      </div>

                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] font-bold text-[#0F766E] dark:text-[#14B8A6] px-1.5 py-0.2 rounded bg-teal-50 dark:bg-[#0F766E]/20">
                          {file.documentTag || file.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {file.fileSizeFormatted}
                        </span>
                      </div>

                      {/* File Name */}
                      <h4
                        onClick={() => setPreviewFile(file)}
                        className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate cursor-pointer hover:text-[#0F766E]"
                        title={file.originalName || file.fileName}
                      >
                        {file.originalName || file.fileName}
                      </h4>

                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {file.storagePath}
                      </p>
                    </div>

                    {/* Bottom Metadata & Quick Action Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between mt-3 text-xs">
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        By {file.uploadedByName || file.uploadedBy.split('@')[0]}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          title="Preview details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadManagedFile(file)}
                          className="p-1 rounded text-slate-400 hover:text-[#0F766E] dark:hover:text-[#14B8A6] cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.fileName)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-[#020617]/70 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-[#1E293B]">
                    <tr>
                      <th className="py-3 px-4 text-left">File Name</th>
                      <th className="py-3 px-4 text-left">Category & Tag</th>
                      <th className="py-3 px-4 text-left">Storage Path</th>
                      <th className="py-3 px-4 text-left">Size</th>
                      <th className="py-3 px-4 text-left">Uploaded By</th>
                      <th className="py-3 px-4 text-left">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                    {userVisibleFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/30">
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          <div
                            onClick={() => setPreviewFile(file)}
                            className="flex items-center gap-2 cursor-pointer hover:text-[#0F766E]"
                          >
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="truncate max-w-xs">{file.originalName || file.fileName}</span>
                            <span className="font-mono text-[10px] text-slate-400">v{file.version || 1}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6]">
                            {file.documentTag || file.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-[#0F766E] dark:text-[#14B8A6] max-w-xs truncate">
                          {file.storagePath}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                          {file.fileSizeFormatted}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                          {file.uploadedByName || file.uploadedBy}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                              title="Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => downloadManagedFile(file)}
                              className="p-1 text-slate-400 hover:text-[#0F766E]"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id, file.fileName)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultEntityType={uploadDefaults.entityType}
        defaultCategory={uploadDefaults.category}
      />

      {/* File Preview & Inspector Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
      />
    </div>
  );
};
