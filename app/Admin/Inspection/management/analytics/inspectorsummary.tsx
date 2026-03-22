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
  assigned_inspector: string | string[] | null;
  "Business Identification Number": string | null;
  "Business Name": string | null;
  scheduled_date: string | null;
};

type InspectorCount = {
  name: string;
  total: number;
};

function normalizeInspectors(value: string | string[] | null | undefined) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  const text = String(value).trim();
  if (!text) return [];

  // Handles JSON array stored as text like: ["mark","juan"]
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fall through
  }

  return [text];
}

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
    const { data } = await supabase.from("business_records").select(
      `assigned_inspector,
      "Business Identification Number",
      "Business Name",
      scheduled_date`
    );

    const rows = (data || []) as RecordType[];
    setRecords(rows);

    const grouped: Record<string, number> = {};

    rows.forEach((r) => {
      const inspectorNames = normalizeInspectors(r.assigned_inspector);

      inspectorNames.forEach((name) => {
        grouped[name] = (grouped[name] || 0) + 1;
      });
    });

    const list = Object.keys(grouped)
      .map((name) => ({
        name,
        total: grouped[name],
      }))
      .sort((a, b) => b.total - a.total);

    setInspectors(list);
  }

  const filteredRecords = useMemo(() => {
    let list = records.filter((r) =>
      selectedInspector
        ? normalizeInspectors(r.assigned_inspector).includes(selectedInspector)
        : false
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
    inspectors.length > 0 ? Math.max(...inspectors.map((i) => i.total)) : 1;

  return (
    <>
      <div className="w-full h-full">
        <div className="w-full">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
              <FiClipboard size={20} className="text-slate-700" />
              <span className="text-base font-semibold text-slate-900">
                Inspector Workload
              </span>
            </div>

            <div className="p-4 grid gap-3">
              {inspectors.length > 0 ? (
                inspectors.map((inspector) => {
                  const progress = (inspector.total / maxTasks) * 100;
                  const isSelected = selectedInspector === inspector.name;

                  return (
                    <button
                      key={inspector.name}
                      onClick={() => setSelectedInspector(inspector.name)}
                      className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                        isSelected
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3 mb-2">
                        <span className="text-sm md:text-[15px] font-medium text-slate-900 truncate">
                          {inspector.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {inspector.total}
                        </span>
                      </div>

                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all bg-slate-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No inspectors found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center bg-slate-900 text-white px-5 py-3">
              <h3 className="text-sm md:text-base font-semibold">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-3 flex flex-col md:flex-row gap-2 border-b border-slate-200 bg-white">
              <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 w-full md:w-1/2 text-sm">
                <FiSearch size={16} className="text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ml-2 outline-none text-slate-900 text-sm bg-transparent"
                />
              </div>

              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm w-full md:w-auto bg-white"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center gap-1 border border-slate-200 px-3 py-2 rounded-lg text-slate-900 text-sm bg-white hover:bg-slate-50 transition-colors"
              >
                {sortAsc ? <FiArrowUp size={15} /> : <FiArrowDown size={15} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-slate-900 text-sm border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left font-medium">BIN</th>
                    <th className="p-3 text-left font-medium">Business Name</th>
                    <th className="p-3 text-left font-medium">Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3">
                        {row["Business Identification Number"]}
                      </td>
                      <td className="p-3">{row["Business Name"]}</td>
                      <td className="p-3">{row.scheduled_date}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-5 text-slate-400 text-sm"
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