"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import {
  FiAlertTriangle,
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
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total Active Violations", icon: <FiLayers size={20} />, value: 0 },
    { label: "Notice 1", icon: <FiInfo size={20} />, value: 0 },
    { label: "Notice 2", icon: <FiAlertTriangle size={20} />, value: 0 },
    { label: "Notice 3", icon: <FiShield size={20} />, value: 0 },
    { label: "Cease & Desist", icon: <FiSlash size={20} />, value: 0 },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase.from("violations").select("*");

    if (error) {
      console.error(error);
      return;
    }

    if (!data) return;

    setViolations(data as Violation[]);

    const totalActive = data.filter((v) => v.status === "open").length;
    const notice1 = data.filter((v) => v.notice_level === 1).length;
    const notice2 = data.filter((v) => v.notice_level === 2).length;
    const notice3 = data.filter((v) => v.notice_level === 3).length;
    const cease = data.filter((v) => v.status === "cease_desist").length;

    setStats([
      { label: "Total Active Violations", icon: <FiLayers size={20} />, value: totalActive },
      { label: "Notice 1", icon: <FiInfo size={20} />, value: notice1 },
      { label: "Notice 2", icon: <FiAlertTriangle size={20} />, value: notice2 },
      { label: "Notice 3", icon: <FiShield size={20} />, value: notice3 },
      { label: "Cease & Desist", icon: <FiSlash size={20} />, value: cease },
    ]);
  };

  const getStatusBadge = (status: string) => {
    if (status === "open")
      return "bg-emerald-100 text-emerald-700";
    if (status === "cease_desist")
      return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div
      className={`min-h-screen bg-[#0f1f17] text-gray-100 px-6 py-10 transition-all duration-300 ${
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

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-emerald-400">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-gray-400">
            Monitor violation stages and track compliance status.
          </p>
        </div>

        <button
          onClick={() => router.push("/module-3-notice/Aging")}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all duration-200 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg"
        >
          View Aging Notice
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#13271d] border border-emerald-900/40 rounded-xl p-6 flex items-center gap-4 
            hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20
            transition-all duration-300 cursor-pointer group"
          >
            <div className="p-3 rounded-lg bg-emerald-900/40 text-emerald-400 group-hover:scale-110 transition">
              {stat.icon}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
              <h2 className="text-2xl font-bold text-white mt-1">
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto mt-14">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-6">
          Escalation Details
        </h2>

        <div className="overflow-x-auto rounded-xl border border-emerald-900/40">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#163126] text-emerald-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Business ID</th>
                <th className="px-6 py-4">Notice 1</th>
                <th className="px-6 py-4">Notice 2</th>
                <th className="px-6 py-4">Notice 3</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-emerald-900/30">
              {violations.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-emerald-900/20 transition-all duration-200"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {v.business_id}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {v.notice_level >= 1 ? "Sent" : "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {v.notice_level >= 2 ? "Sent" : "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {v.notice_level >= 3 ? "Sent" : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                        v.status
                      )}`}
                    >
                      {v.status.replace("_", " ")}
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