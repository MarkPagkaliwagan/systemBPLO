"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Building2, UserCheck, MapPin, DollarSign, FileText, ClipboardList, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BusinessRecord {
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
  status: string;
  assigned_inspector: string | null;
  scheduled_date: string | null;
  file_id: string | null;
}

interface AddBusinessRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (record: BusinessRecord) => void; // parent will handle opening confirm modal
}

// ── Confirm Modal Import ───────────────────────────────────────────────────────
import ConfirmScheduleModal from "./Confirmschedulemodal";

// ── Empty record helper ───────────────────────────────────────────────────────
const emptyRecord = (): BusinessRecord => ({
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
  file_id: null,
});

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddBusinessRecordModal({ isOpen, onClose, onSaved }: AddBusinessRecordModalProps) {
  const [form, setForm] = useState(emptyRecord());
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [saving, setSaving] = useState(false);

  // ── Confirm modal state ─────────────────────────────────────────────────────
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedRecord, setSavedRecord] = useState<BusinessRecord | null>(null);

  useEffect(() => {
    if (isOpen) setForm(emptyRecord());
  }, [isOpen]);

  const setField = (key: string, value: any) =>
    setForm(prev => ({ ...prev, [key]: value === "" ? null : value }));

  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    if (!form["Business Identification Number"]?.trim()) e["bin"] = "BIN is required.";
    if (!form["Business Name"]?.trim()) e["name"] = "Business Name is required.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    try {
      const { file_id, ...recordWithoutFileId } = form as any;

      const { data, error } = await supabase
        .from("business_records")
        .insert([recordWithoutFileId])
        .select()
        .single();

      if (error) throw error;

      setSavedRecord(data as BusinessRecord);

      // trigger Confirm modal
      setConfirmOpen(true);

    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Your original modal UI here */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-white p-6 overflow-auto">
          <h2 className="text-lg font-bold mb-4">Add Business Record</h2>
          {/* Example Fields */}
          <input
            type="text"
            placeholder="BIN"
            value={form["Business Identification Number"]}
            onChange={e => setField("Business Identification Number", e.target.value)}
            className="w-full p-2 border mb-2"
          />
          <input
            type="text"
            placeholder="Business Name"
            value={form["Business Name"]}
            onChange={e => setField("Business Name", e.target.value)}
            className="w-full p-2 border mb-2"
          />
          <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {/* ── Confirm Schedule Modal ── */}
      {savedRecord && (
        <ConfirmScheduleModal
          isOpen={confirmOpen}
          businessName={savedRecord["Business Name"]}
          onConfirm={() => {
            setConfirmOpen(false);
            onSaved(savedRecord); // parent opens Review modal
          }}
          onSkip={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}