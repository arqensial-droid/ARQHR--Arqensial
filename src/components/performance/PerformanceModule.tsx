import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, TrendingUp, Award, PlusCircle, CheckCircle2 } from 'lucide-react';
import { GoalOKR } from '../../types';

export const PerformanceModule: React.FC = () => {
  const { goals, updateGoalProgress, addGoal, currentTenant } = useApp();
  const [activeLevel, setActiveLevel] = useState<'All' | 'Company' | 'Department' | 'Individual'>('All');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalLevel, setGoalLevel] = useState<GoalOKR['level']>('Individual');

  const filteredGoals = activeLevel === 'All' ? goals : goals.filter(g => g.level === activeLevel);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;
    addGoal({
      title: goalTitle,
      level: goalLevel,
    });
    setShowAddGoal(false);
    setGoalTitle('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Performance, Goals & OKRs</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Quarterly objectives, key results, 360 reviews & appraisal metrics for {currentTenant.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Level filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-lg">
            {(['All', 'Company', 'Department', 'Individual'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeLevel === lvl
                    ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create OKR</span>
          </button>
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {filteredGoals.map(goal => (
          <div
            key={goal.id}
            className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      goal.level === 'Company'
                        ? 'bg-teal-50 text-[#0F766E] dark:bg-[#0F766E]/20 dark:text-[#14B8A6]'
                        : goal.level === 'Department'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {goal.level} Level
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{goal.cycle}</span>
                  <span className="text-xs text-slate-500">· Owner: {goal.ownerName}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC] mt-1">
                  {goal.title}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-[#F8FAFC] block">
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      goal.status === 'Completed' || goal.status === 'On Track'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div className="w-14 text-center font-mono font-bold text-sm text-[#0F766E] dark:text-[#14B8A6]">
                  {goal.progress}%
                </div>
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 dark:bg-[#1E293B] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0F766E] h-full rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>0%</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                    className="text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
                  >
                    +10% Progress
                  </button>
                </div>
                <span>100% Target</span>
              </div>
            </div>

            {/* Key results */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Results ({goal.keyResults.length})
              </span>
              {goal.keyResults.map(kr => (
                <div key={kr.id} className="flex items-center justify-between text-xs py-1 text-slate-700 dark:text-[#CBD5E1]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>{kr.title}</span>
                  </div>
                  <span className="font-mono text-slate-500">{kr.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-5 shadow-2xl border border-slate-200 dark:border-[#1E293B] space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Create New OKR</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Objective Title *</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="e.g. Implement Zero-Trust Identity Across All Services"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Hierarchy Level</label>
                <select
                  value={goalLevel}
                  onChange={e => setGoalLevel(e.target.value as GoalOKR['level'])}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  <option value="Company">Company Strategic</option>
                  <option value="Department">Department Goal</option>
                  <option value="Individual">Individual Objective</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
