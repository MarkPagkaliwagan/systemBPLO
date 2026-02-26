"use client";

import {
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
} from "react-icons/fi";

export default function DashboardPage() {
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

      {/* Stats - Responsive Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
            <FiLayers size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">
              Total Active Violations
            </span>
            <h2 className="text-xl font-semibold text-neutral-900 mt-1">
              5
            </h2>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
            <FiInfo size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">
              Notice 1
            </span>
            <h2 className="text-xl font-semibold text-neutral-900 mt-1">
              2
            </h2>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
            <FiAlertCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">
              Notice 2
            </span>
            <h2 className="text-xl font-semibold text-neutral-900 mt-1">
              1
            </h2>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
            <FiShield size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">
              Notice 3
            </span>
            <h2 className="text-xl font-semibold text-neutral-900 mt-1">
              1
            </h2>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-xl border border-neutral-200 px-6 py-4 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 transition">
            <FiSlash size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">
              Cease & Desist
            </span>
            <h2 className="text-xl font-semibold text-neutral-900 mt-1">
              1
            </h2>
          </div>
        </div>
      </div>
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
        {/* Placeholder rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <tr key={i} className="hover:bg-neutral-50">
            <td className="py-3 px-6 text-neutral-400">-</td>
            <td className="py-3 px-6 text-neutral-400">-</td>
            <td className="py-3 px-6 text-neutral-400">-</td>
            <td className="py-3 px-6 text-neutral-400">-</td>
            <td className="py-3 px-6 text-neutral-400">-</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}