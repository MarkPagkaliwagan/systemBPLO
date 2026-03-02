"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiFile, FiCheck, FiClock, FiX, FiDownload, FiTrash2, FiEye } from "react-icons/fi";
import Sidebar from "../../../components/sidebar/page";

interface CSVRow {
  id: string;
  businessName: string;
  address: string;
  permitNumber: string;
  inspectionDate: string;
  violations: string;
  ownerName: string;
  contactNumber: string;
  email: string;
  businessType: string;
  employees: number;
  annualRevenue: string;
  licenseExpiry: string;
  lastInspection: string;
  riskLevel: string;
  complianceScore: number;
}

interface CSVFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  rows: number;
  status: 'not_reviewed' | 'processing' | 'completed' | 'error' | 'approved' | 'rejected';
  scheduledDate?: string;
}

export default function CSVReview() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CSVFile | null>(null);
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [violations, setViolations] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

  // Mock data for demonstration - multiple CSV files
  useEffect(() => {
    // Mock CSV files list
    const mockCSVFiles: CSVFile[] = [
      {
        id: '1',
        name: 'business_list_2024.csv',
        uploadDate: '2024-01-15 10:30 AM',
        size: '2.4 MB',
        rows: 1250,
        status: 'not_reviewed',
        scheduledDate: '2024-02-15'
      },
      {
        id: '2',
        name: 'violations_january.csv',
        uploadDate: '2024-01-14 3:45 PM',
        size: '1.8 MB',
        rows: 890,
        status: 'not_reviewed',
        scheduledDate: '2024-02-16'
      },
      {
        id: '3',
        name: 'compliance_data.csv',
        uploadDate: '2024-01-13 9:15 AM',
        size: '3.1 MB',
        rows: 2100,
        status: 'completed'
      },
      {
        id: '4',
        name: 'restaurant_inspections.csv',
        uploadDate: '2024-01-12 2:30 PM',
        size: '1.2 MB',
        rows: 650,
        status: 'not_reviewed',
        scheduledDate: '2024-02-17'
      },
      {
        id: '5',
        name: 'fire_safety_reports.csv',
        uploadDate: '2024-01-11 11:00 AM',
        size: '0.8 MB',
        rows: 320,
        status: 'processing'
      }
    ];
    setCSVFiles(mockCSVFiles);

    // Select first not_reviewed file by default
    const firstNotReviewed = mockCSVFiles.find(file => file.status === 'not_reviewed');
    if (firstNotReviewed) {
      setSelectedFile(firstNotReviewed);
      loadCSVData(firstNotReviewed.id);
    }
  }, []);

  const loadCSVData = (fileId: string) => {
    // Mock CSV data based on file ID
    const mockCSVData: CSVRow[] = Array.from({ length: 50 }, (_, index) => ({
      id: (index + 1).toString(),
      businessName: `Business ${fileId}-${index + 1}`,
      address: `${100 + index} Main St, City`,
      permitNumber: `PERM-2024-${String(index + 1).padStart(3, '0')}`,
      inspectionDate: `2024-01-${String(15 + (index % 15)).padStart(2, '0')}`,
      violations: index % 3 === 0 ? 'Health code violations' : index % 3 === 1 ? 'Fire safety violations' : 'Building code violations',
      ownerName: `Owner ${index + 1}`,
      contactNumber: `555-${String(100 + index).padStart(4, '0')}`,
      email: `business${index + 1}@email.com`,
      businessType: index % 4 === 0 ? 'Restaurant' : index % 4 === 1 ? 'Retail' : index % 4 === 2 ? 'Service' : 'Manufacturing',
      employees: 5 + (index * 3),
      annualRevenue: `$${(50000 + index * 10000).toLocaleString()}`,
      licenseExpiry: `2024-${String(12 - (index % 12)).padStart(2, '0')}-15`,
      lastInspection: `2023-${String(12 - (index % 12)).padStart(2, '0')}-01`,
      riskLevel: index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low',
      complianceScore: 60 + (index % 40)
    }));
    setCSVData(mockCSVData);
  };

  const handleFileSelect = (file: CSVFile) => {
    setSelectedFile(file);
    loadCSVData(file.id);
    // Reset review form
    setSelectedStatus('');
    setViolations('');
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleViolationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setViolations(e.target.value);
  };

  const handleSaveReview = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/csv-review', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     fileId: selectedFile.id,
      //     status: selectedStatus,
      //     violations: violations
      //   })
      // });
      
      console.log('Saving review:', { fileId: selectedFile.id, status: selectedStatus, violations });
      
      // Update file status to completed
      setCSVFiles(prev => prev.map(f => 
        f.id === selectedFile.id 
          ? { ...f, status: 'completed' as const }
          : f
      ));
      
      // Simulate save
      setTimeout(() => {
        setLoading(false);
        alert('Review saved successfully!');
        
        // Auto-select next not_reviewed file
        const nextNotReviewed = csvFiles.find(f => f.id !== selectedFile.id && f.status === 'not_reviewed');
        if (nextNotReviewed) {
          handleFileSelect(nextNotReviewed);
        }
      }, 1000);

    } catch (error) {
      console.error('Error saving review:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: CSVFile['status']) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <FiCheck className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <FiClock className="w-4 h-4 text-yellow-600" />;
      case 'error':
      case 'rejected':
        return <FiX className="w-4 h-4 text-red-600" />;
      case 'not_reviewed':
        return <FiClock className="w-4 h-4 text-gray-400" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: CSVFile['status']) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'approved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'error':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'not_reviewed':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: CSVFile['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'approved':
        return 'Approved';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      case 'rejected':
        return 'Rejected';
      case 'not_reviewed':
        return 'Not Reviewed';
      default:
        return 'Unknown';
    }
  };

  const notReviewedCount = csvFiles.filter(f => f.status === 'not_reviewed').length;

  return (
    <div className={`min-h-screen bg-gray-50 ${
      isMobile ? 'pt-16' : (isCollapsed ? 'pl-20' : 'pl-80')
    }`}>
      <Sidebar 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className={`px-6 py-10 ${
        isMobile ? 'pt-6' : ''
      }`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV Data Review</h1>
          <p className="text-gray-600">Review and classify CSV data entries</p>
          {notReviewedCount > 0 && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {notReviewedCount} files pending review
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Left Side - CSV Data Display */}
          <div className="w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* File Info Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile ? `${selectedFile.rows.toLocaleString()} rows • ${selectedFile.size}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {selectedFile?.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Scrollable Table Container with Horizontal Scroll */}
              <div className="h-[600px] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[50px]">
                          #
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Business Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px]">
                          Address
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Permit Number
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Inspection Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Violations
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Owner Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Contact Number
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Email
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Business Type
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px]">
                          Employees
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Annual Revenue
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          License Expiry
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Last Inspection
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px]">
                          Risk Level
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Compliance Score
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                
                <table className="w-full min-w-[1000px]">
                  <tbody className="divide-y divide-gray-200">
                    {csvData.map((row, index) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500 font-medium min-w-[50px]">
                          {index + 1}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[120px]">
                          {row.businessName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[150px]">
                          {row.address}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.permitNumber}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.inspectionDate}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-500 min-w-[120px]">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {row.violations}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.ownerName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.contactNumber}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.email}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row.businessType}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[80px]">
                          {row.employees}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.annualRevenue}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.licenseExpiry}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          {row.lastInspection}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[80px]">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            row.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                            row.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {row.riskLevel}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            row.complianceScore >= 80 ? 'bg-green-100 text-green-800' :
                            row.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {row.complianceScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Showing {csvData.length.toLocaleString()} of {selectedFile?.rows.toLocaleString() || 0} rows</span>
                  <span>Scroll horizontally and vertically to view all data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - File List and Review Actions */}
          <div className="w-1/3 space-y-3">
            {/* File List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Files for Review</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {notReviewedCount} pending review
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {csvFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedFile?.id === file.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FiFile className="w-5 h-5 text-green-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.uploadDate} • {file.size} • {file.rows.toLocaleString()} rows
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {getStatusIcon(file.status)}
                            <span className={`ml-2 ${getStatusBadge(file.status)}`}>
                              {getStatusText(file.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {file.scheduledDate && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <FiClock className="w-3 h-3 mr-1" />
                          Scheduled: {file.scheduledDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Actions</h3>
              
              {/* Status Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status Classification
                </label>
                <div className="space-y-2">
                  {['Compliant', 'Non-Compliant', 'Active', 'For Inspection'].map((status) => (
                    <label key={status} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Violations Textbox */}
              <div className="mb-6">
                <label htmlFor="violations" className="block text-sm font-medium text-gray-700 mb-2">
                  Violations
                </label>
                <textarea
                  id="violations"
                  rows={6}
                  value={violations}
                  onChange={handleViolationsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                  placeholder="Enter violations details..."
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveReview}
                disabled={loading || !selectedStatus || !selectedFile}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}