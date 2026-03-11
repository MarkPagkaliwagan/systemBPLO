"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, TrendingUp, Activity, ChevronLeft, ChevronRight
} from "lucide-react";

import Sidebar from "../../../../components/sidebar";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

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

  const kpiData = [
    { title: "Active Businesses", value: String(activeCount), icon: Building2, trend: "+15%", iconBg: "from-green-400 to-green-600", trendColor: "text-green-600" },
    { title: "Compliant", value: String(compliantCount), icon: CheckCircle, trend: "+12%", iconBg: "from-green-400 to-green-600", trendColor: "text-green-600" },
    { title: "For Inspection", value: String(forInspectionCount), icon: ClipboardList, trend: "+8%", iconBg: "from-yellow-400 to-yellow-600", trendColor: "text-yellow-500" },
    { title: "Non-Compliant", value: String(nonCompliantCount), icon: AlertTriangle, trend: "-5%", iconBg: "from-red-400 to-red-600", trendColor: "text-red-500" },
  ];

  const noticeStats = [
    { title: "Notice 1 Sent", value: String(notice1Count), icon: Mail, color: "from-indigo-400 to-indigo-600" },
    { title: "Notice 2 Sent", value: String(notice2Count), icon: Mail, color: "from-purple-400 to-purple-600" },
    { title: "Notice 3 Sent", value: String(notice3Count), icon: Mail, color: "from-pink-400 to-pink-600" },
    { title: "Active Cases", value: String(activeCasesCount), icon: Gavel, color: "from-orange-400 to-orange-600" },
    { title: "Cease & Desist", value: String(ceaseDesistCount), icon: Ban, color: "from-red-500 to-red-700" },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const prevMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)); setSelectedDay(null); };
  const nextMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)); setSelectedDay(null); };

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const today = new Date();

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  const isSelected = (day: number) => day === selectedDay;

  const mockEvents: Record<number, { title: string; time: string; color: string }[]> = {
    [today.getDate()]: [
      { title: "Inspection: Rizal St. Businesses", time: "9:00 AM", color: "bg-blue-500" },
      { title: "Notice 2 Follow-up", time: "11:00 AM", color: "bg-orange-500" },
      { title: "Team Review Meeting", time: "2:00 PM", color: "bg-green-500" },
    ],
  };

  const selectedDayEvents = selectedDay ? (mockEvents[selectedDay] ?? []) : [];

  const selectedDateLabel = selectedDay
    ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay)
      .toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 8;
    return h <= 12 ? `${h} AM` : `${h - 12} PM`;
  });

  // ── MOBILE CalendarWidget (original, untouched) ──────────────────────────
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

      {/* Full viewport height, no scroll */}
      <div className={`${isMobile ? "h-screen overflow-hidden" : "h-screen overflow-hidden"} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50`}>
        <div className={`${isMobile ? "px-3 py-3 h-full flex flex-col" : "px-8 py-6 h-full flex flex-col"}`}>

          {/* HEADER */}
          <div className={`${isMobile ? "mb-2 shrink-0" : "mb-4 shrink-0"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent`}>
                  Overview
                </h1>
                <p className={`text-slate-500 ${isMobile ? "text-xs" : "text-sm"} mt-0.5`}>
                  Real-time inspection and notice monitoring
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Live</span>
              </div>
            </div>
          </div>

          {/* ── MOBILE LAYOUT (original, untouched) ──────────────────────── */}
          {isMobile && (
            <>
              <div className="grid grid-cols-4 gap-2 mb-2 shrink-0">
                {kpiData.map((kpi, index) => (
                  <div key={index} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 p-3">
                    <div className="relative z-10">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center shadow-lg`}>
                          <kpi.icon size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="text-center mt-1">
                        <p className="text-slate-500 text-xs font-medium mb-1 leading-tight">{kpi.title}</p>
                        <h3 className="text-lg font-bold text-slate-800">{kpi.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
          )}

          {/* ── DESKTOP LAYOUT ───────────────────────────────────────────── */}
          {!isMobile && (
            <>
              {/* KPI cards — taller, fills space nicely */}
              <div className="grid grid-cols-4 gap-5 mb-5 shrink-0">
                {kpiData.map((kpi, index) => (
                  <div key={index} className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.iconBg} flex items-center justify-center shadow-lg`}>
                        <kpi.icon size={22} className="text-white" />
                      </div>
                      <div className={`flex items-center space-x-1 ${kpi.trendColor} text-sm font-semibold`}>
                        <TrendingUp size={13} />
                        <span>{kpi.trend}</span>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</p>
                    <h3 className="text-3xl font-bold text-slate-800">{kpi.value}</h3>
                  </div>
                ))}
              </div>

              {/* Notice Statistics row */}
              <div className="grid grid-cols-5 gap-5 mb-5 shrink-0">
                {noticeStats.map((stat, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <stat.icon size={22} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-500 leading-tight truncate">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar — flex-1 so it fills ALL remaining space */}
              <div className="flex gap-5 flex-1 min-h-0">

                {/* LEFT — Mini Calendar — full height */}
                <div className="w-72 shrink-0 flex flex-col">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={16} className="text-slate-600" />
                      </button>
                      <span className="text-sm font-bold text-slate-700">{monthLabel}</span>
                      <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronRight size={16} className="text-slate-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1">
                      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const hasEvent = !!mockEvents[day];
                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`relative flex items-center justify-center h-9 w-9 mx-auto rounded-full text-sm font-medium cursor-pointer transition-all
                              ${isToday(day) && !isSelected(day) ? 'bg-blue-100 text-blue-700 font-bold' : ''}
                              ${isSelected(day) ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}
                            `}
                          >
                            {day}
                            {hasEvent && (
                              <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected(day) ? 'bg-white' : 'bg-blue-500'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Upcoming — pushes to bottom */}
                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming</p>
                      {Object.entries(mockEvents).slice(0, 3).map(([day, events]) => (
                        <div key={day} className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <p className="text-xs text-slate-600 truncate">{events[0].title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Google Calendar Day View — full height */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden flex flex-col flex-1">

                    {/* Day header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
                      <div>
                        <h2 className="text-base font-bold text-slate-800">
                          {selectedDay ? selectedDateLabel : 'Select a day'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {selectedDayEvents.length > 0
                            ? `${selectedDayEvents.length} event${selectedDayEvents.length > 1 ? 's' : ''} scheduled`
                            : 'No events scheduled'}
                        </p>
                      </div>
                      <button
                        onClick={() => { setCurrentMonth(new Date()); setSelectedDay(today.getDate()); }}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Today
                      </button>
                    </div>

                    {/* Time slots — fills remaining height */}
                    <div className="overflow-y-auto flex-1">
                      {hours.map((hour, i) => {
                        const hourNum = i + 8;
                        const eventsAtHour = selectedDayEvents.filter(e => {
                          const h = parseInt(e.time.split(':')[0]);
                          const isPM = e.time.includes('PM') && h !== 12;
                          const actual = isPM ? h + 12 : h;
                          return actual === hourNum;
                        });
                        return (
                          <div key={hour} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <div className="w-20 shrink-0 py-3 px-3 text-right">
                              <span className="text-sm text-slate-400 font-medium">{hour}</span>
                            </div>
                            <div className="flex-1 py-1.5 px-3 min-h-[52px]">
                              {eventsAtHour.length > 0 ? (
                                <div className="space-y-1">
                                  {eventsAtHour.map((event, ei) => (
                                    <div key={ei} className={`${event.color} text-white rounded-lg px-3 py-2 text-sm font-medium shadow-sm flex items-center justify-between`}>
                                      <span>{event.title}</span>
                                      <span className="opacity-80 ml-2 shrink-0 text-xs">{event.time}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="h-full border-l-2 border-transparent hover:border-blue-200 transition-colors" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}