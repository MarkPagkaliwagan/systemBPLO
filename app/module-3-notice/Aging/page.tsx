"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../module-2-inspection/components/sidebar/page";
import {
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiSlash,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiX,
} from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

interface ViolationRecord {
  id: number;
  business_id: number;
  notice_level: number;
  status: string;
  created_at: string;
  last_notice_sent_at: string;
  penalty_amount: number;
  payment_amount: number;
  buses: {
    id: number;
    business_name: string;
    interval_days: number;
    created_at: string;
    email: string;
  };
}

export default function AgingNoticeTable() {
  const [records, setRecords] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ViolationRecord | null>(null);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch from DB
  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("violations")
      .select(`
        *,
        buses (
          id,
          business_name,
          interval_days,
          created_at,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRecords(data as ViolationRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Status logic
  const computeStatus = (record: ViolationRecord) => {
    if (
      record.penalty_amount === record.payment_amount &&
      record.penalty_amount > 0
    )
      return "COMPLETED";
    if (record.notice_level >= 3) return "CEASE AND DESIST";
    return "PENDING";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CEASE AND DESIST":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <FiCheckCircle className="mr-1" />;
      case "PENDING":
        return <FiClock className="mr-1" />;
      case "CEASE AND DESIST":
        return <FiSlash className="mr-1" />;
      default:
        return <FiAlertCircle className="mr-1" />;
    }
  };

  // CSV export
  const exportCSV = () => {
    const headers = [
      "Violation ID",
      "Business ID",
      "Notice Level",
      "Violation Status",
      "Created At",
      "Last Notice Sent At",
      "Penalty Amount",
      "Payment Amount",
    ];

    const rows = records.map((r) => [
      r.id,
      r.business_id,
      r.notice_level,
      computeStatus(r),
      r.created_at,
      r.last_notice_sent_at,
      r.penalty_amount,
      r.payment_amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aging_notice_records.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      {/* Fixed Top Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className={`min-h-screen bg-gray-50 text-gray-800 transition-all duration-300 ${
        isMobile ? "pt-16" : isCollapsed ? "ml-20" : "ml-80"
      }`}>
        <div className="p-4 md:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {/* TITLE + BUTTONS */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <FiFileText className="text-green-800 text-2xl md:text-3xl" />
                <h1 className="text-xl md:text-2xl lg:text-4xl font-bold text-green-800 tracking-wide text-center md:text-left">
                  Aging Notice Records
                </h1>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 bg-green-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow hover:bg-green-700 transition-transform hover:scale-105 text-sm md:text-base"
                >
                  <FiDownload className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
                <button
                  onClick={fetchRecords}
                  className="flex items-center gap-2 bg-blue-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg shadow hover:bg-blue-700 transition-transform hover:scale-105 text-sm md:text-base"
                >
                  <FiRefreshCw className="w-4 h-4" /> 
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">↻</span>
                </button>
              </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white shadow-lg rounded-2xl border border-green-100 overflow-x-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Violation ID</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Business ID</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Notice Level</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Status</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Last Notice Sent</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Created At</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Penalty</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">Payment</th>
                      <th className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6">
                          Loading...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6">
                          No Records Found
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => {
                        const status = computeStatus(r);
                        return (
                          <tr
                            key={r.id}
                            className="border-b hover:bg-green-50 transition"
                          >
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{r.id}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{r.business_id}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">{r.notice_level}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                  status
                                )}`}
                              >
                                {getStatusIcon(status)}
                                {status}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {new Date(
                                r.last_notice_sent_at
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                              {new Date(r.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">₱ {r.penalty_amount}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">₱ {r.payment_amount}</td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-center">
                              <button
                                onClick={() => setSelectedRecord(r)}
                                className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-500 text-xs"
                              >
                                <FiEye className="w-3 h-3" /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-3 md:space-y-4">
              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
                  <p className="mt-2 text-gray-600">Loading...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-6 bg-white rounded-2xl shadow-md border border-green-100">
                  <FiFileText className="mx-auto text-gray-400 text-4xl mb-2" />
                  <p className="text-gray-600">No Records Found</p>
                </div>
              ) : (
                records.map((r) => {
                  const status = computeStatus(r);
                  return (
                    <div
                      key={r.id}
                      className="bg-white rounded-2xl shadow-md p-4 border border-green-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-green-800 text-sm">
                          Violation #{r.id}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5 text-gray-700 mb-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Business ID:</span>
                          <span>{r.business_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Notice Level:</span>
                          <span>{r.notice_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Penalty:</span>
                          <span className="font-semibold text-red-600">₱ {r.penalty_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Payment:</span>
                          <span className="font-semibold text-green-600">₱ {r.payment_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Last Notice:</span>
                          <span>{new Date(r.last_notice_sent_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Created:</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors text-sm"
                      >
                        <FiEye className="w-4 h-4" /> View Details
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selectedRecord && (
       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100"
            >
              <FiX size={20} className="sm:w-6 sm:h-6" />
            </button>

            <h2 className="text-lg sm:text-xl font-bold text-green-800 mb-4">
              Violation Details
            </h2>

            <div className="space-y-3 text-gray-700 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-green-700 mb-2 text-sm">Violation Information</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">ID:</span>
                    <span>{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Business ID:</span>
                    <span>{selectedRecord.business_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Notice Level:</span>
                    <span>{selectedRecord.notice_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(computeStatus(selectedRecord))}`}>
                      {computeStatus(selectedRecord)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-green-700 mb-2 text-sm">Financial Information</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Penalty:</span>
                    <span className="font-semibold text-red-600">₱ {selectedRecord.penalty_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment:</span>
                    <span className="font-semibold text-green-600">₱ {selectedRecord.payment_amount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-green-700 mb-2 text-sm">Timeline</h3>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Created:</span>
                    <span className="text-xs">{new Date(selectedRecord.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Last Notice:</span>
                    <span className="text-xs">{new Date(selectedRecord.last_notice_sent_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-green-700 mb-2 text-sm">Business Information</h3>
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Business Name:</span>
                    <span className="text-xs sm:text-right">{selectedRecord.buses?.business_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Email:</span>
                    <span className="text-xs sm:text-right break-all">{selectedRecord.buses?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Interval Days:</span>
                    <span>{selectedRecord.buses?.interval_days}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}