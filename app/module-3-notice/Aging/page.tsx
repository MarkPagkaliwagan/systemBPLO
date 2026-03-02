"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../module-2-inspection/components/sidebar/page";
import router from "next/router";

interface AgingNotice {
  businessId: string;
  violationType: string;
  notice: string;
  violationDate: string;
  deadline: string;
  timeStatus: string;
  status: "COMPLETED" | "PENDING" | "CEASE AND DESIST";
}

const AgingNoticeTable = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const notices: AgingNotice[] = [];

  return (
    <div
      className={`min-h-screen bg-white text-gray-900 px-6 py-10 transition-all duration-300 ${
        isMobile ? "pt-20" : isCollapsed ? "pl-20" : "pl-80"
      }`}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/module-3-notice/Dashboard">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 
      bg-white border border-green-700 text-green-700 
      rounded-lg font-medium text-sm
      hover:bg-green-700 hover:text-white
      transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            >
              <span className="text-lg">←</span>
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-green-800 mb-10 text-center tracking-tight">
          List of Aging Notice
        </h1>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-800 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Business ID</th>
                <th className="px-6 py-4">Violation Type</th>
                <th className="px-6 py-4">Notice</th>
                <th className="px-6 py-4 text-center">Violation Date</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Time Status</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {notices.length > 0
                ? notices.map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-green-50 transition duration-200"
                    >
                      <td className="px-6 py-4 font-semibold text-green-800 underline">
                        <Link href={`/module-3-notice/Aging/${row.businessId}`}>
                          {row.businessId}
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {row.violationType}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {row.notice}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                          {row.violationDate}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                          {row.deadline}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {row.timeStatus}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                : Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-6">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>

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

const StatusBadge = ({ status }: { status: AgingNotice["status"] }) => {
  const base = "px-4 py-2 rounded-full text-xs font-semibold tracking-wider";

  const styles = {
    COMPLETED: "bg-green-700 text-white",
    PENDING: "bg-yellow-400 text-gray-900",
    "CEASE AND DESIST": "bg-red-500 text-white",
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
};

export default AgingNoticeTable;
