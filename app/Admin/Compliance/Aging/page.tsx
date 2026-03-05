"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar/page";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

interface ViolationRecord {
  id: number;
  business_id: number;
  notice_level: number;
  created_at: string;
  last_notice_sent_at: string;
  buses: {
    id: number;
    business_name: string;
    email: string;
  };
}

const ViolationDetailsPage = () => {
  const [record, setRecord] = useState<ViolationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Layout helper para sa mga rows (Sakto sa screenshot mo)
  const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex text-sm md:text-base py-1 border-b border-gray-50 last:border-0">
      <span className="w-1/3 md:w-1/4 font-medium text-gray-700">{label}</span>
      <span className="flex-1 text-gray-900">: {value}</span>
    </div>
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetching a single record (Pwedeng palitan ang .eq('id', 1) ng dynamic ID galing sa URL)
  useEffect(() => {
    const fetchSingleRecord = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("violations")
        .select(`*, buses ( id, business_name, email )`)
        .limit(1)
        .single();

      if (error) console.error(error);
      else setRecord(data as ViolationRecord);
      setLoading(false);
    };

    fetchSingleRecord();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Loading Details...</div>;
  if (!record) return <div className="p-10 text-center text-red-500">Record not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        isMobile={isMobile}
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
        isCollapsed={false}
        setIsCollapsed={() => {}}
      />

      <main className="flex-1 p-4 md:p-8 mt-10">
        {/* Navigation / Header Actions */}
        <div className="max-w-3xl mx-auto flex justify-between items-center mb-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-green-800 font-semibold transition-colors">
            <FiArrowLeft /> Back to List
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200">
              <FiPrinter className="text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200">
              <FiDownload className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* MAIN CARD (Ang iyong screenshot content) */}
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="p-6 md:p-10 space-y-8">
            
            {/* Section 1: Business Information */}
            <div>
              <div className="bg-[#0b5c3d] text-white text-center py-2.5 rounded-md font-bold text-lg mb-6 shadow-md uppercase tracking-wider">
                Business Information
              </div>
              <div className="space-y-2 px-2">
                <DetailRow label="Business ID" value={record.buses?.id || "N/A"} />
                <DetailRow label="Business Name" value={record.buses?.business_name || "N/A"} />
                <DetailRow label="Violation Type" value="Fire Safety" />
                <DetailRow label="Violation Date" value="February 25, 2026" />
                <DetailRow label="Deadline" value="February 28, 2026" />
                <DetailRow label="Status" value={record.notice_level >= 3 ? "Pending / Needs C&D Review" : "Active"} />
                <DetailRow label="Days Remaining" value="0" />
              </div>
            </div>

            {/* Section 2: Notice Timeline */}
            <div>
              <div className="bg-[#0b5c3d] text-white text-center py-2.5 rounded-md font-bold text-lg mb-6 shadow-md uppercase tracking-wider">
                Notice Timeline
              </div>
              <div className="space-y-2 px-2">
                <DetailRow label="Notice 1" value="Sent February 25, 2026" />
                <DetailRow label="Notice 2" value="Sent March 02, 2026" />
                <DetailRow label="Notice 3" value="Sent March 07, 2026" />
              </div>
            </div>

            {/* Section 3: Countdown Timer */}
            <div>
              <div className="bg-[#0b5c3d] text-white text-center py-2.5 rounded-md font-bold text-lg mb-6 shadow-md uppercase tracking-wider">
                Countdown Timer
              </div>
              <div className="space-y-2 px-2">
                <DetailRow label="Overall Deadline" value="March 10, 2026" />
                <DetailRow label="Days Remaining" value="0" />
              </div>
            </div>

          </div>
          
          {/* Footer Branding or Note */}
          <div className="bg-gray-50 px-10 py-4 text-center text-xs text-gray-400 border-t border-gray-100 italic">
            Official Record of Business Violation Compliance
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViolationDetailsPage;