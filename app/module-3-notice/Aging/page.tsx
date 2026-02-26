import React from 'react';

// This is the TypeScript "Interface" - it defines the shape of your data
interface AgingNotice {
  businessId: string;
  violationType: string;
  notice: string;
  violationDate: string;
  deadline: string;
  timeStatus: string;
  status: 'COMPLETED' | 'PENDING' | 'CEASE AND DESIST';
}

const AgingNoticeTable = () => {
  // Empty array placeholder - you would fetch your data and put it here
  const notices: AgingNotice[] = [];

  return (
    <div className="p-8 bg-white min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto bg-white">
        
        {/* Header Section */}
        <h1 className="text-3xl font-bold text-center py-8 tracking-tight">
          LIST OF AGING NOTICE
        </h1>

        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#004d33] text-white uppercase text-sm">
                <th className="py-4 px-4 border-r border-green-800">Business ID</th>
                <th className="py-4 px-4 border-r border-green-800">Violation Type</th>
                <th className="py-4 px-4 border-r border-green-800">Notice</th>
                <th className="py-4 px-4 border-r border-green-800 leading-tight">Violation Date</th>
                <th className="py-4 px-4 border-r border-green-800">Deadline</th>
                <th className="py-4 px-4 border-r border-green-800">Time Status</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            
            <tbody className="text-gray-700 text-sm">
              {notices.length > 0 ? (
                notices.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200 text-center">
                    <td className="py-4 px-2 underline font-bold cursor-pointer">{row.businessId}</td>
                    <td className="py-4 px-2">{row.violationType}</td>
                    <td className="py-4 px-2 font-medium">{row.notice}</td>
                    <td className="py-4 px-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-[12px] italic">{row.violationDate}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-[12px] italic">{row.deadline}</span>
                    </td>
                    <td className="py-4 px-2">{row.timeStatus}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              ) : (
                /* The Placeholder Row when data is empty */
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 italic bg-gray-50/50">
                    No notices available. Please sync your data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper component for the status buttons
const StatusBadge = ({ status }: { status: AgingNotice['status'] }) => {
  const base = "w-full py-2 px-4 rounded font-bold text-xs tracking-wider text-white";
  
  const styles = {
    'COMPLETED': "bg-[#004d33]",
    'PENDING': "bg-[#fcd34d] !text-gray-800",
    'CEASE AND DESIST': "bg-[#ef4444]",
  };

  return <button className={`${base} ${styles[status]}`}>{status}</button>;
};

export default AgingNoticeTable;