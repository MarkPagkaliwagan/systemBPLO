"use client";

import { useEffect, useState } from "react";
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

    data.forEach((v: Violation) => {
      const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
      const interval = v.interval_days ?? 7;

      const nextSend = new Date(
        last.getTime() + interval * 24 * 60 * 60 * 1000
      );

      const key = nextSend.toISOString().split("T")[0];

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(v);
    });

    setSchedule(grouped);
    setDates(Object.keys(grouped).sort());
  };

  const renderCalendar = () => {
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={"empty" + i}></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().split("T")[0];
      const count = schedule[key]?.length || 0;

      const isToday =
        today.getDate() === d && today.getMonth() === month;

      cells.push(
        <div
          key={d}
          onClick={() => setSelectedDate(key)}
          className={`h-24 border p-2 relative cursor-pointer transition hover:bg-green-50
          ${isToday ? "bg-green-100 border-green-400" : ""}`}
        >
          <div className="text-sm font-semibold text-gray-800">{d}</div>

          {count > 0 && (
            <div className="absolute top-1 right-1 w-6 h-6 bg-green-900 text-white text-xs rounded-full flex items-center justify-center">
              {count}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 px-4 md:px-6 flex flex-col md:flex-row">


      <div className="flex-1 max-w-6xl mx-auto space-y-6 w-full">

        {/* Header */}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-green-900">
            Notice Schedule
          </h1>

          <div className="text-sm text-gray-500">
            {today.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* DESKTOP CALENDAR */}

        <div className="hidden md:block bg-white rounded-2xl shadow-lg border overflow-hidden">

          <div className="grid grid-cols-7 bg-green-900 text-white text-sm font-semibold">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=>(
              <div key={d} className="py-3 text-center">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>

        </div>

        {/* MOBILE GOOGLE CALENDAR STYLE */}

        <div className="md:hidden space-y-5">

          {dates.length === 0 && (
            <div className="bg-white border rounded-xl shadow p-8 text-center text-gray-500">
              No scheduled notices
            </div>
          )}

          {dates.map((date) => {

            const list = schedule[date];
            const d = new Date(date);

            return (
              <div key={date} className="bg-white rounded-2xl shadow border">

                {/* Date Header */}

                <div className="flex justify-between items-center px-4 py-3 border-b">

                  <div>
                    <div className="text-xs text-gray-500">
                      {d.toLocaleDateString("en-US",{weekday:"long"})}
                    </div>

                    <div className="text-lg font-semibold text-gray-900">
                      {d.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="w-7 h-7 bg-green-900 text-white text-xs rounded-full flex items-center justify-center">
                    {list.length}
                  </div>

                </div>

                {/* Events */}

                <div className="divide-y">

                  {list.map((v)=>{

                    const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
                    const interval = v.interval_days ?? 7;

                    const next = new Date(
                      last.getTime()+interval*24*60*60*1000
                    );

                    return(

                      <div key={v.id} className="p-4 flex justify-between items-start">

                        <div>

                          <div className="font-semibold text-gray-900">
                            {v.business_id}
                          </div>

                          <div className="text-sm text-gray-500">
                            {v.violation}
                          </div>

                        </div>

                        <div className="text-sm text-green-900 font-medium">
                          {next.toLocaleTimeString()}
                        </div>

                      </div>

                    )

                  })}

                </div>

              </div>
            )

          })}

        </div>

        {/* DESKTOP EVENT LIST */}

        {selectedDate && (
          <div className="hidden md:block bg-white rounded-2xl shadow border p-5">

            <h2 className="font-semibold text-green-900 mb-4">
              Schedule for {selectedDate}
            </h2>

            {schedule[selectedDate]?.map((v)=>{

              const last = v.last_sent_time ? new Date(v.last_sent_time) : new Date();
              const interval = v.interval_days ?? 7;

              const next = new Date(
                last.getTime()+interval*24*60*60*1000
              );

              return(

                <div key={v.id} className="border rounded-xl p-4 mb-3 flex justify-between">

                  <div>

                    <div className="font-semibold text-gray-900">
                      {v.business_id}
                    </div>

                    <div className="text-sm text-gray-500">
                      {v.violation}
                    </div>

                  </div>

                  <div className="text-sm text-green-900 font-medium">
                    {next.toLocaleTimeString()}
                  </div>

                </div>

              )

            })}

            {!schedule[selectedDate] && (
              <div className="text-gray-500 text-center py-6">
                No data found
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}