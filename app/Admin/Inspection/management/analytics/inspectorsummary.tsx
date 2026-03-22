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
  const [selectedInspector, setSelectedInspector] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [timeFilter, setTimeFilter] = useState("all"); // NEW

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
  }

  // 🔥 FILTER BY TIME (last month / year)
  const filteredByTime = useMemo(() => {
    const now = new Date();

    return records.filter((r) => {
      if (!r.scheduled_date) return false;

      const date = new Date(r.scheduled_date);

      if (timeFilter === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      if (timeFilter === "year") {
        return date.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [records, timeFilter]);

  // 🔥 GROUP INSPECTORS BASED SA FILTERED DATA
  useEffect(() => {
    const grouped: Record<string, number> = {};

    filteredByTime.forEach((r) => {
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
  }, [filteredByTime]);

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
      <div className="w-full bg-gray-50">
        <div className="bg-white border rounded-2xl p-4">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FiClipboard className="text-green-800" />
              <h2 className="font-semibold text-gray-900">
                Inspector Workload
              </h2>
            </div>

            {/* 🔥 TIME FILTER */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* 🔥 HORIZONTAL BAR CHART */}
          <div className="space-y-3">
            {inspectors.map((inspector) => {
              const width = (inspector.total / maxTasks) * 100;

              return (
                <div
                  key={inspector.name}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setSelectedInspector(inspector.name)}
                >
                  {/* LABEL */}
                  <div className="w-40 truncate text-sm font-medium text-gray-800">
                    {inspector.name}
                  </div>

                  {/* BAR */}
                  <div className="flex-1 bg-gray-100 h-6 rounded-lg relative">
                    <div
                      className="bg-green-700 h-6 rounded-lg"
                      style={{ width: `${width}%` }}
                    />
                    <span className="absolute right-2 top-0 text-xs text-white font-semibold h-full flex items-center">
                      {inspector.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🔥 AXIS */}
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-40">
            <span>0</span>
            <span>{Math.floor(maxTasks / 2)}</span>
            <span>{maxTasks}</span>
          </div>
        </div>
      </div>

      {/* MODAL (UNCHANGED) */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-[95%] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border">
            <div className="flex justify-between items-center px-5 py-3 border-b">
              <h3 className="font-semibold">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button onClick={() => setSelectedInspector(null)}>
                <FiX />
              </button>
            </div>

            <div className="p-3 flex gap-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full"
              />

              <button onClick={() => setSortAsc(!sortAsc)}>
                {sortAsc ? <FiArrowUp /> : <FiArrowDown />}
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2">BIN</th>
                    <th className="p-2">Business</th>
                    <th className="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        {r["Business Identification Number"]}
                      </td>
                      <td className="p-2">{r["Business Name"]}</td>
                      <td className="p-2">{r.scheduled_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}