"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ViolationRecord | null>(null);

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

  const computeStatus = (record: ViolationRecord) => {
    if (record.penalty_amount === record.payment_amount && record.penalty_amount > 0) return "COMPLETED";
    if (record.notice_level >= 3) return "CEASE AND DESIST";
    return "PENDING";
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CEASE AND DESIST": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <FiCheckCircle className="mr-1" />;
      case "PENDING": return <FiClock className="mr-1" />;
      case "CEASE AND DESIST": return <FiSlash className="mr-1" />;
      default: return <FiAlertCircle className="mr-1" />;
    }
  };

  const exportCSV = () => {
    const headers = ["Violation ID", "Business ID", "Notice Level", "Status", "Created At", "Last Notice Sent At", "Penalty", "Payment"];
    const rows = records.map((r) => [r.id, r.business_id, r.notice_level, computeStatus(r), r.created_at, r.last_notice_sent_at, r.penalty_amount, r.payment_amount]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aging_notice_records.csv");
    document.body.appendChild(link);
    link.click();
  };

  // UI Helper for the Detail Rows
  const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-1 text-sm font-medium">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">: {value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 transition-all duration-300 pt-10 px-6">
      <Sidebar
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={false}
        setIsCollapsed={() => {}}
      />
      

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <FiFileText className="text-green-800 text-3xl" />
            <h1 className="text-2xl md:text-4xl font-bold text-green-800 tracking-wide">Aging Notice Records</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-transform hover:scale-105">
              <FiDownload /> Export CSV
            </button>
            <button onClick={fetchRecords} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-transform hover:scale-105">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white shadow-lg rounded-2xl border border-green-100 overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="px-4 py-3">Violation ID</th>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b hover:bg-green-50">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3 font-semibold">{r.buses?.business_name}</td>
                  <td className="px-4 py-3">{r.notice_level}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(computeStatus(r))}`}>
                      {getStatusIcon(computeStatus(r))} {computeStatus(r)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setSelectedRecord(r)} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500 inline-flex items-center gap-1">
                      <FiEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {records.map(r => (
                <div key={r.id} className="bg-white p-4 rounded-xl shadow border border-green-100">
                     <p className="font-bold text-green-800">{r.buses?.business_name}</p>
                     <button onClick={() => setSelectedRecord(r)} className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg">View Details</button>
                </div>
            ))}
        </div>
      </div>

      {/* STYLED MODAL (Matches your Screenshot) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="p-6 space-y-6">
              
              {/* Section 1: Business Information */}
              <div>
                <div className="bg-[#065f46] text-white text-center py-2 rounded-md font-bold mb-4 shadow-sm">
                  Business Information
                </div>
                <div className="space-y-1 px-2">
                  <DetailRow label="Business ID" value={selectedRecord.buses?.id || "N/A"} />
                  <DetailRow label="Business Name" value={selectedRecord.buses?.business_name || "N/A"} />
                  <DetailRow label="Violation Type" value="Fire Safety" /> {/* Static example from your UI */}
                  <DetailRow label="Violation Date" value={new Date(selectedRecord.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                  <DetailRow label="Deadline" value="February 28, 2026" />
                  <DetailRow label="Status" value={selectedRecord.notice_level >= 3 ? "Needs C&D Review" : "Pending"} />
                  <DetailRow label="Days Remaining" value="0" />
                </div>
              </div>

              {/* Section 2: Notice Timeline */}
              <div>
                <div className="bg-[#065f46] text-white text-center py-2 rounded-md font-bold mb-4 shadow-sm">
                  Notice Timeline
                </div>
                <div className="space-y-1 px-2">
                  <DetailRow label="Notice 1" value={`Sent ${new Date(selectedRecord.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`} />
                  <DetailRow label="Notice 2" value="Sent March 02, 2026" />
                  <DetailRow label="Notice 3" value="Sent March 07, 2026" />
                </div>
              </div>

              {/* Section 3: Countdown Timer */}
              <div>
                <div className="bg-[#065f46] text-white text-center py-2 rounded-md font-bold mb-4 shadow-sm">
                  Countdown Timer
                </div>
                <div className="space-y-1 px-2">
                  <DetailRow label="Overall Deadline" value="March 10, 2026" />
                  <DetailRow label="Days Remaining" value="0" />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgingNoticeTable;