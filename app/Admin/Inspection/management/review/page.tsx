"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFile, FiCheck, FiClock, FiX, FiEdit } from "react-icons/fi";
import Sidebar from "../../../../components/sidebar/page";
import ReviewModal from "../Review Modal/page";
import ReviewFilters from "../../filters/review-filters/page";

interface CSVRow {
  id: string;
  // Business Information
  businessIdentificationNumber: string;
  businessName: string;
  tradeName: string;
  businessNature: string;
  businessLine: string;
  businessType: string;
  transmittalNumber: string;
  inchargeFirstName: string;
  inchargeMiddleName: string;
  inchargeLastName: string;
  inchargeExtensionName: string;
  inchargeSex: string;
  citizenship: string;
  officeStreet: string;
  officeRegion: string;
  officeProvince: string;
  officeMunicipality: string;
  officeBarangay: string;
  officeZipcode: string;
  year: string;
  capital: string;
  grossAmount: string;
  grossAmountEssential: string;
  grossAmountNonEssential: string;
  rejectRemarks: string;
  moduleType: string;
  transactionType: string;

  // Requestor Information
  requestorFirstName: string;
  requestorMiddleName: string;
  requestorLastName: string;
  requestorExtensionName: string;
  requestorEmail: string;
  requestorMobileNo: string;
  requestorSex: string;
  civilStatus: string;
  requestorStreet: string;
  requestorMunicipality: string;
  requestorBarangay: string;
  requestorZipcode: string;
  transactionId: string;
  referenceNo: string;
  brgyClearanceStatus: string;
  siteTransactionId: string;
  coreTransactionStatus: string;
  soaNo: string;
  annualAmount: string;
  term: string;
  amountPaid: string;
  balance: string;
  paymentType: string;
  paymentDate: string;
  orNo: string;
  permitNo: string;
  businessPlateNo: string;
  actualClosureDate: string;
  retirementReason: string;
  sourceType: string;

