"use client";

import { IoClose, IoArrowBack } from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 font-medium">{label}</span>
      <div className="flex gap-2">
        <span className="text-gray-600">:</span>
        <span className="text-gray-800 font-semibold min-w-[120px] text-right">
          {value ?? "-"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 relative p-6">
      
      {/* Top Close & Back Buttons */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-gray-600 hover:text-black font-medium"
        >
          <IoArrowBack size={20} /> Back
        </button>
        <button
          onClick={onClose}
          className="bg-white rounded-full p-1 text-gray-500 hover:text-black shadow-md border"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Section 1: Business Information */}
      <section className="mb-6">
        <div className="bg-[#065f46] text-white text-center py-2 rounded-lg font-bold text-lg mb-4">
          Business Information
        </div>
        <div className="space-y-1 px-2">
          <InfoRow label="Business ID" value={violation.business_id ?? violation.id} />
          <InfoRow label="Business Name" value={violation.buses?.business_name} />
          <InfoRow label="Violation Type" value="Fire Safety" />
          <InfoRow label="Violation Date" value="March 4, 2026" />
          <InfoRow label="Deadline" value="February 28, 2026" />
          <InfoRow label="Status" value={violation.status} />
          <InfoRow label="Days Remaining" value="0" />
        </div>
      </section>

      {/* Section 2: Notice Timeline */}
      <section className="mb-6">
        <div className="bg-[#065f46] text-white text-center py-2 rounded-lg font-bold text-lg mb-4">
          Notice Timeline
        </div>
        <div className="space-y-1 px-2">
          <InfoRow label="Notice 1" value="Sent March 4, 2026" />
          <InfoRow label="Notice 2" value="Sent March 02, 2026" />
          <InfoRow label="Notice 3" value="Sent March 07, 2026" />
        </div>
      </section>

      {/* Section 3: Countdown Timer */}
      <section className="mb-6">
        <div className="bg-[#065f46] text-white text-center py-2 rounded-lg font-bold text-lg mb-4">
          Countdown Timer
        </div>
        <div className="space-y-1 px-2">
          <InfoRow label="Overall Deadline" value="March 10, 2026" />
          <InfoRow label="Days Remaining" value="0" />
        </div>
      </section>
    </div>
  );
}