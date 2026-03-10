// app/violations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Violation = {
  id: number;
  business_id: string;
  violation: string;
  notice_level: number;
  last_sent_time: string | null;
  resolved: boolean;
};

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Fetch violations from Supabase
  const fetchViolations = async () => {
    let { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .ilike("business_id", `%${query}%`)
      .order(sortKey || "id", { ascending: sortAsc });

    if (error) console.error(error);
    else setViolations(data || []);
  };

  useEffect(() => {
    fetchViolations();
  }, [query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Helper to show notice status
  const getNoticeStatus = (notice: number, violation: Violation) => {
    if (violation.resolved) return "Resolved";
    if (violation.notice_level >= notice) return "Sent";
    return "Pending";
  };

  const getStatusText = (violation: Violation) => {
    if (violation.resolved) return "Resolved";
    if (violation.notice_level > 3) return "Cease and Desist";
    return "Pending";
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key) return <FiChevronDown className="inline ml-1 text-gray-400" />;
    return sortAsc ? <FiChevronUp className="inline ml-1 text-gray-400" /> : <FiChevronDown className="inline ml-1 text-gray-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 p-4">
      <h1 className="text-3xl font-bold mb-4">Violations Monitoring</h1>

      {/* Search */}
      <div className="mb-4 w-full md:w-96 relative">
        <FiSearch className="absolute top-3 left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Business ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-xl shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-green-800 text-white">
            <tr>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-green-700"
                onClick={() => toggleSort("business_id")}
              >
                Business ID {renderSortIcon("business_id")}
              </th>
              <th className="px-6 py-3">Violation</th>
              <th className="px-6 py-3">Notice 1</th>
              <th className="px-6 py-3">Notice 2</th>
              <th className="px-6 py-3">Notice 3</th>
              <th
                className="px-6 py-3 cursor-pointer hover:bg-green-700"
                onClick={() => toggleSort("resolved")}
              >
                Status {renderSortIcon("resolved")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {violations.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No violations found
                </td>
              </tr>
            ) : (
              violations.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">{v.business_id}</td>
                  <td className="px-6 py-4">{v.violation}</td>
                  <td className="px-6 py-4">{getNoticeStatus(1, v)}</td>
                  <td className="px-6 py-4">{getNoticeStatus(2, v)}</td>
                  <td className="px-6 py-4">{getNoticeStatus(3, v)}</td>
                  <td className="px-6 py-4 font-semibold">
                    {getStatusText(v)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}