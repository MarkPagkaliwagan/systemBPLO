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
    {
      label: "Total Active Violations",
      value: 5,
      icon: <FiLayers size={22} />,
    },
    {
      label: "Notice 1",
      value: 2,
      icon: <FiInfo size={22} />,
    },
    {
      label: "Notice 2",
      value: 1,
      icon: <FiAlertCircle size={22} />,
    },
    {
      label: "Notice 3",
      value: 1,
      icon: <FiShield size={22} />,
    },
    {
      label: "Cease & Desist",
      value: 1,
      icon: <FiSlash size={22} />,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-500 max-w-xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Slim Stats Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-neutral-200 hover:border-neutral-400 transition-all duration-300 hover:shadow-md"
          >
            {/* Icon */}
            <div className="text-neutral-400 group-hover:text-neutral-700 transition">
              {stat.icon}
            </div>

            {/* Label and Value */}
            <div className="flex-1 flex justify-between ml-4">
              <span className="text-sm text-neutral-500 group-hover:text-neutral-700">
                {stat.label}
              </span>
              <span className="font-semibold text-lg">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}