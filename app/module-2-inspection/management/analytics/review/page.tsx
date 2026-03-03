// app/module-2-inspection/management/analytics/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFile, FiCheck, FiClock, FiX, FiEdit, FiSave, FiAlertTriangle, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase } from "react-icons/fi";
import Sidebar from "../../../components/sidebar/page";

interface CSVRow {
  id: string;
  businessName: string;
  address: string;
  permitNumber: string;
  inspectionDate: string;
  violations: string[];
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
  reviewActions: string[];
  reviewedDate?: string;
  reviewedBy?: string;
  status: 'not_reviewed' | 'reviewed';
  assignedInspector?: string;
  scheduledDate?: string;
}

interface CSVFile {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  rows: number;
  status: 'processing' | 'completed';
}

export default function CSVReview() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<CSVFile | null>(null);
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<CSVRow | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  // Mock data for demonstration
  useEffect(() => {
    const mockCSVFiles: CSVFile[] = [
      {
        id: '1',
        name: 'business_list_2024.csv',
        uploadDate: '2024-01-15 10:30 AM',
        size: '2.4 MB',
        rows: 50,
        status: 'processing'
      },
      {
        id: '2',
        name: 'violations_january.csv',
        uploadDate: '2024-01-14 3:45 PM',
        size: '1.8 MB',
        rows: 30,
        status: 'completed'
      },
      {
        id: '3',
        name: 'compliance_data.csv',
        uploadDate: '2024-01-13 9:15 AM',
        size: '3.1 MB',
        rows: 25,
        status: 'processing'
      }
    ];
    setCSVFiles(mockCSVFiles);

    // Select first file by default
    setSelectedFile(mockCSVFiles[0]);
    loadCSVData(mockCSVFiles[0].id);
  }, []);

  const loadCSVData = (fileId: string) => {
    // Mock CSV data with some already reviewed rows
    const mockCSVData: CSVRow[] = Array.from({ length: 50 }, (_, index) => ({
      id: (index + 1).toString(),
      businessName: `Business ${fileId}-${index + 1}`,
      address: `${100 + index} Main St, City`,
      permitNumber: `PERM-2024-${String(index + 1).padStart(3, '0')}`,
      inspectionDate: `2024-01-${String(15 + (index % 15)).padStart(2, '0')}`,
      violations: [],
      ownerName: `Owner ${index + 1}`,
      contactNumber: `555-${String(100 + index).padStart(4, '0')}`,
      email: `business${index + 1}@email.com`,
      businessType: index % 4 === 0 ? 'Restaurant' : index % 4 === 1 ? 'Retail' : index % 4 === 2 ? 'Service' : 'Manufacturing',
      employees: 5 + (index * 3),
      annualRevenue: `$${(50000 + index * 10000).toLocaleString()}`,
      licenseExpiry: `2024-${String(12 - (index % 12)).padStart(2, '0')}-15`,
      lastInspection: `2023-${String(12 - (index % 12)).padStart(2, '0')}-01`,
      riskLevel: index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low',
      complianceScore: 60 + (index % 40),
      reviewActions: [],
      status: 'not_reviewed'
    }));

    // Mark some rows as already reviewed (for demonstration)
    if (fileId === '1') {
      mockCSVData[0] = {
        ...mockCSVData[0],
        reviewActions: ['Active'],
        violations: [],
        reviewedDate: '2024-01-16 09:15 AM',
        reviewedBy: 'Admin User',
        status: 'reviewed'
      };
      mockCSVData[2] = {
        ...mockCSVData[2],
        reviewActions: ['For Inspection'],
        violations: ['Fire safety equipment missing'],
        reviewedDate: '2024-01-16 10:30 AM',
        reviewedBy: 'Admin User',
        status: 'reviewed',
        assignedInspector: 'Inspector Smith',
        scheduledDate: '2024-02-15'
      };
    }

    setCSVData(mockCSVData);
  };

  const handleFileSelect = (file: CSVFile) => {
    setSelectedFile(file);
    loadCSVData(file.id);
  };

  const handleRowClick = (row: CSVRow) => {
    setSelectedRow(row);
    setShowReviewModal(true);
  };

  const handleSaveReview = (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
  }) => {
    if (!selectedRow) return;

    const updatedRow: CSVRow = {
      ...selectedRow,
      reviewActions: reviewData.reviewActions,
      violations: reviewData.violations,
      reviewedDate: new Date().toLocaleString(),
      reviewedBy: 'Current User',
      status: 'reviewed',
      assignedInspector: reviewData.assignedInspector,
      scheduledDate: reviewData.scheduledDate
    };

    setCSVData(prev => prev.map(row => 
      row.id === selectedRow.id ? updatedRow : row
    ));

    // Update file status based on review progress
    const reviewedCount = csvData.filter(r => r.status === 'reviewed').length + 1;
    const newStatus = reviewedCount === csvData.length ? 'completed' : 'processing';
    
    if (selectedFile) {
      setCSVFiles(prev => prev.map(f => 
        f.id === selectedFile.id 
          ? { ...f, status: newStatus as 'processing' | 'completed' }
          : f
      ));
      setSelectedFile({ ...selectedFile, status: newStatus });
    }

    setShowReviewModal(false);
    setSelectedRow(null);
  };

  const getStatusBadge = (status: CSVFile['status']) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'processing':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const reviewedCount = csvData.filter(row => row.status === 'reviewed').length;
  const notReviewedCount = csvData.filter(row => row.status === 'not_reviewed').length;

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
          <p className="text-gray-600">Review individual CSV data entries row by row</p>
          {notReviewedCount > 0 && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              {notReviewedCount} rows pending review
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
                      {selectedFile ? `${reviewedCount}/${selectedFile.rows} rows reviewed • ${selectedFile.size}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getStatusBadge(selectedFile?.status || 'processing')}>
                      {selectedFile?.status?.toUpperCase() || 'PROCESSING'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Review Progress</span>
                  <span>{Math.round((reviewedCount / csvData.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{ width: `${(reviewedCount / csvData.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Scrollable Table Container */}
              <div className="h-[600px] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                  <table className="w-full min-w-[1400px]">
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
                          Owner Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Review Actions
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Violations
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Assigned Inspector
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Scheduled Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px]">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px]">
                          Reviewed Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
                
                <table className="w-full min-w-[1400px]">
                  <tbody className="divide-y divide-gray-200">
                    {csvData.map((row, index) => (
                      <tr 
                        key={row.id} 
                        className={`
                          hover:bg-gray-50 cursor-pointer transition-colors
                          ${row.status === 'reviewed' ? 'bg-green-50' : 'bg-white'}
                        `}
                        onClick={() => handleRowClick(row)}
                      >
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
                          {row.ownerName}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.reviewActions.length > 0 ? (
                            <div className="space-y-1">
                              {row.reviewActions.map((action, idx) => (
                                <div key={idx} className="text-xs text-green-600">
                                  ✓ {action}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">No actions</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.violations.length > 0 ? (
                            <div className="space-y-1">
                              {row.violations.map((violation, idx) => (
                                <div key={idx} className="text-xs text-red-600">
                                  ⚠ {violation}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600">No violations</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.assignedInspector || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.scheduledDate || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 min-w-[100px]">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.status === 'reviewed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {row.status === 'reviewed' ? 'REVIEWED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[120px]">
                          {row.reviewedDate || (
                            <span className="text-gray-400 flex items-center">
                              <FiClock className="w-3 h-3 mr-1" />
                              Not reviewed
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[80px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Showing {csvData.length} rows</span>
                  <span>Click any row to review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - File List */}
          <div className="w-1/3 space-y-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Files for Review</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {csvFiles.filter(f => f.status === 'processing').length} files in progress
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
                              {file.uploadDate} • {file.size} • {file.rows} rows
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={getStatusBadge(file.status)}>
                            {file.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Rows</span>
                  <span className="text-sm font-medium text-gray-900">{csvData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reviewed</span>
                  <span className="text-sm font-medium text-green-600">{reviewedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">{notReviewedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round((reviewedCount / csvData.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRow && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Review Business</h2>
                  <p className="text-green-100 text-sm mt-1">{selectedRow.businessName}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-white/20"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Information Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <FiBriefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                      <p className="text-sm text-gray-500 mt-1">Permit #{selectedRow.permitNumber}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRow.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRow.ownerName}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRow.contactNumber}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRow.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FiBriefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{selectedRow.businessType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="lg:col-span-1">
                  <ReviewForm 
                    initialActions={selectedRow.reviewActions}
                    initialViolations={selectedRow.violations}
                    initialInspector={selectedRow.assignedInspector}
                    initialScheduledDate={selectedRow.scheduledDate}
                    onSave={handleSaveReview}
                    onCancel={() => setShowReviewModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Review Form Component
function ReviewForm({ 
  initialActions, 
  initialViolations, 
  initialInspector,
  initialScheduledDate,
  onSave, 
  onCancel 
}: {
  initialActions: string[];
  initialViolations: string[];
  initialInspector?: string;
  initialScheduledDate?: string;
  onSave: (data: { 
    reviewActions: string[]; 
    violations: string[]; 
    assignedInspector?: string; 
    scheduledDate?: string; 
  }) => void;
  onCancel: () => void;
}) {
  const [reviewActions, setReviewActions] = useState<string[]>(initialActions);
  const [violations, setViolations] = useState<string[]>(initialViolations);
  const [violationText, setViolationText] = useState<string>(initialViolations.join(', '));
  const [assignedInspector, setAssignedInspector] = useState<string>(initialInspector || '');
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduledDate || '');

  const availableActions = ['Active', 'Compliant', 'Non-Compliant', 'For Inspection'];

  const addAction = (action: string) => {
    if (!reviewActions.includes(action)) {
      setReviewActions([...reviewActions, action]);
    }
  };

  const removeAction = (index: number) => {
    setReviewActions(reviewActions.filter((_, i) => i !== index));
  };

  const handleViolationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setViolationText(text);
    
    // Split by comma and filter empty strings
    const violationArray = text.split(',').map(v => v.trim()).filter(v => v.length > 0);
    setViolations(violationArray);
  };

  const handleSave = () => {
    onSave({ 
      reviewActions, 
      violations,
      assignedInspector: assignedInspector || undefined,
      scheduledDate: scheduledDate || undefined
    });
  };

  const showInspectorFields = reviewActions.includes('For Inspection');

  return (
    <div className="space-y-6">
      {/* Review Actions Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiCheck className="w-5 h-5 mr-2 text-green-600" />
          Review Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {availableActions.map((action) => (
            <button
              key={action}
              onClick={() => addAction(action)}
              disabled={reviewActions.includes(action)}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                reviewActions.includes(action)
                  ? 'bg-green-600 text-white shadow-lg scale-105 ring-2 ring-green-500 ring-offset-2'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              {action}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Actions</label>
          <div className="min-h-[80px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {reviewActions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reviewActions.map((action, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <FiCheck className="w-3 h-3 mr-1" />
                    {action}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No actions selected</p>
            )}
          </div>
        </div>
      </div>

      {/* Violations Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiAlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Violations
        </h3>
        
        <div className="mb-4">
          <label htmlFor="violations" className="block text-sm font-medium text-gray-700 mb-2">
            Violations Details
          </label>
          <textarea
            id="violations"
            rows={4}
            value={violationText}
            onChange={handleViolationTextChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            placeholder="Enter violations separated by commas..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple violations with commas (e.g., "Fire safety equipment missing, Improper ventilation")
          </p>
        </div>
      </div>

      {/* Inspector Assignment Section - Only show when "For Inspection" is selected */}
      {showInspectorFields && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiUser className="w-5 h-5 mr-2 text-blue-600" />
            Inspection Assignment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Inspector
              </label>
              <div className="relative">
                <input
                  id="inspector"
                  type="text"
                  value={assignedInspector}
                  onChange={(e) => setAssignedInspector(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter inspector name..."
                />
                <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
            
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <div className="relative">
                <input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <FiCalendar className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <FiSave className="w-4 h-4 mr-2" />
          Save Review
        </button>
      </div>
    </div>
  );
}