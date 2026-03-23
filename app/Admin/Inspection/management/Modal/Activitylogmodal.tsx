// app/module-2-inspection/Review Modal/ActivityLogModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FiActivity, FiClock, FiX, FiUser } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

interface ActivityLogModalProps {
  bin: string;
  businessName: string;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  bin: string;
  action: string;
  performed_by: string;
  details: string | null;
  created_at: string;
}

export default function ActivityLogModal({
  bin,
  businessName,
  onClose,
}: ActivityLogModalProps) {
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("bin", bin)
        .order("created_at", { ascending: false });

      if (error) console.error("❌ fetch logs error:", error);
      setLogs((data as LogEntry[]) ?? []);
      setLoading(false);
    };
    fetchLogs();
  }, [bin]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " · " +
      d.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const actionStyle = (action: string) => {
    if (action === "review")
      return {
        dot: "bg-green-500",
        badge: "bg-green-100 text-green-700 border border-green-200",
        label: "Review",
      };
    if (action === "edit")
      return {
        dot: "bg-indigo-500",
        badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
        label: "Edit",
      };
    return {
      dot: "bg-gray-400",
      badge: "bg-gray-100 text-gray-600 border border-gray-200",
      label: action,
    };
  };

  // Each log item ~82px tall; show 5 then scroll
  const LOG_ITEM_HEIGHT = 82;
  const MAX_VISIBLE     = 5;
  const listMaxHeight   = LOG_ITEM_HEIGHT * MAX_VISIBLE;

  return (
    // Backdrop — taps outside to close
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Modal: slides up on mobile, centered on desktop */}
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-200 shrink-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
              <FiActivity className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">Activity Log</p>
              <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-[300px]">
                {businessName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-2"
          >
            <FiX className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* ── Log list — scrollable after 5 items ── */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: `${listMaxHeight}px` }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <FiClock className="w-10 h-10 mb-3 text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">No activity yet</p>
              <p className="text-xs mt-1 text-gray-400">
                Actions will appear here after reviews or edits
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log, i) => {
                const s = actionStyle(log.action);
                return (
                  <div
                    key={log.id ?? i}
                    className="flex gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                      {i < logs.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1.5 min-h-[24px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Badge + name */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                          {s.label}
                        </span>
                        <div className="flex items-center gap-1 min-w-0">
                          <FiUser className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {log.performed_by}
                          </span>
                        </div>
                      </div>

                      {/* Details text */}
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                          {log.details}
                        </p>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <FiClock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-[10px] text-gray-400">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50 shrink-0 rounded-b-2xl flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {loading
              ? "Loading..."
              : `${logs.length} ${logs.length === 1 ? "entry" : "entries"}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}