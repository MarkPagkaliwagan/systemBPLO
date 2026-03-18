"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp, FiX, FiSend } from "react-icons/fi"; // Added FiX and FiSend
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Violation = {
  id: number;
  business_id: string;
  violation: string;
  notice_level: number;
  last_sent_time: string | null;
  resolved: boolean;
};

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // --- NEW STATES FOR MODAL ---
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchViolations = async () => {
    let { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .ilike("business_id", `%${query}%`)
      .order(sortKey || "id", { ascending: sortAsc });

    if (error) console.error(error);
    else setViolations(data || []);
  };

  useEffect(() => {
    fetchViolations();
  }, [query, sortKey, sortAsc]);

  // --- MODAL HANDLERS ---
  const handleRowClick = (v: Violation) => {
    setSelectedViolation(v);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedViolation(null);
  };

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getNoticeStatus = (notice: number, violation: Violation) => {
    if (violation.resolved) return "Resolved";
    if (violation.notice_level >= notice) return "Sent";
    return "Pending";
  };

  const getStatusText = (violation: Violation) => {
    if (violation.resolved) return "Resolved";
    if (violation.notice_level >= 3) return "Cease and Desist"; // Changed > to >= for logic
    return "Pending";
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key) return <FiChevronDown className="inline ml-1 text-gray-400" />;
    return sortAsc ? <FiChevronUp className="inline ml-1 text-gray-400" /> : <FiChevronDown className="inline ml-1 text-gray-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 p-4">
      <h1 className="text-3xl font-bold mb-4">Violations Monitoring</h1>

      {/* Search */}
      <div className="mb-4 w-full md:w-96 relative">
        <FiSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Business ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-black"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="min-w-full text-left text-black">
          <thead className="bg-green-800 text-white">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:bg-green-700" onClick={() => toggleSort("business_id")}>
                Business ID {renderSortIcon("business_id")}
              </th>
              <th className="px-6 py-3">Violation</th>
              <th className="px-6 py-3">Notice 1</th>
              <th className="px-6 py-3">Notice 2</th>
              <th className="px-6 py-3">Notice 3</th>
              <th className="px-6 py-3 cursor-pointer hover:bg-green-700" onClick={() => toggleSort("resolved")}>
                Status {renderSortIcon("resolved")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {violations.map((v) => (
              <tr 
                key={v.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(v)} // <--- TRIGGER MODAL
              >
                <td className="px-6 py-4 font-medium">{v.business_id}</td>
                <td className="px-6 py-4 truncate max-w-xs">{v.violation}</td>
                <td className="px-6 py-4">{getNoticeStatus(1, v)}</td>
                <td className="px-6 py-4">{getNoticeStatus(2, v)}</td>
                <td className="px-6 py-4">{getNoticeStatus(3, v)}</td>
                <td className="px-6 py-4 font-semibold">{getStatusText(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL IMPLEMENTATION --- */}
      {isModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-green-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Violation Details</h2>
                <p className="text-green-200 text-xs">Business ID: {selectedViolation.business_id}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-black">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Violation Statement</label>
                <p className="text-gray-700 font-medium leading-relaxed mt-1">
                  {selectedViolation.violation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Current Notice</label>
                  <p className="text-sm font-semibold">Level {selectedViolation.notice_level}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400">Resolution Status</label>
                  <p className="text-sm font-semibold">{getStatusText(selectedViolation)}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <label className="text-[10px] font-bold uppercase text-gray-400">Last Action Date</label>
                <p className="text-sm text-gray-600">
                  {selectedViolation.last_sent_time 
                    ? new Date(selectedViolation.last_sent_time).toLocaleString() 
                    : "No notices sent yet"}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Close
              </button>
              <button 
                className="bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-800 flex items-center gap-2 shadow-lg"
                onClick={() => alert(`Sending notice to ${selectedViolation.business_id}...`)}
              >
                <FiSend /> Send Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}