"use client";

import { IoClose } from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  
  // Custom row component to mimic the screenshot's "Label : Value" alignment
  const InfoRow = ({ label, value, isStatus = false }: { label: string; value: any; isStatus?: boolean }) => (
    <div className="flex justify-between items-center py-1.5 text-[14px]">
      <span className="text-gray-400 font-normal">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-gray-400">:</span>
        {isStatus ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            <span className="text-gray-700">{value ?? "Pending"}</span>
          </div>
        ) : (
          <span className="text-gray-700 font-normal min-w-[120px] text-right">
            {value ?? "-"}
          </span>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mt-4 mb-2 border-b border-gray-100 pb-2">
      <h3 className="text-gray-400 font-medium text-base">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-[850px] overflow-hidden border border-gray-100 relative p-8 font-sans">
      
      {/* Top Close Button - Minimalist Style */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <IoClose size={24} />
      </button>

      {/* Landscape Grid: 2 Columns */}
      <div className="grid grid-cols-2 gap-x-12">
        
        {/* Left Column: Primary Details */}
        <div className="flex flex-col space-y-1">
          <InfoRow label="Business ID" value={violation.business_id ?? "6"} />
          <InfoRow label="Business Name" value={violation.buses?.business_name ?? "IJKL Company"} />
          <InfoRow label="Violation Type" value="Fire Safety" />
          <InfoRow label="Violation Date" value="March 4, 2026" />
          <InfoRow label="Deadline" value="February 28, 2026" />
          <InfoRow label="Status" value={violation.status} isStatus={true} />
          <InfoRow label="Days Remaining" value="0" />
        </div>

        {/* Right Column: Timeline & Countdown */}
        <div className="flex flex-col">
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
             
