import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  DollarSign,
  Briefcase,
  X,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Tenant, CountryCode } from '../../types';

interface FreshStartWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialCompanyName?: string;
}

export const FreshStartWizard: React.FC<FreshStartWizardProps> = ({
  isOpen,
  onClose,
  initialCompanyName = '',
}) => {
  const { createTenant, switchTenant, addNotification } = useApp();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Create Company
  const [companyName, setCompanyName] = useState(initialCompanyName || 'Vastra Vatika');
  const [companyCode, setCompanyCode] = useState('VASTRA');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [companyLogo, setCompanyLogo] = useState('VV');

  // Step 2: Business Information
  const [legalName, setLegalName] = useState('Vastra Vatika Apparels Private Limited');
  const [companyTaxId, setCompanyTaxId] = useState('27AABCV8899F1Z2');
  const [registrationNumber, setRegistrationNumber] = useState('U18101MH2023PTC456789');
  const [currency, setCurrency] = useState('INR (₹)');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [address, setAddress] = useState('Shop 12-14, Heritage Silk Plaza, Linking Road, Bandra West, Mumbai 400050');
  const [businessEmail, setBusinessEmail] = useState('contact@vastravatika.com');
  const [businessPhone, setBusinessPhone] = useState('+91 22 6123 4500');
  const [industry, setIndustry] = useState('Clothing Store & Retail Fashion');

  // Step 3: Store & Branch Setup
  const [storeName, setStoreName] = useState('Bandra West Flagship Store');
  const [storeCode, setStoreCode] = useState('MUM-BND-01');
  const [storeCity, setStoreCity] = useState('Mumbai');
  const [geofenceRadius, setGeofenceRadius] = useState(350);
  const [shiftName, setShiftName] = useState('Store Retail Shift (10:00 AM - 08:30 PM)');
  const [shiftStart, setShiftStart] = useState('10:00');
  const [shiftEnd, setShiftEnd] = useState('20:30');
  const [selfieEnabled, setSelfieEnabled] = useState(true);

  // Step 4: User & Staff Setup
  const [adminFullName, setAdminFullName] = useState('Priya Sharma');
  const [adminEmail, setAdminEmail] = useState('admin@vastravatika.com');
  const [adminPhone, setAdminPhone] = useState('+91 98200 12345');
  const [adminDesignation, setAdminDesignation] = useState('Managing Director & Store Owner');
  const [tempPassword, setTempPassword] = useState('Vastra@2026Secure!');
  const [copiedPass, setCopiedPass] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);
  const [departments, setDepartments] = useState<string[]>([
    'Store Floor & Sales',
    'Billing, POS & Cashier Desk',
    'Inventory, Stock & Supplies',
    'Tailoring, Alterations & Fitting',
    'Store Management & Accounts',
  ]);

  // Step 5: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'managed_client' | 'unlimited_retail'>('managed_client');
  const [attendanceEnabled, setAttendanceEnabled] = useState(true);
  const [leaveEnabled, setLeaveEnabled] = useState(true);
  const [payrollEnabled, setPayrollEnabled] = useState(true);

  if (!isOpen) return null;

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === 'India') {
      setTimezone('Asia/Kolkata (IST)');
      setCurrency('INR (₹)');
      setCurrencySymbol('₹');
      setCompanyTaxId('27AABCV8899F1Z2');
    } else if (c === 'United States') {
      setTimezone('America/New_York (EST)');
      setCurrency('USD ($)');
      setCurrencySymbol('$');
      setCompanyTaxId('EIN: 12-3456789');
    } else if (c === 'UAE') {
      setTimezone('Asia/Dubai (GST)');
      setCurrency('AED');
      setCurrencySymbol('AED ');
      setCompanyTaxId('TRN: 100482910300003');
    } else if (c === 'United Kingdom') {
      setTimezone('Europe/London (GMT)');
      setCurrency('GBP (£)');
      setCurrencySymbol('£');
      setCompanyTaxId('VAT: GB123456789');
    } else if (c === 'Singapore') {
      setTimezone('Asia/Singapore (SGT)');
      setCurrency('SGD ($)');
      setCurrencySymbol('S$');
      setCompanyTaxId('UEN: 202312345M');
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleFinishWizard = () => {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = `tenant-${slug.substring(0, 14)}-${Date.now().toString(36)}`;

    const newTenant: Tenant = {
      id: tenantId,
      name: companyName.trim(),
      slug,
      domain: `${slug}.arqhr.io`,
      logo: (companyLogo.trim() || companyName.substring(0, 2)).toUpperCase(),
      industry,
      companyCode: companyCode.trim().toUpperCase(),
      planId: 'managed',
      planName: 'Enterprise Managed Instance',
      employeeCount: 1,
      status: 'active',
      countryCode: (country === 'United States' ? 'US' : country === 'UAE' ? 'AE' : country === 'United Kingdom' ? 'GB' : country === 'Singapore' ? 'SG' : 'IN') as CountryCode,
      legalCompanyName: legalName.trim(),
      companyTaxId: companyTaxId.trim(),
      registrationNumber: registrationNumber.trim(),
      timezone,
      currency,
      currencySymbol,
      address,
      contactEmail: businessEmail.trim(),
      contactPhone: businessPhone.trim(),
      mrr: 0,
      createdAt: new Date().toISOString(),
      settings: {
        attendanceEnabled,
        leaveEnabled,
        payrollEnabled,
        forcePasswordChangeOnFirstLogin: forcePasswordChange,
        geoFencingEnabled: true,
        selfieAttendanceEnabled: selfieEnabled,
        ipRestrictionEnabled: false,
        twoFactorEnforced: false,
        allowedIps: [],
        officeCoordinates: { lat: 19.0596, lng: 72.8295, radiusMeters: geofenceRadius },
      },
    };

    createTenant({
      ...newTenant,
      adminFullName,
      adminEmail,
      adminMobile: adminPhone,
      tempPassword,
      customDepartments: departments,
      shiftName,
      shiftStart,
      shiftEnd,
    } as any);

    switchTenant(newTenant.id);
    addNotification('Fresh Start Completed', `Workspace for ${newTenant.name} is now live and configured.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0B132B] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Wizard Header with Steps Tracker */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/90 dark:bg-[#0F172A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs">
                {currentStep}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Fresh Start Wizard
              </h2>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                Step {currentStep} of 5
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStep === 1 && 'Step 1: Create Company Profile'}
              {currentStep === 2 && 'Step 2: Business & Legal Information'}
              {currentStep === 3 && 'Step 3: Store & Shift Setup'}
              {currentStep === 4 && 'Step 4: User & Staff Hierarchy'}
              {currentStep === 5 && 'Step 5: Plan & Module Confirmation'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 flex">
          {[1, 2, 3, 4, 5].map(step => (
            <div
              key={step}
              className={`flex-1 transition-all duration-300 ${
                step <= currentStep ? 'bg-[#0F766E]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* STEP 1: CREATE COMPANY */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                <Building2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Step 1: Create Company Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Vastra Vatika"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Company Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyCode}
                    onChange={e => setCompanyCode(e.target.value.toUpperCase())}
                    placeholder="VASTRA"
                    className="w-full px-3 py-2 font-mono font-bold rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Operating Country
                  </label>
                  <select
                    value={country}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E] cursor-pointer"
                  >
                    <option value="India">India (₹ / IST)</option>
                    <option value="United States">United States ($ / EST)</option>
                    <option value="United Kingdom">United Kingdom (£ / GMT)</option>
                    <option value="UAE">United Arab Emirates (AED / GST)</option>
                    <option value="Singapore">Singapore (SGD / SGT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    System Timezone
                  </label>
                  <input
                    type="text"
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Company Logo Initials
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {companyLogo || 'VV'}
                    </div>
                    <input
                      type="text"
                      maxLength={3}
                      value={companyLogo}
                      onChange={e => setCompanyLogo(e.target.value.toUpperCase())}
                      placeholder="VV"
                      className="w-full px-3 py-2 font-bold text-center uppercase rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                  Business / Retail Category
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Clothing Stores, Retail Boutique, Agency, Domestic Services"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                <Briefcase className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Step 2: Business & Legal Information</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="e.g. Vastra Vatika Apparels Private Limited"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Tax ID / GSTIN / EIN
                  </label>
                  <input
                    type="text"
                    value={companyTaxId}
                    onChange={e => setCompanyTaxId(e.target.value)}
                    placeholder="27AABCV8899F1Z2"
                    className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Registration / CIN Number
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    placeholder="U18101MH2023PTC456789"
                    className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={e => setBusinessEmail(e.target.value)}
                    placeholder="contact@vastravatika.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={e => setBusinessPhone(e.target.value)}
                    placeholder="+91 22 6123 4500"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                  Headquarters / Store Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Full physical commercial address..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: STORE & BRANCH SETUP */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                <Store className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Step 3: Store & Shift Setup</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Primary Store / Outlet Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="Bandra West Flagship Store"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Store Code
                  </label>
                  <input
                    type="text"
                    value={storeCode}
                    onChange={e => setStoreCode(e.target.value.toUpperCase())}
                    placeholder="STR-01"
                    className="w-full px-3 py-2 font-mono font-bold rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Store City
                  </label>
                  <input
                    type="text"
                    value={storeCity}
                    onChange={e => setStoreCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                    Geofencing Radius (Meters)
                  </label>
                  <input
                    type="number"
                    value={geofenceRadius}
                    onChange={e => setGeofenceRadius(Number(e.target.value))}
                    min={100}
                    max={2000}
                    className="w-full px-3 py-2 font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-[#020617] text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-2">
                <span className="font-bold block text-xs text-slate-900 dark:text-white">
                  Store Attendance Schedule (Shift Policy)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] text-slate-500 mb-0.5">Shift Name</label>
                    <input
                      type="text"
                      value={shiftName}
                      onChange={e => setShiftName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={shiftStart}
                      onChange={e => setShiftStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={shiftEnd}
                      onChange={e => setShiftEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfieEnabled}
                    onChange={e => setSelfieEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span>Enable Mobile Selfie Attendance & Facial Check-in</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: USER & STAFF SETUP */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                <Users className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Step 4: User & Staff Hierarchy</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  Primary Company Owner / Admin Account
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={adminFullName}
                      onChange={e => setAdminFullName(e.target.value)}
                      placeholder="Priya Sharma"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                      Login Email *
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@vastravatika.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={e => setAdminPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={adminDesignation}
                      onChange={e => setAdminDesignation(e.target.value)}
                      placeholder="Managing Director & Store Owner"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-[#1E293B] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50/50 dark:bg-[#0F766E]/15 border border-[#0F766E]/30">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Auto-Generated Temporary Password
                    </span>
                    <span className="font-mono font-bold text-[#0F766E] dark:text-[#14B8A6] text-xs">
                      {tempPassword}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-800 dark:text-slate-200">
                  Initialized Business Departments (5):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {departments.map((dept, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PLAN SELECTION & MODULE ACTIVATION */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#1E293B]">
                <Layers className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Step 5: Plan Selection & Launch</span>
              </div>

              {/* Managed Workspace Plan Card */}
              <div className="p-4 rounded-xl border-2 border-[#0F766E] bg-teal-50/50 dark:bg-[#0F766E]/15 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Enterprise Managed Client Workspace
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white">
                    Zero Seat Limits · Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Manually orchestrated by ARQHR Administrators. Unlimited employees, dedicated multi-tenant isolation, and complete operational modules included.
                </p>
              </div>

              {/* Module Toggles */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Activate Core Modules:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">✓ Attendance & Shifts</span>
                    <input
                      type="checkbox"
                      checked={attendanceEnabled}
                      onChange={e => setAttendanceEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E]"
                    />
                  </label>
                  <label className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">✓ Leaves & Holidays</span>
                    <input
                      type="checkbox"
                      checked={leaveEnabled}
                      onChange={e => setLeaveEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E]"
                    />
                  </label>
                  <label className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E293B] flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">✓ Payroll & Payslips</span>
                    <input
                      type="checkbox"
                      checked={payrollEnabled}
                      onChange={e => setPayrollEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0F766E]"
                    />
                  </label>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-[#1E293B] space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Workspace Summary</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Company: <strong>{companyName}</strong> ({companyCode})</div>
                  <div>Country: <strong>{country}</strong> ({currency})</div>
                  <div>Store: <strong>{storeName}</strong> ({storeCity})</div>
                  <div>Admin: <strong>{adminFullName}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#0F172A] flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => (prev > 1 ? ((prev - 1) as any) : prev))}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => (prev < 5 ? ((prev + 1) as any) : prev))}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0F766E] hover:bg-[#115E59] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch {companyName || 'Company'} Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
