"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
} from "react-icons/fi";
import Sidebar from "../../module-2-inspection/components/sidebar/page";
import { supabase } from "@/lib/supabaseClient";

interface Violation {
  id: number;
  business_id: number;
  notice_level: number;
  status: string;
}

interface Stat {
  label: string;
  icon: JSX.Element;
  value: number;
}

export default function DashboardPage() {
  const router = useRouter();
const [isCollapsed, setIsCollapsed] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  handleResize(); // check on first load
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total Active Violations", icon: <FiLayers size={20} />, value: 0 },
    { label: "Notice 1", icon: <FiInfo size={20} />, value: 0 },
    { label: "Notice 2", icon: <FiAlertCircle size={20} />, value: 0 },
    { label: "Notice 3", icon: <FiShield size={20} />, value: 0 },
    { label: "Cease & Desist", icon: <FiSlash size={20} />, value: 0 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("violations")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;

    setViolations(data as Violation[]);

    const totalActive = data.filter(v => v.status === "open").length;
    const notice1 = data.filter(v => v.notice_level === 1).length;
    const notice2 = data.filter(v => v.notice_level === 2).length;
    const notice3 = data.filter(v => v.notice_level === 3).length;
    const cease = data.filter(v => v.status === "cease_desist").length;

    setStats([
      { label: "Total Active Violations", icon: <FiLayers size={20} />, value: totalActive },
      { label: "Notice 1", icon: <FiInfo size={20} />, value: notice1 },
      { label: "Notice 2", icon: <FiAlertCircle size={20} />, value: notice2 },
      { label: "Notice 3", icon: <FiShield size={20} />, value: notice3 },
      { label: "Cease & Desist", icon: <FiSlash size={20} />, value: cease },
    ]);
  };

  return (
  <div
    className={`min-h-screen bg-slate-50 text-slate-800 transition-all duration-300 ${
      isMobile ? "pt-16 px-4" : isCollapsed ? "pl-20 px-6 py-10" : "pl-80 px-6 py-10"
    }`}
  >
    <Sidebar
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobile={isMobile}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />

    {/* Header */}
    <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-700">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-slate-500 max-w-xl">
          Monitor violation stages and track compliance status in real-time.
        </p>
      </div>

      <button
        onClick={() => router.push("/module-3-notice/Aging")}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
      >
        <FiLayers />
        List of Aging Notice
      </button>
    </div>

    {/* Stats */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="group bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="p-4 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all duration-300">
            {stat.icon}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <h2 className="text-2xl font-bold mt-1 text-slate-800 group-hover:text-emerald-700 transition">
              {stat.value}
            </h2>
          </div>
        </div>
      ))}
    </div>

    {/* Escalation Table */}
    <div className="max-w-7xl mx-auto mt-14">
      <h2 className="text-2xl font-bold mb-6 text-slate-700">
        Escalation Details
      </h2>

      <div className="overflow-x-auto rounded-2xl shadow-md border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-700 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 text-left">Business ID</th>
              <th className="py-4 px-6 text-left">Notice 1</th>
              <th className="py-4 px-6 text-left">Notice 2</th>
              <th className="py-4 px-6 text-left">Notice 3</th>
              <th className="py-4 px-6 text-left">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {violations.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-emerald-50 transition-colors duration-200"
              >
                <td className="py-4 px-6 font-medium text-slate-700">
                  {v.business_id}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 1 ? (
                    <span className="text-blue-600 font-medium">Sent</span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 2 ? (
                    <span className="text-amber-600 font-medium">Sent</span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 3 ? (
                    <span className="text-red-600 font-medium">Sent</span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6 capitalize font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      v.status === "open"
                        ? "bg-amber-100 text-amber-700"
                        : v.status === "cease_desist"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}