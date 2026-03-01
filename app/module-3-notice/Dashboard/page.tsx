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
    className={`min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 text-neutral-900 px-4 sm:px-6 py-8 ${
      isMobile ? "pt-16" : isCollapsed ? "pl-20" : "pl-80"
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
    <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
          Compliance Notice Management
        </h1>
        <p className="mt-2 text-neutral-600 sm:text-lg">
          Monitor violation stages and track compliance status.
        </p>
      </div>

      <button
        onClick={() => router.push("/module-3-notice/Aging")}
        className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
      >
        List of Aging Notice
      </button>
    </div>

    {/* Stats */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="group bg-white/70 backdrop-blur-md border border-green-100 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="p-4 rounded-xl bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
            {stat.icon}
          </div>

          <div className="flex flex-col w-full">
            <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">
              {stat.label}
            </span>
            <h2 className="text-2xl font-bold text-green-900 mt-1">
              {stat.value}
            </h2>
          </div>
        </div>
      ))}
    </div>

    {/* Escalation Table */}
    <div className="max-w-7xl mx-auto mt-14">
      <h2 className="text-2xl font-bold mb-6 text-green-800">
        Escalation Details
      </h2>

      <div className="overflow-x-auto rounded-2xl shadow-lg border border-green-100 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-linear-to-r from-green-700 to-green-600 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6 text-left">Business ID</th>
              <th className="py-4 px-6 text-left">Notice 1</th>
              <th className="py-4 px-6 text-left">Notice 2</th>
              <th className="py-4 px-6 text-left">Notice 3</th>
              <th className="py-4 px-6 text-left">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-green-100">
            {violations.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-green-50 transition-colors duration-200"
              >
                <td className="py-4 px-6 font-medium text-green-900">
                  {v.business_id}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 1 ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Sent
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 2 ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Sent
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6">
                  {v.notice_level >= 3 ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Sent
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      v.status === "cease_desist"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
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
);}