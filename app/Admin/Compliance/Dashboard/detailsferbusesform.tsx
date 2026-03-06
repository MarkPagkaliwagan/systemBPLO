"use client";

import { IoClose } from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  // Updated row to match the "Label : Value" style with specific spacing
  const InfoRow = ({ label, value, isStatus = false }: { label: string; value: any; isStatus?: boolean }) => (
    <div className="flex justify-between items-center py-2 text-[15px]">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-700">:</span>
        {isStatus ? (
          <div className="flex items-center gap-2 text-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-200"></span>
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-gray-800 text-right">{value ?? "-"}</span>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mt-6 mb-2 border-b border-gray-100 pb-2">
      <h3 className="text-gray-400 font-medium text-lg">{title}</h3>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-[450px] max-h-[90vh] overflow-y-auto border border-gray-100 relative p-8 flex flex-col font-sans">
      
      {/* Close Button - Clean and subtle per screenshot */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <IoClose size={28} strokeWidth={1} />
      </button>

      {/* Main Content - Single Column Layout */}
      <div className="flex flex-col space-y-1">
        <InfoRow label="Business ID" value={violation.business_id ?? violation.id} />
        <InfoRow label="Business Name" value={violation.buses?.business_name ?? "IJKL Company"} />
        <InfoRow label="Violation Type" value="Fire Safety" />
        <InfoRow label="Violation Date" value="March 4, 2026" />
        <InfoRow label="Deadline" value="February 28, 2026" />
        <InfoRow label="Status" value={violation.status ?? "Pending"} isStatus={true} />
        <InfoRow label="Days Remaining" value="0" />

        <SectionHeader title="Notice Timeline" />
        <InfoRow label="Notice 1" value="Sent March 4, 2026" />
        <InfoRow label="Notice 2" value="Sent March 02, 2026" />
        <InfoRow label="Notice 3" value="Sent March 07, 2026" />

        <SectionHeader title="Countdown Timer" />
        <InfoRow label="Overall Deadline" value="March 10, 2026" />
      </div>
    </div>
  );
}