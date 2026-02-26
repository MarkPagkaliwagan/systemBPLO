"use client";

import {
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
} from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
    { label: "Total Active Violations", icon: <FiLayers size={24} />, value: null },
    { label: "Notice 1", icon: <FiInfo size={24} />, value: null },
    { label: "Notice 2", icon: <FiAlertCircle size={24} />, value: null },
    { label: "Notice 3", icon: <FiShield size={24} />, value: null },
    { label: "Cease & Desist", icon: <FiSlash size={24} />, value: null },
  ];

  const tableData = Array.from({ length: 4 }).map(() => ({
    businessId: null,
    notice1: null,
    notice2: null,
    notice3: null,
    status: null,
  }));

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-500 sm:text-lg max-w-2xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center transition-colors duration-300 hover:bg-green-100 hover:text-green-600">
              {stat.icon}
            </div>
            <div className="flex flex-col w-full">
              <span className="text-xs text-neutral-400 uppercase tracking-widest">
                {stat.label}
              </span>
              {stat.value !== null ? (
                <h2 className="text-xl font-semibold text-neutral-900 mt-1">
                  {stat.value}
                </h2>
              ) : (
                <div className="h-6 w-12 bg-neutral-200 rounded animate-pulse mt-1"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Table */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-4">Escalation Details</h2>
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <table className="min-w-full bg-white border border-neutral-200 text-sm sm:text-base">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">BUSINESS ID</th>
                <th className="py-3 px-4 text-left">NOTICE 1</th>
                <th className="py-3 px-4 text-left">NOTICE 2</th>
                <th className="py-3 px-4 text-left">NOTICE 3</th>
                <th className="py-3 px-4 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-neutral-50 transition-colors sm:table-row block sm:table-row-group"
                >
                  {Object.values(row).map((cell, j) => (
                    <td
                      key={j}
                      className="py-3 px-4 text-neutral-400 relative sm:table-cell block sm:table-cell"
                      data-label={["BUSINESS ID", "NOTICE 1", "NOTICE 2", "NOTICE 3", "STATUS"][j]}
                    >
                      {cell !== null ? (
                        cell
                      ) : (
                        <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse"></div>
                      )}
                      {/* Mobile label */}
                      <span className="sm:hidden absolute left-0 top-0 px-2 py-1 text-xs font-semibold text-neutral-500">
                        {["BUSINESS ID", "NOTICE 1", "NOTICE 2", "NOTICE 3", "STATUS"][j]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}