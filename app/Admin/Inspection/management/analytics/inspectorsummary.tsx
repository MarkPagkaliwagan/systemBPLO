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
      return parsed.map((i) => String(i).trim()).filter(Boolean);
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
  const [sortAsc, setSortAsc] = useState(true);

  const [timeFilter, setTimeFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("business_records")
      .select(`
        assigned_inspector,
        "Business Identification Number",
        "Business Name",
        scheduled_date
      `);

    const rows = data || [];
    setRecords(rows);
  }

  // ✅ TIME FILTER FUNCTION
  function applyTimeFilter(list: RecordType[]) {
    const now = new Date();

    return list.filter((r) => {
      if (!r.scheduled_date) return false;

      const d = new Date(r.scheduled_date);

      switch (timeFilter) {
        case "THIS_MONTH":
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );

        case "LAST_MONTH":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return (
            d.getMonth() === lastMonth.getMonth() &&
            d.getFullYear() === lastMonth.getFullYear()
          );

        case "THIS_YEAR":
          return d.getFullYear() === now.getFullYear();

        case "LAST_YEAR":
          return d.getFullYear() === now.getFullYear() - 1;

        default:
          return true;
      }
    });
  }

  // ✅ RE-COMPUTE INSPECTORS BASED ON FILTER
  const filteredInspectors = useMemo(() => {
    const filtered = applyTimeFilter(records);

    const grouped: Record<string, number> = {};

    filtered.forEach((r) => {
      const inspectors = parseAssignedInspectors(r.assigned_inspector);

      inspectors.forEach((name) => {
        grouped[name] = (grouped[name] || 0) + 1;
      });
    });

    let list = Object.keys(grouped).map((name) => ({
      name,
      total: grouped[name],
    }));

    list.sort((a, b) => (sortAsc ? a.total - b.total : b.total - a.total));

    return list;
  }, [records, timeFilter, sortAsc]);

  const maxTasks =
    filteredInspectors.length > 0
      ? Math.max(...filteredInspectors.map((i) => i.total))
      : 1;

  const filteredRecords = useMemo(() => {
    if (!selectedInspector) return [];

    let list = records.filter((r) =>
      parseAssignedInspectors(r.assigned_inspector).includes(selectedInspector)
    );

    list = applyTimeFilter(list);

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r["Business Name"]?.toLowerCase().includes(s) ||
          r["Business Identification Number"]?.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) => {
      const da = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const db = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
      return sortAsc ? da - db : db - da;
    });

    return list;
  }, [records, selectedInspector, search, sortAsc, timeFilter]);

  return (
    <>
      <div className="w-full bg-gray-50">
        <div className="bg-white border rounded-2xl p-4">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <FiClipboard className="text-green-900" />
              <h2 className="font-semibold text-gray-900">
                Inspector Analytics
              </h2>
            </div>

            <div className="flex gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border px-2 py-1 rounded-lg text-sm"
              >
                <option value="ALL">All</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
                <option value="THIS_YEAR">This Year</option>
                <option value="LAST_YEAR">Last Year</option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="border px-2 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                {sortAsc ? <FiArrowUp /> : <FiArrowDown />}
              </button>
            </div>
          </div>

          {/* ✅ HORIZONTAL BAR CHART */}
          <div className="space-y-3">
            {filteredInspectors.map((inspector) => {
              const percent = (inspector.total / maxTasks) * 100;

              return (
                <div
                  key={inspector.name}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setSelectedInspector(inspector.name)}
                >
                  {/* LABEL LEFT */}
                  <div className="w-40 text-sm text-gray-700 truncate">
                    {inspector.name}
                  </div>

                  {/* BAR */}
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                    <div
                      className="bg-green-900 h-5 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />

                    {/* VALUE */}
                    <span className="absolute right-2 top-0 text-xs text-white">
                      {inspector.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AXIS */}
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-40">
            <span>0</span>
            <span>{Math.round(maxTasks / 2)}</span>
            <span>{maxTasks}</span>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {selectedInspector && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between p-4 border-b">
              <h3 className="font-semibold">
                {selectedInspector} Assignments
              </h3>
              <button onClick={() => setSelectedInspector(null)}>
                <FiX />
              </button>
            </div>

            <div className="p-3 flex gap-2 border-b">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border px-2 py-1 rounded w-full"
              />
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">BIN</th>
                  <th className="p-2">Business Name</th>
                  <th className="p-2">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((r, i) => (
                  <tr key={i} className="border-t">
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
      )}
    </>
  );
}