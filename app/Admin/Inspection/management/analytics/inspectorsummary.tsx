"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
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

function parseAssignedInspectors(value: string | null | undefined): string[] {
  if (!value) return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }

    if (typeof parsed === "string") {
      return parsed.trim() ? [parsed.trim()] : [];
    }
  } catch {}

  return [trimmed];
}

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
      const assignedInspectors = parseAssignedInspectors(r.assigned_inspector);

      assignedInspectors.forEach((name) => {
        grouped[name] = (grouped[name] || 0) + 1;
      });
    });

    const list = Object.keys(grouped).map((name) => ({
      name,
      total: grouped[name],
    }));

    list.sort((a, b) => b.total - a.total);
    setInspectors(list);
  }

  const filteredRecords = useMemo(() => {
    if (!selectedInspector) return [];

    let list = records.filter((r) =>
      parseAssignedInspectors(r.assigned_inspector).includes(selectedInspector)
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
      const da = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const db = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
      return sortAsc ? da - db : db - da;
    });

    return list;
  }, [records, selectedInspector, search, monthFilter, sortAsc]);

  const maxTasks =
    inspectors.length > 0 ? Math.max(...inspectors.map((i) => i.total)) : 1;

  return (
    <>
      {/* ONLY CHART */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-4">
          Workload Distribution
        </h3>

        {inspectors.length > 0 ? (
          <div className="space-y-4">
            {inspectors.map((inspector) => {
              const progress = (inspector.total / maxTasks) * 100;

              return (
                <button
                  key={inspector.name}
                  onClick={() => setSelectedInspector(inspector.name)}
                  className="w-full text-left group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_60px] gap-3 items-center">
                    
                    {/* NAME */}
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {inspector.name}
                    </span>

                    {/* BAR */}
                    <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-green-700 rounded-full transition-all duration-300 group-hover:bg-green-800"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* VALUE */}
                    <span className="text-sm font-semibold text-green-800 text-right">
                      {inspector.total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm py-6">
            No inspectors found
          </div>
        )}
      </div>

      {/* MODAL (unchanged) */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold text-base md:text-lg">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-3 flex flex-col md:flex-row gap-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/2 bg-white">
                <FiSearch size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search business name or BIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ml-2 outline-none text-gray-900 text-sm bg-transparent"
                />
              </div>

              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm w-full md:w-auto bg-white"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center gap-1 border border-gray-300 px-3 py-2 rounded-lg text-gray-900 text-sm bg-white hover:bg-gray-50"
              >
                {sortAsc ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-gray-900 text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">BIN</th>
                    <th className="p-3 font-semibold">Business Name</th>
                    <th className="p-3 font-semibold">Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-green-50/50 transition-colors"
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
                      <td colSpan={3} className="text-center p-6 text-gray-400 text-sm">
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