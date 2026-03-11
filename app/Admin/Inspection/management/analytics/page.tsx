"use client";

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, TrendingUp, Activity
} from "lucide-react";

import Sidebar from "../../../../components/sidebar";
import { supabase } from "@/lib/supabaseClient";

type NoticeData = { notice: string; sent: number; pending: number; };
type StatusData = { name: string; value: number; };

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];
const STATUS_COLORS = ["#ef4444", "#f97316"];

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('compliance');

  // business_records counts
  const [compliantCount, setCompliantCount] = useState(0);
  const [nonCompliantCount, setNonCompliantCount] = useState(0);
  const [forInspectionCount, setForInspectionCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // business_violations counts
  const [notice1Count, setNotice1Count] = useState(0);
  const [notice2Count, setNotice2Count] = useState(0);
  const [notice3Count, setNotice3Count] = useState(0);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [ceaseDesistCount, setCeaseDesistCount] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const [
          { count: compliant },
          { count: nonCompliant },
          { count: forInspection },
          { count: active },
        ] = await Promise.all([
          supabase.from('business_records').select('*', { count: 'exact', head: true }).eq('status', 'compliant'),
          supabase.from('business_records').select('*', { count: 'exact', head: true }).eq('status', 'non_compliant'),
          supabase.from('business_records').select('*', { count: 'exact', head: true }).eq('status', 'for_inspection'),
          supabase.from('business_records').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        setCompliantCount(compliant ?? 0);
        setNonCompliantCount(nonCompliant ?? 0);
        setForInspectionCount(forInspection ?? 0);
        setActiveCount(active ?? 0);
      } catch (err) {
        console.error('❌ fetchStatusCounts error:', err);
      }
    };

    const fetchViolationCounts = async () => {
      try {
        // Fetch all violations
        const { data, error } = await supabase
          .from('business_violations')
          .select('notice_level, resolved');

        if (error) { console.error('❌ fetchViolationCounts error:', error); return; }

        const violations = data ?? [];

        // Notice sent = rows where notice_level >= that notice number
        setNotice1Count(violations.filter(v => v.notice_level >= 1).length);
        setNotice2Count(violations.filter(v => v.notice_level >= 2).length);
        setNotice3Count(violations.filter(v => v.notice_level >= 3).length);

        // Active cases = not resolved and notice_level <= 3
        setActiveCasesCount(violations.filter(v => !v.resolved && v.notice_level <= 3).length);

        // Cease & Desist = not resolved and notice_level > 3
        setCeaseDesistCount(violations.filter(v => !v.resolved && v.notice_level > 3).length);
      } catch (err) {
        console.error('❌ fetchViolationCounts error:', err);
      }
    };

    fetchStatusCounts();
    fetchViolationCounts();
  }, []);

  // Derived data for charts
  const complianceData = [
    { name: "Compliant", value: compliantCount },
    { name: "Non-Compliant", value: nonCompliantCount },
    { name: "For Inspection", value: forInspectionCount },
    { name: "Active", value: activeCount },
  ];

  const noticeData: NoticeData[] = [
    { notice: "Notice 1", sent: notice1Count, pending: Math.max(0, nonCompliantCount - notice1Count) },
    { notice: "Notice 2", sent: notice2Count, pending: Math.max(0, notice1Count - notice2Count) },
    { notice: "Notice 3", sent: notice3Count, pending: Math.max(0, notice2Count - notice3Count) },
  ];

  const statusData: StatusData[] = [
    { name: "Cease & Desist", value: ceaseDesistCount },
    { name: "Active Cases", value: activeCasesCount },
  ];

  const tabs = [
    { id: 'compliance', label: 'Compliance Overview', icon: CheckCircle },
    { id: 'notices', label: 'Notice Analytics', icon: Mail },
    { id: 'status', label: 'Status for Compliance', icon: Gavel },
  ];

  const kpiData = [
    { title: "Compliant", value: String(compliantCount), icon: CheckCircle, color: "from-green-400 to-green-600", trend: "+12%" },
    { title: "Non-Compliant", value: String(nonCompliantCount), icon: AlertTriangle, color: "from-red-400 to-red-600", trend: "-5%" },
    { title: "For Inspection", value: String(forInspectionCount), icon: ClipboardList, color: "from-yellow-400 to-yellow-600", trend: "+8%" },
    { title: "Active Businesses", value: String(activeCount), icon: Building2, color: "from-blue-400 to-blue-600", trend: "+15%" }
  ];

  const noticeStats = [
    { title: "Notice 1 Sent", value: String(notice1Count), icon: Mail, color: "from-indigo-400 to-indigo-600" },
    { title: "Notice 2 Sent", value: String(notice2Count), icon: Mail, color: "from-purple-400 to-purple-600" },
    { title: "Notice 3 Sent", value: String(notice3Count), icon: Mail, color: "from-pink-400 to-pink-600" },
    { title: "Active Cases", value: String(activeCasesCount), icon: Gavel, color: "from-orange-400 to-orange-600" },
    { title: "Cease & Desist", value: String(ceaseDesistCount), icon: Ban, color: "from-red-500 to-red-700" }
  ];

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className={`${isMobile ? "px-4 py-6" : "px-8 py-10"}`}>
          
          {/* HEADER */}
          <div className={`${isMobile ? "mb-8" : "mb-10"}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className={`${isMobile ? "text-3xl" : "text-4xl"} font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent`}>
                  Overview
                </h1>
                <p className="text-slate-500 text-lg mt-2">
                  Real-time inspection and notice monitoring
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Live</span>
              </div>
            </div>
          </div>

          {/* KPI METRICS */}
          <div className={`${isMobile ? "grid grid-cols-2 gap-4" : "grid grid-cols-4 gap-6"} mb-10`}>
            {kpiData.map((kpi, index) => (
              <div key={index} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(135deg, ${kpi.color})` }}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                      <kpi.icon size={24} className="text-white" />
                    </div>
                    <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                      <TrendingUp size={16} />
                      <span>{kpi.trend}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-slate-800">{kpi.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className={`${isMobile ? 'space-y-6' : 'flex gap-6'}`}>
            
            {/* LEFT SIDE - NOTICE STATS */}
            <div className={`${isMobile ? 'w-full' : 'w-1/5'}`}>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Notice Statistics</h2>
                  <Activity className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {noticeStats.map((stat, index) => (
                    <div key={index} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-white transition-all duration-200 border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                          <stat.icon size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">{stat.title}</p>
                          <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}