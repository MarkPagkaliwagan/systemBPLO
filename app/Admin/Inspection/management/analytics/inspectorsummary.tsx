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

function parseInspectors(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // not JSON, continue below
  }

  if (raw.includes(",")) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [raw];
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
    const { data, error } = await supabase
      .from("business_records")
      .select(
        `assigned_inspector,
        "Business Identification Number",
        "Business Name",
        scheduled_date`
      );

    if (error) {
      console.error("Error fetching business records:", error.message);
      setRecords([]);
      setInspectors([]);
      return;
    }

    const rows = data || [];
    setRecords(rows);

    const grouped: Record<string, number> = {};

    rows.forEach((row) => {
      const assigned = parseInspectors(row.assigned_inspector);

      // count each inspector only once per record
      const uniqueInspectors = Array.from(new Set(assigned));

      uniqueInspectors.forEach((inspector) => {
        grouped[inspector] = (grouped[inspector] || 0) + 1;
      });
    });

    const list = Object.keys(grouped).map((name) => ({
      name,
      total: grouped[name],
    }));

    list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    setInspectors(list);
  }

  const filteredRecords = useMemo(() => {
    if (!selectedInspector) return [];

    let list = records.filter((r) =>
      parseInspectors(r.assigned_inspector).includes(selectedInspector)
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

    list = [...list].sort((a, b) => {
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <FiClipboard size={18} className="text-slate-700" />
              <span className="text-sm font-semibold text-slate-900">
                Inspector Workload
              </span>
            </div>

            <div className="p-3 grid gap-2">
              {inspectors.length > 0 ? (
                inspectors.map((inspector) => {
                  const progress = (inspector.total / maxTasks) * 100;

                  return (
                    <button
                      key={inspector.name}
                      onClick={() => {
                        setSelectedInspector(inspector.name);
                        setSearch("");
                        setMonthFilter("");
                        setSortAsc(true);
                      }}
                      className="text-left w-full rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm text-slate-900 font-medium truncate">
                          {inspector.name}
                        </span>
                        <span className="text-xs text-slate-600 font-medium shrink-0">
                          {inspector.total}
                        </span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500"
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-5xl rounded-xl border border-slate-200 shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-3 flex flex-col md:flex-row gap-2 border-b border-slate-200">
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 w-full md:w-1/2">
                <FiSearch size={16} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Search business name or BIN"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm bg-white w-full md:w-auto"
              />

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center gap-1 border border-slate-200 px-3 py-2 rounded-lg text-slate-900 text-sm bg-white w-full md:w-auto"
              >
                {sortAsc ? <FiArrowUp size={15} /> : <FiArrowDown size={15} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left font-medium text-slate-700">
                      BIN
                    </th>
                    <th className="p-3 text-left font-medium text-slate-700">
                      Business Name
                    </th>
                    <th className="p-3 text-left font-medium text-slate-700">
                      Scheduled Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-slate-900">
                        {row["Business Identification Number"] || "-"}
                      </td>
                      <td className="p-3 text-slate-900">
                        {row["Business Name"] || "-"}
                      </td>
                      <td className="p-3 text-slate-900">
                        {row.scheduled_date || "-"}
                      </td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center p-6 text-slate-400 text-sm"
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