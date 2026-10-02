import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  ShieldCheck,
  Table,
  Key,
  Copy,
  Check,
  Play,
  RefreshCw,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Cpu,
  Layers,
  FileCode,
  HardDrive
} from 'lucide-react';
import { migrationService, MigrationStep, TableInspection } from '../../services/migrationService';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, isConfiguredForLiveSupabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export const DatabaseExplorer: React.FC = () => {
  const { addNotification, refreshFromDatabase } = useApp();
  const [activeCodeTab, setActiveCodeTab] = useState<'tables' | 'ddl' | 'rls' | 'migrations' | 'config'>('tables');
  const [copied, setCopied] = useState(false);

  // Supabase Configuration State
  const initialConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(initialConfig.key);
  const [showKey, setShowKey] = useState(false);

  // Connection & Health Status
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    connected: boolean;
    provider: string;
    latencyMs: number;
    error?: string;
    loading: boolean;
  }>({
    tested: false,
    connected: false,
    provider: isConfiguredForLiveSupabase() ? 'Supabase Cloud' : 'Local Persistent DB',
    latencyMs: 0,
    loading: false,
  });

  // Table Inspections
  const [tables, setTables] = useState<TableInspection[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Migration Execution State
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  // Run initial connection test and table count inspection
  useEffect(() => {
    testDbConnection();
    loadTableInspection();
  }, []);

  const testDbConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await migrationService.testConnection();
      setConnectionStatus({
        tested: true,
        connected: res.connected,
        provider: res.provider,
        latencyMs: res.latencyMs,
        error: res.error,
        loading: false,
      });
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        connected: false,
        provider: 'Unknown',
        latencyMs: 0,
        error: err.message,
        loading: false,
      });
    }
  };

  const loadTableInspection = async () => {
    setLoadingTables(true);
    try {
      const res = await migrationService.inspectTables();
      setTables(res);
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      addNotification('Invalid Configuration', 'Both Supabase URL and Anon Key are required.', 'error');
      return;
    }

    saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    addNotification('Configuration Saved', 'Active Supabase project credentials stored. Re-testing connection...', 'success');
    testDbConnection();
    loadTableInspection();
  };

  const handleResetToLocal = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    addNotification('Reset to Local Database', 'Active backend restored to local persistent storage engine with RLS.', 'info');
    testDbConnection();
    loadTableInspection();
  };

  const executeMigrations = async () => {
    setIsMigrating(true);
    setMigrationCompleted(false);

    const res = await migrationService.runMigrations(steps => {
      setMigrationSteps(steps);
    });

    setIsMigrating(false);
    if (res.success) {
      setMigrationCompleted(true);
      addNotification('Migrations Executed', '24 relational tables, indexes and RLS policies successfully provisioned.', 'success');
      loadTableInspection();
      refreshFromDatabase();
    } else {
      addNotification('Migration Error', res.error || 'Failed to complete all migration steps', 'error');
    }
  };

  const downloadSQL = () => {
    const link = document.createElement('a');
    link.href = '/src/db/schema.sql';
    link.download = 'ARQENSIAL_Enterprise_Production_Schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('File Downloaded', 'Exported ARQENSIAL_Enterprise_Production_Schema.sql', 'info');
  };

  const copyDDL = () => {
    const ddlScript = `-- ==============================================================================
-- ARQENSIAL ENTERPRISE HRMS - PRODUCTION POSTGRESQL & SUPABASE MULTI-TENANT SCHEMA
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.current_user_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_role', '')::TEXT;
$$ LANGUAGE SQL STABLE;

CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'growth',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    emp_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    annual_ctc_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, emp_code)
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_employees ON public.employees
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );`;

    navigator.clipboard.writeText(ddlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Supabase & PostgreSQL Enterprise Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
            Production schema manager, Row Level Security (RLS) isolation, database migrations and connection credentials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E293B] p-1 rounded-lg">
            {[
              { id: 'tables', label: 'Tables Catalog' },
              { id: 'migrations', label: 'Migrations' },
              { id: 'config', label: 'Connection Config' },
              { id: 'ddl', label: 'PostgreSQL DDL' },
              { id: 'rls', label: 'RLS Policies' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCodeTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeCodeTab === tab.id
                    ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={downloadSQL}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>schema.sql</span>
          </button>
        </div>
      </div>

      {/* Connection & Live Health Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#1E293B] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl ${connectionStatus.connected ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
            {connectionStatus.provider === 'Supabase Cloud' ? <Cloud className="w-6 h-6" /> : <HardDrive className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Active Provider: {connectionStatus.provider}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                connectionStatus.connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {connectionStatus.connected ? 'Connected' : 'Pending Check'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {connectionStatus.error || (
                connectionStatus.provider === 'Supabase Cloud'
                  ? `Live Supabase project synced with ${connectionStatus.latencyMs}ms roundtrip latency.`
                  : `High-speed local persistent engine with full multi-tenant RLS isolation (${connectionStatus.latencyMs}ms).`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={testDbConnection}
            disabled={connectionStatus.loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus.loading ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={executeMigrations}
            disabled={isMigrating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isMigrating ? 'animate-pulse' : ''}`} />
            <span>Run Migrations</span>
          </button>
        </div>
      </div>

      {/* Migration Runner View */}
      {activeCodeTab === 'migrations' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
                <Play className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span>PostgreSQL & Supabase Migration Runner</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
                Executes DDL statements, UUID extensions, table schemas, foreign key constraints and Row Level Security policies
              </p>
            </div>

            <button
              onClick={executeMigrations}
              disabled={isMigrating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              <Play className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'Running Migrations...' : 'Execute Migrations'}</span>
            </button>
          </div>

          {migrationSteps.length > 0 ? (
            <div className="space-y-3 font-mono text-xs">
              {migrationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                    step.status === 'completed'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                      : step.status === 'running'
                      ? 'bg-teal-50/50 dark:bg-[#0F766E]/20 border-teal-200 dark:border-[#0F766E]/40 text-[#0F766E] dark:text-[#14B8A6] animate-pulse'
                      : step.status === 'failed'
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {step.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {step.status === 'running' && <RefreshCw className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6] animate-spin shrink-0" />}
                    {step.status === 'pending' && <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
                    <span className="font-semibold">{step.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {step.message && <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">{step.message}</span>}
                    {step.durationMs && <span className="text-[10px] text-slate-400">{step.durationMs}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Cpu className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ready to execute schema migration</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Execute Migrations" to provision all 24 relational tables, create foreign key relationships, and verify Row Level Security across your active database.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Supabase Connection Configuration View */}
      {activeCodeTab === 'config' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] p-5 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Supabase Connection & API Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
              Connect ARQENSIAL directly to any hosted Supabase project instance by specifying your Project URL and Public Anon Key.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found in your Supabase Dashboard under Project Settings → API → Project URL
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  Supabase Anon (Public) Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[11px] text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
                >
                  {showKey ? 'Hide Key' : 'Reveal Key'}
                </button>
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-[#F8FAFC] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found in your Supabase Dashboard under Project Settings → API → Project API keys → anon public
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-sm cursor-pointer transition-colors"
              >
                Save & Connect
              </button>

              <button
                type="button"
                onClick={handleResetToLocal}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#1E293B] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] cursor-pointer"
              >
                Revert to Local DB
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables Catalog View */}
      {activeCodeTab === 'tables' && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Active Database Table Inspector</h2>
              <span className="text-xs text-slate-400 font-mono">24 relational entities with row-level security</span>
            </div>

            <button
              onClick={loadTableInspection}
              disabled={loadingTables}
              className="flex items-center gap-1 text-xs text-[#0F766E] dark:text-[#14B8A6] hover:underline cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTables ? 'animate-spin' : ''}`} />
              <span>Refresh Counts</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Table Name</th>
                  <th className="py-2.5 px-4">Primary Key</th>
                  <th className="py-2.5 px-4">Live Rows</th>
                  <th className="py-2.5 px-4">RLS Status</th>
                  <th className="py-2.5 px-4">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono">
                {tables.length > 0 ? (
                  tables.map(tbl => (
                    <tr key={tbl.name} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40">
                      <td className="py-2.5 px-4 font-bold text-[#0F766E] dark:text-[#14B8A6]">
                        public.{tbl.name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        id (UUID)
                      </td>
                      <td className="py-2.5 px-4 tabular-nums text-slate-900 dark:text-[#F8FAFC] font-semibold">
                        {tbl.rowCount}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-mono">
                          <ShieldCheck className="w-3 h-3" /> ENFORCED
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#14B8A6] bg-[#0F766E]/15 dark:bg-[#0F766E]/20 px-2 py-0.5 rounded-full font-mono">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                      Loading table inspection metadata...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DDL Code View */}
      {activeCodeTab === 'ddl' && (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-xs overflow-x-auto border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">PostgreSQL DDL Production Specification</span>
            <button
              onClick={copyDDL}
              className="flex items-center gap-1 px-3 py-1 bg-[#1E293B] hover:bg-[#1E293B]/80 rounded-md text-xs cursor-pointer text-[#14B8A6]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="text-slate-300 leading-relaxed">
{`-- MULTI-TENANT ENTERPRISE SCHEMA FOR ARQENSIAL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100) NOT NULL,
    plan_tier VARCHAR(50) NOT NULL DEFAULT 'growth',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    emp_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    designation VARCHAR(150) NOT NULL,
    annual_ctc_cents BIGINT NOT NULL,
    basic_cents BIGINT NOT NULL,
    hra_cents BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, emp_code)
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    duration_hours NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    within_geofence BOOLEAN DEFAULT TRUE,
    is_wfh BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_tenant_emp_attendance_date UNIQUE (tenant_id, employee_id, record_date)
);`}
          </pre>
        </div>
      )}

      {/* RLS Policies Code View */}
      {activeCodeTab === 'rls' && (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-xs overflow-x-auto border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <span className="text-emerald-400 font-bold">Row Level Security (RLS) Policy Declarations</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Enforces ironclad separation where queries can only read/write records matching the authenticated user's tenant_id claim.
            </p>
          </div>

          <pre className="text-slate-300 leading-relaxed">
{`-- Step 1: Enable RLS across all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- Step 2: Define Tenant Isolation Policy for Employees
CREATE POLICY tenant_isolation_employees ON public.employees
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  )
  WITH CHECK (
    auth.current_user_role() = 'super_admin' 
    OR tenant_id = auth.current_tenant_id()
  );

-- Step 3: Define Tenant Isolation Policy for Payroll Runs
CREATE POLICY tenant_isolation_payroll ON public.payroll_runs
  FOR ALL
  USING (
    auth.current_user_role() = 'super_admin' 
    OR (
        tenant_id = auth.current_tenant_id()
        AND auth.current_user_role() IN ('company_admin', 'payroll_manager', 'hr_manager')
    )
  );`}
          </pre>
        </div>
      )}
    </div>
  );
};
