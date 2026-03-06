"use client";

import { IoClose } from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  
  const InfoRow = ({ label, value, isStatus = false }: { label: string; value: any; isStatus?: boolean }) => (
    <div className="flex justify-between items-center py-2 text-[14px] group">
      <span className="text-gray-500 font-medium tracking-tight">{label}</span>
      <div className="flex items-center">
        <span className="text-gray-300 mr-4">:</span>
        {isStatus ? (
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider">
              {value ?? "Pending"}
            </span>
          </div>
        ) : (
          <span className="text-gray-800 font-semibold text-right tabular-nums">
            {value ?? "-"}
          </span>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mt-8 mb-4 border-b border-gray-100 pb-2">
      <h3 className="text-gray-400 font-bold text-xs uppercase tracking-[0.1em]">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-[900px] overflow-hidden border border-gray-100 relative p-10 font-sans animate-in fade-in zoom-in duration-300">
      
      {/* Top Close Button - Elevated & Accessible */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 hover:bg-gray-50 p-2 rounded-full transition-all duration-200"
        aria-label="Close details"
      >
        <IoClose size={24} />
      </button>

      {/* Landscape Grid: 2 Columns with Divider */}
      <div className="grid grid-cols-2 gap-x-16 divide-x divide-gray-100">
        
        {/* Left Column: Primary Details */}
        <div className="flex flex-col space-y-1">
          <SectionHeader title="Business Information" />
          <InfoRow label="Business ID" value={violation.business_id ?? "6"} />
          <InfoRow label="Business Name" value={violation.buses?.business_name ?? "IJKL Company"} />
          <InfoRow label="Violation Type" value="Fire Safety" />
          <InfoRow label="Violation Date" value="March 4, 2026" />
          <InfoRow label="Deadline" value="February 28, 2026" />
          <InfoRow label="Status" value={violation.status} isStatus={true} />
          <InfoRow label="Days Remaining" value="0" />
        </div>

        {/* Right Column: Timeline & Countdown */}
        <div className="flex flex-col pl-16">
          <SectionHeader title="Notice Timeline" />
          <div className="space-y-1">
            <InfoRow label="Notice 1" value="Sent March 4, 2026" />
            <InfoRow label="Notice 2" value="Sent March 02, 2026" />
            <InfoRow label="Notice 3" value="Sent March 07, 2026" />
          </div>

          <SectionHeader title="Countdown Timer" />
          <div className="space-y-1">
            <InfoRow label="Overall Deadline" value="March 10, 2026" />
            <InfoRow label="Days Remaining" value="0" />
          </div>
        </div>

      </div>
    </div>
  );
}