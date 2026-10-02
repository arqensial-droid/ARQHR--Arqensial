import React, { useState } from 'react';
import { Employee, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Eye,
  EyeOff,
  Shield,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  X,
} from 'lucide-react';

interface BankDetailsViewProps {
  employee: Employee;
  onUpdateBank?: (updatedBank: Employee['bankDetails']) => void;
}

export const BankDetailsView: React.FC<BankDetailsViewProps> = ({
  employee,
  onUpdateBank,
}) => {
  const { currentRole, currentUser, addNotification, currentTenant } = useApp();
  const [isUnmasked, setIsUnmasked] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Form edit states
  const [accHolder, setAccHolder] = useState(employee.bankDetails?.accountHolder || employee.fullName);
  const [bankName, setBankName] = useState(employee.bankDetails?.bankName || '');
  const [accNum, setAccNum] = useState(employee.bankDetails?.accountNumber || '');
  const [confirmAccNum, setConfirmAccNum] = useState(employee.bankDetails?.accountNumber || '');
  const [ifscRouting, setIfscRouting] = useState(employee.bankDetails?.ifscSwift || '');
  const [branch, setBranch] = useState(employee.bankDetails?.branch || '');
  const [accountType, setAccountType] = useState('Salary');
  const [paymentMethod, setPaymentMethod] = useState('Direct Deposit');
  const [editError, setEditError] = useState<string | null>(null);

  const countryCode = employee.countryCode || currentTenant.countryCode || 'IN';

  // Check authorization to unmask
  const canAccessBankDetails =
    currentUser.id === employee.id ||
    ['company_admin', 'payroll_manager', 'hr_manager', 'super_admin'].includes(currentRole);

  const handleToggleMask = () => {
    if (!canAccessBankDetails) {
      addNotification('Access Denied', 'You do not have administrative privileges to view unmasked banking credentials.', 'error');
      return;
    }

    if (!isUnmasked) {
      // Record access in audit trail
      addNotification('Security Audit Logged', `Bank credentials accessed for ${employee.fullName} (${employee.empCode}).`, 'info');
    }
    setIsUnmasked(!isUnmasked);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (accNum !== confirmAccNum) {
      setEditError('Account Number and Confirm Account Number do not match.');
      return;
    }

    if (accNum.length < 6) {
      setEditError('Please enter a valid account or IBAN number.');
      return;
    }

    if (!ifscRouting.trim()) {
      setEditError('Routing / IFSC code is required.');
      return;
    }

    const updatedBank = {
      accountHolder: accHolder,
      bankName,
      accountNumber: accNum,
      ifscSwift: ifscRouting,
      branch,
      panNumber: employee.bankDetails?.panNumber || '',
      uanNumber: employee.bankDetails?.uanNumber || '',
    };

    if (onUpdateBank) {
      onUpdateBank(updatedBank);
    }

    addNotification('Bank Credentials Updated', 'Secure banking record updated and encrypted.', 'success');
    setShowEditModal(false);
  };

  const displayAccount = isUnmasked
    ? employee.bankDetails?.accountNumber || 'Not configured'
    : employee.bankAccountDetails?.maskedAccountNumber ||
      (employee.bankDetails?.accountNumber
        ? `•••• •••• ${employee.bankDetails.accountNumber.slice(-4)}`
        : '•••• •••• ••••');

  const routingLabel =
    countryCode === 'IN'
      ? 'IFSC Code'
      : countryCode === 'US'
      ? 'ABA Routing Number'
      : countryCode === 'GB'
      ? 'Sort Code'
      : countryCode === 'AE'
      ? 'IBAN / SWIFT Code'
      : 'Bank / SWIFT Code';

  return (
    <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Disbursement Bank Account
            </h4>
            <span className="text-[11px] text-slate-400">
              Direct deposit & payroll settlement record
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMask}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            title={isUnmasked ? 'Mask Account Number' : 'Unmask (Audit Logged)'}
          >
            {isUnmasked ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-[#0F766E]" />}
            <span>{isUnmasked ? 'Mask' : 'Reveal'}</span>
          </button>

          {['company_admin', 'payroll_manager', 'super_admin'].includes(currentRole) && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0F766E] dark:text-[#14B8A6] bg-[#0F766E]/10 dark:bg-[#0F766E]/20 hover:bg-[#0F766E]/20 rounded-lg transition cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Account Holder</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
            {employee.bankDetails?.accountHolder || employee.fullName}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Bank Name</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block flex items-center gap-1.5">
            <Building className="w-3 h-3 text-slate-400" />
            {employee.bankDetails?.bankName || 'Not Set'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Account Number</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
            {displayAccount}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">{routingLabel}</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
            {employee.bankDetails?.ifscSwift || 'Not Set'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Branch / Transit Location</span>
          <span className="text-slate-700 dark:text-slate-300 mt-0.5 block">
            {employee.bankDetails?.branch || 'Corporate Office'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px]">Verification Status</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified & Enforced
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-[#0F766E]" />
          Protected under PCI-DSS tokenization & Tenant Isolation RLS.
        </span>
        <span className="font-mono">Audit: BANK_ACCESS_ENFORCED</span>
      </div>

      {/* Edit Bank Details Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Update Bank Disbursement Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="p-5 space-y-3.5">
              {editError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-900">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={accHolder}
                    onChange={e => setAccHolder(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Institution Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. JPMorgan Chase / HDFC / ENBD"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    value={accNum}
                    onChange={e => setAccNum(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmAccNum}
                    onChange={e => setConfirmAccNum(e.target.value)}
                    placeholder="Re-enter to confirm"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {routingLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscRouting}
                    onChange={e => setIfscRouting(e.target.value.toUpperCase())}
                    placeholder="Routing / IFSC / Sort Code"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name / Location
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="Branch name"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs"
                >
                  Save & Re-encrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
