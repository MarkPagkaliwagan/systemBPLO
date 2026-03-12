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
      {/* FULL WIDTH DASHBOARD CARD */}
      <div className="bg-white rounded-2xl shadow-lg border w-full max-w-[800px] mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 bg-green-700 text-white px-8 py-5 rounded-t-2xl text-2xl">
          <FiClipboard size={32} />
          <span className="font-bold">Inspector Workload</span>
        </div>

        {/* INSPECTOR LIST */}
        <div className="divide-y">
          {inspectors.map((inspector) => (
            <div
              key={inspector.name}
              onClick={() => openInspector(inspector.name)}
              className="flex justify-between items-center px-8 py-5 cursor-pointer hover:bg-green-50"
            >
              <span className="font-semibold text-black text-xl">{inspector.name}</span>
              <span className="bg-green-700 text-white text-lg px-5 py-2 rounded-lg">
                {inspector.total}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* FULL WIDTH MODAL */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-8 z-50">

          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center bg-green-700 text-white px-10 py-6 rounded-t-2xl">
              <h3 className="font-bold text-3xl">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button onClick={closeModal}><FiX size={32} /></button>
            </div>

            {/* FILTER BAR */}
            <div className="p-6 flex flex-col md:flex-row gap-6 border-b">

              {/* SEARCH */}
              <div className="flex items-center border rounded px-4 w-full md:w-1/2">
                <FiSearch size={26} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-5 py-5 text-xl outline-none text-black"
                />
              </div>

              {/* MONTH FILTER */}
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border rounded px-5 py-5 text-xl text-black"
              />

              {/* SORT */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-4 border px-6 py-5 rounded text-xl text-black"
              >
                {sortAsc ? <FiArrowUp size={26} /> : <FiArrowDown size={26} />} Date
              </button>

            </div>

            {/* TABLE */}
            <div className="overflow-auto">
              <table className="w-full text-xl text-black">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-6 text-left">BIN</th>
                    <th className="p-6 text-left">Business Name</th>
                    <th className="p-6 text-left">Scheduled Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-green-50">
                      <td className="p-6">{row["Business Identification Number"]}</td>
                      <td className="p-6">{row["Business Name"]}</td>
                      <td className="p-6">{row.scheduled_date}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-12 text-black">
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