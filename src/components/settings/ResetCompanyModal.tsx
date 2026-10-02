import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Tenant } from '../../types';

interface ResetCompanyModalProps {
  isOpen: boolean;
  tenant: Tenant;
  onClose: () => void;
  onConfirmReset: (password: string) => Promise<boolean>;
}

export const ResetCompanyModal: React.FC<ResetCompanyModalProps> = ({
  isOpen,
  tenant,
  onClose,
  onConfirmReset,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSubmit = acknowledged && password.trim().length >= 4 && !isResetting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsResetting(true);
    setErrorMessage(null);

    try {
      const success = await onConfirmReset(password);
      if (!success) {
        setErrorMessage('Failed to reset company data. Please verify your password and credentials.');
        setIsResetting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during company data reset.');
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border-2 border-amber-500/80 dark:border-amber-600 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Reset Header */}
        <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-900/60 bg-amber-50/90 dark:bg-amber-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                <span>Reset Company Business Data</span>
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-mono">
                Clean Slate · Preserves Company Account & Owner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isResetting}
            className="p-1 rounded-lg text-amber-500 hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Explanation Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Purpose: Keep account active, reset business operations</span>
            </div>
            <p className="text-xs leading-relaxed">
              This action resets <strong>{tenant.name}</strong> to a fresh clean state. You will be redirected to the <strong>Fresh Start Wizard</strong> to configure your store and initial staff.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 space-y-1">
                <span className="font-bold block uppercase text-[10px]">What Will Be Deleted:</span>
                <div>• Products & Orders</div>
                <div>• Customers & Inventory</div>
                <div>• Attendance & Shifts</div>
                <div>• Leave Requests & Payslips</div>
                <div>• Expenses & Tickets</div>
                <div>• Analytics & Reports</div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold block uppercase text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>What Will Be Kept:</span>
                </span>
                <div>• Company Profile & Code</div>
                <div>• Primary Owner Account</div>
                <div>• Subscription / License</div>
                <div>• Login Credentials</div>
                <div>• Security Settings</div>
                <div>• Audit Trail Records</div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {errorMessage}
            </div>
          )}

          {/* Verification Step 1: Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                disabled={isResetting}
                checked={acknowledged}
                onChange={e => setAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                I confirm that I want to purge all operational business data, transactions, and staff records while retaining my primary company owner account.
              </span>
            </label>
          </div>

          {/* Verification Step 2: Account Password */}
          <div className="space-y-1.5 pt-1">
            <label className="block font-semibold text-slate-800 dark:text-slate-200">
              Enter account password to authorize reset:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isResetting}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
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
              disabled={isResetting}
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
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-98'
                  : 'bg-amber-400 dark:bg-amber-900/60 cursor-not-allowed opacity-60'
              }`}
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting Business Data...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Company Data Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
