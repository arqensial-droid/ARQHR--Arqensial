import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpdeskTicket } from '../../types';
import { HelpCircle, PlusCircle, MessageSquare, Send, Clock, CheckCircle2 } from 'lucide-react';

export const HelpdeskModule: React.FC = () => {
  const { tickets, createTicket, replyTicket, currentTenant, currentUser } = useApp();
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<HelpdeskTicket['category']>('IT Support');
  const [priority, setPriority] = useState<HelpdeskTicket['priority']>('Medium');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    createTicket({
      subject,
      category,
      priority,
    });

    setShowCreateModal(false);
    setSubject('');
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket && replyText) {
      replyTicket(selectedTicket.id, replyText);
      setReplyText('');
      // update local preview
      setSelectedTicket({
        ...selectedTicket,
        thread: [
          ...selectedTicket.thread,
          {
            author: currentUser.fullName,
            text: replyText,
            timestamp: 'Just now',
            isStaff: true,
          },
        ],
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Enterprise Helpdesk & Support SLA</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Internal ticketing for HR operations, IT provisioning & payroll clarifications for {currentTenant.name}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* Grid of Tickets & Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-[#1E293B]/60">
          <div className="p-3.5 bg-slate-50 dark:bg-[#020617] font-bold text-xs text-slate-700 dark:text-[#CBD5E1]">
            Open Support Inquiries ({tickets.length})
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E293B]/60">
            {tickets.map(tkt => (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicket(tkt)}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors cursor-pointer space-y-1.5 ${
                  selectedTicket?.id === tkt.id ? 'bg-teal-50/50 dark:bg-[#0F766E]/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-bold">
                    {tkt.ticketCode}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      tkt.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-[#1E293B] dark:text-[#CBD5E1]'
                    }`}
                  >
                    {tkt.priority}
                  </span>
                </div>

                <h4 className="font-semibold text-xs text-slate-900 dark:text-[#F8FAFC] line-clamp-1">
                  {tkt.subject}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{tkt.category}</span>
                  <span className="flex items-center gap-1 font-mono text-emerald-600">
                    <Clock className="w-3 h-3" /> SLA: {tkt.slaHoursLeft}h left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs flex flex-col justify-between h-[600px]">
          {selectedTicket ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0F766E] dark:text-[#14B8A6]">{selectedTicket.ticketCode}</span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{selectedTicket.subject}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Raised by {selectedTicket.employeeName} · {selectedTicket.category} · Priority: {selectedTicket.priority}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6] bg-teal-50 dark:bg-[#0F766E]/20 px-2 py-0.5 rounded">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages stream */}
                <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {selectedTicket.thread.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.isStaff
                          ? 'bg-teal-50/70 dark:bg-[#0F766E]/20 border border-teal-100 dark:border-[#0F766E]/30 ml-6'
                          : 'bg-slate-50 dark:bg-[#020617]/60 border border-slate-200 dark:border-[#1E293B] mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>{msg.author} {msg.isStaff ? '(Support Staff)' : ''}</span>
                        <span className="font-mono text-slate-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-800 dark:text-[#CBD5E1] leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply box */}
              <form onSubmit={handleReply} className="pt-3 border-t border-slate-100 dark:border-[#1E293B] flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official reply or resolution notes..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <span>Select an inquiry from the queue to view SLA thread</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-5 shadow-2xl border border-slate-200 dark:border-[#1E293B] space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Raise Support Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Docker license renewal issue on workstation"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as HelpdeskTicket['category'])}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="HR Support">HR Support</option>
                    <option value="Payroll Query">Payroll Query</option>
                    <option value="Facilities">Facilities & Office</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as HelpdeskTicket['priority'])}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="Low">Low (72h SLA)</option>
                    <option value="Medium">Medium (24h SLA)</option>
                    <option value="High">High (8h SLA)</option>
                    <option value="Critical">Critical (2h SLA)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
