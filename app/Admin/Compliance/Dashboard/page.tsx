"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiSend, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "../../../components/sidebar";
import CalendarPage from "../../../Admin/Compliance/Dashboard/calendar";

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

  // Mobile state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [autoSend, setAutoSend] = useState(false); // ✅ missing state
  const [editingInterval, setEditingInterval] = useState<number | null>(null);
  const [intervalValue, setIntervalValue] = useState<number>(7);

  const handleMarkResolved = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("business_violations")
        .update({ resolved: true })
        .eq("id", id);

      if (error) {
        alert("Failed to mark as resolved.");
        console.error(error);
      } else {
        fetchViolations(); // refresh table/cards
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  const updateInterval = async (id: number) => {
    const { error } = await supabase
      .from("business_violations")
      .update({ interval_days: intervalValue })
      .eq("id", id);

    if (error) {
      alert("Failed to update interval");
      console.error(error);
    } else {
      setEditingInterval(null);
      fetchViolations();
    }
  };
  // load persisted Auto Send state
  useEffect(() => {
    const loadSetting = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "auto_send")
        .single();

      if (data) setAutoSend(data.value);
    };

    loadSetting();
  }, []);

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

  // ✅ Updated getNoticeStatus to default 0
  const getNoticeStatus = (notice: number, v: Violation) => {
    const level = v.notice_level || 0;
    if (v.resolved) return "Resolved";
    if (level >= notice) return "Sent";
    return "Pending";
  };

const getStatusText = (v: Violation) => {
  if (v.resolved) return "Resolved";
  // Cease and Desist kapag notice_level >= 3
  if ((v.notice_level || 0) >= 3) return "Cease and Desist";
  return "Pending";
};

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key) return <FiChevronDown className="inline ml-1 text-green-200" />;
    return sortAsc
      ? <FiChevronUp className="inline ml-1 text-green-200" />
      : <FiChevronDown className="inline ml-1 text-green-200" />;
  };

  // Badges
  const StatusBadge = ({ v }: { v: Violation }) => {
    const status = getStatusText(v);
    if (status === "Resolved")
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900">Resolved</span>;
    if (status === "Cease and Desist")
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Cease & Desist</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
  };

  const NoticeBadge = ({ notice, v }: { notice: number; v: Violation }) => {
    const s = getNoticeStatus(notice, v);
    if (s === "Sent") return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-900 font-medium">Sent</span>;
    if (s === "Resolved") return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">Resolved</span>;
    return <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium">Pending</span>;
  };

  // Check if Send Notice button is allowed based on interval_days
  const canSendNotice = (v: Violation) => {
    if (v.resolved || v.cease_flag) return false;
    const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
    const interval = v.interval_days ?? 7;
    if (!lastSent) return true;
    const nextSend = new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000);
    return new Date() >= nextSend;
  };

  // Manual send handler
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
      fetchViolations(); // refresh table/cards
    } catch (err) {
      console.error(err);
      alert("Error sending notice.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 px-4 md:px-6 flex flex-col md:flex-row">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
<div className="flex-1 max-w-7xl mx-auto space-y-6 w-full">
  {/* Calendar */}
  <div className="mb-8">
    <CalendarPage />
  </div>

  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900">Violations Monitoring</h1>
      <p className="text-gray-500 mt-1 text-sm max-w-xl">Track business violations and notices</p>
    </div>
    <div className="text-right">
      <div className="text-xs text-gray-500">Total</div>
      <div className="text-lg font-semibold text-gray-900">{violations.length}</div>
    </div>
  </div>


        {/* Search + Legend */}
        <div className="flex flex-col md:flex-row md:items-center text-black justify-between gap-4">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute top-3 left-3 text-green-900 opacity-80" />
            <input
              type="text"
              placeholder="Search by Business ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-900 shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-700" /> <span className="text-gray-600">Sent</span></div>
          <div className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-gray-600">Pending</span></div>
          <div className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600" /> <span className="text-gray-600">Cease &amp; Desist</span></div>
        </div>


        {/* ....Table / Cards */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

          {/* ...Desktop Table */}
          <div className="w-full overflow-x-auto hidden md:block">
            <table className="min-w-full table-fixed">
              <thead className="bg-green-900 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => toggleSort("business_id")}>
                    <div className="flex items-center">Business ID {renderSortIcon("business_id")}</div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Violation</th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 1</th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 2</th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Notice 3</th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                    Interval Days
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Action</span>
                      {/* Auto Send toggle inside header */}
                      <label className="flex items-center cursor-pointer select-none ml-2">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={autoSend}
                            onChange={async (e) => {
                              const checked = e.target.checked;
                              setAutoSend(checked);

                              await supabase
                                .from("settings")
                                .upsert({
                                  key: "auto_send",
                                  value: checked
                                });
                            }}
                          />
                          <div className={`w-11 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${autoSend ? "bg-green-600" : ""}`} />
                          <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoSend ? "translate-x-5" : ""}`}
                          />
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-100 flex items-center gap-1">
                          Auto Send <FiSend className="text-green-100" />
                        </span>
                      </label>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-20" /></td>
                    </tr>
                  ))
                  : violations.length === 0
                    ? <tr><td colSpan={7} className="text-center py-10 text-gray-500">NO DATA FOUND</td></tr>
                    : violations.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900">{v.business_id}</div>
                          {v.last_sent_time && <div className="text-xs text-gray-400 mt-1">Last sent: {new Date(v.last_sent_time).toLocaleString()}</div>}
                        </td>
                        <td className="px-6 py-4 align-top"><div className="text-sm text-gray-700 line-clamp-2">{v.violation}</div></td>
                        <td className="px-6 py-4 align-top"><NoticeBadge notice={1} v={v} /></td>
                        <td className="px-6 py-4 align-top"><NoticeBadge notice={2} v={v} /></td>
                        <td className="px-6 py-4 align-top"><NoticeBadge notice={3} v={v} /></td>
                        <td className="px-6 py-4 align-top">
                          {editingInterval === v.id ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                value={intervalValue}
                                onChange={(e) => setIntervalValue(Number(e.target.value))}
                                className="w-16 border text-black rounded px-1 py-0.5 text-xs"
                              />
                              <button
                                onClick={() => updateInterval(v.id)}
                                className="text-green-600 text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingInterval(null)}
                                className="text-gray-500 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingInterval(v.id);
                                setIntervalValue(v.interval_days ?? 7);
                              }}
                              className="cursor-pointer text-sm text-gray-700 hover:text-green-700"
                            >
                              {v.interval_days ?? 7} days
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top"><StatusBadge v={v} /></td>
                        <td className="px-6 py-4 align-top">
                          <button
                            onClick={() => handleSendNotice(v.id)}
                            disabled={autoSend || !canSendNotice(v)}
                            className={`px-2 py-1 text-xs rounded font-medium ${autoSend || !canSendNotice(v) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                          >
                            Send Notice
                          </button>

                          <button
                            onClick={() => handleMarkResolved(v.id)}
                            disabled={v.resolved}
                            className={`ml-2 px-2 py-1 text-xs rounded font-medium ${v.resolved ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            Mark Resolved
                          </button>

                          {!canSendNotice(v) && v.last_sent_time && (
                            <div className="text-xs text-gray-500 mt-1">
                              Next send: {new Date(new Date(v.last_sent_time).getTime() + (v.interval_days ?? 7) * 24 * 60 * 60 * 1000).toLocaleString()}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {/* Mobile Auto Send toggle */}
            <div className="md:hidden flex justify-end mb-2 px-4">
              <label className="flex items-center cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={autoSend}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      setAutoSend(checked);

                      await supabase
                        .from("settings")
                        .upsert({
                          key: "auto_send",
                          value: checked
                        });
                    }}
                  />
                  <div className={`w-11 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${autoSend ? "bg-green-600" : ""}`} />
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoSend ? "translate-x-5" : ""}`}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                  Auto Send <FiSend className="text-green-600" />
                </span>
              </label>
            </div>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse border rounded-xl p-4 bg-gray-100 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              ))
              : violations.length === 0
                ? <div className="text-center py-10 text-gray-500">NO DATA FOUND</div>
                : violations.map((v) => (
                  <div key={v.id} className="border rounded-xl p-4 bg-white shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-900 text-sm">{v.business_id}</div>
                      <StatusBadge v={v} />
                    </div>
                    <div className="text-gray-700 text-sm line-clamp-2">{v.violation}</div>
                    <div className="flex gap-2">
                      <NoticeBadge notice={1} v={v} />
                      <NoticeBadge notice={2} v={v} />
                      <NoticeBadge notice={3} v={v} />
                    </div>
                    <div className="text-xs text-gray-500">
                      Interval:{" "}
                      {editingInterval === v.id ? (
                        <span className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={intervalValue}
                            onChange={(e) => setIntervalValue(Number(e.target.value))}
                            className="w-16 border rounded px-1 py-0.5 text-xs"
                          />
                          <button
                            onClick={() => updateInterval(v.id)}
                            className="text-green-600 text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingInterval(null)}
                            className="text-gray-500 text-xs"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingInterval(v.id);
                            setIntervalValue(v.interval_days ?? 7);
                          }}
                          className="cursor-pointer text-gray-700 hover:text-green-700"
                        >
                          {v.interval_days ?? 7} days
                        </span>
                      )}
                    </div>
                    {v.last_sent_time && <div className="text-xs text-gray-400">Last sent: {new Date(v.last_sent_time).toLocaleString()}</div>}
                    <button
                      onClick={() => handleSendNotice(v.id)}
                      disabled={autoSend || !canSendNotice(v)}
                      className={`px-2 py-1 text-xs rounded font-medium ${autoSend || !canSendNotice(v) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      Send Notice
                    </button>
                    <button
                      onClick={() => handleMarkResolved(v.id)}
                      disabled={v.resolved}
                      className={`mt-1 w-full px-2 py-1 text-xs rounded font-medium ${v.resolved ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      Mark Resolved
                    </button>
                    {!canSendNotice(v) && v.last_sent_time && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next send: {new Date(new Date(v.last_sent_time).getTime() + (v.interval_days ?? 7) * 24 * 60 * 60 * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

