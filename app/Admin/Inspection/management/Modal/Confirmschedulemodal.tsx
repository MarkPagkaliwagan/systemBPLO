// app/module-2-inspection/Review Modal/ConfirmScheduleModal.tsx
"use client";

import { CheckCircle, Calendar, X } from "lucide-react";

interface ConfirmScheduleModalProps {
  isOpen: boolean;
  businessName: string;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function ConfirmScheduleModal({
  isOpen,
  businessName,
  onConfirm,
  onSkip,
}: ConfirmScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">
            Proceed to Scheduling?
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Do you want to schedule an inspection for{" "}
            <span className="font-semibold text-slate-700">{businessName}</span>?
          </p>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-6 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors active:scale-95 shadow-md shadow-green-100"
          >
            <CheckCircle size={18} />
            Yes, Schedule Now
          </button>
          <button
            onClick={onSkip}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors active:scale-95"
          >
            <X size={18} />
            No, Skip for Now
          </button>
        </div>

      </div>
    </div>
  );
}