"use client";

import React, { useEffect, useState, JSX } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DetailsForBusinessFormModal from "./DetailsForBusinessFormModal"; // Make sure modal component is imported



type Violation = {
    id: number;
    business_id: string;
    business_name?: string; // ✅ Added
    violation: string;
    last_sent_time: string | null;
    interval_days: number | null;
    resolved: boolean;
};

export default function CalendarPage() {
    const [schedule, setSchedule] = useState<Record<string, Violation[]>>({});
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

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

            const selected = selectedDate === key;

            cells.push(
                <div
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className={`
                        relative h-14 rounded-xl flex flex-col justify-center items-center cursor-pointer
                        border transition-all duration-200
                        ${selected ? "bg-green-200 border-green-700 shadow-md" : ""}
                        ${isToday ? "border-2 border-blue-500" : "border-gray-200"}
                        ${count > 0 ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"}
                    `}
                >
                    <span className="text-sm font-semibold text-gray-800">{d}</span>

                    {count > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full font-bold shadow">
                            {count}
                        </span>
                    )}
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="flex flex-col md:flex-row px-4 md:px-6 py-2">
            <div className="flex-1">
                <div className="max-w-full mx-auto flex flex-col gap-6">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">
                                Notice Calendar
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Scheduled notices overview
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded hover:bg-gray-100"
                            >
                                <FiChevronLeft />
                            </button>

                            <span className="font-semibold text-gray-800 text-sm">
                                {currentMonth.toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>

                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded hover:bg-gray-100"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>

                    {/* CALENDAR CARD */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-7 text-center text-xs mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d} className="font-semibold text-green-900">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-7 gap-2 animate-pulse">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="h-14 bg-gray-100 rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {renderCalendar()}
                            </div>
                        )}
                    </div>

                    {/* DETAILS CARD */}
                    {selectedDate && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                {selectedDate}
                            </h2>

                            {(schedule[selectedDate] || []).length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No scheduled notices for this date
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {schedule[selectedDate].map((v) => {
                                        const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                                        const interval = v.interval_days ?? 7;
                                        const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);

                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => openBusinessDetails(v.business_id)} // ✅ clickable
                                                className="flex justify-between items-center border border-gray-200 rounded-xl p-3 hover:bg-green-50 transition cursor-pointer"
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">
                                                        {v.business_name || "N/A"} {/* ✅ show name */}
                                                    </div>
                                                    <div className="text-xs text-gray-500 line-clamp-2">
                                                        {v.business_id}
                                                    </div>
                                                    <div className="text-xs text-gray-500 line-clamp-2">
                                                        {v.violation}
                                                    </div>
                                                </div>

                                                <div className="text-right text-xs text-gray-600">
                                                    <div className="font-semibold">
                                                        {next.toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-gray-400">
                                                        Next Send
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

<DetailsForBusinessFormModal
  open={detailsModalOpen}
  onClose={() => setDetailsModalOpen(false)}
  data={selectedBusiness}
  tableName="business_records" // ✅ ADD THIS
/>
        </div>
    );
}