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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-500 max-w-xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Full-width Single-line Slim Stats */}
      <div className="flex max-w-full mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-center bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-md transition-all duration-300 px-4 py-3"
            style={{ flex: 1 }}
          >
            <div className="flex items-center justify-between w-full">
              {/* Icon */}
              <div className="text-neutral-400 group-hover:text-neutral-700 transition mr-2">
                {stat.icon}
              </div>
              {/* Label */}
              <span className="text-sm text-neutral-500 group-hover:text-neutral-700 truncate">
                {stat.label}
              </span>
              {/* Value */}
              <span className="font-semibold text-lg ml-2">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}