import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Network,
  Building2,
  Users,
  MapPin,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export const OrgStructureView: React.FC = () => {
  const { departments, teams, branches, employees, currentTenant } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'chart' | 'departments' | 'branches' | 'teams'>('chart');

  // Find root manager / executive
  const rootLeader = employees.find(e => e.id === 'emp-001') || employees[0];
  const directReports = employees.filter(e => e.reportingManagerId === rootLeader.id);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Organization Structure & Hierarchy</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Operational hierarchy, departments, teams, cost centers and branch geo-fencing for {currentTenant.name}
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-lg">
          {[
            { id: 'chart', label: 'Org Chart' },
            { id: 'departments', label: `Departments (${departments.length})` },
            { id: 'branches', label: `Branches (${branches.length})` },
            { id: 'teams', label: `Teams (${teams.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      {activeSubTab === 'chart' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs overflow-x-auto">
          <div className="min-w-[700px] flex flex-col items-center">
            {/* Top Node (Root) */}
            <div className="flex flex-col items-center">
              <div className="w-72 p-4 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white border border-[#14B8A6]/40 shadow-md text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#14B8A6] text-white font-bold text-base flex items-center justify-center ring-4 ring-[#14B8A6]/30 mb-2">
                  {rootLeader.firstName.charAt(0)}{rootLeader.lastName.charAt(0)}
                </div>
                <h3 className="font-bold text-sm text-white">{rootLeader.fullName}</h3>
                <p className="text-[11px] text-teal-100 font-medium">{rootLeader.designation}</p>
                <div className="mt-2 text-[10px] font-mono text-teal-100/90 bg-white/10 py-0.5 px-2 rounded-full inline-block">
                  {rootLeader.empCode} · Executive Office
                </div>
              </div>

              {/* Connecting line */}
              <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700" />
              <div className="w-[500px] h-0.5 bg-slate-300 dark:bg-slate-700 relative">
                <div className="absolute left-0 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="absolute left-1/3 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="absolute left-2/3 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
                <div className="absolute right-0 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
              </div>
            </div>

            {/* Level 2 Nodes (Directors / VPs) */}
            <div className="grid grid-cols-4 gap-4 mt-6 w-full">
              {directReports.map(lead => {
                const subReports = employees.filter(e => e.reportingManagerId === lead.id);
                return (
                  <div key={lead.id} className="flex flex-col items-center">
                    <div className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617]/80 border border-slate-200 dark:border-[#1E293B] text-center shadow-xs">
                      <div className="w-10 h-10 mx-auto rounded-full bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] font-bold text-xs flex items-center justify-center mb-1.5">
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] truncate">
                        {lead.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{lead.designation}</p>
                      <span className="mt-1 text-[10px] font-mono text-slate-400 block">
                        {lead.departmentName}
                      </span>
                    </div>

                    {/* Sub reports under lead */}
                    {subReports.length > 0 && (
                      <div className="w-full flex flex-col items-center mt-2">
                        <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700" />
                        <div className="w-full space-y-2">
                          {subReports.map(sub => (
                            <div
                              key={sub.id}
                              className="p-2.5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] text-center shadow-2xs"
                            >
                              <p className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                                {sub.fullName}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{sub.designation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#14B8A6] px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 rounded">
                  {dept.code}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {dept.employeeCount} Members
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Head: {dept.headEmployeeName}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] text-xs flex justify-between text-slate-600 dark:text-slate-400">
                <span>Annual Budget</span>
                <span className="font-mono font-semibold">${dept.annualBudget.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div
              key={branch.id}
              className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#14B8A6]" />
                  <span>{branch.name}</span>
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-[#1E293B] rounded">
                  {branch.code}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-[#CBD5E1]">{branch.address}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#1E293B] text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Geo-Fence Radius</span>
                  <span className="font-mono font-semibold">{branch.geoRadiusMeters} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">GPS Coordinates</span>
                  <span className="font-mono">{branch.latitude}, {branch.longitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Personnel</span>
                  <span className="font-mono font-semibold text-emerald-600">{branch.activeEmployees} staff</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map(team => (
            <div
              key={team.id}
              className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-2"
            >
              <span className="text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-semibold block">
                {team.departmentName}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{team.name}</h3>
              <p className="text-xs text-slate-500">Lead: {team.leadEmployeeName}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] text-xs font-mono text-slate-500">
                {team.memberCount} Team Engineers
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
