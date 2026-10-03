import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ManagedFile } from '../../types/files';
import {
  X,
  Download,
  Trash2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  Calendar,
  User,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface FilePreviewModalProps {
  file: ManagedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { currentUser, currentRole, replaceManagedFile, deleteManagedFile, downloadManagedFile, addNotification } =
    useApp();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const replaceInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !file) return null;

  const isImage = file.fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(file.extension);
  const isPdf = file.fileType.includes('pdf') || file.extension === 'pdf';

  const canEdit =
    currentRole === 'super_admin' ||
    currentRole === 'company_admin' ||
    file.uploadedBy === currentUser.email;

  const handleDownload = () => {
    downloadManagedFile(file);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.storagePath);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addNotification('Path Copied', file.storagePath, 'info');
  };

  const handleReplacePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    setIsReplacing(true);
    const res = await replaceManagedFile(file.id, newFile);
    setIsReplacing(false);

    if (res.success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${file.fileName}"? This action is irreversible and recorded in the audit log.`)) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteManagedFile(file.id);
    setIsDeleting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-[#020617]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center shrink-0">
              {isImage ? <ZoomIn className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                {file.originalName || file.fileName}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  v{file.version || 1}
                </span>
                <span>·</span>
                <span>{file.fileSizeFormatted}</span>
                <span>·</span>
                <span className="uppercase">{file.extension}</span>
                {file.documentTag && (
                  <>
                    <span>·</span>
                    <span className="text-[#0F766E] dark:text-[#14B8A6] font-semibold font-sans">
                      {file.documentTag}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && (
              <>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-slate-500 px-1">
                  {(zoomLevel * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                  title="Rotate 90deg"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
              </>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Download file to computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {canEdit && (
              <>
                <input
                  ref={replaceInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleReplacePicked}
                />
                <button
                  disabled={isReplacing}
                  onClick={() => replaceInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Upload newer revision of this file"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Replace</span>
                </button>

                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Delete file permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Preview Stage + Metadata Sidepanel */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row min-h-[360px]">
          {/* Main Visual Stage */}
          <div className="flex-1 bg-slate-900 p-6 flex items-center justify-center overflow-auto min-h-[300px]">
            {isImage ? (
              <div className="flex items-center justify-center p-4">
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="max-h-[60vh] max-w-full object-contain transition-transform duration-200 rounded-lg shadow-xl"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            ) : isPdf ? (
              <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-slate-800 rounded-xl p-8 text-center text-white space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{file.originalName || file.fileName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Adobe Portable Document Format (PDF) · {file.fileSizeFormatted}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to View Offline</span>
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-slate-300 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-[#14B8A6] flex items-center justify-center">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {file.originalName || file.fileName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    {file.fileType} · {file.fileSizeFormatted}
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document File</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Metadata Inspector Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-[#1E293B] p-5 bg-white dark:bg-[#0F172A] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                FILE METADATA & AUDIT
              </span>

              {/* Attributes List */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Exact Storage Path:</span>
                  <div className="flex items-center justify-between gap-2 mt-0.5 p-2 bg-slate-50 dark:bg-[#020617] rounded-lg border border-slate-200 dark:border-[#1E293B]">
                    <span className="font-mono text-[11px] text-[#0F766E] dark:text-[#14B8A6] truncate">
                      {file.storagePath}
                    </span>
                    <button
                      onClick={handleCopyPath}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                      title="Copy path"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Upload Date:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">File Size:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                      {file.fileSizeFormatted}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Uploaded By:</span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                    <User className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span className="truncate">{file.uploadedByName || file.uploadedBy}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block pl-5 uppercase">
                    Role: {file.uploadedByRole?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Target Entity & Category:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] rounded font-semibold capitalize">
                      {file.entityType}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                      {file.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {file.description && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Description:</span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] italic mt-0.5">
                      "{file.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 bg-teal-50/50 dark:bg-[#0F766E]/10 rounded-xl border border-teal-200/50 dark:border-[#0F766E]/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">
                <ShieldCheck className="w-4 h-4" />
                <span>Supabase Storage Security</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Protected by tenant Row Level Security. Direct public URL access prevented. Authorized signed tokens expire dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
