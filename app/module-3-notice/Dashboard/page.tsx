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
    { label: "Total Active Violations", icon: <FiLayers />, value: null },
    { label: "Notice 1", icon: <FiInfo />, value: null },
    { label: "Notice 2", icon: <FiAlertCircle />, value: null },
    { label: "Notice 3", icon: <FiShield />, value: null },
    { label: "Cease & Desist", icon: <FiSlash />, value: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900 px-4 sm:px-6 py-8 sm:py-10 overflow-x-hidden">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 sm:mb-14">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-500 sm:text-lg max-w-2xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-neutral-200 p-5 flex items-center gap-4
                       transition-all duration-300
                       hover:shadow-xl hover:-translate-y-1 hover:border-green-600"
          >
            {/* Icon */}
            <div
              className="p-3 rounded-xl bg-neutral-100 text-neutral-600
                         transition-all duration-300
                         group-hover:bg-green-600 group-hover:text-white group-hover:scale-110"
            >
              {stat.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col w-full overflow-hidden">
              <span className="text-[11px] sm:text-xs text-neutral-400 uppercase tracking-wider truncate">
                {stat.label}
              </span>

              {stat.value !== null ? (
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mt-1">
                  {stat.value}
                </h2>
              ) : (
                <div className="h-6 w-14 bg-neutral-200 rounded animate-pulse mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Escalation Table */}
      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Escalation Details
        </h2>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left whitespace-nowrap">BUSINESS ID</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">NOTICE 1</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">NOTICE 2</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">NOTICE 3</th>
                  <th className="py-3 px-4 text-left whitespace-nowrap">STATUS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr
                    key={i}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td
                        key={j}
                        className="py-3 px-4 text-neutral-400"
                      >
                        <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}