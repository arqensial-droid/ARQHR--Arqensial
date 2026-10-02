import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ImpersonationBanner: React.FC = () => {
  const { impersonatingFromSuperAdmin, stopImpersonation, currentTenant } = useApp();

  if (!impersonatingFromSuperAdmin) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-md sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-200 shrink-0" />
        <span>
          <strong>Super Admin Impersonation Mode:</strong> Currently managing <strong>{currentTenant.name}</strong> as Company Administrator. All actions are logged under audit compliance.
        </span>
      </div>
      <button
        onClick={stopImpersonation}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1 rounded-md transition-colors cursor-pointer shrink-0 ml-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Exit Impersonation</span>
      </button>
    </div>
  );
};
