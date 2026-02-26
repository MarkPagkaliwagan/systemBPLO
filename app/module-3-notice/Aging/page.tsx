import React from 'react';
import Link from 'next/link'; // For navigation

interface AgingNotice {
  businessId: string;
  violationType: string;
  notice: string;
  violationDate: string;
  deadline: string;
  timeStatus: string;
  status: 'COMPLETED' | 'PENDING' | 'CEASE AND DESIST';
}

const AgingNoticeTable = () => {
  // Empty array placeholder
  const notices: AgingNotice[] = [];

  return (
    <div className="p-8 bg-white min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto relative">
        
        {/* Back Button matching the screenshot arrow */}
        <div className="absolute top-8 left-0">
          <Link 
            href="/module-3-notice/dashboard" 
            className="flex items-center text-gray-400 hover:text-black transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        </div>

        {/* Header Section */}
        <h1 className="text-3xl font-bold text-center py-8 tracking-tight">
          LIST OF AGING NOTICE
        </h1>

        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#004d33] text-white uppercase text-[12px] tracking-wider">
                <th className="py-4 px-4 border-r border-green-800">Business ID</th>
                <th className="py-4 px-4 border-r border-green-800">Violation Type</th>
                <th className="py-4 px-4 border-r border-green-800">Notice</th>
                <th className="py-4 px-4 border-r border-green-800 leading-tight text-center">Violation<br/>Date</th>
                <th className="py-4 px-4 border-r border-green-800">Deadline</th>
                <th className="py-4 px-4 border-r border-green-800">Time Status</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            
            <tbody className="text-gray-700 text-sm">
              {notices.length > 0 ? (
                notices.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 text-center">
                    <td className="py-4 px-2 underline font-bold">{row.businessId}</td>
                    <td className="py-4 px-2">{row.violationType}</td>
                    <td className="py-4 px-2 font-medium">{row.notice}</td>
                    <td className="py-4 px-2 italic">
                       <span className="bg-gray-100 px-3 py-1 rounded-full text-[12px]">{row.violationDate}</span>
                    </td>
                    <td className="py-4 px-2 italic">
                       <span className="bg-gray-100 px-3 py-1 rounded-full text-[12px]">{row.deadline}</span>
                    </td>
                    <td className="py-4 px-2">{row.timeStatus}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              ) : (
                /* The Placeholder holder */
                <tr>
                  <td colSpan={7} className="py-32 text-center text-gray-300 italic">
                    <p className="text-lg">No records found for "Aging Notices"</p>
                    <span className="text-sm">Please update your database to see new entries.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-component for the buttons
const StatusBadge = ({ status }: { status: AgingNotice['status'] }) => {
  const base = "w-full py-2 px-4 rounded font-bold text-xs tracking-wider text-white";
  const styles = {
    'COMPLETED': "bg-[#004d33]",
    'PENDING': "bg-[#fcd34d] !text-gray-800",
    'CEASE AND DESIST': "bg-[#ef4444]",
  };
  return <button className={`${base} ${styles[status]}`}>{status}</button>;
};

export default AgingNoticeTable;