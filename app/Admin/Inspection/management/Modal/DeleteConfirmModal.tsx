// app/module-2-inspection/Review Modal/DeleteConfirmModal.tsx
"use client";

import { useState } from "react";
import { FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

interface DeleteConfirmModalProps {
  recordId: string;
  businessName: string;
  bin: string;
  onClose: () => void;
  onDeleted: (bin: string) => void;
  isMobile: boolean;
}

export default function DeleteConfirmModal({
  recordId,
  businessName,
  bin,
  onClose,
  onDeleted,
  isMobile,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User must type the BIN to confirm — prevents accidental deletes
  const isConfirmed = confirmText.trim() === bin.trim();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError(null);
    try {
      const { error: sbError } = await supabase
        .from("business_records")
        .delete()
        .eq("Business Identification Number", bin);

      if (sbError) throw new Error(sbError.message);

      onDeleted(bin);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Delete failed. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
          isMobile ? "w-full" : "w-full max-w-md"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Delete Record</h2>
                <p className="text-red-100 text-xs">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Warning banner */}
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              You are about to <strong>permanently delete</strong> this record from the database.
              All associated data will be lost and cannot be recovered.
            </p>
          </div>

          {/* Record summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 space-y-1">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 shrink-0 w-28">Business Name</span>
              <span className="font-semibold text-gray-800 break-words">{businessName}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-500 shrink-0 w-28">BIN</span>
              <span className="font-mono font-semibold text-gray-800">{bin}</span>
            </div>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Type the BIN to confirm deletion
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={bin}
              disabled={isDeleting}
              className={`w-full px-3 py-2.5 text-sm font-mono border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${
                confirmText && !isConfirmed
                  ? "border-red-300 bg-red-50 text-red-700"
                  : isConfirmed
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-300 text-gray-900"
              }`}
            />
            {confirmText && !isConfirmed && (
              <p className="text-xs text-red-500 mt-1">BIN does not match</p>
            )}
            {isConfirmed && (
              <p className="text-xs text-green-600 mt-1 font-medium">✓ BIN confirmed — ready to delete</p>
            )}
          </div>

          {/* Supabase error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <FiAlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!isConfirmed || isDeleting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                !isConfirmed || isDeleting
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 shadow"
              }`}
            >
              <FiTrash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}