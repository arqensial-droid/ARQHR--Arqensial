import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService, formatFileSize } from '../../services/storageService';
import {
  FileCategory,
  FileEntityType,
  DocumentTag,
  FILE_SIZE_LIMITS,
} from '../../types/files';
import {
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  File,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntityType?: FileEntityType;
  defaultCategory?: FileCategory;
  defaultEntityId?: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  defaultEntityType = 'company',
  defaultCategory = 'company_document',
  defaultEntityId,
}) => {
  const {
    currentTenant,
    tenants,
    employees,
    currentUser,
    currentRole,
    uploadManagedFile,
    addNotification,
  } = useApp();

  const [selectedTenantId, setSelectedTenantId] = useState<string>(currentTenant.id);
  const [entityType, setEntityType] = useState<FileEntityType>(defaultEntityType);
  const [category, setCategory] = useState<FileCategory>(defaultCategory);
  const [entityId, setEntityId] = useState<string>(
    defaultEntityId || (defaultEntityType === 'company' ? currentTenant.id : '')
  );

  const [documentTag, setDocumentTag] = useState<DocumentTag>('Other');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressImageEnabled, setCompressImageEnabled] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Compute folder based on entityType and category
  const computeFolder = (): 'logos' | 'documents' | 'profile' | 'images' => {
    if (category === 'company_logo') return 'logos';
    if (category === 'user_profile' || category === 'employee_photo') return 'profile';
    if (category === 'product_image' || category === 'banner_image' || category === 'media_file') return 'images';
    return 'documents';
  };

  const getStoragePathPreview = () => {
    const activeTenantId = selectedTenantId || currentTenant.id;
    const activeEntityId = entityId || (entityType === 'company' ? activeTenantId : 'id');
    const folder = computeFolder();

    switch (entityType) {
      case 'company':
        return `/companies/${activeTenantId}/${folder}`;
      case 'user':
        return `/users/${activeEntityId}/${folder}`;
      case 'employee':
        return `/employees/${activeEntityId}/${folder}`;
      case 'client':
        return `/clients/${activeEntityId}/${folder}`;
      case 'product':
        return `/products/${activeEntityId}/${folder}`;
      default:
        return `/companies/${activeTenantId}/${folder}`;
    }
  };

  const handleFilePicked = (file: File) => {
    setValidationError(null);
    const val = storageService.validateFile(file, category);
    if (!val.valid) {
      setValidationError(val.error || 'Invalid file format or size limit exceeded.');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewDataUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFilePicked(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setValidationError('Please select or drag a file to upload.');
      return;
    }

    const activeTenantId = selectedTenantId || currentTenant.id;
    const finalEntityId = entityId || (entityType === 'company' ? activeTenantId : currentUser.id);

    setIsUploading(true);
    setValidationError(null);

    const folder = computeFolder();

    const res = await uploadManagedFile({
      tenantId: activeTenantId,
      companyId: activeTenantId,
      entityType,
      entityId: finalEntityId,
      folder,
      category,
      documentTag,
      description,
      user: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        role: currentRole,
      },
      file: selectedFile,
    });

    setIsUploading(false);

    if (res.success) {
      onClose();
    } else {
      setValidationError(res.error || 'Failed to upload file');
    }
  };

  // Tag options depending on entity & category
  const renderTagOptions = () => {
    if (entityType === 'employee') {
      return (
        <>
          <option value="Aadhaar">Aadhaar Card</option>
          <option value="PAN">PAN Card</option>
          <option value="Resume">Resume / CV</option>
          <option value="Offer Letter">Offer Letter</option>
          <option value="Joining Letter">Joining Letter</option>
          <option value="Certificates">Degree / Certificates</option>
          <option value="Other">Other Document</option>
        </>
      );
    }
    if (entityType === 'client') {
      return (
        <>
          <option value="Agreements">Master Services Agreement</option>
          <option value="Contracts">Commercial Contract</option>
          <option value="KYC Documents">KYC & Business License</option>
          <option value="Other">Other Client Record</option>
        </>
      );
    }
    if (entityType === 'company') {
      return (
        <>
          <option value="GST Certificate">GST Certificate</option>
          <option value="PAN Card">Company PAN Card</option>
          <option value="Registration Documents">Certificate of Incorporation</option>
          <option value="Compliance Documents">Compliance & Audit Filings</option>
          <option value="Other">Other Company Record</option>
        </>
      );
    }
    return (
      <>
        <option value="Product Image">Product Image</option>
        <option value="Other">Other</option>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-[#020617]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                Upload to File & Media Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encrypted multi-tenant storage with automatic compression & audit trail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {validationError && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Target Classification Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => {
                  const val = e.target.value as FileEntityType;
                  setEntityType(val);
                  if (val === 'employee') setCategory('employee_document');
                  else if (val === 'client') setCategory('client_document');
                  else if (val === 'company') setCategory('company_document');
                  else if (val === 'product') setCategory('product_image');
                  else setCategory('user_profile');
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              >
                <option value="company">Company</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
                <option value="product">Product & Asset</option>
                <option value="user">User Profile</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FileCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              >
                {entityType === 'company' && (
                  <>
                    <option value="company_document">Company Document</option>
                    <option value="company_logo">Company Logo</option>
                    <option value="banner_image">Banner Image</option>
                    <option value="media_file">Media File</option>
                  </>
                )}
                {entityType === 'employee' && (
                  <>
                    <option value="employee_document">Employee Document</option>
                    <option value="employee_photo">Employee Photo</option>
                  </>
                )}
                {entityType === 'client' && (
                  <>
                    <option value="client_document">Client Document</option>
                    <option value="client_photo">Client Photo</option>
                  </>
                )}
                {entityType === 'product' && (
                  <>
                    <option value="product_image">Product Image</option>
                    <option value="media_file">Product Media / Video</option>
                  </>
                )}
                {entityType === 'user' && (
                  <option value="user_profile">User Profile Photo</option>
                )}
              </select>
            </div>

            {/* Document Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Classification Tag
              </label>
              <select
                value={documentTag}
                onChange={(e) => setDocumentTag(e.target.value as DocumentTag)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              >
                {renderTagOptions()}
              </select>
            </div>

            {/* Specific Entity Picker */}
            {entityType === 'employee' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Employee
                </label>
                <select
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.empCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {entityType === 'client' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client ID / Reference
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="e.g. client-apex-corp"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
            )}

            {entityType === 'product' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product ID / SKU
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="e.g. PROD-SKU-9921"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
            )}
          </div>

          {/* Storage Structure Destination Path Indicator */}
          <div className="p-3 bg-slate-100 dark:bg-[#1E293B]/50 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Storage Destination:</span>
            <span className="font-mono text-[11px] font-bold text-[#0F766E] dark:text-[#14B8A6]">
              {getStoragePathPreview()}
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
              isDragging
                ? 'border-[#0F766E] bg-teal-50/50 dark:bg-[#0F766E]/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#0F766E] bg-slate-50 dark:bg-[#020617]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFilePicked(f);
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                {previewDataUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                    <img
                      src={previewDataUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block truncate max-w-sm">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for secure upload
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Drag & Drop your file here, or{' '}
                    <span className="text-[#0F766E] dark:text-[#14B8A6] underline">browse</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Images: JPG, PNG, WEBP, SVG · Docs: PDF, DOC, DOCX, XLS, XLSX, CSV, PPT, TXT
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Max: {category.includes('logo') ? '10 MB' : category.includes('photo') ? '5 MB' : category.includes('document') ? '25 MB' : '50 MB'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    Multi-Tenant RLS
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. FY26 Signed Non-Disclosure Agreement or Certificate scan"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          {/* Image Compression Toggle */}
          {selectedFile?.type.startsWith('image/') && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/40 dark:bg-[#0F766E]/10 border border-teal-200/50 dark:border-[#0F766E]/20 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Auto-Compress & Resize
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Optimizes resolution up to 1600px & generates high-speed 128px thumbnail
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={compressImageEnabled}
                onChange={(e) => setCompressImageEnabled(e.target.checked)}
                className="w-4 h-4 text-[#0F766E] rounded accent-[#0F766E] cursor-pointer"
              />
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Encrypting & Storing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
