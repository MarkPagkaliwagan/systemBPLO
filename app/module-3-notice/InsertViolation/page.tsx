"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "../../module-3-notice/components/sidebar/page";
import {
  FiPlusCircle,
  FiDollarSign,
  FiBriefcase,
  FiArrowLeft,
} from "react-icons/fi";

interface Business {
  id: number;
  business_name: string;
}

export default function InsertViolationPage() {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [penalty, setPenalty] = useState<string>(""); // <-- changed to string
  const [loading, setLoading] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch businesses
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("buses") // <-- make sure your table name is correct
      .select("id, business_name");

    if (error) {
      console.error("Error fetching businesses:", error);
      return;
    }

    setBusinesses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusiness) {
      alert("Please select a business");
      return;
    }

    if (!penalty || Number(penalty) <= 0) { // validation
      alert("Please enter a valid penalty amount");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("violations").insert([
      {
        business_id: selectedBusiness,
        notice_level: 1,
        status: "open",
        penalty_amount: Number(penalty), // convert to number
        last_notice_sent_at: null,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error("Insert error:", error);
      alert("Failed to insert violation");
      return;
    }

    alert("Violation created successfully!");
    router.push("/module-3-notice/Dashboard");
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 transition-all duration-300 ${
        isMobile ? "pt-20 px-4" : isCollapsed ? "pl-20 px-10 py-10" : "pl-80 px-10 py-10"
      }`}
    >
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
              <FiPlusCircle /> Create Violation
            </h1>
            <p className="text-gray-500 mt-2">
              Add a new compliance violation record.
            </p>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 hover:shadow-md transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Business Select */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <FiBriefcase /> Select Business
              </label>

              <select
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 text-black focus:ring-green-500 focus:border-green-500 outline-none transition"
                value={selectedBusiness || ""}
                onChange={(e) => setSelectedBusiness(Number(e.target.value))}
              >
                <option value="">-- Choose Business --</option>
                {businesses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.business_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Penalty */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <FiDollarSign /> Penalty Amount (₱)
              </label>

              <input
                type="number"
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)} // <-- string
                placeholder="Enter penalty amount"
                className="w-full border border-gray-300 rounded-xl p-3 text-black focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 active:scale-95 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FiPlusCircle />
              {loading ? "Creating..." : "Create Violation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}