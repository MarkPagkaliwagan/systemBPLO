// app/module-2-inspection/filters/masterlist-filters/page.tsx
"use client";

import { FiFilter } from "react-icons/fi";

interface MasterlistFiltersProps {
  selectedStatus: string;
  selectedPeriod: string;
  onStatusChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  availablePeriods: string[];
}

export default function MasterlistFilters({
  selectedStatus,
  selectedPeriod,
  onStatusChange,
  onPeriodChange,
  availablePeriods = [] // Add default empty array
}: MasterlistFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <FiFilter className="w-4 h-4 text-gray-500" />
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Periods</option>
            {availablePeriods && availablePeriods.length > 0 && availablePeriods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="not_reviewed">Not Reviewed</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            
          </select>
        </div>
      </div>
    </div>
  );
}