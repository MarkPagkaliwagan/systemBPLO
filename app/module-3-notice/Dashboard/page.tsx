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
    className={`min-h-screen bg-slate-100 text-slate-800 transition-all duration-300 ${
      isMobile
        ? "pt-16 px-4"
        : isCollapsed
        ? "pl-20 px-8 py-8"
        : "pl-80 px-8 py-8"
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
    <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Compliance Notice Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of violation escalation status.
        </p>
      </div>

      <button
        onClick={() => router.push("/module-3-notice/Aging")}
        className="text-sm bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md transition"
      >
        View Aging Notices
      </button>
    </div>

    {/* Stats */}
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-md px-4 py-4 flex items-center gap-3 hover:bg-slate-50 transition"
        >
          <div className="text-slate-500">{stat.icon}</div>

          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-lg font-semibold text-slate-800 mt-1">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="max-w-6xl mx-auto mt-10">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Escalation Details
      </h2>

      <div className="overflow-x-auto border border-slate-200 rounded-md bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="py-3 px-5 text-left font-medium">
                Business ID
              </th>
              <th className="py-3 px-5 text-left font-medium">
                Notice 1
              </th>
              <th className="py-3 px-5 text-left font-medium">
                Notice 2
              </th>
              <th className="py-3 px-5 text-left font-medium">
                Notice 3
              </th>
              <th className="py-3 px-5 text-left font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {violations.map((v) => (
              <tr
                key={v.id}
                className="hover:bg-slate-50 transition"
              >
                <td className="py-3 px-5 font-medium">
                  {v.business_id}
                </td>

                <td className="py-3 px-5 text-slate-600">
                  {v.notice_level >= 1 ? "Sent" : "-"}
                </td>

                <td className="py-3 px-5 text-slate-600">
                  {v.notice_level >= 2 ? "Sent" : "-"}
                </td>

                <td className="py-3 px-5 text-slate-600">
                  {v.notice_level >= 3 ? "Sent" : "-"}
                </td>

                <td className="py-3 px-5 capitalize">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
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
);}