import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { EmployeeProfileDrawer } from './EmployeeProfileDrawer';
import { AddEmployeeModal } from './AddEmployeeModal';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowUpDown,
  Building2,
  Mail,
  Eye,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { employees, departments, currentTenant } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Total of {employees.length} enrolled personnel in {currentTenant.name}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID (ARQ-1001), email or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0F766E] shadow-2xs"
          />
        </div>

        {/* Dept filter */}
        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-800 dark:text-[#CBD5E1] cursor-pointer shadow-2xs"
        >
          <option value="all">All Departments ({departments.length})</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Probation">Probation</option>
          <option value="Notice">Notice Period</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No employees matching current filter.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedEmployee(emp)}
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] font-bold text-xs flex items-center justify-center shrink-0">
                          {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-[#F8FAFC] truncate group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6] transition-colors">
                            {emp.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Emp Code */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      {emp.empCode}
                    </td>

                    {/* Department & Role */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{emp.designation}</p>
                      <p className="text-[11px] text-slate-400">{emp.departmentName}</p>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {emp.location}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                      {emp.joiningDate}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {emp.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-2.5 py-1 text-xs font-medium text-[#0F766E] dark:text-[#14B8A6] hover:bg-teal-50 dark:hover:bg-[#1E293B] rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table summary footer */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Showing {filteredEmployees.length} of {employees.length} records</span>
          <span>RLS Filtered · Tenant: {currentTenant.slug}</span>
        </div>
      </div>

      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Add Employee Modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
