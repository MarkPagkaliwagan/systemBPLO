"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiSend,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../../../components/sidebar";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import CalendarPage from "../../../Admin/Compliance/Dashboard/calendar";
import DetailsForBusinessFormModal from "./DetailsForBusinessFormModal";

type Violation = {
  id: number;
  business_id: string;
  business_name?: string; // ✅ ADD THIS LINE
  violation: string;
  notice_level: number;
  last_sent_time: string | null;
  interval_days: number | null;
  resolved: boolean;
  requestor_email: string | null;
  cease_flag?: boolean;
};

type ModalType = "success" | "error" | "info";

function ViolationsPageContent() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mobile state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto send and interval
  const [autoSend, setAutoSend] = useState(false);
  const [editingInterval, setEditingInterval] = useState<number | null>(null);
  const [intervalValue, setIntervalValue] = useState<number>(7);
  const [sendingNoticeId, setSendingNoticeId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [editingEmail, setEditingEmail] = useState<number | null>(null);
  const [emailValue, setEmailValue] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const openBusinessDetails = async (businessId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("business_records")
        .select("*")
        .eq("Business Identification Number", businessId)
        .single();

      if (error) {
        console.error(error);
        openMessageModal("Error", "Failed to load business details.", "error");
        return;
      }

      setSelectedBusiness(data);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
      openMessageModal("Error", "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async (id: number) => {
    // basic validation
    if (!emailValue || !emailValue.includes("@")) {
      openMessageModal(
        "Invalid Email",
        "Please enter a valid email address.",
        "error",
      );
      return;
    }

    openConfirmModal(
      "Save Email",
      `Are you sure you want to save this email?\n\n${emailValue}`,
      async () => {
        closeConfirmModal();
        setLoading(true);

        try {
          const { error } = await supabase
            .from("business_violations")
            .update({ requestor_email: emailValue })
            .eq("id", id);

          if (error) {
            console.error(error);
            openMessageModal("Error", "Failed to update email.", "error");
          } else {
            setEditingEmail(null);
            openMessageModal("Success", "Email updated.", "success");
            await fetchViolations();
          }
        } catch (err) {
          console.error(err);
          openMessageModal("Error", "Something went wrong.", "error");
        } finally {
          setLoading(false);
        }
      },
      "Save",
      "Cancel",
    );
  };

  const toggleSelect = (id: number) => {
    const v = violations.find((x) => x.id === id);
    if (!v || v.resolved || v.cease_flag) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Custom modal state
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: ModalType;
  }>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: "",
    message: "",
    confirmText: "Yes",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  const openMessageModal = (
    title: string,
    message: string,
    type: ModalType = "info",
  ) => {
    setMessageModal({
      open: true,
      title,
      message,
      type,
    });
  };

  const closeMessageModal = () => {
    setMessageModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmText = "Yes",
    cancelText = "Cancel",
  ) => {
    setConfirmModal({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load persisted Auto Send state
  useEffect(() => {
    const loadSetting = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "auto_send")
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const value = data?.value;
      setAutoSend(value === true || value === "true" || value === 1);
    };

    loadSetting();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("business_violations")
        .select("*")
        .or(`business_id.ilike.%${query}%,business_name.ilike.%${query}%`)
        .order(sortKey || "id", { ascending: sortAsc });

      if (error) {
        console.error(error);
        openMessageModal("Error", "Failed to load violations.", "error");
        setViolations([]);
        return;
      }

      setViolations(data || []);
    } catch (err) {
      console.error(err);
      openMessageModal(
        "Error",
        "Something went wrong while loading data.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortKey, sortAsc]);

  const handleMarkResolved = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("business_violations")
        .update({ resolved: true })
        .eq("id", id);

      if (error) {
        console.error(error);
        openMessageModal("Error", "Failed to mark as resolved.", "error");
      } else {
        openMessageModal("Success", "Marked as resolved.", "success");
        await fetchViolations();
      }
    } catch (err) {
      console.error(err);
      openMessageModal("Error", "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateInterval = async (id: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("business_violations")
        .update({ interval_days: intervalValue })
        .eq("id", id);

      if (error) {
        console.error(error);
        openMessageModal("Error", "Failed to update interval.", "error");
      } else {
        setEditingInterval(null);
        openMessageModal("Success", "Interval updated.", "success");
        await fetchViolations();
      }
    } catch (err) {
      console.error(err);
      openMessageModal("Error", "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

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
    if ((v.notice_level || 0) >= 3) return "Cease and Desist";
    return "Pending";
  };
  const getRowClasses = (v: Violation) => {
    const status = getStatusText(v);
    let base = "hover:bg-gray-50"; // default

    if (status === "Resolved") base = "bg-blue-50 hover:bg-blue-100";
    else if (status === "Cease and Desist") base = "bg-red-50 hover:bg-red-100";

    // Highlight missing email
    if (!v.requestor_email || v.requestor_email.trim() === "")
      base += " border-2 border-red-400"; // red border

    return base;
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key)
      return <FiChevronDown className="inline ml-1 text-green-200" />;
    return sortAsc ? (
      <FiChevronUp className="inline ml-1 text-green-200" />
    ) : (
      <FiChevronDown className="inline ml-1 text-green-200" />
    );
  };

  const StatusBadge = ({ v }: { v: Violation }) => {
    const status = getStatusText(v);
    if (status === "Resolved")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
          Resolved
        </span>
      );
    if (status === "Cease and Desist")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Cease &amp; Desist
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
    if (v.resolved || v.cease_flag) return false;
    const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
    const interval = v.interval_days ?? 7;
    if (!lastSent) return true;
    const nextSend = new Date(
      lastSent.getTime() + interval * 24 * 60 * 60 * 1000,
    );
    return new Date() >= nextSend;
  };
  const sendNoticeNow = async (id: number) => {
    // Hanapin yung violation object
    const violation = violations.find((v) => v.id === id);
    if (!violation) return;

    // EMAIL CHECK
    if (!violation.requestor_email || violation.requestor_email.trim() === "") {
      openMessageModal(
        "Missing Email",
        `Cannot send notice. Business ID ${violation.business_id} has no email.`,
        "error",
      );

      // Optional: highlight row
      const row = document.querySelector(`[data-id="${id}"]`);
      if (row) row.classList.add("border-2", "border-red-400");

      return; // stop sending
    }

    setSendingNoticeId(id); // <-- show loading for this notice
    try {
      const res = await fetch("/api/manual-send-notice", {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        openMessageModal("Success", "Notice sent successfully.", "success");
      } else {
        openMessageModal(
          "Error",
          data.error || "Failed to send notice.",
          "error",
        );
      }

      await fetchViolations();
    } catch (err) {
      console.error(err);
      openMessageModal("Error", "Error sending notice.", "error");
    } finally {
      setSendingNoticeId(null); // <-- hide loading
    }
  };

  const askSendNotice = (v: Violation) => {
    openConfirmModal(
      "Send Notice",
      `Do you want to send a notice for Business ID ${v.business_id}?`,
      async () => {
        closeConfirmModal();
        await sendNoticeNow(v.id);
      },
      "Send",
      "Cancel",
    );
  };

  const askMarkResolved = (v: Violation) => {
    openConfirmModal(
      "Mark Resolved",
      `Do you want to mark Business ID ${v.business_id} as resolved?`,
      async () => {
        closeConfirmModal();
        await handleMarkResolved(v.id);
      },
      "Mark Resolved",
      "Cancel",
    );
  };

  const ModalIcon = ({ type }: { type: ModalType }) => {
    if (type === "success") {
      return <FiCheckCircle className="text-3xl text-green-600" />;
    }
    if (type === "error") {
      return <FiAlertCircle className="text-3xl text-red-600" />;
    }
    return <FiInfo className="text-3xl text-blue-600" />;
  };

  const handleBulkSend = async () => {
    openConfirmModal(
      "Bulk Send Notice",
      `Send notice to ${selectedIds.length} businesses?`,
      async () => {
        closeConfirmModal();

        try {
          await Promise.all(selectedIds.map((id) => sendNoticeNow(id)));

          openMessageModal("Success", "All notices sent.", "success");
        } catch (err) {
          openMessageModal("Error", "Some notices failed.", "error");
        }

        setSelectedIds([]);
      },
      "Send All",
    );
  };
  const handleBulkResolve = async () => {
    openConfirmModal(
      "Bulk Resolve",
      `Mark ${selectedIds.length} as resolved?`,
      async () => {
        closeConfirmModal();

        try {
          await Promise.all(selectedIds.map((id) => handleMarkResolved(id)));

          openMessageModal("Success", "All marked resolved.", "success");
        } catch (err) {
          openMessageModal("Error", "Some failed.", "error");
        }

        setSelectedIds([]);
      },
      "Resolve All",
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row pt-10 md:pt-16 px-4 md:px-6">
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
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Violation Monitoring
              </h1>
              <p className="text-gray-500 mt-1 text-sm max-w-xl">
                Track business violations and notices
              </p>
            </div>

            <div className="self-start md:self-auto bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
              <div className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-1">
                <span className="text-gray-500">TOTAL :</span>
                <span className="text-green-900 font-bold text-lg">
                  {violations.length}
                </span>
              </div>
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
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-700" />
              <span className="text-gray-600">Sent</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-gray-600">Cease &amp; Desist</span>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleBulkSend}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                Send Notice ({selectedIds.length})
              </button>

              <button
                onClick={handleBulkResolve}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Mark Resolved ({selectedIds.length})
              </button>
            </div>
          )}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {selectedIds.length} selected
              </span>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-red-600 underline"
              >
                Clear selection
              </button>
            </div>
          )}
          {/* Table / Cards */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Desktop Table */}
            <div className="w-full overflow-x-auto hidden md:block">
              <table className="min-w-full table-fixed">
                <thead className="bg-green-900 text-white">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            const selectable = violations
                              .filter((v) => !v.resolved && !v.cease_flag)
                              .map((v) => v.id);

                            setSelectedIds(selectable);
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        checked={
                          violations.filter((v) => !v.resolved && !v.cease_flag)
                            .length > 0 &&
                          selectedIds.length ===
                            violations.filter(
                              (v) => !v.resolved && !v.cease_flag,
                            ).length
                        }
                      />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer select-none"
                      onClick={() => toggleSort("business_name")}
                    >
                      <div className="flex items-center">
                        Business {renderSortIcon("business_name")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Violation
                    </th>

                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Notice 1
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Notice 2
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Notice 3
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Interval Days
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      <div className="flex items-center justify-between">
                        <span>Action</span>
                        <label className="flex items-center cursor-pointer select-none ml-2">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={autoSend}
                              onChange={async (e) => {
                                const checked = e.target.checked;

                                if (checked) {
                                  const missingEmails = violations.filter(
                                    (v) =>
                                      !v.requestor_email ||
                                      v.requestor_email.trim() === "",
                                  );

                                  if (missingEmails.length > 0) {
                                    openMessageModal(
                                      "Missing Emails",
                                      `Cannot enable Auto Send. There are ${missingEmails.length} violation(s) without emails.`,
                                      "error",
                                    );

                                    // Scroll to first missing email row (optional)
                                    const firstMissingRow =
                                      document.querySelector(
                                        `[data-id="${missingEmails[0].id}"]`,
                                      );
                                    if (firstMissingRow)
                                      firstMissingRow.scrollIntoView({
                                        behavior: "smooth",
                                      });

                                    return; // stop toggling
                                  }
                                }

                                setAutoSend(checked);

                                const { error } = await supabase
                                  .from("settings")
                                  .upsert({ key: "auto_send", value: checked });

                                if (error) {
                                  console.error(error);
                                  openMessageModal(
                                    "Error",
                                    "Failed to update auto send.",
                                    "error",
                                  );
                                } else {
                                  openMessageModal(
                                    "Saved",
                                    `Auto send is now ${checked ? "ON" : "OFF"}.`,
                                    "success",
                                  );
                                }
                              }}
                            />
                            <div
                              className={`w-11 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${
                                autoSend ? "bg-green-600" : ""
                              }`}
                            />
                            <div
                              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                autoSend ? "translate-x-5" : ""
                              }`}
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
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded w-3/4" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded w-full" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-100 rounded w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-100 rounded w-20" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-gray-100 rounded w-28" />
                        </td>
                      </tr>
                    ))
                  ) : violations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-10 text-gray-500 space-y-2"
                      >
                        <div>NO DATA FOUND</div>
                        <button
                          onClick={() =>
                            (window.location.href =
                              "/Admin/Inspection/management/review")
                          }
                          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          + Add Business Violation
                        </button>
                      </td>
                    </tr>
                  ) : (
                    violations.map((v) => (
                      <tr
                        key={v.id}
                        data-id={v.id} // ADD THIS LINE
                        onClick={() => openBusinessDetails(v.business_id)}
                        className={`${getRowClasses(v)} transition-colors cursor-pointer ${
                          selectedIds.includes(v.id) ? "bg-blue-100" : ""
                        }`}
                      >
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(v.id)}
                            disabled={v.resolved || v.cease_flag}
                            onChange={() => toggleSelect(v.id)}
                          />
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900">
                            {v.business_name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {v.business_id}
                          </div>
                          {v.last_sent_time && (
                            <div className="text-xs text-gray-400 mt-1">
                              Last sent:{" "}
                              {new Date(v.last_sent_time).toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {v.violation}
                          </div>

                          <div
                            className="text-xs text-gray-500 mt-1 break-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEmail(v.id);
                              setEmailValue(v.requestor_email || "");
                            }}
                          >
                            {editingEmail === v.id ? (
                              <div className="mt-1 space-y-2">
                                <input
                                  type="email"
                                  value={emailValue}
                                  onChange={(e) =>
                                    setEmailValue(e.target.value)
                                  }
                                  className="border rounded px-2 py-1 text-xs w-full text-black"
                                  placeholder="Enter email"
                                  onClick={(e) => e.stopPropagation()}
                                />

                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateEmail(v.id);
                                    }}
                                    disabled={!emailValue}
                                    className={`text-xs font-medium ${
                                      !emailValue
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-green-600"
                                    }`}
                                  >
                                    Save
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingEmail(null);
                                    }}
                                    className="text-gray-500 text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="cursor-pointer hover:text-green-700 underline">
                                {v.requestor_email || "Add email (click here)"}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top">
                          <NoticeBadge notice={1} v={v} />
                        </td>

                        <td className="px-6 py-4 align-top">
                          <NoticeBadge notice={2} v={v} />
                        </td>

                        <td className="px-6 py-4 align-top">
                          <NoticeBadge notice={3} v={v} />
                        </td>

                        <td className="px-6 py-4 align-top">
                          {editingInterval === v.id ? (
                            <div
                              className="flex gap-2 items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="number"
                                value={intervalValue}
                                onChange={(e) =>
                                  setIntervalValue(Number(e.target.value))
                                }
                                className="w-16 border text-black rounded px-1 py-0.5 text-xs"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateInterval(v.id);
                                }}
                                className="text-green-600 text-xs"
                              >
                                Save
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingInterval(null);
                                }}
                                className="text-gray-500 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div
                              title="Click to edit interval"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingInterval(v.id);
                                setIntervalValue(v.interval_days ?? 7);
                              }}
                              className="cursor-pointer text-sm text-gray-700 hover:text-green-700 flex items-center gap-1 underline"
                            >
                              {v.interval_days ?? 7} days
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 align-top">
                          <StatusBadge v={v} />
                        </td>

                        <td className="px-6 py-4 align-top">
                          {v.resolved ? null : getStatusText(v) ===
                            "Cease and Desist" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                askMarkResolved(v);
                              }}
                              disabled={v.resolved}
                              className={`ml-2 px-2 py-1 text-xs rounded font-medium ${
                                v.resolved
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  askSendNotice(v);
                                }}
                                disabled={autoSend || !canSendNotice(v)}
                                className={`px-2 py-1 text-xs rounded font-medium ${
                                  autoSend || !canSendNotice(v)
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                              >
                                {sendingNoticeId === v.id ? (
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                      ></path>
                                    </svg>
                                    Sending...
                                  </span>
                                ) : (
                                  "Send Notice"
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  askMarkResolved(v);
                                }}
                                disabled={v.resolved}
                                className={`ml-2 px-2 py-1 text-xs rounded font-medium ${
                                  v.resolved
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                Mark Resolved
                              </button>

                              {!canSendNotice(v) &&
                                v.last_sent_time &&
                                getStatusText(v) !== "Cease and Desist" && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Next send:{" "}
                                    {new Date(
                                      new Date(v.last_sent_time).getTime() +
                                        (v.interval_days ?? 7) *
                                          24 *
                                          60 *
                                          60 *
                                          1000,
                                    ).toLocaleString()}
                                  </div>
                                )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {/* Auto Send Toggle */}
              <div className="flex justify-end mb-2">
                <label className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={autoSend}
                      onChange={async (e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          const missingEmails = violations.filter(
                            (v) =>
                              !v.requestor_email ||
                              v.requestor_email.trim() === "",
                          );

                          if (missingEmails.length > 0) {
                            openMessageModal(
                              "Missing Emails",
                              `Cannot enable Auto Send. There are ${missingEmails.length} violation(s) without emails.`,
                              "error",
                            );

                            // Scroll to first missing email row (optional)
                            const firstMissingRow = document.querySelector(
                              `[data-id="${missingEmails[0].id}"]`,
                            );
                            if (firstMissingRow)
                              firstMissingRow.scrollIntoView({
                                behavior: "smooth",
                              });

                            return; // stop toggling
                          }
                        }

                        setAutoSend(checked);

                        const { error } = await supabase
                          .from("settings")
                          .upsert({ key: "auto_send", value: checked });

                        if (error) {
                          console.error(error);
                          openMessageModal(
                            "Error",
                            "Failed to update auto send.",
                            "error",
                          );
                        } else {
                          openMessageModal(
                            "Saved",
                            `Auto send is now ${checked ? "ON" : "OFF"}.`,
                            "success",
                          );
                        }
                      }}
                    />
                    <div
                      className={`w-11 h-6 bg-gray-300 rounded-full shadow-inner transition-colors ${autoSend ? "bg-green-600" : ""}`}
                    />
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform ${autoSend ? "translate-x-5" : ""}`}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                    Auto Send <FiSend className="text-green-600" />
                  </span>
                </label>
              </div>

              {/* Select All */}
              {violations.length > 0 && (
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === violations.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(violations.map((v) => v.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Select All
                  </span>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse border rounded-xl p-4 bg-gray-100 space-y-2"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                ))
              ) : violations.length === 0 ? (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <div>NO DATA FOUND</div>
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/Admin/Inspection/management/review")
                    }
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    + Add Business Violation
                  </button>
                </div>
              ) : (
                violations.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => openBusinessDetails(v.business_id)}
                    className={`border rounded-xl p-4 bg-white shadow-sm space-y-2 cursor-pointer transition-colors ${selectedIds.includes(v.id) ? "bg-green-50" : ""}`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(v.id)}
                        disabled={v.resolved || v.cease_flag}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(v.id)}
                      />

                      <div
                        className="flex-1 ml-2"
                        onClick={() => openBusinessDetails(v.business_id)}
                      >
                        <div className="font-semibold text-gray-900 text-sm">
                          {v.business_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {v.business_id}
                        </div>
                      </div>

                      <StatusBadge v={v} />
                    </div>

                    {/* Violation Text */}
                    <div
                      className="text-xs text-gray-500 break-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEmail(v.id);
                        setEmailValue(v.requestor_email || "");
                      }}
                    >
                      {editingEmail === v.id ? (
                        <div className="mt-1 space-y-2">
                          <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="border rounded px-2 py-1 text-xs w-full"
                            placeholder="Enter email"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateEmail(v.id);
                              }}
                              disabled={!emailValue}
                              className={`text-xs font-medium ${
                                !emailValue
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-600"
                              }`}
                            >
                              Save
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEmail(null);
                              }}
                              className="text-gray-500 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="cursor-pointer hover:text-green-700 underline">
                          {v.requestor_email || "Add email (click here)"}
                        </span>
                      )}
                    </div>

                    {/* Notices */}
                    <div className="flex gap-2">
                      <NoticeBadge notice={1} v={v} />
                      <NoticeBadge notice={2} v={v} />
                      <NoticeBadge notice={3} v={v} />
                    </div>

                    {/* Interval */}
                    <div className="text-xs text-gray-500">
                      Interval:{" "}
                      {editingInterval === v.id ? (
                        <span className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            value={intervalValue}
                            onChange={(e) =>
                              setIntervalValue(Number(e.target.value))
                            }
                            className="w-16 border rounded px-1 py-0.5 text-xs"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateInterval(v.id);
                            }}
                            className="text-green-600 text-xs hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingInterval(null);
                            }}
                            className="text-gray text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingInterval(v.id);
                            setIntervalValue(v.interval_days ?? 7);
                          }}
                          className="cursor-pointer text-gray-700 hover:text-green-700"
                        >
                          {v.interval_days ?? 7} days
                        </span>
                      )}
                    </div>

                    {/* Last Sent */}
                    {v.last_sent_time && (
                      <div className="text-xs text-gray-400">
                        Last sent: {new Date(v.last_sent_time).toLocaleString()}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1">
                      {!v.resolved &&
                        getStatusText(v) === "Cease and Desist" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              askMarkResolved(v);
                            }}
                            disabled={v.resolved}
                            className={`w-full px-2 py-1 text-xs rounded font-medium ${v.resolved ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                          >
                            Mark Resolved
                          </button>
                        )}

                      {!v.resolved &&
                        getStatusText(v) !== "Cease and Desist" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                askSendNotice(v);
                              }}
                              disabled={autoSend || !canSendNotice(v)}
                              className={`px-2 py-1 text-xs rounded font-medium ${autoSend || !canSendNotice(v) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                            >
                              {sendingNoticeId === v.id ? (
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                  </svg>
                                  Sending...
                                </span>
                              ) : (
                                "Send Notice"
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                askMarkResolved(v);
                              }}
                              disabled={v.resolved}
                              className={`w-full px-2 py-1 text-xs rounded font-medium ${v.resolved ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                            >
                              Mark Resolved
                            </button>

                            {!canSendNotice(v) && v.last_sent_time && (
                              <div className="text-xs text-gray-500 mt-1">
                                Next send:{" "}
                                {new Date(
                                  new Date(v.last_sent_time).getTime() +
                                    (v.interval_days ?? 7) *
                                      24 *
                                      60 *
                                      60 *
                                      1000,
                                ).toLocaleString()}
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-green-900 text-white mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="font-semibold">BPLO Inspection Management System</div>
          <div className="text-green-200">
            © {new Date().getFullYear()} Business Permits and Licensing Office
          </div>
        </div>
      </footer>

      {/* Message Modal */}
      {messageModal.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ModalIcon type={messageModal.type} />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {messageModal.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={closeMessageModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">{messageModal.message}</p>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeMessageModal}
                className="px-4 py-2 rounded-lg bg-green-900 text-white text-sm font-medium hover:bg-green-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FiInfo className="text-3xl text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {confirmModal.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={closeConfirmModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-gray-700">{confirmModal.message}</p>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
              >
                {confirmModal.cancelText}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 rounded-lg bg-green-900 text-white text-sm font-medium hover:bg-green-800"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
<DetailsForBusinessFormModal
  open={detailsModalOpen}
  onClose={() => setDetailsModalOpen(false)}
  data={selectedBusiness}
  tableName="business_records" // ✅ ADD THIS
/>
    </div>
  );
}

export default function ComplianceDashboardPage() {
  return (
    <ProtectedRoute requiredRole="staff">
      <ViolationsPageContent />
    </ProtectedRoute>
  );
}
