import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import {
  Sparkles,
  Bot,
  Brain,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Send,
  HelpCircle,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AIIntelligenceSuite: React.FC = () => {
  const { candidates, jobRequisitions, employees, attendance, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'screening' | 'attrition' | 'anomalies' | 'assistant'>('screening');

  // Candidate screening selection
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string>(jobRequisitions[0]?.id || '');

  // AI Assistant Chat state
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; policy?: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your ARQENSIAL AI Assistant. Ask me anything about company leave policies, PF/ESIC statutory compliance, TDS Old vs New tax regimes, or notice period rules.',
      policy: 'ARQENSIAL Enterprise Knowledge Base v2.4',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];
  const activeRequisition = jobRequisitions.find(j => j.id === selectedRequisitionId) || jobRequisitions[0];

  const screeningScore = activeCandidate && activeRequisition
    ? aiService.screenCandidateResume(activeCandidate, activeRequisition)
    : null;

  const attritionProfiles = employees.map(emp => aiService.predictAttritionRisk(emp, attendance));
  const payrollAnomalies = aiService.detectPayrollAnomalies(employees, attendance);

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: query }]);

    setTimeout(() => {
      const res = aiService.queryHRAssistant(query);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          policy: res.sourcePolicy,
        },
      ]);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> ARQENSIAL AI Intelligence Core
            </span>
            <span className="text-xs text-slate-500 dark:text-[#CBD5E1] font-mono">
              Enterprise Neural Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] mt-1">
            Predictive HR & Cognitive Automation
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            AI Resume screening, attrition risk radar, payroll anomaly detector, and compliance chatbot.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 dark:bg-[#020617] p-1 rounded-xl gap-1 border border-transparent dark:border-[#1E293B]">
          <button
            onClick={() => setActiveTab('screening')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'screening'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resume Screening
          </button>
          <button
            onClick={() => setActiveTab('attrition')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'attrition'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Attrition Radar
          </button>
          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'anomalies'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Payroll Anomalies ({payrollAnomalies.length})
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            AI Policy Assistant
          </button>
        </div>
      </div>

      {/* 1. RESUME SCREENING TAB */}
      {activeTab === 'screening' && screeningScore && activeCandidate && activeRequisition && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Select Candidate & Requisition</h3>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Target Role</label>
              <select
                value={selectedRequisitionId}
                onChange={e => setSelectedRequisitionId(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] outline-hidden"
              >
                {jobRequisitions.map(j => (
                  <option key={j.id} value={j.id}>{j.title} ({j.jobCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Applicant</label>
              <select
                value={selectedCandidateId}
                onChange={e => setSelectedCandidateId(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] outline-hidden"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.experienceYears}y exp</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#020617] rounded-xl text-xs space-y-2 border border-slate-200 dark:border-[#1E293B]">
              <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Applicant Summary</span>
              <p className="text-slate-600 dark:text-[#CBD5E1]">{activeCandidate.resumeSummary}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-[#1E293B] text-[11px] text-slate-400">
                Notice: {activeCandidate.noticePeriodDays} days • Exp: {activeCandidate.experienceYears} years
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  AI Fit Assessment: {screeningScore.candidateName}
                </h3>
                <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">
                  Benchmarked against {activeRequisition.title}
                </span>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                screeningScore.recommendation === 'Strong Hire'
                  ? 'bg-emerald-100 text-[#22C55E] dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-[#F59E0B] dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {screeningScore.recommendation}
              </span>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0F766E]/15 rounded-xl text-center border border-[#0F766E]/30">
                <span className="text-xs font-semibold text-[#0F766E] dark:text-[#14B8A6]">Overall Match</span>
                <div className="text-3xl font-black text-[#0F766E] dark:text-[#14B8A6] mt-1">
                  {screeningScore.overallMatchScore}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl text-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1]">Skills Match</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                  {screeningScore.skillsMatchScore}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl text-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1]">Experience Match</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                  {screeningScore.experienceMatchScore}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-[#1E293B]/50 rounded-xl text-center">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1]">Education Match</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] mt-1">
                  {screeningScore.educationMatchScore}%
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 bg-[#0F766E]/10 border border-[#0F766E]/30 rounded-xl text-xs text-slate-800 dark:text-[#CBD5E1] leading-relaxed">
              <strong className="block mb-1 font-semibold text-[#0F766E] dark:text-[#14B8A6]">AI Synthesis:</strong>
              {screeningScore.aiSummary}
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#22C55E]">Key Strengths Identified</span>
                <div className="flex flex-wrap gap-1.5">
                  {screeningScore.keyStrengths.map((str, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-[#22C55E] text-xs rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                      ✓ {str}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#EF4444]">Missing Keywords / Gaps</span>
                <div className="flex flex-wrap gap-1.5">
                  {screeningScore.missingKeywords.map((gap, i) => (
                    <span key={i} className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-[#EF4444] text-xs rounded-lg border border-rose-200 dark:border-rose-800/60">
                      ✕ {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTRITION RADAR TAB */}
      {activeTab === 'attrition' && (
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-slate-200 dark:border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Predictive Employee Flight Risk Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
                Machine learning model evaluating tenure cliffs, attendance irregularities, comp ratios, and time in role.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
            {attritionProfiles.map(prof => (
              <div key={prof.employeeId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">
                      {prof.employeeName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-[#CBD5E1]">({prof.department})</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      prof.riskLevel === 'Critical'
                        ? 'bg-rose-100 text-[#EF4444] dark:bg-rose-950 dark:text-rose-300'
                        : prof.riskLevel === 'High'
                        ? 'bg-amber-100 text-[#F59E0B] dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-[#22C55E] dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {prof.riskLevel} Risk ({prof.riskScore}%)
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-[#CBD5E1]">
                    Tenure: <strong>{prof.tenureMonths} Months</strong> • Drivers: {prof.topDrivers.join(' • ')}
                  </div>
                </div>

                <div className="text-xs bg-slate-50 dark:bg-[#1E293B]/60 p-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] md:max-w-xs">
                  <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6] block mb-0.5">
                    Recommended Retention Action:
                  </span>
                  <span className="text-slate-700 dark:text-[#CBD5E1]">{prof.recommendedRetentionActions[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PAYROLL ANOMALIES TAB */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          {payrollAnomalies.length > 0 ? (
            payrollAnomalies.map(anom => (
              <div
                key={anom.id}
                className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#EF4444] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">
                      {anom.anomalyType} — {anom.employeeName}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-[#EF4444] dark:bg-rose-950 dark:text-rose-300">
                      {anom.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1]">{anom.description}</p>
                  <div className="text-xs font-mono text-[#0F766E] dark:text-[#14B8A6] pt-1">
                    Suggested Resolution: {anom.suggestedResolution}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-[#0F172A] p-12 text-center text-slate-400 dark:text-slate-500 rounded-2xl border border-slate-200 dark:border-[#1E293B]">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto mb-2" />
              All payroll records verified. Zero variance anomalies detected for current pay cycle.
            </div>
          )}
        </div>
      )}

      {/* 4. AI HR ASSISTANT CHAT TAB */}
      {activeTab === 'assistant' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] flex flex-col h-[520px]">
          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0F766E] text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-[#020617] text-slate-800 dark:text-[#CBD5E1] rounded-bl-xs border border-transparent dark:border-[#1E293B]'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.policy && (
                    <span className="block mt-2 pt-1 border-t border-slate-200 dark:border-[#1E293B] text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Source: {m.policy}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#020617] border-t border-slate-100 dark:border-[#1E293B] flex gap-2 overflow-x-auto text-[11px]">
            {['Leave balance rules', 'New vs Old Tax Regime', 'Gratuity formula', 'Notice period rules'].map(p => (
              <button
                key={p}
                onClick={() => setInputQuery(p)}
                className="px-2.5 py-1 bg-white dark:bg-[#1E293B] hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-[#1E293B] rounded-lg text-slate-700 dark:text-[#CBD5E1] whitespace-nowrap cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendQuery} className="p-3 border-t border-slate-200 dark:border-[#1E293B] flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask a policy or statutory compliance question..."
              className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-[#020617] border border-slate-300 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-[#F8FAFC] outline-hidden focus:ring-2 focus:ring-[#0F766E]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-[#0F766E]/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