  // Review Information
  violations: string[];
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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Mock data for demonstration - commented out for backend integration
  useEffect(() => {
    /*
    // Dynamic mock data generation - commented out
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
    */

    // Hardcoded sample files for reference
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

    // Hardcoded sample data for reference
    const mockCSVData: CSVRow[] = [
      {
        id: '1',

        // Business Information
        businessIdentificationNumber: 'BIN-202400001',
        businessName: 'ABC Trading 1',
        tradeName: 'Quick Shop',
        businessNature: 'Retail',
        businessLine: 'Food & Beverage',
        businessType: 'Sole Proprietorship',
        transmittalNumber: 'TRANS-2024001',
        inchargeFirstName: 'Juan',
        inchargeMiddleName: 'Santos',
        inchargeLastName: 'Dela Cruz',
        inchargeExtensionName: 'Jr.',
        inchargeSex: 'Male',
        citizenship: 'Filipino',
        officeStreet: '100 Main St',
        officeRegion: 'NCR',
        officeProvince: 'Metro Manila',
        officeMunicipality: 'Quezon City',
        officeBarangay: 'Barangay 1',
        officeZipcode: '1001',
        year: '2024',
        capital: '₱50,000',
        grossAmount: '₱100,000',
        grossAmountEssential: '₱60,000',
        grossAmountNonEssential: '₱40,000',
        rejectRemarks: '',
        moduleType: 'Business Permit',
        transactionType: 'New',

        // Requestor Information
        requestorFirstName: 'John',
        requestorMiddleName: 'Doe',
        requestorLastName: 'Smith',
        requestorExtensionName: 'Sr.',
        requestorEmail: 'requestor1@email.com',
        requestorMobileNo: '09100000001',
        requestorSex: 'Male',
        civilStatus: 'Single',
        requestorStreet: '200 Oak Ave',
        requestorMunicipality: 'Quezon City',
        requestorBarangay: 'Barangay A',
        requestorZipcode: '1101',
        transactionId: 'TXN-202400001',
        referenceNo: 'REF-2024001',
        brgyClearanceStatus: 'Cleared',
        siteTransactionId: 'SITE-100001',
        coreTransactionStatus: 'Completed',
        soaNo: 'SOA-2024001',
        annualAmount: '₱3,000',
        term: '1 Year',
        amountPaid: '₱3,000',
        balance: '₱0',
        paymentType: 'Cash',
        paymentDate: '2024-01-15',
        orNo: 'OR-202400001',
        permitNo: 'PERMIT-2024001',
        businessPlateNo: 'BP-1001',
        actualClosureDate: '',
        retirementReason: '',
        sourceType: 'Online Application',

        // Review Information
        violations: [],
        reviewActions: ['Active'],
        reviewedDate: '2024-01-16 09:15 AM',
        reviewedBy: 'Admin User',
        status: 'reviewed'
      },
      {
        id: '2',

        // Business Information
        businessIdentificationNumber: 'BIN-202400002',
        businessName: 'XYZ Corp 2',
        tradeName: 'Fast Service',
        businessNature: 'Service',
        businessLine: 'Electronics',
        businessType: 'Corporation',
        transmittalNumber: 'TRANS-2024002',
        inchargeFirstName: 'Maria',
        inchargeMiddleName: 'Reyes',
        inchargeLastName: 'Gonzales',
        inchargeExtensionName: '',
        inchargeSex: 'Female',
        citizenship: 'Filipino',
        officeStreet: '101 Main St',
        officeRegion: 'NCR',
        officeProvince: 'Metro Manila',
        officeMunicipality: 'Manila',
        officeBarangay: 'Barangay 2',
        officeZipcode: '1002',
        year: '2024',
        capital: '₱60,000',
        grossAmount: '₱120,000',
        grossAmountEssential: '₱70,000',
        grossAmountNonEssential: '₱50,000',
        rejectRemarks: '',
        moduleType: 'Business Permit',
        transactionType: 'Renewal',

        // Requestor Information
        requestorFirstName: 'Jane',
        requestorMiddleName: 'Smith',
        requestorLastName: 'Johnson',
        requestorExtensionName: '',
        requestorEmail: 'requestor2@email.com',
        requestorMobileNo: '09100000002',
        requestorSex: 'Female',
        civilStatus: 'Married',
        requestorStreet: '201 Oak Ave',
        requestorMunicipality: 'Manila',
        requestorBarangay: 'Barangay B',
        requestorZipcode: '1102',
        transactionId: 'TXN-202400002',
        referenceNo: 'REF-2024002',
        brgyClearanceStatus: 'Cleared',
        siteTransactionId: 'SITE-100002',
        coreTransactionStatus: 'Completed',
        soaNo: 'SOA-2024002',
        annualAmount: '₱3,500',
        term: '1 Year',
        amountPaid: '₱3,500',
        balance: '₱0',
        paymentType: 'Check',
        paymentDate: '2024-01-16',
        orNo: 'OR-202400002',
        permitNo: 'PERMIT-2024002',
        businessPlateNo: 'BP-1002',
        actualClosureDate: '',
        retirementReason: '',
        sourceType: 'Online Application',

        // Review Information
        violations: ['Fire safety equipment missing'],
        reviewActions: ['For Inspection'],
        reviewedDate: '2024-01-16 10:30 AM',
        reviewedBy: 'Admin User',
        status: 'reviewed',
        assignedInspector: 'Inspector Smith',
        scheduledDate: '2024-02-15'
      },
      {
        id: '3',

        // Business Information
        businessIdentificationNumber: 'BIN-202400003',
        businessName: 'Quick Mart 3',
        tradeName: 'Quality Goods',
        businessNature: 'Manufacturing',
        businessLine: 'Clothing',
        businessType: 'Partnership',
        transmittalNumber: 'TRANS-2024003',
        inchargeFirstName: 'Jose',
        inchargeMiddleName: 'Cruz',
        inchargeLastName: 'Reyes',
        inchargeExtensionName: '',
        inchargeSex: 'Male',
        citizenship: 'Filipino',
        officeStreet: '102 Main St',
        officeRegion: 'NCR',
        officeProvince: 'Metro Manila',
        officeMunicipality: 'Makati',
        officeBarangay: 'Barangay 3',
        officeZipcode: '1003',
        year: '2024',
        capital: '₱70,000',
        grossAmount: '₱140,000',
        grossAmountEssential: '₱80,000',
        grossAmountNonEssential: '₱60,000',
        rejectRemarks: '',
        moduleType: 'Business Permit',
        transactionType: 'Amendment',

        // Requestor Information
        requestorFirstName: 'Michael',
        requestorMiddleName: 'Johnson',
        requestorLastName: 'Williams',
        requestorExtensionName: '',
        requestorEmail: 'requestor3@email.com',
        requestorMobileNo: '09100000003',
        requestorSex: 'Male',
        civilStatus: 'Widowed',
        requestorStreet: '202 Oak Ave',
        requestorMunicipality: 'Makati',
        requestorBarangay: 'Barangay C',
        requestorZipcode: '1103',
        transactionId: 'TXN-202400003',
        referenceNo: 'REF-2024003',
        brgyClearanceStatus: 'Cleared',
        siteTransactionId: 'SITE-100003',
        coreTransactionStatus: 'Completed',
        soaNo: 'SOA-2024003',
        annualAmount: '₱4,000',
        term: '1 Year',
        amountPaid: '₱4,000',
        balance: '₱0',
        paymentType: 'Online',
        paymentDate: '2024-01-17',
        orNo: 'OR-202400003',
        permitNo: 'PERMIT-2024003',
        businessPlateNo: 'BP-1003',
        actualClosureDate: '',
        retirementReason: '',
        sourceType: 'Online Application',

        // Review Information
        violations: [],
        reviewActions: [],
        reviewedDate: undefined,
        reviewedBy: undefined,
        status: 'not_reviewed'
      }
    ];

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

  // Filter data based on search term
  const filteredCSVData = csvData.filter(row => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search across all string properties of the row
    return Object.values(row).some(value => {
      if (Array.isArray(value)) {
        // Handle arrays like violations and reviewActions
        return value.some(item => 
          typeof item === 'string' && item.toLowerCase().includes(searchLower)
        );
      }
      
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      
      return false;
    });
  });

  const reviewedCount = csvData.filter(row => row.status === 'reviewed').length;
  const notReviewedCount = csvData.filter(row => row.status === 'not_reviewed').length;
  const filteredReviewedCount = filteredCSVData.filter(row => row.status === 'reviewed').length;
  const filteredNotReviewedCount = filteredCSVData.filter(row => row.status === 'not_reviewed').length;

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
        <div className={`${isMobile ? 'px-4 py-6' : 'px-6 py-10'}`}>
          {/* Header */}
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>Review </h1>
            <p className="text-gray-600">Reviewing Data </p>
            {notReviewedCount > 0 && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                {notReviewedCount} rows pending review
              </div>
            )}
          </div>

