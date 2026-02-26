import React from 'react';

const AgingNoticeTable: React.FC = () => {
  // Define the headers exactly as seen in the photo
  const headers = [
    "Business ID",
    "Violation Type",
    "Notice",
    "Violation Date",
    "Deadline",
    "Time Status",
    "Status"
  ];

  // Create an array of 7 empty rows to match the image structure
  const emptyRows = Array.from({ length: 7 });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-center mb-8 relative">
        <button className="absolute left-0 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-black uppercase tracking-wide">
          List of Aging Notice
        </h1>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden border border-gray-200 shadow-sm rounded-sm">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-[#05513c] text-white">
              {headers.map((header) => (
                <th 
                  key={header} 
                  className="px-4 py-4 text-xs font-bold uppercase tracking-wider border-r border-[#044130] last:border-r-0"
                >
                  {header === "Violation Date" ? (
                    <div>VIOLATION<br/>DATE</div>
                  ) : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {emptyRows.map((_, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-b-0 h-14">
                {/* Business ID Column (Underlined) */}
                <td className="px-4 border-r border-gray-50 text-blue-800 font-bold underline decoration-gray-400 cursor-pointer"></td>
                <td className="px-4 border-r border-gray-50 text-gray-600"></td>
                <td className="px-4 border-r border-gray-50 text-gray-600 uppercase"></td>
                {/* Violation Date Column (Pill Label) */}
                <td className="px-4 border-r border-gray-50">
                  <div className="inline-block bg-gray-200 px-3 py-1 rounded-full text-[10px] font-semibold text-gray-500 invisible">
                    DATE
                  </div>
                </td>
                {/* Deadline Column (Pill Label) */}
                <td className="px-4 border-r border-gray-50">
                  <div className="inline-block bg-gray-200 px-3 py-1 rounded-full text-[10px] font-semibold text-gray-500 invisible">
                    DATE
                  </div>
                </td>
                <td className="px-4 border-r border-gray-50 text-gray-500 italic"></td>
                {/* Status Column */}
                <td className="px-4 min-w-[160px]">
                  <div className="w-full py-2 rounded text-[11px] font-bold invisible">
                    STATUS
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgingNoticeTable;