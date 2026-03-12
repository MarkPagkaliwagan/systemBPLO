"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiFile, FiCheck, FiClock, FiX, FiEdit, FiSearch } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "../../../../components/sidebar";
import ReviewModal from "../Modal/reviewModal";

interface BusinessRecord {
  id: string;
  "Business Identification Number": string;
  "Business Name": string;
  "Trade Name": string | null;
  "Business Nature": string | null;
  "Business Line": string | null;
  "Business Type": string | null;
  "Transmittal No.": string | null;
  "Incharge First Name": string | null;
  "Incharge Middle Name": string | null;
  "Incharge Last Name": string | null;
  "Incharge Extension Name": string | null;
  "Incharge Sex": string | null;
  "Citizenship": string | null;
  "Office Street": string | null;
  "Office Region": string | null;
  "Office Province": string | null;
  "Office Municipality": string | null;
  "Office Barangay": string | null;
  "Office Zipcode": string | null;
  "Year": number | null;
  "Capital": number | null;
  "Gross Amount": number | null;
  "Gross Amount Essential": number | null;
  "Gross Amount Non-Essential": number | null;
  "Reject Remarks": string | null;
  "Module Type": string | null;
  "Transaction Type": string | null;
  "Requestor First Name": string | null;
  "Requestor Middle Name": string | null;
  "Requestor Last Name": string | null;
  "Requestor Extension Name": string | null;
  "Requestor Email": string | null;
  "Requestor Mobile No.": string | null;
  "Birth Date": string | null;
  "Requestor Sex": string | null;
  "Civil Status": string | null;
  "Requestor Street": string | null;
  "Requestor Province": string | null;
  "Requestor Municipality": string | null;
  "Requestor Barangay": string | null;
  "Requestor Zipcode": string | null;
  "Transaction ID": string | null;
  "Reference No.": string | null;
  "Brgy. Clearance Status": string | null;
  "SITE Transaction Status": string | null;
  "CORE Transaction Status": string | null;
  "Transaction Date": string | null;
  "SOA No.": string | null;
  "Annual Amount": number | null;
  "Term": string | null;
  "Amount Paid": number | null;
  "Balance": number | null;
  "Payment Type": string | null;
  "Payment Date": string | null;
  "O.R. No.": string | null;
  "Brgy. Clearance No.": string | null;
  "O.R. Date": string | null;
  "Permit No.": string | null;
  "Business Plate No.": string | null;
  "Actual Closure Date": string | null;
  "Retirement Reason": string | null;
  "Source Type": string | null;
  violation: string | null;
  review_action: string | null;
  review_date: string | null;
  reviewed_by: string | null;
  status: string | null;
  assigned_inspector: string | null;
  scheduled_date: string | null;
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
  const [csvData, setCSVData] = useState<BusinessRecord[]>([]);
  const [selectedRow, setSelectedRow] = useState<BusinessRecord | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('csv_uploads')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (error) { console.error('❌ fetchFiles error:', error); return; }

        // For each file, count total vs reviewed rows to derive real status
        const files: CSVFile[] = await Promise.all(
          (data ?? []).map(async (f: any) => {
            const [{ count: total }, { count: reviewed }] = await Promise.all([
              supabase.from('business_records').select('*', { count: 'exact', head: true }).eq('file_id', f.id),
              supabase.from('business_records').select('*', { count: 'exact', head: true })
                .eq('file_id', f.id)
                .not('status', 'in', '("not reviewed","not_reviewed")')
                .not('status', 'is', null),
            ]);

            const derivedStatus: 'processing' | 'completed' =
              (total ?? 0) > 0 && reviewed === total ? 'completed' : 'processing';

            return {
              id: f.id,
              name: f.file_name,
              uploadDate: f.uploaded_at,
              size: '-',
              rows: total ?? f.row_count,
              status: derivedStatus,
            };
          })
        );

        setCSVFiles(files);

        const params = new URLSearchParams(window.location.search);
        const fileIdParam = params.get('fileId');
        const fileToSelect = fileIdParam
          ? files.find(f => f.id === fileIdParam) ?? files[0]
          : files[0];

