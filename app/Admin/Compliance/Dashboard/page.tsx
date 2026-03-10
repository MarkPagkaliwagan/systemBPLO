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
  resolved: boolean;
};

export default function ViolationsPage() {

  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  /* NEW STATE (ADDED ONLY) */
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

  useEffect(() => { fetchViolations(); }, [query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const getNoticeStatus = (notice: number, v: Violation) => {
    if (v.resolved) return "Resolved";
    if (v.notice_level >= notice) return "Sent";
    return "Pending";
  };

  const getStatusText = (v: Violation) => {
    if (v.resolved) return "Resolved";
    if (v.notice_level > 3) return "Cease and Desist";
    return "Pending";
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key) return <FiChevronDown className="inline ml-1 text-green-200" />;
    return sortAsc
      ? <FiChevronUp className="inline ml-1 text-green-200" />
      : <FiChevronDown className="inline ml-1 text-green-200" />;
  };

  const StatusBadge = ({ v }: { v: Violation }) => {
    const status = getStatusText(v);

    if (status === "Resolved")
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900">Resolved</span>;

    if (status === "Cease and Desist")
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cease & Desist</span>;

    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
  };

  const NoticeBadge = ({ notice, v }: { notice: number; v: Violation }) => {
    const s = getNoticeStatus(notice, v);

    if (s === "Sent")
      return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-900 font-medium">Sent</span>;

    if (s === "Resolved")
      return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">Resolved</span>;

    return <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">Pending</span>;
  };

  /* NEW FUNCTIONS (ADDED ONLY) */

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === violations.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(violations.map(v => v.id))
    }
  }

  const sendSelectedNotices = async () => {

    if (selectedIds.length === 0) {
      alert("No violations selected")
      return
    }

    for (const id of selectedIds) {

      await fetch("/api/manual-send-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })

    }

    alert("Selected notices sent")

    setSelectedIds([])
    fetchViolations()

  }

  const sendSingleNotice = async (id: number) => {

    await fetch("/api/manual-send-notice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })

    alert("Notice sent")

    fetchViolations()
  }

  return (

    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 px-4 md:px-6 flex flex-col md:flex-row">

      <Sidebar
        isCollapsed={false}
        setIsCollapsed={() => { }}
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => { }}
      />

      <div className="flex-1 max-w-7xl mx-auto space-y-6 w-full">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row justify-between gap-4">

          <div>
            <h1 className="text-3xl font-extrabold text-black">Violations Monitoring</h1>
            <p className="text-gray-600 text-sm">Track business violations and notices</p>
          </div>

          <div className="flex gap-3 items-center">

            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold text-black">{violations.length}</div>
            </div>

            <button
              onClick={sendSelectedNotices}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              disabled={selectedIds.length === 0}
            >
              Send Selected
            </button>

          </div>

        </div>

        {/* SEARCH */}

        <div className="relative w-full md:w-96">

          <FiSearch className="absolute top-3 left-3 text-gray-600 pointer-events-none" />

          <input
            type="text"
            placeholder="Search by Business ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-900 text-black"
          />

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

          <div className="hidden md:block overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-green-900 text-white">

                <tr>

                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === violations.length && violations.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>

                  <th className="px-6 py-3 cursor-pointer"
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

              <tbody>

                {violations.map(v => (
                  <tr
                    key={v.id}
                    className={`border-t text-black hover:bg-gray-50 ${selectedIds.includes(v.id) ? "bg-green-50" : ""}`}
                  >

                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        onChange={() => toggleSelect(v.id)}
                      />
                    </td>

                    <td className="px-6 py-3 font-medium">{v.business_id}</td>

                    <td className="px-6 py-3">{v.violation}</td>

                    <td className="px-6 py-3"><NoticeBadge notice={1} v={v} /></td>
                    <td className="px-6 py-3"><NoticeBadge notice={2} v={v} /></td>
                    <td className="px-6 py-3"><NoticeBadge notice={3} v={v} /></td>

                    <td className="px-6 py-3"><StatusBadge v={v} /></td>

                    <td className="px-6 py-3">

                      <button
                        onClick={() => sendSingleNotice(v.id)}
                        className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700"
                      >
                        Send Notice
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* MOBILE */}

          <div className="md:hidden space-y-4 p-4">

            {violations.map(v => (
              <div key={v.id} className="border rounded-xl p-4 bg-white shadow-sm">

                <div className="flex justify-between items-center">

                  <input
                    type="checkbox"
                    checked={selectedIds.includes(v.id)}
                    onChange={() => toggleSelect(v.id)}
                  />

                  <StatusBadge v={v} />

                </div>

                <div className="font-semibold text-black mt-2">{v.business_id}</div>

                <div className="text-gray-700 text-sm">{v.violation}</div>

                <div className="flex gap-2 mt-2">
                  <NoticeBadge notice={1} v={v} />
                  <NoticeBadge notice={2} v={v} />
                  <NoticeBadge notice={3} v={v} />
                </div>

                <button
                  onClick={() => sendSingleNotice(v.id)}
                  className="mt-3 w-full bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700"
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