"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../module-3-notice/components/sidebar/page";

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
    {
      businessId: "BUS-002",
      violationType: "Sanitary Compliance Issue",
      notice: "Second Notice - Warning",
      violationDate: "2026-01-20",
      deadline: "2026-02-05",
      timeStatus: "Overdue by 10 Days",
      status: "CEASE AND DESIST",
    },
    {
      businessId: "BUS-003",
      violationType: "Fire Safety Non-Compliance",
      notice: "Final Notice",
      violationDate: "2026-02-10",
      deadline: "2026-02-25",
      timeStatus: "2 Days Remaining",
      status: "PENDING",
    },
    {
      businessId: "BUS-004",
      violationType: "Zoning Violation",
      notice: "Resolved Notice",
      violationDate: "2026-01-05",
      deadline: "2026-01-20",
      timeStatus: "Completed",
      status: "COMPLETED",
    },
    {
      businessId: "BUS-005",
      violationType: "Unregistered Operation",
      notice: "Immediate Compliance Required",
      violationDate: "2026-02-18",
      deadline: "2026-03-01",
      timeStatus: "1 Day Remaining",
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

        {/* TABLE WITH FULL GRID LINES */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 border-collapse">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="px-6 py-4 border border-gray-300">Business ID</th>
                <th className="px-6 py-4 border border-gray-300">Violation Type</th>
                <th className="px-6 py-4 border border-gray-300">Notice</th>
                <th className="px-6 py-4 border border-gray-300">Violation Date</th>
                <th className="px-6 py-4 border border-gray-300">Deadline</th>
                <th className="px-6 py-4 border border-gray-300">Time Status</th>
                <th className="px-6 py-4 border border-gray-300 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {notices.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border border-gray-300">{row.businessId}</td>
                  <td className="px-6 py-4 border border-gray-300">{row.violationType}</td>
                  <td className="px-6 py-4 border border-gray-300">{row.notice}</td>
                  <td className="px-6 py-4 border border-gray-300">{row.violationDate}</td>
                  <td className="px-6 py-4 border border-gray-300">{row.deadline}</td>
                  <td className="px-6 py-4 border border-gray-300">{row.timeStatus}</td>
                  <td className="px-6 py-4 border border-gray-300 text-center">
                    {row.status}
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

export default AgingNoticeTable;