"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  FiClipboard,
  FiX,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RecordType = {
  assigned_inspector: string | null;
  "Business Identification Number": string | null;
  "Business Name": string | null;
  scheduled_date: string | null;
};

type InspectorCount = {
  name: string;
  total: number;
};

export default function InspectorSummary() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [inspectors, setInspectors] = useState<InspectorCount[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("business_records")
      .select(
        `assigned_inspector,
        "Business Identification Number",
        "Business Name",
        scheduled_date`
      );

    const rows = data || [];
    setRecords(rows);

    const grouped: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.assigned_inspector) return;
      grouped[r.assigned_inspector] = (grouped[r.assigned_inspector] || 0) + 1;
    });

    const list = Object.keys(grouped).map((name) => ({
      name,
      total: grouped[name],
    }));

    list.sort((a, b) => b.total - a.total);
    setInspectors(list);
  }

  const filteredRecords = useMemo(() => {
    let list = records.filter(
      (r) => r.assigned_inspector === selectedInspector
    );

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r["Business Name"]?.toLowerCase().includes(s) ||
          r["Business Identification Number"]?.toLowerCase().includes(s)
      );
    }

    if (monthFilter) {
      list = list.filter((r) => r.scheduled_date?.startsWith(monthFilter));
    }

    list.sort((a, b) => {
      const da = new Date(a.scheduled_date || "").getTime();
      const db = new Date(b.scheduled_date || "").getTime();
      return sortAsc ? da - db : db - da;
    });

    return list;
  }, [records, selectedInspector, search, monthFilter, sortAsc]);

  const maxTasks =
    inspectors.length > 0
      ? Math.max(...inspectors.map((i) => i.total))
      : 1;

  return (
    <>
     {/* Outer Card */}
<div className="bg-gray-50 flex justify-center items-start pt-6 pb-0 md:pt-8 md:pb-8 px-4 min-h-auto md:min-h-screen">
        <div className="w-full max-w-225">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-5 py-3 text-lg font-semibold">
              <FiClipboard size={22} />
              <span>Inspector Workload</span>
            </div>

            {/* Inspector Inner Cards */}
            <div className="p-4 grid gap-3">
              {inspectors.length > 0 ? (
                inspectors.map((inspector) => {
                  const progress = (inspector.total / maxTasks) * 100;
                  return (
                    <div
                      key={inspector.name}
                      onClick={() => setSelectedInspector(inspector.name)}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-900 font-medium text-sm md:text-base">
                          {inspector.name}
                        </span>
                        <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-xs px-2 py-0.5 rounded-md">
                          {inspector.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background:
                              "linear-gradient(to right, #10B981, #047857)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No inspectors found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3 text-lg font-semibold">
              <h3>Inspection Assignments — {selectedInspector}</h3>
              <button onClick={() => setSelectedInspector(null)}>
                <FiX size={24} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-3 flex flex-col md:flex-row gap-2 border-b">
              <div className="flex items-center border rounded px-2 py-1 w-full md:w-1/2 text-sm">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ml-2 outline-none text-gray-900 text-sm"
                />
              </div>

              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border rounded px-2 py-1 text-gray-900 text-sm w-full md:w-auto"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 border px-2 py-1 rounded text-gray-900 text-sm"
              >
                {sortAsc ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />} Date
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto">
              <table className="w-full text-gray-900 text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-left">BIN</th>
                    <th className="p-2 text-left">Business Name</th>
                    <th className="p-2 text-left">Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-emerald-50 transition-colors"
                    >
                      <td className="p-2">{row["Business Identification Number"]}</td>
                      <td className="p-2">{row["Business Name"]}</td>
                      <td className="p-2">{row.scheduled_date}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-4 text-gray-400 text-sm"
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}