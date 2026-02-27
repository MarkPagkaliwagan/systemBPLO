"use client"; 
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../../components/statcard/page"; 
import Sidebar from "../../components/sidebar/page";

const data = [
  { name: "Active", value: 10, color: "#000000" },    
  { name: "Compliant", value: 10, color: "#4D4D4D" },  
  { name: "Non-Compliant", value: 10, color: "#808080" }, 
  { name: "For Inspection", value: 10, color: "#B3B3B3" }, 
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
    <div className="flex h-screen bg-[#D9D9D9]">
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isMobile ? 'pt-16' : (isCollapsed ? 'pl-20' : 'pl-80')
      }`}>
        <header className="bg-[#B7E4A1] h-16 flex items-center justify-center border-b border-gray-400">
          <h1 className="text-xl font-medium">Business Compliance and Inspection System</h1>
        </header>
        
        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 h-full">
            <div className="col-span-1 lg:col-span-7 flex flex-col gap-4 lg:gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                <StatCard title="Active" value="10" />
                <StatCard title="Compliant" value="10" />
                <StatCard title="Non-Compliant" value="10" />
                <StatCard title="For Inspection" value="10" />
              </div>
              <div className="flex justify-center">
                <div className="w-full sm:w-2/3 lg:w-2/3">
                  <StatCard title="Total of Masterlist" value="10" />
                </div>
              </div>
            </div>

            {/* Right: Pie Chart Section */}
            <div className="col-span-1 lg:col-span-5 bg-white rounded-[20px] lg:rounded-[50px] shadow-lg flex flex-col items-center justify-center p-4 lg:p-8 min-h-[400px] lg:min-h-[550px]">
              <h3 className="text-gray-500 font-bold mb-4 text-sm lg:text-base">Inspection Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={0}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}