import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Laptop,
  FileText,
  Gift,
  Users,
} from 'lucide-react';

export const OnboardingModule: React.FC = () => {
  const { onboardingTasks, completeOnboardingTask, currentTenant } = useApp();

  const completedCount = onboardingTasks.filter(t => t.status === 'Completed').length;
  const progressPercent = Math.round((completedCount / Math.max(1, onboardingTasks.length)) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Digital Onboarding & Induction</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Pre-boarding workflows, e-signatures, hardware allocation & welcome checklists for {currentTenant.name}
          </p>
        </div>

        {/* Overall progress pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] px-4 py-2 rounded-xl shadow-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Onboarding Velocity</span>
            <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] font-mono">{completedCount} of {onboardingTasks.length} Completed</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-[#0F766E]/20 flex items-center justify-center font-mono font-bold text-xs text-[#0F766E] dark:text-[#14B8A6]">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Task Checklist Group */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Active Onboarding Candidate Tasks</h2>
          <span className="text-xs font-mono text-slate-400">Candidate: Maya Lin-Kowalski (Staff Distributed Systems Engineer)</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
          {onboardingTasks.map(task => {
            const isDone = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => completeOnboardingTask(task.id)}
                    className={`mt-0.5 p-1 rounded-md transition-colors cursor-pointer ${
                      isDone
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                        : 'text-slate-400 hover:text-[#0F766E] bg-slate-100 dark:bg-[#1E293B]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <h3 className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                      <span>Category: {task.category}</span>
                      <span>·</span>
                      <span>Assigned to: {task.assignedTo}</span>
                      <span>·</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
