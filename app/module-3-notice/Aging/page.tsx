// types/notice.ts
export interface AgingNotice {
  businessId: string;
  violationType: 'Fire Safety' | 'Sanitation' | 'Environmental' | 'Building Code';
  notice: string;
  violationDate: string;
  deadline: string;
  timeStatus: string;
  status: 'COMPLETED' | 'PENDING' | 'CEASE AND DESIST';
}
import React from 'react';

const notices: AgingNotice[] = [
  { businessId: '73-4422523', violationType: 'Fire Safety', notice: 'NOTICE 1', violationDate: 'Feb 25, 2026', deadline: 'Feb 28, 2026', timeStatus: 'Closed Before Deadline', status: 'COMPLETED' },
  { businessId: '80-6640823', violationType: 'Sanitation', notice: 'NOTICE 2', violationDate: 'Feb 15, 2026', deadline: 'Feb 28, 2026', timeStatus: 'Closed Before Deadline', status: 'COMPLETED' },
  { businessId: '82-5522539', violationType: 'Environmental', notice: 'NOTICE 2', violationDate: 'Feb 15, 2026', deadline: 'Mar 1, 2026', timeStatus: 'Closed Before Deadline', status: 'COMPLETED' },
  { businessId: '90-8620394', violationType: 'Building Code', notice: 'NOTICE 2', violationDate: 'Feb 26, 2026', deadline: 'Feb 26, 2026', timeStatus: '0 day(s) Remaining', status: 'PENDING' },
  { businessId: '88-1373781', violationType: 'Fire Safety', notice: 'NOTICE 3', violationDate: 'Dec 11, 2025', deadline: 'Feb 1, 2026', timeStatus: 'Overdue by 21 day(s)', status: 'CEASE AND DESIST' },
  { businessId: '75-7348615', violationType: 'Sanitation', notice: 'NOTICE 2', violationDate: 'Feb 28, 2026', deadline: 'Mar 3, 2026', timeStatus: '7 day(s) Remaining', status: 'PENDING' },
  { businessId: '73-4422523', violationType: 'Environmental', notice: 'NOTICE 3', violationDate: 'Dec 11, 2025', deadline: 'Mar 1, 2026', timeStatus: 'Overdue by 21 day(s)', status: 'CEASE AND DESIST' },
];

const AgingNoticeTable = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-center py-8 tracking-tight text-black">
          LIST OF AGING NOTICE
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#004d33] text-white uppercase text-sm">
                <th className="py-4 px-4 border-r border-green-800">Business ID</th>
                <th className="py-4 px-4 border-r border-green-800">Violation Type</th>
                <th className="py-4 px-4 border-r border-green-800">Notice</th>
                <th className="py-4 px-4 border-r border-green-800 leading-tight">Violation<br/>Date</th>
                <th className="py-4 px-4 border-r border-green-800">Deadline</th>
                <th className="py-4 px-4 border-r border-green-800 text-xs">Time Status</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {notices.map((row, index) => (
                <tr key={index} className="border-b border-gray-200 text-center">
                  <td className="py-4 px-2 underline font-bold cursor-pointer">{row.businessId}</td>
                  <td className="py-4 px-2">{row.violationType}</td>
                  <td className="py-4 px-2 font-medium">{row.notice}</td>
                  <td className="py-4 px-2 italic">
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-[12px]">{row.violationDate}</span>
                  </td>
                  <td className="py-4 px-2 italic">
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-[12px]">{row.deadline}</span>
                  </td>
                  <td className="py-4 px-2">{row.timeStatus}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-component for the colorful status buttons
const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses = "w-full py-2 px-4 rounded font-bold text-xs tracking-wider text-white transition-opacity hover:opacity-90";
  
  const styles = {
    'COMPLETED': "bg-[#004d33]",
    'PENDING': "bg-[#fcd34d] !text-gray-800", // Yellow with dark text
    'CEASE AND DESIST': "bg-[#ef4444] leading-tight",
  };

  return (
    <button className={`${baseClasses} ${styles[status as keyof typeof styles]}`}>
      {status}
    </button>
  );
};

export default AgingNoticeTable;