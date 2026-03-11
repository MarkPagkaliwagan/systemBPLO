"use client";

import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, TrendingUp, Activity, ChevronLeft, ChevronRight
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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [compliantCount, setCompliantCount] = useState(0);
  const [nonCompliantCount, setNonCompliantCount] = useState(0);
  const [forInspectionCount, setForInspectionCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

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
        console.error('fetchStatusCounts error:', err);
      }
    };

    const fetchViolationCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('business_violations')
          .select('notice_level, resolved');
        if (error) { console.error('fetchViolationCounts error:', error); return; }
        const violations = data ?? [];
        setNotice1Count(violations.filter(v => v.notice_level >= 1).length);
        setNotice2Count(violations.filter(v => v.notice_level >= 2).length);
        setNotice3Count(violations.filter(v => v.notice_level >= 3).length);
        setActiveCasesCount(violations.filter(v => !v.resolved && v.notice_level <= 3).length);
        setCeaseDesistCount(violations.filter(v => !v.resolved && v.notice_level > 3).length);
      } catch (err) {
        console.error('fetchViolationCounts error:', err);
      }
    };

    fetchStatusCounts();
    fetchViolationCounts();
  }, []);

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

  // valueColor: colored numbers; iconBg: colored icon background; trendColor: colored trend badge
  const kpiData = [
    { title: "Compliant",         value: String(compliantCount),     icon: CheckCircle,  trend: "+12%", valueColor: "text-slate-800",  iconBg: "from-green-400 to-green-600",   trendColor: "text-green-600"  },
    { title: "Non-Compliant",     value: String(nonCompliantCount),  icon: AlertTriangle,trend: "-5%",  valueColor: "text-slate-800",    iconBg: "from-red-400 to-red-600",       trendColor: "text-red-500"    },
    { title: "For Inspection",    value: String(forInspectionCount), icon: ClipboardList,trend: "+8%",  valueColor: "text-slate-800", iconBg: "from-yellow-400 to-yellow-600", trendColor: "text-yellow-500" },
    { title: "Active Businesses", value: String(activeCount),        icon: Building2,    trend: "+15%", valueColor: "text-slate-800",  iconBg: "from-green-400 to-green-600",   trendColor: "text-green-600"  },
  ];

  const noticeStats = [
    { title: "Notice 1 Sent",  value: String(notice1Count),     icon: Mail,  color: "from-indigo-400 to-indigo-600" },
    { title: "Notice 2 Sent",  value: String(notice2Count),     icon: Mail,  color: "from-purple-400 to-purple-600" },
    { title: "Notice 3 Sent",  value: String(notice3Count),     icon: Mail,  color: "from-pink-400 to-pink-600"    },
    { title: "Active Cases",   value: String(activeCasesCount), icon: Gavel, color: "from-orange-400 to-orange-600"},
    { title: "Cease & Desist", value: String(ceaseDesistCount), icon: Ban,   color: "from-red-500 to-red-700"      },
  ];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  const CalendarWidget = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-slate-200 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-[130px] text-center">{monthLabel}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <div
              key={day}
              className={`flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors
                ${isToday(day) ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className={`${isMobile ? "h-screen overflow-hidden" : "min-h-screen"} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden`}>
        <div className={`${isMobile ? "px-3 py-3 h-full flex flex-col" : "px-8 py-10"}`}>

          {/* HEADER */}
          <div className={`${isMobile ? "mb-2 shrink-0" : "mb-5"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`${isMobile ? "text-xl" : "text-4xl"} font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent`}>
                  Overview
                </h1>
                <p className={`text-slate-500 ${isMobile ? "text-xs" : "text-lg"} mt-1`}>
                  Real-time inspection and notice monitoring
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Live</span>
              </div>
            </div>
          </div>

          {/* KPI METRICS — 4 cols (1 row) on desktop, 4 cols (1 row) on mobile */}
          <div className={`grid ${isMobile ? "grid-cols-4 gap-2 mb-2 shrink-0" : "grid-cols-4 gap-4 mb-6"}`}>
            {kpiData.map((kpi, index) => (
              <div key={index} className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 ${isMobile ? "p-3" : "p-5 h-36 flex flex-col justify-between"}`}>
                <div className="relative z-10">
                  <div className={`flex ${isMobile ? "flex-col items-center gap-1" : "items-center justify-between mb-3"}`}>
                    <div className={`${isMobile ? "w-8 h-8" : "w-12 h-12"} rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center shadow-lg`}>
                      <kpi.icon size={isMobile ? 16 : 24} className="text-white" />
                    </div>
                    {!isMobile && (
                      <div className={`flex items-center space-x-1 ${kpi.trendColor} text-xs font-medium`}>
                        <TrendingUp size={13} />
                        <span>{kpi.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={isMobile ? "text-center mt-1" : ""}>
                    <p className="text-slate-500 text-xs font-medium mb-1 leading-tight">{kpi.title}</p>
                    {isMobile ? (
                      <h3 className={`text-lg font-bold ${kpi.valueColor}`}>{kpi.value}</h3>
                    ) : (
                      <>
                        <h3 className={`text-3xl font-bold ${kpi.valueColor}`}>{kpi.value}</h3>
                        <div className={`flex items-center space-x-1 ${kpi.trendColor} text-xs font-medium mt-1`}>
                          <TrendingUp size={11} />
                          <span>{kpi.trend}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NOTICE STATISTICS + CALENDAR — side by side on desktop, stacked on mobile */}
          {isMobile ? (
            <>
              <div className="mb-2 shrink-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-800">Notice Statistics</h2>
                    <Activity className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {noticeStats.map((stat, index) => (
                      <div key={index} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-100">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md mb-1`}>
                          <stat.icon size={13} className="text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-none">{stat.value}</p>
                        <p className="text-center text-slate-500 mt-1 leading-tight" style={{ fontSize: '8.5px' }}>{stat.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <CalendarWidget />
              </div>
            </>
          ) : (
            <div className="flex gap-6">
              {/* Notice Stats — fixed width left column */}
              <div className="w-80 shrink-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-slate-800">Notice Statistics</h2>
                    <Activity className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {noticeStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-white transition-all duration-200 border border-slate-100">
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
              {/* Calendar — fills remaining space, constrained height */}
              <div className="flex-1 min-h-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Calendar</h2>
                    <div className="flex items-center space-x-2">
                      <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={18} className="text-slate-600" />
                      </button>
                      <span className="text-sm font-semibold text-slate-700 min-w-[130px] text-center">{monthLabel}</span>
                      <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronRight size={18} className="text-slate-600" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      return (
                        <div key={day} className={`flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors
                          ${isToday(day) ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}>
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}