import React from 'react';

// Define the shape for your data later
interface AgingNotice {
  businessId: string;
  violationType: string;
  notice: string;
  violationDate: string;
  deadline: string;
  timeStatus: string;
  status: 'COMPLETED' | 'PENDING' | 'CEASE AND DESIST';
}

const EmptyAgingTable: React.FC = () => {
  // Placeholder for an empty array or 7 empty rows to match your screenshot
  const rowCount = Array.from({ length: 7 });

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden border border-gray-200 shadow-sm font-sans">
      <div className="bg-white p-6 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900">
          List of Aging Notice
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center border-collapse">
          {/* Header */}
          <thead className="bg-[#044a33] text-white uppercase text-[11px] font-bold">
            <tr>
              <th className="px-4 py-4 border-r border-[#033d2a]">Business ID</th>
              <th className="px-4 py-4 border-r border-[#033d2a]">Violation Type</th>
              <th className="px-4 py-4 border-r border-[#033d2a]">Notice</th>
              <th className="px-4 py-4 border-r border-[#033d2a]">Violation Date</th>
              <th className="px-4 py-4 border-r border-[#033d2a]">Deadline</th>
              <th className="px-4 py-4 border-r border-[#033d2a]">Time Status</th>
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>

          {/* Body Placeholders */}
          <tbody className="bg-white">
            {rowCount.map((_, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-b-0 h-16">
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4 border-r border-gray-50"></td>
                <td className="px-4"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmptyAgingTable;