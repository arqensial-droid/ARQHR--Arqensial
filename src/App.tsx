import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ImpersonationBanner } from './components/layout/ImpersonationBanner';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { CompanyDashboard } from './components/dashboard/CompanyDashboard';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { OrgStructureView } from './components/organization/OrgStructureView';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { PayrollModule } from './components/payroll/PayrollModule';
import { EmployeeSelfService } from './components/ess/EmployeeSelfService';
import { RecruitmentModule } from './components/recruitment/RecruitmentModule';
import { OnboardingModule } from './components/onboarding/OnboardingModule';
import { ExitManagement } from './components/exit/ExitManagement';
import { PerformanceModule } from './components/performance/PerformanceModule';
import { AssetManagement } from './components/assets/AssetManagement';
import { ExpenseManagement } from './components/expenses/ExpenseManagement';
import { HelpdeskModule } from './components/helpdesk/HelpdeskModule';
import { DocumentManagement } from './components/documents/DocumentManagement';
import { EngagementModule } from './components/engagement/EngagementModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { SecurityModule } from './components/security/SecurityModule';
import { DatabaseExplorer } from './components/database/DatabaseExplorer';
import { SuperAdminPortal } from './components/superadmin/SuperAdminPortal';
import { EnterpriseAuthScreen } from './components/auth/EnterpriseAuthScreen';
import { IndianComplianceModule } from './components/compliance/IndianComplianceModule';
import { WorkflowEngineModule } from './components/workflows/WorkflowEngineModule';
import { AIIntelligenceSuite } from './components/ai/AIIntelligenceSuite';

const MainLayout: React.FC = () => {
  const { activeTab, currentTenant, currentRole, isAuthenticated } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <EnterpriseAuthScreen />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CompanyDashboard />;
      case 'employees':
        return <EmployeeDirectory />;
      case 'org_structure':
        return <OrgStructureView />;
      case 'attendance':
        return <AttendanceModule />;
      case 'leaves':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollModule />;
      case 'compliance_statutory':
        return <IndianComplianceModule />;
      case 'workflows_approval':
        return <WorkflowEngineModule />;
      case 'ai_intelligence':
        return <AIIntelligenceSuite />;
      case 'ess_portal':
        return <EmployeeSelfService />;
      case 'recruitment':
        return <RecruitmentModule />;
      case 'onboarding':
        return <OnboardingModule />;
      case 'exit_management':
        return <ExitManagement />;
      case 'performance':
        return <PerformanceModule />;
      case 'assets':
        return <AssetManagement />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'helpdesk':
        return <HelpdeskModule />;
      case 'documents':
        return <DocumentManagement />;
      case 'engagement':
        return <EngagementModule />;
      case 'reports':
        return <ReportsModule />;
      case 'security':
        return <SecurityModule />;
      case 'database_schema':
        return <DatabaseExplorer />;
      case 'superadmin_companies':
      case 'superadmin_billing':
        return <SuperAdminPortal />;
      default:
        return <CompanyDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] transition-colors font-sans">
      {/* Super Admin Impersonation Notice Bar */}
      <ImpersonationBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Viewport Core */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Top Bar Contract compliant Header */}
          <Header onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />

          {/* Breadcrumb Trail */}
          <div className="px-4 sm:px-6 pt-3 pb-1 text-[11px] text-slate-400 font-mono flex items-center gap-1.5 shrink-0">
            <span className="font-semibold tracking-wider text-slate-500 dark:text-slate-400">ARQENSIAL</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{currentTenant.name}</span>
            <span>/</span>
            <span className="capitalize text-[#0F766E] dark:text-[#14B8A6] font-semibold">
              {activeTab.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Active Screen */}
          <main className="flex-1 pb-16">
            {renderActiveModule()}
          </main>
        </div>
      </div>

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
