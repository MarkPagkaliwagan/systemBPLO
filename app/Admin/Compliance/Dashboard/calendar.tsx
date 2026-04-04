"use client";

import React, { useEffect, useState, JSX } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    FiChevronLeft,
    FiChevronRight,
    FiCalendar,
    FiAlertTriangle,
    FiClock,
    FiSearch,
    FiX,
    FiInfo,
    FiBriefcase,
    FiHash,
} from "react-icons/fi";
import { MdOutlineNotificationsActive } from "react-icons/md";
import DetailsForBusinessFormModal from "./DetailsForBusinessFormModal";

type Violation = {
    id: number;
    business_id: string;
    business_name?: string;
    violation: string;
    last_sent_time: string | null;
    interval_days: number | null;
    resolved: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export default function CalendarSection() {
    const [schedule, setSchedule] = useState<Record<string, Violation[]>>({});
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("business_violations")
            .select("*")
            .eq("resolved", false);

        if (!data) {
            setLoading(false);
            return;
        }

        const grouped: Record<string, Violation[]> = {};
        (data as Violation[]).forEach((v) => {
            const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
            const interval = v.interval_days ?? 7;
            const nextSend = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
            const key = nextSend.toISOString().split("T")[0];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(v);
        });

        setSchedule(grouped);
        setDates(Object.keys(grouped).sort());
        setLoading(false);
    };

    const handlePrevMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const today = new Date();

    const totalNoticesThisMonth = Object.entries(schedule).reduce((acc, [key, violations]) => {
        const d = new Date(key);
        if (
            d.getMonth() === currentMonth.getMonth() &&
            d.getFullYear() === currentMonth.getFullYear()
        ) {
            return acc + violations.length;
        }
        return acc;
    }, 0);

    const openBusinessDetails = async (businessId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("business_records")
                .select("*")
                .eq("Business Identification Number", businessId)
                .single();
            if (error) {
                console.error(error);
                alert("Failed to load business details");
                return;
            }
            setSelectedBusiness(data);
            setDetailsModalOpen(true);
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const filteredViolations = selectedDate
        ? (schedule[selectedDate] || []).filter(
            (v) =>
                !search ||
                v.business_name?.toLowerCase().includes(search.toLowerCase()) ||
                v.business_id?.toLowerCase().includes(search.toLowerCase()) ||
                v.violation?.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    const formatDateLabel = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
    };

    const getUrgencyColor = (v: Violation) => {
        const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
        const interval = v.interval_days ?? 7;
        const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
        const diff = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) return "border-l-red-500 bg-red-50";
        if (diff <= 3) return "border-l-amber-400 bg-amber-50";
        return "border-l-emerald-500 bg-emerald-50";
    };

    const getUrgencyBadge = (v: Violation) => {
        const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
        const interval = v.interval_days ?? 7;
        const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
        const diff = Math.ceil((next.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diff <= 1) return { label: "Due Soon", cls: "bg-red-100 text-red-700" };
        if (diff <= 3) return { label: "Upcoming", cls: "bg-amber-100 text-amber-700" };
        return { label: "Scheduled", cls: "bg-emerald-100 text-emerald-700" };
    };

    const renderCalendar = () => {
        const cells: JSX.Element[] = [];

        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={"empty" + i} className="h-14" />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
            const key = date.toISOString().split("T")[0];
            const count = schedule[key]?.length || 0;
            const isToday =
                today.getDate() === d &&
                today.getMonth() === currentMonth.getMonth() &&
                today.getFullYear() === currentMonth.getFullYear();
            const isSelected = selectedDate === key;
            const isPast = date < new Date(today.toDateString());

            cells.push(
                <button
                    key={key}
                    onClick={() => setSelectedDate(isSelected ? null : key)}
                    className={`
                        relative h-14 rounded-xl flex flex-col justify-center items-center
                        border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
                        ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.03]"
                            : isToday
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : count > 0
                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400"
                            : isPast
                            ? "border-transparent bg-gray-50 text-gray-300 cursor-default"
                            : "border-transparent bg-white hover:bg-gray-100 hover:border-gray-200"
                        }
                    `}
                    aria-label={`${d} ${count > 0 ? `${count} notice${count > 1 ? "s" : ""}` : ""}`}
                >
                    <span className={`text-sm font-bold leading-none ${isSelected ? "text-white" : isToday ? "text-blue-700" : "text-gray-800"}`}>
                        {d}
                    </span>

                    {isToday && !isSelected && (
                        <span className="mt-0.5 text-[9px] font-semibold text-blue-500 uppercase tracking-wide">Today</span>
                    )}

                    {count > 0 && (
                        <span className={`
                            absolute top-1 right-1 min-w-[17px] h-[17px] px-1 flex items-center justify-center
                            text-[10px] font-bold rounded-full shadow-sm
                            ${isSelected ? "bg-white text-blue-600" : "bg-red-500 text-white"}
                        `}>
                            {count}
                        </span>
                    )}
                </button>
            );
        }

        return cells;
    };

    return (
        <div className="w-full font-sans">
            <div className="flex flex-col gap-4">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
                            <FiCalendar className="text-white text-base" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-gray-900 tracking-tight leading-none">
                                Notice Calendar
                            </h2>
                            <p className="text-[11px] text-gray-500 mt-0.5">Scheduled violation notices overview</p>
                        </div>
                    </div>

                    {/* Stats chips */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium text-gray-600">
                            <MdOutlineNotificationsActive className="text-blue-500 text-sm" />
                            <span>{totalNoticesThisMonth} notice{totalNoticesThisMonth !== 1 ? "s" : ""} this month</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm text-xs font-medium text-gray-600">
                            <FiAlertTriangle className="text-amber-500 text-sm" />
                            <span>{dates.length} scheduled date{dates.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">

                    {/* ── CALENDAR CARD ── */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Month nav */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <button
                                onClick={handlePrevMonth}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                                aria-label="Previous month"
                            >
                                <FiChevronLeft className="text-sm" />
                            </button>

                            <span className="font-bold text-gray-900 text-sm tracking-wide">
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>

                            <button
                                onClick={handleNextMonth}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                                aria-label="Next month"
                            >
                                <FiChevronRight className="text-sm" />
                            </button>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 text-center px-3 pt-2 pb-1">
                            {DAYS.map((d) => (
                                <div key={d} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="px-3 pb-3">
                            {loading ? (
                                <div className="grid grid-cols-7 gap-1.5 animate-pulse pt-1.5">
                                    {Array.from({ length: 35 }).map((_, i) => (
                                        <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 gap-1.5 pt-1.5">
                                    {renderCalendar()}
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                            {[
                                { color: "bg-blue-600", label: "Selected" },
                                { color: "bg-emerald-500", label: "Has Notices" },
                                { color: "border-2 border-blue-400 bg-blue-50", label: "Today" },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                                    <span className="text-[10px] text-gray-400">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── DETAILS PANEL ── */}
                    <div className="lg:w-[360px] flex flex-col gap-3">
                        {!selectedDate ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2.5">
                                    <FiCalendar className="text-gray-400 text-xl" />
                                </div>
                                <p className="text-sm font-semibold text-gray-700">Select a date</p>
                                <p className="text-xs text-gray-400 mt-1">Click any date on the calendar to view scheduled notices</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                                {/* Panel header */}
                                <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Notices for</p>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">
                                            {formatDateLabel(selectedDate)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="mt-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition"
                                        aria-label="Close"
                                    >
                                        <FiX className="text-sm" />
                                    </button>
                                </div>

                                {/* Search */}
                                {(schedule[selectedDate]?.length ?? 0) > 3 && (
                                    <div className="px-4 pt-2.5">
                                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                            <FiSearch className="text-gray-400 text-xs shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search business or violation..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none"
                                            />
                                            {search && (
                                                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                                                    <FiX className="text-[10px]" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* List */}
                                <div className="px-3 py-2.5 max-h-[420px] overflow-y-auto space-y-2">
                                    {filteredViolations.length === 0 ? (
                                        <div className="flex flex-col items-center py-8 text-center">
                                            <FiInfo className="text-gray-300 text-2xl mb-2" />
                                            <p className="text-sm text-gray-400">No notices found</p>
                                        </div>
                                    ) : (
                                        filteredViolations.map((v) => {
                                            const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                                            const interval = v.interval_days ?? 7;
                                            const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
                                            const badge = getUrgencyBadge(v);
                                            const urgency = getUrgencyColor(v);

                                            return (
                                                <button
                                                    key={v.id}
                                                    onClick={() => openBusinessDetails(v.business_id)}
                                                    className={`
                                                        w-full text-left rounded-xl border-l-4 border border-gray-200 p-3
                                                        hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                                                        ${urgency}
                                                    `}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <FiBriefcase className="text-gray-400 text-xs shrink-0" />
                                                                <span className="text-sm font-bold text-gray-900 truncate">
                                                                    {v.business_name || "Unknown Business"}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <FiHash className="text-gray-300 text-xs shrink-0" />
                                                                <span className="text-[11px] text-gray-400 font-mono">{v.business_id}</span>
                                                            </div>

                                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                                {v.violation}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                                                                {badge.label}
                                                            </span>
                                                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                                                <FiClock className="text-xs" />
                                                                <span>{next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Panel footer */}
                                {filteredViolations.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-400">
                                        Showing {filteredViolations.length} of {schedule[selectedDate]?.length ?? 0} notice{(schedule[selectedDate]?.length ?? 0) !== 1 ? "s" : ""}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DetailsForBusinessFormModal
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                data={selectedBusiness}
                tableName="business_records"
            />
        </div>
    );
}
