"use client";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Sidebar from "../../../components/sidebar/page";
import { supabase } from "@/lib/supabaseClient";

interface Violation {
  id: number;
  business_id: number | null;
  notice_level: number;
  status: string;
  penalty_amount: number | null;
  buses: {
    business_name: string | null;
  } | null;
}

type SortKey = "id" | "business_name" | "notice_level" | "penalty_amount" | "status";

export default function DashboardPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // UI state
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
      buses (
        business_name
      )
    `);

    setLoading(false);
    if (error) {
      console.error("Error fetching violations:", error);
      return;
    }
    if (!data) return;

    const typedData = data as unknown as Violation[];
    setViolations(typedData);
  };

  const getStatusBadge = (status: string) => {
    if (status === "open") return "bg-green-100 text-green-700";
    if (status === "cease_desist") return "bg-red-100 text-red-600";
    if (status === "resolved") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  const getNoticeBadge = (
    requiredLevel: number,
    currentLevel: number,
    status: string
  ) => {
    if (status === "resolved")
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          -
        </span>
      );

    if (currentLevel >= requiredLevel)
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Sent
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  // Derived data: search -> sort -> paginate
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return violations;

    return violations.filter((v) => {
      const name = v.buses?.business_name ?? "";
      const id = String(v.business_id ?? v.id ?? "");
      const status = v.status ?? "";
      const penalty = v.penalty_amount ? String(v.penalty_amount) : "";
      return (
        name.toLowerCase().includes(q) ||
        id.toLowerCase().includes(q) ||
        status.toLowerCase().includes(q) ||
        penalty.includes(q)
      );
    });
  }, [violations, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const key = sortBy.key;
      let av: any;
      let bv: any;

      switch (key) {
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
        case "status":
          av = (a.status ?? "").toLowerCase();
          bv = (b.status ?? "").toLowerCase();
          break;
        case "id":
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

  // Helpers
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

  const prettyStatus = (s: string) => s.replace("_", " ");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
        isCollapsed={false}
        setIsCollapsed={() => {}}
      />

      {/* Main content */}
      <div className="flex-1 pt-32 p-6 lg:p-10">
        <div className="max-w-full mx-auto">
          {/* Header controls */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl font-semibold text-green-800">Violations</h1>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </span>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-3 py-2 rounded-md border border-gray-200 shadow-sm w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Search business, id, status, or penalty..."
                />
              </div>

              {/* Per page */}
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 rounded-md border border-gray-200 shadow-sm bg-white"
                aria-label="Rows per page"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>

          {/* Table card */}
          <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
            {/* Controls inside card (keeps distance from navbar and gives padding) */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{paginated.length}</span> of{" "}
                <span className="font-semibold">{total}</span> results
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div>Sort:</div>
                <button
                  onClick={() => toggleSort("id")}
                  className={`px-2 py-1 rounded ${sortBy.key === "id" ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  ID{" "}
                  {sortBy.key === "id" ? (
                    sortBy.dir === "asc" ? (
                      <FiChevronUp className="inline-block ml-1" />
                    ) : (
                      <FiChevronDown className="inline-block ml-1" />
                    )
                  ) : null}
                </button>

                <button
                  onClick={() => toggleSort("business_name")}
                  className={`px-2 py-1 rounded ${sortBy.key === "business_name" ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  Business{" "}
                  {sortBy.key === "business_name" ? (
                    sortBy.dir === "asc" ? (
                      <FiChevronUp className="inline-block ml-1" />
                    ) : (
                      <FiChevronDown className="inline-block ml-1" />
                    )
                  ) : null}
                </button>

                <button
                  onClick={() => toggleSort("notice_level")}
                  className={`px-2 py-1 rounded ${sortBy.key === "notice_level" ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  Notice{" "}
                  {sortBy.key === "notice_level" ? (
                    sortBy.dir === "asc" ? (
                      <FiChevronUp className="inline-block ml-1" />
                    ) : (
                      <FiChevronDown className="inline-block ml-1" />
                    )
                  ) : null}
                </button>

                <button
                  onClick={() => toggleSort("penalty_amount")}
                  className={`px-2 py-1 rounded ${sortBy.key === "penalty_amount" ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  Penalty{" "}
                  {sortBy.key === "penalty_amount" ? (
                    sortBy.dir === "asc" ? (
                      <FiChevronUp className="inline-block ml-1" />
                    ) : (
                      <FiChevronDown className="inline-block ml-1" />
                    )
                  ) : null}
                </button>

                <button
                  onClick={() => toggleSort("status")}
                  className={`px-2 py-1 rounded ${sortBy.key === "status" ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  Status{" "}
                  {sortBy.key === "status" ? (
                    sortBy.dir === "asc" ? (
                      <FiChevronUp className="inline-block ml-1" />
                    ) : (
                      <FiChevronDown className="inline-block ml-1" />
                    )
                  ) : null}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-green-800 text-white uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Business ID</th>
                    <th className="px-6 py-4">Business Name</th>
                    <th className="px-6 py-4">Notice 1</th>
                    <th className="px-6 py-4">Notice 2</th>
                    <th className="px-6 py-4">Notice 3</th>
                    <th className="px-6 py-4">Penalty</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((v) => (
                      <tr key={v.id} className="hover:bg-green-50 transition">
                        <td className="px-6 py-4 font-medium">{v.business_id ?? v.id}</td>

                        <td className="px-6 py-4 font-semibold text-green-800">
                          {v.buses?.business_name ?? "No Business"}
                        </td>

                        <td className="px-6 py-4">
                          {getNoticeBadge(1, v.notice_level, v.status)}
                        </td>

                        <td className="px-6 py-4">
                          {getNoticeBadge(2, v.notice_level, v.status)}
                        </td>

                        <td className="px-6 py-4">
                          {getNoticeBadge(3, v.notice_level, v.status)}
                        </td>

                        <td className="px-6 py-4 font-semibold text-red-600">
                          {formatMoney(v.penalty_amount)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                              v.status
                            )}`}
                          >
                            {prettyStatus(v.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pageSafe} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe === 1}
                  className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronLeft />
                </button>

                <div className="text-sm text-gray-700">
                  {Math.min((pageSafe - 1) * perPage + 1, total)} -{" "}
                  {Math.min(pageSafe * perPage, total)} of {total}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe === totalPages}
                  className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}