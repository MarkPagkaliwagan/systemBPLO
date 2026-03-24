// app/module-2-inspection/Review Modal/ReviewModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiCheck, FiX, FiSave, FiAlertTriangle, FiCalendar, FiUser,
  FiMapPin, FiBriefcase, FiCamera, FiUpload, FiTrash2, FiEdit2,
  FiLoader, FiMap, FiActivity, FiClock,
} from "react-icons/fi";
import { handlePhotoAndLocationUpload } from "@/lib/photoUpload";
import { supabase } from "@/lib/supabaseClient";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ActivityLogModal from "./Activitylogmodal";

interface BusinessRecord {
  id: string;
  "Business Identification Number": string;
  "Business Name": string;
  "Trade Name": string | null;
  "Business Nature": string | null;
  "Business Line": string | null;
  "Business Type": string | null;
  "Transmittal No.": string | null;
  "Incharge First Name": string | null;
  "Incharge Middle Name": string | null;
  "Incharge Last Name": string | null;
  "Incharge Extension Name": string | null;
  "Incharge Sex": string | null;
  "Citizenship": string | null;
  "Office Street": string | null;
  "Office Region": string | null;
  "Office Province": string | null;
  "Office Municipality": string | null;
  "Office Barangay": string | null;
  "Office Zipcode": string | null;
  "Year": number | null;
  "Capital": number | null;
  "Gross Amount": number | null;
  "Gross Amount Essential": number | null;
  "Gross Amount Non-Essential": number | null;
  "Reject Remarks": string | null;
  "Module Type": string | null;
  "Transaction Type": string | null;
  "Requestor First Name": string | null;
  "Requestor Middle Name": string | null;
  "Requestor Last Name": string | null;
  "Requestor Extension Name": string | null;
  "Requestor Email": string | null;
  "Requestor Mobile No.": string | null;
  "Birth Date": string | null;
  "Requestor Sex": string | null;
  "Civil Status": string | null;
  "Requestor Street": string | null;
  "Requestor Province": string | null;
  "Requestor Municipality": string | null;
  "Requestor Barangay": string | null;
  "Requestor Zipcode": string | null;
  "Transaction ID": string | null;
  "Reference No.": string | null;
  "Brgy. Clearance Status": string | null;
  "SITE Transaction Status": string | null;
  "CORE Transaction Status": string | null;
  "Transaction Date": string | null;
  "SOA No.": string | null;
  "Annual Amount": number | null;
  "Term": string | null;
  "Amount Paid": number | null;
  "Balance": number | null;
  "Payment Type": string | null;
  "Payment Date": string | null;
  "O.R. No.": string | null;
  "Brgy. Clearance No.": string | null;
  "O.R. Date": string | null;
  "Permit No.": string | null;
  "Business Plate No.": string | null;
  "Actual Closure Date": string | null;
  "Retirement Reason": string | null;
  "Source Type": string | null;
  violation: string | null;
  review_action: string | null;
  review_date: string | null;
  reviewed_by: string | null;
  status: string | null;
  assigned_inspector: string | null;
  scheduled_date: string | null;
  schedule_time: string | null;
  photo: string | null;
  latitude: string | null;
  longitude: string | null;
  accuracy: string | null;
}

interface ReviewModalProps {
  selectedRow: BusinessRecord | null;
  showReviewModal: boolean;
  onClose: () => void;
  onSave: (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
    photoUrl?: string;
    reviewedBy?: string;
  }) => void;
  onRecordUpdated?: (updated: BusinessRecord) => void;
  onRecordDeleted?: (id: string) => void;
  isMobile: boolean;
}

const NUMERIC_KEYS: (keyof BusinessRecord)[] = [
  "Year", "Capital", "Gross Amount", "Gross Amount Essential",
  "Gross Amount Non-Essential", "Annual Amount", "Amount Paid", "Balance",
];

const READONLY_KEYS: (keyof BusinessRecord)[] = [
  "id", "Business Identification Number", "Transaction ID",
];

