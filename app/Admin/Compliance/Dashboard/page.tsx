"use client";



import { useEffect, useMemo, useState } from "react";

import {

  FiChevronDown,

  FiChevronUp,

  FiSearch,

  FiChevronLeft,

  FiChevronRight,

  FiRefreshCw,

} from "react-icons/fi";

import Sidebar from "../../../components/sidebar";

import { supabase } from "@/lib/supabaseClient";

import DetailsFerBusesForm from "./detailsferbusesform";

import Calendar from "../Calendar";



interface Violation {

  id: number;

  business_id: number | null;

  notice_level: number;

  status: string;

  penalty_amount: number | null;

  payment_amount: number | null;

  buses: {

    business_name: string | null;

  } | null;

<<<<<<< HEAD
=======
  // ✅ Updated getNoticeStatus to default 0
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
        isCollapsed={false}
        setIsCollapsed={() => { }}
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => { }}
      />

      <div className="flex-1 max-w-7xl mx-auto space-y-6 w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                    {v.last_sent_time && <div className="text-xs text-gray-400">Last sent: {new Date(v.last_sent_time).toLocaleString()}</div>}
                    <button
                      onClick={() => handleSendNotice(v.id)}
                      disabled={autoSend || !canSendNotice(v)}
                      className={`px-2 py-1 text-xs rounded font-medium ${autoSend || !canSendNotice(v) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      Send Notice
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
>>>>>>> 4faf358ae7ecb49dc26c97e864d0355873d0ae75
}



type SortKey =

  | "id"

  | "business_name"

  | "notice_level"

  | "penalty_amount"

  | "status"

  | "payment_amount";



export default function DashboardPage() {

  const [violations, setViolations] = useState<Violation[]>([]);

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [query, setQuery] = useState<string>("");

  const [sortBy, setSortBy] = useState<{ key: SortKey; dir: "asc" | "desc" }>({

    key: "id",

    dir: "asc",

  });

  const [page, setPage] = useState<number>(1);

  const [perPage, setPerPage] = useState<number>(10);



  useEffect(() => {

    fetchData();

  }, []);



  const fetchData = async () => {

    setLoading(true);

    const { data, error } = await supabase.from("violations").select(`

      id,

      business_id,

      notice_level,

      status,

      penalty_amount,

      payment_amount,

      buses (

        business_name

      )

    `);

    setLoading(false);

    if (error) {

      console.error("Error fetching violations:", error);

      return;

    }

    setViolations(data as unknown as Violation[]);

  };



  const getStatusBadge = (status: string) => {

    if (status === "open") return "bg-yellow-100 text-yellow-800";

    if (status === "cease_desist") return "bg-red-100 text-red-700";

    if (status === "resolved") return "bg-green-100 text-green-700";

    return "bg-gray-100 text-gray-600";

  };



  const prettyStatus = (s: string) => {

    if (s === "open") return "Active Case";

    if (s === "cease_desist") return "Cease & Desist";

    if (s === "resolved") return "Resolved";

    return s;

  };



  const getNoticeBadge = (

    requiredLevel: number,

    currentLevel: number,

    status: string

  ) => {

    if (status === "resolved")

      return (

        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">

          -

        </span>

      );

    if (currentLevel >= requiredLevel)

      return (

        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">

          Sent

        </span>

      );

    return (

      <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">

        Pending

      </span>

    );

  };



  const renderSortIcon = (key: SortKey) => {

    if (sortBy.key !== key)

      return <FiChevronDown className="inline ml-1 opacity-40" />;

    return sortBy.dir === "asc" ? (

      <FiChevronUp className="inline ml-1" />

    ) : (

      <FiChevronDown className="inline ml-1" />

    );

  };



  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    if (!q) return violations;

    return violations.filter((v) => {

      const name = v.buses?.business_name ?? "";

      const id = String(v.business_id ?? v.id ?? "");

      const status = v.status ?? "";

      const payment_amount = String(v.payment_amount ?? "0");

      return (

        name.toLowerCase().includes(q) ||

        id.toLowerCase().includes(q) ||

        status.toLowerCase().includes(q) ||

        payment_amount.toLowerCase().includes(q)

      );

    });

  }, [violations, query]);



  const sorted = useMemo(() => {

    const arr = [...filtered];

    arr.sort((a, b) => {

      let av: any;

      let bv: any;

      switch (sortBy.key) {

        case "business_name":

          av = (a.buses?.business_name ?? "").toLowerCase();

          bv = (b.buses?.business_name ?? "").toLowerCase();

          break;

        case "notice_level":

          av = a.notice_level ?? 0;

          bv = b.notice_level ?? 0;

          break;

        case "penalty_amount":

          av = a.penalty_amount ?? 0;

          bv = b.penalty_amount ?? 0;

          break;

        case "payment_amount":

          av = a.payment_amount ?? 0;

          bv = b.payment_amount ?? 0;

          break;

        case "status":

          av = (a.status ?? "").toLowerCase();

          bv = (b.status ?? "").toLowerCase();

          break;

        default:

          av = a.business_id ?? a.id ?? 0;

          bv = b.business_id ?? b.id ?? 0;

      }

      if (av < bv) return sortBy.dir === "asc" ? -1 : 1;

      if (av > bv) return sortBy.dir === "asc" ? 1 : -1;

      return 0;

    });

    return arr;

  }, [filtered, sortBy]);



  const total = sorted.length;

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pageSafe = Math.min(Math.max(1, page), totalPages);



  const paginated = useMemo(() => {

    const start = (pageSafe - 1) * perPage;

    return sorted.slice(start, start + perPage);

  }, [sorted, pageSafe, perPage]);



  const toggleSort = (key: SortKey) => {

    setPage(1);

    setSortBy((prev) => {

      if (prev.key === key) {

        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };

      }

      return { key, dir: "asc" };

    });

  };



  const formatMoney = (n?: number | null) =>

    `₱ ${Number(n ?? 0).toLocaleString()}`;



  return (

    <div className="flex min-h-screen bg-gray-50 relative">

      <Sidebar

        isMobile={false}

        isMobileMenuOpen={false}

        setIsMobileMenuOpen={() => {}}

        isCollapsed={false}

        setIsCollapsed={() => {}}

      />



      <div className="max-w-7xl mx-auto mt-20 p-2">

        <div className="mb-8">

          <Calendar />

        </div>



        <div className="max-w-7xl mx-auto">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold text-gray-800">

                Violations Monitoring

              </h1>

              <p className="text-gray-500 text-sm">

                View and manage business violations

              </p>

            </div>

              </div>



          {/* Search & PerPage */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div className="relative w-full md:w-80">

              <FiSearch className="absolute top-3 left-3 text-gray-400" />

              <input

                value={query}

                onChange={(e) => {

                  setQuery(e.target.value);

                  setPage(1);

                }}

                className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-green-600 outline-none"

                placeholder="Search business name, ID or Payment..."

              />

            </div>



            <select

              value={perPage}

              onChange={(e) => {

                setPerPage(Number(e.target.value));

                setPage(1);

              }}

              className="px-4 py-3 border border-gray-200 rounded-lg bg-white text-black"

            >

              <option value={10}>10 per page</option>

              <option value={20}>20 per page</option>

              <option value={50}>50 per page</option>

            </select>

          </div>



          {/* Desktop Table */}

          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            <div className="px-6 py-4 border-b text-sm text-gray-600">

              Showing <b>{paginated.length}</b> of <b>{total}</b> records

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full text-base">

                <thead className="bg-green-800 text-white sticky top-0">

                  <tr>

                    <th

                      onClick={() => toggleSort("id")}

                      className="px-6 py-5 cursor-pointer hover:bg-green-700"

                    >

                      Business ID {renderSortIcon("id")}

                    </th>

                    <th

                      onClick={() => toggleSort("business_name")}

                      className="px-6 py-5 cursor-pointer hover:bg-green-700"

                    >

                      Business Name {renderSortIcon("business_name")}

                    </th>

                    <th className="px-6 py-5">Notice 1</th>

                    <th className="px-6 py-5">Notice 2</th>

                    <th className="px-6 py-5">Notice 3</th>

                    <th

                      onClick={() => toggleSort("penalty_amount")}

                      className="px-6 py-5 cursor-pointer hover:bg-green-700"

                    >

                      Penalty {renderSortIcon("penalty_amount")}

                    </th>

                    <th

                      onClick={() => toggleSort("payment_amount")}

                      className="px-6 py-5 cursor-pointer hover:bg-green-700"

                    >

                      Payment {renderSortIcon("payment_amount")}

                    </th>

                    <th

                      onClick={() => toggleSort("status")}

                      className="px-6 py-5 cursor-pointer hover:bg-green-700"

                    >

                      Status {renderSortIcon("status")}

                    </th>

                  </tr>

                </thead>



                <tbody className="divide-y">

                  {loading && (

                    <tr>

                      <td colSpan={8} className="text-center py-8">

                        Loading data...

                      </td>

                    </tr>

                  )}



                  {!loading && paginated.length === 0 && (

                    <tr>

                      <td colSpan={8} className="text-center py-8 text-gray-500">

                        No violations found

                      </td>

                    </tr>

                  )}



                  {!loading &&

                    paginated.map((v) => (

                      <tr

                        key={v.id}

                        onClick={() => setSelectedViolation(v)}

                        className="hover:bg-gray-50 cursor-pointer"

                      >

                        <td className="px-6 py-5 font-medium text-black">

                          {v.business_id ?? v.id}

                        </td>

                        <td className="px-6 py-5 font-bold text-black">

                          {v.buses?.business_name ?? "No Business"}

                        </td>

                        <td className="px-6 py-5">

                          {getNoticeBadge(1, v.notice_level, v.status)}

                        </td>

                        <td className="px-6 py-5">

                          {getNoticeBadge(2, v.notice_level, v.status)}

                        </td>

                        <td className="px-6 py-5">

                          {getNoticeBadge(3, v.notice_level, v.status)}

                        </td>

                        <td className="px-6 py-5 font-semibold text-red-600">

                          {formatMoney(v.penalty_amount)}

                        </td>

                        <td className="px-6 py-5 text-black">

                          {formatMoney(v.payment_amount)}

                        </td>

                        <td className="px-6 py-5">

                          <span

                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(

                              v.status

                            )}`}

                          >

                            {prettyStatus(v.status)}

                          </span>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>



            {/* Pagination */}

            <div className="flex items-center justify-between px-6 py-4 border-t">

              <div className="text-sm text-gray-600">

                Page {pageSafe} of {totalPages}

              </div>

              <div className="flex gap-2">

                <button

                  onClick={() => setPage((p) => Math.max(1, p - 1))}

                  disabled={pageSafe === 1}

                  className="px-3 py-2 border rounded-md bg-green-900 hover:bg-yellow-400 disabled:opacity-80"

                >

                  <FiChevronLeft />

                </button>

                <button

                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}

                  disabled={pageSafe === totalPages}

                  className="px-3 py-2 border rounded-md bg-green-900 hover:bg-yellow-400 disabled:opacity-80"

                >

                  <FiChevronRight />

                </button>

              </div>

            </div>

          </div>



          {/* Mobile Cards */}

          <div className="md:hidden text-gray-600 space-y-4">

            {loading && <p className="text-center py-4">Loading data...</p>}

            {!loading && paginated.length === 0 && (

              <p className="text-center py-4 text-gray-500">No violations found</p>

            )}

            {paginated.map((v) => (

              <div

                key={v.id}

                className="bg-white p-4 rounded-xl shadow-sm space-y-2 cursor-pointer hover:bg-gray-50"

                onClick={() => setSelectedViolation(v)}

              >

                <div className="flex justify-between">

                  <span className="font-semibold text-black">ID:</span>

                  <span className="text-black">{v.business_id ?? v.id}</span>

                </div>

                <div className="flex justify-between">

                  <span className="font-semibold text-black">Business:</span>

                  <span className="text-black">{v.buses?.business_name ?? "-"}</span>

                </div>

                <div className="flex justify-between space-x-2">

                  <div>

                    <span className="font-semibold">Notice 1:</span>{" "}

                    {getNoticeBadge(1, v.notice_level, v.status)}

                  </div>

                  <div>

                    <span className="font-semibold">Notice 2:</span>{" "}

                    {getNoticeBadge(2, v.notice_level, v.status)}

                  </div>

                  <div>

                    <span className="font-semibold">Notice 3:</span>{" "}

                    {getNoticeBadge(3, v.notice_level, v.status)}

                  </div>

                </div>

                <div className="flex justify-between">

                  <span className="font-semibold">Penalty:</span>

                  <span className="text-red-600 font-semibold">

                    {formatMoney(v.penalty_amount)}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="font-semibold">Payment:</span>

                  <span className="text-black">{formatMoney(v.payment_amount)}</span>

                </div>

                <div className="flex justify-between">

                  <span className="font-semibold">Status:</span>

                  <span

                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(

                      v.status

                    )}`}

                  >

                    {prettyStatus(v.status)}

                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>



        {/* Modal */}

        {selectedViolation && (

          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

            <DetailsFerBusesForm

              violation={selectedViolation}

              onClose={() => setSelectedViolation(null)}

            />

          </div>

        )}

      </div>

    </div>

  );

}