import React, { useState } from 'react';
import { Mail, X, Copy, Check, ShieldCheck, ExternalLink, Smartphone, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../types';

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: 'company_otp' | 'employee_invite' | 'password_reset' | 'new_login_alert';
  inviteData?: {
    companyName?: string;
    employeeName?: string;
    email?: string;
    role?: UserRole;
    department?: string;
    otpCode?: string;
    inviteToken?: string;
  };
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  initialTemplate = 'employee_invite',
  inviteData,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<
    'company_otp' | 'employee_invite' | 'password_reset' | 'new_login_alert'
  >(initialTemplate);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const company = inviteData?.companyName || 'Arqensial Technologies Pvt Ltd';
  const employee = inviteData?.employeeName || 'Aditya Verma';
  const email = inviteData?.email || 'aditya.verma@arqensial.com';
  const role = inviteData?.role || 'employee';
  const dept = inviteData?.department || 'Development';
  const otp = inviteData?.otpCode || '492817';
  const token = inviteData?.inviteToken || 'inv_demo_9824_token';

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/80 dark:bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/15 flex items-center justify-center text-[#0F766E] dark:text-[#14B8A6]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                Security Email Dispatch Previewer
              </h3>
              <p className="text-[11px] text-slate-500">
                Production multi-tenant transactional notifications delivered via SMTP / SendGrid / Resend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#1E293B] bg-slate-100/60 dark:bg-[#020617] px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'employee_invite', label: 'Employee Invitation' },
            { id: 'company_otp', label: 'Company Registration OTP' },
            { id: 'password_reset', label: 'Password Reset OTP' },
            { id: 'new_login_alert', label: 'Security Login Alert' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTemplate(tab.id as typeof activeTemplate)}
              className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTemplate === tab.id
                  ? 'bg-white dark:bg-[#0B132B] text-[#0F766E] dark:text-[#14B8A6] border-t-2 border-[#0F766E] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Email Body Viewport */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-[#020617]">
          {/* Simulated Email Envelope Card */}
          <div className="max-w-xl mx-auto bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#1E293B] shadow-sm overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Sender / Subject Bar */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#0A101D] text-[11px] space-y-1 font-mono">
              <div className="text-slate-400">
                <span className="font-semibold text-slate-500">From:</span> ARQENSIAL Security &lt;security@auth.arqensial.io&gt;
              </div>
              <div className="text-slate-400">
                <span className="font-semibold text-slate-500">To:</span> {email}
              </div>
              <div className="text-slate-700 dark:text-slate-200 font-sans font-semibold pt-1">
                {activeTemplate === 'employee_invite' && `You have been invited to join ${company} on ARQHR`}
                {activeTemplate === 'company_otp' && `Verify your corporate email for ${company} workspace`}
                {activeTemplate === 'password_reset' && `Your ARQHR password reset security code: ${otp}`}
                {activeTemplate === 'new_login_alert' && `Security Alert: New sign-in detected on ${company}`}
              </div>
            </div>

            {/* Email Content Container */}
            <div className="p-6 sm:p-8 space-y-6 text-xs leading-relaxed">
              {/* Brand Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center font-bold text-sm text-white">
                    AQ
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-[#F8FAFC]">ARQENSIAL</span>
                    <span className="block text-[9px] font-mono text-[#0F766E] dark:text-[#14B8A6] uppercase tracking-wider font-semibold">
                      Enterprise HRMS
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Tenant: {company}</span>
              </div>

              {/* Template 1: Employee Invitation */}
              {activeTemplate === 'employee_invite' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Welcome to {company}, {employee}!
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      An administrator has provisioned your corporate identity on the ARQHR Cloud platform. You are authorized to access the following workspace role:
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-[#0F766E]/10 border border-[#0F766E]/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Company:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Assigned Role:</span>
                      <span className="font-semibold px-2 py-0.5 rounded-full text-[10px] bg-[#0F766E] text-white uppercase tracking-wider">
                        {role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Department:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{dept}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Security PIN:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{otp}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => copyCode(token)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Invitation & Activate Account</span>
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">
                      Token: {token} · Expires in 7 days
                    </p>
                  </div>
                </div>
              )}

              {/* Template 2: Company Registration OTP */}
              {activeTemplate === 'company_otp' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Verify Your Corporate Email Address
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      Thank you for registering <strong>{company}</strong>. Please enter the 6-digit one-time verification code below to confirm domain ownership and initialize your dedicated PostgreSQL tenant.
                    </p>
                  </div>

                  <div className="text-center py-4 bg-slate-100 dark:bg-[#020617] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                      One-Time Verification Code
                    </span>
                    <span className="text-3xl font-black font-mono tracking-widest text-[#0F766E] dark:text-[#14B8A6]">
                      {otp}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Valid for 15 minutes</span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    If you did not initiate this organization registration on ARQHR, please ignore this email or notify security@arqensial.io.
                  </p>
                </div>
              )}

              {/* Template 3: Password Reset */}
              {activeTemplate === 'password_reset' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Password Reset Security Request
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      We received an authorization request to reset the password for your ARQHR account (<strong>{email}</strong>).
                    </p>
                  </div>

                  <div className="text-center py-4 bg-slate-100 dark:bg-[#020617] rounded-xl border border-slate-200 dark:border-[#1E293B]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                      Authorization Code
                    </span>
                    <span className="text-3xl font-black font-mono tracking-widest text-rose-600 dark:text-rose-400">
                      {otp}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Expires in 15 minutes</span>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Security Warning: Never share this authorization code with anyone, including ARQHR support representatives.
                    </span>
                  </div>
                </div>
              )}

              {/* Template 4: New Login Alert */}
              {activeTemplate === 'new_login_alert' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                      <span>New Device Login Alert</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      A new sign-in was authorized for your account. If this was you, no action is required.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Device:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Apple MacBook Pro 16" (Chrome 134)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IP Address:</span>
                      <span className="text-slate-800 dark:text-slate-200">182.72.138.42 (BKC Mumbai Hub)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-800 dark:text-slate-200">{new Date().toUTCString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="text-slate-800 dark:text-slate-200">Mumbai, Maharashtra, India</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Didn't recognize this activity?</span>
                    <button
                      onClick={onClose}
                      className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      Revoke All Sessions Immediately →
                    </button>
                  </div>
                </div>
              )}

              {/* Email Footer */}
              <div className="border-t border-slate-100 dark:border-[#1E293B] pt-4 text-[10px] text-slate-400 space-y-1">
                <div>ARQENSIAL Technologies Inc. · ISO 27001 & SOC2 Certified</div>
                <div>Automated security notification sent to {email}. Do not reply to this email.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for transactional SMTP dispatch</span>
          </div>
          <button
            onClick={() => copyCode(otp)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code!' : 'Copy OTP Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
