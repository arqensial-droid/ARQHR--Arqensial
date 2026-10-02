import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { Tenant } from '../../types';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  tenant: Tenant;
  onClose: () => void;
  onConfirmDelete: (password: string) => Promise<boolean>;
}

export const DeleteCompanyModal: React.FC<DeleteCompanyModalProps> = ({
  isOpen,
  tenant,
  onClose,
  onConfirmDelete,
}) => {
  const [typedName, setTypedName] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isNameMatched = typedName.trim() === tenant.name.trim();
  const canSubmit = isNameMatched && acknowledged && password.trim().length >= 4 && !isDeleting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const success = await onConfirmDelete(password);
      if (!success) {
        setErrorMessage('Failed to delete company. Please verify your password and credentials.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during company deletion.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border-2 border-rose-500/80 dark:border-rose-600 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Danger Header */}
        <div className="px-6 py-4 border-b border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                <span>Delete Company Workspace</span>
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-mono">
                Danger Zone · Irreversible Action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Prominent Warning Callout */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Warning: This action is irreversible.</span>
            </div>
            <p className="text-xs leading-relaxed">
              All company data for <strong>{tenant.name}</strong> will be permanently deleted from the system:
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-rose-800 dark:text-rose-300 pt-1 font-mono">
              <div>• Company Profile & Stores</div>
              <div>• Employees & User Accounts</div>
              <div>• Products & Inventory</div>
              <div>• Orders & Transactions</div>
              <div>• Attendance & Shift Records</div>
              <div>• Payslips & Tax Documents</div>
              <div>• Uploaded Vault Files</div>
              <div>• Custom Configurations</div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Verification Step 1: Exact Name Match */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-800 dark:text-slate-200">
              1. Type the exact company name <span className="font-mono font-bold text-rose-600 dark:text-rose-400">"{tenant.name}"</span> to confirm:
            </label>
            <input
              type="text"
              required
              disabled={isDeleting}
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              placeholder={tenant.name}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden ${
                typedName.trim() === tenant.name.trim()
                  ? 'border-emerald-500 ring-1 ring-emerald-500'
                  : 'border-slate-300 dark:border-[#1E293B] focus:border-rose-500'
              }`}
            />
          </div>

          {/* Verification Step 2: Acknowledgment Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                disabled={isDeleting}
                checked={acknowledged}
                onChange={e => setAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                I understand this action is irreversible and that all company records, staff accounts, transactions, and settings will be permanently erased.
              </span>
            </label>
          </div>

          {/* Verification Step 3: Account Password */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-semibold text-slate-800 dark:text-slate-200">
              2. Enter your account password to authorize deletion:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isDeleting}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer ${
                canSubmit
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                  : 'bg-rose-400 dark:bg-rose-900/60 cursor-not-allowed opacity-60'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Purging Company Data...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete {tenant.name}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
