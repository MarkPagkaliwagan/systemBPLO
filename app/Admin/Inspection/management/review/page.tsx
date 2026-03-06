"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFile, FiCheck, FiClock, FiX, FiEdit } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "../../../../components/sidebar";
import ReviewModal from "../Review Modal/page";
import ReviewFilters from "../../filters/review-filters/page";

// =====================================================
// Types mapped to your SQL schema
// =====================================================

interface BusinessNature {
  business_nature_id: string;
  nature_name: string;
}

interface BusinessLine {
  business_line_id: string;
  line_name: string;
}

interface BusinessType {
  business_type_id: string;
  type_name: string;
}

interface Address {
  address_id: string;
  street: string | null;
  region: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
  zipcode: string | null;
}

interface Owner {
  owner_id: string;
  business_id: string;
  incharge_firstname: string;
  incharge_middlename: string | null;
  incharge_lastname: string;
  incharge_extension_name: string | null;
  incharge_sex: string | null;
  incharge_citizenship: string | null;
  incharge_birth_date: string | null;
  incharge_contact_no: string | null;
  incharge_email: string | null;
  owner_address_id: string | null;
}

interface Requestor {
  requestor_id: string;
  requester_firstname: string;
  requester_middlename: string | null;
  requester_lastname: string;
  requester_extension_name: string | null;
  requester_email: string | null;
  requester_mobile_no: string | null;
  requester_sex: string | null;
  requester_civil_status: string | null;
  requester_birth_date: string | null;
  address_id: string | null;
}

interface Transaction {
  transaction_id: string;
  business_id: string;
  requestor_id: string | null;
  module_type: string | null;
  transaction_type: string | null;
  transaction_date: string | null;
  site_status: string | null;
  core_status: string | null;
  brgy_clearance_status: string | null;  
  site_transaction_status: string | null; 
  reference_no: string | null; 
  soa_no: string | null;
  annual_amount: number | null;
  term: string | null;
  amount_paid: number | null;
  balance: number | null;
  payment_type: string | null;
  payment_date: string | null;
  or_no: string | null;
  brgy_clearance_no: string | null;
  or_date: string | null;
  permit_no: string | null;
  business_plate_no: string | null;
  actual_closure_date: string | null;
  retirement_reason: string | null;
  source_type: string | null;
}

type ReviewAction = 'active' | 'compliant' | 'non-compliant' | 'for inspection';
type ReviewStatus = 'not reviewed' | 'reviewed';

interface ReviewInfo {
  review_id: string;
  business_id: string;
  violation: string | null;
  review_action: ReviewAction | null;
  review_date: string | null;
  reviewed_by: string | null;
  status: ReviewStatus;
  assigned_inspector: string | null;
  scheduled_date: string | null;
}

interface CSVRow {
  business_id: string;
  business_identification_no: string;
  business_name: string;
  trade_name: string | null;
  year_established: number | null;
  capital: number | null;
  gross_amount: number | null;
  gross_amount_essential: number | null;
  gross_amount_non_essential: number | null;
  reject_remarks: string | null;
  business_nature: BusinessNature | null;
  business_line: BusinessLine | null;
  business_type: BusinessType | null;
  address: Address | null;
  owner: Owner | null;
  transaction: (Transaction & { requestor: Requestor | null }) | null;
  review_info: ReviewInfo | null;
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

