import React, { useState, useEffect } from 'react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  isConfiguredForLiveSupabase,
  getSupabaseClient,
} from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import {
  Database,
  X,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useApp();
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredSupabaseConfig();
      setProjectUrl(cfg.url);
      setAnonKey(cfg.key);
      setIsLive(isConfiguredForLiveSupabase(cfg.url, cfg.key));
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (!projectUrl || !anonKey) {
        throw new Error('Please enter both Supabase Project URL and Anon API Key.');
      }

      if (!projectUrl.startsWith('https://')) {
        throw new Error('Supabase Project URL must start with https://');
      }

      // Save temporarily to test client
      saveSupabaseConfig(projectUrl, anonKey);
      const client = getSupabaseClient();

      // Test query
      const { data, error } = await client.from('tenants').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "public.tenants" does not exist')) {
        throw error;
      }

      setIsLive(true);
      setTestResult({
        success: true,
        message: 'Successfully connected to live Supabase instance! Connection authenticated.',
      });
      addNotification('Supabase Connected', 'Live cloud database synchronized.', 'success');
    } catch (err: any) {
      setIsLive(false);
      setTestResult({
        success: false,
        message: err?.message || 'Connection failed. Verify your project URL and public anon key.',
      });
      addNotification('Connection Failed', err?.message || 'Check credentials.', 'warning');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setProjectUrl('');
    setAnonKey('');
    setIsLive(false);
    setTestResult(null);
    addNotification('Disconnected', 'Operating in local database mode.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E293B] overflow-hidden space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/15 dark:bg-[#0F766E]/20 flex items-center justify-center text-[#14B8A6]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Supabase Live Database Connection
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">
                Connect external PostgreSQL database & Row Level Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status banner */}
        <div className="px-6">
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isLive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-teal-50 dark:bg-[#0F766E]/20 border-teal-200 dark:border-[#0F766E]/30 text-[#0F766E] dark:text-[#14B8A6]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-[#14B8A6]'
                }`}
              />
              <span>
                <strong>Mode:</strong> {isLive ? 'Live Cloud Supabase Project' : 'Local Enterprise PostgreSQL Engine'}
              </span>
            </div>
            <span className="font-mono text-[10px]">
              {isLive ? 'Active RLS Sync' : 'Zero-Config Ready'}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="px-6 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              value={projectUrl}
              onChange={e => setProjectUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] block mb-1">
              Supabase Public Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#020617] border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between">
          {isLive ? (
            <button
              onClick={handleDisconnect}
              className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
            >
              Disconnect Live Project
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              Credentials persist securely in browser
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-[#F8FAFC]"
            >
              Close
            </button>
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{testing ? 'Testing...' : 'Connect & Verify'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
