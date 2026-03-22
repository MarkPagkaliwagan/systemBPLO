"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  FiClipboard,
  FiX,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiBarChart2,
  FiLayers,
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
  } catch {
    // If not JSON, treat it as a single inspector name
  }

  return [trimmed];
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

  const totalAssigned = inspectors.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <div className="w-full h-full bg-slate-50 p-4 md:p-6">
        <div className="w-full max-w-[1400px] mx-auto space-y-4">
          {/* Dashboard Header */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-green-50 flex items-center justify-center">
                  <FiBarChart2 size={22} className="text-green-800" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                    Inspector Workload Dashboard
                  </h2>
                  <p className="text-sm text-slate-500">
                    Horizontal bar chart view of inspector assignments
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <FiLayers className="text-green-800" />
                <span>{inspectors.length} inspectors</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 md:p-5 bg-slate-50/70">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Total Assigned</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalAssigned}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Inspectors</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {inspectors.length}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500">Highest Workload</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {inspectors[0]?.name || "-"}
                </p>
              </div>
            </div>

            {/* Chart Area */}
            <div className="p-4 md:p-5">
              {inspectors.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900">
                      Workload Distribution
                    </h3>
                    <span className="text-xs text-slate-500">
                      Click a bar to view records
                    </span>
                  </div>

                  <div className="space-y-4">
                    {inspectors.map((inspector) => {
                      const progress = (inspector.total / maxTasks) * 100;

                      return (
                        <button
                          key={inspector.name}
                          onClick={() => setSelectedInspector(inspector.name)}
                          className="w-full text-left group"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_70px] gap-3 md:gap-4 items-center">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-700 shrink-0" />
                                <span className="text-sm md:text-base font-medium text-slate-900 truncate">
                                  {inspector.name}
                                </span>
                              </div>
                            </div>

                            <div className="relative h-10 flex items-center">
                              <div className="absolute inset-0 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-700 to-green-500 transition-all duration-300 group-hover:from-green-800 group-hover:to-green-600"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>

                              <div className="absolute left-0 right-0 top-[-18px] hidden md:flex justify-between text-[10px] text-slate-400 px-1">
                                <span>0</span>
                                <span>{Math.ceil(maxTasks / 2)}</span>
                                <span>{maxTasks}</span>
                              </div>
                            </div>

                            <div className="flex md:justify-end">
                              <span className="inline-flex items-center justify-center min-w-14 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-semibold border border-green-200">
                                {inspector.total}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-3 w-3 rounded-full bg-green-700" />
                    <span>Bar length = number of assignments</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
                  No inspectors found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                      <td
                        colSpan={3}
                        className="text-center p-6 text-gray-400 text-sm"
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