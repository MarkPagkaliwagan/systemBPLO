"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Building2, User, MapPin, DollarSign, FileText, ClipboardList, UserCheck, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmScheduleModal from "../Modal/Confirmschedulemodal";
import ReviewModal, { BusinessRecord } from "../Modal/reviewModal";

interface AddBusinessRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: BusinessRecord) => void;
  isMobile?: boolean;
}
interface AddBusinessRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: BusinessRecord) => void;
}

// ── Section Component ─────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section = ({ title, icon, color, children, defaultOpen = false }: SectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 ${color} transition-colors`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold text-slate-700">{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-slate-500" />
          : <ChevronDown size={16} className="text-slate-500" />
        }
      </button>
      {open && (
        <div className="bg-white px-4 py-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

// ── Input helpers ─────────────────────────────────────────────────────────────
const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls = (hasError?: boolean) =>
  `w-full text-sm text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 border outline-none transition-colors placeholder-slate-300
  ${hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-green-500'}`;

const selectCls = inputCls();

// ── Empty record ──────────────────────────────────────────────────────────────
const emptyRecord = () => ({
  "Business Identification Number": "",
  "Business Name": "",
  "Trade Name": null,
  "Business Nature": null,
  "Business Line": null,
  "Business Type": null,
  "Transmittal No.": null,
  "Incharge First Name": null,
  "Incharge Middle Name": null,
  "Incharge Last Name": null,
  "Incharge Extension Name": null,
  "Incharge Sex": null,
  "Citizenship": null,
  "Office Street": null,
  "Office Region": null,
  "Office Province": null,
  "Office Municipality": null,
  "Office Barangay": null,
  "Office Zipcode": null,
  "Year": null,
  "Capital": null,
  "Gross Amount": null,
  "Gross Amount Essential": null,
  "Gross Amount Non-Essential": null,
  "Reject Remarks": null,
  "Module Type": null,
  "Transaction Type": null,
  "Requestor First Name": null,
  "Requestor Middle Name": null,
  "Requestor Last Name": null,
  "Requestor Extension Name": null,
  "Requestor Email": null,
  "Requestor Mobile No.": null,
  "Birth Date": null,
  "Requestor Sex": null,
  "Civil Status": null,
  "Requestor Street": null,
  "Requestor Province": null,
  "Requestor Municipality": null,
  "Requestor Barangay": null,
  "Requestor Zipcode": null,
  "Transaction ID": null,
  "Reference No.": null,
  "Brgy. Clearance Status": null,
  "SITE Transaction Status": null,
  "CORE Transaction Status": null,
  "Transaction Date": null,
  "SOA No.": null,
  "Annual Amount": null,
  "Term": null,
  "Amount Paid": null,
  "Balance": null,
  "Payment Type": null,
  "Payment Date": null,
  "O.R. No.": null,
  "Brgy. Clearance No.": null,
  "O.R. Date": null,
  "Permit No.": null,
  "Business Plate No.": null,
  "Actual Closure Date": null,
  "Retirement Reason": null,
  "Source Type": null,
  violation: null,
  review_action: null,
  review_date: null,
  reviewed_by: null,
  status: "not reviewed",
  assigned_inspector: null,
  scheduled_date: null,
});

// ── Main Component ────────────────────────────────────────────────────────────
const AddBusinessRecordModal = ({ isOpen, onClose, onSaved, isMobile = false }: AddBusinessRecordModalProps) => {
  const [form, setForm] = useState(emptyRecord());
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── NEW: saved record held between confirm → review steps ─────────────────
  const [savedRecord, setSavedRecord] = useState<BusinessRecord | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setForm(emptyRecord());
      setErrors({});
      setSaveError(null);
      setShowSuccess(false);
      setSavedRecord(null);
      setShowConfirm(false);
      setShowReview(false);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const set = (key: string, value: string | number | null) =>
    setForm(prev => ({ ...prev, [key]: value === "" ? null : value }));

  const num = (v: string) => (v === "" ? null : parseFloat(v));

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    const bin = form["Business Identification Number"].trim();
    if (!bin) {
      e["bin"] = "BIN is required.";
    } else if (!/^[0-9-]+$/.test(bin)) {
      e["bin"] = "BIN must contain numbers only (e.g. 2024-00123).";
    }
    if (!form["Business Name"].trim()) e["name"] = "Business Name is required.";
    return e;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    setSaveError(null);

    try {
      const { file_id, ...recordWithoutFileId } = form as any;

      const { data, error } = await supabase
        .from("business_records")
        .insert([recordWithoutFileId])
        .select()
        .single();

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }

      const newRecord = data as BusinessRecord;

      // ── Show success toast, then show ConfirmScheduleModal ────────────────
      setShowSuccess(true);
      setSavedRecord(newRecord);
      onSaved(newRecord); // notify parent immediately

      setTimeout(() => {
        setShowSuccess(false);
        setVisible(false);         // slide down the add-form sheet
        setShowConfirm(true);      // show the confirm modal
      }, 1200);

    } catch (err: any) {
      setSaveError(err?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    setShowReview(true);

    // ✅ Pass the savedRecord to ReviewModal like analytics does
    if (savedRecord) {
      onSaved(savedRecord);  // This sets the selectedRow for ReviewModal
    }

    setTimeout(() => setVisible(true), 10);
  };
  // ── Confirm "No, Skip" ────────────────────────────────────────────────────
  const handleConfirmSkip = () => {
    setShowConfirm(false);
    onClose();             // fully close everything
  };

  // ── ReviewModal save handler ──────────────────────────────────────────────
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
    if (!savedRecord) return;

    const updates: Record<string, any> = {
      review_action: reviewData.reviewActions.join(", ") || null,
      violation: reviewData.violations.join(", ") || null,
      status: reviewData.reviewActions[reviewData.reviewActions.length - 1]
        ?.toLowerCase().replace(/ /g, "_") ?? null,
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
      .eq("Business Identification Number", savedRecord["Business Identification Number"]);

    setShowReview(false);
    onClose();
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Success Toast ── */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[90] transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-green-200">
          <CheckCircle size={20} className="shrink-0" />
          <div>
            <p className="text-sm font-bold">Record Saved!</p>
            <p className="text-xs text-green-100">Business record added successfully.</p>
          </div>
        </div>
      </div>

      {/* ── Saving Overlay ── */}
      {saving && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Saving record...</p>
            <p className="text-xs text-slate-400">Please wait</p>
          </div>
        </div>
      )}

      {/* ── ConfirmScheduleModal ── */}
      <ConfirmScheduleModal
        isOpen={showConfirm}
        businessName={savedRecord?.["Business Name"] ?? ""}
        onConfirm={handleConfirmYes}
        onSkip={handleConfirmSkip}
      />

      {/* ── ReviewModal (opened after confirming "Yes") ── */}
      {showReview && savedRecord && (
        <ReviewModal
          selectedRow={savedRecord}
          showReviewModal={showReview ? true : false}
          isMobile={isMobile}
          onClose={() => { setShowReview(false); onClose(); }}
          onSave={handleReviewSave}
          onRecordUpdated={(updated) => setSavedRecord(updated)}
          onRecordDeleted={(bin) => {
            setShowReview(false);
            onClose();
          }}
          onShowConfirm={() => {
            setShowReview(false);
            setShowConfirm(true);
          }}
        />
      )}

      {/* ── Add-form sheet (hidden once confirm/review take over) ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={saving ? undefined : handleClose}
            className="fixed inset-0 z-[60] transition-all duration-300"
            style={{
              background: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
              backdropFilter: visible ? "blur(2px)" : "none",
            }}
          />

          {/* Bottom Sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out"
            style={{
              transform: visible ? "translateY(0)" : "translateY(100%)",
              maxHeight: "94vh",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
              <button
                onClick={handleClose}
                disabled={saving}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors active:scale-90 disabled:opacity-40"
              >
                <X size={18} className="text-slate-500" />
              </button>
              <div className="text-center">
                <h2 className="text-base font-bold text-slate-800">Add Business Record</h2>
                <p className="text-xs text-slate-400">Fill in the details below</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-green-500 text-white text-sm font-bold rounded-full hover:bg-green-600 transition-colors active:scale-95 shadow-md shadow-green-200 disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>

            {/* Error banner */}
            {saveError && (
              <div className="mx-5 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 shrink-0">
                ⚠ {saveError}
              </div>
            )}

            {/* Scrollable form */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">

              {/* ── Business Details ── */}
              <Section
                title="Business Details"
                icon={<Building2 size={16} className="text-green-600" />}
                color="bg-green-50"
                defaultOpen
              >
                <Field label="Business Identification Number (BIN)" required error={errors["bin"]}>
                  <input
                    type="text"
                    placeholder="e.g. 2024-00123"
                    value={form["Business Identification Number"]}
                    onChange={e => {
                      const val = e.target.value;
                      if (/^[0-9-]*$/.test(val)) {
                        setForm(p => ({ ...p, "Business Identification Number": val }));
                        if (errors["bin"]) setErrors(prev => ({ ...prev, bin: undefined }));
                      }
                    }}
                    className={inputCls(!!errors["bin"])}
                  />
                </Field>
                <Field label="Business Name" required error={errors["name"]}>
                  <input
                    type="text"
                    placeholder="Official registered name"
                    value={form["Business Name"]}
                    onChange={e => {
                      setForm(p => ({ ...p, "Business Name": e.target.value }));
                      if (errors["name"]) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={inputCls(!!errors["name"])}
                  />
                </Field>
                <Field label="Trade Name">
                  <input type="text" placeholder="DBA / Trade name" value={form["Trade Name"] ?? ""} onChange={e => set("Trade Name", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Business Nature">
                    <input type="text" placeholder="e.g. Retail" value={form["Business Nature"] ?? ""} onChange={e => set("Business Nature", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Business Line">
                    <input type="text" placeholder="e.g. Food" value={form["Business Line"] ?? ""} onChange={e => set("Business Line", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Business Type">
                    <input type="text" placeholder="e.g. Sole" value={form["Business Type"] ?? ""} onChange={e => set("Business Type", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Year">
                    <input type="number" placeholder="2024" value={form["Year"] ?? ""} onChange={e => set("Year", num(e.target.value))} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Module Type">
                    <input type="text" value={form["Module Type"] ?? ""} onChange={e => set("Module Type", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Transaction Type">
                    <input type="text" value={form["Transaction Type"] ?? ""} onChange={e => set("Transaction Type", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Transmittal No.">
                  <input type="text" value={form["Transmittal No."] ?? ""} onChange={e => set("Transmittal No.", e.target.value)} className={inputCls()} />
                </Field>
              </Section>

              {/* ── Incharge Information ── */}
              <Section
                title="Incharge Information"
                icon={<UserCheck size={16} className="text-blue-600" />}
                color="bg-blue-50"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input type="text" value={form["Incharge First Name"] ?? ""} onChange={e => set("Incharge First Name", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Middle Name">
                    <input type="text" value={form["Incharge Middle Name"] ?? ""} onChange={e => set("Incharge Middle Name", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Last Name">
                    <input type="text" value={form["Incharge Last Name"] ?? ""} onChange={e => set("Incharge Last Name", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Extension">
                    <input type="text" placeholder="Jr., Sr." value={form["Incharge Extension Name"] ?? ""} onChange={e => set("Incharge Extension Name", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sex">
                    <select value={form["Incharge Sex"] ?? ""} onChange={e => set("Incharge Sex", e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </Field>
                  <Field label="Citizenship">
                    <input type="text" placeholder="e.g. Filipino" value={form["Citizenship"] ?? ""} onChange={e => set("Citizenship", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              </Section>

              {/* ── Office Address ── */}
              <Section
                title="Office Address"
                icon={<MapPin size={16} className="text-orange-500" />}
                color="bg-orange-50"
              >
                <Field label="Street">
                  <input type="text" value={form["Office Street"] ?? ""} onChange={e => set("Office Street", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Region">
                    <input type="text" value={form["Office Region"] ?? ""} onChange={e => set("Office Region", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Province">
                    <input type="text" value={form["Office Province"] ?? ""} onChange={e => set("Office Province", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Municipality">
                    <input type="text" value={form["Office Municipality"] ?? ""} onChange={e => set("Office Municipality", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Barangay">
                    <input type="text" value={form["Office Barangay"] ?? ""} onChange={e => set("Office Barangay", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Zipcode">
                  <input type="text" value={form["Office Zipcode"] ?? ""} onChange={e => set("Office Zipcode", e.target.value)} className={inputCls()} />
                </Field>
              </Section>

              {/* ── Financial Information ── */}
              <Section
                title="Financial Information"
                icon={<DollarSign size={16} className="text-emerald-600" />}
                color="bg-emerald-50"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Capital (₱)">
                    <input type="number" placeholder="0.00" value={form["Capital"] ?? ""} onChange={e => set("Capital", num(e.target.value))} className={inputCls()} />
                  </Field>
                  <Field label="Gross Amount (₱)">
                    <input type="number" placeholder="0.00" value={form["Gross Amount"] ?? ""} onChange={e => set("Gross Amount", num(e.target.value))} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Gross Essential (₱)">
                    <input type="number" placeholder="0.00" value={form["Gross Amount Essential"] ?? ""} onChange={e => set("Gross Amount Essential", num(e.target.value))} className={inputCls()} />
                  </Field>
                  <Field label="Gross Non-Essential (₱)">
                    <input type="number" placeholder="0.00" value={form["Gross Amount Non-Essential"] ?? ""} onChange={e => set("Gross Amount Non-Essential", num(e.target.value))} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Annual Amount (₱)">
                    <input type="number" placeholder="0.00" value={form["Annual Amount"] ?? ""} onChange={e => set("Annual Amount", num(e.target.value))} className={inputCls()} />
                  </Field>
                  <Field label="Amount Paid (₱)">
                    <input type="number" placeholder="0.00" value={form["Amount Paid"] ?? ""} onChange={e => set("Amount Paid", num(e.target.value))} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Balance (₱)">
                    <input type="number" placeholder="0.00" value={form["Balance"] ?? ""} onChange={e => set("Balance", num(e.target.value))} className={inputCls()} />
                  </Field>
                  <Field label="Term">
                    <input type="text" placeholder="e.g. Annual" value={form["Term"] ?? ""} onChange={e => set("Term", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Payment Type">
                    <input type="text" value={form["Payment Type"] ?? ""} onChange={e => set("Payment Type", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Payment Date">
                    <input type="date" value={form["Payment Date"] ?? ""} onChange={e => set("Payment Date", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Reject Remarks">
                  <input type="text" value={form["Reject Remarks"] ?? ""} onChange={e => set("Reject Remarks", e.target.value)} className={inputCls()} />
                </Field>
              </Section>

              {/* ── Requestor Information ── */}
              <Section
                title="Requestor Information"
                icon={<User size={16} className="text-purple-600" />}
                color="bg-purple-50"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input type="text" value={form["Requestor First Name"] ?? ""} onChange={e => set("Requestor First Name", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Middle Name">
                    <input type="text" value={form["Requestor Middle Name"] ?? ""} onChange={e => set("Requestor Middle Name", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Last Name">
                    <input type="text" value={form["Requestor Last Name"] ?? ""} onChange={e => set("Requestor Last Name", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Extension">
                    <input type="text" placeholder="Jr., Sr." value={form["Requestor Extension Name"] ?? ""} onChange={e => set("Requestor Extension Name", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Email">
                  <input type="email" value={form["Requestor Email"] ?? ""} onChange={e => set("Requestor Email", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mobile No.">
                    <input type="tel" value={form["Requestor Mobile No."] ?? ""} onChange={e => set("Requestor Mobile No.", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Birth Date">
                    <input type="date" value={form["Birth Date"] ?? ""} onChange={e => set("Birth Date", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sex">
                    <select value={form["Requestor Sex"] ?? ""} onChange={e => set("Requestor Sex", e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </Field>
                  <Field label="Civil Status">
                    <select value={form["Civil Status"] ?? ""} onChange={e => set("Civil Status", e.target.value)} className={selectCls}>
                      <option value="">Select</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Widowed</option>
                      <option>Separated</option>
                    </select>
                  </Field>
                </div>
                <Field label="Street">
                  <input type="text" value={form["Requestor Street"] ?? ""} onChange={e => set("Requestor Street", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Province">
                    <input type="text" value={form["Requestor Province"] ?? ""} onChange={e => set("Requestor Province", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Municipality">
                    <input type="text" value={form["Requestor Municipality"] ?? ""} onChange={e => set("Requestor Municipality", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Barangay">
                    <input type="text" value={form["Requestor Barangay"] ?? ""} onChange={e => set("Requestor Barangay", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Zipcode">
                    <input type="text" value={form["Requestor Zipcode"] ?? ""} onChange={e => set("Requestor Zipcode", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              </Section>

              {/* ── Transaction Details ── */}
              <Section
                title="Transaction Details"
                icon={<FileText size={16} className="text-slate-600" />}
                color="bg-slate-50"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Transaction ID">
                    <input type="text" value={form["Transaction ID"] ?? ""} onChange={e => set("Transaction ID", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Reference No.">
                    <input type="text" value={form["Reference No."] ?? ""} onChange={e => set("Reference No.", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <Field label="Transaction Date">
                  <input type="datetime-local" value={form["Transaction Date"] ?? ""} onChange={e => set("Transaction Date", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brgy. Clearance Status">
                    <input type="text" value={form["Brgy. Clearance Status"] ?? ""} onChange={e => set("Brgy. Clearance Status", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Brgy. Clearance No.">
                    <input type="text" value={form["Brgy. Clearance No."] ?? ""} onChange={e => set("Brgy. Clearance No.", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SITE Transaction Status">
                    <input type="text" value={form["SITE Transaction Status"] ?? ""} onChange={e => set("SITE Transaction Status", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="CORE Transaction Status">
                    <input type="text" value={form["CORE Transaction Status"] ?? ""} onChange={e => set("CORE Transaction Status", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SOA No.">
                    <input type="text" value={form["SOA No."] ?? ""} onChange={e => set("SOA No.", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="O.R. No.">
                    <input type="text" value={form["O.R. No."] ?? ""} onChange={e => set("O.R. No.", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="O.R. Date">
                    <input type="date" value={form["O.R. Date"] ?? ""} onChange={e => set("O.R. Date", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Permit No.">
                    <input type="text" value={form["Permit No."] ?? ""} onChange={e => set("Permit No.", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Business Plate No.">
                    <input type="text" value={form["Business Plate No."] ?? ""} onChange={e => set("Business Plate No.", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Source Type">
                    <input type="text" value={form["Source Type"] ?? ""} onChange={e => set("Source Type", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Actual Closure Date">
                    <input type="date" value={form["Actual Closure Date"] ?? ""} onChange={e => set("Actual Closure Date", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Retirement Reason">
                    <input type="text" value={form["Retirement Reason"] ?? ""} onChange={e => set("Retirement Reason", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              </Section>

              {/* ── Review / Inspection ── */}
              <Section
                title="Review & Inspection"
                icon={<ClipboardList size={16} className="text-red-500" />}
                color="bg-red-50"
              >
                <Field label="Status">
                  <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                    <option value="not reviewed">Not Reviewed</option>
                    <option value="compliant">Compliant</option>
                    <option value="non_compliant">Non-Compliant</option>
                    <option value="for_inspection">For Inspection</option>
                    <option value="active">Active</option>
                  </select>
                </Field>
                <Field label="Violation">
                  <textarea
                    rows={2}
                    placeholder="Describe violations (comma-separated)"
                    value={form.violation ?? ""}
                    onChange={e => set("violation", e.target.value)}
                    className={`${inputCls()} resize-none`}
                  />
                </Field>
                <Field label="Review Action">
                  <input type="text" value={form.review_action ?? ""} onChange={e => set("review_action", e.target.value)} className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Assigned Inspector">
                    <input type="text" value={form.assigned_inspector ?? ""} onChange={e => set("assigned_inspector", e.target.value)} className={inputCls()} />
                  </Field>
                  <Field label="Scheduled Date">
                    <input type="date" value={form.scheduled_date ?? ""} onChange={e => set("scheduled_date", e.target.value)} className={inputCls()} />
                  </Field>
                </div>
              </Section>

              <div className="h-8" />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddBusinessRecordModal;