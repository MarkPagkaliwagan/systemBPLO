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
    { label: "Total Active Violations", value: 5, icon: <FiLayers size={20} /> },
    { label: "Notice 1", value: 2, icon: <FiInfo size={20} /> },
    { label: "Notice 2", value: 1, icon: <FiAlertCircle size={20} /> },
    { label: "Notice 3", value: 1, icon: <FiShield size={20} /> },
    { label: "Cease & Desist", value: 1, icon: <FiSlash size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-500 sm:text-lg max-w-2xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Stats - Single Line, Scrollable on Small Screens */}
      <div className="max-w-6xl mx-auto flex gap-4 overflow-x-auto scrollbar-hide">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-shrink-0 bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300 min-w-[180px]"
          >
            {/* Icon */}
            <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 group-hover:text-neutral-800 transition">
              {stat.icon}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="text-xs text-neutral-400 uppercase tracking-widest">
                {stat.label}
              </span>
              <h2 className="text-xl font-semibold text-neutral-900 mt-1">
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}