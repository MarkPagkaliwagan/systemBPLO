"use client";

import { useRouter } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiInfo,
  FiShield,
  FiSlash,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import Sidebar from "../../module-2-inspection/components/sidebar/page";
import { supabase } from "@/lib/supabaseClient";

interface Violation {
  id: number;
  business_id: number | null;
  notice_level: number;
  status: string;
  penalty_amount: number;
  buses: {
    business_name: string;
  } | null;
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
  const [stats, setStats] = useState<Stat[]>([]);

  // Responsive
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
    const { data, error } = await supabase.from("violations").select(`
        id,
        business_id,
        notice_level,
        status,
        penalty_amount,
        buses (
          business_name
        )
      `);

    if (error) {
      console.error("Error fetching violations:", error);
      return;
    }

    if (!data) return;

    const typedData = data as unknown as Violation[];
    setViolations(typedData);

    // Stats Computation
    const totalActive = typedData.filter((v) => v.status === "open").length;
    const notice1 = typedData.filter((v) => v.notice_level === 1).length;
    const notice2 = typedData.filter((v) => v.notice_level === 2).length;
    const notice3 = typedData.filter((v) => v.notice_level === 3).length;
    const cease = typedData.filter((v) => v.status === "cease_desist").length;
    const resolved = typedData.filter((v) => v.status === "resolved").length;

    setStats([
      {
        label: "Total Active Violations",
        icon: <FiLayers size={20} />,
        value: totalActive,
      },
      { label: "Notice 1", icon: <FiInfo size={20} />, value: notice1 },
      {
        label: "Notice 2",
        icon: <FiAlertTriangle size={20} />,
        value: notice2,
      },
      { label: "Notice 3", icon: <FiShield size={20} />, value: notice3 },
      { label: "Cease & Desist", icon: <FiSlash size={20} />, value: cease },
      { label: "Resolved", icon: <FiCheckCircle size={20} />, value: resolved },
    ]);
  };

  const getStatusBadge = (status: string) => {
    if (status === "open") return "bg-green-100 text-green-700";
    if (status === "cease_desist") return "bg-red-100 text-red-600";
    if (status === "resolved") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  const getNoticeBadge = (
    requiredLevel: number,
    currentLevel: number,
    status: string
  ) => {
    if (status === "resolved")
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          -
        </span>
      );
    if (currentLevel >= requiredLevel)
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
          Sent
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isMobile ? "pt-16" : isCollapsed ? "ml-20" : "ml-80"
      }`}>
        <div className="p-4 md:p-6 lg:p-10">
          {/* HEADER */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-800">
                  Compliance Dashboard
                </h1>
                <p className="mt-2 text-gray-600 text-sm md:text-base">
                  Monitor violation stages and track compliance status.
                </p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="mb-8 md:mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:border-green-600 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2 md:p-3 rounded-lg bg-green-50 text-green-700 flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      {stat.label}
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ESCALATION DETAILS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-green-800 mb-4 md:mb-6">
              Escalation Details
            </h2>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-green-800 text-white uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4">Business ID</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Business Name</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Notice 1</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Notice 2</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Notice 3</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Penalty</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {violations.map((v) => (
                      <tr key={v.id} className="hover:bg-green-50 transition">
                        <td className="px-4 md:px-6 py-3 md:py-4 font-medium">
                          {v.business_id}
                        </td>

                        <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-green-800">
                          {v.buses?.business_name ?? "No Business"}
                        </td>

                        <td className="px-4 md:px-6 py-3 md:py-4">
                          {getNoticeBadge(1, v.notice_level, v.status)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          {getNoticeBadge(2, v.notice_level, v.status)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          {getNoticeBadge(3, v.notice_level, v.status)}
                        </td>

                        <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-red-600">
                          ₱ {v.penalty_amount?.toLocaleString() ?? "0"}
                        </td>

                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span
                            className={`px-2 md:px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
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

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden space-y-3 md:space-y-4">
              {violations.map((v) => (
                <div
                  key={v.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-1">Business ID</p>
                      <p className="font-semibold text-sm truncate">{v.business_id}</p>
                    </div>

                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${getStatusBadge(
                        v.status
                      )}`}
                    >
                      {v.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Business Name</p>
                    <p className="font-semibold text-green-800 text-sm">
                      {v.buses?.business_name ?? "No Business"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notice 1</p>
                      {getNoticeBadge(1, v.notice_level, v.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notice 2</p>
                      {getNoticeBadge(2, v.notice_level, v.status)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notice 3</p>
                      {getNoticeBadge(3, v.notice_level, v.status)}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Penalty Amount</p>
                    <p className="font-bold text-red-600 text-sm">
                      ₱ {v.penalty_amount?.toLocaleString() ?? "0"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}