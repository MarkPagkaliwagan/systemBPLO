import StatCard from "../../components/statcard/page"; 

export default function AnalyticsDashboard() {
  return (
    <div className="flex h-screen bg-[#D9D9D9]">
      <aside className="w-64 bg-white flex flex-col border-r border-gray-300">
        <div className="p-6">
          <div className="w-12 h-12 bg-[#82E06A] rounded-full mb-8" />
          <nav className="space-y-4">
            <div className="bg-[#4D4D4D] text-white py-2 px-4 rounded text-sm font-bold">Analytics</div>
            <div className="bg-[#BFBFBF] h-8 rounded w-full" />
            <div className="bg-[#BFBFBF] h-8 rounded w-full" />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-200">
          <div className="bg-[#BFBFBF] h-4 rounded w-24 mb-2" />
          <div className="bg-[#BFBFBF] h-4 rounded w-16" />
        </div>
      </aside>

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
          <div className="col-span-5 bg-white rounded-[50px] shadow-lg flex items-center justify-center p-8"> 
            <div className="w-72 h-72 rounded-full border-50 border-black border-l-[#737373] border-b-[#A6A6A6] rotate-45" />
          </div>
        </div>
        <div className="fixed bottom-8 right-12">
          <div className="relative w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center">
             <div className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full border-2 border-white" />
             <span className="text-2xl">💬</span>
          </div>
        </div>
      </main>
    </div>
  );
}