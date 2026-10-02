import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Laptop, Smartphone, Monitor, CheckCircle2, AlertTriangle, PlusCircle } from 'lucide-react';

export const AssetManagement: React.FC = () => {
  const { assets, currentTenant } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredAssets = filterCategory === 'All' ? assets : assets.filter(a => a.category === filterCategory);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Laptop className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Hardware Asset Inventory & Allocations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Laptops, monitors, mobile phones & serial tracking for {currentTenant.name}
          </p>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {['All', 'Laptop', 'Monitor', 'Mobile'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 rounded">
                {asset.assetCode}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                  asset.status === 'Allocated'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                }`}
              >
                {asset.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{asset.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{asset.brandModel}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Serial Number</span>
                <span className="font-mono font-medium">{asset.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned To</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {asset.assignedToEmployeeName || 'Unallocated (In Inventory)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware Condition</span>
                <span className="text-emerald-600 font-semibold">{asset.condition}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
