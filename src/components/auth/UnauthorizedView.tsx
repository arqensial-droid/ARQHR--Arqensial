import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, Home, Lock, UserCheck } from 'lucide-react';

interface UnauthorizedViewProps {
  requiredRoles?: string[];
  attemptedSection?: string;
  onReturnDashboard?: () => void;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  requiredRoles = ['super_admin', 'company_admin'],
  attemptedSection = 'Restricted Administrative Module',
  onReturnDashboard,
}) => {
  const { currentRole, currentUser, setActiveTab, setAuthModalOpen } = useApp();

  const handleReturn = () => {
    if (onReturnDashboard) {
      onReturnDashboard();
    } else {
      setActiveTab(currentRole === 'employee' ? 'ess_portal' : 'dashboard');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/60">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            HTTP 403 · Access Denied
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            Unauthorized Access Attempt
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            You do not possess the required role permissions to view{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              "{attemptedSection}"
            </span>
            . This section is strictly protected under enterprise Role-Based Access Control (RBAC).
          </p>
        </div>

        {/* User Context Details */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] text-xs space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current User:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentUser?.fullName} ({currentUser?.email})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Your Active Role:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 uppercase font-semibold">
              {currentRole?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-[#1E293B] pt-2">
            <span className="text-slate-500">Required Role(s):</span>
            <span className="font-mono text-[#2563EB] dark:text-[#3B82F6] font-semibold">
              {requiredRoles.map((r) => r.replace(/_/g, ' ')).join(', ')}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReturn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Safe Dashboard</span>
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Switch Authorized Persona</span>
          </button>
        </div>
      </div>
    </div>
  );
};
