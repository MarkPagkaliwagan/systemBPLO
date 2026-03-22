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

  const totalAssignments = inspectors.reduce((sum, item) => sum + item.total, 0);

  return (
    <>
      <div className="w-full bg-gray-50 p-3 md:p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <FiClipboard size={18} className="text-emerald-700" />
          <span className="text-gray-900 font-semibold text-sm md:text-base">
            Inspector Workload
          </span>
        </div>

        {/* Stats (no card wrapper) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-[11px] text-gray-500">Inspectors</div>
            <div className="text-xl font-bold text-gray-900">
              {inspectors.length}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-[11px] text-gray-500">
              Total Assignments
            </div>
            <div className="text-xl font-bold text-gray-900">
              {totalAssignments}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-[11px] text-gray-500">Highest Load</div>
            <div className="text-xl font-bold text-gray-900">
              {maxTasks}
            </div>
          </div>
        </div>

        {/* Inspector list ONLY scroll */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {inspectors.length > 0 ? (
            inspectors.map((inspector) => {
              const progress = (inspector.total / maxTasks) * 100;

              return (
                <button
                  key={inspector.name}
                  onClick={() => setSelectedInspector(inspector.name)}
                  className="w-full text-left rounded-xl border border-gray-200 bg-white px-3 py-3 hover:border-emerald-600 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {inspector.name}
                    </span>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {inspector.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-emerald-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm border border-dashed rounded-xl">
              No inspectors found
            </div>
          )}
        </div>
      </div>

      {/* Modal (unchanged) */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <h3 className="text-gray-900 font-semibold text-sm md:text-base">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-3 flex flex-col md:flex-row gap-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/2 bg-white">
                <FiSearch size={16} className="text-gray-500" />
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
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm bg-white"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white"
              >
                {sortAsc ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-gray-900 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">BIN</th>
                    <th className="p-3 text-left">Business Name</th>
                    <th className="p-3 text-left">Scheduled Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-emerald-50/40">
                      <td className="p-3">
                        {row["Business Identification Number"]}
                      </td>
                      <td className="p-3">{row["Business Name"]}</td>
                      <td className="p-3">{row.scheduled_date}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-6 text-gray-400">
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