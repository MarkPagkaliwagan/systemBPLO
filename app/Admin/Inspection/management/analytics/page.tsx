"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle, AlertTriangle, ClipboardList, Building2,
  Mail, Gavel, Ban, Activity, ChevronLeft, ChevronRight,
  ListChecks, ChevronDown, CalendarDays
} from "lucide-react";

import Sidebar from "../../../../components/sidebar";
import MobileBottomNav from "../../../../components/MobileBottomNav";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import InspectorSummary from "./inspectorsummary";
import ReviewModal from "../Modal/reviewModal";

type NoticeRange = '7d' | '1m' | '3m' | '6m' | '1yr';

interface BusinessRecord {
  id: string;
  "Business Identification Number": string;
  "Business Name": string;
  "Trade Name": string | null;
  "Business Nature": string | null;
  "Business Line": string | null;
  "Business Type": string | null;
  "Transmittal No.": string | null;
  "Incharge First Name": string | null;
  "Incharge Middle Name": string | null;
  "Incharge Last Name": string | null;
  "Incharge Extension Name": string | null;
  "Incharge Sex": string | null;
  "Citizenship": string | null;
  "Office Street": string | null;
  "Office Region": string | null;
  "Office Province": string | null;
  "Office Municipality": string | null;
  "Office Barangay": string | null;
  "Office Zipcode": string | null;
  "Year": number | null;
  "Capital": number | null;
  "Gross Amount": number | null;
  "Gross Amount Essential": number | null;
  "Gross Amount Non-Essential": number | null;
  "Reject Remarks": string | null;
  "Module Type": string | null;
  "Transaction Type": string | null;
  "Requestor First Name": string | null;
  "Requestor Middle Name": string | null;
  "Requestor Last Name": string | null;
  "Requestor Extension Name": string | null;
  "Requestor Email": string | null;
  "Requestor Mobile No.": string | null;
  "Birth Date": string | null;
  "Requestor Sex": string | null;
  "Civil Status": string | null;
  "Requestor Street": string | null;
  "Requestor Province": string | null;
  "Requestor Municipality": string | null;
  "Requestor Barangay": string | null;
  "Requestor Zipcode": string | null;
  "Transaction ID": string | null;
  "Reference No.": string | null;
  "Brgy. Clearance Status": string | null;
  "SITE Transaction Status": string | null;
  "CORE Transaction Status": string | null;
  "Transaction Date": string | null;
  "SOA No.": string | null;
  "Annual Amount": number | null;
  "Term": string | null;
  "Amount Paid": number | null;
  "Balance": number | null;
  "Payment Type": string | null;
  "Payment Date": string | null;
  "O.R. No.": string | null;
  "Brgy. Clearance No.": string | null;
  "O.R. Date": string | null;
  "Permit No.": string | null;
  "Business Plate No.": string | null;
  "Actual Closure Date": string | null;
  "Retirement Reason": string | null;
  "Source Type": string | null;
  violation: string | null;
  review_action: string | null;
  review_date: string | null;
  reviewed_by: string | null;
  status: string | null;
  assigned_inspector: string | null;
  scheduled_date: string | null;
  schedule_time: string | null;
  photo: string | null;
  latitude: string | null;
  longitude: string | null;
  accuracy: string | null;
}

function EventItem({
  event,
  loadingBin,
  onOpenReview,
}: {
  event: any;
  loadingBin: string | null;
  onOpenReview: (bin: string) => void;
}) {
  const isLoading = loadingBin === event.bin;
  return (
    <button
      onClick={() => onOpenReview(event.bin)}
      disabled={!!loadingBin}
      className={`w-full text-left ${event.color} rounded-xl px-3 py-2 flex items-center justify-between shadow-sm
        hover:opacity-90 active:scale-95 transition-all duration-150
        ${loadingBin && !isLoading ? 'opacity-50' : ''}`}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate">{event.title}</p>
        {event.time && <p className="text-xs text-white/80 mt-0.5">{event.time}</p>}
      </div>
      {isLoading
        ? <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin shrink-0 ml-2" />
        : <ListChecks size={13} className="text-white/70 shrink-0 ml-2" />
      }
    </button>
  );
}

