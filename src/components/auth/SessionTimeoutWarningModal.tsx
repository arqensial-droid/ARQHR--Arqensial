import React, { useEffect, useState } from 'react';
import { ShieldAlert, LogOut, Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtendSession: () => void;
  onLogoutNow: () => void;
}

export const SessionTimeoutWarningModal: React.FC<SessionTimeoutWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  onExtendSession,
  onLogoutNow,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);

  useEffect(() => {
    setSecondsLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onLogoutNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onLogoutNow]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-rose-300 dark:border-rose-900/60 shadow-2xl max-w-md w-full overflow-hidden p-6 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Session Inactivity Warning
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You have been inactive for an extended period. For enterprise compliance and tenant data protection, your session will automatically terminate in:
          </p>
        </div>

        {/* Big Countdown */}
        <div className="py-3 px-6 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 inline-block">
          <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-wider">
            00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-widest text-rose-500 mt-0.5">
            Seconds Remaining
          </span>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onLogoutNow}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
          <button
            onClick={onExtendSession}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
