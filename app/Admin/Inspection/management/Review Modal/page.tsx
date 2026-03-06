"use client";

import { useState } from "react";
import { FiCheck, FiX, FiSave, FiAlertTriangle, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase } from "react-icons/fi";

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
  site_transaction_status: string | null;
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

interface ReviewModalProps {
  selectedRow: CSVRow | null;
  showReviewModal: boolean;
  onClose: () => void;
  onSave: (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
  }) => void;
  isMobile: boolean;
}

function ReviewForm({ 
  initialActions, 
  initialViolations, 
  initialInspector, 
  initialScheduledDate,
  onSave, 
  onCancel, 
  isMobile 
}: {
  initialActions: string[];
  initialViolations: string[];
  initialInspector?: string;
  initialScheduledDate?: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  isMobile: boolean;
}) {
  const [reviewActions, setReviewActions] = useState<string[]>(initialActions);
  const [violations, setViolations] = useState<string[]>(initialViolations);
  const [violationText, setViolationText] = useState(initialViolations.join(', '));
  const [assignedInspector, setAssignedInspector] = useState(initialInspector || '');
  const [scheduledDate, setScheduledDate] = useState(initialScheduledDate || '');

  const handleActionChange = (action: string) => {
    setReviewActions([action]);
  };

  const handleViolationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setViolationText(text);
    const violationArray = text.split(',').map(v => v.trim()).filter(v => v.length > 0);
    setViolations(violationArray);
  };

  const handleSave = () => {
    onSave({
      reviewActions,
      violations,
      assignedInspector: assignedInspector || undefined,
      scheduledDate: scheduledDate || undefined,
    });
  };

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      {/* Review Actions */}
      <div>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiCheck className="w-5 h-5 mr-2 text-green-600" />
          Review Actions
        </h3>
        <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-3'}`}>
          {['Active', 'Compliant', 'Non-Compliant', 'For Inspection'].map((action) => (
            <label key={action} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="reviewAction"
                value={action}
                checked={reviewActions.includes(action)}
                onChange={() => handleActionChange(action)}
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">{action}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Violations */}
      <div>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiAlertTriangle className="w-5 h-5 mr-2 text-red-600" />
          Violations
        </h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="violations" className="block text-sm font-medium text-gray-700 mb-2">
              Enter violations (comma-separated)
            </label>
            <textarea
              id="violations"
              value={violationText}
              onChange={handleViolationTextChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="e.g., Fire safety equipment missing, No business permit display, Incorrect signage"
            />
          </div>
          {violations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Violations to be recorded:</p>
              <div className="flex flex-wrap gap-2">
                {violations.map((violation, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {violation}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Details */}
      <div>
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiUser className="w-5 h-5 mr-2 text-blue-600" />
          Assignment Details
        </h3>
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-4'}`}>
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
                placeholder="Enter inspector name"
              />
              <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Inspection Date
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

      {/* Action Buttons */}
      <div className={`${isMobile ? 'flex-col space-y-2' : 'flex justify-end space-x-4'} pt-4 border-t border-gray-200`}>
        <button onClick={onCancel} className={`${isMobile ? 'w-full' : ''} px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors`}>
          Cancel
        </button>
        <button onClick={handleSave} className={`${isMobile ? 'w-full' : ''} px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 shadow-lg transition-all duration-200 transform hover:scale-105`}>
          <FiSave className="w-4 h-4 mr-2" />
          Save Review
        </button>
      </div>
    </div>
  );
}

export default function ReviewModal({ selectedRow, showReviewModal, onClose, onSave, isMobile }: ReviewModalProps) {
  if (!showReviewModal || !selectedRow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isMobile ? 'w-full max-w-lg' : 'max-w-6xl w-full'} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Review Business</h2>
              <p className="text-green-100 text-sm mt-1">{selectedRow.business_name}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-white/20">
              <FiX className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'h-80' : 'h-96'} overflow-y-auto`}>
          <div className={`${isMobile ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3'} gap-6 p-6`}>
            
            {/* Left Column - Business Information */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-2'} space-y-6`}>
              <div>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>Business Information</h3>
                <p className="text-sm text-gray-500 mt-1">Permit #{selectedRow.transaction?.permit_no ?? '-'}</p>
              </div>

              <div className={`${isMobile ? 'h-80' : 'h-150'} overflow-y-auto pr-2 space-y-4`}>
                
                {/* Business Details Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBriefcase className="w-4 h-4 mr-2 text-gray-600" />
                    Business Details
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">BIN:</span>
                      <span className="truncate">{selectedRow.business_identification_no}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Name:</span>
                      <span className="truncate">{selectedRow.business_name}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Trade Name:</span>
                      <span className="truncate">{selectedRow.trade_name ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Nature:</span>
                      <span className="truncate">{selectedRow.business_nature?.nature_name ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Line:</span>
                      <span className="truncate">{selectedRow.business_line?.line_name ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Type:</span>
                      <span className="truncate">{selectedRow.business_type?.type_name ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Year Established:</span>
                      <span className="truncate">{selectedRow.year_established ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBriefcase className="w-4 h-4 mr-2 text-gray-600" />
                    Financial Information
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Capital:</span>
                      <span className="truncate">{selectedRow.capital != null ? `₱${selectedRow.capital.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Gross Amount:</span>
                      <span className="truncate">{selectedRow.gross_amount != null ? `₱${selectedRow.gross_amount.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Essential:</span>
                      <span className="truncate">{selectedRow.gross_amount_essential != null ? `₱${selectedRow.gross_amount_essential.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Non-Essential:</span>
                      <span className="truncate">{selectedRow.gross_amount_non_essential != null ? `₱${selectedRow.gross_amount_non_essential.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Reject Remarks:</span>
                      <span className="truncate">{selectedRow.reject_remarks ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Owner Information Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-600" />
                    Owner Information
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">
                        {[
                          selectedRow.owner?.incharge_firstname,
                          selectedRow.owner?.incharge_middlename,
                          selectedRow.owner?.incharge_lastname,
                          selectedRow.owner?.incharge_extension_name
                        ].filter(Boolean).join(' ') || '-'}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow.owner?.incharge_sex ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Citizenship:</span>
                      <span className="truncate">{selectedRow.owner?.incharge_citizenship ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Contact No:</span>
                      <span className="truncate">{selectedRow.owner?.incharge_contact_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Email:</span>
                      <span className="truncate">{selectedRow.owner?.incharge_email ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiMapPin className="w-4 h-4 mr-2 text-gray-600" />
                    Address Information
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Street:</span>
                      <span className="truncate">{selectedRow.address?.street ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Region:</span>
                      <span className="truncate">{selectedRow.address?.region ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Province:</span>
                      <span className="truncate">{selectedRow.address?.province ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Municipality:</span>
                      <span className="truncate">{selectedRow.address?.municipality ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Barangay:</span>
                      <span className="truncate">{selectedRow.address?.barangay ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Zipcode:</span>
                      <span className="truncate">{selectedRow.address?.zipcode ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Requestor Information Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiUser className="w-4 h-4 mr-2 text-gray-600" />
                    Requestor Information
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">
                        {[
                          selectedRow.transaction?.requestor?.requester_firstname,
                          selectedRow.transaction?.requestor?.requester_middlename,
                          selectedRow.transaction?.requestor?.requester_lastname,
                          selectedRow.transaction?.requestor?.requester_extension_name
                        ].filter(Boolean).join(' ') || '-'}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Email:</span>
                      <span className="truncate">{selectedRow.transaction?.requestor?.requester_email ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Mobile No:</span>
                      <span className="truncate">{selectedRow.transaction?.requestor?.requester_mobile_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow.transaction?.requestor?.requester_sex ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Civil Status:</span>
                      <span className="truncate">{selectedRow.transaction?.requestor?.requester_civil_status ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBriefcase className="w-4 h-4 mr-2 text-gray-600" />
                    Transaction Details
                  </h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction ID:</span>
                      <span className="truncate">{selectedRow.transaction?.transaction_id ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Module Type:</span>
                      <span className="truncate">{selectedRow.transaction?.module_type ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction Type:</span>
                      <span className="truncate">{selectedRow.transaction?.transaction_type ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction Date:</span>
                      <span className="truncate">{selectedRow.transaction?.transaction_date ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SITE Status:</span>
                      <span className="truncate">{selectedRow.transaction?.site_status ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Core Status:</span>
                      <span className="truncate">{selectedRow.transaction?.core_status ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SITE Transaction Status:</span>
                      <span className="truncate">{selectedRow.transaction?.site_transaction_status ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Brgy Clearance No:</span>
                      <span className="truncate">{selectedRow.transaction?.brgy_clearance_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SOA No:</span>
                      <span className="truncate">{selectedRow.transaction?.soa_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Annual Amount:</span>
                      <span className="truncate">{selectedRow.transaction?.annual_amount != null ? `₱${selectedRow.transaction.annual_amount.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Term:</span>
                      <span className="truncate">{selectedRow.transaction?.term ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Amount Paid:</span>
                      <span className="truncate">{selectedRow.transaction?.amount_paid != null ? `₱${selectedRow.transaction.amount_paid.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Balance:</span>
                      <span className="truncate">{selectedRow.transaction?.balance != null ? `₱${selectedRow.transaction.balance.toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Type:</span>
                      <span className="truncate">{selectedRow.transaction?.payment_type ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Date:</span>
                      <span className="truncate">{selectedRow.transaction?.payment_date ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">O.R No:</span>
                      <span className="truncate">{selectedRow.transaction?.or_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">O.R Date:</span>
                      <span className="truncate">{selectedRow.transaction?.or_date ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Permit No:</span>
                      <span className="truncate">{selectedRow.transaction?.permit_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Plate No:</span>
                      <span className="truncate">{selectedRow.transaction?.business_plate_no ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Actual Closure Date:</span>
                      <span className="truncate">{selectedRow.transaction?.actual_closure_date ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Retirement Reason:</span>
                      <span className="truncate">{selectedRow.transaction?.retirement_reason ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Source Type:</span>
                      <span className="truncate">{selectedRow.transaction?.source_type ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Review Form */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-1'}`}>
              <ReviewForm
                initialActions={selectedRow.review_info?.review_action ? [selectedRow.review_info.review_action] : []}
                initialViolations={selectedRow.review_info?.violation ? selectedRow.review_info.violation.split(',').map(v => v.trim()) : []}
                initialInspector={selectedRow.review_info?.assigned_inspector ?? undefined}
                initialScheduledDate={selectedRow.review_info?.scheduled_date ?? undefined}
                onSave={onSave}
                onCancel={onClose}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}