"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../module-2-inspection/components/sidebar/page";

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

  const notices: AgingNotice[] = [
    {
      businessId: "BUS-001",
      violationType: "Expired Business Permit",
      notice: "First Notice of Violation",
      violationDate: "2026-02-01",
      deadline: "2026-02-15",
      timeStatus: "5 Days Remaining",
      status: "PENDING",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/module-3-notice/Dashboard">
            <button className="px-5 py-2.5 border border-green-700 text-green-700 rounded-lg hover:bg-green-700 hover:text-white transition">
              ← Back to Dashboard
            </button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-green-800 mb-10 text-center">
          List of Aging Notice
        </h1>

        <table className="min-w-full text-sm text-left border">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="px-6 py-4">Business ID</th>
              <th className="px-6 py-4">Violation Type</th>
              <th className="px-6 py-4">Notice</th>
              <th className="px-6 py-4">Violation Date</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4">Time Status</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4">{row.businessId}</td>
                <td className="px-6 py-4">{row.violationType}</td>
                <td className="px-6 py-4">{row.notice}</td>
                <td className="px-6 py-4">{row.violationDate}</td>
                <td className="px-6 py-4">{row.deadline}</td>
                <td className="px-6 py-4">{row.timeStatus}</td>
                <td className="px-6 py-4">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgingNoticeTable;
