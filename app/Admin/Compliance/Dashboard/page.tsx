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
        <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-900 font-medium">
          Resolved
        </span>
      );

    if (status === "Cease and Desist")
      return (
        <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 font-medium">
          Cease & Desist
        </span>
      );

    return (
      <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-medium">
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
      <span className="text-xs px-2 py-0.5 rounded-full border text-gray-800">
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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === violations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(violations.map((v) => v.id));
    }
  };

  const sendSelectedNotices = async () => {
    if (selectedIds.length === 0) {
      alert("No violations selected");
      return;
    }

    for (const id of selectedIds) {
      await handleSendNotice(id);
    }

    setSelectedIds([]);
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

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <h1 className="text-3xl font-extrabold text-black">
            Violations Monitoring
          </h1>

          <button
            onClick={sendSelectedNotices}
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Send Selected
          </button>

        </div>

        {/* SEARCH */}

        <div className="relative w-full md:w-96">

          <FiSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search by Business ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 text-black placeholder-gray-400"
          />

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow border overflow-hidden">

          <div className="hidden md:block overflow-x-auto">

            <table className="min-w-full text-sm text-black">

              <thead className="bg-green-900 text-white">

                <tr>

                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        selectedIds.length === violations.length &&
                        violations.length > 0
                      }
                    />
                  </th>

                  <th
                    className="px-6 py-3 cursor-pointer text-left"
                    onClick={() => toggleSort("business_id")}
                  >
                    Business ID {renderSortIcon("business_id")}
                  </th>

                  <th className="px-6 py-3 text-left">Violation</th>
                  <th className="px-6 py-3 text-left">Notice 1</th>
                  <th className="px-6 py-3 text-left">Notice 2</th>
                  <th className="px-6 py-3 text-left">Notice 3</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Action</th>

                </tr>

              </thead>

              <tbody>

                {violations.map((v) => (

                  <tr
                    key={v.id}
                    className="border-t text-black hover:bg-gray-50"
                  >

                    <td className="px-4 py-3 text-center">

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => toggleSelect(v.id)}
                      />

                    </td>

                    <td className="px-6 py-3 font-medium">{v.business_id}</td>

                    <td className="px-6 py-3">{v.violation}</td>

                    <td className="px-6 py-3">
                      <NoticeBadge notice={1} v={v} />
                    </td>

                    <td className="px-6 py-3">
                      <NoticeBadge notice={2} v={v} />
                    </td>

                    <td className="px-6 py-3">
                      <NoticeBadge notice={3} v={v} />
                    </td>

                    <td className="px-6 py-3">
                      <StatusBadge v={v} />
                    </td>

                    <td className="px-6 py-3">

                      <button
                        onClick={() => handleSendNotice(v.id)}
                        disabled={!canSendNotice(v)}
                        className={`px-3 py-1 text-xs rounded-md ${
                          canSendNotice(v)
                            ? "bg-green-600 text-white hover:bg-green-700"
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

          {/* MOBILE CARDS */}

          <div className="md:hidden p-4 space-y-4">

            {violations.map((v) => (

              <div
                key={v.id}
                className="border rounded-xl p-4 bg-white shadow-sm text-black"
              >

                <div className="flex justify-between items-center">

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(v.id)}
                    onChange={() => toggleSelect(v.id)}
                  />

                  <StatusBadge v={v} />

                </div>

                <div className="font-semibold mt-2 text-black">
                  {v.business_id}
                </div>

                <div className="text-sm text-gray-700 mt-1">
                  {v.violation}
                </div>

                <div className="flex gap-2 mt-2">
                  <NoticeBadge notice={1} v={v} />
                  <NoticeBadge notice={2} v={v} />
                  <NoticeBadge notice={3} v={v} />
                </div>

                <button
                  onClick={() => handleSendNotice(v.id)}
                  disabled={!canSendNotice(v)}
                  className="mt-3 w-full bg-green-600 text-white text-xs py-2 rounded-lg hover:bg-green-700"
                >
                  Send Notice
                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}