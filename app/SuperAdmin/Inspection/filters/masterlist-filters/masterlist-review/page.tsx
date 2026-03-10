// app/module-2-inspection/filters/masterlist-filters/page.tsx
"use client";

import { FiFilter } from "react-icons/fi";

interface MasterlistFiltersProps {
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

export default function MasterlistFilters({
  selectedStatus,
  onStatusChange,
}: MasterlistFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <FiFilter className="w-4 h-4 text-gray-500" />
        <label className="text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent "
        >
          <option value="" >All Status</option>
          <option value="not_reviewed">Not Reviewed</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}