"use client";

import { FiX, FiEdit2, FiSave, FiAlertTriangle, FiCheck, FiLock, FiUnlock } from "react-icons/fi";
import { MdOutlineBusinessCenter } from "react-icons/md";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DetailsForBusinessFormModal({
  open,
  onClose,
  data,
  tableName,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
  tableName: string;
}) {
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryKey = "Business Identification Number";

  const excludedFields = [
    "created_at",
    "updated_at",
    "Business Identification Number",
    "violation",
    "Business Name",
  ];

  const readOnlyFields = [
    "Business Identification Number",
    "Business Name",
    "created_at",
    "updated_at",
    "violation",
  ];

  useEffect(() => {
    if (data) {
      setFormData(data);
      setIsEditing(false);
      setSaveSuccess(false);
      setError(null);
    }
  }, [data]);

  if (!open || !data) return null;

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(data);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleDiscard = () => {
    setFormData(data);
    setIsEditing(false);
    setError(null);
  };

  const getInputType = (value: any) => {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "checkbox";
    return "text";
  };

  const parseValue = (value: any) => {
    if (typeof value !== "string") return value;
    try { return JSON.parse(value); } catch { return value; }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setShowConfirm(false);
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const cleanedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, parseValue(value)])
      );
      const safeData = Object.fromEntries(
        Object.entries(cleanedData).filter(([key]) => !excludedFields.includes(key))
      );

      const { error } = await supabase
        .from(tableName)
        .update(safeData)
        .eq(primaryKey, data[primaryKey]);

      if (error) throw error;

      setSaveSuccess(true);
      setShowConfirm(false);
      setIsEditing(false);

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  // Group fields: identity on top, rest below
  const identityFields = ["Business Identification Number", "Business Name"];
  const otherFields = Object.keys(formData).filter(
    (k) => !identityFields.includes(k) && !["created_at", "updated_at"].includes(k)
  );
  const metaFields = Object.keys(formData).filter((k) =>
    ["created_at", "updated_at"].includes(k)
  );

  const renderField = (key: string, value: any) => {
    const inputType = getInputType(value);
    const isReadOnly = readOnlyFields.includes(key) || !isEditing;
    const isIdentity = identityFields.includes(key);

    if (isIdentity) {
      return (
        <div key={key} className="col-span-2 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
          <span className="text-base font-bold text-gray-900">
            {typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)}
          </span>
        </div>
      );
    }

    if (inputType === "checkbox") {
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
          <button
            type="button"
            onClick={() => isEditing && !readOnlyFields.includes(key) && handleChange(key, !value)}
            className={`
              w-10 h-6 rounded-full transition-colors duration-200 relative
              ${value ? "bg-blue-600" : "bg-gray-200"}
              ${isEditing && !readOnlyFields.includes(key) ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
            `}
            disabled={!isEditing || readOnlyFields.includes(key)}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{key}</span>
        <input
          type={inputType}
          value={
            typeof value === "string" || typeof value === "number"
              ? value
              : JSON.stringify(value)
          }
          onChange={(e) => handleChange(key, e.target.value)}
          readOnly={isReadOnly}
          className={`
            w-full rounded-lg px-3 py-2 text-sm text-gray-900 border transition-all duration-150
            focus:outline-none
            ${isReadOnly
              ? "bg-gray-50 border-gray-100 text-gray-600 cursor-default select-all"
              : "bg-white border-blue-300 ring-2 ring-blue-100 focus:ring-blue-200 focus:border-blue-400"
            }
          `}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0 sm:pb-4">
      <div
        className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <MdOutlineBusinessCenter className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {data["Business Name"] || "Business Details"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {data["Business Identification Number"] || ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit toggle */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100"
              >
                <FiUnlock className="text-xs" />
                Edit Record
              </button>
            ) : (
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition border border-gray-200"
              >
                <FiLock className="text-xs" />
                Discard
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* ── EDIT MODE BANNER ── */}
        {isEditing && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
            <FiEdit2 className="text-amber-500 text-xs shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              You are now editing this record. Fields highlighted in blue are editable.
            </p>
          </div>
        )}

        {/* ── SUCCESS BANNER ── */}
        {saveSuccess && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 shrink-0">
            <FiCheck className="text-emerald-500 text-xs shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">Record saved successfully.</p>
          </div>
        )}

        {/* ── BODY ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Identity section */}
          <div className="grid grid-cols-2 gap-4 pb-5 border-b border-gray-100 mb-5">
            {identityFields.map((key) => formData[key] !== undefined && renderField(key, formData[key]))}
          </div>

          {/* Main fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {otherFields.map((key) => renderField(key, formData[key]))}
          </div>

          {/* Meta fields */}
          {metaFields.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-3">System Fields</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                {metaFields.map((key) => renderField(key, formData[key]))}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-400">
            {isEditing
              ? hasChanges
                ? "You have unsaved changes."
                : "No changes made yet."
              : 'Click "Edit Record" to modify this record.'}
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Close
            </button>

            {isEditing && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <FiSave className="text-xs" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONFIRM DIALOG ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <FiAlertTriangle className="text-amber-500 text-xl" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Save Changes?</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                You are about to update this business record. This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <FiCheck className="text-xs" />
                    Yes, Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
