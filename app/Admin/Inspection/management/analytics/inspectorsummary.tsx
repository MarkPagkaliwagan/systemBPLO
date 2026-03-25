"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiClipboard, FiX, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";
import ReviewModal from "../Modal/reviewModal";

type RecordType = {
  assigned_inspector: string | null;
  "Business Identification Number": string | null;
  "Business Name": string | null;
  scheduled_date: string | null;
  schedule_time: string | null;
  updated_at?: string | null;
};

type InspectorCount = {
  name: string;
  total: number;
  latest: number | null;
};

function parseAssignedInspectors(value: string | null | undefined): string[] {
  if (!value) return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }

    if (typeof parsed === "string") {
      return parsed.trim() ? [parsed.trim()] : [];
    }
  } catch {}

  return [trimmed];
}

function formatDate(dateValue: string | number | null) {
  if (dateValue === null || dateValue === undefined || dateValue === "") return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(timeValue: string | null) {
  if (!timeValue) return "-";

  const normalized = timeValue.trim();
  if (!normalized) return "-";

  const timeDate = new Date(`1970-01-01T${normalized}`);

  if (Number.isNaN(timeDate.getTime())) return normalized;

  return timeDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getBarTheme(index: number) {
  const themes = [
    "bg-gradient-to-r from-emerald-500 to-emerald-600",
    "bg-gradient-to-r from-sky-500 to-blue-600",
    "bg-gradient-to-r from-violet-500 to-indigo-600",
    "bg-gradient-to-r from-amber-500 to-orange-600",
    "bg-gradient-to-r from-rose-500 to-pink-600",
    "bg-gradient-to-r from-cyan-500 to-teal-600",
  ];

  return themes[index % themes.length];
}

function isWithinPeriod(dateString: string | null, period: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  switch (period) {
    case "last_7_days": {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return date >= sevenDaysAgo && date <= now;
    }

    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= lastMonth && date < thisMonth;
    }

    case "last_year": {
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      const thisYear = new Date(now.getFullYear(), 0, 1);
      return date >= lastYear && date < thisYear;
    }

    default:
      return true;
  }
}

export default function InspectorSummary() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const [modalSortAsc, setModalSortAsc] = useState(true);
  const [modalMonth, setModalMonth] = useState("");

  const [reviewRecord, setReviewRecord] = useState<any | null>(null);
  const [loadingBin, setLoadingBin] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("business_records")
      .select(`
        assigned_inspector,
        "Business Identification Number",
        "Business Name",
        scheduled_date,
        schedule_time,
        updated_at
      `);

    if (error) {
      console.error("Supabase error:", error);
    }

    setRecords(data || []);
  }

  const handleOpenReview = useCallback(async (bin: string | null) => {
    if (!bin) return;

    setLoadingBin(bin);

    const { data, error } = await supabase
      .from("business_records")
      .select("*")
      .eq("Business Identification Number", bin)
      .single();

    setLoadingBin(null);

    if (error || !data) {
      console.error("Failed to fetch record:", error);
      return;
    }

    setReviewRecord(data);
  }, []);

  const handleReviewSave = async (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
    photoUrl?: string;
    reviewedBy?: string;
  }) => {
    if (!reviewRecord) return;

    const updates: Record<string, any> = {
      review_action: reviewData.reviewActions.join(", ") || null,
      violation: reviewData.violations.join(", ") || null,
      status: reviewData.reviewActions[reviewData.reviewActions.length - 1]?.toLowerCase().replace(/ /g, "_") ?? null,
      review_date: new Date().toISOString(),
      reviewed_by: reviewData.reviewedBy ?? null,
      assigned_inspector: reviewData.assignedInspector ?? null,
      scheduled_date: reviewData.scheduledDate ?? null,
      schedule_time: reviewData.scheduledTime ?? null,
      latitude: reviewData.location?.lat?.toString() ?? null,
      longitude: reviewData.location?.lng?.toString() ?? null,
      accuracy: reviewData.location?.accuracy?.toString() ?? null,
      photo: reviewData.photoUrl ?? null,
    };

    await supabase
      .from("business_records")
      .update(updates)
      .eq("Business Identification Number", reviewRecord["Business Identification Number"]);

    setReviewRecord(null);
    await fetchData();
  };

  const inspectors = useMemo(() => {
    const grouped: Record<string, InspectorCount> = {};

    records.forEach((r) => {
      if (monthFilter && !isWithinPeriod(r.updated_at ?? null, monthFilter)) {
        return;
      }

      const assignedInspectors = parseAssignedInspectors(r.assigned_inspector);
      const createdTime = r.updated_at ? new Date(r.updated_at).getTime() : 0;

      assignedInspectors.forEach((name) => {
        if (!grouped[name]) {
          grouped[name] = { name, total: 0, latest: null };
        }

        grouped[name].total += 1;
        grouped[name].latest =
          grouped[name].latest === null
            ? createdTime
            : Math.max(grouped[name].latest, createdTime);
      });
    });

    const list = Object.values(grouped);

    list.sort((a, b) => {
      const aTime = a.latest ?? 0;
      const bTime = b.latest ?? 0;
      return sortAsc ? aTime - bTime : bTime - aTime;
    });

    return list;
  }, [records, monthFilter, sortAsc]);

  const filteredRecords = useMemo(() => {
    if (!selectedInspector) return [];

    let list = records.filter((r) =>
      parseAssignedInspectors(r.assigned_inspector).includes(selectedInspector)
    );

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r["Business Name"]?.toLowerCase().includes(s) ||
          r["Business Identification Number"]?.toLowerCase().includes(s)
      );
    }

    if (modalMonth) {
      const selected = new Date(modalMonth);
      list = list.filter((r) => {
        if (!r.scheduled_date) return false;
        const d = new Date(r.scheduled_date);
        return (
          d.getFullYear() === selected.getFullYear() &&
          d.getMonth() === selected.getMonth()
        );
      });
    }

    list.sort((a, b) => {
      const da = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const db = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
      return modalSortAsc ? da - db : db - da;
    });

    return list;
  }, [records, selectedInspector, search, modalMonth, modalSortAsc]);

  const maxTasks = inspectors.length > 0 ? Math.max(...inspectors.map((i) => i.total)) : 1;

  return (
    <>
      {/* Main Panel */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Header — compact */}
        <div className="border-b border-slate-200 bg-white px-3 py-2.5 shrink-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            {/* Left side — tighter */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 shrink-0">
                <FiClipboard size={13} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                  Inspector Workload
                </h2>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Tap an inspector to view records
                </p>
              </div>
            </div>

            {/* Right side — smaller controls */}
            <div className="flex w-full flex-row gap-1.5 sm:items-center sm:justify-end md:w-auto">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 outline-none sm:w-auto"
              >
                <option value="">All Dates</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_month">Last Month</option>
                <option value="last_year">Last Year</option>
              </select>

              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-900 transition-colors hover:bg-slate-50 shrink-0"
              >
                {sortAsc ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
                Date
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Inspector List — tighter rows */}
        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: "220px" }}>
          {inspectors.length > 0 ? (
            <div className="space-y-0.5">
              {inspectors.map((inspector, index) => {
                const progress = (inspector.total / maxTasks) * 100;
                const isSelected = selectedInspector === inspector.name;
                const barTheme = getBarTheme(index);

                return (
                  <button
                    key={inspector.name}
                    onClick={() => setSelectedInspector(inspector.name)}
                    className={`w-full rounded-xl px-2 py-1.5 text-left transition-all duration-200 ${
                      isSelected ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-24 md:w-36 shrink-0">
                        <div className="truncate text-xs font-medium text-slate-900">
                          {inspector.name}
                        </div>
                        <div className="text-[9px] text-slate-400 leading-tight">
                          {formatDate(inspector.latest)}
                        </div>
                      </div>

                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${barTheme} transition-all duration-300`}
                          style={{ width: `${Math.max(progress, 8)}%` }}
                        />
                      </div>

                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">
                        {inspector.total}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
              No inspectors found
            </div>
          )}
        </div>
      </div>

      {/* Modal — inspector records */}
      {selectedInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="flex max-h-[90vh] w-full max-w-[95%] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900 md:text-base">
                Inspection Assignments — {selectedInspector}
              </h3>
              <button
                onClick={() => setSelectedInspector(null)}
                className="rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 p-3 md:flex-row">
              <div className="flex w-full items-center rounded-xl border border-slate-300 bg-white px-3 py-2 md:w-1/2">
                <FiSearch size={16} className="text-slate-500" />
                <input
                  type="text"
                  placeholder="Search business name or BIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 w-full bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>

              <input
                type="month"
                value={modalMonth}
                onChange={(e) => setModalMonth(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
              />

              <button
                onClick={() => setModalSortAsc(!modalSortAsc)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-50"
              >
                {modalSortAsc ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
                Date
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm text-slate-900">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="p-3 text-left font-medium text-slate-600">BIN</th>
                    <th className="p-3 text-left font-medium text-slate-600">Business Name</th>
                    <th className="p-3 text-left font-medium text-slate-600">Scheduled Date</th>
                    <th className="p-3 text-left font-medium text-slate-600">Scheduled Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((row, i) => {
                    const bin = row["Business Identification Number"];

                    return (
                      <tr
                        key={i}
                        onClick={() => handleOpenReview(bin)}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          bin ? "cursor-pointer" : ""
                        }`}
                      >
                        <td className="p-3">
                          <span className="font-medium text-blue-600 hover:underline">
                            {bin || "-"}
                          </span>
                        </td>
                        <td className="p-3">{row["Business Name"] || "-"}</td>
                        <td className="p-3">{formatDate(row.scheduled_date)}</td>
                        <td className="p-3">{formatTime(row.schedule_time)}</td>
                      </tr>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal — opens when BIN is clicked */}
      {reviewRecord && (
        <ReviewModal
          selectedRow={reviewRecord}
          showReviewModal={true}
          isMobile={isMobile}
          onClose={() => setReviewRecord(null)}
          onSave={handleReviewSave}
          onRecordUpdated={(updated) => setReviewRecord(updated)}
          onRecordDeleted={() => setReviewRecord(null)}
        />
      )}
    </>
  );
}