import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, CheckCircle2, Shield, Upload } from 'lucide-react';

export const DocumentManagement: React.FC = () => {
  const { documents, currentTenant, addNotification } = useApp();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Company Policies & Document Vault</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Central repository for employee handbooks, compliance policies & legal templates for {currentTenant.name}
          </p>
        </div>

        <button
          onClick={() => addNotification('Document Uploaded', 'New compliance handbook version uploaded.', 'success')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] font-bold text-[#0F766E] dark:text-[#14B8A6] px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 rounded">
                  {doc.category} · {doc.version}
                </span>
                {doc.requiresEsign && (
                  <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> E-Sign Required
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] leading-snug">
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Updated: {doc.updatedDate} · {doc.fileSize} ({doc.fileType})
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-medium">
                {doc.signedCount || 180} Employees Acknowledged
              </span>
              <button
                onClick={() => addNotification('Document Downloaded', `Successfully retrieved copy of ${doc.title}.`, 'info')}
                className="text-[#0F766E] hover:text-[#115E59] dark:text-[#14B8A6] p-1 cursor-pointer transition-colors"
                title="Download Policy"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
