import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData?: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    clientName: string;
    clientAddress: string;
    clientGst?: string;
    items: Array<{ description: string; qty: number; unitPrice: number; total: number }>;
  };
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  invoiceData,
}) => {
  const { currentTenant } = useApp();

  if (!isOpen) return null;

  const defaultInvoice = {
    invoiceNumber: 'INV-2026-089',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    dueDate: '25 Oct 2026',
    clientName: 'Global Enterprise Solutions Ltd',
    clientAddress: 'Tower 4, Embassy Tech Village, Outer Ring Road, Bangalore - 560103',
    clientGst: '29AAACG0561K1ZS',
    items: [
      { description: 'Enterprise Cloud Platform License (Monthly)', qty: 1, unitPrice: 12000, total: 12000 },
      { description: 'Premium 24/7 SLA Support & Dedicated TAM', qty: 1, unitPrice: 2250, total: 2250 },
    ],
  };

  const invoice = invoiceData || defaultInvoice;
  const subtotal = invoice.items.reduce((acc, i) => acc + i.total, 0);
  const tax = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50 dark:bg-[#020617]/50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6]">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tax Invoice & Exported PDF Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="overflow-y-auto p-8 sm:p-10 space-y-8 bg-white text-slate-900 font-sans print:p-0">
          {/* Header: Company Logo & Basic Meta */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6">
            <div className="space-y-3">
              {/* Display Company Logo or ARQENSIAL Placeholder */}
              {currentTenant.logo ? (
                <div className="h-14 max-w-[220px] flex items-center">
                  <img
                    src={currentTenant.logo}
                    alt={currentTenant.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-black text-sm shadow-xs">
                    AQ
                  </div>
                  <div>
                    <span className="font-black text-lg tracking-tight text-slate-950 block">
                      {currentTenant.name || 'ARQENSIAL'}
                    </span>
                    <span className="text-[10px] text-[#0F766E] font-mono block -mt-0.5 font-bold">
                      ENTERPRISE CLOUD
                    </span>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                <p className="font-bold text-slate-950">{currentTenant.name}</p>
                <p>{currentTenant.address || 'DLF Cyber City, Sector 24'}</p>
                <p>
                  {currentTenant.city || 'Gurugram'}, {currentTenant.state || 'Haryana'} - {currentTenant.pincode || '122002'}
                </p>
                <p className="font-mono text-[11px]">
                  GSTIN / Tax ID: <span className="font-bold">{currentTenant.gstNumber || '07AABCA1234F1Z8'}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentTenant.contactEmail || 'billing@arqensial.com'} · {currentTenant.contactPhone || '+91 98765 43210'}
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="font-mono text-2xl font-black text-slate-950 block tracking-tight">
                TAX INVOICE
              </span>
              <span className="font-mono text-xs font-bold text-[#0F766E] block">
                {invoice.invoiceNumber}
              </span>
              <div className="text-xs text-slate-600 pt-2 space-y-0.5">
                <p>
                  Invoice Date: <span className="font-mono font-medium">{invoice.date}</span>
                </p>
                <p>
                  Due Date: <span className="font-mono font-medium">{invoice.dueDate}</span>
                </p>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold mt-1">
                  STATUS: AUTHORIZED
                </span>
              </div>
            </div>
          </div>

          {/* Bill To Details */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                BILLED TO (CLIENT)
              </span>
              <p className="font-bold text-slate-900 text-sm">{invoice.clientName}</p>
              <p className="text-slate-600 leading-relaxed">{invoice.clientAddress}</p>
              {invoice.clientGst && (
                <p className="font-mono text-[11px] text-slate-600 pt-1">
                  Client GSTIN: <span className="font-semibold">{invoice.clientGst}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                PAYMENT INSTRUCTIONS
              </span>
              <p className="font-medium text-slate-800">Direct Bank Wire / NEFT Transfer</p>
              <p className="text-slate-600 font-mono text-[11px]">Bank: HDFC Bank Limited</p>
              <p className="text-slate-600 font-mono text-[11px]">A/C No: 50200049182391</p>
              <p className="text-slate-600 font-mono text-[11px]">IFSC Code: HDFC0000240</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-left">Item & Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate ($)</th>
                  <th className="py-2.5 px-4 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-center font-mono">{item.qty}</td>
                    <td className="py-3 px-4 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">${item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono font-semibold">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Integrated GST (18%):</span>
                <span className="font-mono font-semibold">${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-bold text-slate-950">
                <span>Grand Total:</span>
                <span className="font-mono text-[#0F766E]">${grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Terms & Conditions:</p>
            <p>1. Payment is due within 15 days of invoice issue date.</p>
            <p>2. This is a computer-generated tax invoice verified under multi-tenant secure storage.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
