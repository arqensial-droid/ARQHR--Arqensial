import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Crop,
  Check,
  ZoomIn,
  ZoomOut,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  FileText,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRole, updateUserProfile, addNotification } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [department, setDepartment] = useState(currentUser?.departmentName || currentUser?.department || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = storageService.validateFile(file, 'user_profile');
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format or size.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageForCrop(reader.result as string);
      setCropMode(true);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!rawImageForCrop) return;

    try {
      // Calculate crop box centered
      const img = new Image();
      img.src = rawImageForCrop;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const minDim = Math.min(img.width, img.height);
      const cropSize = minDim / cropZoom;
      const x = Math.max(0, (img.width - cropSize) / 2 - cropOffsetX * 2);
      const y = Math.max(0, (img.height - cropSize) / 2 - cropOffsetY * 2);

      const cropped = await storageService.cropImage(
        rawImageForCrop,
        {
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(cropSize),
          height: Math.round(cropSize),
        },
        400
      );

      // Upload directly to /users/{userId}/profile
      const res = await storageService.uploadProfilePhoto(
        currentUser.tenantId,
        currentUser.id,
        cropped.blob
      );

      if (res.signedUrl) {
        setAvatarUrl(res.signedUrl);
        setCropMode(false);
        setRawImageForCrop(null);
        addNotification('Profile Image Ready', 'Cropped image ready to save.', 'success');
      } else {
        setErrorMessage(res.error || 'Failed to crop photo');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing crop');
    }
  };

  const handleDeletePhoto = () => {
    setAvatarUrl('');
    setSelectedFile(null);
    setRawImageForCrop(null);
    setCropMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateUserProfile({
        fullName,
        phone,
        designation,
        department,
        departmentName: department,
        bio,
        avatarUrl,
      });
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-[#020617]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                User Profile Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal credentials, contact info & profile photo
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

        {/* Content */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-900 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Profile Photo Management */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E293B]/40 border border-slate-200/80 dark:border-[#1E293B]">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Avatar Preview */}
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0F766E] shadow-md bg-white dark:bg-[#020617]">
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-linear-to-tr from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-[#0F172A]">
                    {getInitials(fullName || 'User')}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0F766E] hover:bg-[#115E59] text-white shadow-md cursor-pointer transition-colors"
                  title="Upload new photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Actions & Specs */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    JPG, PNG, or WebP. Max 5 MB. Stored at <span className="font-mono text-[11px] text-[#0F766E] dark:text-[#14B8A6]">/users/{currentUser.id}/profile</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>

                  {avatarUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setRawImageForCrop(avatarUrl);
                          setCropMode(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Crop</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Image Cropper Interface */}
            {cropMode && rawImageForCrop && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    Interactive Crop & Circle Viewport
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCropZoom((z) => Math.max(1, z - 0.2))}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {(cropZoom * 100).toFixed(0)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setCropZoom((z) => Math.min(3, z + 0.2))}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Viewport Box */}
                <div
                  ref={cropContainerRef}
                  className="relative w-full h-56 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center select-none cursor-move"
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    setDragStart({ x: e.clientX - cropOffsetX, y: e.clientY - cropOffsetY });
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging) return;
                    setCropOffsetX(e.clientX - dragStart.x);
                    setCropOffsetY(e.clientY - dragStart.y);
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <img
                    src={rawImageForCrop}
                    alt="Crop preview"
                    className="max-h-full max-w-none pointer-events-none transition-transform"
                    style={{
                      transform: `scale(${cropZoom}) translate(${cropOffsetX / cropZoom}px, ${
                        cropOffsetY / cropZoom
                      }px)`,
                    }}
                  />
                  {/* Circular Overlay Mask */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCropMode(false);
                      setRawImageForCrop(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply & Upload Crop</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                placeholder="e.g. Alex Henderson"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-slate-100 dark:bg-[#1E293B]/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                title="System identifier managed by platform authentication"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Designation / Job Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                placeholder="e.g. Chief Executive Officer"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                placeholder="e.g. Executive Management / Engineering"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                Bio & Executive Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                placeholder="Brief professional background, leadership areas or notes..."
              />
            </div>
          </div>

          {/* Security & Access Information */}
          <div className="p-3 bg-teal-50/50 dark:bg-[#0F766E]/10 rounded-xl border border-teal-200/60 dark:border-[#0F766E]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
              <div>
                <span className="font-semibold">Security Clearance: </span>
                <span className="font-mono uppercase text-[#0F766E] dark:text-[#14B8A6]">
                  {currentRole.replace(/_/g, ' ')}
                </span>
                <span className="text-slate-400 block text-[11px]">
                  Tenant ID: {currentUser.tenantId}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] bg-teal-100/70 dark:bg-[#0F766E]/30 px-2 py-0.5 rounded font-bold">
              RLS VERIFIED
            </span>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