export default function ReviewModal({
  selectedRow, showReviewModal, onClose, onSave,
  onRecordUpdated, onRecordDeleted, isMobile,
}: ReviewModalProps) {
  const [showSavedToast, setShowSavedToast]   = useState(false);
  const [previewPhoto, setPreviewPhoto]       = useState<string | null>(null);
  const [showDelete, setShowDelete]           = useState(false);
  const [isEditing, setIsEditing]             = useState(false);
  const [editForm, setEditForm]               = useState<BusinessRecord | null>(null);
  const [isSavingEdit, setIsSavingEdit]       = useState(false);
  const [editError, setEditError]             = useState<string | null>(null);
  const [showEditToast, setShowEditToast]     = useState(false);
  const [reviewedByName, setReviewedByName]   = useState<string>("");
  const [showLog, setShowLog]                 = useState(false);

  // ── Fetch current user's full_name from localStorage → users table ────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;
        const user = JSON.parse(userData);
        if (!user?.id) return;

        const { data } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) setReviewedByName(data.full_name);
      } catch (err) {
        console.error("Failed to fetch reviewer name:", err);
      }
    };
    fetchUser();
  }, []);

  if (!showReviewModal || !selectedRow) return null;

  const handleStartEdit  = () => { setEditForm({ ...selectedRow }); setEditError(null); setIsEditing(true); };
  const handleCancelEdit = () => { setIsEditing(false); setEditForm(null); setEditError(null); };

  const setField = (key: keyof BusinessRecord, raw: string) => {
    if (!editForm) return;
    const value = NUMERIC_KEYS.includes(key)
      ? raw === "" ? null : Number(raw)
      : raw === "" ? null : raw;
    setEditForm((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    setIsSavingEdit(true);
    setEditError(null);
    try {
      const { id: _id, "Business Identification Number": _bin, ...rest } = editForm;
      const { error } = await supabase
        .from("business_records")
        .update(rest)
        .eq("Business Identification Number", selectedRow["Business Identification Number"]);
      if (error) throw new Error(error.message);
      setShowEditToast(true);
      setTimeout(() => setShowEditToast(false), 2000);
      setIsEditing(false);
      onRecordUpdated?.(editForm);

      // ── Log the edit action ───────────────────────────────────────────────
      const changedFields = (Object.keys(rest) as (keyof typeof rest)[])
        .filter((k) => (rest as any)[k] !== (selectedRow as any)[k])
        .map((k) => String(k));
      supabase.from("activity_log").insert({
        bin: selectedRow["Business Identification Number"],
        action: "edit",
        performed_by: reviewedByName || "Unknown",
        details: changedFields.length
          ? `Fields edited: ${changedFields.slice(0, 5).join(", ")}${changedFields.length > 5 ? ` (+${changedFields.length - 5} more)` : ""}`
          : "Record edited",
      }).then(({ error }) => {
        if (error) console.error("❌ activity log error:", error);
      });
    } catch (err: any) {
      setEditError(err.message ?? "Save failed.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const display = isEditing && editForm ? editForm : selectedRow;

  const handleSaveWithToast = (reviewData: Parameters<typeof onSave>[0]) => {
    // Inject the reviewer's name before passing up to page.tsx
    onSave({ ...reviewData, reviewedBy: reviewedByName || undefined });

    // ── Log the review action ─────────────────────────────────────────────
    const actionDetails: string[] = [];
    if (reviewData.reviewActions?.length)
      actionDetails.push(`Status: ${reviewData.reviewActions.join(", ")}`);
    if (reviewData.violations?.length)
      actionDetails.push(`Violations: ${reviewData.violations.join(", ")}`);
    if (reviewData.assignedInspector)
      actionDetails.push(`Inspector: ${reviewData.assignedInspector}`);
    if (reviewData.scheduledDate)
      actionDetails.push(`Scheduled: ${reviewData.scheduledDate}${reviewData.scheduledTime ? " " + reviewData.scheduledTime : ""}`);
    if (reviewData.photoUrl)
      actionDetails.push("Photo uploaded");
    if (reviewData.location)
      actionDetails.push("Location captured");

    supabase.from("activity_log").insert({
      bin: selectedRow["Business Identification Number"],
      action: "review",
      performed_by: reviewedByName || "Unknown",
      details: actionDetails.join(" · ") || "Review saved",
    }).then(({ error }) => {
      if (error) console.error("❌ activity log error:", error);
    });

    setShowSavedToast(true);
    if (isMobile) {
      setTimeout(() => { setShowSavedToast(false); onClose(); }, 1800);
    } else {
      setTimeout(() => { setShowSavedToast(false); }, 2200);
    }
  };

  const onUploadPhoto = async (
    file: File,
    location?: { lat: number; lng: number; accuracy: number }
  ) => {
    const photoUrl = await handlePhotoAndLocationUpload(
      file,
      selectedRow["Business Identification Number"],
      selectedRow["Business Name"],
      location
    );
    if (!photoUrl) { console.error("❌ Photo upload failed"); return null; }
    return photoUrl;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>

        {/* Mobile toast */}
        {isMobile && (
          <div className={`fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none transition-opacity duration-500 ${showSavedToast ? "opacity-100" : "opacity-0"}`}>
            <div className={`flex flex-col items-center gap-3 bg-white rounded-2xl px-8 py-6 shadow-2xl border border-green-100 transition-all duration-500 ${showSavedToast ? "scale-100 translate-y-0" : "scale-90 translate-y-4"}`}>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-base font-semibold text-gray-800">Review Saved!</p>
              <p className="text-xs text-gray-400">Closing...</p>
            </div>
          </div>
        )}

        {/* Desktop review toast */}
        {!isMobile && (
          <div className={`fixed top-6 right-6 z-[9999] pointer-events-none transition-all duration-500 ${showSavedToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-2xl border border-green-100">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <FiCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Review Saved!</p>
                <p className="text-xs text-gray-400">Changes have been saved successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Edit saved toast */}
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-500 ${showEditToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-2xl border border-indigo-100">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <FiCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Record Updated!</p>
              <p className="text-xs text-gray-400">All changes saved to database.</p>
            </div>
          </div>
        </div>

        <div
          className={`${isMobile ? "w-full rounded-t-2xl max-h-[92vh]" : "max-w-5xl w-full mx-4 rounded-xl"} bg-white shadow-2xl overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Modal header ── */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-t-2xl">
            {/* Drag handle — mobile only */}
            {isMobile && (
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 bg-white/40 rounded-full" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>Review Business</h2>
                <p className="text-green-100 text-sm mt-1">{selectedRow["Business Name"]}</p>
              </div>

              {/* Right side: reviewer pill + activity log + close button */}
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {reviewedByName && (
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
                    <FiUser className="w-3.5 h-3.5 text-green-100 shrink-0" />
                    <span className="text-xs font-medium text-green-50 whitespace-nowrap">
                      {reviewedByName}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setShowLog(true)}
                  title="Activity Log"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors"
                >
                  <FiActivity className="w-3.5 h-3.5" />
                  {!isMobile && <span>Log</span>}
                </button>
                <button
                  onClick={onClose}
                  className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-white/20"
                >
                  <FiX className={`${isMobile ? "w-5 h-5" : "w-6 h-6"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? "p-3" : "p-6 lg:h-[calc(90vh-7rem)]"}`}>
            <div className={`${isMobile ? "space-y-4" : "grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch h-full"}`}>

              {/* Left: Business Information */}
              <div className={`${isMobile ? "w-full" : "lg:col-span-2 lg:h-full lg:flex lg:flex-col lg:overflow-hidden"} bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border ${isEditing ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200"} transition-all`}>

                {/* Card header */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 shrink-0 ${isEditing ? "bg-indigo-600" : "bg-green-600"}`}>
                      <FiBriefcase className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Business Information
                        {isEditing && (
                          <span className="ml-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Editing
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">Permit #{selectedRow["Permit No."]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isEditing ? (
                      <>
                        <button onClick={handleSaveEdit} disabled={isSavingEdit}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors ${isSavingEdit ? "bg-indigo-400 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                          {isSavingEdit
                            ? <><FiLoader className="w-3.5 h-3.5 animate-spin" />{!isMobile && " Saving..."}</>
                            : <><FiSave className="w-3.5 h-3.5" />{!isMobile && " Save"}</>}
                        </button>
                        <button onClick={handleCancelEdit} disabled={isSavingEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                          <FiX className="w-3.5 h-3.5" />{!isMobile && " Cancel"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={handleStartEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                          <FiEdit2 className="w-3.5 h-3.5" />{!isMobile && " Edit"}
                        </button>
                        <button onClick={() => setShowDelete(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                          <FiTrash2 className="w-3.5 h-3.5" />{!isMobile && " Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editError && (
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shrink-0">
                    <FiAlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">{editError}</p>
                  </div>
                )}

                {/* Scrollable fields */}
                <div className={`flex flex-col ${isMobile ? "" : "flex-1 min-h-0 overflow-y-auto pr-1"} space-y-3`}>

                  <Section title="Business Details">
                    <Field label="BIN" fieldKey="Business Identification Number" breakAll isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Business Name" fieldKey="Business Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Trade Name" fieldKey="Trade Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Nature" fieldKey="Business Nature" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Line" fieldKey="Business Line" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Type" fieldKey="Business Type" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Transmittal" fieldKey="Transmittal No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Module" fieldKey="Module Type" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Transaction" fieldKey="Transaction Type" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Year" fieldKey="Year" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Source Type" fieldKey="Source Type" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  <Section title="Incharge Information">
                    <Field label="First Name" fieldKey="Incharge First Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Middle Name" fieldKey="Incharge Middle Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Last Name" fieldKey="Incharge Last Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Extension" fieldKey="Incharge Extension Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Sex" fieldKey="Incharge Sex" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Citizenship" fieldKey="Citizenship" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  <Section title="Office Address">
                    <Field label="Street" fieldKey="Office Street" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Region" fieldKey="Office Region" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Province" fieldKey="Office Province" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Municipality" fieldKey="Office Municipality" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Barangay" fieldKey="Office Barangay" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Zipcode" fieldKey="Office Zipcode" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  <Section title="Financial Information">
                    <Field label="Capital" fieldKey="Capital" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Gross Amount" fieldKey="Gross Amount" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Essential" fieldKey="Gross Amount Essential" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Non-Essential" fieldKey="Gross Amount Non-Essential" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Annual Amount" fieldKey="Annual Amount" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Amount Paid" fieldKey="Amount Paid" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Balance" fieldKey="Balance" type="number" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Term" fieldKey="Term" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Payment Type" fieldKey="Payment Type" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Payment Date" fieldKey="Payment Date" type="date" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Reject Remarks" fieldKey="Reject Remarks" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  <Section title="Requestor Information">
                    <Field label="First Name" fieldKey="Requestor First Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Middle Name" fieldKey="Requestor Middle Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Last Name" fieldKey="Requestor Last Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Extension" fieldKey="Requestor Extension Name" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Email" fieldKey="Requestor Email" type="email" breakAll isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Mobile No" fieldKey="Requestor Mobile No." type="tel" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Birth Date" fieldKey="Birth Date" type="date" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Sex" fieldKey="Requestor Sex" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Civil Status" fieldKey="Civil Status" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Street" fieldKey="Requestor Street" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Province" fieldKey="Requestor Province" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Municipality" fieldKey="Requestor Municipality" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Barangay" fieldKey="Requestor Barangay" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Zipcode" fieldKey="Requestor Zipcode" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  <Section title="Transaction Details">
                    <Field label="Transaction ID" fieldKey="Transaction ID" breakAll isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Reference No" fieldKey="Reference No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Transaction Date" fieldKey="Transaction Date" type="date" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Brgy Clearance" fieldKey="Brgy. Clearance Status" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Brgy Clearance No" fieldKey="Brgy. Clearance No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="SITE Transaction" fieldKey="SITE Transaction Status" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Core Transaction" fieldKey="CORE Transaction Status" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="SOA No" fieldKey="SOA No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="O.R No" fieldKey="O.R. No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="O.R Date" fieldKey="O.R. Date" type="date" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Permit No" fieldKey="Permit No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Plate No" fieldKey="Business Plate No." isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Closure Date" fieldKey="Actual Closure Date" type="date" isEditing={isEditing} display={display} onChangeField={setField} />
                    <Field label="Retirement" fieldKey="Retirement Reason" isEditing={isEditing} display={display} onChangeField={setField} />
                  </Section>

                  {/* Geo-Tagging — always read-only */}
                  <Section title="Geo-Tagging">
                    {/* Photo */}
                    <div className="flex items-start text-sm gap-2">
                      <span className="font-bold text-gray-700 shrink-0 min-w-[90px]">Photo:</span>
                      {selectedRow["photo"] ? (
                        <div className="flex flex-col gap-2 flex-1">
                          <button type="button"
                            onClick={() => { if (!isMobile) setPreviewPhoto(selectedRow["photo"]); }}
                            className={`w-full text-left rounded-lg border border-gray-200 overflow-hidden ${isMobile ? "" : "cursor-zoom-in hover:opacity-95 transition-opacity"}`}>
                            <img src={selectedRow["photo"]} alt="Business Photo" className="w-full h-40 object-cover" />
                          </button>
                          {!isMobile && (
                            <button type="button" onClick={() => setPreviewPhoto(selectedRow["photo"])} className="text-blue-600 underline text-xs text-left">
                              View full photo
                            </button>
                          )}
                        </div>
                      ) : <span className="text-gray-600">-</span>}
                    </div>

                    {/* Location coordinates */}
                    <InfoRow label="Latitude"  value={selectedRow["latitude"]} />
                    <InfoRow label="Longitude" value={selectedRow["longitude"]} />
                    <InfoRow label="Accuracy"  value={selectedRow["accuracy"] ? `±${selectedRow["accuracy"]}m` : null} />

                    {/* Map preview — shown when coordinates exist */}
                    {selectedRow["latitude"] && selectedRow["longitude"] && (
                      <div className="mt-1 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
                        <div className="w-full" style={{ height: "160px" }}>
                          <iframe
                            title="saved-location-preview"
                            className="w-full h-full border-0"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(selectedRow["longitude"]) - 0.003},${Number(selectedRow["latitude"]) - 0.003},${Number(selectedRow["longitude"]) + 0.003},${Number(selectedRow["latitude"]) + 0.003}&layer=mapnik&marker=${selectedRow["latitude"]},${selectedRow["longitude"]}`}
                          />
                        </div>
                        <div className="px-3 py-2 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-blue-800 font-mono">
                              {Number(selectedRow["latitude"]).toFixed(6)},{" "}
                              {Number(selectedRow["longitude"]).toFixed(6)}
                            </p>
                            <p className="text-xs text-blue-500 mt-0.5">
                              {selectedRow["accuracy"]
                                ? `GPS ±${selectedRow["accuracy"]}m`
                                : "Manually pinned"}
                            </p>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${selectedRow["latitude"]},${selectedRow["longitude"]}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 underline px-2 py-1 rounded hover:bg-blue-100 transition-colors shrink-0"
                          >
                            Open in Maps ↗
                          </a>
                        </div>
                      </div>
                    )}

                    {!selectedRow["latitude"] && !selectedRow["longitude"] && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        No location saved yet — use Inspection Location in the review form.
                      </p>
                    )}
                  </Section>
                </div>
              </div>

              {/* Right: Review Form */}
              <div className={`${isMobile ? "w-full" : "lg:col-span-1 lg:h-full"}`}>
                <ReviewForm
                  initialActions={selectedRow.review_action ? selectedRow.review_action.split(",").map((a) => a.trim()) : []}
                  initialViolations={selectedRow.violation ? selectedRow.violation.split(",").map((v) => v.trim()) : []}
                  initialInspector={selectedRow.assigned_inspector ?? undefined}
                  initialScheduledDate={selectedRow.scheduled_date ?? undefined}
                  initialScheduledTime={selectedRow.schedule_time ?? undefined}
                  onSave={handleSaveWithToast}
                  onCancel={onClose}
                  onUploadPhoto={onUploadPhoto}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Photo Modal */}
        {previewPhoto && !isMobile && (
          <div className="fixed inset-0 z-[9998] bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
            <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setPreviewPhoto(null)} className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white text-gray-700 shadow-lg flex items-center justify-center hover:bg-gray-100">
                <FiX className="w-5 h-5" />
              </button>
              <img src={previewPhoto} alt="Full view" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl bg-white" />
            </div>
          </div>
        )}
      </div>

      {/* Activity Log Modal */}
      {showLog && (
        <ActivityLogModal
          bin={selectedRow["Business Identification Number"]}
          businessName={selectedRow["Business Name"]}
          onClose={() => setShowLog(false)}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDelete && (
        <DeleteConfirmModal
          recordId={selectedRow.id}
          businessName={selectedRow["Business Name"]}
          bin={selectedRow["Business Identification Number"]}
          isMobile={isMobile}
          onClose={() => setShowDelete(false)}
          onDeleted={(id) => {
            onRecordDeleted?.(id);
            setShowDelete(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-2 py-1 text-sm border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors text-gray-900 bg-white";
const readonlyCls =
  "w-full px-2 py-1 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed";

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label, fieldKey, type = "text", breakAll = false,
  isEditing, display, onChangeField,
}: {
  label: string;
  fieldKey: keyof BusinessRecord;
  type?: "text" | "number" | "date" | "email" | "tel";
  breakAll?: boolean;
  isEditing: boolean;
  display: BusinessRecord;
  onChangeField: (key: keyof BusinessRecord, value: string) => void;
}) {
  const raw = display[fieldKey];
  const strVal = raw === null || raw === undefined ? "" : String(raw);
  const isReadonly = READONLY_KEYS.includes(fieldKey);
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="font-bold text-gray-700 shrink-0 min-w-[90px]">{label}:</span>
      {isEditing ? (
        isReadonly
          ? <input value={strVal} disabled className={readonlyCls} title="Read-only" />
          : <input type={type} value={strVal} onChange={(e) => onChangeField(fieldKey, e.target.value)} className={inputCls} />
      ) : (
        <span className={`text-gray-600 ${breakAll ? "break-all" : "break-words"}`}>{strVal || "-"}</span>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">{title}</h4>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start text-sm gap-2">
      <span className="font-bold text-gray-700 shrink-0 min-w-[90px]">{label}:</span>
      <span className="text-gray-600 break-words">{value || "-"}</span>
    </div>
  );
}

// ── Map Picker Modal ──────────────────────────────────────────────────────────
function MapPickerModal({
  initialLat, initialLng, onConfirm, onClose,
}: {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef   = useRef<any>(null);
  const [pinned, setPinned] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  const defaultLat = initialLat ?? 14.0996;
  const defaultLng = initialLng ?? 122.8185;

  useEffect(() => {
    let isMounted = true;
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as any);
      if (!mapRef.current || !isMounted) return;

      // Fix broken Leaflet icons in webpack/Next.js by using a custom icon
      const customIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          "></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      // Start with fallback center, then move to device location if no initial coords
      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 15);
      mapInstance.current = map;

      // If no initial pin, get device location, place pin + fly there
      if (!initialLat && !initialLng && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted || !mapInstance.current) return;
            const { latitude: lat, longitude: lng } = pos.coords;

            // Fly to device location
            mapInstance.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });

            // Place pin automatically at current location
            setPinned({ lat, lng });
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(mapInstance.current);
              markerRef.current.on("dragend", (ev: any) => {
                const p = ev.target.getLatLng();
                setPinned({ lat: p.lat, lng: p.lng });
              });
            }
          },
          () => {}, // silently fail — keeps fallback center, no auto pin
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { icon: customIcon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          setPinned({ lat: pos.lat, lng: pos.lng });
        });
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setPinned({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", (ev: any) => {
            const pos = ev.target.getLatLng();
            setPinned({ lat: pos.lat, lng: pos.lng });
          });
        }
      });
    };
    initMap();
    return () => {
      isMounted = false;
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col" style={{ height: "80vh" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <FiMap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-gray-800">Pick Location on Map</p>
              <p className="text-xs text-gray-500">Click anywhere on the map to drop a pin. Drag the pin to adjust.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div ref={mapRef} className="flex-1 w-full" />
        <div className="px-5 py-4 border-t border-gray-200 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 min-w-0">
            {pinned
              ? <span className="font-mono">{pinned.lat.toFixed(6)}, {pinned.lng.toFixed(6)}</span>
              : <span className="text-gray-400 italic">No pin placed yet — click the map</span>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (pinned) { onConfirm(pinned.lat, pinned.lng); onClose(); } }}
              disabled={!pinned}
              className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${pinned ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}>
              Confirm Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Review Form ───────────────────────────────────────────────────────────────
function ReviewForm({
  initialActions, initialViolations, initialInspector, initialScheduledDate,
  initialScheduledTime,
  onSave, onCancel, onUploadPhoto, isMobile = false,
}: {
  initialActions: string[];
  initialViolations: string[];
  initialInspector?: string;
  initialScheduledDate?: string;
  initialScheduledTime?: string;
  onSave: (data: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
    photoUrl?: string;
  }) => void;
  onCancel: () => void;
  onUploadPhoto: (
    file: File,
    location?: { lat: number; lng: number; accuracy: number }
  ) => Promise<string | null>;
  isMobile?: boolean;
}) {
  const [reviewActions, setReviewActions]         = useState<string[]>(initialActions);
  const [violations, setViolations]               = useState<string[]>(initialViolations);
  const [violationText, setViolationText]         = useState(initialViolations.join(", "));
  const [assignedInspector, setAssignedInspector] = useState(initialInspector || "");
  const [scheduledDate, setScheduledDate]         = useState(initialScheduledDate || "");
  const [scheduledTime, setScheduledTime]         = useState(initialScheduledTime || "");
  const [isSaving, setIsSaving]                   = useState(false);

  const [location, setLocation]             = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showMapPicker, setShowMapPicker]   = useState(false);

  const [photoFile, setPhotoFile]               = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]         = useState<string | null>(null);
  const [isDragging, setIsDragging]             = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"idle" | "granted" | "denied">("idle");

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) { setLocationStatus("error"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) });
        setLocationStatus("success");
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapConfirm = (lat: number, lng: number) => {
    setLocation({ lat, lng, accuracy: 0 });
    setLocationStatus("success");
  };

  const clearLocation = () => { setLocation(null); setLocationStatus("idle"); };

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setCameraPermission("granted");
      cameraInputRef.current?.click();
    } catch { setCameraPermission("denied"); }
  };

  const handleDrop      = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handlePhotoFile(f); };
  const handleDragOver  = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const clearPhoto      = () => { setPhotoFile(null); setPhotoPreview(null); setCameraPermission("idle"); };

  const availableActions = ["Active", "Compliant", "Non-Compliant", "For Inspection"];
  const isRedAction = (a: string) => a === "Non-Compliant" || a === "For Inspection";
  const addAction    = (a: string) => { if (!reviewActions.includes(a)) setReviewActions([...reviewActions, a]); };
  const removeAction = (i: number) => setReviewActions(reviewActions.filter((_, idx) => idx !== i));

  const handleViolationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setViolationText(text);
    setViolations(text.split(",").map((v) => v.trim()).filter((v) => v.length > 0));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let photoUrl: string | undefined;
      if (photoFile) {
        const url = await onUploadPhoto(photoFile, location ?? undefined);
        if (url) photoUrl = url;
      }
      onSave({
        reviewActions,
        violations,
        assignedInspector: assignedInspector || undefined,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        location: location || undefined,
        photo: photoFile || undefined,
        photoUrl,
      });
    } finally { setIsSaving(false); }
  };

  const showInspectorFields = reviewActions.includes("For Inspection");

  return (
    <>
      {showMapPicker && (
        <MapPickerModal
          initialLat={location?.lat}
          initialLng={location?.lng}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      <div className="space-y-4">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ""; }} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ""; }} />

        {/* Review Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <FiCheck className="w-4 h-4 mr-2 text-green-600" /> Review Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map((action) => {
              const isSelected = reviewActions.includes(action);
              const isRed = isRedAction(action);
              return (
                <button key={action} onClick={() => addAction(action)} disabled={isSelected}
                  className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? isRed ? "bg-red-600 text-white shadow-lg scale-105 ring-2 ring-red-500 ring-offset-2"
                               : "bg-green-600 text-white shadow-lg scale-105 ring-2 ring-green-500 ring-offset-2"
                      : isRed ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                               : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {action}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Actions</label>
            <div className="min-h-[60px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {reviewActions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {reviewActions.map((action, index) => (
                    <span key={index} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isRedAction(action) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      <FiCheck className="w-3 h-3 mr-1" />{action}
                      <button onClick={() => removeAction(index)} className={`ml-2 ${isRedAction(action) ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}`}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-sm">No actions selected</p>}
            </div>
          </div>
        </div>

        {/* Violations */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <FiAlertTriangle className="w-4 h-4 mr-2 text-red-600" /> Violations
          </h3>
          <label className="block text-sm font-medium text-gray-700 mb-2">Violations Details</label>
          <textarea rows={3} value={violationText} onChange={handleViolationTextChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-red-700"
            placeholder="Enter violations separated by commas..." />
          <p className="text-xs text-gray-500 mt-1">Separate multiple violations with commas</p>
        </div>

        {/* Inspection Photo */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <FiCamera className="w-4 h-4 mr-2 text-green-600" /> Inspection Photo
          </h3>
          {cameraPermission === "denied" && (
            <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">Camera access was denied. You can still upload a photo using the Upload File button.</p>
            </div>
          )}
          {photoPreview && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="relative">
                <img src={photoPreview} alt="Inspection photo" className="w-full max-h-[400px] object-contain" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button type="button" onClick={openCamera}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-white shadow-sm transition-colors">
                    <FiCamera className="w-3 h-3" /> Retake
                  </button>
                  <button type="button" onClick={clearPhoto}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-red-600 shadow-sm transition-colors">
                    <FiTrash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{photoFile?.name}</p>
                  <p className="text-xs text-gray-400">{photoFile ? `${(photoFile.size / 1024).toFixed(1)} KB` : ""}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Captured</span>
              </div>
            </div>
          )}
          {!photoPreview && (
            <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              className={`w-full rounded-xl border-2 border-dashed transition-all duration-200 ${isDragging ? "border-green-400 bg-green-50 scale-[1.01]" : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50"}`}>
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <FiCamera className="w-7 h-7 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isMobile ? "Tap to take a photo or upload" : "Drag & drop a photo here, or use the buttons below"}
                </p>
                <p className="text-xs text-gray-400 mb-5">JPG, PNG, WEBP • Max 10 MB</p>
                <div className={`flex ${isMobile ? "flex-col w-full" : "flex-row"} gap-3`}>
                  <button type="button" onClick={openCamera}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm">
                    <FiCamera className="w-4 h-4" /> Open Camera
                  </button>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                    <FiUpload className="w-4 h-4" /> Upload File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspection Location */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <FiMapPin className="w-4 h-4 mr-2 text-blue-600" /> Inspection Location
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button" onClick={captureLocation} disabled={locationStatus === "loading"}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs transition-all duration-200 ${
                locationStatus === "loading"
                  ? "bg-gray-100 text-gray-500 border border-gray-300 cursor-wait"
                  : "bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100"
              }`}>
              <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {locationStatus === "loading" ? "Getting GPS..." : "Auto GPS"}
            </button>
            <button type="button" onClick={() => setShowMapPicker(true)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-xs bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 transition-colors">
              <FiMap className="w-3.5 h-3.5 flex-shrink-0" />
              Pick on Map
            </button>
          </div>

          {locationStatus === "success" && location ? (
            <div className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
              <div className="w-full bg-gray-100 relative" style={{ height: "140px" }}>
                <iframe
                  title="location-preview"
                  className="w-full h-full border-0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.003},${location.lat - 0.003},${location.lng + 0.003},${location.lat + 0.003}&layer=mapnik&marker=${location.lat},${location.lng}`}
                />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-green-800 font-mono">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    {location.accuracy > 0 ? `GPS ±${location.accuracy}m` : "Manually pinned"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-600 underline px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                    Maps ↗
                  </a>
                  <button type="button" onClick={() => setShowMapPicker(true)}
                    className="text-xs text-indigo-600 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50 transition-colors">
                    Adjust
                  </button>
                  <button type="button" onClick={clearLocation}
                    className="text-xs text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          ) : locationStatus === "error" ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <FiAlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-red-700">GPS failed</p>
                <p className="text-xs text-red-500">Try again or use Pick on Map instead</p>
              </div>
              <button type="button" onClick={captureLocation}
                className="text-xs text-red-600 font-semibold px-2 py-1 rounded border border-red-300 hover:bg-red-100 transition-colors shrink-0">
                Retry
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-1">
              No location set — use Auto GPS or Pick on Map
            </p>
          )}
        </div>

        {/* Inspector Assignment */}
        {showInspectorFields && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <FiUser className="w-4 h-4 mr-2 text-blue-600" /> Inspection Assignment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Inspector</label>
                <div className="relative">
                  <input type="text" value={assignedInspector} onChange={(e) => setAssignedInspector(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-black"
                    placeholder="Enter inspector name..." />
                  <FiUser className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                <div className="relative">
                  <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors" />
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time</label>
                <div className="relative">
                  <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors" />
                  <FiClock className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
          <button onClick={handleSave} disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 ${
              isSaving ? "opacity-70 cursor-wait" : "hover:from-green-700 hover:to-green-800 active:scale-95"
            }`}>
            <FiSave className="w-4 h-4" />{isSaving ? "Saving..." : "Save Review"}
          </button>
          <button onClick={onCancel} disabled={isSaving}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}