"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiClock, FiEdit, FiSearch, FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Sidebar from "../../../../components/sidebar";
import ReviewModal from "../Modal/reviewModal";

const PAGE_SIZE = 50;

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
  file_id: string | null;
  photo: string | null;
  latitude: string | null;
  longitude: string | null;
  accuracy: string | null;
}

export default function CSVReview() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [csvData, setCSVData] = useState<BusinessRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);

  const [selectedRow, setSelectedRow] = useState<BusinessRecord | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [pendingCount, setPendingCount] = useState<number | null>(null);

  // ── Responsive ────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [showScheduledOnly]);

  // ── Fetch records ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('business_records')
          .select('*', { count: 'exact' })
          .range(from, to);

        if (debouncedSearch.trim()) {
          query = query.or(
            [
              `"Business Name".ilike.%${debouncedSearch}%`,
              `"Business Identification Number".ilike.%${debouncedSearch}%`,
              `"Office Barangay".ilike.%${debouncedSearch}%`,
              `"Office Municipality".ilike.%${debouncedSearch}%`,
            ].join(',')
          );
        }

        if (showScheduledOnly) {
          query = query.not('scheduled_date', 'is', null);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('❌ fetchRecords error:', error.message, error.details);
          setLoading(false);
          return;
        }

        setCSVData((data ?? []) as BusinessRecord[]);
        setTotalCount(count ?? 0);
      } catch (err) {
        console.error('❌ Exception fetchRecords:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [currentPage, debouncedSearch, showScheduledOnly]);

  // ── Fetch pending count ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase
        .from('business_records')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.not reviewed,status.is.null');
      setPendingCount(count ?? 0);
    };
    fetchPending();
  }, [csvData]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  const handleRowClick = (row: BusinessRecord) => {
    setSelectedRow(row);
    setShowReviewModal(true);
  };

  const handleSaveReview = async (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photoUrl?: string;
  }) => {
    if (!selectedRow) return;

    const violationStr = reviewData.violations.join(', ') || null;
    const reviewActionStr = reviewData.reviewActions.join(', ') || null;

    let rowStatus = 'reviewed';
    if (reviewData.reviewActions.includes('For Inspection')) rowStatus = 'for_inspection';
    else if (reviewData.reviewActions.includes('Non-Compliant')) rowStatus = 'non_compliant';
    else if (reviewData.reviewActions.includes('Compliant')) rowStatus = 'compliant';
    else if (reviewData.reviewActions.includes('Active')) rowStatus = 'active';

    const bin = selectedRow["Business Identification Number"];

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
          // ── Save photo URL if uploaded ──
          ...(reviewData.photoUrl ? { photo: reviewData.photoUrl } : {}),
          // ── Save location if captured ──
          ...(reviewData.location ? {
            latitude: String(reviewData.location.lat),
            longitude: String(reviewData.location.lng),
            accuracy: String(reviewData.location.accuracy),
          } : {}),
        })
        .eq('Business Identification Number', bin);

      if (error) { console.error('❌ handleSaveReview error:', error); return; }

      setCSVData(prev =>
        prev.map(r =>
          r["Business Identification Number"] === bin
            ? {
              ...r,
              violation: violationStr,
              review_action: reviewActionStr,
              review_date: new Date().toISOString().split('T')[0],
              reviewed_by: null,
              status: rowStatus,
              assigned_inspector: reviewData.assignedInspector ?? null,
              scheduled_date: reviewData.scheduledDate ?? null,
              ...(reviewData.photoUrl ? { photo: reviewData.photoUrl } : {}),
              ...(reviewData.location ? {
                latitude: String(reviewData.location.lat),
                longitude: String(reviewData.location.lng),
                accuracy: String(reviewData.location.accuracy),
              } : {}),
            }
            : r
        )
      );

      setShowReviewModal(false);
      setSelectedRow(null);
    } catch (err) {
      console.error('❌ Exception handleSaveReview:', err);
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, 5);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pageNumbers.push(i);
    }

    return (
      <div className="px-[1.5vw] py-[1vh] border-t border-gray-200 bg-gray-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-gray-600 text-center" style={{ fontSize: 'clamp(10px, 1vw, 14px)' }}>
          {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} records
        </span>
        <div className="flex items-center justify-center flex-wrap" style={{ gap: 'clamp(2px, 0.4vw, 6px)' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ width: 'clamp(26px, 2.2vw, 40px)', height: 'clamp(26px, 2.2vw, 40px)' }}
          >
            <FiChevronLeft style={{ width: 'clamp(11px, 1vw, 16px)', height: 'clamp(11px, 1vw, 16px)' }} />
          </button>
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex items-center justify-center rounded-lg font-medium transition-colors
                ${currentPage === page
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-200 hover:bg-gray-100 text-gray-700'}`}
              style={{
                width: 'clamp(26px, 2.2vw, 40px)',
                height: 'clamp(26px, 2.2vw, 40px)',
                fontSize: 'clamp(10px, 1vw, 14px)',
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ width: 'clamp(26px, 2.2vw, 40px)', height: 'clamp(26px, 2.2vw, 40px)' }}
          >
            <FiChevronRight style={{ width: 'clamp(11px, 1vw, 16px)', height: 'clamp(11px, 1vw, 16px)' }} />
          </button>
        </div>
      </div>
    );
  };

  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="min-h-screen bg-gray-50 pt-1" style={{ paddingBottom: isMobile ? 80 : 0 }}>
        <div className={isMobile ? 'px-3 py-5' : 'px-6 py-10'}>

          {/* ── Header ── */}
          <div className="mb-5">
            <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-1`}>
              Scheduling
            </h1>
            <p className="text-sm text-gray-500">Reviewing and Scheduling</p>
            <div className="mt-2 h-7 flex items-center">
              {pendingCount !== null && pendingCount > 0 && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {pendingCount.toLocaleString()} records pending review
                </div>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

              {/* Search / filter bar */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">All Business Records</h2>
                    <p className="text-xs text-gray-500 mt-0.5 h-4">
                      {totalCount > 0 ? `${totalCount.toLocaleString()} total records` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowScheduledOnly(!showScheduledOnly)}
                    className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${showScheduledOnly
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300'
                      }`}
                  >
                    {showScheduledOnly ? '📅 Scheduled' : 'Scheduled'}
                  </button>
                </div>
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                  <input
                    type="text"
                    placeholder="Search name, BIN, barangay..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  />
                </div>
              </div>

              <div className="relative" style={{ minHeight: isMobile ? '400px' : '600px' }}>

                {loading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {!loading && csvData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-gray-400">
                    <p className="text-base font-medium">No records found</p>
                    <p className="text-sm mt-1">Try adjusting your search</p>
                    {searchTerm && (
                      <div
                        className="mt-4 px-6 py-3 bg-green-100 cursor-pointer rounded-lg text-green-900 font-semibold hover:bg-green-200 transition-colors text-sm"
                        onClick={() => router.push(`/Admin/Inspection/management/manual_add?name=${encodeURIComponent(searchTerm)}`)}
                      >
                        + Add "{searchTerm}"
                      </div>
                    )}
                  </div>

                ) : isMobile ? (
                  /* ── Mobile Cards ── */
                  <div className="divide-y divide-gray-100">
                    {csvData.map((row, index) => (
                      <div
                        key={`mobile-${currentPage}-${index}-${row["Business Identification Number"]}`}
                        onClick={() => handleRowClick(row)}
                        className={`p-4 cursor-pointer active:bg-gray-50 transition-colors ${isRowReviewed(row.status) ? 'bg-green-50' : 'bg-white'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                              {row["Business Name"]}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {row["Business Identification Number"]}
                            </p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${getRowStatusBadge(row.status)}`}>
                            {getRowStatusLabel(row.status)}
                          </span>
                        </div>

                        {(row["Office Barangay"] || row["Office Municipality"]) && (
                          <p className="text-xs text-gray-500 mb-2 truncate">
                            📍 {[row["Office Barangay"], row["Office Municipality"]].filter(Boolean).join(', ')}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {row["Business Nature"] && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full truncate max-w-[120px]">
                              {row["Business Nature"]}
                            </span>
                          )}
                          {row["Business Type"] && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full truncate max-w-[120px]">
                              {row["Business Type"]}
                            </span>
                          )}
                          {row.scheduled_date && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                              📅 {row.scheduled_date}
                            </span>
                          )}
                        </div>

                        {row.violation && (
                          <p className="text-xs text-red-600 mb-1 line-clamp-1">⚠ {row.violation}</p>
                        )}
                        {row.review_action && (
                          <p className="text-xs text-green-600 mb-1 line-clamp-1">✓ {row.review_action}</p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {row.review_date ?? 'Not reviewed'}
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); handleRowClick(row); }}
                            className="flex items-center gap-1 text-xs text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors active:scale-95"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                            Review
                          </button>
                        </div>
                      </div>
                    ))}

                    {searchTerm && !csvData.some(row =>
                      row["Business Name"]?.toLowerCase() === searchTerm.toLowerCase()
                    ) && (
                        <div
                          className="p-4 bg-green-50 cursor-pointer text-green-900 font-semibold text-sm text-center hover:bg-green-100 transition-colors active:bg-green-200"
                          onClick={() => router.push(`/Admin/Inspection/management/manual_add?name=${encodeURIComponent(searchTerm)}`)}
                        >
                          + Add "{searchTerm}"
                        </div>
                      )}
                  </div>

                ) : (
                  /* ── Desktop Table ── */
                  <div className="h-[600px] overflow-auto">
                    <table className="w-full min-w-[2400px] border-collapse">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[50px] border-r border-gray-300">#</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">BIN</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[180px] border-r border-gray-300">Business Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Business Type</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[200px] border-r border-gray-300">Office Street</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Province</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] border-r border-gray-300">Municipality</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Barangay</th>

                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[70px] border-r border-gray-300">Year</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[120px] border-r border-gray-300">Capital</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[130px] border-r border-gray-300">Gross Amount</th>

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
                        {csvData.map((row, index) => (
                          <tr
                            key={`desktop-${currentPage}-${index}-${row["Business Identification Number"]}`}
                            onClick={() => handleRowClick(row)}
                            className={`hover:bg-blue-50 cursor-pointer transition-colors ${isRowReviewed(row.status) ? 'bg-green-50' : 'bg-white'}`}
                          >
                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 font-medium border-r border-gray-200">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{row["Business Identification Number"]}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">{row["Business Name"]}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Business Type"] ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-[250px] truncate border-r border-gray-200">{row["Office Street"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Region"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Province"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Municipality"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Office Barangay"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Year"] ?? '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Capital"] != null ? `₱${row["Capital"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Gross Amount"] != null ? `₱${row["Gross Amount"].toLocaleString()}` : '-'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">{row["Permit No."] ?? '-'}</td>
                            <td className="px-3 py-3 text-sm text-gray-600 min-w-[200px] border-r border-gray-200">
                              {row.violation
                                ? <div className="text-xs text-red-600 break-words">⚠ {row.violation}</div>
                                : <span className="text-green-600 text-xs">No violations</span>}
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
                                onClick={e => { e.stopPropagation(); handleRowClick(row); }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {searchTerm && !csvData.some(row =>
                          row["Business Name"]?.toLowerCase() === searchTerm.toLowerCase()
                        ) && (
                            <tr
                              className="bg-green-100 cursor-pointer hover:bg-green-200 transition-colors"
                              onClick={() => router.push(`/Admin/Inspection/management/manual_add?name=${encodeURIComponent(searchTerm)}`)}
                            >
                              <td colSpan={40} className="text-center text-green-900 font-semibold py-3">
                                + Add "{searchTerm}"
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Table Footer */}
              <div className="px-4 py-2 border-t-2 border-gray-300 bg-gray-50">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
                  <span>Showing {csvData.length} of {totalCount.toLocaleString()} records</span>
                  <span>Tap any row to review</span>
                </div>
              </div>

              <Pagination />
            </div>
          </div>
        </div>
      </div>

      {/* ── ReviewModal — with live update callbacks ── */}
      <ReviewModal
        selectedRow={selectedRow}
        showReviewModal={showReviewModal}
        onClose={() => { setShowReviewModal(false); setSelectedRow(null); }}
        onSave={handleSaveReview}
        isMobile={isMobile}
        onRecordUpdated={(updated) => {
          setCSVData(prev =>
            prev.map(r => {
              const isSame =
                r["Business Identification Number"] ===
                updated["Business Identification Number"];
              return isSame ? (updated as BusinessRecord) : r;
            })
          );
          setSelectedRow(updated as BusinessRecord);
        }}
      />

      {!isMobile && (
        <Link
          href="/Admin/Inspection/management/manual_add"
          title="Manual Add Record"
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        >
          <FiPlus className="w-6 h-6" />
        </Link>
      )}
    </>
  );
}