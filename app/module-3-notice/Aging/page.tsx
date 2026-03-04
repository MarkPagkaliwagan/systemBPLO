"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../module-3-notice/components/sidebar/page";
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

const AgingNoticeTable = () => {
  const [records, setRecords] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<ViolationRecord | null>(null);

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    <div
  className={`min-h-screen bg-gray-50 text-gray-800 transition-all duration-300 ${
    isMobile
      ? "pt-20 px-6"
      : isCollapsed
      ? "pl-20 pt-10"
      : "pl-80 pt-10"
  }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="max-w-7xl mx-auto">
        {/* TITLE + BUTTONS */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <FiFileText className="text-green-800 text-3xl" />
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 tracking-wide text-center md:text-left">
              Aging Notice Records
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-transform hover:scale-105"
            >
              <FiDownload /> Export CSV
            </button>
            <button
              onClick={fetchRecords}
              className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-transform hover:scale-105"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-white shadow-lg rounded-2xl border border-green-100 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="px-4 py-2">Violation ID</th>
                <th className="px-4 py-2">Business ID</th>
                <th className="px-4 py-2">Notice Level</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Notice Sent</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Penalty</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2 text-center">Actions</th>
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
                      <td className="px-4 py-2">{r.id}</td>
                      <td className="px-4 py-2">{r.business_id}</td>
                      <td className="px-4 py-2">{r.notice_level}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(
                          r.last_notice_sent_at
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">₱ {r.penalty_amount}</td>
                      <td className="px-4 py-2">₱ {r.payment_amount}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500"
                        >
                          <FiEye /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-6">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-6">No Records Found</div>
          ) : (
            records.map((r) => {
              const status = computeStatus(r);
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl shadow-md p-4 border border-green-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-green-800">
                      Violation #{r.id}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        status
                      )}`}
                    >
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Business ID:</strong> {r.business_id}</p>
                    <p><strong>Notice Level:</strong> {r.notice_level}</p>
                    <p><strong>Last Notice:</strong> {new Date(r.last_notice_sent_at).toLocaleDateString()}</p>
                    <p><strong>Created:</strong> {new Date(r.created_at).toLocaleDateString()}</p>
                    <p><strong>Penalty:</strong> ₱ {r.penalty_amount}</p>
                    <p><strong>Payment:</strong> ₱ {r.payment_amount}</p>
                  </div>

                  <button
                    onClick={() => setSelectedRecord(r)}
                    className="mt-3 w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500"
                  >
                    <FiEye /> View Details
                  </button>
                </div>
              );
            })
          )}
        </div>
        </div>
</div>


      {/* MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-green-900 bg-opacity-10 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>

            <h2 className="text-xl font-bold text-green-800 mb-4">
              Violation Details
            </h2>

            <div className="space-y-2 text-gray-700 text-sm">
              <p><strong>Violation ID:</strong> {selectedRecord.id}</p>
              <p><strong>Business ID:</strong> {selectedRecord.business_id}</p>
              <p><strong>Notice Level:</strong> {selectedRecord.notice_level}</p>
              <p><strong>Status:</strong> {computeStatus(selectedRecord)}</p>
              <p><strong>Created At:</strong> {new Date(selectedRecord.created_at).toLocaleString()}</p>
              <p><strong>Last Notice Sent:</strong> {new Date(selectedRecord.last_notice_sent_at).toLocaleString()}</p>
              <p><strong>Penalty Amount:</strong> ₱ {selectedRecord.penalty_amount}</p>
              <p><strong>Payment Amount:</strong> ₱ {selectedRecord.payment_amount}</p>

              <hr className="my-2" />

              <h3 className="font-semibold text-green-700">Business Info</h3>
              <p><strong>Bus ID:</strong> {selectedRecord.buses?.id}</p>
              <p><strong>Business Name:</strong> {selectedRecord.buses?.business_name}</p>
              <p><strong>Interval Days:</strong> {selectedRecord.buses?.interval_days}</p>
              <p><strong>Business Created:</strong> {new Date(selectedRecord.buses?.created_at || "").toLocaleDateString()}</p>
              <p><strong>Email:</strong> {selectedRecord.buses?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgingNoticeTable;