import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, MapPin, Camera, Home, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { SelfieAttendanceModal } from '../attendance/SelfieAttendanceModal';

export const AttendanceQuickPunch: React.FC = () => {
  const { currentUser, attendance, punchAttendance, currentTenant } = useApp();
  const [isWFH, setIsWFH] = useState(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);

  const today = new Date().toISOString().substring(0, 10);
  const todayRecord = attendance.find(a => a.employeeId === currentUser.id && a.date === today);

  const isCheckedIn = !!todayRecord && !todayRecord.checkOutTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  const handlePunch = () => {
    if (currentTenant.settings.selfieAttendanceEnabled && !isCheckedIn) {
      setShowSelfieModal(true);
      return;
    }

    if (!isCheckedIn) {
      punchAttendance('check_in', 'Web', { isWFH });
    } else {
      punchAttendance('check_out');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attendance & Time Clock
              </h3>
              <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Geo-fence indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Geo-Fence Active (500m)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Status info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-[#CBD5E1]">Current Status:</span>
              {isCheckedOut ? (
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Completed (Punched Out at {todayRecord?.checkOutTime})
                </span>
              ) : isCheckedIn ? (
                <span className="font-semibold text-[#22C55E] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Present (Punched In at {todayRecord?.checkInTime})
                </span>
              ) : (
                <span className="font-semibold text-[#F59E0B] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Check-In
                </span>
              )}
            </div>

            {/* WFH Toggle */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setIsWFH(false)}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                  !isWFH
                    ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] font-semibold border border-[#0F766E]/30'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Building2 className="w-3 h-3" /> Office Punch
              </button>
              <button
                type="button"
                onClick={() => setIsWFH(true)}
                className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                  isWFH
                    ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] font-semibold border border-[#0F766E]/30'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Home className="w-3 h-3" /> Work From Home (WFH)
              </button>
            </div>
          </div>

          {/* Punch Button & Selfie Trigger */}
          <div className="flex items-center gap-2 sm:justify-end">
            {!isCheckedIn && currentTenant.settings.selfieAttendanceEnabled && (
              <button
                onClick={() => setShowSelfieModal(true)}
                className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Camera Selfie Verification"
              >
                <Camera className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Selfie Punch</span>
              </button>
            )}

            <button
              onClick={handlePunch}
              disabled={isCheckedOut}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                isCheckedOut
                  ? 'bg-slate-100 text-slate-400 dark:bg-[#1E293B] dark:text-slate-600 cursor-not-allowed'
                  : isCheckedIn
                  ? 'bg-[#EF4444] hover:bg-rose-700 text-white'
                  : 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm shadow-[#0F766E]/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {isCheckedOut
                  ? 'Shift Finished'
                  : isCheckedIn
                  ? 'Web Check-Out'
                  : isWFH
                  ? 'WFH Check-In'
                  : 'Web Check-In'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showSelfieModal && (
        <SelfieAttendanceModal
          onClose={() => setShowSelfieModal(false)}
          onCapture={selfieDataUrl => {
            punchAttendance('check_in', 'Selfie', { isWFH, selfieUrl: selfieDataUrl });
            setShowSelfieModal(false);
          }}
        />
      )}
    </>
  );
};
