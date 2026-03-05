"use client";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import StatCard from "../../../../components/statcard/page";
import Sidebar from "../../../../components/sidebar/page";


// Updated data with green-800 centric color palette
const data = [
  { name: "Active", value: 10, color: "#166534" },        // green-800
  { name: "Compliant", value: 10, color: "#15803d" },     // green-700
  { name: "Non-Compliant", value: 10, color: "#b91c1c" }, // red-700 (for warning)
  { name: "For Inspection", value: 10, color: "#ca8a04" }, // yellow-600 (for attention)
];

export default function AnalyticsDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Fixed Top Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50 pt-1">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">Analytics</h1>
            <p className="text-gray-500 mt-1">Real-time overview of your inspection data</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard title="Active" value="10" />
                <StatCard title="Compliant" value="10" />
                <StatCard title="Non-Compliant" value="10" />
                <StatCard title="For Inspection" value="10" />
              </div>
              <div className="bg-green-800 rounded-3xl p-8 text-white shadow-xl shadow-green-900/20 flex flex-col items-center justify-center">
                 <h4 className="text-green-100 uppercase tracking-widest text-xs font-bold mb-2">Total of</h4>
                 <span className="text-5xl font-black">10</span>
              </div>
            </div>

            {/* Right: Pie Chart Section */}
            <div className="col-span-1 lg:col-span-5 bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center p-8">
              <div className="w-full flex justify-between items-center mb-6">
                <h3 className="text-gray-800 font-bold text-lg">Inspection Overview</h3>
                <span className="bg-green-100 text-green-800 text-[10px] px-2 py-1 rounded-full font-bold uppercase">Live Data</span>
              </div>

              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={80} 
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-2 gap-4 w-full mt-4">
                {data.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}