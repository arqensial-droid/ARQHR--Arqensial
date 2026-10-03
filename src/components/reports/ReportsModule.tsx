import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Download, FileSpreadsheet, Printer, Users, DollarSign, Calendar } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { employees, attendance, leaveRequests, payrollRuns, currentTenant } = useApp();
  const [reportType, setReportType] = useState<'headcount' | 'attendance' | 'payroll' | 'leaves'>('headcount');

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'headcount') {
      csvContent += "Emp Code,Name,Department,Designation,Status,Joining Date,Annual CTC\n";
      employees.forEach(e => {
        csvContent += `${e.empCode},"${e.fullName}","${e.departmentName}","${e.designation}",${e.status},${e.joiningDate},${e.salaryStructure.annualCTC}\n`;
      });
    } else if (reportType === 'attendance') {
      csvContent += "Date,Employee,Emp Code,Status,Check In,Check Out,Duration (hrs),WFH\n";
      attendance.forEach(a => {
        csvContent += `${a.date},"${a.employeeName}",${a.empCode},${a.status},${a.checkInTime},${a.checkOutTime || ''},${a.durationHours},${a.isWFH}\n`;
      });
    } else {
      csvContent += "Emp Code,Name,Leave Type,Start Date,End Date,Days,Status\n";
      leaveRequests.forEach(l => {
        csvContent += `${l.empCode},"${l.employeeName}",${l.leaveType},${l.startDate},${l.endDate},${l.daysCount},${l.status}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ARQENSIAL_${currentTenant.slug}_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center gap-3">
          {/* Company Logo with Fallback to ARQENSIAL Placeholder */}
          {currentTenant.logo ? (
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={currentTenant.logo}
                alt={currentTenant.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              AQ
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0F766E] dark:text-[#14B8A6]" />
              <span>Reports & Workforce Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified compliance records & statutory exports for <span className="font-semibold text-slate-700 dark:text-slate-300">{currentTenant.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Report switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#020617] p-1 rounded-lg border border-transparent dark:border-[#1E293B]">
            {[
              { id: 'headcount', label: 'Headcount' },
              { id: 'attendance', label: 'Attendance' },
              { id: 'payroll', label: 'Payroll' },
              { id: 'leaves', label: 'Leave' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as typeof reportType)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  reportType === tab.id
                    ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] shadow-xs border border-slate-200/60 dark:border-[#1E293B]'
                    : 'text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer transition-colors"
            title="Print or Export PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled Headcount</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">{employees.length}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">100% compliant profiles</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Punctuality Rate</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">96.4%</div>
          <span className="text-[11px] text-slate-500 font-mono">Within grace window</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Annual Attrition Rate</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">4.2%</div>
          <span className="text-[11px] text-slate-500 font-mono">Industry avg: 12.8%</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Disbursed (YTD)</span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-[#F8FAFC]">$22.4M</div>
          <span className="text-[11px] text-slate-500 font-mono">Audited direct batches</span>
        </div>
      </div>

      {/* Tabular Preview */}
      <div className="bg-white dark:bg-[#0F172A] rounded-xl border border-slate-200/80 dark:border-[#1E293B] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] uppercase font-mono tracking-wider">
            {reportType.toUpperCase()} DATASET PREVIEW
          </h2>
          <span className="text-xs text-slate-400 font-mono">Filtered for {currentTenant.slug}</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'headcount' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 dark:text-[#CBD5E1] border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Joining Date</th>
                  <th className="py-2.5 px-4 text-right">Annual CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono">
                {employees.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 px-4">{e.empCode}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-[#F8FAFC]">{e.fullName}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-[#CBD5E1]">{e.departmentName}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-[#CBD5E1]">{e.designation}</td>
                    <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-sans">{e.status}</td>
                    <td className="py-2.5 px-4 text-slate-500">{e.joiningDate}</td>
                    <td className="py-2.5 px-4 text-right">${e.salaryStructure.annualCTC.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'attendance' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#020617] font-bold text-slate-500 dark:text-[#CBD5E1] border-b border-slate-200 dark:border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Check-In</th>
                  <th className="py-2.5 px-4">Check-Out</th>
                  <th className="py-2.5 px-4">Hours</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60 font-mono">
                {attendance.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-2.5 px-4">{a.date}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-[#F8FAFC]">{a.employeeName}</td>
                    <td className="py-2.5 px-4">{a.checkInTime}</td>
                    <td className="py-2.5 px-4">{a.checkOutTime || '--'}</td>
                    <td className="py-2.5 px-4">{a.durationHours} hrs</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-[#CBD5E1]">{a.status}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-[#CBD5E1]">{a.isWFH ? 'WFH' : 'Office'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
