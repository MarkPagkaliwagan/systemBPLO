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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-12 py-14">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Compliance Notice Management
        </h1>
        <p className="mt-3 text-neutral-500 max-w-xl">
          Monitor violation stages and track compliance status with clarity and focus.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl p-8 border border-neutral-200 hover:border-neutral-400 transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-neutral-700 transition">
              {stat.icon}
              <span className="text-xs uppercase tracking-widest">
                Status
              </span>
            </div>

            <h2 className="mt-8 text-4xl font-semibold tracking-tight">
              {stat.value}
            </h2>

            <p className="mt-2 text-sm text-neutral-500 group-hover:text-neutral-700 transition">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}