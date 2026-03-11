"use client";

import { useState } from "react";
import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, TrendingUp, Activity, ChevronLeft, ChevronRight
} from "lucide-react";

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar() {
  const today = new Date();
  const [cur, setCur] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const firstDay    = new Date(cur.y, cur.m, 1).getDay();
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const monthName   = new Date(cur.y, cur.m).toLocaleString("default", { month: "long" });

  const prev = () => setCur(p => p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 });
  const next = () => setCur(p => p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 });

  const isToday = ( d:number) =>
    d === today.getDate() && cur.m === today.getMonth() && cur.y === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        <span className="font-bold text-slate-800 text-base">{monthName} {cur.y}</span>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight size={18} className="text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {d ? (
              <button
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-150
                  ${isToday(d)
                    ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200"
                    : "text-slate-700 hover:bg-slate-100"}`}
              >
                {d}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
        <span className="text-xs text-slate-500">Today</span>
      </div>
    </div>
  );
}

// ─── Main Mobile Dashboard ────────────────────────────────────────────────────
export default function MobileDashboard() {
  const [compliantCount]     = useState(24);
  const [nonCompliantCount]  = useState(8);
  const [forInspectionCount] = useState(12);
  const [activeCount]        = useState(37);

  const kpiData = [
    { title: "Compliant",         value: String(compliantCount),     icon: CheckCircle,  color: "from-green-400 to-green-600",   trend: "+12%" },
    { title: "Non-Compliant",     value: String(nonCompliantCount),  icon: AlertTriangle,color: "from-red-400 to-red-600",       trend: "-5%"  },
    { title: "For Inspection",    value: String(forInspectionCount), icon: ClipboardList,color: "from-yellow-400 to-yellow-600", trend: "+8%"  },
    { title: "Active Businesses", value: String(activeCount),        icon: Building2,    color: "from-blue-400 to-blue-600",     trend: "+15%" },
  ];

  const noticeGridStats = [
    { title: "Notice 1 Sent", value: "40", icon: Mail,  color: "from-indigo-400 to-indigo-600" },
    { title: "Notice 2 Sent", value: "20", icon: Mail,  color: "from-purple-400 to-purple-600" },
    { title: "Notice 3 Sent", value: "10", icon: Mail,  color: "from-pink-400 to-pink-600"     },
    { title: "Active Cases",  value: "15", icon: Gavel, color: "from-orange-400 to-orange-600" },
  ];

  const noticeLongStat = {
    title: "Cease & Desist",
    value: "5",
    icon: Ban,
    color: "from-red-500 to-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time monitoring</p>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500 font-medium">Live</span>
        </div>
      </div>

      {/* ── KPI METRICS 2×2 ── */}
      <div className="grid grid-cols-2 gap-3">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-md`}>
                <kpi.icon size={20} className="text-white" />
              </div>
              <span className="text-green-600 text-xs font-semibold flex items-center gap-0.5">
                <TrendingUp size={12} />{kpi.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* ── NOTICE STATISTICS: 2×2 grid + 1 long card ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">Notice Statistics</h2>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {noticeGridStats.map((stat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/20 flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                <stat.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{stat.title}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 1 full-width long card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-white/20 flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${noticeLongStat.color} flex items-center justify-center shadow-md flex-shrink-0`}>
            <noticeLongStat.icon size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500">{noticeLongStat.title}</p>
            <p className="text-3xl font-bold text-slate-800">{noticeLongStat.value}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
            Enforcement
          </span>
        </div>
      </div>

      {/* ── CALENDAR ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Calendar</h2>
        <MiniCalendar />
      </div>

      <div className="h-6" />
    </div>
  );
}

