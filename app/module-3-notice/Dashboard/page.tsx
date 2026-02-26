"use client";

import React from "react";
import {
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
} from "react-icons/fi";

type Stat = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string; 
};

export default function DashboardPage() {
  const stats: Stat[] = [
    { label: "Total Active Violations", value: 5, icon: <FiLayers size={18} />, accent: "bg-indigo-500" },
    { label: "Notice 1", value: 2, icon: <FiInfo size={18} />, accent: "bg-emerald-500" },
    { label: "Notice 2", value: 1, icon: <FiAlertCircle size={18} />, accent: "bg-amber-500" },
    { label: "Notice 3", value: 1, icon: <FiShield size={18} />, accent: "bg-rose-500" },
    { label: "Cease & Desist", value: 1, icon: <FiSlash size={18} />, accent: "bg-sky-500" },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 px-4 py-8 sm:px-8 sm:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Compliance Notice Management</h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-500 max-w-xl">
            Monitor violation stages and track compliance status with clarity and focus.
          </p>
        </header>

        {/* Slim, single-line stat cards */}
        <section
          aria-label="summary stats"
          className="flex gap-3 overflow-x-auto pb-2"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              tabIndex={0}
              role="article"
              aria-label={`${stat.label}: ${stat.value}`}
              className="flex items-center justify-between h-12 sm:h-14 bg-white rounded-xl border border-neutral-200 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 min-w-[180px] flex-shrink-0"
            >
              {/* Accent bar */}
              <div className={`w-1 h-full rounded-l-xl ${stat.accent ?? "bg-neutral-300"}`} />

              {/* Content (single line) */}
              <div className="flex-1 px-3 flex items-center justify-between min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center rounded-md bg-neutral-100 p-2">
                    {stat.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-neutral-500 whitespace-nowrap truncate" title={stat.label}>
                      {stat.label}
                    </p>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0 text-right">
                  <p className="text-lg sm:text-2xl font-semibold tracking-tight whitespace-nowrap">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}