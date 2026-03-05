"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiFile, FiCheck, FiClock, FiX, FiDownload, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Sidebar from "../../../../components/sidebar/page";
import MasterlistFilters from "../../filters/masterlist-filters/page";

interface CSVFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  rows: number;
  status?: string;
  period?: string; // New field for month/year range
}

export default function CSVManager() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([
    {
      id: '1',
      name: 'business_list_2024.csv',
      uploadDate: '2024-01-15 10:30 AM',
      size: '2.4 MB',
      rows: 1250,
      status: 'completed',
      period: 'January 2024 - March 2024'
    },
    {
      id: '2',
      name: 'violations_january.csv',
      uploadDate: '2024-01-14 3:45 PM',
      size: '1.8 MB',
      rows: 0,
      status: 'not_reviewed',
      period: 'January 2024 - January 2024'
    },
    {
      id: '3',
      name: 'compliance_data.csv',
      uploadDate: '2024-01-13 9:15 AM',
      size: '3.1 MB',
      rows: 0,
      status: 'processing',
      period: 'January 2024 - May 2024'
    }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Upload period state
  const [uploadFromMonth, setUploadFromMonth] = useState<string>('');
  const [uploadFromYear, setUploadFromYear] = useState<string>(new Date().getFullYear().toString());
  const [uploadToMonth, setUploadToMonth] = useState<string>('');
  const [uploadToYear, setUploadToYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate that period is selected
    if (!uploadFromMonth || !uploadFromYear || !uploadToMonth || !uploadToYear) {
      alert('Please select both from and to month/year for CSV period before uploading.');
      return;
    }

    // Validate that to date is after from date
    const fromDate = new Date(`${uploadFromMonth} 1, ${uploadFromYear}`);
    const toDate = new Date(`${uploadToMonth} 1, ${uploadToYear}`);

    if (toDate < fromDate) {
      alert('The "to" date must be after or equal to the "from" date.');
      return;
    }

    const newCSV: CSVFile = {
      id: Date.now().toString(),
      name: file.name,
      uploadDate: new Date().toLocaleString(),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      rows: 0,
      status: 'processing',
      period: `${uploadFromMonth} ${uploadFromYear} - ${uploadToMonth} ${uploadToYear}` 
    };

    setCSVFiles(prev => [newCSV, ...prev]);

    setTimeout(() => {
      setCSVFiles(prev => prev.map(f =>
        f.id === newCSV.id
          ? { ...f, status: 'completed', rows: Math.floor(Math.random() * 2000) + 500 }
          : f
      ));
    }, 3000);
  };

  const handleRowClick = (file: CSVFile) => {
    router.push('/module-2-inspection/management/analytics/review');
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
  };

  // Update filter logic
  const filteredFiles = csvFiles.filter(file => {
    const statusMatch = !selectedStatus || file.status === selectedStatus;
    const periodMatch = !selectedPeriod || file.period === selectedPeriod;
    return statusMatch && periodMatch;
  });

  const availablePeriods = [...new Set(csvFiles.map(file => file.period).filter(Boolean))] as string[];

  // Pagination calculations
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate years for dropdown (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

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
      <div className="min-h-screen bg-gray-50 pt-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">CSV File Manager</h1>
            <p className="text-gray-600">Upload and manage your CSV data files</p>
          </div>

          <div className="mb-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 bg-white hover:border-green-400'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <FiUpload className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Drop CSV files here
                </h3>
                <p className="text-gray-600 mb-3 text-sm">or click to browse</p>

                {/* Period Selection */}
                <div className="w-full max-w-md mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Period *
                  </label>
                  <div className="space-y-3">
                    {/* From Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <select
                          value={uploadFromMonth}
                          onChange={(e) => setUploadFromMonth(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Month</option>
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                        <select
                          value={uploadFromYear}
                          onChange={(e) => setUploadFromYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Year</option>
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* To Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                        <select
                          value={uploadToMonth}
                          onChange={(e) => setUploadToMonth(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Month</option>
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                        <select
                          value={uploadToYear}
                          onChange={(e) => setUploadToYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Year</option>
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Select Files
                </button>
              </div>
            </div>
          </div>

          {/* Filters Component */}
          <MasterlistFilters
            selectedStatus={selectedStatus}
            selectedPeriod={selectedPeriod}
            onStatusChange={setSelectedStatus}
            onPeriodChange={setSelectedPeriod}
            availablePeriods={availablePeriods}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Uploaded Files</h2>
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredFiles.length)} of {filteredFiles.length} files
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rows
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(file)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiFile className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {file.uploadDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {file.period}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {file.size}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {file.rows.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {file.status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${file.status === 'completed' || file.status === 'approved' ? 'bg-green-100 text-green-800' :
                            file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              file.status === 'error' || file.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {file.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            className="text-green-600 hover:text-green-900 p-1"
                            onClick={handleActionClick}
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1"
                            onClick={handleActionClick}
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1"
                            onClick={handleActionClick}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm rounded-md ${currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}