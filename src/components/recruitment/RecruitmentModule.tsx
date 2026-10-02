import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidate, JobRequisition } from '../../types';
import {
  Briefcase,
  PlusCircle,
  Star,
  Calendar,
  DollarSign,
  ArrowRight,
  Eye,
  CheckCircle2,
  FileText,
  UserCheck,
  Send,
} from 'lucide-react';

export const RecruitmentModule: React.FC = () => {
  const {
    jobRequisitions,
    candidates,
    addJobRequisition,
    updateCandidateStage,
    currentTenant,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'requisitions' | 'careers'>('pipeline');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // New Requisition form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('Software Engineering');
  const [jobLocation, setJobLocation] = useState('San Francisco, CA');
  const [jobSalary, setJobSalary] = useState('$160,000 - $190,000');
  const [jobPositions, setJobPositions] = useState(1);
  const [jobDescription, setJobDescription] = useState('');

  const stages: Candidate['stage'][] = ['Sourced', 'Screening', 'Interview', 'Offer', 'Hired'];

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;

    addJobRequisition({
      title: jobTitle,
      department: jobDept,
      location: jobLocation,
      salaryRange: jobSalary,
      openPositions: jobPositions,
      description: jobDescription,
    });

    setShowAddJobModal(false);
    setJobTitle('');
    setJobDescription('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Recruitment & Talent Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-cycle ATS, job requisitions, candidate Kanban pipeline & offer letters for {currentTenant.name}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#020617] p-1 rounded-lg border border-transparent dark:border-[#1E293B]">
            {[
              { id: 'pipeline', label: 'Candidate Pipeline' },
              { id: 'requisitions', label: `Open Jobs (${jobRequisitions.length})` },
              { id: 'careers', label: 'Careers Portal Preview' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs border border-slate-200/60 dark:border-[#1E293B]'
                    : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto min-w-[900px] pb-4">
            {stages.map(stage => {
              const stageCandidates = candidates.filter(c => c.stage === stage);
              return (
                <div
                  key={stage}
                  className="bg-slate-50 dark:bg-[#0F172A]/70 rounded-xl p-3 border border-slate-200/80 dark:border-[#1E293B] flex flex-col h-[580px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-[#1E293B]">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#CBD5E1]">
                      {stage}
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#020617] text-slate-600 dark:text-[#CBD5E1]">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                    {stageCandidates.map(cand => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="p-3 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs hover:border-[#0F766E] dark:hover:border-[#14B8A6] transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#0F766E] dark:group-hover:text-[#14B8A6] transition-colors">
                              {cand.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {cand.currentCompany} · {cand.experienceYears} yrs
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[11px]">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span className="font-mono">{cand.rating}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                          {cand.resumeSummary}
                        </p>

                        <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] text-[10px] flex items-center justify-between text-slate-400">
                          <span className="font-mono">Notice: {cand.noticePeriodDays}d</span>
                          <span className="text-[#0F766E] dark:text-[#14B8A6] font-semibold group-hover:underline">
                            Inspect →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'requisitions' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Active Job Requisitions</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
            {jobRequisitions.map(job => (
              <div key={job.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-[#1E293B]/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{job.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-semibold">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {job.department} · {job.location} · {job.openPositions} Positions Open · Manager: {job.hiringManager}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{job.salaryRange}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#0F766E] dark:text-[#14B8A6] block">
                      {job.applicantsCount} Applicants
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Code: {job.jobCode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'careers' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-6 shadow-xs space-y-5">
          <div className="text-center max-w-xl mx-auto space-y-2 py-4">
            <span className="text-[11px] font-mono uppercase text-[#0F766E] dark:text-[#14B8A6] font-bold">Public Portal</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">Work at {currentTenant.name}</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We build scalable distributed technologies for the future. Join our team of innovators and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {jobRequisitions.map(job => (
              <div key={job.id} className="p-4 rounded-xl border border-slate-200 dark:border-[#1E293B] space-y-2.5 bg-white dark:bg-[#020617]/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{job.title}</span>
                  <span className="text-[10px] font-mono text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-[#0F766E]/20 px-2 py-0.5 rounded font-semibold">{job.jobCode}</span>
                </div>
                <p className="text-xs text-slate-500">{job.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1E293B] text-[11px] text-slate-400">
                  <span>{job.location} · {job.salaryRange}</span>
                  <button
                    onClick={() => addNotification('Application Submitted', `Application registered for ${job.title}. Recruitment team notified.`, 'success')}
                    className="text-[#0F766E] dark:text-[#14B8A6] font-semibold hover:underline cursor-pointer"
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Profile Inspector Drawer */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-500">{selectedCandidate.requisitionTitle}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-[#020617] border border-transparent dark:border-[#1E293B]">
              <div>
                <span className="text-slate-400 block text-[11px]">Current Employer</span>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{selectedCandidate.currentCompany}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Experience</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedCandidate.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Notice Period</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedCandidate.noticePeriodDays} Days</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Stage</span>
                <span className="font-semibold text-[#0F766E] dark:text-[#14B8A6]">{selectedCandidate.stage}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Resume Executive Summary</span>
              <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed bg-slate-50 dark:bg-[#020617]/70 p-3 rounded-lg border border-slate-100 dark:border-[#1E293B]">
                {selectedCandidate.resumeSummary}
              </p>
            </div>

            {/* Advance pipeline actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">Move to Next Stage:</span>
              <div className="flex gap-1.5 flex-wrap">
                {stages.map(stage => (
                  <button
                    key={stage}
                    onClick={() => {
                      updateCandidateStage(selectedCandidate.id, stage);
                      setSelectedCandidate(null);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                      selectedCandidate.stage === stage
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#020617] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-transparent dark:border-[#1E293B]'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Requisition Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Publish New Job Requisition</h3>
            <form onSubmit={handleCreateRequisition} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Lead Site Reliability Engineer"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Department</label>
                  <input
                    type="text"
                    value={jobDept}
                    onChange={e => setJobDept(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Location</label>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={e => setJobLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobSalary}
                    onChange={e => setJobSalary(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Open Positions</label>
                  <input
                    type="number"
                    min="1"
                    value={jobPositions}
                    onChange={e => setJobPositions(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] font-mono focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Job Overview</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Outline key responsibilities and expectations..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer transition-all shadow-xs"
                >
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
