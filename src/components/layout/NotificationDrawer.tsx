import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, AlertTriangle, Info, Bell, Mail, MessageSquare, PhoneCall } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotification } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />;
    }
  };

  const getChannelBadge = (channel?: string) => {
    switch (channel) {
      case 'email':
        return (
          <span className="flex items-center gap-1 text-[10px] text-[#06B6D4] font-mono">
            <Mail className="w-3 h-3" /> Email Dispatched
          </span>
        );
      case 'whatsapp':
        return (
          <span className="flex items-center gap-1 text-[10px] text-[#22C55E] font-mono">
            <MessageSquare className="w-3 h-3" /> WhatsApp
          </span>
        );
      case 'sms':
        return (
          <span className="flex items-center gap-1 text-[10px] text-[#14B8A6] font-mono">
            <PhoneCall className="w-3 h-3" /> SMS Alert
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-[#CBD5E1] font-mono">
            <Bell className="w-3 h-3" /> In-App Realtime
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-[#1E293B] shadow-2xl h-full flex flex-col animate-slide-left">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Enterprise Notifications</h2>
            <span className="text-[11px] font-mono px-1.5 py-0.2 bg-[#0F766E]/15 text-[#0F766E] dark:text-[#14B8A6] rounded">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E293B] p-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No unread notifications
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className="p-3 hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 rounded-lg transition-colors group flex items-start gap-2.5"
              >
                {getIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {getChannelBadge(notif.channel)}
                    <button
                      onClick={() => clearNotification(notif.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1E293B] text-[11px] text-slate-500 dark:text-[#CBD5E1] flex items-center justify-between bg-slate-50/50 dark:bg-[#020617]/50">
          <span>Multi-channel delivery enabled</span>
          <span className="font-mono text-[#22C55E] font-medium">Synced</span>
        </div>
      </div>
    </div>
  );
};
