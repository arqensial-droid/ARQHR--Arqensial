import React, { useState, useRef } from 'react';
import {
  Tenant,
} from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  X,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Clock,
  Globe2,
  Sliders,
  Store,
  Briefcase,
  Users,
  Layers,
  Calendar,
  DollarSign,
  ArrowRight,
  KeyRound,
  Upload,
  Eye,
  Lock,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import { SupabaseAuthService } from '../../services/supabaseAuthService';

interface CompanyOnboardingModalProps {
  onClose: () => void;
  onCompanyCreated?: (newTenant: Tenant) => void;
}

// 5 Target Audience Presets tailored for small businesses, retail, clothing stores, and agencies
export const TARGET_BUSINESS_PRESETS = [
  {
    id: 'vastra_vatika',
    label: 'Vastra Vatika (Clothing Store)',
    badge: 'Popular · Clothing Boutique',
    name: 'Vastra Vatika',
    code: 'VASTRA',
    category: 'Clothing Stores & Ethnic Fashion Boutique',
    country: 'India',
    timezone: 'Asia/Kolkata (IST)',
    currencySymbol: '₹',
    currencyName: 'INR (₹)',
    logo: 'VV',
    address: 'Plot 42, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
    adminName: 'Priya Sharma',
    adminEmail: 'admin@vastravatika.com',
    adminPhone: '+91 98200 12345',
    departments: [
      'Store Floor & Sales',
      'Billing, POS & Cashier Desk',
      'Inventory, Sourcing & Stock',
      'Tailoring, Alterations & Fitting',
      'Store Management & Accounts',
    ],
    shiftName: 'Vastra Retail Store Shift (10:00 AM - 08:30 PM)',
    shiftStart: '10:00',
    shiftEnd: '20:30',
  },
  {
    id: 'retail_store',
    label: 'Metro Retail Mart (Retail & Grocery)',
    badge: 'Retail Store & FMCG',
    name: 'Metro Retail Mart',
    code: 'METRO',
    category: 'Retail Store & Supermarket',
    country: 'India',
    timezone: 'Asia/Kolkata (IST)',
    currencySymbol: '₹',
    currencyName: 'INR (₹)',
    logo: 'MR',
    address: 'Shop 1-4, Central Market, Borivali West, Mumbai, Maharashtra 400092',
    adminName: 'Ramesh Patel',
    adminEmail: 'ramesh.patel@metroretail.in',
    adminPhone: '+91 98201 67890',
    departments: [
      'Store Floor Sales',
      'Point of Sale & Billing',
      'Warehouse & Stock Receiving',
      'Store Logistics & Security',
      'Accounts & Store Management',
    ],
    shiftName: 'Store Day Shift (09:00 AM - 08:00 PM)',
    shiftStart: '09:00',
    shiftEnd: '20:00',
  },
  {
    id: 'maid_agency',
    label: 'Seva Domestic & Care Agency',
    badge: 'Maid & Care Agency',
    name: 'Seva Care & Maid Agency',
    code: 'SEVA',
    category: 'Domestic Staffing & Placement Agency',
    country: 'India',
    timezone: 'Asia/Kolkata (IST)',
    currencySymbol: '₹',
    currencyName: 'INR (₹)',
    logo: 'SC',
    address: 'Office 204, Crystal Plaza, Andheri East, Mumbai, Maharashtra 400069',
    adminName: 'Meenakshi Iyer',
    adminEmail: 'meenakshi@sevacare.org',
    adminPhone: '+91 98203 45678',
    departments: [
      'Caregiver Sourcing & Vetting',
      'Client Placement & Allocation',
      'Background Checks & Police Verification',
      'Field Training & Welfare',
      'Billing, Contracts & Payroll',
    ],
    shiftName: 'Operations Shift (09:00 AM - 06:00 PM)',
    shiftStart: '09:00',
    shiftEnd: '18:00',
  },
  {
    id: 'creative_agency',
    label: 'Nexora Media & Digital Agency',
    badge: 'Digital & Creative Agency',
    name: 'Nexora Media Agency',
    code: 'NEXORA',
    category: 'Creative Design & Performance Agency',
    country: 'India',
    timezone: 'Asia/Kolkata (IST)',
    currencySymbol: '₹',
    currencyName: 'INR (₹)',
    logo: 'NX',
    address: 'Level 3, One BKC, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    adminName: 'Kabir Singhania',
    adminEmail: 'kabir@nexoramedia.com',
    adminPhone: '+91 98202 34567',
    departments: [
      'Creative & Visual Design',
      'Client Servicing & Accounts',
      'Performance Marketing & SEO',
      'Web & Mobile Engineering',
      'People Operations',
    ],
    shiftName: 'Agency Regular Shift (09:30 AM - 06:30 PM)',
    shiftStart: '09:30',
    shiftEnd: '18:30',
  },
  {
    id: 'small_business',
    label: 'Apex Trading Co. (Small Business)',
    badge: 'Small Business & Trading',
    name: 'Apex Trading Company',
    code: 'APEX',
    country: 'India',
    timezone: 'Asia/Kolkata (IST)',
    currencySymbol: '₹',
    currencyName: 'INR (₹)',
    category: 'Wholesale Distribution & Trading',
    logo: 'AT',
    address: 'Gala 18, APMC Market 2, Vashi, Navi Mumbai, Maharashtra 400703',
    adminName: 'Vikas Agarwal',
    adminEmail: 'vikas@apextrading.in',
    adminPhone: '+91 98204 99123',
    departments: [
      'Procurement & Sourcing',
      'Wholesale Sales & Orders',
      'Warehouse Inventory & Dispatch',
      'Accounts, GST & Invoicing',
      'Administration',
    ],
    shiftName: 'General Trade Shift (09:30 AM - 07:00 PM)',
    shiftStart: '09:30',
    shiftEnd: '19:00',
  },
];

