import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, DollarSign } from 'lucide-react';
import { Employee } from '../../types';

interface AddEmployeeModalProps {
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose }) => {
  const { addEmployee, departments, branches, addNotification } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-eng-01');
  const [designation, setDesignation] = useState('');
  const [employmentType, setEmploymentType] = useState<Employee['employmentType']>('Full-Time');
  const [annualCTC, setAnnualCTC] = useState<number>(145000);
  const [location, setLocation] = useState(branches[0]?.name || 'San Francisco Global HQ');
  const [role, setRole] = useState<Employee['role']>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !designation) {
      addNotification('Validation Error', 'Please fill in all mandatory fields.', 'warning');
      return;
    }

    const selectedDept = departments.find(d => d.id === departmentId);

    addEmployee({
      firstName,
      lastName,
      email,
      phone,
      departmentId,
      departmentName: selectedDept?.name || 'Software Engineering',
      designation,
      employmentType,
      location,
      role,
      salaryStructure: {
        annualCTC,
        monthlyGross: Math.round(annualCTC / 12),
        basic: Math.round((annualCTC / 12) * 0.5),
        hra: Math.round((annualCTC / 12) * 0.2),
        specialAllowance: Math.round((annualCTC / 12) * 0.2),
        conveyance: 300,
        performanceBonus: 700,
        pfEmployee: Math.round((annualCTC / 12) * 0.06),
        pfEmployer: Math.round((annualCTC / 12) * 0.06),
        esi: 0,
        professionalTax: 200,
        tdsMonthly: Math.round((annualCTC / 12) * 0.15),
        netMonthly: Math.round((annualCTC / 12) * 0.75),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Enroll New Employee
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane.doe@company.com"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (415) 555-0199"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
                Designation / Job Title *
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder="Senior Backend Engineer"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value as Employee['employmentType'])}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Annual CTC ($)
              </label>
              <input
                type="number"
                value={annualCTC}
                onChange={e => setAnnualCTC(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                System Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Employee['role'])}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="team_leader">Team Leader</option>
                <option value="hr_manager">HR Manager</option>
                <option value="payroll_manager">Payroll Manager</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Assigned Branch Location
            </label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {branches.map(b => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Save & Enroll Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
