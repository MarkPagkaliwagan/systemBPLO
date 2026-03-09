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
  const [loading, setLoading] = useState(false);

  // Fetch violations from Supabase (logic intact)
  const fetchViolations = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .ilike("business_id", `%${query}%`)
      .order(sortKey || "id", { ascending: sortAsc });

    if (error) console.error(error);
    else setViolations(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchViolations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Helper to show notice status (logic intact)
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
    if (sortKey !== key) return <FiChevronDown className="inline ml-1 text-green-200" />;
    return sortAsc ? <FiChevronUp className="inline ml-1 text-green-200" /> : <FiChevronDown className="inline ml-1 text-green-200" />;
  };

  const StatusBadge = ({ v }: { v: Violation }) => {
    const status = getStatusText(v);
    if (status === "Resolved")
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900">Resolved</span>;
    if (status === "Cease and Desist")
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cease &amp; Desist</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
  };

  const NoticeBadge = ({ notice, v }: { notice: number; v: Violation }) => {
    const s = getNoticeStatus(notice, v);
    if (s === "Sent") return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-900 font-medium">Sent</span>;
    if (s === "Resolved") return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">Resolved</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-white border text-gray-700 font-medium">Pending</span>;
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Violations Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500 max-w-xl">
            Monitor business violations, notices, and status. Minimalist interface for non-tech users.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-semibold text-gray-900">{violations.length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Search */}
        <label htmlFor="search" className="sr-only">Search by Business ID</label>
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute top-3 left-3 text-green-900 opacity-80" />
          <input
            id="search"
            type="text"
            placeholder="Search by Business ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-900 shadow-sm"
            aria-label="Search by Business ID"
          />
        </div>

        {/* simple legend */}
        <div className="flex items-center gap-3 text-sm">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-700" />
            <span className="text-gray-600">Sent</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-gray-600">Cease &amp; Desist</span>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-green-900 text-white">
              <tr>
                <th
                  className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => toggleSort("business_id")}
                >
                  <div className="flex items-center">
                    Business ID {renderSortIcon("business_id")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Violation</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 1</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 2</th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 3</th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => toggleSort("resolved")}
                >
                  <div className="flex items-center">
                    Status {renderSortIcon("resolved")}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                // loading skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-100 rounded w-24" />
                    </td>
                  </tr>
                ))
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Walang violations na natagpuan
                  </td>
                </tr>
              ) : (
                violations.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm font-medium text-gray-900">{v.business_id}</div>
                      {v.last_sent_time && <div className="text-xs text-gray-400 mt-1">Last sent: {new Date(v.last_sent_time).toLocaleString()}</div>}
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-700 line-clamp-2">{v.violation}</div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <NoticeBadge notice={1} v={v} />
                    </td>

                    <td className="px-6 py-4 align-top">
                      <NoticeBadge notice={2} v={v} />
                    </td>

                    <td className="px-6 py-4 align-top">
                      <NoticeBadge notice={3} v={v} />
                    </td>

                    <td className="px-6 py-4 align-top">
                      <StatusBadge v={v} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}