import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceQuickPunch } from '../dashboard/AttendanceQuickPunch';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Home,
  Building,
  RotateCw,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const {
    attendance,
    shifts,
    requestRegularization,
    currentTenant,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'logs' | 'shifts' | 'regularizations'>('logs');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [regularizeReason, setRegularizeReason] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);

  const pendingRegularizations = attendance.filter(a => a.regularizationRequested);

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecordId && regularizeReason) {
      requestRegularization(selectedRecordId, regularizeReason);
      setShowRegModal(false);
      setRegularizeReason('');
      setSelectedRecordId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Attendance & Shift Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geo-fencing, selfie biometric capture, IP restriction, shifts & overtime rules for {currentTenant.name}
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'logs', label: 'Attendance Records' },
            { id: 'shifts', label: `Shifts (${shifts.length})` },
            { id: 'regularizations', label: `Regularization Requests (${pendingRegularizations.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clock In / Out Banner */}
      <AttendanceQuickPunch />

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily Attendance Log</h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent/Leave
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Method & Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Regularize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {attendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{record.employeeName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{record.empCode}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {record.date}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {record.checkInTime}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {record.checkOutTime || '--:--'}
                    </td>

                    <td className="py-3 px-4 font-mono tabular-nums">
                      {record.durationHours > 0 ? `${record.durationHours} hrs` : '--'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        {record.isWFH ? (
                          <span className="flex items-center gap-1 text-[#0F766E] dark:text-[#14B8A6]">
                            <Home className="w-3.5 h-3.5" /> WFH
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Building className="w-3.5 h-3.5" /> Office
                          </span>
                        )}
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{record.checkInMethod}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          record.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : record.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {record.regularizationRequested ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                          Regularization {record.regularizationStatus}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRecordId(record.id);
                            setShowRegModal(true);
                          }}
                          className="px-2 py-1 text-xs text-[#0F766E] hover:bg-teal-50 dark:hover:bg-[#1E293B] rounded cursor-pointer transition-colors"
                        >
                          Request Correction
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map(shift => (
            <div
              key={shift.id}
              className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] rounded">
                  {shift.code}
                </span>
                {shift.isRotational && (
                  <span className="text-[11px] font-semibold text-[#06B6D4] flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Rotational
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{shift.name}</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {shift.startTime} — {shift.endTime} (9 Hours)
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Grace Period</span>
                  <span className="font-mono font-semibold">{shift.gracePeriodMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span>Half Day Threshold</span>
                  <span className="font-mono font-semibold">{shift.halfDayThresholdHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Employees</span>
                  <span className="font-mono font-semibold text-[#0F766E] dark:text-[#14B8A6]">{shift.assignedCount} staff</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'regularizations' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Pending Regularization Requests
          </h2>
          {pendingRegularizations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No punch regularization requests pending approval.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRegularizations.map(r => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">{r.employeeName} ({r.empCode})</span>
                    <p className="text-slate-500 mt-0.5">Reason: "{r.regularizationReason}"</p>
                  </div>
                  <span className="font-mono text-amber-600 font-semibold">{r.regularizationStatus}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-xl p-5 shadow-xl border border-slate-200 dark:border-[#1E293B] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
              Request Attendance Regularization
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">
              Provide justification for missed punch or time correction (e.g. client meeting, biometric glitch, travel).
            </p>
            <textarea
              required
              rows={3}
              value={regularizeReason}
              onChange={e => setRegularizeReason(e.target.value)}
              placeholder="e.g. Met client on-site at 9:00 AM; punch registered late due to transit."
              className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegularizeSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg cursor-pointer transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
