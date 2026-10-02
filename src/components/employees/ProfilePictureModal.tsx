import React, { useState, useRef } from 'react';
import { Employee } from '../../types';
import { storageService } from '../../services/storageService';
import {
  X,
  Upload,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  PenTool,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface ProfilePictureModalProps {
  employee: Employee;
  tenantId: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
  onSaveSignature?: (newSignatureUrl: string) => void;
  onClose: () => void;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  employee,
  tenantId,
  onSaveAvatar,
  onSaveSignature,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'signature'>('photo');
  const [previewUrl, setPreviewUrl] = useState<string | null>(employee.avatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Signature state
  const [sigPreview, setSigPreview] = useState<string | null>(employee.signatureUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateProfileImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSigFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMessage('Signature must be a PNG or JPEG file with transparent or white background.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSigPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile && !previewUrl) {
      // If removed
      onSaveAvatar('');
      onClose();
      return;
    }

    if (!selectedFile && previewUrl) {
      onClose();
      return;
    }

    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    const res = await storageService.uploadProfilePhoto(tenantId, employee.id, selectedFile);
    setIsUploading(false);

    if (res.signedUrl) {
      onSaveAvatar(res.signedUrl);
      setSuccessMessage('Profile photo securely saved to encrypted storage.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Failed to upload photo.');
    }
  };

  const handleSaveSignature = async () => {
    if (!sigPreview) {
      onClose();
      return;
    }

    setIsUploading(true);
    const res = await storageService.uploadSignature(tenantId, employee.id, sigPreview);
    setIsUploading(false);

    if (res.signedUrl) {
      if (onSaveSignature) onSaveSignature(res.signedUrl);
      setSuccessMessage('Digital signature stored securely for document signing.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Failed to upload signature.');
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Employee Identity Media
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {employee.fullName} ({employee.empCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('photo')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'photo'
                ? 'border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Photo
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'signature'
                ? 'border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Digital Signature
          </button>
        </div>

        <div className="p-5">
          {/* Notification Banners */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'photo' ? (
            <div>
              {/* Photo Framing & Crop Preview */}
              <div className="flex flex-col items-center">
                <div className="relative w-44 h-44 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-inner">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      className="w-full h-full object-cover transition-transform"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-xs text-center p-3">
                      <Camera className="w-8 h-8 mb-1 text-slate-400" />
                      <span>No profile picture set</span>
                    </div>
                  )}

                  {/* Circular mask guide */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#0F766E]/40 pointer-events-none" />
                </div>

                {/* Zoom Controls */}
                {previewUrl && (
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.1))}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{previewUrl ? 'Replace Photo' : 'Upload Image'}</span>
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Permitted formats: JPEG, PNG, WebP · Maximum size: 5 MB · Stored in private bucket with signed URLs
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Digital Signature Upload Area */}
              <div className="flex flex-col items-center">
                <div className="w-full h-32 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-3 relative overflow-hidden">
                  {sigPreview ? (
                    <img src={sigPreview} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      <PenTool className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <span>Upload official signature for payslips and offer letters</span>
                    </div>
                  )}
                </div>

                <input
                  ref={sigFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleSigFileChange}
                  className="hidden"
                />

                <div className="mt-3 flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => sigFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>Upload Signature Image</span>
                  </button>
                  {sigPreview && (
                    <button
                      type="button"
                      onClick={() => setSigPreview(null)}
                      className="p-1.5 text-rose-600 bg-rose-50 rounded-lg border border-rose-200 hover:bg-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isUploading}
            onClick={activeTab === 'photo' ? handleSavePhoto : handleSaveSignature}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 rounded-lg shadow-xs transition cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Securing Media...' : 'Save & Encrypt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
