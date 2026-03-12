"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, TrendingUp, Activity, ChevronLeft, ChevronRight,
  CalendarDays, ListChecks
} from "lucide-react";

import Sidebar from "../../../../components/sidebar";
import MobileBottomNav from "../../../../components/MobileBottomNav";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [scheduleMonth, setScheduleMonth] = useState(new Date());

  const [compliantCount, setCompliantCount] = useState(0);
  const [nonCompliantCount, setNonCompliantCount] = useState(0);
  const [forInspectionCount, setForInspectionCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const [notice1Count, setNotice1Count] = useState(0);
  const [notice2Count, setNotice2Count] = useState(0);
  const [notice3Count, setNotice3Count] = useState(0);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [ceaseDesistCount, setCeaseDesistCount] = useState(0);

  // --- NEW: state to hold DB schedules and derived mappings ---
  const [dbSchedules, setDbSchedules] = useState<
    { scheduled_date: string; "Business Identification Number": string; "Business Name": string | null }[]
  >([]);
  const [mockEventsByDate, setMockEventsByDate] = useState<Record<string, { title: string; time: string; color: string; colorDot: string }[]>>({});
  const [desktopMockEvents, setDesktopMockEvents] = useState<Record<number, { title: string; time: string; color: string }[]>>({});

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

  // --- NEW: fetch schedules from DB and build event maps ---
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('business_records')
          .select(`scheduled_date, "Business Identification Number", "Business Name"`)
          .not('scheduled_date', 'is', null);

        if (error) {
          console.error('fetchSchedules error:', error);
          return;
        }

        const rows = (data ?? []) as { scheduled_date: string; "Business Identification Number": string; "Business Name": string | null }[];
        setDbSchedules(rows);

        // Build mockEventsByDate: key = YYYY-MM-DD
        const byDate: Record<string, { title: string; time: string; color: string; colorDot: string }[]> = {};
        rows.forEach(r => {
          // scheduled_date may be in ISO or just 'YYYY-MM-DD'
          const dateOnly = (r.scheduled_date ?? '').split('T')[0]; // safe normalization
          if (!dateOnly) return;
          const title = `${r["Business Name"] ?? ""}${r["Business Name"] ? " — " : ""}${r["Business Identification Number"]}`;
          const event = { title, time: "", color: "bg-blue-500", colorDot: "bg-blue-500" }; // no time in table, show as all-day
          if (!byDate[dateOnly]) byDate[dateOnly] = [];
          byDate[dateOnly].push(event);
        });
        setMockEventsByDate(byDate);

        // Build desktopMockEvents for current desktop month (keyed by day number)
        const curr = new Date();
        const desktopMonth = currentMonth.getMonth();
        const desktopYear = currentMonth.getFullYear();
        const byDay: Record<number, { title: string; time: string; color: string }[]> = {};
        rows.forEach(r => {
          const dateOnly = (r.scheduled_date ?? '').split('T')[0];
          if (!dateOnly) return;
          const [y, m, d] = dateOnly.split('-').map(Number);
          if (y === desktopYear && (m - 1) === desktopMonth) {
            const day = Number(d);
            const title = `${r["Business Name"] ?? ""}${r["Business Name"] ? " — " : ""}${r["Business Identification Number"]}`;
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push({ title, time: "", color: "bg-blue-500" });
          }
        });
        setDesktopMockEvents(byDay);

      } catch (err) {
        console.error('fetchSchedules unexpected error:', err);
      }
    };

    fetchSchedules();
  // NOTE: we intentionally include currentMonth so desktopMockEvents rebuilds when user navigates months in the left mini calendar
  }, [currentMonth]);

  const kpiData = [
    { title: "Active Businesses", value: String(activeCount),        icon: Building2,     trend: "+15%", iconBg: "from-green-400 to-green-600",   trendColor: "text-green-600"  },
    { title: "Compliant",         value: String(compliantCount),     icon: CheckCircle,   trend: "+12%", iconBg: "from-green-400 to-green-600",   trendColor: "text-green-600"  },
    { title: "For Inspection",    value: String(forInspectionCount), icon: ClipboardList, trend: "+8%",  iconBg: "from-yellow-400 to-yellow-600", trendColor: "text-yellow-500" },
    { title: "Non-Compliant",     value: String(nonCompliantCount),  icon: AlertTriangle, trend: "-5%",  iconBg: "from-red-400 to-red-600",       trendColor: "text-red-500"    },
  ];

  const noticeStats = [
    { title: "Notice 1 Sent",  value: String(notice1Count),     icon: Mail,  color: "from-indigo-400 to-indigo-600" },
    { title: "Notice 2 Sent",  value: String(notice2Count),     icon: Mail,  color: "from-purple-400 to-purple-600" },
    { title: "Notice 3 Sent",  value: String(notice3Count),     icon: Mail,  color: "from-pink-400 to-pink-600"    },
    { title: "Active Cases",   value: String(activeCasesCount), icon: Gavel, color: "from-orange-400 to-orange-600" },
    { title: "Cease & Desist", value: String(ceaseDesistCount), icon: Ban,   color: "from-red-500 to-red-700"      },
  ];

  // Desktop calendar helpers
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

  // --- NOTE: mockEventsByDate and desktopMockEvents are now state, built from DB ---
  // Get all days of the scheduleMonth, each with their events (or empty)
  const getScheduleDaysForMonth = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const daysCount = new Date(year, m + 1, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const day = i + 1;
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Use the live mapping (may be empty array)
      return { day, date: new Date(year, m, day), events: mockEventsByDate[key] ?? [] };
    });
  };

  const scheduleMonthLabel = scheduleMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevScheduleMonth = () => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() - 1, 1));
  const nextScheduleMonth = () => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() + 1, 1));
  const scheduleDays = getScheduleDaysForMonth(scheduleMonth);

  // Desktop events: use state that reflects DB rows for the currently displayed desktop month
  const selectedDayEvents = selectedDay ? (desktopMockEvents[selectedDay] ?? []) : [];
  const selectedDateLabel = selectedDay
    ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDay)
        .toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 8;
    return h <= 12 ? `${h} AM` : `${h - 12} PM`;
  });

  // ── MOBILE Schedule Section ──────────────────────────────────────────────
  const MobileScheduleSection = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">

      {/* Header with month picker */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <span className="text-base font-bold text-slate-800">Schedule</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={prevScheduleMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={15} className="text-slate-600" />
          </button>
          <span className="text-xs font-semibold text-slate-600 min-w-[100px] text-center">{scheduleMonthLabel}</span>
          <button
            onClick={nextScheduleMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={15} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* All days of the month */}
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {scheduleDays.map(({ day, date, events }) => {
          const isDayToday =
            day === today.getDate() &&
            scheduleMonth.getMonth() === today.getMonth() &&
            scheduleMonth.getFullYear() === today.getFullYear();
          const dayLabel = date.toLocaleDateString('default', { weekday: 'short' });
          const isPast =
            date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <div
              key={day}
              className={`flex px-4 py-2.5 gap-3 ${isPast && !isDayToday ? 'opacity-50' : ''}`}
            >
              {/* Date column */}
              <div className="w-12 shrink-0 flex flex-col items-center justify-start pt-0.5">
                <span className={`text-xs font-semibold uppercase tracking-wide ${isDayToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {dayLabel}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-0.5
                  ${isDayToday ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md' : ''}`}
                >
                  <span className={`text-xs font-bold ${isDayToday ? 'text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>
                </div>
              </div>

              {/* Events or empty line */}
              <div className="flex-1 space-y-1.5 min-w-0">
                {events.length > 0 ? (
                  events.map((event, i) => (
                    <div key={i} className={`${event.color} rounded-xl px-3 py-2 flex items-center justify-between shadow-sm`}>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{event.title}</p>
                        <p className="text-xs text-white/80 mt-0.5">{event.time}</p>
                      </div>
                      <ListChecks size={13} className="text-white/70 shrink-0 ml-2" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center h-8">
                    <div className="flex-1 border-t border-dashed border-slate-200" />
                  </div>
                )}
              </div>
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

      {/* ── MOBILE ── */}
      {isMobile && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="px-3 py-3 pb-28 flex flex-col gap-2">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Overview
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">Real-time inspection and notice monitoring</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Live</span>
              </div>
            </div>

            {/* KPI — 4 cols */}
            <div className="grid grid-cols-4 gap-2">
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

            {/* Notice Statistics */}
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

            {/* Schedule section */}
            <MobileScheduleSection />

          </div>

          <MobileBottomNav />
        </div>
      )}

      {/* ── DESKTOP ── */}
      {!isMobile && (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="px-8 py-6 h-full flex flex-col">

            {/* Header */}
            <div className="mb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Overview
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">Real-time inspection and notice monitoring</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500">Live</span>
                </div>
              </div>
            </div>

            {/* KPI cards */}
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

            {/* Calendar — flex-1 fills remaining space */}
            <div className="flex gap-5 flex-1 min-h-0">

              {/* LEFT — Mini Calendar */}
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
                      const hasEvent = !!desktopMockEvents[day];
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

                  {/* Upcoming */}
                  <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming</p>
                    {Object.entries(desktopMockEvents).slice(0, 3).map(([day, events]) => (
                      <div key={day} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <p className="text-xs text-slate-600 truncate">{events[0].title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT — Google Calendar Day View */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden flex flex-col flex-1">

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

                  <div className="overflow-y-auto flex-1">
                    {hours.map((hour, i) => {
                      const hourNum = i + 8;
                      const eventsAtHour = selectedDayEvents.filter(e => {
                        // Since DB has only date (no time), events' time is empty string.
                        // This filter will therefore not match any hour — which keeps the current layout intact.
                        const h = parseInt(e.time.split(':')[0]) || NaN;
                        const isPM = e.time.includes('PM') && h !== 12;
                        const actual = isNaN(h) ? null : (isPM ? h + 12 : h);
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
                    {/* If you want the all-day events to appear in the day view, add a section above the hourly list.
                        For now we keep the exact layout intact (no structural change). */}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}