"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../../components/sidebar";
import { FiRefreshCw, FiSearch, FiClock } from "react-icons/fi";

import {
  addDays,
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

interface Violation {
  id: number;
  business_identification_number: string | null; // updated
  notice_level: number;
  status: string;
  last_notice_sent_at: string | null;
  created_at: string;
  buses: {
    business_name: string | null;
    interval_days: number;
  } | null;
}

export default function CalendarPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  /* realtime clock */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("violations").select(`
      id,
      business_identification_number,
      notice_level,
      status,
      last_notice_sent_at,
      created_at,
      buses (
        business_name,
        interval_days
      )
    `);

    setLoading(false);

    if (error) return console.error(error);

    setViolations(data as unknown as Violation[]);
  };

  const violationsWithNextNotice = useMemo(() => {
    return violations
      .filter((v) => v.status === "open")
      .map((v) => {
        const baseDate = v.last_notice_sent_at
          ? new Date(v.last_notice_sent_at)
          : new Date(v.created_at);

        const interval = v.buses?.interval_days ?? 3;

        let nextNotice = addDays(baseDate, interval);

        const utcYear = nextNotice.getUTCFullYear();
        const utcMonth = nextNotice.getUTCMonth();
        const utcDate = nextNotice.getUTCDate();

        nextNotice = new Date(Date.UTC(utcYear, utcMonth, utcDate, 0, 0, 0));
        nextNotice.setUTCHours(8);

        return { ...v, nextNotice };
      });
  }, [violations]);

  const filteredViolations = useMemo(() => {
    let data: any = violationsWithNextNotice;

    if (search) {
      data = data.filter((v: any) =>
        v.buses?.business_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "name") {
      data = [...data].sort((a, b) =>
        (a.buses?.business_name || "").localeCompare(
          b.buses?.business_name || ""
        )
      );
    }

    if (sortBy === "notice") {
      data = [...data].sort((a, b) => a.notice_level - b.notice_level);
    }

    if (sortBy === "date") {
      data = [...data].sort(
        (a, b) => a.nextNotice.getTime() - b.nextNotice.getTime()
      );
    }

    return data;
  }, [violationsWithNextNotice, search, sortBy]);

  const violationsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};

    filteredViolations.forEach((v: any) => {
      const key = format(v.nextNotice, "yyyy-MM-dd");

      if (!map[key]) map[key] = [];

      map[key].push(v);
    });

    return map;
  }, [filteredViolations]);

  const monthDates = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));

    const dates: Date[] = [];

    for (let d = start; d <= end; d = addDays(d, 1)) {
      dates.push(d);
    }

    return dates;
  }, [currentMonth]);

  const handlePrevMonth = () =>
    setCurrentMonth(addDays(startOfMonth(currentMonth), -1));

  const handleNextMonth = () =>
    setCurrentMonth(addDays(endOfMonth(currentMonth), 1));

  const getCountdown = (target: Date) => {
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return "Overdue";

    const totalSeconds = Math.floor(diff / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
        isCollapsed={false}
        setIsCollapsed={() => {}}
      />

      <div className="flex-1 px-3 md:py-4">
        <div className="max-w-full mx-auto flex flex-col gap-4">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Notice Calendar
            </h1>

           <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-1 border text-gray-400 rounded hover:bg-gray-100 text-sm"
              >
                Prev
              </button>

              <span className="font-semibold text-gray-800">
                {format(currentMonth, "MMMM yyyy")}
              </span>

              <button
                onClick={handleNextMonth}
                className="px-3 py-1 border text-gray-400  rounded hover:bg-gray-100 text-sm"
              >
                Next
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex flex-wrap gap-3 items-center">

            <div className="flex items-center border rounded-md px-2 py-1 w-56">
              <FiSearch size={14} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search business..."
                className="ml-2 outline-none text-sm w-full text-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="border rounded-md px-2 py-1 text-sm text-gray-900"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Business</option>
              <option value="notice">Sort by Notice Level</option>
            </select>

            <div className="flex items-center gap-2 text-xs text-gray-700">
              <FiClock size={12} />
              <span>Cron: 8:00 AM daily</span>
            </div>

          </div>

          {/* CALENDAR */}
          <div className="bg-white border rounded-xl shadow-sm p-3">

            <div className="grid grid-cols-7 text-center text-xs mb-1">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=>(

                <div key={d} className="font-semibold text-green-700">
                  {d}
                </div>

              ))}
            </div>

            <div className="grid grid-cols-7 gap-[3px]">

              {monthDates.map((date)=>{

                const key=format(date,"yyyy-MM-dd");
                const has=violationsByDate[key]?.length>0;
                const selected=selectedDate && isSameDay(date,selectedDate);
                const today=isSameDay(date,new Date());
                const isCurrentMonth=date.getMonth()===currentMonth.getMonth();

                return(

                  <div
                    key={key}
                    onClick={()=>setSelectedDate(date)}
                    className={`relative h-12 border rounded flex flex-col justify-center items-center cursor-pointer
                    ${selected?"bg-green-200 border-green-500":""}
                    ${today?"border-blue-500 border-2":""}
                    ${has?"bg-green-50":""}
                    ${!isCurrentMonth?"text-gray-300":""}
                    hover:bg-green-100`}

                  >

                    <span className="text-sm font-semibold text-gray-800">
                      {date.getDate()}
                    </span>

                    {has && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] px-1.5 py-[1px] rounded-full font-bold shadow">
                        {violationsByDate[key].length}
                      </span>
                    )}

                  </div>

                )

              })}

            </div>

          </div>

          {/* DETAILS */}
          {selectedDate && (

            <div className="border rounded-xl p-4 bg-white shadow-sm">

              <h2 className="text-sm font-semibold text-green-800 mb-3">
                {format(selectedDate,"MMMM dd yyyy")}
              </h2>

              {(violationsByDate[format(selectedDate,"yyyy-MM-dd")]||[]).length===0 && (
                <p className="text-sm text-gray-500">
                  No data for this date
                </p>
              )}

              <div className="space-y-2">

                {(violationsByDate[format(selectedDate,"yyyy-MM-dd")]||[]).map((v:any)=>{

                  return(

                    <div
                      key={v.id}
                      className="flex justify-between items-center border rounded p-2 text-sm hover:bg-green-50"
                    >

                      <div>

                        <div className="font-medium text-green-900">
                          {v.buses?.business_name ?? "No Business"}
                        </div>

                        <div className="text-xs text-gray-600">
                          Notice {v.notice_level + 1}
                        </div>

                      </div>

                      <div className="text-right text-xs text-gray-700">

                        <div className="font-medium">
                          {format(v.nextNotice,"hh:mm:ss a")}
                        </div>

                        <div className="text-green-700 font-semibold">
                          {getCountdown(v.nextNotice)}
                        </div>

                      </div>

                    </div>

                  )

                })}

              </div>
            </div>

          )}

          {loading && (
            <p className="text-center text-sm py-4 text-green-700">
              Loading...
            </p>
          )}

        </div>
      </div>
    </div>
  );
}