import React, { useState } from 'react';
import { Employee, Tenant } from '../../types';
import {
  X,
  CreditCard,
  QrCode,
  Download,
  Printer,
  Smartphone,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Phone,
  Droplet,
  ExternalLink,
  CheckCircle2,
  RotateCw,
} from 'lucide-react';

interface DigitalIdCardModalProps {
  employee: Employee;
  tenant: Tenant;
  onClose: () => void;
}

export const DigitalIdCardModal: React.FC<DigitalIdCardModalProps> = ({
  employee,
  tenant,
  onClose,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'mobile'>('card');
  const [showPublicVerification, setShowPublicVerification] = useState(false);

  const idCard = employee.idCard || {
    id: `idcard-${employee.id}`,
    tenantId: tenant.id,
    employeeId: employee.id,
    employeeName: employee.fullName,
    empCode: employee.empCode,
    designation: employee.designation,
    department: employee.departmentName,
    photoUrl: employee.avatarUrl || '',
    companyName: tenant.legalCompanyName || tenant.name,
    companyLogo: tenant.logo || 'AQ',
    bloodGroup: employee.bloodGroup || 'O+',
    joiningDate: employee.joiningDate,
    workLocation: employee.location,
    emergencyContact: employee.emergencyContacts?.[0]?.name || 'HR Operations',
    emergencyPhone: employee.emergencyContacts?.[0]?.phone || tenant.contactPhone,
    validityDate: '2028-12-31',
    qrVerificationToken: `VERIFY-${tenant.id}-${employee.empCode}`,
    verifiedStatus: 'Active' as const,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a downloadable snapshot notification
    const element = document.createElement('a');
    const file = new Blob(
      [
        `DIGITAL EMPLOYEE ID CARD\n\n` +
        `Company: ${idCard.companyName}\n` +
        `Employee: ${idCard.employeeName} (${idCard.empCode})\n` +
        `Designation: ${idCard.designation}\n` +
        `Department: ${idCard.department}\n` +
        `Location: ${idCard.workLocation}\n` +
        `Blood Group: ${idCard.bloodGroup}\n` +
        `Valid Thru: ${idCard.validityDate}\n` +
        `Verification Token: ${idCard.qrVerificationToken}\n` +
        `Status: ${idCard.verifiedStatus}`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `ID-CARD-${employee.empCode}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden my-6">
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Digital Employee Identity Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official credential issued under {tenant.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setViewMode('card')}
                className={`px-2 py-1 rounded-md transition font-medium ${
                  viewMode === 'card'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Physical Card Badge View"
              >
                Badge
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                  viewMode === 'mobile'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mobile Pass View"
              >
                <Smartphone className="w-3 h-3" />
                Mobile
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Canvas Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-100/60 dark:bg-slate-950/40 min-h-[380px]">
          {viewMode === 'card' ? (
            /* Badge Physical Card format */
            <div className="relative w-full max-w-[340px]">
              <div
                className="w-full bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
                style={{ minHeight: '440px' }}
              >
                {/* Lanyard Clip Hole Visual */}
                <div className="w-full flex justify-center pt-3 pb-1">
                  <div className="w-12 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>

                {!isFlipped ? (
                  /* FRONT SIDE */
                  <div className="p-6 flex flex-col items-center text-center">
                    {/* Company Branding */}
                    <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {tenant.logo || 'AQ'}
                        </div>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 tracking-tight text-left">
                          {tenant.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    </div>

                    {/* Employee Avatar */}
                    <div className="mt-5 relative">
                      {employee.avatarUrl ? (
                        <img
                          src={employee.avatarUrl}
                          alt={employee.fullName}
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#0F766E]/20 border-2 border-white dark:border-slate-900 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0F766E] dark:text-[#14B8A6] font-bold text-2xl flex items-center justify-center ring-4 ring-[#0F766E]/20 border-2 border-white dark:border-slate-900 shadow-md">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Active Credential" />
                    </div>

                    {/* Name & Title */}
                    <h3 className="mt-3 font-bold text-base text-slate-900 dark:text-slate-100">
                      {employee.fullName}
                    </h3>
                    <p className="text-xs text-[#0F766E] dark:text-[#14B8A6] font-medium">
                      {employee.designation}
                    </p>

                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {employee.empCode}
                    </div>

                    {/* Key Attributes Grid */}
                    <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-left text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Department</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {employee.departmentName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Location</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {employee.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Blood Group</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                          {idCard.bloodGroup || 'O+'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Valid Until</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                          {idCard.validityDate}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>SECURE TOKEN</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {idCard.qrVerificationToken.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                ) : (
                  /* BACK SIDE */
                  <div className="p-6 flex flex-col justify-between" style={{ minHeight: '410px' }}>
                    <div>
                      {/* Top disclaimer */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Corporate Property Notice</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        This digital credential remains the property of {tenant.legalCompanyName || tenant.name}. If found, please return to any branch office or contact HR operations.
                      </p>

                      {/* Emergency Contact */}
                      <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                          Emergency Contact
                        </span>
                        <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                          {idCard.emergencyContact}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5">
                          {idCard.emergencyPhone}
                        </div>
                      </div>

                      {/* Office Address */}
                      <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 block">Office Branch</span>
                        <span className="leading-tight block mt-0.5">{tenant.address}</span>
                      </div>
                    </div>

                    {/* Center QR Code Block */}
                    <div className="flex flex-col items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="w-24 h-24 p-2 bg-white rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs flex items-center justify-center">
                        <QrCode className="w-20 h-20 text-slate-900" />
                      </div>
                      <button
                        onClick={() => setShowPublicVerification(true)}
                        className="mt-2 text-[11px] text-[#0F766E] dark:text-[#14B8A6] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Simulate Public QR Scan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Flip Button */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Flip to {isFlipped ? 'Front' : 'Back'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mobile Pass Format */
            <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#0F766E] text-white font-bold text-[10px] flex items-center justify-center">
                    {tenant.logo || 'AQ'}
                  </div>
                  <span className="font-semibold text-xs text-slate-100">{tenant.name}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                  PASS ACTIVE
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#14B8A6]" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-[#14B8A6] font-bold text-lg flex items-center justify-center border-2 border-[#14B8A6]">
                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-white">{employee.fullName}</h4>
                  <p className="text-xs text-slate-400">{employee.designation}</p>
                  <span className="text-[10px] font-mono text-[#14B8A6]">{employee.empCode}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div>
                  <span className="text-slate-500 block">Department</span>
                  <span className="font-medium text-white">{employee.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Work Location</span>
                  <span className="font-medium text-white">{employee.location}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center bg-white p-3 rounded-xl text-slate-900">
                <QrCode className="w-24 h-24" />
                <span className="text-[9px] font-mono text-slate-600 mt-1">
                  TAP NFC / SCAN AT ENTRANCE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 font-mono">
            Token: <span className="font-semibold text-slate-700 dark:text-slate-300">{idCard.qrVerificationToken.slice(0, 18)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Badge</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Limited Public Verification Modal (Simulated QR Endpoint) */}
      {showPublicVerification && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Official Credential Verified
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Public verification record for security personnel and visitors.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-left text-xs space-y-2 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant.legalCompanyName || tenant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-mono font-semibold text-[#0F766E]">{employee.empCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Designation:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{employee.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-600 font-semibold">Active & Valid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Validity:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">Through {idCard.validityDate}</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 italic">
              🔒 Confidentiality Notice: Sensitive financial, salary, PAN, and personal identity records are strictly withheld from public verification endpoints.
            </div>

            <button
              onClick={() => setShowPublicVerification(false)}
              className="mt-4 w-full py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close Verification Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
