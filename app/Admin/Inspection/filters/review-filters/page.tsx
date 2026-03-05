"use client";

import { FiSearch } from "react-icons/fi";

interface ReviewFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ReviewFilters({
  searchTerm,
  onSearchChange
}: ReviewFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <FiSearch className="w-4 h-4 text-gray-500" />
        <h3 className="text-base font-semibold text-gray-900">Search Filters</h3>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search across all columns and data..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <FiSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      </div>
      
      {searchTerm && (
        <div className="mt-2 text-xs text-gray-500">
          Searching for: "{searchTerm}"
        </div>
      )}
    </div>
  );
}