"use client";

import React, { JSX, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

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

  const renderCalendar = () => {
    const cells: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={"empty" + i} className="p-2">
          <div className="h-16" />
        </div>
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().split("T")[0];
      const count = schedule[key]?.length || 0;

      const isToday = today.getDate() === d && today.getMonth() === month;

      cells.push(
        <button
          key={d}
          onClick={() => setSelectedDate(key)}
          className={`relative flex flex-col items-start gap-1 p-2 min-h-[64px] h-16 outline-none transition-all duration-150
            ${isToday ? "bg-green-50 ring-1 ring-green-200" : "hover:bg-gray-50"}`}
        >
          <div className="flex items-center gap-2 w-full">
            <div className="text-sm font-medium text-gray-800">{d}</div>
            <div className="flex-1 h-px bg-transparent" />
            {count > 0 && (
              <div className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-900 text-white">
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
    <div className="min-h-screen bg-gray-50 px-4 md:px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Notice Schedule</h1>
          </div>

          <div className="text-sm text-gray-600">{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        </div>

        {/* Desktop slim calendar */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="grid grid-cols-7 gap-2 w-full text-xs text-gray-600 font-medium">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div key={d} className="text-center">{d}</div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 p-2">
            {renderCalendar()}
          </div>
        </div>

        {/* Mobile slim list */}
        <div className="md:hidden mt-4 space-y-3">
          {dates.length === 0 && (
            <div className="bg-white border rounded-xl shadow p-4 text-center text-gray-500 text-sm">No scheduled notices</div>
          )}

          {dates.map((date) => {
            const list = schedule[date];
            const d = new Date(date);

            return (
              <div key={date} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-xs text-gray-500">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="text-sm font-semibold text-gray-900">{d.toLocaleDateString()}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-green-900 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{list.length}</div>
                    <button className="text-xs text-gray-500" onClick={() => setSelectedDate(date)}>View</button>
                  </div>
                </div>

                <div className="divide-y">
                  {list.map((v) => {
                    const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                    const interval = v.interval_days ?? 7;
                    const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);

                    return (
                      <div key={v.id} className="p-3 flex items-start justify-between">
                        <div className="pr-4">
                          <div className="text-sm font-medium text-gray-900">{v.business_id}</div>
                          <div className="text-[12px] text-gray-500 truncate w-[60vw]">{v.violation}</div>
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

        {/* Desktop event list (right column feel but keeps within same flow) */}
        {selectedDate && (
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border p-4 mt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Schedule for {selectedDate}</h2>
              <button className="text-xs text-gray-500" onClick={() => setSelectedDate(null)}>Close</button>
            </div>

            <div className="space-y-3">
              {schedule[selectedDate]?.map((v) => {
                const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                const interval = v.interval_days ?? 7;
                const next = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);

                return (
                  <div key={v.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{v.business_id}</div>
                      <div className="text-xs text-gray-500">{v.violation}</div>
                    </div>

                    <div className="text-xs text-green-900 font-semibold">{next.toLocaleTimeString()}</div>
                  </div>
                );
              })}

              {!schedule[selectedDate] && (
                <div className="text-gray-500 text-center py-6">No data found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
