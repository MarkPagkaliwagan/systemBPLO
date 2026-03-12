"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  FiClipboard,
  FiX,
  FiSearch,
  FiArrowUp,
  FiArrowDown
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
  const [selectedInspector, setSelectedInspector] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("business_records")
      .select(
        `assigned_inspector,
        "Business Identification Number",
        "Business Name",
        scheduled_date`
      );

    if (error) {
      console.error(error);
      return;
    }

    const rows = data || [];
    setRecords(rows);

    const grouped: Record<string, number> = {};

    rows.forEach((r) => {
      if (!r.assigned_inspector) return;

      if (!grouped[r.assigned_inspector]) {
        grouped[r.assigned_inspector] = 0;
      }

      grouped[r.assigned_inspector]++;
    });

    const list = Object.keys(grouped).map((name) => ({
      name,
      total: grouped[name]
    }));

    list.sort((a, b) => b.total - a.total);

    setInspectors(list);
  }

  function openInspector(name: string) {
    setSelectedInspector(name);
    setSearch("");
    setMonthFilter("");
  }

  function closeModal() {
    setSelectedInspector(null);
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
      list = list.filter((r) => {
        if (!r.scheduled_date) return false;
        return r.scheduled_date.startsWith(monthFilter);
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.scheduled_date || "").getTime();
      const db = new Date(b.scheduled_date || "").getTime();

      return sortAsc ? da - db : db - da;
    });

    return list;
  }, [records, selectedInspector, search, monthFilter, sortAsc]);

  return (
    <>
      {/* CARD */}
      <div className="bg-white rounded-xl shadow border w-full">

        {/* HEADER */}
        <div className="flex items-center gap-2 bg-green-900 text-white px-4 py-3 rounded-t-xl">
          <FiClipboard />
          <h2 className="font-semibold text-sm">
            Inspector Workload
          </h2>
        </div>

        {/* LIST */}
        <div className="divide-y">
          {inspectors.map((inspector) => (
            <div
              key={inspector.name}
              onClick={() => openInspector(inspector.name)}
              className="flex justify-between items-center px-4 py-3 hover:bg-green-50 cursor-pointer text-sm"
            >
              <span className="font-medium text-gray-700">
                {inspector.name}
              </span>

              <span className="bg-green-900 text-white text-xs px-3 py-1 rounded-full">
                {inspector.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg flex flex-col max-h-[90vh]">

            {/* HEADER */}
            <div className="flex justify-between items-center bg-green-900 text-white px-4 py-3 rounded-t-xl">

              <h3 className="font-semibold text-sm">
                Inspection Assignments — {selectedInspector}
              </h3>

              <button onClick={closeModal}>
                <FiX size={20} />
              </button>

            </div>

            {/* FILTERS */}
            <div className="p-4 flex flex-col md:flex-row gap-3 border-b">

              {/* SEARCH */}
              <div className="flex items-center border rounded px-2 w-full md:w-1/2">

                <FiSearch className="text-gray-400" />

                <input
                  type="text"
                  placeholder="Search business or BIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2 py-2 text-sm outline-none"
                />

              </div>

              {/* MONTH FILTER */}
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              />

              {/* SORT */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 border px-3 py-2 rounded text-sm"
              >
                {sortAsc ? <FiArrowUp /> : <FiArrowDown />}
                Date
              </button>

            </div>

            {/* TABLE */}
            <div className="overflow-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-3">BIN</th>
                    <th className="p-3">Business Name</th>
                    <th className="p-3">Scheduled Date</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        {row["Business Identification Number"]}
                      </td>

                      <td className="p-3">
                        {row["Business Name"]}
                      </td>

                      <td className="p-3">
                        {row.scheduled_date}
                      </td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-6 text-gray-500"
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