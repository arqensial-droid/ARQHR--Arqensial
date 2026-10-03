import React, { useState } from 'react';
import {
  Users,
  Clock,
  Banknote,
  FileText,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Star,
  Play,
  Calendar,
  Lock,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
  Laptop,
  Database,
  BarChart3,
  X,
  Send,
  UserCheck,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
}) => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Form states for modals
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    headcount: '50-200',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const [consultForm, setConsultForm] = useState({
    name: '',
    email: '',
    topic: 'India Statutory Compliance & ECR Automation',
    date: '',
  });
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setDemoModalOpen(false);
    }, 2000);
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSubmitted(true);
    setTimeout(() => {
      setConsultSubmitted(false);
      setConsultModalOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#2563EB]/20 selection:text-[#2563EB]">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-[#0F172A] text-white py-2 px-4 text-center text-xs font-medium border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#2563EB] text-[10px] font-bold uppercase tracking-wider">
            Enterprise 2026
          </span>
          <span>ARQHR Cloud is now audited for ISO 27001 & SOC 2 Type II Compliance.</span>
          <button
            onClick={() => setDemoModalOpen(true)}
            className="text-[#3B82F6] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Explore security brief &rarr;
          </button>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white font-black flex items-center justify-center text-sm shadow-md">
              AQ
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0F172A]">ARQHR</span>
              <span className="text-[10px] text-[#2563EB] font-mono block -mt-1 font-bold">
                ENTERPRISE ERP
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#64748B]">
            <a href="#features" className="hover:text-[#0F172A] transition-colors">
              Features
            </a>
            <a href="#hrms" className="hover:text-[#0F172A] transition-colors">
              HR Management
            </a>
            <a href="#attendance" className="hover:text-[#0F172A] transition-colors">
              Attendance
            </a>
            <a href="#payroll" className="hover:text-[#0F172A] transition-colors">
              Payroll
            </a>
            <a href="#documents" className="hover:text-[#0F172A] transition-colors">
              Document Vault
            </a>
            <a href="#pricing" className="hover:text-[#0F172A] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#0F172A] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Request Demo
            </button>
            <button
              onClick={onLoginClick}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Enterprise Workforce Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
              Modern HR & Workforce Management Platform
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto">
              Manage Employees, Attendance, Payroll, Leaves, Documents and Operations from one centralized platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onRegisterClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md shadow-blue-500/15 transition-all cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#0F172A] bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#2563EB]" />
                <span>Request Demo</span>
              </button>

              <button
                onClick={() => setConsultModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Book Consultation</span>
              </button>
            </div>

            {/* Micro Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> 14-day free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> 100% India Statutory Ready
              </span>
            </div>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div className="mt-12 sm:mt-16 relative mx-auto max-w-5xl">
            <div className="p-2 sm:p-3 rounded-2xl bg-[#0F172A] shadow-2xl border border-[#1E293B]">
              {/* Window bar */}
              <div className="h-9 px-4 flex items-center justify-between border-b border-[#1E293B] bg-[#020617]/50 rounded-t-xl text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-[11px] text-slate-400">
                    https://app.arqhr.com/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[11px] font-mono text-emerald-400">LIVE PRODUCTION NODE</span>
                </div>
              </div>

              {/* Embedded UI Preview Grid */}
              <div className="p-4 sm:p-6 bg-slate-50 rounded-b-xl space-y-4 text-slate-900 text-left font-sans">
                {/* Mock Banner */}
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                      AQ
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">ARQENSIAL Global Holdings</h4>
                      <p className="text-xs text-[#64748B]">Multi-Tenant Holding Organization · 3 Entities</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg font-bold">
                    Super Admin Active
                  </span>
                </div>

                {/* Top Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold">
                      Total Workforce
                    </span>
                    <div className="text-xl font-bold font-mono text-[#0F172A] mt-1">2,480</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">+14 new this month</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold">
                      Present Today
                    </span>
                    <div className="text-xl font-bold font-mono text-[#10B981] mt-1">96.8%</div>
                    <span className="text-[10px] text-slate-400 font-mono">2,398 checked in</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold">
                      Disbursed Payroll
                    </span>
                    <div className="text-xl font-bold font-mono text-[#0F172A] mt-1">$1.42M</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">100% statutory compliant</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] font-bold">
                      Pending Approvals
                    </span>
                    <div className="text-xl font-bold font-mono text-amber-500 mt-1">12</div>
                    <span className="text-[10px] text-slate-400 font-mono">Avg time: 45 mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUSTED COMPANIES SECTION */}
      <section className="py-12 border-y border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-mono uppercase tracking-wider font-bold text-[#64748B]">
            Trusted by over 1,500+ forward-thinking enterprises & institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all">
            {['Apex Global', 'Vertex Dynamics', 'Zenith Health', 'Horizon Logistics', 'CloudScale Technologies', 'Omni Retail'].map((c, idx) => (
              <span key={idx} className="font-extrabold text-sm sm:text-base text-slate-700 tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase font-bold text-[#2563EB]">
            Unified Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            One Single Platform to Replace 8 Fragmented Tools
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Eliminate double data entry, syncing errors, and manual spreadsheets with an audit-grade cloud backbone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: 'Complete Employee Lifecycle',
              desc: 'From digital offer letter to full & final clearance. Org hierarchy, employee directory, and automated onboarding checklists.',
            },
            {
              icon: Clock,
              title: 'Geofenced Attendance',
              desc: 'Mobile selfie check-in, biometric machine API sync, shift rosters, and real-time overtime calculations.',
            },
            {
              icon: Banknote,
              title: '1-Click Statutory Payroll',
              desc: 'India PF, ESI, Professional Tax, and TDS calculated automatically. Generate Form 16 and bank batch transfer files in seconds.',
            },
            {
              icon: Laptop,
              title: 'Employee Self Service (ESS)',
              desc: 'Modern portal for workers to apply for leaves, download certified payslips, claim expenses, and submit IT declarations.',
            },
            {
              icon: FileText,
              title: 'Encrypted Document Vault',
              desc: 'Centralized storage for Aadhaar, PAN, agreements, and contracts with multi-tenant access control and signed URLs.',
            },
            {
              icon: Building2,
              title: 'Multi-Company Architecture',
              desc: 'Super Admin portal designed for conglomerate groups. Switch between holding companies and subsidiaries with 100% data isolation.',
            },
          ].map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs card-hover-lift space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#0F172A]">{f.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HR MANAGEMENT SECTION */}
      <section id="hrms" className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
              MODULE 01 · CORE HR
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Enterprise Employee Directory & Hierarchy Visualizer
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Maintain unified records for full-time, contract, and remote workers. Automatically sync branch locations, department managers, and compensation brackets with role-based access.
            </p>
            <ul className="space-y-2.5 text-xs text-[#0F172A]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Interactive tree hierarchy and reporting lines
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Digital onboarding task assignment with due dates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                Exit management and multi-department clearance workflows
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F172A] text-white shadow-xl space-y-3">
            <div className="text-xs font-mono text-[#3B82F6] flex items-center justify-between">
              <span>ACTIVE WORKFORCE DIRECTORY</span>
              <span>100% SYNCHRONIZED</span>
            </div>
            <div className="space-y-2 pt-2">
              {[
                { name: 'Sarah Jenkins', role: 'Head of Engineering', dept: 'Technology', status: 'Active' },
                { name: 'David Chen', role: 'Staff Product Designer', dept: 'Design', status: 'Active' },
                { name: 'Priya Sharma', role: 'Senior Talent Acquisition Lead', dept: 'Human Resources', status: 'Active' },
              ].map((emp, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#1E293B] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-[10px]">
                      {emp.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{emp.name}</span>
                      <span className="text-[10px] text-slate-400">{emp.role} · {emp.dept}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. ATTENDANCE & SHIFTS SECTION */}
      <section id="attendance" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="text-xs font-bold text-[#0F172A]">Real-Time Shift Tracker</span>
              <span className="text-[10px] font-mono text-[#2563EB]">GEOFENCE ACTIVE (500M)</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">Morning Shift (09:00 - 18:00)</span>
                  <span className="block text-[10px] text-slate-500">1,240 employees assigned</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">98.2% on time</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">Night Operations (20:00 - 05:00)</span>
                  <span className="block text-[10px] text-slate-500">320 employees assigned</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">97.4% on time</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
              MODULE 02 · ATTENDANCE & TIME
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Biometric, Geofence & Selfie Clock-In
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Empower hybrid and on-site teams. Set custom office GPS coordinates with radius enforcement, prevent buddy punching, and allow one-click attendance regularization requests.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PAYROLL AUTOMATION SECTION */}
      <section id="payroll" className="py-20 bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase">
              MODULE 03 · STATUTORY PAYROLL
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Zero-Error Payroll Automation with Full Statutory Filings
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Say goodbye to complicated Excel macros. Run company-wide payroll in under 3 minutes with automated calculations for Basic, HRA, Provident Fund (PF), ESI, Professional Tax (PT), and TDS deductions.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="font-bold block">1-Click Direct Disbursal</span>
                <span className="text-[11px] text-slate-400">Export bank NACH / NEFT files</span>
              </div>
              <div className="p-3 rounded-xl bg-[#1E293B] border border-slate-700">
                <span className="font-bold block">Digital Form 16 & Tax</span>
                <span className="text-[11px] text-slate-400">Automated employee TDS certificates</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs font-bold">Payroll Run Cycle: October 2026</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                AUDITED DIRECT BATCH
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gross Salaries:</span>
                <span className="font-bold">$1,540,000.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Provident Fund (PF):</span>
                <span className="text-emerald-400">-$62,400.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">TDS Withholding:</span>
                <span className="text-amber-400">-$148,000.00</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold border-t border-slate-600">
                <span>Net Disbursed:</span>
                <span className="text-white">$1,329,600.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EMPLOYEE SELF SERVICE (ESS) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
            MODULE 04 · EMPLOYEE EXPERIENCE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Self-Service That Your Employees Will Actually Love
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Reduce HR repetitive inquiries by 70% with intuitive mobile-friendly employee dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#0F172A]">Instant Leave Requests</h3>
            <p className="text-xs text-[#64748B]">
              Real-time leave balance calculations with multi-level manager approvals and calendar sync.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#0F172A]">Expense & Claim Reimbursals</h3>
            <p className="text-xs text-[#64748B]">
              Upload receipt photos, categorize travel or meals, and track payout status directly.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#0F172A]">Company Pulse & Kudos</h3>
            <p className="text-xs text-[#64748B]">
              Broadcast company-wide announcements, celebrate birthdays, and reward teammates with peer kudos.
            </p>
          </div>
        </div>
      </section>

      {/* 8. DOCUMENT VAULT & STORAGE */}
      <section id="documents" className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
              MODULE 05 · COMPLIANCE & FILES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Centralized Encrypted Document Vault
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Store employee Aadhaar, PAN, resumes, offer letters, client contracts, and company incorporation documents with strict Row Level Security (RLS) and signed URLs.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
              <div>/companies/{'{companyId}'}/documents</div>
              <div>/employees/{'{employeeId}'}/documents</div>
              <div>/clients/{'{clientId}'}/documents</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Verified Document Types</span>
              <span className="text-emerald-600">256-Bit Encrypted</span>
            </div>
            <div className="space-y-2 text-xs">
              {['Government Aadhaar & PAN Card Verification', 'Candidate Offer & Joining Letters', 'Master Client Commercial Agreements', 'GST & Company Registration Filings'].map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                  <span className="font-medium text-[#0F172A]">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. MULTI-COMPANY & HOLDING MANAGEMENT */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
            ENTERPRISE SCALE
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Multi-Tenant Isolation for Group Holding Companies
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            One Root Super Admin manages multiple companies, branches, and subsidiaries with strict database boundary security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <Building2 className="w-6 h-6 text-[#2563EB]" />
            <h3 className="font-bold text-sm text-[#0F172A]">Group Provisioning</h3>
            <p className="text-xs text-[#64748B]">Create independent companies with unique admin credentials in seconds.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#10B981]" />
            <h3 className="font-bold text-sm text-[#0F172A]">Zero Leakage RLS</h3>
            <p className="text-xs text-[#64748B]">Company Admins and employees only access their designated tenant namespace.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold text-sm text-[#0F172A]">Consolidated Analytics</h3>
            <p className="text-xs text-[#64748B]">Super Admin monitors global headcount, MRR, and platform metrics across all organizations.</p>
          </div>
        </div>
      </section>

      {/* 10. PRICING PLANS SECTION */}
      <section id="pricing" className="py-20 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
              TRANSPARENT PRICING
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Predictable Plans Designed for Any Company Size
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              No hidden setup fees. Upgrade or downgrade anytime.
            </p>

            {/* Monthly / Annual Switcher */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 rounded-full bg-[#0F172A] p-0.5 transition-colors cursor-pointer relative"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#2563EB] transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                <span>Annual Billing</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  SAVE 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">Starter</h3>
                  <p className="text-xs text-[#64748B]">For growing startups and teams up to 50 employees</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    {billingCycle === 'annual' ? '$4' : '$5'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ employee / mo</span>
                </div>
                <ul className="space-y-2 text-xs text-[#0F172A] pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Core Employee Directory</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Leave & Attendance Clock-in</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Employee Self Service (ESS)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Standard India Payroll Run</li>
                </ul>
              </div>
              <button
                onClick={onRegisterClick}
                className="w-full py-2.5 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Start 14-Day Trial
              </button>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="p-8 rounded-2xl bg-white border-2 border-[#2563EB] shadow-xl relative flex flex-col justify-between space-y-6">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                MOST POPULAR
              </span>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#0F172A]">Growth</h3>
                  <p className="text-xs text-[#64748B]">For established mid-market enterprises up to 500 members</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    {billingCycle === 'annual' ? '$8' : '$10'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">/ employee / mo</span>
                </div>
                <ul className="space-y-2 text-xs text-[#0F172A] pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Everything in Starter</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Geofence & Selfie Punch</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Performance OKRs & Reviews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Full Encrypted Document Vault</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Priority WhatsApp & Call Support</li>
                </ul>
              </div>
              <button
                onClick={onRegisterClick}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-2xl bg-[#0F172A] text-white shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">Enterprise Custom</h3>
                  <p className="text-xs text-slate-400">For large holding companies, conglomerates & multi-subsidiary groups</p>
                </div>
                <div className="text-3xl font-extrabold">Custom Quote</div>
                <ul className="space-y-2 text-xs text-slate-300 pt-2">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Unlimited Child Companies & Tenants</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Custom ERP & Biometric Integrations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Dedicated TAM & SLA Guarantee</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981]" /> Custom Security Audits & RLS Review</li>
                </ul>
              </div>
              <button
                onClick={() => setDemoModalOpen(true)}
                className="w-full py-2.5 text-xs font-semibold text-[#0F172A] bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Talk to Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-50 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
              LEADERSHIP REVIEWS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              What People Operations Leaders Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "ARQHR reduced our month-end payroll run from 4 days to 45 minutes. The India statutory tax calculation is 100% accurate.",
                author: "Ananya Deshmukh",
                title: "VP of People Operations",
                company: "Vertex Global",
              },
              {
                quote: "The multi-tenant architecture allowed us to roll out one unified system across 4 subsidiary companies without data mixing.",
                author: "Marcus Vance",
                title: "Chief Operating Officer",
                company: "CloudScale Holdings",
              },
              {
                quote: "Employees love the self-service mobile app. Leave requests and tax declarations are handled completely without HR intervention.",
                author: "Rohan Kulkarni",
                title: "Director of HR",
                company: "Apex Tech Labs",
              },
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#0F172A] leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <span className="font-bold text-xs text-[#0F172A] block">{t.author}</span>
                  <span className="text-[11px] text-[#64748B]">{t.title} · {t.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
            CLEAR ANSWERS
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Does ARQHR comply with India statutory regulations (PF, ESI, PT, Form 16)?',
              a: 'Yes, 100%. The payroll engine is pre-configured with rules for Employees Provident Fund (PF), Employee State Insurance (ESI), state-specific Professional Tax (PT), and automated Form 16 TDS certificates.',
            },
            {
              q: 'Can a Super Admin manage multiple companies with separate bank accounts?',
              a: 'Yes. ARQHR is a native multi-tenant platform. A single Super Admin holding account can provision unlimited child entities, each with isolated database records, logos, bank disbursals, and company admin credentials.',
            },
            {
              q: 'How does geofenced attendance prevent proxy punches?',
              a: 'The system validates device GPS coordinates against the company’s configured office radius. Optional real-time selfie verification ensures the exact employee is physically on premises.',
            },
            {
              q: 'Can we import our existing employees from Excel or legacy HR software?',
              a: 'Yes. We provide CSV and spreadsheet batch import templates that populate employees, shifts, departments, and historical balances in one click.',
            },
            {
              q: 'Is my company data encrypted and secure?',
              a: 'All data is stored in Supabase with AES-256 encryption at rest and TLS 1.3 in transit. Strict PostgreSQL Row Level Security (RLS) policies prevent unauthorized access across tenants.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#E2E8F0] overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs font-bold text-[#0F172A] cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 13. CTA SECTION */}
      <section className="py-20 bg-[#0F172A] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-mono font-bold text-[#3B82F6] uppercase">
            TRANSFORM YOUR WORKFORCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to upgrade to next-generation workforce automation?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of modern enterprises using ARQHR to streamline operations, save 10+ hours weekly, and satisfy 100% of compliance audits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Start Your Free 14-Day Trial
            </button>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Request Custom Demo
            </button>
          </div>
        </div>
      </section>

      {/* 14. ENTERPRISE FOOTER */}
      <footer className="bg-[#020617] text-slate-400 text-xs py-14 border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white font-black flex items-center justify-center text-xs">
                  AQ
                </div>
                <span className="font-extrabold text-base text-white">ARQHR Enterprise</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm text-slate-400">
                Centralized HRMS, Attendance, India Statutory Payroll, and Multi-Tenant operations platform for modern enterprises.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational (99.99% SLA)</span>
              </div>
            </div>

            {/* Col 2: Solutions */}
            <div className="space-y-3">
              <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                Modules
              </span>
              <ul className="space-y-2">
                <li><a href="#hrms" className="hover:text-white">Core HR Directory</a></li>
                <li><a href="#attendance" className="hover:text-white">Time & Attendance</a></li>
                <li><a href="#payroll" className="hover:text-white">Statutory Payroll</a></li>
                <li><a href="#documents" className="hover:text-white">Document Vault</a></li>
                <li><a href="#pricing" className="hover:text-white">Holding Multi-Tenant</a></li>
              </ul>
            </div>

            {/* Col 3: Compliance & Security */}
            <div className="space-y-3">
              <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                Security
              </span>
              <ul className="space-y-2">
                <li><span>ISO 27001 Certified</span></li>
                <li><span>SOC 2 Type II Verified</span></li>
                <li><span>PostgreSQL Row Level Security</span></li>
                <li><span>AES-256 Bit Encryption</span></li>
                <li><span>GDPR Compliant</span></li>
              </ul>
            </div>

            {/* Col 4: Contact & Access */}
            <div className="space-y-3">
              <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">
                Access
              </span>
              <ul className="space-y-2">
                <li><button onClick={onLoginClick} className="hover:text-white cursor-pointer">Enterprise Sign In</button></li>
                <li><button onClick={onRegisterClick} className="hover:text-white cursor-pointer">Register Company</button></li>
                <li><button onClick={() => setDemoModalOpen(true)} className="hover:text-white cursor-pointer">Schedule Demo</button></li>
                <li><button onClick={() => setConsultModalOpen(true)} className="hover:text-white cursor-pointer">Book Consultation</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} ARQENSIAL Technologies Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Security Disclosures</a>
            </div>
          </div>
        </div>
      </footer>

      {/* REQUEST DEMO MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0F172A]">Request a Personalized Live Demo</h3>
              <button onClick={() => setDemoModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {demoSubmitted ? (
              <div className="py-8 text-center space-y-2 text-[#0F172A]">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h4 className="font-bold text-sm">Demo Request Received</h4>
                <p className="text-xs text-[#64748B]">Our enterprise architect will contact you within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.name}
                    onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="e.g. Rachel Adams"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={demoForm.email}
                    onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="rachel@company.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={demoForm.company}
                    onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="Acme Enterprise"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Company Size (Employees)</label>
                  <select
                    value={demoForm.headcount}
                    onChange={(e) => setDemoForm({ ...demoForm, headcount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="1-50">1 - 50 Employees</option>
                    <option value="50-200">50 - 200 Employees</option>
                    <option value="200-1000">200 - 1,000 Employees</option>
                    <option value="1000+">1,000+ Enterprise</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Confirm Demo Scheduling
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BOOK CONSULTATION MODAL */}
      {consultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0F172A]">Book Free HR / Payroll Consultation</h3>
              <button onClick={() => setConsultModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {consultSubmitted ? (
              <div className="py-8 text-center space-y-2 text-[#0F172A]">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h4 className="font-bold text-sm">Consultation Scheduled</h4>
                <p className="text-xs text-[#64748B]">Calendar invite has been dispatched to your work email.</p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={consultForm.name}
                    onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="e.g. Vikram Malhotra"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={consultForm.email}
                    onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    placeholder="vikram@holdingcompany.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Consultation Topic</label>
                  <select
                    value={consultForm.topic}
                    onChange={(e) => setConsultForm({ ...consultForm, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="India Statutory Compliance & ECR Automation">India Statutory Compliance & ECR Automation</option>
                    <option value="Holding Multi-Tenant Architecture">Holding Multi-Tenant Architecture & Subsidiaries</option>
                    <option value="Legacy ERP Data Migration">Legacy ERP Data Migration</option>
                    <option value="Custom Biometric & GPS Setup">Custom Biometric & GPS Setup</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={consultForm.date}
                    onChange={(e) => setConsultForm({ ...consultForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
                >
                  Book 30-Minute Consultation
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
