import React from 'react';
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
  CreditCard,
  User,
  X,
  IndianRupee,
  GitMerge,
  Sparkles,
  Settings,
} from 'lucide-react';

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
    tenants,
    employees,
    leaveRequests,
    payrollRuns,
    candidates,
    tickets,
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const activeCandidatesCount = candidates.filter(c => c.stage !== 'Archived' && c.stage !== 'Hired').length;
  const draftPayrollCount = payrollRuns.filter(p => p.status === 'Draft').length;

  const superAdminGroups: NavGroup[] = [
    {
      title: 'SUPER ADMIN SUITE',
      items: [
        { id: 'superadmin_companies', label: 'Company Management', icon: Building, badge: tenants.length > 0 ? tenants.length : undefined },
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
        { id: 'helpdesk', label: 'HR / IT Helpdesk', icon: HelpCircle, badge: openTicketsCount > 0 ? openTicketsCount : undefined },
        { id: 'documents', label: 'Company Policies', icon: FileText },
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
        { id: 'documents', label: 'Document Vault', icon: FileText },
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0F172A] text-[#CBD5E1] flex flex-col shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 border-r border-[#1E293B] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-sm">
              AQ
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#F8FAFC] tracking-wide">ARQENSIAL</span>
              <span className="text-[10px] text-[#14B8A6] font-mono block -mt-0.5">Enterprise Cloud</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {activeGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {group.title}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-[#0F766E] text-white font-semibold shadow-xs shadow-[#0F766E]/20'
                        : 'text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#1E293B]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#14B8A6]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
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

        {/* Bottom Status & Switcher */}
        <div className="p-3 border-t border-[#1E293B] bg-[#020617]/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-[#CBD5E1]">Multi-Tenant RLS</span>
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6]">ARQENSIAL v3.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
