"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import Sidebar from "../../../components/sidebar";
import { supabase } from "@/lib/supabaseClient";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "id",
    dir: "asc",
  });
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // ✅ NEW STATE FOR MODAL
  const [selectedRecord, setSelectedRecord] = useState<Violation | null>(null);

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
    <div className="flex min-h-screen bg-gray-50">
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

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>

          {/* TABLE */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-base">
                <thead className="bg-green-800 text-white">
                  <tr>
                    <th className="px-6 py-5">Business ID</th>
                    <th className="px-6 py-5">Business Name</th>
                    <th className="px-6 py-5">Notice 1</th>
                    <th className="px-6 py-5">Notice 2</th>
                    <th className="px-6 py-5">Notice 3</th>
                    <th className="px-6 py-5">Penalty</th>
                    <th className="px-6 py-5">Payment</th>
                    <th className="px-6 py-5">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {paginated.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedRecord(v)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-5">{v.business_id ?? v.id}</td>
                      <td className="px-6 py-5 font-bold">
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
                      <td className="px-6 py-5 text-red-600 font-semibold">
                        {formatMoney(v.penalty_amount)}
                      </td>
                      <td className="px-6 py-5">
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
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 relative">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
            >
              <FiX />
            </button>

            <h2 className="text-xl font-bold mb-4 text-green-800">
              Violation Details
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Business ID</span>
                <span>{selectedRecord.business_id ?? selectedRecord.id}</span>
              </div>

              <div className="flex justify-between">
                <span>Business Name</span>
                <span>{selectedRecord.buses?.business_name}</span>
              </div>

              <div className="flex justify-between">
                <span>Notice Level</span>
                <span>{selectedRecord.notice_level}</span>
              </div>

              <div className="flex justify-between">
                <span>Penalty</span>
                <span>{formatMoney(selectedRecord.penalty_amount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Payment</span>
                <span>{formatMoney(selectedRecord.payment_amount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Status</span>
                <span>{prettyStatus(selectedRecord.status)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}