import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Network,
  Clock,
  CalendarDays,
  Banknote,
  Receipt,
  Briefcase,
  UserCheck,
  Target,
  LogOut,
  Laptop,
  HelpCircle,
  FileText,
  Radio,
  BarChart3,
  Shield,
  Database,
  Building,
  User,
  X,
  IndianRupee,
  GitMerge,
  Sparkles,
  Settings,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserProfileModal } from '../profile/UserProfileModal';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    currentTenant,
    currentUser,
    tenants,
    employees,
    leaveRequests,
    payrollRuns,
    candidates,
    tickets,
    managedFiles,
    logout,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('arqhr_sidebar_collapsed') === 'true';
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('arqhr_sidebar_collapsed', String(next));
      return next;
    });
  };

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const activeCandidatesCount = candidates.filter((c) => c.stage !== 'Archived' && c.stage !== 'Hired').length;
  const draftPayrollCount = payrollRuns.filter((p) => p.status === 'Draft').length;

  const superAdminGroups: NavGroup[] = [
    {
      title: 'SUPER ADMIN SUITE',
      items: [
        { id: 'superadmin_companies', label: 'Company Management', icon: Building, badge: tenants.length > 0 ? tenants.length : undefined },
        { id: 'documents', label: 'File & Media Vault', icon: FolderArchive, badge: managedFiles.length > 0 ? managedFiles.length : undefined },
        { id: 'company_settings', label: 'Company Settings', icon: Settings },
        { id: 'reports', label: 'Global Analytics', icon: BarChart3 },
        { id: 'security', label: 'Platform Audit Logs', icon: Shield },
        { id: 'database_schema', label: 'PostgreSQL Schema & RLS', icon: Database },
      ],
    },
  ];

  const employeeGroups: NavGroup[] = [
    {
      title: 'EMPLOYEE SELF SERVICE',
      items: [
        { id: 'ess_portal', label: 'My ESS Dashboard', icon: User },
        { id: 'attendance', label: 'Attendance & Clock In', icon: Clock },
        { id: 'leaves', label: 'My Leaves & Holidays', icon: CalendarDays },
        { id: 'payroll', label: 'My Payslips & Tax', icon: Banknote },
        { id: 'expenses', label: 'Expense Claims', icon: Receipt },
        { id: 'helpdesk', label: 'Helpdesk Tickets', icon: HelpCircle, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
        { id: 'documents', label: 'File & Document Vault', icon: FolderArchive },
        { id: 'engagement', label: 'Company Pulse & Kudos', icon: Radio },
      ],
    },
  ];

  const standardGroups: NavGroup[] = [
    {
      title: 'CORE WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'employees', label: 'Employee Directory', icon: Users, badge: employees.length },
        { id: 'org_structure', label: 'Org Chart & Hierarchy', icon: Network },
      ],
    },
    {
      title: 'TIME & ATTENDANCE',
      items: [
        { id: 'attendance', label: 'Attendance & Shifts', icon: Clock },
        { id: 'leaves', label: 'Leave Management', icon: CalendarDays, badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined },
      ],
    },
    {
      title: 'COMPENSATION & FINANCE',
      items: [
        { id: 'payroll', label: 'Payroll & Form 16', icon: Banknote, badge: draftPayrollCount > 0 ? 'Run' : undefined },
        { id: 'compliance_statutory', label: 'India Statutory & ECR', icon: IndianRupee },
        { id: 'expenses', label: 'Expense Claims', icon: Receipt },
      ],
    },
    {
      title: 'TALENT & LIFECYCLE',
      items: [
        { id: 'recruitment', label: 'Recruitment Pipeline', icon: Briefcase, badge: activeCandidatesCount > 0 ? activeCandidatesCount : undefined },
        { id: 'onboarding', label: 'Digital Onboarding', icon: UserCheck },
        { id: 'workflows_approval', label: 'Workflow Approvals', icon: GitMerge },
        { id: 'performance', label: 'Performance & OKRs', icon: Target },
        { id: 'exit_management', label: 'Exit & Clearances', icon: LogOut },
      ],
    },
    {
      title: 'ENTERPRISE OPERATIONS',
      items: [
        { id: 'ai_intelligence', label: 'AI Intelligence Suite', icon: Sparkles },
        { id: 'assets', label: 'Hardware Assets', icon: Laptop },
        { id: 'helpdesk', label: 'Helpdesk Tickets', icon: HelpCircle, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
        { id: 'documents', label: 'File & Media Vault', icon: FolderArchive, badge: managedFiles.length > 0 ? managedFiles.length : undefined },
        { id: 'engagement', label: 'Company Pulse & Kudos', icon: Radio },
      ],
    },
    {
      title: 'GOVERNANCE & DATA',
      items: [
        { id: 'company_settings', label: 'Company Settings', icon: Settings },
        { id: 'reports', label: 'Enterprise Reports', icon: BarChart3 },
        { id: 'security', label: 'Security & Audit Logs', icon: Shield },
        { id: 'database_schema', label: 'Database & RLS Schema', icon: Database },
      ],
    },
  ];

  const activeGroups =
    currentRole === 'super_admin'
      ? superAdminGroups
      : currentRole === 'employee'
      ? employeeGroups
      : standardGroups;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen bg-[#0F172A] text-[#CBD5E1] flex flex-col shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 border-r border-[#1E293B] shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Dynamic Company Logo or Fallback to ARQENSIAL Placeholder */}
            {currentTenant.logo ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-white/10 flex items-center justify-center shrink-0 p-0.5 shadow-xs">
                <img
                  src={currentTenant.logo}
                  alt={currentTenant.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-sm shrink-0">
                AQ
              </div>
            )}

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-extrabold text-sm text-[#F8FAFC] tracking-wide truncate block">
                  {currentRole === 'super_admin' ? 'ARQENSIAL' : currentTenant.name || 'ARQENSIAL'}
                </span>
                <span className="text-[10px] text-[#3B82F6] font-mono block -mt-0.5 truncate">
                  {currentRole === 'super_admin' ? 'Super Admin Portal' : 'Enterprise Cloud'}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {activeGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {group.title}
                </div>
              ) : (
                <div className="h-2" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-[#2563EB] text-white font-semibold shadow-xs shadow-blue-500/20'
                        : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E293B]/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#3B82F6]'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#1E293B] text-[#CBD5E1] group-hover:bg-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile at Bottom */}
        <div className="p-3 border-t border-[#1E293B] bg-[#020617]/50">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left hover:opacity-85 transition-opacity flex-1"
              title="Open Profile Settings"
            >
              {/* Profile Photo or Fallback Initials */}
              {currentUser?.avatarUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2563EB] shrink-0">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser?.firstName?.charAt(0) || 'U'}
                  {currentUser?.lastName?.charAt(0) || ''}
                </div>
              )}

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs text-white truncate block">
                    {currentUser?.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">
                    {currentRole?.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};
