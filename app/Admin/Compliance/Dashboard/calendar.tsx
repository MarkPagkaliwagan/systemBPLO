"use client";

import React, { JSX, useEffect, useState } from "react";
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
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

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

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getHeatClass = (count: number) => {
    if (count === 0) return "bg-transparent";
    if (count <= 2) return "bg-green-200";
    if (count <= 4) return "bg-green-400";
    if (count <= 6) return "bg-green-600";
    return "bg-green-900 text-white";
  };

  const renderCalendar = () => {
    const cells: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={"empty" + i} className="h-16" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().split("T")[0];
      const count = schedule[key]?.length || 0;
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

      cells.push(
        <button
          key={d}
          onClick={() => setSelectedDate(key)}
          className={`relative flex flex-col items-start gap-1 p-2 h-16 rounded-md transition-all duration-200 outline-none
            ${isToday ? "bg-green-50 ring-2 ring-green-300" : "hover:bg-green-100"} ${getHeatClass(count)}`}
        >
          <div className="flex items-center w-full justify-between">
            <div className={`text-sm font-medium ${isToday ? "text-green-900" : "text-gray-800"}`}>{d}</div>
            {count > 0 && (
              <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900 text-white shadow">
                {count}
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500 truncate w-full">
            {schedule[key]?.slice(0, 2).map((s) => s.business_id).join(", ")}
            {schedule[key] && schedule[key].length > 2 ? "..." : ""}
          </div>
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">Notice Schedule</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <button onClick={handlePrevMonth} className="p-2 rounded hover:bg-green-100 transition" title="Previous month">
              <FiChevronLeft size={20} />
            </button>
            <span className="text-sm md:text-base font-medium">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button onClick={handleNextMonth} className="p-2 rounded hover:bg-green-100 transition" title="Next month">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* DESKTOP CALENDAR */}
        <div className="hidden md:block bg-white rounded-2xl shadow-md border">
          <div className="grid grid-cols-7 gap-1 px-4 py-2 border-b text-xs text-gray-600 font-medium">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2">{renderCalendar()}</div>
        </div>

        {/* MOBILE LIST */}
        <div className="md:hidden space-y-2">
          {dates.length === 0 && (
            <div className="bg-white border rounded-xl shadow p-4 text-center text-gray-500 text-sm">
              No scheduled notices
            </div>
          )}

          {dates.map((date) => {
            const list = schedule[date];
            const d = new Date(date);

            return (
              <div key={date} className="bg-white rounded-xl shadow-md border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2">
                  <div>
                    <div className="text-xs text-gray-500">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="text-sm font-semibold text-gray-900">{d.toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-white font-semibold bg-green-900 px-2 py-0.5 rounded-full shadow">
                      {list.length}
                    </div>
                    <button className="text-xs text-gray-500" onClick={() => setSelectedDate(date)}>View</button>
                  </div>
                </div>

                <div className="divide-y">
                  {list.map((v) => {
                    const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                    const interval = v.interval_days ?? 7;
                    const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);

                    return (
                      <div key={v.id} className="p-2 flex items-start justify-between hover:bg-green-50 transition rounded-md">
                        <div className="pr-2 w-3/4">
                          <div className="text-sm font-medium text-green-900">{v.business_id}</div>
                          <div className="text-[12px] text-gray-500 truncate">{v.violation}</div>
                        </div>
                        <div className="text-xs text-green-900 font-medium">{next.toLocaleTimeString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP SELECTED DATE PANEL */}
        {selectedDate && (
          <div className="hidden md:block bg-white rounded-2xl shadow-md border p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-base font-semibold text-green-900">Schedule for {selectedDate}</h2>
              <button className="text-xs md:text-sm text-gray-500 hover:text-gray-700" onClick={() => setSelectedDate(null)}>Close</button>
            </div>

            <div className="space-y-2">
              {schedule[selectedDate]?.map((v) => {
                const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                const interval = v.interval_days ?? 7;
                const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);

                return (
                  <div key={v.id} className="flex items-center justify-between border rounded-lg p-3 hover:shadow transition">
                    <div>
                      <div className="text-sm font-medium text-green-900">{v.business_id}</div>
                      <div className="text-xs text-gray-500">{v.violation}</div>
                    </div>
                    <div className="text-xs text-green-900 font-semibold">{next.toLocaleTimeString()}</div>
                  </div>
                );
              })}
              {!schedule[selectedDate] && (
                <div className="text-gray-500 text-center py-4">No data found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}