        if (fileToSelect) {
          setSelectedFile(fileToSelect);
          loadCSVData(fileToSelect.id);
        }
      } catch (err) {
        console.error('❌ Exception in fetchFiles:', err);
      }
    };

    fetchFiles();
  }, []);

  const loadCSVData = async (fileId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_records')
        .select('*')
        .eq('file_id', fileId);

      if (error) { console.error('❌ loadCSVData error:', error); return; }
      setCSVData((data ?? []) as BusinessRecord[]);
    } catch (err) {
      console.error('❌ Exception in loadCSVData:', err);
    }
  };

  const handleFileSelect = (file: CSVFile) => {
    setSelectedFile(file);
    loadCSVData(file.id);
  };

  const handleRowClick = (row: BusinessRecord) => {
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

    const violationStr = reviewData.violations.join(', ') || null;
    const reviewActionStr = reviewData.reviewActions.join(', ') || null;

    let rowStatus = 'reviewed';
    if (reviewData.reviewActions.includes('For Inspection')) rowStatus = 'for_inspection';
    else if (reviewData.reviewActions.includes('Non-Compliant')) rowStatus = 'non_compliant';
    else if (reviewData.reviewActions.includes('Compliant')) rowStatus = 'compliant';
    else if (reviewData.reviewActions.includes('Active')) rowStatus = 'active';

    try {
      const { error } = await supabase
        .from('business_records')
        .update({
          violation: violationStr,
          review_action: reviewActionStr,
          review_date: new Date().toISOString().split('T')[0],
          reviewed_by: null,
          status: rowStatus,
          assigned_inspector: reviewData.assignedInspector ?? null,
          scheduled_date: reviewData.scheduledDate ?? null,
        })
        .eq('"Business Identification Number"', selectedRow["Business Identification Number"]);

      if (error) { console.error('❌ handleSaveReview error:', error); return; }

      const updatedRow: BusinessRecord = {
        ...selectedRow,
        violation: violationStr,
        review_action: reviewActionStr,
        review_date: new Date().toISOString().split('T')[0],
        reviewed_by: null,
        status: rowStatus,
        assigned_inspector: reviewData.assignedInspector ?? null,
        scheduled_date: reviewData.scheduledDate ?? null,
      };

      const allRows = csvData.map(r =>
        r["Business Identification Number"] === selectedRow["Business Identification Number"] ? updatedRow : r
      );

      setCSVData(allRows);

      // Count how many rows are now reviewed (any status except not reviewed/null)
      const totalRows = allRows.length;
      const reviewedRows = allRows.filter(r => isRowReviewed(r.status)).length;
      const newFileStatus: 'processing' | 'completed' =
        reviewedRows === totalRows ? 'completed' : 'processing';

      // ✅ Persist file status back to Supabase
      if (selectedFile) {
        const { error: fileError } = await supabase
          .from('csv_uploads')
          .update({ status: newFileStatus })
          .eq('id', selectedFile.id);

        if (fileError) console.error('❌ csv_uploads status update error:', fileError);

        setCSVFiles(prev => prev.map(f =>
          f.id === selectedFile.id ? { ...f, status: newFileStatus } : f
        ));
        setSelectedFile({ ...selectedFile, status: newFileStatus });
      }

      setShowReviewModal(false);
      setSelectedRow(null);
    } catch (err) {
      console.error('❌ Exception in handleSaveReview:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'completed': return `${baseClass} bg-green-100 text-green-800`;
      case 'processing': return `${baseClass} bg-yellow-100 text-yellow-800`;
      default: return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const getRowStatusBadge = (status: string | null) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'for_inspection': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRowStatusLabel = (status: string | null) => {
    if (!status || status === 'not reviewed') return 'PENDING';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const isRowReviewed = (status: string | null) =>
    !!status && status !== 'not reviewed' && status !== 'not_reviewed';

  const filteredCSVData = csvData.filter(row => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      if (!Object.values(row).some(val => val != null && String(val).toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Scheduled filter
    if (showScheduledOnly && !row.scheduled_date) return false;

    return true;
  });

  const reviewedCount = csvData.filter(row => isRowReviewed(row.status)).length;
  const notReviewedCount = csvData.filter(row => !isRowReviewed(row.status)).length;

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="min-h-screen bg-gray-50 pt-1">
        <div className={`${isMobile ? 'px-4 py-6' : 'px-6 py-10'}`}>
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>Scheduling</h1>
            <p className="text-gray-600">Reviewing and Scheduling</p>
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
                  <div className={`${isMobile ? 'flex-col items-start space-y-3' : 'flex items-center justify-between'}`}>
                    <div className={isMobile ? 'w-full' : ''}>
                      <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
                        {selectedFile ? selectedFile.name : 'No file selected'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedFile ? `${reviewedCount}/${selectedFile.rows} rows reviewed • ${selectedFile.size}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center gap-2">
                        <FiSearch className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search rows..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-3 py-2 text-black border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-48"
                        />
                        {/* Scheduled only toggle */}
                        <button
                          onClick={() => setShowScheduledOnly(!showScheduledOnly)}
                          className={`ml-2 px-3 py-2 text-xs rounded border transition-colors ${showScheduledOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'
                            }`}
                        >
                          Scheduled
                        </button>
                      </div>
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

                {/* Mobile Card View */}
                {isMobile ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredCSVData.map((row) => (

                      <div
                        key={row["Business Identification Number"]}
                        className={`border-b border-gray-200 p-4 cursor-pointer transition-colors ${isRowReviewed(row.status) ? 'bg-green-50' : 'bg-white'}`}
                        onClick={() => handleRowClick(row)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{row["Business Name"]}</h4>
                            <p className="text-xs text-gray-500">{row["Office Street"]}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRowStatusBadge(row.status)}`}>
                            {getRowStatusLabel(row.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {row.review_action && (
                            <div><span className="text-green-600">✓ {row.review_action}</span></div>
                          )}
                          {row.violation && (
                            <div><span className="text-red-600">⚠ {row.violation}</span></div>
                          )}
                          {row["SITE Transaction Status"] && (
                            <div><span className="text-blue-600">📋 {row["SITE Transaction Status"]}</span></div>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            {row.review_date || 'Not reviewed'}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Add Business if search term not found */}
                    {searchTerm && !filteredCSVData.some(row =>
                      row["Business Name"]?.toLowerCase() === searchTerm.toLowerCase()
                    ) && (
                        <div
                          className="border-t border-gray-200 p-4 bg-green-100 cursor-pointer rounded mt-2 text-green-900 font-semibold text-center"
                          onClick={() => router.push(`/Admin/Inspection/management/manual_add?name=${encodeURIComponent(searchTerm)}`)}
                        >
                          + Add "{searchTerm}"
                        </div>
                      )}
                  </div>
                ) : (
                  /* Desktop Table */
                  <div className="h-[600px] overflow-auto">
                    <table className="w-full min-w-[2400px] border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[50px] border-r border-gray-300">#</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">BIN</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[180px] border-r border-gray-300">Business Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Trade Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Transmittal No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Business Nature</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Business Line</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Business Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[200px] border-r border-gray-300">Office Street</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[80px] border-r border-gray-300">Region</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Province</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">Municipality</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Barangay</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[90px] border-r border-gray-300">Zipcode</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[70px] border-r border-gray-300">Year</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Capital</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[130px] border-r border-gray-300">Gross Amount</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[150px] border-r border-gray-300">Gross Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[160px] border-r border-gray-300">Gross Non-Essential</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Reject Remarks</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Module Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[130px] border-r border-gray-300">Transaction Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Reference No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[160px] border-r border-gray-300">Brgy. Clearance Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[160px] border-r border-gray-300">SITE Transaction Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">CORE Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[100px] border-r border-gray-300">Permit No.</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[200px] border-r border-gray-300">Violations</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">Assigned Inspector</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[130px] border-r border-gray-300">Scheduled Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[100px] border-r border-gray-300">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">Reviewed Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[80px] border-r border-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-300">
                        {filteredCSVData.map((row, index) => (
                          <tr
                            key={row["Business Identification Number"]}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${isRowReviewed(row.status) ? 'bg-green-50' : 'bg-white'}`}
                            onClick={() => handleRowClick(row)}
                          >
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 font-medium border-r border-gray-200">{index + 1}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{row["Business Identification Number"]}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{row["Business Name"]}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Trade Name"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Transmittal No."] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Business Nature"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Business Line"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Business Type"] ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-[250px] truncate border-r border-gray-200">{row["Office Street"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Region"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Province"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Municipality"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Barangay"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Zipcode"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Year"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Capital"] != null ? `₱${row["Capital"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Gross Amount"] != null ? `₱${row["Gross Amount"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Gross Amount Essential"] != null ? `₱${row["Gross Amount Essential"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Gross Amount Non-Essential"] != null ? `₱${row["Gross Amount Non-Essential"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Reject Remarks"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Module Type"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Transaction Type"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Reference No."] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Brgy. Clearance Status"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["SITE Transaction Status"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["CORE Transaction Status"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Permit No."] ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] border-r border-gray-200">
                              {row.violation
                                ? <div className="text-xs text-red-600 break-words">⚠ {row.violation}</div>
                                : <span className="text-green-600">No violations</span>}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row.assigned_inspector ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row.scheduled_date ?? '-'}</td>
                            <td className="px-3 py-3 border-r border-gray-200">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRowStatusBadge(row.status)}`}>
                                {getRowStatusLabel(row.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                              {row.review_date || (
                                <span className="text-gray-400 flex items-center">
                                  <FiClock className="w-3 h-3 mr-1" /> Not reviewed
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {/* Add Business row if search term not found */}
                        {searchTerm && !filteredCSVData.some(row =>
                          row["Business Name"]?.toLowerCase() === searchTerm.toLowerCase()
                        ) && (
                            <tr className="bg-green-100 cursor-pointer hover:bg-green-200 transition-colors"
                              onClick={() => router.push(`/Admin/Inspection/management/manual_add?name=${encodeURIComponent(searchTerm)}`)}>
                              <td colSpan={40} className="text-center text-green-900 font-semibold py-3">
                                + Add "{searchTerm}"
                              </td>
                            </tr>
                          )}
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

            {/* Right Side - File List + Stats */}
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
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`${isMobile ? 'p-3' : 'p-4'} hover:bg-gray-50 cursor-pointer transition-colors ${selectedFile?.id === file.id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FiFile className="w-5 h-5 text-green-600" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.uploadDate} • {file.size} • {file.rows} rows</p>
                            </div>
                          </div>
                          <span className={getStatusBadge(file.status)}>{file.status.toUpperCase()}</span>
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
                    <span className="text-sm font-medium text-blue-600">
                      {csvData.length > 0 ? Math.round((reviewedCount / csvData.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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