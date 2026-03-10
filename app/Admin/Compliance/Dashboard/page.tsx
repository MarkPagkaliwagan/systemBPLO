"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "../../../components/sidebar";

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
  interval_days: number | null;
  resolved: boolean;
  requestor_email: string | null;
  cease_flag?: boolean;
};

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ NEW
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchViolations = async () => {
    setLoading(true);
    const { data, error } = await supabase
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
  }, [query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // ✅ SELECT CHECKBOX
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === violations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(violations.map(v => v.id));
    }
  };

  // ✅ BULK SEND
  const handleSendSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select violations first.");
      return;
    }

    setLoading(true);

    try {
      for (const id of selectedIds) {
        await fetch("/api/manual-send-notice", {
          method: "POST",
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json" },
        });
      }

      alert("Selected notices sent successfully!");
      setSelectedIds([]);
      fetchViolations();
    } catch (err) {
      console.error(err);
      alert("Error sending notices.");
    } finally {
      setLoading(false);
    }
  };

  const getNoticeStatus = (notice: number, v: Violation) => {
    const level = v.notice_level || 0;
    if (v.resolved) return "Resolved";
    if (level >= notice) return "Sent";
    return "Pending";
  };

  const getStatusText = (v: Violation) => {
    if (v.resolved) return "Resolved";
    if (v.cease_flag) return "Cease and Desist";
    return "Pending";
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key)
      return <FiChevronDown className="inline ml-1 text-green-200" />;
    return sortAsc
      ? <FiChevronUp className="inline ml-1 text-green-200" />
      : <FiChevronDown className="inline ml-1 text-green-200" />;
  };

  const StatusBadge = ({ v }: { v: Violation }) => {
    const status = getStatusText(v);

    if (status === "Resolved")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900">
          Resolved
        </span>
      );

    if (status === "Cease and Desist")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Cease & Desist
        </span>
      );

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Pending
      </span>
    );
  };

  const NoticeBadge = ({ notice, v }: { notice: number; v: Violation }) => {
    const s = getNoticeStatus(notice, v);

    if (s === "Sent")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-900 font-medium">
          Sent
        </span>
      );

    if (s === "Resolved")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
          Resolved
        </span>
      );

    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">
        Pending
      </span>
    );
  };

  const canSendNotice = (v: Violation) => {
    if (v.resolved) return false;

    const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
    const interval = v.interval_days || 7;

    if (!lastSent) return true;

    const nextSend = new Date(
      lastSent.getTime() + interval * 24 * 60 * 60 * 1000
    );

    return new Date() >= nextSend;
  };

  const handleSendNotice = async (id: number) => {
    setLoading(true);

    try {
      const res = await fetch("/api/manual-send-notice", {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) alert("Notice sent successfully!");
      else alert(`Failed: ${data.error}`);

      fetchViolations();
    } catch (err) {
      console.error(err);
      alert("Error sending notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 px-4 md:px-6 flex flex-col md:flex-row">
      <Sidebar
        isCollapsed={false}
        setIsCollapsed={() => {}}
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
      />

      <div className="flex-1 max-w-7xl mx-auto space-y-6 w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Violations Monitoring
            </h1>
            <p className="text-gray-500 mt-1 text-sm max-w-xl">
              Track business violations and notices
            </p>
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleSendSelected}
              disabled={selectedIds.length === 0}
              className={`px-3 py-2 text-sm rounded-lg font-medium ${
                selectedIds.length > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Send Selected ({selectedIds.length})
            </button>

            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-gray-900">
                {violations.length}
              </div>
            </div>

          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96 text-black">
          <FiSearch className="absolute top-3 left-3 text-green-900 opacity-80" />
          <input
            type="text"
            placeholder="Search by Business ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-900 shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

          <div className="w-full overflow-x-auto hidden md:block">
            <table className="min-w-full table-fixed">

              <thead className="bg-green-900 text-white">
                <tr>

                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === violations.length &&
                        violations.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>

                  <th
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort("business_id")}
                  >
                    Business ID {renderSortIcon("business_id")}
                  </th>

                  <th className="px-6 py-3">Violation</th>
                  <th className="px-6 py-3">Notice 1</th>
                  <th className="px-6 py-3">Notice 2</th>
                  <th className="px-6 py-3">Notice 3</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>

                </tr>
              </thead>

              <tbody className="divide-y">

                {violations.map((v) => (
                  <tr key={v.id}>

                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => toggleSelect(v.id)}
                      />
                    </td>

                    <td className="px-6 py-4">{v.business_id}</td>

                    <td className="px-6 py-4">{v.violation}</td>

                    <td className="px-6 py-4">
                      <NoticeBadge notice={1} v={v} />
                    </td>

                    <td className="px-6 py-4">
                      <NoticeBadge notice={2} v={v} />
                    </td>

                    <td className="px-6 py-4">
                      <NoticeBadge notice={3} v={v} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge v={v} />
                    </td>

                    <td className="px-6 py-4">

                      <button
                        onClick={() => handleSendNotice(v.id)}
                        disabled={!canSendNotice(v)}
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          canSendNotice(v)
                            ? "bg-green-600 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        Send Notice
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}