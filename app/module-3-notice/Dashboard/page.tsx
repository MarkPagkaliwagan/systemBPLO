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
<<<<<<< HEAD
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
=======

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
>>>>>>> 6210db3de46fbee59d7f6668a10ab6a3234907c6
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

<<<<<<< HEAD
  return (
    <div className={`min-h-screen bg-neutral-50 text-neutral-900 px-6 py-10 ${isMobile ? 'pt-16' : (isCollapsed ? 'pl-20' : 'pl-80')
      }`}>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
=======
  // Status badge colors
  const getStatusBadge = (status: string) => {
    if (status === "open") return "bg-green-100 text-green-700";
    if (status === "cease_desist") return "bg-red-100 text-red-600";
    if (status === "resolved") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };
>>>>>>> 6210db3de46fbee59d7f6668a10ab6a3234907c6

  // Notice status badge
  const getNoticeBadge = (
    requiredLevel: number,
    currentLevel: number,
    status: string
  ) => {
    if (status === "resolved") return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">-</span>;
    if (currentLevel >= requiredLevel) return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Sent</span>;
    return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pending</span>;
  };

  return (
    <div
      className={`min-h-screen bg-white text-gray-900 px-6 py-10 transition-all duration-300 ${
        isMobile ? "pt-20" : isCollapsed ? "pl-20" : "pl-80"
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
          <h1 className="text-3xl md:text-4xl font-bold text-green-800">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            Monitor violation stages and track compliance status.
          </p>
        </div>

        <button
          onClick={() => router.push("/module-3-notice/Aging")}
          className="bg-green-700 hover:bg-green-800 active:scale-95 transition-all duration-200 text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md"
        >
          View Aging Notice
        </button>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 
            hover:border-green-600 hover:shadow-md transition-all duration-300 group"
          >
            <div className="p-3 rounded-lg bg-green-50 text-green-700">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                {stat.label}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto mt-14">
        <h2 className="text-2xl font-semibold text-green-800 mb-6">
          Escalation Details
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-800 text-white uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Business ID</th>
                <th className="px-6 py-4">Business Name</th>
                <th className="px-6 py-4">Notice 1</th>
                <th className="px-6 py-4">Notice 2</th>
                <th className="px-6 py-4">Notice 3</th>
                <th className="px-6 py-4">Penalty</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {violations.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-green-50 transition duration-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {v.business_id}
                  </td>

                  <td className="px-6 py-4 text-gray-700 font-semibold">
                    {v.buses?.business_name ?? "No Business"}
                  </td>

                  <td className="px-6 py-4">
                    {getNoticeBadge(1, v.notice_level, v.status)}
                  </td>

                  <td className="px-6 py-4">
                    {getNoticeBadge(2, v.notice_level, v.status)}
                  </td>

                  <td className="px-6 py-4">
                    {getNoticeBadge(3, v.notice_level, v.status)}
                  </td>

                  <td className="px-6 py-4 font-semibold text-red-600">
                    ₱ {v.penalty_amount?.toLocaleString() ?? "0"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                        v.status,
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