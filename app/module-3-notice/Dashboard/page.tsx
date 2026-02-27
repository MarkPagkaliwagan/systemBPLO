"use client";

import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
} from "react-icons/fi";

export default function DashboardPage() {
  const router = useRouter();

  // Placeholder state simulation
  const stats = [
    { label: "Total Active Violations", icon: <FiLayers size={20} />, value: null },
    { label: "Notice 1", icon: <FiInfo size={20} />, value: null },
    { label: "Notice 2", icon: <FiAlertCircle size={20} />, value: null },
    { label: "Notice 3", icon: <FiShield size={20} />, value: null },
    { label: "Cease & Desist", icon: <FiSlash size={20} />, value: null },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Compliance Notice Management
          </h1>
          <p className="mt-2 text-neutral-500 sm:text-lg max-w-2xl">
            Monitor violation stages and track compliance status with clarity and focus.
          </p>
        </div>
        <button
          onClick={() => router.push("/module-3-notice/Aging")}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded shadow transition-all duration-200"
        >
          List of Aging Notice
        </button>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-neutral-200 rounded-lg">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="py-3 px-6 text-left">BUSINESS ID</th>
                <th className="py-3 px-6 text-left">NOTICE 1</th>
                <th className="py-3 px-6 text-left">NOTICE 2</th>
                <th className="py-3 px-6 text-left">NOTICE 3</th>
                <th className="py-3 px-6 text-left">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3 px-6 text-neutral-400">
                      <div className="h-4 w-12 bg-neutral-200 rounded animate-pulse"></div>
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