    useEffect(() => {
    console.log('🔍 [DEBUG] Starting fetchFiles...');
    console.log('🔍 [DEBUG] Supabase client:', supabase);
    console.log('🔍 [DEBUG] Environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    });

    const fetchFiles = async () => {
      try {
        console.log('🔍 [DEBUG] Executing Supabase query...');
        const { data, error } = await supabase
          .from('transaction')
          .select(`
            transaction_id, 
            transaction_date, 
            business_id, 
            review_info (
              status
            )
          `)
          .order('transaction_date', { ascending: false });

        console.log('🔍 [DEBUG] Supabase query result:', { data, error });

        if (error) { 
          console.error('❌ [ERROR] Supabase query error:', error);
          console.error('❌ [ERROR] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          return; 
        }

        console.log('✅ [SUCCESS] Raw data from Supabase:', data);
        console.log('✅ [SUCCESS] Data length:', data?.length);

        const grouped = (data ?? []).reduce(
          (acc: Record<string, { id: string; name: string; uploadDate: string; rows: number; reviewed: number }>, tx) => {
            console.log('🔍 [DEBUG] Processing transaction:', tx);
            const key = tx.transaction_date ?? 'Unknown';
            if (!acc[key]) {
              acc[key] = { id: key, name: `Batch - ${key}`, uploadDate: key, rows: 0, reviewed: 0 };
            }
            acc[key].rows++;
            // Check if review_info exists and has status 'reviewed'
            if (tx.review_info && tx.review_info.length > 0 && tx.review_info[0]?.status === 'reviewed') {
              acc[key].reviewed++;
              console.log('🔍 [DEBUG] Found reviewed transaction:', tx);
            }
            return acc;
          }, {}
        );

        console.log('🔍 [DEBUG] Grouped data:', grouped);

        const files: CSVFile[] = Object.values(grouped).map(g => ({
          id: g.id,
          name: g.name,
          uploadDate: g.uploadDate,
          size: '-',
          rows: g.rows,
          status: g.reviewed === g.rows ? 'completed' : 'processing',
        }));

        console.log('✅ [SUCCESS] Processed files:', files);
        console.log('✅ [SUCCESS] Files length:', files.length);

        setCSVFiles(files);
        if (files.length > 0) {
          console.log('🔍 [DEBUG] Selecting first file:', files[0]);
          setSelectedFile(files[0]);
          loadCSVData(files[0].id);
        } else {
          console.log('⚠️ [WARNING] No files found');
        }
      } catch (err) {
        console.error('❌ [ERROR] Exception in fetchFiles:', err);
      }
    };

    fetchFiles();
  }, []);

  const loadCSVData = async (fileId: string) => {
    console.log('🔍 [DEBUG] Loading CSV data for file:', fileId);
    
    try {
      const { data, error } = await supabase
        .from('business')
        .select(`
          business_id,
          business_identification_no,
          business_name,
          trade_name,
          year_established,
          capital,
          gross_amount,
          gross_amount_essential,
          gross_amount_non_essential,
          reject_remarks,
          business_nature ( business_nature_id, nature_name ),
          business_line ( business_line_id, line_name ),
          business_type ( business_type_id, type_name ),
          address:business_address_id (
            address_id, street, region, province,
            municipality, barangay, zipcode
          ),
          owner (
            owner_id, incharge_firstname, incharge_middlename,
            incharge_lastname, incharge_extension_name,
            incharge_sex, incharge_citizenship, incharge_contact_no, incharge_email
          ),
          transaction (
            transaction_id, module_type, transaction_type,
            transaction_date, site_status, core_status, site_transaction_status,
            soa_no, annual_amount, term, amount_paid, balance,
            payment_type, payment_date, or_no, brgy_clearance_no, or_date,
            permit_no, business_plate_no, actual_closure_date,
            retirement_reason, source_type,
            requestor (
              requestor_id, requester_firstname, requester_middlename,
              requester_lastname, requester_extension_name,
              requester_email, requester_mobile_no,
              requester_sex, requester_civil_status
            )
          ),
          review_info (
            review_id, violation, review_action,
            review_date, reviewed_by, status,
            assigned_inspector, scheduled_date
          )
        `);

      console.log('🔍 [DEBUG] CSV data query result:', { data, error });

      if (error) { 
        console.error('❌ [ERROR] CSV data query error:', error);
        console.error('❌ [ERROR] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return; 
      }

      console.log('✅ [SUCCESS] Raw CSV data:', data);
      console.log('✅ [SUCCESS] CSV data length:', data?.length);
      
      const processedData = (data as unknown as CSVRow[]) ?? [];
      console.log('✅ [SUCCESS] Processed CSV data:', processedData);
      
      setCSVData(processedData);
    } catch (err) {
      console.error('❌ [ERROR] Exception in loadCSVData:', err);
    }
  };

  const handleFileSelect = (file: CSVFile) => {
    console.log('🔍 [DEBUG] File selected:', file);
    setSelectedFile(file);
    loadCSVData(file.id);
  };

  const handleRowClick = (row: CSVRow) => {
    console.log('🔍 [DEBUG] Row clicked:', row);
    setSelectedRow(row);
    setShowReviewModal(true);
  };

  const handleSaveReview = async (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
  }) => {
    if (!selectedRow) return;

    console.log('🔍 [DEBUG] Saving review:', reviewData);

    const actionMap: Record<string, ReviewAction> = {
      'Active': 'active',
      'Compliant': 'compliant',
      'Non-Compliant': 'non-compliant',
      'For Inspection': 'for inspection',
    };

    const dbAction: ReviewAction = actionMap[reviewData.reviewActions[0]] ?? 'active';

    try {
      const { error } = await supabase
        .from('review_info')
        .upsert({
          business_id: selectedRow.business_id,
          violation: reviewData.violations.join(', ') || null,
          review_action: dbAction,
          review_date: new Date().toISOString().split('T')[0],
          reviewed_by: null, // TODO: replace with real user id from your auth context
          status: 'reviewed' as ReviewStatus,
          assigned_inspector: reviewData.assignedInspector ?? null,
          scheduled_date: reviewData.scheduledDate ?? null,
        }, { onConflict: 'business_id' });

      console.log('🔍 [DEBUG] Save review result:', { error });

      if (error) { 
        console.error('❌ [ERROR] Save review error:', error);
        console.error('❌ [ERROR] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return; 
      }

      const updatedRow: CSVRow = {
        ...selectedRow,
        review_info: {
          review_id: selectedRow.review_info?.review_id ?? crypto.randomUUID(),
          business_id: selectedRow.business_id,
          violation: reviewData.violations.join(', ') || null,
          review_action: dbAction,
          review_date: new Date().toISOString().split('T')[0],
          reviewed_by: null,
          status: 'reviewed',
          assigned_inspector: reviewData.assignedInspector ?? null,
          scheduled_date: reviewData.scheduledDate ?? null,
        }
      };

      console.log('✅ [SUCCESS] Updated row:', updatedRow);

      setCSVData(prev => prev.map(row =>
        row.business_id === selectedRow.business_id ? updatedRow : row
      ));

      const reviewedCount = csvData.filter(r => r.review_info?.status === 'reviewed').length + 1;
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
    } catch (err) {
      console.error('❌ [ERROR] Exception in handleSaveReview:', err);
    }
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

  const filteredCSVData = csvData.filter(row => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();

    const searchableStrings = [
      row.business_identification_no,
      row.business_name,
      row.trade_name,
      row.business_nature?.nature_name,
      row.business_line?.line_name,
      row.business_type?.type_name,
      row.address?.street,
      row.address?.region,
      row.address?.province,
      row.address?.municipality,
      row.address?.barangay,
      row.address?.zipcode,
      row.owner?.incharge_firstname,
      row.owner?.incharge_lastname,
      row.owner?.incharge_contact_no,
      row.owner?.incharge_email,
      row.transaction?.module_type,
      row.transaction?.transaction_type,
      row.transaction?.site_status,
      row.transaction?.core_status,
      row.transaction?.site_transaction_status,
      row.transaction?.permit_no,
      row.review_info?.violation,
      row.review_info?.review_action,
      row.review_info?.status,
    ];

    return searchableStrings.some(val =>
      val?.toLowerCase().includes(searchLower)
    );
  });

  const reviewedCount = csvData.filter(row => row.review_info?.status === 'reviewed').length;
  const notReviewedCount = csvData.filter(row => row.review_info?.status === 'not reviewed').length;
  const filteredReviewedCount = filteredCSVData.filter(row => row.review_info?.status === 'reviewed').length;
  const filteredNotReviewedCount = filteredCSVData.filter(row => row.review_info?.status === 'not reviewed').length;

  console.log('🔍 [DEBUG] Component state:', {
    csvFilesLength: csvFiles.length,
    csvDataLength: csvData.length,
    reviewedCount,
    notReviewedCount,
    selectedFile: selectedFile?.name
  });

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
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>Scheduling </h1>
            <p className="text-gray-600">Reviewing and Scheduling </p>
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
                    <span>{csvData.length > 0 ? Math.round((reviewedCount / csvData.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-600 transition-all duration-300"
                      style={{ width: `${csvData.length > 0 ? (reviewedCount / csvData.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Mobile Card View or Desktop Table */}
                {isMobile ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredCSVData.map((row, index) => (
                      <div
                        key={row.business_id}
                        className={`border-b border-gray-200 p-4 cursor-pointer transition-colors ${row.review_info?.status === 'reviewed' ? 'bg-green-50' : 'bg-white'
                          }`}
                        onClick={() => handleRowClick(row)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{row.business_name}</h4>
                            <p className="text-xs text-gray-500">{row.address?.street}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.review_info?.status === 'reviewed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {row.review_info?.status === 'reviewed' ? 'REVIEWED' : 'PENDING'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          {row.review_info?.review_action && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-green-600">✓ {row.review_info.review_action}</span>
                            </div>
                          )}
                          {row.review_info?.violation && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-red-600">⚠ {row.review_info.violation}</span>
                            </div>
                          )}
                          {row.transaction?.site_transaction_status && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-blue-600">📋 {row.transaction.site_transaction_status}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {row.review_info?.review_date || 'Not reviewed'}
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
                    <table className="w-full min-w-[2000px] border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[50px] border-r border-gray-300">#</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Business Identification Number</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[180px] border-r border-gray-300">Business Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Business Nature</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[200px] border-r border-gray-300">Office Street</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[80px] border-r border-gray-300">Region</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Province</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">Municipality</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Barangay</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[90px] border-r border-gray-300">Zipcode</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[70px] border-r border-gray-300">Year</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Capital</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[130px] border-r border-gray-300">Gross Amount</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px] border-r border-gray-300">Gross Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[150px] border-r border-gray-300">Gross Non-Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Reject Remarks</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Module Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Transaction Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">SITE Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[120px] border-r border-gray-300">Core Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[140px] border-r border-gray-300">SITE Transaction Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky top-0 bg-gray-50 min-w-[100px] border-r border-gray-300">Permit No.</th>
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
                          <tr key={row.business_id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${row.review_info?.status === 'reviewed' ? 'bg-green-50' : 'bg-white'}`} onClick={() => handleRowClick(row)}>
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 font-medium min-w-[50px] border-r border-gray-200">{index + 1}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[140px] border-r border-gray-200">{row.business_identification_no}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 min-w-[180px] border-r border-gray-200">{row.business_name}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.business_nature?.nature_name ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] max-w-[250px] truncate border-r border-gray-200" title={row.address?.street ?? ''}>{row.address?.street ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[80px] border-r border-gray-200">{row.address?.region ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.address?.province ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.address?.municipality ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.address?.barangay ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[90px] border-r border-gray-200">{row.address?.zipcode ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[70px] border-r border-gray-200">{row.year_established ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.capital != null ? `₱${row.capital.toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[130px] border-r border-gray-200">{row.gross_amount != null ? `₱${row.gross_amount.toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[150px] border-r border-gray-200">{row.gross_amount_essential != null ? `₱${row.gross_amount_essential.toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[150px] border-r border-gray-200">{row.gross_amount_non_essential != null ? `₱${row.gross_amount_non_essential.toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.reject_remarks ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.transaction?.module_type ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.transaction?.transaction_type ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.transaction?.site_status ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.transaction?.core_status ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.transaction?.site_transaction_status ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[100px] border-r border-gray-200">{row.transaction?.permit_no ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] border-r border-gray-200">
                              {row.review_info?.violation ? (
                                <div className="space-y-1">
                                  <div className="text-xs text-red-600 break-words">⚠ {row.review_info.violation}</div>
                                </div>
                              ) : <span className="text-green-600">No violations</span>}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">{row.review_info?.assigned_inspector || <span className="text-gray-400">-</span>}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[120px] border-r border-gray-200">{row.review_info?.scheduled_date || <span className="text-gray-400">-</span>}</td>
                            <td className="px-3 py-3 min-w-[100px] border-r border-gray-200">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.review_info?.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {row.review_info?.status === 'reviewed' ? 'REVIEWED' : 'PENDING'}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 min-w-[140px] border-r border-gray-200">
                              {row.review_info?.review_date || (
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
                    <span className="text-sm font-medium text-blue-600">{csvData.length > 0 ? Math.round((reviewedCount / csvData.length) * 100) : 0}%</span>
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