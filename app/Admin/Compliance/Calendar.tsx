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
  differenceInDays,
} from "date-fns";

interface Violation {
  id: number;
  business_id: number | null;
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("violations").select(`
      id,
      business_id,
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
      .filter((v) => v.status !== "resolved")
      .map((v) => {
        const baseDate = v.last_notice_sent_at
          ? new Date(v.last_notice_sent_at)
          : new Date(v.created_at);
        const interval = v.buses?.interval_days ?? 3;
        const nextNotice = addDays(baseDate, interval);
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
        (a.buses?.business_name || "").localeCompare(b.buses?.business_name || "")
      );
    }
    if (sortBy === "notice") {
      data = [...data].sort((a, b) => a.notice_level - b.notice_level);
    }
    if (sortBy === "date") {
      data = [...data].sort(
        (a, b) => new Date(a.nextNotice).getTime() - new Date(b.nextNotice).getTime()
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
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const dates: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      dates.push(d);
    }
    return dates;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(addDays(currentMonth, -30));
  const handleNextMonth = () => setCurrentMonth(addDays(currentMonth, 30));

  return (
    <div className="flex flex-col md:flex-row">  {/* removed min-h-screen */}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between ">
                        <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Notice Calendar
              </h1>

            </div>
          </div>

      {/* SEARCH + SORT + REFRESH */}
<div className="flex flex-col sm:flex-row gap-3 flex-wrap items-center">
  <div className="flex items-center border rounded-md px-2 py-1 w-full sm:w-56">
    <FiSearch size={14} className="text-gray-500" />
    <input
      type="text"
      placeholder="Search business..."
      className="ml-2 outline-none text-sm w-full text-gray-800"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  <select
    className="border rounded-md px-2 py-1 text-sm text-gray-800"
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
  >
    <option value="date">Sort by Date</option>
    <option value="name">Sort by Business</option>
    <option value="notice">Sort by Notice Level</option>
  </select>
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <FiClock size={12} />
    <span>Cron: 8:00 AM daily</span>
    <button
      onClick={fetchData}
      className="p-1 rounded hover:bg-green-100 text-green-700"
      title="Refresh"
    >
      <FiRefreshCw size={14} />
    </button>
  </div>
</div>

          {/* CALENDAR */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="font-semibold text-green-700">{d}</div>
            ))}

            {monthDates.map((date) => {
              const key = format(date, "yyyy-MM-dd");
              const has = violationsByDate[key]?.length > 0;
              const selected = selectedDate && isSameDay(date, selectedDate);

              return (
                <div
                  key={key}
                  onClick={() => has && setSelectedDate(date)}
                  className={`h-12 border rounded flex flex-col justify-center items-center cursor-pointer
                    ${selected ? "bg-green-200" : has ? "bg-green-50" : ""}
                    hover:bg-green-100`}
                >
                  <span className="text-gray-800 font-medium">{date.getDate()}</span>
                  {has && (
                    <span className="text-[10px] text-green-800 font-semibold">
                      {violationsByDate[key].length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* DETAILS */}
          {selectedDate && (
            <div className="mt-5 border rounded-lg p-4 bg-white">
              <h2 className="text-sm font-semibold text-green-800 mb-3">
                {format(selectedDate, "MMMM dd yyyy")}
              </h2>
              <div className="space-y-2">
                {(violationsByDate[format(selectedDate, "yyyy-MM-dd")] || []).map(
                  (v: any) => {
                    const daysLeft = differenceInDays(v.nextNotice, new Date());
                    return (
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
                          <div className="font-medium">08:00 AM</div>
                          <div className="text-green-700 font-semibold">
                            {daysLeft > 0 && `${daysLeft} days`}
                            {daysLeft === 0 && "Today"}
                            {daysLeft < 0 && "Overdue"}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {loading && (
            <p className="text-center text-sm py-4 text-green-700">Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}