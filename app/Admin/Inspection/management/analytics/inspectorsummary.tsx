"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FiClipboard, FiX, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

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
      if (!grouped[r.assigned_inspector]) grouped[r.assigned_inspector] = 0;
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
    let list = records.filter((r) => r.assigned_inspector === selectedInspector);

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r["Business Name"]?.toLowerCase().includes(s) ||
          r["Business Identification Number"]?.toLowerCase().includes(s)
      );
    }

    if (monthFilter) {
      list = list.filter((r) =>
        r.scheduled_date?.startsWith(monthFilter)
      );
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
      {/* SMALL DASHBOARD CARD */}
      <div className="bg-white rounded-lg shadow border w-full max-w-[220px]">

        {/* HEADER */}
        <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-t-lg text-xs">
          <FiClipboard />
          Inspector Workload
        </div>

        {/* INSPECTOR LIST */}
        <div className="divide-y">
          {inspectors.map((inspector) => (
            <div
              key={inspector.name}
              onClick={() => openInspector(inspector.name)}
              className="flex justify-between items-center px-2 py-1 cursor-pointer hover:bg-green-50"
            >
              <span className="font-medium text-black">{inspector.name}</span>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                {inspector.total}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white w-full max-w-3xl rounded-lg shadow flex flex-col max-h-[90vh]">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center bg-green-500 text-white px-4 py-3 rounded-t-lg">
              <h3 className="font-semibold text-sm">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button onClick={closeModal}><FiX size={20} /></button>
            </div>

            {/* FILTER BAR */}
            <div className="p-3 flex flex-col md:flex-row gap-2 border-b">

              {/* SEARCH */}
              <div className="flex items-center border rounded px-2 w-full md:w-1/2">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-2 py-2 text-sm outline-none text-black"
                />
              </div>

              {/* MONTH FILTER */}
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border rounded px-2 py-2 text-sm text-black"
              />

              {/* SORT */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 border px-3 py-2 rounded text-sm text-black"
              >
                {sortAsc ? <FiArrowUp /> : <FiArrowDown />} Date
              </button>

            </div>

            {/* TABLE */}
            <div className="overflow-auto">
              <table className="w-full text-sm text-black">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">BIN</th>
                    <th className="p-3 text-left">Business Name</th>
                    <th className="p-3 text-left">Scheduled Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-green-50">
                      <td className="p-3">{row["Business Identification Number"]}</td>
                      <td className="p-3">{row["Business Name"]}</td>
                      <td className="p-3">{row.scheduled_date}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-6 text-black">
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