          <div className={`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
            {/* Left Side - CSV Data Display */}
            <div className={`${isMobile ? 'w-full' : 'w-2/3'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* File Info Header */}
                <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gray-50`}>
                  <div className={`${isMobile ? 'flex-col items-start space-y-2' : 'flex items-center justify-between'}`}>
                    <div className={isMobile ? 'w-full' : ''}>
                      <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
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
                <div className={`${isMobile ? 'px-4 py-2' : 'px-6 py-3'} bg-gray-50 border-b border-gray-200`}>
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

                {/* Mobile Card View or Desktop Table */}
                {isMobile ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredCSVData.map((row, index) => (
                      <div
                        key={row.id}
                        className={`border-b border-gray-200 p-4 cursor-pointer transition-colors ${row.status === 'reviewed' ? 'bg-green-50' : 'bg-white'
                          }`}
                        onClick={() => handleRowClick(row)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{row.businessName}</h4>
                            <p className="text-xs text-gray-500">{row.officeStreet}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'reviewed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {row.status === 'reviewed' ? 'REVIEWED' : 'PENDING'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          {row.reviewActions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {row.reviewActions.map((action, idx) => (
                                <span key={idx} className="text-green-600">
                                  ✓ {action}
                                </span>
                              ))}
                            </div>
                          )}
                          {row.violations.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {row.violations.map((violation, idx) => (
                                <span key={idx} className="text-red-600">
                                  ⚠ {violation}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {row.reviewedDate || 'Not reviewed'}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Desktop Table View - Single Table Structure */
                  <div className="h-[600px] overflow-auto">
                    <table className="w-full min-w-[1800px] border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {/* Business Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[50px] border-r border-gray-300">#</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Business Identification Number</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[180px] border-r border-gray-300">Business Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Trade Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Business Nature</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Business Line</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Business Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Transmittal Number</th>
                          
                          {/* Incharge Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Incharge First Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Incharge Middle Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Incharge Last Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Incharge Extension</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Sex</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Citizenship</th>
                          
                          {/* Office Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[200px] border-r border-gray-300">Office Street</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Region</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Province</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Municipality</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Barangay</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[90px] border-r border-gray-300">Zipcode</th>
                          
                          {/* Financial Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[70px] border-r border-gray-300">Year</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Capital</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Gross Amount</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px] border-r border-gray-300">Gross Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px] border-r border-gray-300">Gross Non-Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Reject Remarks</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Module Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Transaction Type</th>

                          {/* Requestor Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Requestor First Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Requestor Middle Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Requestor Last Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Requestor Extension</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[180px] border-r border-gray-300">Requestor Email</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Mobile No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Sex</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Civil Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[200px] border-r border-gray-300">Requestor Street</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Requestor Municipality</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Requestor Barangay</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[90px] border-r border-gray-300">Zipcode</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Transaction ID</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Reference No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Brgy. Clearance</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">SITE Transaction</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px] border-r border-gray-300">Core Transaction</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">SOA No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Annual Amount</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Term</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Amount Paid</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Balance</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Payment Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Payment Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">O.R No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Permit No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Business Plate No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Closure Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Retirement Reason</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Source Type</th>

                          {/* Review Information */}
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[200px] border-r border-gray-300">Violations</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Assigned Inspector</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Scheduled Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Reviewed Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                        {filteredCSVData.map((row, index) => (
                          <tr key={row.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${row.status === 'reviewed' ? 'bg-green-50' : 'bg-white'}`} onClick={() => handleRowClick(row)}>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 font-medium min-w-[50px] border-r border-gray-200">{index + 1}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[140px] border-r border-gray-200">{row.businessIdentificationNumber}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[180px] border-r border-gray-200">{row.businessName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.tradeName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.businessNature}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.businessLine}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.businessType}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.transmittalNumber}</td>
                            
