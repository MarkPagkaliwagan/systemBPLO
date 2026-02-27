"use client"; 
import { PieChart, Pie,Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../../components/statcard/page"; 
import Sidebar from "../../components/sidebar/page";

const data = [
  { name: "Active", value: 10, color: "#000000" },    
  { name: "Compliant", value: 10, color: "#4D4D4D" },  
  { name: "Non-Compliant", value: 10, color: "#808080" }, 
  { name: "For Inspection", value: 10, color: "#B3B3B3" }, 
];

export default function AnalyticsDashboard() {
  return (
    <div className="flex h-screen bg-[#D9D9D9] ml-80">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#B7E4A1] h-16 flex items-center justify-center border-b border-gray-400">
          <h1 className="text-xl font-medium">Business Compliance and Inspection System</h1>
        </header>
        <div className="p-10 grid grid-cols-12 gap-8 h-full items-start overflow-y-auto">
          <div className="col-span-7 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              <StatCard title="Active" value="10" />
              <StatCard title="Compliant" value="10" />
              <StatCard title="non-compliant" value="10" />
              <StatCard title="Compliant" value="10" />
            </div>
            <div className="flex justify-center">
              <div className="w-2/3">
                <StatCard title="#Total of Masterlist" value="10" />
              </div>
            </div>
          </div>

          {/* Right: Pie Chart Section matching image mockup */}
          <div className="col-span-5 bg-white rounded-[50px] shadow-lg flex flex-col items-center justify-center p-8 min-h-[550px]">
            <h3 className="text-gray-500 font-bold mb-4">Inspection Overview</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={0}
                  outerRadius={150}
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
      </main>
    </div>
  );
}