function generateSecureTempPassword(prefix = 'Vastra'): string {
  const years = ['2026', '2027'];
  const symbols = ['@', '#', '$', '!'];
  const randomYear = years[Math.floor(Math.random() * years.length)];
  const randomSym = symbols[Math.floor(Math.random() * symbols.length)];
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  const cleanPrefix = prefix.replace(/[^a-zA-Z]/g, '').slice(0, 6) || 'Secure';
  return `${cleanPrefix}${randomSym}${randomYear}${randomChars}`;
}

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({
  onClose,
  onCompanyCreated,
}) => {
  const { addNotification, createTenant, switchTenant } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Preset (default to Vastra Vatika for immediate usability)
  const [activePresetId, setActivePresetId] = useState<string>('vastra_vatika');

  // 1. Company Information
  const [companyName, setCompanyName] = useState('Vastra Vatika');
  const [companyCode, setCompanyCode] = useState('VASTRA');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [companyLogo, setCompanyLogo] = useState('VV');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [businessCategory, setBusinessCategory] = useState('Clothing Stores & Ethnic Fashion Boutique');

  // 2. Primary Admin Information
  const [adminFullName, setAdminFullName] = useState('Priya Sharma');
  const [adminEmail, setAdminEmail] = useState('admin@vastravatika.com');
  const [adminMobile, setAdminMobile] = useState('+91 98200 12345');

  // 3. System Credentials & Options
  const [tempPassword, setTempPassword] = useState(() => generateSecureTempPassword('Vastra'));
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);

  // 4. Settings (Module Activation)
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);
  const [leaveEnabled, setLeaveEnabled] = useState(true);
  const [payrollEnabled, setPayrollEnabled] = useState(true);

  // Email Preview Modal State
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Created State
  const [createdTenantData, setCreatedTenantData] = useState<{
    tenant: Tenant;
    tempPassword: string;
    adminEmail: string;
    adminFullName: string;
    departments: string[];
    shiftName: string;
  } | null>(null);

  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedLoginUrl, setCopiedLoginUrl] = useState(false);

  // Apply Target Audience Preset
  const handleApplyPreset = (preset: typeof TARGET_BUSINESS_PRESETS[0]) => {
    setActivePresetId(preset.id);
    setCompanyName(preset.name);
    setCompanyCode(preset.code);
    setBusinessCategory(preset.category);
    setCountry(preset.country);
    setTimezone(preset.timezone);
    setCompanyLogo(preset.logo);
    setUploadedLogoUrl(null);
    setAdminFullName(preset.adminName);
    setAdminEmail(preset.adminEmail);
    setAdminMobile(preset.adminPhone);
    setTempPassword(generateSecureTempPassword(preset.code));
  };

  const handleRegeneratePassword = () => {
    setTempPassword(generateSecureTempPassword(companyCode || companyName || 'Secure'));
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('File Error', 'Logo file size should be under 2 MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedLogoUrl(reader.result);
          addNotification('Logo Attached', 'Custom company logo loaded successfully.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler: Execute the 7 steps
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !companyCode.trim()) {
      addNotification('Validation Error', 'Company Name and Company Code are required.', 'error');
      return;
    }
    if (!adminFullName.trim() || !adminEmail.trim()) {
      addNotification('Validation Error', 'Primary Admin Name and Work Email are required.', 'error');
      return;
    }

    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = `tenant-${slug.substring(0, 15)}-${Date.now().toString(36)}`;

    // Selected preset departments and shift
    const preset = TARGET_BUSINESS_PRESETS.find(p => p.id === activePresetId);
    const departmentNames = preset ? preset.departments : [
      'Operations & Floor Management',
      'Sales & Customer Orders',
      'Inventory, Stock & Supplies',
      'Billing, Accounts & Payroll',
      'General Administration',
    ];

    const shiftName = preset ? preset.shiftName : 'Standard Business Shift (09:30 AM - 06:30 PM)';
    const shiftStart = preset ? preset.shiftStart : '09:30';
    const shiftEnd = preset ? preset.shiftEnd : '18:30';

    // 1. Create Tenant (No subscription plans, no billing restrictions)
    const newTenant: Tenant = {
      id: tenantId,
      name: companyName.trim(),
      slug,
      domain: `${slug}.arqhr.io`,
      logo: (companyLogo.trim() || companyName.substring(0, 2)).toUpperCase(),
      industry: businessCategory,
      companyCode: companyCode.trim().toUpperCase(),
      planId: 'managed',
      planName: 'Enterprise Managed Instance',
      employeeCount: 1,
      status: 'active',
      countryCode: country === 'United States' ? 'US' : country === 'UAE' ? 'AE' : country === 'United Kingdom' ? 'GB' : country === 'Singapore' ? 'SG' : 'IN',
      legalCompanyName: `${companyName.trim()} Private Limited`,
      companyTaxId: country === 'India' ? '27AABCV1234F1Z0' : country === 'United States' ? 'EIN-12-3456789' : 'TRN-10023456',
      registrationNumber: `REG-${companyCode.trim()}-${Date.now().toString(36).toUpperCase()}`,
      timezone,
      currency: country === 'India' ? 'INR (₹)' : country === 'UAE' ? 'AED' : country === 'United Kingdom' ? 'GBP (£)' : country === 'Singapore' ? 'SGD ($)' : 'USD ($)',
      currencySymbol: country === 'India' ? '₹' : country === 'UAE' ? 'AED ' : country === 'United Kingdom' ? '£' : '$',
      address: preset ? preset.address : 'Commercial Boulevard, Main Road',
      contactEmail: adminEmail.trim(),
      contactPhone: adminMobile.trim() || '+91 98200 12345',
      mrr: 0,
      createdAt: new Date().toISOString(),
      settings: {
        attendanceEnabled,
        leaveEnabled,
        payrollEnabled,
        forcePasswordChangeOnFirstLogin: forcePasswordChange,
        geoFencingEnabled: true,
        selfieAttendanceEnabled: true,
        ipRestrictionEnabled: false,
        twoFactorEnforced: false,
        allowedIps: [],
        officeCoordinates: { lat: 19.0596, lng: 72.8295, radiusMeters: 400 },
      },
    };

    // 2-6: Invoke createTenant in AppContext which provisions:
    // - Tenant
    // - Company Admin User (with adminFullName, adminEmail, adminMobile)
    // - Default Departments
    // - Attendance Policy (Shift)
    // - Leave Policy
    // - Company Settings
    createTenant({
      ...newTenant,
      adminFullName: adminFullName.trim(),
      adminEmail: adminEmail.trim(),
      adminMobile: adminMobile.trim(),
      tempPassword,
      sendWelcomeEmail,
      customDepartments: departmentNames,
      shiftName,
      shiftStart,
      shiftEnd,
    } as any);

    // 7. Send Login Credentials & record audit trail
    SupabaseAuthService.logAudit({
      tenantId: newTenant.id,
      userId: adminEmail.trim(),
      userEmail: adminEmail.trim(),
      userName: adminFullName.trim(),
      role: 'company_admin',
      action: 'COMPANY_REGISTERED',
      category: 'tenant',
      details: `Provisioned managed company [${newTenant.name}] (${newTenant.companyCode}) for admin ${adminFullName} (${adminEmail})`,
      metadata: {
        companyCode: newTenant.companyCode,
        sendWelcomeEmail,
        forcePasswordChange,
        attendanceEnabled,
        leaveEnabled,
        payrollEnabled,
        departmentsCount: departmentNames.length,
      },
    });

    // Save Created Summary Data
    setCreatedTenantData({
      tenant: newTenant,
      tempPassword,
      adminEmail: adminEmail.trim(),
      adminFullName: adminFullName.trim(),
      departments: departmentNames,
      shiftName,
    });

    if (onCompanyCreated) {
      onCompanyCreated(newTenant);
    }
  };

  const handleLaunchCompany = () => {
    if (createdTenantData) {
      switchTenant(createdTenantData.tenant.id);
      addNotification(
        'Workspace Launched',
        `Switched into ${createdTenantData.tenant.name} (${createdTenantData.tenant.companyCode}). You are now viewing this company's portal.`,
        'success'
      );
    }
    onClose();
  };

  const copyLoginUrl = () => {
    const url = `https://${createdTenantData?.tenant.slug || 'vastra-vatika'}.arqhr.io/login`;
    navigator.clipboard.writeText(url);
    setCopiedLoginUrl(true);
    setTimeout(() => setCopiedLoginUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/90 dark:bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/15 flex items-center justify-center text-[#0F766E] dark:text-[#14B8A6] shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                  Provision New Company Workspace
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] border border-[#0F766E]/30">
                  Manually Managed
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Setup for small businesses, retail stores, clothing stores, and agencies · Zero subscription friction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!createdTenantData ? (
            <form onSubmit={handleCreateCompany} className="space-y-6">
              {/* 1. Target Audience 1-Click Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>Target Audience Presets (1-Click Auto Fill)</span>
                  </span>
                  <span className="text-[10px] text-[#0F766E] dark:text-[#14B8A6] font-mono font-bold">
                    Vastra Vatika Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TARGET_BUSINESS_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        activePresetId === preset.id
                          ? 'bg-teal-50 dark:bg-[#0F766E]/20 border-[#0F766E] text-slate-900 dark:text-white shadow-xs ring-1 ring-[#0F766E]'
                          : 'bg-slate-50 dark:bg-[#020617] border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{preset.name}</span>
                        {activePresetId === preset.id && (
                          <CheckCircle2 className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.badge}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Company Information Section */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Company Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Vastra Vatika"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyCode}
                      onChange={e => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="VASTRA"
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={e => {
                        const val = e.target.value;
                        setCountry(val);
                        if (val === 'India') setTimezone('Asia/Kolkata (IST)');
                        else if (val === 'United States') setTimezone('America/New_York (EST)');
                        else if (val === 'UAE') setTimezone('Asia/Dubai (GST)');
                        else if (val === 'Singapore') setTimezone('Asia/Singapore (SGT)');
                        else if (val === 'United Kingdom') setTimezone('Europe/London (GMT)');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E] cursor-pointer"
                    >
                      <option value="India">India (₹ / IST)</option>
                      <option value="United States">United States ($ / EST)</option>
                      <option value="United Kingdom">United Kingdom (£ / GMT)</option>
                      <option value="UAE">United Arab Emirates (AED / GST)</option>
                      <option value="Singapore">Singapore (SGD / SGT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-2">
                      {uploadedLogoUrl ? (
                        <img
                          src={uploadedLogoUrl}
                          alt="Logo Preview"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-[#1E293B] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {companyLogo || 'VV'}
                        </div>
                      )}

                      <input
                        type="text"
                        maxLength={3}
                        value={companyLogo}
                        onChange={e => setCompanyLogo(e.target.value.toUpperCase())}
                        placeholder="VV"
                        className="w-16 px-2 py-2 text-xs font-bold text-center uppercase rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                        title="Initials"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium rounded-lg border border-slate-300 dark:border-[#1E293B] bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                        title="Upload Logo File"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Business Category
                  </label>
                  <input
                    type="text"
                    value={businessCategory}
                    onChange={e => setBusinessCategory(e.target.value)}
                    placeholder="e.g. Clothing Stores, Retail Boutique, Agency, Domestic Staffing"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {/* 3. Primary Admin Information */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Primary Admin Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFullName}
                      onChange={e => setAdminFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@vastravatika.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={adminMobile}
                      onChange={e => setAdminMobile(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. System Credentials & Credentials Security */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>System Credentials & Delivery</span>
                </h3>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Auto-Generated Temporary Password
                    </span>
                    <span className="font-mono text-sm font-bold text-[#0F766E] dark:text-[#14B8A6] tracking-wider">
                      {tempPassword}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendWelcomeEmail}
                        onChange={e => setSendWelcomeEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                      />
                      <span className="font-medium">Send Welcome Email with login URL and access credentials</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(true)}
                      className="text-[11px] font-semibold text-[#0F766E] dark:text-[#14B8A6] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview Email</span>
                    </button>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forcePasswordChange}
                      onChange={e => setForcePasswordChange(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                    />
                    <span className="font-medium">Force Password Change On First Login</span>
                  </label>
                </div>
              </div>

              {/* 5. Settings: Attendance, Leave, Payroll */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Settings & Modules</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      attendanceEnabled
                        ? 'bg-teal-50/60 dark:bg-[#0F766E]/15 border-[#0F766E]/50'
                        : 'bg-slate-50 dark:bg-[#020617] border-slate-200 dark:border-[#1E293B]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        <span>Attendance Enabled</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Shifts, Selfie, Geofencing</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={attendanceEnabled}
                      onChange={e => setAttendanceEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                    />
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      leaveEnabled
                        ? 'bg-teal-50/60 dark:bg-[#0F766E]/15 border-[#0F766E]/50'
                        : 'bg-slate-50 dark:bg-[#020617] border-slate-200 dark:border-[#1E293B]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        <span>Leave Enabled</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Casual, Sick, Festival Leave</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={leaveEnabled}
                      onChange={e => setLeaveEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                    />
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      payrollEnabled
                        ? 'bg-teal-50/60 dark:bg-[#0F766E]/15 border-[#0F766E]/50'
                        : 'bg-slate-50 dark:bg-[#020617] border-slate-200 dark:border-[#1E293B]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                        <span>Payroll Enabled</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Salary Structures, Payslips, TDS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={payrollEnabled}
                      onChange={e => setPayrollEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Provision {companyName || 'Company'} Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Success Summary View */
            <div className="space-y-5 text-center py-2 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {createdTenantData.tenant.name} Successfully Provisioned!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Company Code <strong>{createdTenantData.tenant.companyCode}</strong> is now live with 5 default business departments, attendance policy, leave policy, and primary admin credentials.
                </p>
              </div>

              {/* Credentials & System Access Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span>Primary Admin Login Credentials</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">READY TO LOGIN</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Admin Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {createdTenantData.adminFullName}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Login Email:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {createdTenantData.adminEmail}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Temporary Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">
                      {createdTenantData.tempPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdTenantData.tempPassword);
                        setCopiedPass(true);
                        setTimeout(() => setCopiedPass(false), 2000);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Workspace Portal URL:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      https://{createdTenantData.tenant.slug}.arqhr.io
                    </span>
                    <button
                      type="button"
                      onClick={copyLoginUrl}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedLoginUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Force Password Change:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Yes (On First Login)</span>
                </div>
              </div>

              {/* Initialized Setup Summary */}
              <div className="max-w-md mx-auto text-left space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Initialized Default Departments (5):
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {createdTenantData.departments.map(d => (
                      <span
                        key={d}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Attendance Policy Shift:
                  </span>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                    {createdTenantData.shiftName} · Grace Period: 20 min · Geofencing Active
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailPreview(true)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
                  <span>Preview Welcome Email</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={handleLaunchCompany}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch & Switch into {createdTenantData.tenant.name} Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over / Modal for Welcome Email Preview */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-[#0F172A]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Automated Welcome Email Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-700 dark:text-slate-300 bg-white dark:bg-[#020617] max-h-[75vh] overflow-y-auto">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <div><strong>To:</strong> {adminFullName} &lt;{adminEmail}&gt;</div>
                <div><strong>Subject:</strong> Welcome to ARQHR · Your {companyName} Workspace is Live</div>
                <div><strong>From:</strong> ARQHR Provisioning &lt;no-reply@arqhr.io&gt;</div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
                    {companyLogo || 'VV'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{companyName}</div>
                    <div className="text-[10px] text-slate-400">Enterprise HRMS Workspace</div>
                  </div>
                </div>

                <p>Hello {adminFullName},</p>
                <p>
                  Your company workspace for <strong>{companyName}</strong> has been provisioned on ARQHR. You have been designated as the <strong>Primary Company Administrator</strong>.
                </p>

                <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-[#0F766E]/10 border border-[#0F766E]/30 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white text-xs">Your Access Credentials:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Portal URL:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        https://{companyCode.toLowerCase()}.arqhr.io
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Company Code:</span>
                      <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">{companyCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Login Email:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{adminEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Temporary Password:</span>
                      <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6]">{tempPassword}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Security Requirement:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You will be required to change your password immediately upon your first sign-in. Please do not share this temporary password with unauthorized personnel.
                  </p>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Active Modules: {attendanceEnabled ? '✓ Attendance & Shifts' : ''} {leaveEnabled ? '· ✓ Leaves' : ''} {payrollEnabled ? '· ✓ Payroll' : ''}
                </p>

                <p className="text-[11px] text-slate-400">
                  Regards,<br />
                  ARQHR Platform Administration
                </p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailPreview(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
