"use client";

import { FiX } from "react-icons/fi";

export default function DetailsForBusinessFormModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: any;
}) {
  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Business Full Details
          </h2>
          <button onClick={onClose}>
            <FiX className="text-xl" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div className="text-gray-500 text-xs">{key}</div>
              <div className="font-medium text-gray-900 break-words">
                {value ? value.toString() : "N/A"}
              </div>
            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-900 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}