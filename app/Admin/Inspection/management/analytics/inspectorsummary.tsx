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
  total: number; // number of schedules assigned
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

function formatDate(dateString: string | null) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getBarTheme(index: number) {
  const themes = [
    "from-emerald-500 to-emerald-600",
    "from-sky-500 to-blue-600",
    "from-violet-500 to-indigo-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-teal-600",
  ];

  return themes[index % themes.length];
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
      total: grouped[name], // schedule count
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

  const maxTasks = inspectors.length > 0 ? Math.max(...inspectors.map((i) => i.total)) : 1;

  return (
    <>
      <div className="w-full bg-gradient-to-b from-slate-50 to-white p-3 md:p-4">
        <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <FiClipboard size={19} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white md:text-lg">
                  Inspector Workload
                </h2>
                <p className="text-[11px] text-white/80">
                  Click an inspector to view assigned records
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
              {inspectors.length > 0 ? (
                inspectors.map((inspector, index) => {
                  const progress = (inspector.total / maxTasks) * 100;
                  const isSelected = selectedInspector === inspector.name;
                  const theme = getBarTheme(index);

                  return (
                    <button
                      key={inspector.name}
                      onClick={() => setSelectedInspector(inspector.name)}
                      className={`w-full rounded-2xl border bg-white p-3 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm ${
                        isSelected
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {inspector.name}
                        </span>
                        <span className="shrink-0 text-[11px] text-slate-500">
                          {inspector.total} schedule{inspector.total > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-5 rounded-full bg-gradient-to-r ${theme} transition-all duration-300`}
                            style={{
                              width: `${Math.max(progress, 8)}%`,
                              minWidth: "1.5rem",
                            }}
                          />
                        </div>

                        <span className="w-8 text-right text-sm font-semibold text-slate-700">
                          {inspector.total}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                  No inspectors found
                </div>
              )}
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              Click an inspector to view assigned records.
            </p>
          </div>
        </div>
      </div>

      {selectedInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[90vh] w-full max-w-[95%] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900 md:text-base">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 p-3 md:flex-row">
              <div className="flex w-full items-center rounded-xl border border-slate-300 bg-white px-3 py-2 md:w-1/2">
                <FiSearch size={16} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Search business name or BIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>

              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-50"
              >
                {sortAsc ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm text-slate-900">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="p-3 text-left font-medium text-slate-600">BIN</th>
                    <th className="p-3 text-left font-medium text-slate-600">
                      Business Name
                    </th>
                    <th className="p-3 text-left font-medium text-slate-600">
                      Scheduled Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 transition-colors hover:bg-emerald-50/40"
                    >
                      <td className="p-3">
                        {row["Business Identification Number"] || "-"}
                      </td>
                      <td className="p-3">{row["Business Name"] || "-"}</td>
                      <td className="p-3">{formatDate(row.scheduled_date)}</td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400">
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