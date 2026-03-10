"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "../../../components/sidebar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Violation = {
  id: number;
  business_id: string;
  violation: string;
  notice_level: number;
  last_sent_time: string | null;
  interval_days: number | null;
  resolved: boolean;
  requestor_email: string | null;
  cease_flag?: boolean;
};

export default function ViolationsPage() {

  const [violations, setViolations] = useState<Violation[]>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof Violation | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selected,setSelected] = useState<number[]>([]);

  const fetchViolations = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .ilike("business_id", `%${query}%`)
      .order(sortKey || "id", { ascending: sortAsc });

    if (error) console.error(error);
    else setViolations(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchViolations();
  }, [query, sortKey, sortAsc]);

  const toggleSort = (key: keyof Violation) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const toggleSelect = (id:number)=>{
    if(selected.includes(id)){
      setSelected(selected.filter(i=>i!==id))
    }else{
      setSelected([...selected,id])
    }
  }

  const handleSendSelected = async ()=>{

    if(selected.length===0){
      alert("No violations selected");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/manual-send-notice",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ids:selected })
    });

    const data = await res.json();

    if(data.success){
      alert("Selected notices sent!");
      setSelected([]);
      fetchViolations();
    }

    setLoading(false);
  }

  const getNoticeStatus = (notice: number, v: Violation) => {

    const level = v.notice_level || 0;

    if (v.resolved) return "Resolved";

    if (level >= notice) return "Sent";

    return "Pending";
  };

  const getStatusText = (v: Violation) => {
    if (v.resolved) return "Resolved";
    if (v.cease_flag) return "Cease and Desist";
    return "Pending";
  };

  const renderSortIcon = (key: keyof Violation) => {
    if (sortKey !== key)
      return <FiChevronDown className="inline ml-1 text-green-200" />;

    return sortAsc ? (
      <FiChevronUp className="inline ml-1 text-green-200" />
    ) : (
      <FiChevronDown className="inline ml-1 text-green-200" />
    );
  };

  const StatusBadge = ({ v }: { v: Violation }) => {

    const status = getStatusText(v);

    if (status === "Resolved")
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-900">
          Resolved
        </span>
      );

    if (status === "Cease and Desist")
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
          Cease & Desist
        </span>
      );

    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
        Pending
      </span>
    );
  };

  const NoticeBadge = ({ notice, v }: { notice: number; v: Violation }) => {

    const s = getNoticeStatus(notice, v);

    if (s === "Sent")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-900">
          Sent
        </span>
      );

    if (s === "Resolved")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
          Resolved
        </span>
      );

    return (
      <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-700">
        Pending
      </span>
    );
  };

  const canSendNotice = (v: Violation) => {

    if (v.resolved) return false;

    const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;

    const interval = v.interval_days || 7;

    if (!lastSent) return true;

    const nextSend = new Date(
      lastSent.getTime() + interval * 24 * 60 * 60 * 1000
    );

    return new Date() >= nextSend;
  };

  const handleSendNotice = async (id: number) => {

    setLoading(true);

    const res = await fetch("/api/manual-send-notice", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) alert("Notice sent successfully!");
    else alert(`Failed: ${data.error}`);

    fetchViolations();

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 flex">

      <Sidebar
        isCollapsed={false}
        setIsCollapsed={() => {}}
        isMobile={false}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
      />

      <div className="flex-1 max-w-7xl mx-auto space-y-6 w-full">

        <div className="flex justify-between">

          <h1 className="text-3xl font-bold">Violations Monitoring</h1>

          <button
            onClick={handleSendSelected}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Send Selected Notices
          </button>

        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">

          <table className="min-w-full">

            <thead className="bg-green-900 text-white">

              <tr>

                <th className="px-4 py-3">

                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelected(violations.map((v) => v.id));
                      else setSelected([]);
                    }}
                  />

                </th>

                <th className="px-6 py-3">Business ID</th>
                <th className="px-6 py-3">Violation</th>
                <th className="px-6 py-3">Notice 1</th>
                <th className="px-6 py-3">Notice 2</th>
                <th className="px-6 py-3">Notice 3</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>

              </tr>

            </thead>

            <tbody>

              {violations.map((v) => (

                <tr key={v.id} className="border-b">

                  <td className="px-4 py-4">

                    <input
                      type="checkbox"
                      checked={selected.includes(v.id)}
                      onChange={() => toggleSelect(v.id)}
                    />

                  </td>

                  <td className="px-6 py-4">{v.business_id}</td>

                  <td className="px-6 py-4">{v.violation}</td>

                  <td className="px-6 py-4">
                    <NoticeBadge notice={1} v={v} />
                  </td>

                  <td className="px-6 py-4">
                    <NoticeBadge notice={2} v={v} />
                  </td>

                  <td className="px-6 py-4">
                    <NoticeBadge notice={3} v={v} />
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge v={v} />
                  </td>

                  <td className="px-6 py-4">

                    <button
                      onClick={() => handleSendNotice(v.id)}
                      disabled={!canSendNotice(v)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Send Notice
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}