function ScheduleRow({
  day,
  date,
  events,
  isToday,
  isMobileView,
  todayRef,
  loadingBin,
  onOpenReview,
}: {
  day: number;
  date: Date;
  events: any[];
  isToday: boolean;
  isMobileView: boolean;
  todayRef: React.RefObject<HTMLDivElement | null>;
  loadingBin: string | null;
  onOpenReview: (bin: string) => void;
}) {
  const now = new Date();
  const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayLabel = date.toLocaleDateString('default', { weekday: 'short' });

  return (
    <div
      ref={isToday ? todayRef : undefined}
      className={`flex ${isMobileView ? 'px-4 py-2.5 gap-3' : 'px-5 py-3 gap-4'} ${isPast && !isToday ? isMobileView ? 'opacity-50' : 'opacity-40' : ''}`}
    >
      <div className={`${isMobileView ? 'w-12' : 'w-14'} shrink-0 flex flex-col items-center justify-start pt-0.5`}>
        <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
          {dayLabel}
        </span>
        <div className={`${isMobileView ? 'w-7 h-7 mt-0.5' : 'w-8 h-8 mt-1'} rounded-full flex items-center justify-center ${isToday ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md' : ''}`}>
          <span className={`${isMobileView ? 'text-xs' : 'text-sm'} font-bold ${isToday ? 'text-white' : 'text-slate-700'}`}>
            {day}
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        {events.length > 0 ? (
          events.map((event: any, i: number) => (
            <EventItem
              key={i}
              event={event}
              loadingBin={loadingBin}
              onOpenReview={onOpenReview}
            />
          ))
        ) : (
          <div className="flex items-center h-8">
            <div className="flex-1 border-t border-dashed border-slate-200" />
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardPageContent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [scheduleMonth, setScheduleMonth] = useState(new Date());
  const [noticeRange, setNoticeRange] = useState<NoticeRange>('7d');

  const [compliantCount, setCompliantCount] = useState(0);
  const [nonCompliantCount, setNonCompliantCount] = useState(0);
  const [forInspectionCount, setForInspectionCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const [notice1Count, setNotice1Count] = useState(0);
  const [notice2Count, setNotice2Count] = useState(0);
  const [notice3Count, setNotice3Count] = useState(0);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [ceaseDesistCount, setCeaseDesistCount] = useState(0);

  const [mockEventsByDate, setMockEventsByDate] = useState<Record<string, any[]>>({});
  const [desktopMockEvents, setDesktopMockEvents] = useState<Record<number, any[]>>({});

  const [reviewRecord, setReviewRecord] = useState<BusinessRecord | null>(null);
  const [loadingBin, setLoadingBin] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const desktopDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDropdownButtonRef  = useRef<HTMLButtonElement>(null);

  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef  = useRef<HTMLDivElement>(null);
  const desktopTodayRef  = useRef<HTMLDivElement>(null);
  const mobileTodayRef   = useRef<HTMLDivElement>(null);

  const today = new Date();

  const rangeOptions: { value: NoticeRange; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '1m', label: 'Last 1 Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1yr', label: 'Last 1 Year' },
  ];
  const selectedLabel = rangeOptions.find(r => r.value === noticeRange)?.label ?? 'Last 7 Days';

  // ── Scroll to today using getBoundingClientRect ───────────────────────────
  useEffect(() => {
    const isCurrentMonth =
      scheduleMonth.getMonth() === today.getMonth() &&
      scheduleMonth.getFullYear() === today.getFullYear();

    if (!isCurrentMonth) return;

    const t = setTimeout(() => {
      if (desktopTodayRef.current && desktopScrollRef.current) {
        const container = desktopScrollRef.current;
        const row = desktopTodayRef.current;
        const rowTop = row.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop = container.scrollTop + (rowTop - containerTop) - 4;
      }
      if (mobileTodayRef.current && mobileScrollRef.current) {
        const container = mobileScrollRef.current;
        const row = mobileTodayRef.current;
        const rowTop = row.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        container.scrollTop = container.scrollTop + (rowTop - containerTop) - 4;
      }
    }, 150);

    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleMonth, mockEventsByDate]);

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
    fetchStatusCounts();
  }, []);

  // ── Fixed violation counts using correct columns ──────────────────────────
  useEffect(() => {
    const fetchViolationCounts = async () => {
      try {
        const now = new Date();
        const start = new Date();
        switch (noticeRange) {
          case '7d': start.setDate(now.getDate() - 7); break;
          case '1m': start.setMonth(now.getMonth() - 1); break;
          case '3m': start.setMonth(now.getMonth() - 3); break;
          case '6m': start.setMonth(now.getMonth() - 6); break;
          case '1yr': start.setFullYear(now.getFullYear() - 1); break;
        }

        const { data, error } = await supabase
          .from('business_violations')
          .select('notice_level, resolved, cease_flag, created_at');

        if (error) { console.error('fetchViolationCounts error:', error); return; }

        const violations = (data ?? []).filter((v) => {
          const createdAt = new Date(v.created_at);
          return createdAt >= start && createdAt <= now;
        });

        setNotice1Count(violations.filter(v => v.notice_level >= 1).length);
        setNotice2Count(violations.filter(v => v.notice_level >= 2).length);
        setNotice3Count(violations.filter(v => v.notice_level >= 3).length);
        setActiveCasesCount(violations.filter(v => !v.resolved && !v.cease_flag).length);
        setCeaseDesistCount(violations.filter(v => v.cease_flag === true).length);
      } catch (err) {
        console.error('fetchViolationCounts error:', err);
      }
    };
    fetchViolationCounts();
  }, [noticeRange]);

  useEffect(() => {
    const fetchSchedules = async () => {
      const { data, error } = await supabase
        .from("business_records")
        .select('scheduled_date, "Business Identification Number", "Business Name"')
        .not("scheduled_date", "is", null);
      if (error) { console.error("Schedule fetch error:", error); return; }
      const rows = data ?? [];
      const byDate: Record<string, any[]> = {};
      const byDay: Record<number, any[]> = {};
      rows.forEach((r) => {
        const dateOnly = r.scheduled_date.split("T")[0];
        const [y, m, d] = dateOnly.split("-").map(Number);
        const title =
          `${r["Business Name"] ?? ""}` +
          (r["Business Name"] ? " — " : "") +
          `${r["Business Identification Number"]}`;
        const event = {
          title,
          time: "",
          color: "bg-blue-500",
          colorDot: "bg-blue-500",
          bin: r["Business Identification Number"],
        };
        if (!byDate[dateOnly]) byDate[dateOnly] = [];
        byDate[dateOnly].push(event);
        if (y === currentMonth.getFullYear() && m - 1 === currentMonth.getMonth()) {
          if (!byDay[d]) byDay[d] = [];
          byDay[d].push({ title, time: "", color: "bg-blue-500", bin: r["Business Identification Number"] });
        }
      });
      setMockEventsByDate(byDate);
      setDesktopMockEvents(byDay);
    };
    fetchSchedules();
  }, [currentMonth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const portalEl = document.getElementById('range-dropdown-portal');
      const clickedDesktop = desktopDropdownButtonRef.current?.contains(target);
      const clickedMobile  = mobileDropdownButtonRef.current?.contains(target);
      const clickedPortal  = portalEl?.contains(target);
      if (!clickedDesktop && !clickedMobile && !clickedPortal) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!dropdownOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setDropdownOpen(prev => !prev);
  };

  const handleOpenReview = useCallback(async (bin: string) => {
    setLoadingBin(bin);
    const { data, error } = await supabase
      .from("business_records")
      .select("*")
      .eq("Business Identification Number", bin)
      .single();
    setLoadingBin(null);
    if (error || !data) { console.error("Failed to fetch record:", error); return; }
    setReviewRecord(data as BusinessRecord);
  }, []);

  const handleReviewSave = async (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
    photoUrl?: string;
    reviewedBy?: string;
  }) => {
    if (!reviewRecord) return;
    const updates: Record<string, any> = {
      review_action: reviewData.reviewActions.join(", ") || null,
      violation: reviewData.violations.join(", ") || null,
      status: reviewData.reviewActions[reviewData.reviewActions.length - 1]?.toLowerCase().replace(/ /g, "_") ?? null,
      review_date: new Date().toISOString(),
      reviewed_by: reviewData.reviewedBy ?? null,
      assigned_inspector: reviewData.assignedInspector ?? null,
      scheduled_date: reviewData.scheduledDate ?? null,
      schedule_time: reviewData.scheduledTime ?? null,
      latitude: reviewData.location?.lat?.toString() ?? null,
      longitude: reviewData.location?.lng?.toString() ?? null,
      accuracy: reviewData.location?.accuracy?.toString() ?? null,
      photo: reviewData.photoUrl ?? null,
    };
    await supabase
      .from("business_records")
      .update(updates)
      .eq("Business Identification Number", reviewRecord["Business Identification Number"]);
    setReviewRecord(null);
  };

  const PortalDropdown = () => {
    if (!dropdownOpen || !dropdownPos) return null;
    return createPortal(
      <div
        id="range-dropdown-portal"
        style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
        className="w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
      >
        {rangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => { setNoticeRange(option.value); setDropdownOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
              ${noticeRange === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {option.label}
          </button>
        ))}
      </div>,
      document.body
    );
  };

  const kpiData = [
    { title: "Active Businesses", value: String(activeCount),        icon: Building2,     iconColor: "text-blue-400" },
    { title: "Compliant",         value: String(compliantCount),     icon: CheckCircle,   iconColor: "text-green-400" },
    { title: "For Inspection",    value: String(forInspectionCount), icon: ClipboardList, iconColor: "text-yellow-400" },
    { title: "Non-Compliant",     value: String(nonCompliantCount),  icon: AlertTriangle, iconColor: "text-red-400" },
  ];

  const noticeStats = [
    { title: "Notice 1 Sent",  value: String(notice1Count),     icon: Mail,  iconColor: "text-indigo-400" },
    { title: "Notice 2 Sent",  value: String(notice2Count),     icon: Mail,  iconColor: "text-purple-400" },
    { title: "Notice 3 Sent",  value: String(notice3Count),     icon: Mail,  iconColor: "text-pink-400" },
    { title: "Active Cases",   value: String(activeCasesCount), icon: Gavel, iconColor: "text-orange-400" },
    { title: "Cease & Desist", value: String(ceaseDesistCount), icon: Ban,   iconColor: "text-red-400" },
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
  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const getScheduleDaysForMonth = (month: Date) => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const daysCount = new Date(year, m + 1, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const day = i + 1;
      const key = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { day, date: new Date(year, m, day), events: mockEventsByDate[key] ?? [] };
    });
  };

  const scheduleMonthLabel = scheduleMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevScheduleMonth  = () => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() - 1, 1));
  const nextScheduleMonth  = () => setScheduleMonth(new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth() + 1, 1));
  const scheduleDays       = getScheduleDaysForMonth(scheduleMonth);

  const isTodayRow = (day: number) =>
    day === today.getDate() &&
    scheduleMonth.getMonth() === today.getMonth() &&
    scheduleMonth.getFullYear() === today.getFullYear();

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <PortalDropdown />

      {reviewRecord && (
        <ReviewModal
          selectedRow={reviewRecord}
          showReviewModal={true}
          isMobile={isMobile}
          onClose={() => setReviewRecord(null)}
          onSave={handleReviewSave}
          onRecordUpdated={(updated) => setReviewRecord(updated)}
          onRecordDeleted={() => setReviewRecord(null)}
        />
      )}

      {/* ── MOBILE ── */}
      {isMobile && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="px-3 py-3 pb-28 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Overview</h1>
                <p className="text-slate-500 text-xs mt-0.5">Real-time inspection and notice monitoring</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-900 rounded-full animate-pulse" />
                <span className="text-sm text-slate-500">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <kpi.icon size={12} className={`${kpi.iconColor} shrink-0`} />
                  </div>
                  <p className="text-slate-500 text-xs font-medium mb-1 leading-tight">{kpi.title}</p>
                  <h3 className="text-xl font-bold text-slate-800 leading-none">{kpi.value}</h3>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">Notice Statistics</h2>
                <button
                  ref={mobileDropdownButtonRef}
                  onClick={() => handleDropdownToggle(mobileDropdownButtonRef)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {selectedLabel}
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {noticeStats.map((stat, index) => (
                  <div key={index} className="flex flex-col p-2 rounded-xl bg-white border border-slate-100">
                    <div className="flex items-center gap-1 mb-1.5">
                      <stat.icon size={11} className={`${stat.iconColor} shrink-0`} />
                    </div>
                    <p className="text-lg font-bold text-slate-800 leading-none">{stat.value}</p>
                    <p className="text-slate-500 mt-1 leading-tight" style={{ fontSize: '8.5px' }}>{stat.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Schedule */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                <span className="text-base font-bold text-slate-800">Schedule</span>
                <div className="flex items-center space-x-1">
                  <button onClick={prevScheduleMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronLeft size={15} className="text-slate-600" />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 min-w-[100px] text-center">{scheduleMonthLabel}</span>
                  <button onClick={nextScheduleMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                    <ChevronRight size={15} className="text-slate-600" />
                  </button>
                </div>
              </div>
              <div ref={mobileScrollRef} className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {scheduleDays.map(({ day, date, events }) => (
                  <ScheduleRow
                    key={day}
                    day={day}
                    date={date}
                    events={events}
                    isToday={isTodayRow(day)}
                    isMobileView={true}
                    todayRef={mobileTodayRef}
                    loadingBin={loadingBin}
                    onOpenReview={handleOpenReview}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <InspectorSummary />
            </div>
          </div>
          <MobileBottomNav />
        </div>
      )}

      {/* ── DESKTOP ── */}
      {!isMobile && (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="px-8 py-6 h-full flex flex-col">

            <div className="mb-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Overview</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Real-time inspection and notice monitoring</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-green-900 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-500">Live</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5 mb-5 shrink-0">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <kpi.icon size={14} className={`${kpi.iconColor} shrink-0`} />
                    <p className="text-sm text-slate-500 font-medium">{kpi.title}</p>
                  </div>
                  <h3 className="text-4xl font-bold text-slate-800 leading-none">{kpi.value}</h3>
                </div>
              ))}
            </div>

            <div className="mb-5 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Notice Statistics</span>
                </div>
                <button
                  ref={desktopDropdownButtonRef}
                  onClick={() => handleDropdownToggle(desktopDropdownButtonRef)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  {selectedLabel}
                  <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-5">
                {noticeStats.map((stat, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={13} className={`${stat.iconColor} shrink-0`} />
                      <p className="text-xs text-slate-500 font-medium truncate">{stat.title}</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 leading-none">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">

              <div className="w-1/2 flex flex-col">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={18} className="text-slate-500" />
                      <span className="text-sm font-bold text-slate-800">Schedule</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={prevScheduleMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronLeft size={15} className="text-slate-600" />
                      </button>
                      <span className="text-xs font-semibold text-slate-600 min-w-[110px] text-center">{scheduleMonthLabel}</span>
                      <button onClick={nextScheduleMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronRight size={15} className="text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={desktopScrollRef}
                    className="overflow-y-auto divide-y divide-slate-100"
                    style={{ maxHeight: '460px' }}
                  >
                    {scheduleDays.map(({ day, date, events }) => (
                      <ScheduleRow
                        key={day}
                        day={day}
                        date={date}
                        events={events}
                        isToday={isTodayRow(day)}
                        isMobileView={false}
                        todayRef={desktopTodayRef}
                        loadingBin={loadingBin}
                        onOpenReview={handleOpenReview}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-1/2 min-h-0 overflow-y-auto rounded-2xl">
                <InspectorSummary />
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardPageContent />
    </ProtectedRoute>
  );
}