                            {/* Incharge Information */}
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.inchargeFirstName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.inchargeMiddleName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.inchargeLastName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.inchargeExtensionName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">{row.inchargeSex}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.citizenship}</td>
                            
                            {/* Office Information */}
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] max-w-[250px] truncate border-r border-gray-200" title={row.officeStreet}>{row.officeStreet}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">{row.officeRegion}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.officeProvince}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.officeMunicipality}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.officeBarangay}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[90px] border-r border-gray-200">{row.officeZipcode}</td>
                            
                            {/* Financial Information */}
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[70px] border-r border-gray-200">{row.year}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.capital}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.grossAmount}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[150px] border-r border-gray-200">{row.grossAmountEssential}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[150px] border-r border-gray-200">{row.grossAmountNonEssential}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.rejectRemarks}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.moduleType}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.transactionType}</td>

                            {/* Requestor Information */}
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.requestorFirstName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.requestorMiddleName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.requestorLastName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.requestorExtensionName}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[180px] max-w-[220px] truncate border-r border-gray-200" title={row.requestorEmail}>{row.requestorEmail}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.requestorMobileNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">{row.requestorSex}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.civilStatus}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] max-w-[250px] truncate border-r border-gray-200" title={row.requestorStreet}>{row.requestorStreet}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.requestorMunicipality}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.requestorBarangay}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[90px] border-r border-gray-200">{row.requestorZipcode}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.transactionId}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.referenceNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.brgyClearanceStatus}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.siteTransactionId}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[150px] border-r border-gray-200">{row.coreTransactionStatus}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.soaNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.annualAmount}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">{row.term}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.amountPaid}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.balance}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.paymentType}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.paymentDate}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.orNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.permitNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.businessPlateNo}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.actualClosureDate}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.retirementReason}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.sourceType}</td>

                            {/* Review Information */}
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] border-r border-gray-200">
                              {row.violations.length > 0 ? (
                                <div className="space-y-1">
                                  {row.violations.map((violation, idx) => (
                                    <div key={idx} className="text-xs text-red-600 break-words">⚠ {violation}</div>
                                  ))}
                                </div>
                              ) : <span className="text-green-600">No violations</span>}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.assignedInspector || <span className="text-gray-400">-</span>}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.scheduledDate || <span className="text-gray-400">-</span>}</td>
                            <td className="px-3 py-3 min-w-[100px] border-r border-gray-200">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {row.status === 'reviewed' ? 'REVIEWED' : 'PENDING'}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">
                              {row.reviewedDate || (
                                <span className="text-gray-400 flex items-center">
                                  <FiClock className="w-3 h-3 mr-1" />
                                  Not reviewed
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">
                              <button onClick={(e) => { e.stopPropagation(); handleRowClick(row); }} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors">
                                <FiEdit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Table Footer */}
                <div className={`${isMobile ? 'px-4 py-2' : 'px-6 py-3'} border-t-2 border-gray-300 bg-gray-50`}>
                  <div className={`${isMobile ? 'flex-col space-y-1' : 'flex items-center justify-between'} text-sm text-gray-600`}>
                    <span>Showing {filteredCSVData.length} of {csvData.length} rows</span>
                    <span>Click any row to review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - File List */}
            <div className={`${isMobile ? 'w-full' : 'w-1/3'} space-y-3`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gray-50`}>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>Files for Review</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {csvFiles.filter(f => f.status === 'processing').length} files in progress
                  </p>
                </div>

                <div className={`${isMobile ? 'max-h-48' : 'max-h-64'} overflow-y-auto`}>
                  <div className="divide-y divide-gray-200">
                    {csvFiles.map((file) => (
                      <div key={file.id} onClick={() => handleFileSelect(file)} className={`${isMobile ? 'p-3' : 'p-4'} hover:bg-gray-50 cursor-pointer transition-colors ${selectedFile?.id === file.id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FiFile className="w-5 h-5 text-green-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.uploadDate} • {file.size} • {file.rows} rows</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={getStatusBadge(file.status)}>{file.status.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4`}>Review Statistics</h3>
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
                    <span className="text-sm font-medium text-blue-600">{Math.round((reviewedCount / csvData.length) * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Search Filters */}
              <ReviewFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal - Using the new component */}
      <ReviewModal
        selectedRow={selectedRow}
        showReviewModal={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSave={handleSaveReview}
        isMobile={isMobile}
      />
    </>
  );
}