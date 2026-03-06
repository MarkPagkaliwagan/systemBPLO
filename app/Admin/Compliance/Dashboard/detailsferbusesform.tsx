"use client";

import { IoClose } from "react-icons/io5";

interface DetailsFerBusesFormProps {
  violation: any;
  onClose: () => void;
}

export default function DetailsFerBusesForm({ violation, onClose }: DetailsFerBusesFormProps) {
  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-right">{value ?? "-"}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 relative p-6">
      
      {/* Top Close Button */}
      <div className="flex justify-end mb-4 sticky top-0 bg-white z-10">
        <button
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 shadow-sm transition-all"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Section 1: Business Information */}
      <section className="mb-6">
        <h2 className="bg-gradient-to-r from-green-600 to-green-400 text-white text-center py-2 rounded-xl font-bold text-lg mb-4 shadow-sm">
          Business Information
        </h2>
        <div className="space-y-2 px-2">
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
        <h2 className="bg-gradient-to-r from-green-600 to-green-400 text-white text-center py-2 rounded-xl font-bold text-lg mb-4 shadow-sm">
          Notice Timeline
        </h2>
        <div className="space-y-2 px-2">
          <InfoRow label="Notice 1" value="Sent March 4, 2026" />
          <InfoRow label="Notice 2" value="Sent March 2, 2026" />
          <InfoRow label="Notice 3" value="Sent March 7, 2026" />
        </div>
      </section>

      {/* Section 3: Countdown Timer */}
      <section>
        <h2 className="bg-gradient-to-r from-green-600 to-green-400 text-white text-center py-2 rounded-xl font-bold text-lg mb-4 shadow-sm">
          Countdown Timer
        </h2>
        <div className="space-y-2 px-2">
          <InfoRow label="Overall Deadline" value="March 10, 2026" />
          <InfoRow label="Days Remaining" value="0" />
        </div>
      </section>
    </div>
  );
}