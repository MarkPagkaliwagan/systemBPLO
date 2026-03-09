"use client";

import { useEffect, useState } from "react";
import {
  IoClose,
  IoBusinessOutline,
  IoWarningOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoMailOutline,
  IoDocumentTextOutline,
  IoTimerOutline,
  IoFlagOutline,
  IoCashOutline,
} from "react-icons/io5";
import { supabase } from "@/lib/supabaseClient";

interface ViolationDetail {
  id: number;
  business_id: number | null;
  notice_level: number;
  status: string;
  penalty_amount: number | null;
  payment_amount: number | null;
  created_at: string | null;
  last_notice_sent_at: string | null;
  buses: {
    business_name: string | null;
  } | null;
}

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  const [detail, setDetail] = useState<ViolationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("violations")
        .select(`
          id,
          business_id,
          notice_level,
          status,
          penalty_amount,
          payment_amount,
          created_at,
          last_notice_sent_at,
          buses (
            business_name
          )
        `)
        .eq("id", violation.id)
        .single();

      setLoading(false);
      if (error) {
        console.error("Error fetching violation detail:", error);
        setDetail(violation as ViolationDetail);
        return;
      }
      setDetail(data as unknown as ViolationDetail);
    };

    fetchDetail();
  }, [violation.id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMoney = (n?: number | null) =>
    `₱ ${Number(n ?? 0).toLocaleString()}`;

  const prettyStatus = (s: string) => {
    if (s === "open") return "Active Case";
    if (s === "cease_desist") return "Cease & Desist";
    if (s === "resolved") return "Resolved";
    return s;
  };

  const getStatusColors = (s: string) => {
    if (s === "open") return "bg-yellow-50 text-yellow-700";
    if (s === "cease_desist") return "bg-red-50 text-red-700";
    if (s === "resolved") return "bg-green-50 text-green-700";
    return "bg-gray-50 text-gray-700";
  };

  const getNoticeSentStatus = (noticeLevel: number, required: number, status: string) => {
    if (status === "resolved") return { label: "Resolved", color: "text-gray-500" };
    if (noticeLevel >= required) return { label: "Sent", color: "text-green-600" };
    return { label: "Pending", color: "text-yellow-600" };
  };

  // For notice dates:
  // Notice 1 → created_at (when violation was first recorded)
  // Notice 2 & 3 → last_notice_sent_at (when the latest notice was sent)
  // Only show date if that notice level has been reached
  const getNoticeDate = (
    noticeLevel: number,
    required: number,
    created_at: string | null,
    last_notice_sent_at: string | null
  ) => {
    if (noticeLevel < required) return "-";
    if (required === 1) return formatDate(created_at);
    return formatDate(last_notice_sent_at);
  };

  const InfoRow = ({
    label,
    value,
    icon: Icon,
    valueClass = "text-gray-900",
  }: {
    label: string;
    value: string | number;
    icon?: any;
    valueClass?: string;
  }) => (
    <div className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-gray-400 text-sm" />}
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${valueClass}`}>{value ?? "-"}</span>
    </div>
  );

  const d = detail ?? (violation as ViolationDetail);

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200 relative">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IoWarningOutline className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Violation Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          Loading details...
        </div>
      ) : (
        <div className="flex h-[calc(90vh-73px)]">
          {/* Left Column */}
          <div className="flex-1 p-4 border-r border-gray-200 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <InfoRow
                  label="Business ID"
                  value={d.business_id ?? d.id}
                  icon={IoDocumentTextOutline}
                />
                <InfoRow
                  label="Business Name"
                  value={d.buses?.business_name ?? "-"}
                  icon={IoBusinessOutline}
                />
                <InfoRow
                  label="Violation Date"
                  value={formatDate(d.created_at)}
                  icon={IoCalendarOutline}
                />
                <InfoRow
                  label="Last Notice Sent"
                  value={formatDate(d.last_notice_sent_at)}
                  icon={IoTimeOutline}
                />
                <div className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <IoFlagOutline className="text-gray-400 text-sm" />
                    <span className="text-gray-600 text-sm">Status</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColors(d.status)}`}>
                    {prettyStatus(d.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <InfoRow
                  label="Penalty Amount"
                  value={formatMoney(d.penalty_amount)}
                  icon={IoCashOutline}
                  valueClass="text-red-600 font-semibold"
                />
                <InfoRow
                  label="Payment Made"
                  value={formatMoney(d.payment_amount)}
                  icon={IoCashOutline}
                  valueClass="text-green-700 font-semibold"
                />
                <InfoRow
                  label="Balance"
                  value={formatMoney((d.penalty_amount ?? 0) - (d.payment_amount ?? 0))}
                  icon={IoCashOutline}
                  valueClass={
                    (d.penalty_amount ?? 0) - (d.payment_amount ?? 0) > 0
                      ? "text-red-600 font-semibold"
                      : "text-green-700 font-semibold"
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Notice Timeline */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notice Timeline</h3>
              <div className="space-y-2">
                {[
                  { num: 1, label: "Notice 1", desc: "Initial violation notice" },
                  { num: 2, label: "Notice 2", desc: "Follow-up notice" },
                  { num: 3, label: "Notice 3", desc: "Final notice" },
                ].map(({ num, label, desc }) => {
                  const ns = getNoticeSentStatus(d.notice_level, num, d.status);
                  const noticeDate = getNoticeDate(d.notice_level, num, d.created_at, d.last_notice_sent_at);
                  return (
                    <div key={num} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <IoMailOutline className="text-gray-400 mt-0.5" size={16} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                            <span className="text-xs text-gray-500">{noticeDate}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{desc}</p>
                          <span className={`text-xs font-medium mt-1 block ${ns.color}`}>
                            {ns.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notice Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notice Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className={`text-3xl font-semibold mb-1 ${
                    d.notice_level === 0 ? "text-gray-400" :
                    d.notice_level === 1 ? "text-yellow-500" :
                    d.notice_level === 2 ? "text-orange-500" :
                    "text-red-600"
                  }`}>
                    {d.notice_level} / 3
                  </div>
                  <div className="text-xs text-gray-600">Notices Sent</div>
                  <div className={`mt-2 text-xs font-medium ${
                    d.status === "resolved" ? "text-green-600" :
                    d.notice_level >= 3 ? "text-red-600" :
                    d.notice_level >= 1 ? "text-yellow-600" : "text-gray-500"
                  }`}>
                    {d.status === "resolved"
                      ? "Case Resolved"
                      : d.notice_level >= 3
                      ? "All Notices Sent"
                      : d.notice_level === 0
                      ? "No Notices Sent Yet"
                      : `${3 - d.notice_level} Notice${3 - d.notice_level > 1 ? "s" : ""} Remaining`}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        d.status === "resolved" ? "bg-green-500" :
                        d.notice_level >= 3 ? "bg-red-500" :
                        d.notice_level >= 2 ? "bg-orange-400" :
                        d.notice_level >= 1 ? "bg-yellow-400" : "bg-gray-300"
                      }`}
                      style={{ width: `${(d.notice_level / 3) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}