import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { workflowService } from '../../services/workflowService';
import { SalaryRevisionRecord, PromotionRecord, WorkflowRule } from '../../types';
import {
  GitMerge,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  LogOut,
  UserCheck,
  Shield,
  Layers,
  FileCheck,
} from 'lucide-react';

export const WorkflowEngineModule: React.FC = () => {
  const { currentTenant, employees, currentUser, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'approvals' | 'rules' | 'arrears'>('approvals');

  // Sample pending salary revision in state
  const [revisions, setRevisions] = useState<SalaryRevisionRecord[]>([
    {
      id: 'rev-001',
      tenantId: currentTenant.id,
      employeeId: 'emp-002',
      employeeName: 'Priya Sharma',
      empCode: 'EMP-002',
      currentCTC: 1200000,
      proposedCTC: 1450000,
      percentageHike: 20.83,
      effectiveDate: '2026-08-01',
      reason: 'Annual Appraisal',
      arrearsApplicable: true,
      arrearsAmount: 41666,
      status: 'Pending_HR',
      approvals: [
        {
          step: 'Reporting Manager Review',
          approverName: 'Marcus Vance',
          action: 'Approved',
          timestamp: '2026-09-28T10:15:00Z',
          remarks: 'Exceptional performance in leading backend architecture migration.',
        },
      ],
    },
    {
      id: 'rev-002',
      tenantId: currentTenant.id,
      employeeId: 'emp-006',
      employeeName: 'Sarah Jenkins',
      empCode: 'EMP-006',
      currentCTC: 750000,
      proposedCTC: 900000,
      percentageHike: 20.0,
      effectiveDate: '2026-09-01',
      reason: 'Promotion',
      arrearsApplicable: true,
      arrearsAmount: 12500,
      status: 'Pending_Manager',
      approvals: [],
    },
  ]);

  const rules = workflowService.getDefaultRules(currentTenant.id);

  const handleApproveRevision = (revId: string) => {
    setRevisions(prev =>
      prev.map(r => {
        if (r.id === revId) {
          const nextStatus = r.status === 'Pending_Manager' ? 'Pending_HR' : 'Approved';
          return {
            ...r,
            status: nextStatus,
            approvals: [
              ...r.approvals,
              {
                step: r.status === 'Pending_Manager' ? 'Reporting Manager Review' : 'HR Compensation Verification',
                approverName: currentUser?.fullName || 'Current User',
                action: 'Approved',
                timestamp: new Date().toISOString(),
                remarks: 'Approved by workflow engine with SLA compliance.',
              },
            ],
          };
        }
        return r;
      })
    );
    addNotification('Workflow Approved', 'Workflow step approved and transitioned to next stage', 'success');
  };

  const handleRejectRevision = (revId: string) => {
    setRevisions(prev =>
      prev.map(r => (r.id === revId ? { ...r, status: 'Rejected' as const } : r))
    );
    addNotification('Workflow Rejected', 'Workflow step marked as Rejected', 'warning');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6]">
              ARQENSIAL Lifecycle & Approval Engine
            </span>
            <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-mono">
              BPMN 2.0 Compliance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] mt-1">
            Workflows & Multi-Tier Approvals
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Automate onboarding handshakes, promotions, salary revisions with retroactive arrears, and exit clearances.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-[#020617] p-1 rounded-xl gap-1 border border-transparent dark:border-[#1E293B]">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending Approvals ({revisions.filter(r => r.status.startsWith('Pending')).length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Workflow Definitions ({rules.length})
          </button>
        </div>
      </div>

      {/* 1. APPROVALS QUEUE TAB */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {revisions.map(rev => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E293B] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-base">
                      {rev.employeeName} ({rev.empCode}) — Salary Revision
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">
                      Reason: <strong className="text-slate-700 dark:text-[#F8FAFC]">{rev.reason}</strong> • Effective Date: {rev.effectiveDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                    rev.status === 'Approved'
                      ? 'bg-emerald-100 text-[#22C55E] dark:bg-emerald-950 dark:text-emerald-300'
                      : rev.status === 'Rejected'
                      ? 'bg-rose-100 text-[#EF4444] dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-[#F59E0B] dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {rev.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Current CTC</span>
                  <div className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                    ₹{rev.currentCTC.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Proposed CTC</span>
                  <div className="text-base font-bold text-[#0F766E] dark:text-[#14B8A6]">
                    ₹{rev.proposedCTC.toLocaleString()} (+{rev.percentageHike}%)
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Retroactive Arrears</span>
                  <div className="text-base font-bold text-[#22C55E]">
                    ₹{rev.arrearsAmount.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Approval Steps Completed</span>
                  <div className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {rev.approvals.length} / 3
                  </div>
                </div>
              </div>

              {/* Approval Trail */}
              {rev.approvals.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block">
                    Audit Trail & Sign-offs
                  </span>
                  <div className="space-y-1.5">
                    {rev.approvals.map((app, i) => (
                      <div key={i} className="text-xs bg-slate-50 dark:bg-[#1E293B]/40 p-2.5 rounded-lg flex items-center justify-between border border-transparent dark:border-[#1E293B]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                          <span className="font-semibold text-slate-800 dark:text-[#F8FAFC]">{app.step}</span>
                          <span className="text-slate-500 dark:text-[#CBD5E1]">by {app.approverName}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{new Date(app.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {rev.status.startsWith('Pending') && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
                  <button
                    onClick={() => handleRejectRevision(rev.id)}
                    className="px-4 py-2 border border-[#EF4444]/40 text-[#EF4444] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApproveRevision(rev.id)}
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-[#0F766E]/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Sign
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. WORKFLOW RULES TAB */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                    <GitMerge className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
                    {rule.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">{rule.description}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] text-xs font-bold rounded-full">
                  ACTIVE
                </span>
              </div>

              {/* Steps visual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {rule.approvalSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-[#020617] rounded-xl border border-slate-200 dark:border-[#1E293B] relative"
                  >
                    <div className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] font-bold uppercase">
                      Step {step.stepNumber} (SLA: {step.slaHours}h)
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                      {step.stepName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">
                      Role: <strong className="capitalize">{step.approverRole.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
