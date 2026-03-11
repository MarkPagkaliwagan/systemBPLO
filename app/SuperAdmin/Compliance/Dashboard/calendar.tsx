"use client";

import React, { useEffect, useState, JSX } from "react";
import { createClient } from "@supabase/supabase-js";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Violation = {
    id: number;
    business_id: string;
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

    useEffect(() => {
        loadSchedule();
    }, []);

    const loadSchedule = async () => {
        const { data } = await supabase
            .from("business_violations")
            .select("*")
            .eq("resolved", false);

        if (!data) return;

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
    };

    const handlePrevMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const today = new Date();

    const getHeatClass = (count: number) => {
        if (count === 0) return "";
        if (count <= 2) return "bg-green-200";
        if (count <= 4) return "bg-green-400";
        if (count <= 6) return "bg-green-600";
        return "bg-emerald-900 text-white"; // improved green
    };

    const renderCalendar = () => {
        const cells: JSX.Element[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(<div key={"empty" + i} className="h-12" />);
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
                    className={`relative h-12 border rounded flex flex-col justify-center items-center cursor-pointer
            ${selected ? "bg-emerald-200 border-emerald-600" : ""}
            ${isToday ? "border-blue-500 border-2" : ""}
            ${count > 0 ? "bg-green-50" : ""}
            hover:bg-green-100`}
                >
                    <span className="text-sm font-semibold text-gray-800">{d}</span>
                    {count > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-[1px] rounded-full font-bold shadow">
                            {count}
                        </span>
                    )}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="flex flex-col md:flex-row px-4 md:px-6 py-2"> {/* reduced top padding */}
            <div className="flex-1">
                <div className="max-w-full mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        {/* Title sa left */}
                        <h1 className="text-xl font-bold text-emerald-900">Notice Calendar</h1>

                        {/* Month navigator sa right */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevMonth}
                                className="flex items-center px-2 py-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            >
                                <FiChevronLeft />
                            </button>
                            <span className="font-semibold text-gray-800 text-sm capitalize">
                                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </span>
                            <button
                                onClick={handleNextMonth}
                                className="flex items-center px-2 py-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>

                    {/* CALENDAR */}
                    <div className="bg-white border rounded-xl shadow-sm p-3">
                        <div className="grid grid-cols-7 text-center text-xs mb-1">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d} className="font-semibold text-emerald-900">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-[3px]">{renderCalendar()}</div>
                    </div>

                    {/* DETAILS */}
                    {selectedDate && (
                        <div className="border rounded-xl p-4 bg-white shadow-sm">
                            <h2 className="text-sm font-semibold text-emerald-900 mb-3">{selectedDate}</h2>
                            {(schedule[selectedDate] || []).length === 0 ? (
                                <p className="text-sm text-gray-500">No data for this date</p>
                            ) : (
                                <div className="space-y-2">
                                    {schedule[selectedDate].map((v) => {
                                        const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                                        const interval = v.interval_days ?? 7;
                                        const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
                                        return (
                                            <div
                                                key={v.id}
                                                className="flex justify-between items-center border rounded p-2 text-sm hover:bg-green-50"
                                            >
                                                <div>
                                                    <div className="font-medium text-emerald-900">{v.business_id}</div>
                                                    <div className="text-xs text-gray-600">{v.violation}</div>
                                                </div>
                                                <div className="text-right text-xs text-gray-700">
                                                    <div className="font-medium">{next.toLocaleTimeString()}</div>
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
        </div>
    );
}