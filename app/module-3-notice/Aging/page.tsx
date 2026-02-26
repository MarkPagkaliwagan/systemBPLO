"use client";

import React from 'react';
import Link from 'next/link';

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
  // Placeholder empty array
  const notices: AgingNotice[] = [];

  return (
    <div className="p-8 bg-white min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto relative">

        {/* Back Button */}
        <div className="absolute top-8 left-0">
          <Link href="/module-3-notice/Dashboard" className="flex items-center text-gray-400 hover:text-black transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-center py-8 tracking-tight">
          LIST OF AGING NOTICE
        </h1>

        <div className="overflow-x-auto border border-gray-200 rounded">
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
                    <td className="py-4 px-2 underline font-bold">
                      <Link href={`/module-3-notice/aging/${row.businessId}`}>
                        {row.businessId}
                      </Link>
                    </td>
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
                // Skeleton placeholders
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-200">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-6 px-2 bg-gray-100 rounded mx-2">&nbsp;</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Optional: fallback message */}
          {notices.length === 0 && (
            <div className="py-8 text-center text-gray-400 italic text-sm">
              No records found for "Aging Notices". Placeholder rows shown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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