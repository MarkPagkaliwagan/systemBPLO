import StatCard from "../../components/statcard/page"; 
import Sidebar from "../../components/sidebar/page";

export default function AnalyticsDashboard() {
  return (
    <div className="flex h-screen bg-[#D9D9D9]">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="bg-[#B7E4A1] h-16 flex items-center justify-center border-b border-gray-400">
          <h1 className="text-xl font-medium text-black">
            Business Compliance and Inspection System
          </h1>
        </header>
        <div className="p-10 grid grid-cols-12 gap-8 h-full">    
          <div className="col-span-7 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              <StatCard title="Active" value="10" />
              <StatCard title="Compliant" value="10" />
              <StatCard title="non-compliant" value="10" />
              <StatCard title="Compliant" value="10" />
            </div>
            <div className="flex justify-center mt-4">
              <div className="w-2/3">
                <StatCard title="#Total of Masterlist" value="10" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}