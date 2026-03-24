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
  tableName, // table name for supabase
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

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  if (!open || !data) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from(tableName)
        .update(formData)
        .eq("id", data.id); // assuming each row has an 'id' column

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Business Full Details</h2>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <div className="text-gray-500 text-xs">{key}</div>
              <input
                type="text"
                value={
                  typeof value === "string" || typeof value === "number"
                    ? value
                    : JSON.stringify(value)
                }
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full border rounded px-2 py-1 text-gray-900 text-sm"
              />
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 bg-green-900 text-white rounded-lg"
          >
            Save
          </button>
        </div>

        {/* CONFIRMATION MODAL */}
        {showConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-lg">
              <h3 className="text-lg font-bold mb-4">Confirm Save</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to save changes to this record?
              </p>
              {error && <p className="text-red-600 mb-2">{error}</p>}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-900 text-white rounded-lg"
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