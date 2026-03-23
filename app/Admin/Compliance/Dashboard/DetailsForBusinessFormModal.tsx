"use client";

import { FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryKey = "Business Identification Number";

  const excludedFields = [
    "created_at",
    "updated_at",
    "Business Identification Number",
    "violation",
    "Business Name",
  ];

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  if (!open || !data) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const getInputType = (value: any) => {
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "checkbox";
    return "text";
  };

  const parseValue = (value: any) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const handleSave = async () => {
    if (JSON.stringify(formData) === JSON.stringify(data)) {
      setShowConfirm(false);
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

      setShowConfirm(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Business Full Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            <FiX className="text-xl text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(formData).map(([key, value]) => {
            const inputType = getInputType(value);
            const isDisabled = excludedFields.includes(key);

            return (
              <div key={key} className="flex flex-col">
                <span className="text-gray-500 text-xs mb-1">{key}</span>

                {inputType === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    disabled={isDisabled}
                    className={`rounded cursor-pointer w-5 h-5 ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                ) : (
                  <input
                    type={inputType}
                    value={
                      typeof value === "string" || typeof value === "number"
                        ? value
                        : JSON.stringify(value)
                    }
                    onChange={(e) => handleChange(key, e.target.value)}
                    disabled={isDisabled}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition ${
                      isDisabled ? "bg-gray-50 opacity-60 cursor-not-allowed" : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500 transition disabled:opacity-50"
            disabled={saving}
          >
            Save
          </button>
        </div>

        {/* CONFIRMATION MODAL */}
        {showConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-xl animate-fadeIn border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Confirm Save</h3>

              <p className="text-gray-700 mb-6">
                Are you sure you want to save changes to this record?
              </p>

              {error && <p className="text-red-600 mb-2">{error}</p>}

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500 transition disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}