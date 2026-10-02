import React, { useState } from 'react';
import { Employee, ActivityTimelineItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { DigitalIdCardModal } from './DigitalIdCardModal';
import { ProfilePictureModal } from './ProfilePictureModal';
import { BankDetailsView } from './BankDetailsView';
import {
  X,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  Camera,
  Shield,
  Clock,
  Laptop,
  Target,
  History,
  Lock,
  ExternalLink,
  User,
  MapPin,
} from 'lucide-react';

interface EmployeeProfileDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  onUpdateEmployee?: (updated: Employee) => void;
}

export type ProfileTab =
  | 'overview'
  | 'employment'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'documents'
  | 'assets'
  | 'performance'
  | 'timeline'
  | 'bank_tax'
  | 'security';

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  employee,
  onClose,
  onUpdateEmployee,
}) => {
  const { currentTenant, attendance, leaveRequests, leaveBalances, assets, payslips, currentRole, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [showIdCardModal, setShowIdCardModal] = useState<boolean>(false);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  if (!employee) return null;

  // Employee-specific records
  const empAttendance = attendance.filter(a => a.employeeId === employee.id);
  const empLeaves = leaveRequests.filter(l => l.employeeId === employee.id);
  const empBalance = leaveBalances[employee.id] || {
    casualLeave: { total: 12, used: 2, balance: 10 },
    sickLeave: { total: 12, used: 1, balance: 11 },
    earnedLeave: { total: 15, used: 3, balance: 12 },
    compOff: { total: 3, used: 0, balance: 3 },
  };
  const empAssets = assets.filter(a => a.assignedToEmployeeId === employee.id);
  const empPayslips = payslips.filter(p => p.employeeId === employee.id);

  const timelineItems: ActivityTimelineItem[] = employee.activityTimeline || [
    { id: '1', timestamp: `${employee.joiningDate} 09:30`, type: 'Joined', title: 'Joined Organization', description: `Official appointment into ${employee.departmentName} department.`, actor: 'HR Operations', badge: 'Onboarded' },
    { id: '2', timestamp: '2024-04-01 10:00', type: 'Salary Revised', title: 'Annual Compensation Revision', description: 'Compensation reviewed and adjusted according to performance tier.', actor: 'Company Admin', badge: 'Appraisal' },
    { id: '3', timestamp: '2026-09-15 11:30', type: 'Asset Assigned', title: 'Hardware Asset Allocated', description: 'Enterprise workstation hardware assigned.', actor: 'IT Support' },
    { id: '4', timestamp: '2026-09-28 17:00', type: 'Performance Review', title: 'H1 Appraisal Review Completed', description: 'Performance cycle evaluation logged with final score 4.7/5.0.', actor: 'Management' },
  ];

  const handleAvatarSaved = (newUrl: string) => {
    const updated = { ...employee, avatarUrl: newUrl };
    if (onUpdateEmployee) onUpdateEmployee(updated);
  };

  const handleBankUpdated = (updatedBank: Employee['bankDetails']) => {
    const updated = { ...employee, bankDetails: updatedBank };
    if (onUpdateEmployee) onUpdateEmployee(updated);
  };

  const tabs: Array<{ id: ProfileTab; label: string; icon: any; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: Calendar, count: empLeaves.length },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, count: empPayslips.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: employee.documents.length },
    { id: 'assets', label: 'Assets', icon: Laptop, count: empAssets.length },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'timeline', label: 'Timeline', icon: History },
    { id: 'bank_tax', label: 'Bank & Tax', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fade-in">
        <div className="w-full max-w-3xl bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col">
          {/* Header Hero Area */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative group">
                {employee.avatarUrl ? (
                  <img
                    src={employee.avatarUrl}
                    alt={employee.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#0F766E]/20 shadow-md border-2 border-white dark:border-slate-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-bold text-2xl flex items-center justify-center shadow-md">
                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-white hover:bg-[#0F766E] shadow-sm transition cursor-pointer"
                  title="Upload / Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {employee.fullName}
                  </h2>
                  <span className="font-mono text-xs text-[#0F766E] dark:text-[#14B8A6] font-semibold px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 rounded">
                    {employee.empCode}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                    {employee.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  {employee.designation} · {employee.departmentName}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {employee.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {employee.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {employee.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowIdCardModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6] bg-[#0F766E]/10 dark:bg-[#0F766E]/20 hover:bg-[#0F766E]/20 rounded-lg transition cursor-pointer"
                title="View Official Digital ID Card"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Digital ID</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clean 11 Tabs Scrollable Bar */}
          <div className="flex items-center gap-1 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] overflow-x-auto text-xs font-medium">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap cursor-pointer transition ${
                    isActive
                      ? 'border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6] font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[10px] font-mono px-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* At-a-glance card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reporting Manager</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{employee.reportingManagerName || 'Executive CEO'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Employment Type</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{employee.employmentType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Joining Date</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{employee.joiningDate}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Blood Group</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{employee.bloodGroup || 'O+'}</span>
                  </div>
                </div>

                {/* Bank Preview */}
                <BankDetailsView employee={employee} onUpdateBank={handleBankUpdated} />

                {/* Skills */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-2">Technical Skills & Domain Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {employee.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EMPLOYMENT */}
            {activeTab === 'employment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Official Designation</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{employee.designation}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Department</span>
                      <span className="text-slate-800 dark:text-slate-200">{employee.departmentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Work Location / Branch</span>
                      <span className="text-slate-800 dark:text-slate-200">{employee.location}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Assigned Shift</span>
                      <span className="text-slate-800 dark:text-slate-200">{employee.workShift}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Reporting Hierarchy</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.reportingManagerName || 'Executive CEO'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Role Level Access</span>
                      <span className="font-mono text-[#0F766E] uppercase font-semibold">{employee.role.replace(/_/g, ' ')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Probation / Notice Status</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">Confirmed Permanent Staff</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ATTENDANCE */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Recent Punch Logs ({empAttendance.length} records)</h4>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {empAttendance.slice(0, 10).map(att => (
                    <div key={att.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{att.date}</span>
                        <div className="text-[11px] text-slate-400 font-mono">
                          In: {att.checkInTime} · Out: {att.checkOutTime || '--'} · {att.durationHours}h
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          att.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                          att.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {att.status}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{att.checkInMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LEAVE */}
            {activeTab === 'leave' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Casual</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{empBalance.casualLeave.balance} Days</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Sick</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{empBalance.sickLeave.balance} Days</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Earned</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{empBalance.earnedLeave.balance} Days</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Comp Off</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{empBalance.compOff.balance} Days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Leave History</h4>
                  {empLeaves.map(l => (
                    <div key={l.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{l.leaveType}</span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{l.startDate} to {l.endDate} ({l.daysCount} days)</div>
                        <p className="text-[11px] text-slate-500 mt-1">{l.reason}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                        l.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PAYROLL */}
            {activeTab === 'payroll' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Annual Compensation (CTC)</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {currentTenant.currencySymbol || '₹'}{employee.salaryStructure.annualCTC.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Monthly Gross: {currentTenant.currencySymbol || '₹'}{employee.salaryStructure.monthlyGross.toLocaleString()} · Monthly Net: {currentTenant.currencySymbol || '₹'}{employee.salaryStructure.netMonthly.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Generated Payslips</h4>
                  {empPayslips.map(ps => (
                    <div key={ps.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{ps.month}</span>
                        <div className="text-[11px] text-slate-400 font-mono">Payslip ID: {ps.payslipNumber || ps.id}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{currentTenant.currencySymbol || '₹'}{ps.netPayable.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-600 block">{ps.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-2">
                {employee.documents.map(doc => (
                  <div key={doc.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">{doc.type} · {doc.fileSize}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">Verified</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: ASSETS */}
            {activeTab === 'assets' && (
              <div className="space-y-2">
                {empAssets.length === 0 ? (
                  <p className="text-slate-400 py-6 text-center">No hardware assets currently allocated.</p>
                ) : (
                  empAssets.map(asset => (
                    <div key={asset.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-[#0F766E]" />
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{asset.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{asset.brandModel} · S/N: {asset.serialNumber}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{asset.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: PERFORMANCE */}
            {activeTab === 'performance' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Latest Appraisal Score</span>
                    <div className="text-xl font-bold font-mono text-[#0F766E] mt-0.5">4.8 / 5.0</div>
                    <span className="text-[11px] text-slate-500">Tier 1 · Exceeds Performance Expectations</span>
                  </div>
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            )}

            {/* TAB: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Personnel Activity & Career Milestones</h4>
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                  {timelineItems.map(item => (
                    <div key={item.id} className="relative group">
                      <span className="absolute -left-[31px] top-0.5 w-3 h-3 rounded-full bg-[#0F766E] ring-4 ring-white dark:ring-[#0F172A]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">{item.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Logged by: {item.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BANK & TAX */}
            {activeTab === 'bank_tax' && (
              <div className="space-y-4">
                <BankDetailsView employee={employee} onUpdateBank={handleBankUpdated} />

                {/* Country Statutory Identifiers */}
                <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">Statutory Regulatory Identifiers</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Primary Tax ID (PAN / SSN / EID)</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{employee.statutoryData?.pan || employee.bankDetails?.panNumber || 'Configured'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Statutory Social Security / UAN / Labour</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{employee.statutoryData?.uan || employee.bankDetails?.uanNumber || 'Configured'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Enforced</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Security Clearance</span>
                    <span className="font-mono font-medium">{employee.role.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Row Level Security</span>
                    <span className="text-emerald-600 font-medium">Tenant Isolated</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Digital ID Card Modal */}
      {showIdCardModal && (
        <DigitalIdCardModal
          employee={employee}
          tenant={currentTenant}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {/* Profile Picture Modal */}
      {showPhotoModal && (
        <ProfilePictureModal
          employee={employee}
          tenantId={currentTenant.id}
          onSaveAvatar={handleAvatarSaved}
          onClose={() => setShowPhotoModal(false)}
        />
      )}
    </>
  );
};
