// app/module-2-inspection/Review Modal/ReviewModal.tsx
"use client";

import { useState } from "react";
import { FiCheck, FiX, FiSave, FiAlertTriangle, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase } from "react-icons/fi";

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

export default function ReviewModal({ selectedRow, showReviewModal, onClose, onSave, isMobile }: ReviewModalProps) {
  if (!showReviewModal || !selectedRow) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className={`${isMobile ? 'w-full max-w-full max-h-full' : 'max-w-5xl w-full mx-4'} bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Review Business</h2>
              <p className="text-green-100 text-sm mt-1">{selectedRow.businessName}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-white/20">
              <FiX className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </button>
          </div>
        </div>

        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>
            {/* Business Information Card */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-2'} bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200`}>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <FiBriefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>Business Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Permit #{selectedRow.permitNo}</p>
                </div>
              </div>

              {/* Exact Business Information Container */}
              <div className={`${isMobile ? 'h-80' : 'h-150'} overflow-y-auto pr-2 space-y-9`}>
                {/* Business Details Section */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Business Details</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">BIN:</span>
                      <span className="truncate">{selectedRow.businessIdentificationNumber}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Name:</span>
                      <span className="truncate">{selectedRow.businessName}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Trade Name:</span>
                      <span className="truncate">{selectedRow.tradeName}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Nature:</span>
                      <span className="truncate">{selectedRow.businessNature}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Line:</span>
                      <span className="truncate">{selectedRow.businessLine}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Type:</span>
                      <span className="truncate">{selectedRow.businessType}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transmittal:</span>
                      <span className="truncate">{selectedRow.transmittalNumber}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Module:</span>
                      <span className="truncate">{selectedRow.moduleType}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction:</span>
                      <span className="truncate">{selectedRow.transactionType}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Year:</span>
                      <span className="truncate">{selectedRow.year}</span>
                    </div>
                  </div>
                </div>

                {/* Incharge Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Incharge Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">{selectedRow.inchargeFirstName} {selectedRow.inchargeMiddleName} {selectedRow.inchargeLastName} {selectedRow.inchargeExtensionName}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow.inchargeSex}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Citizenship:</span>
                      <span className="truncate">{selectedRow.citizenship}</span>
                    </div>
                  </div>
                </div>

                {/* Office Address Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Office Address</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Street:</span>
                      <span className="truncate">{selectedRow.officeStreet}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Region:</span>
                      <span className="truncate">{selectedRow.officeRegion}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Province:</span>
                      <span className="truncate">{selectedRow.officeProvince}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Municipality:</span>
                      <span className="truncate">{selectedRow.officeMunicipality}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Barangay:</span>
                      <span className="truncate">{selectedRow.officeBarangay}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Zipcode:</span>
                      <span className="truncate">{selectedRow.officeZipcode}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Financial Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Capital:</span>
                      <span className="truncate">{selectedRow.capital}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Gross Amount:</span>
                      <span className="truncate">{selectedRow.grossAmount}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Essential:</span>
                      <span className="truncate">{selectedRow.grossAmountEssential}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Non-Essential:</span>
                      <span className="truncate">{selectedRow.grossAmountNonEssential}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Reject Remarks:</span>
                      <span className="truncate">{selectedRow.rejectRemarks || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Requestor Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Requestor Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">{selectedRow.requestorFirstName} {selectedRow.requestorMiddleName} {selectedRow.requestorLastName} {selectedRow.requestorExtensionName}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Email:</span>
                      <span className="truncate">{selectedRow.requestorEmail}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Mobile No:</span>
                      <span className="truncate">{selectedRow.requestorMobileNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow.requestorSex}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Civil Status:</span>
                      <span className="truncate">{selectedRow.civilStatus}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Address:</span>
                      <span className="truncate">{selectedRow.requestorStreet}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Municipality:</span>
                      <span className="truncate">{selectedRow.requestorMunicipality}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Barangay:</span>
                      <span className="truncate">{selectedRow.requestorBarangay}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Zipcode:</span>
                      <span className="truncate">{selectedRow.requestorZipcode}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Transaction Details</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction ID:</span>
                      <span className="truncate">{selectedRow.transactionId}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Reference No:</span>
                      <span className="truncate">{selectedRow.referenceNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Brgy Clearance:</span>
                      <span className="truncate">{selectedRow.brgyClearanceStatus}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SITE Transaction:</span>
                      <span className="truncate">{selectedRow.siteTransactionId}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Core Transaction:</span>
                      <span className="truncate">{selectedRow.coreTransactionStatus}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SOA No:</span>
                      <span className="truncate">{selectedRow.soaNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Annual Amount:</span>
                      <span className="truncate">{selectedRow.annualAmount}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Term:</span>
                      <span className="truncate">{selectedRow.term}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Amount Paid:</span>
                      <span className="truncate">{selectedRow.amountPaid}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Balance:</span>
                      <span className="truncate">{selectedRow.balance}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Type:</span>
                      <span className="truncate">{selectedRow.paymentType}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Date:</span>
                      <span className="truncate">{selectedRow.paymentDate}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">O.R No:</span>
                      <span className="truncate">{selectedRow.orNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Permit No:</span>
                      <span className="truncate">{selectedRow.permitNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Plate No:</span>
                      <span className="truncate">{selectedRow.businessPlateNo}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Closure Date:</span>
                      <span className="truncate">{selectedRow.actualClosureDate || '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Retirement Reason:</span>
                      <span className="truncate">{selectedRow.retirementReason || '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Source Type:</span>
                      <span className="truncate">{selectedRow.sourceType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-1'}`}>
              <ReviewForm
                initialActions={selectedRow.reviewActions}
                initialViolations={selectedRow.violations}
                initialInspector={selectedRow.assignedInspector}
                initialScheduledDate={selectedRow.scheduledDate}
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

// Review Form Component
function ReviewForm({
  initialActions,
  initialViolations,
  initialInspector,
  initialScheduledDate,
  onSave,
  onCancel,
  isMobile = false
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
  isMobile?: boolean;
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
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Review Actions Section */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiCheck className="w-4 h-4 mr-2 text-green-600" />
          Review Actions
        </h3>

        <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-3'}`}>
          {availableActions.map((action) => (
            <button
              key={action}
              onClick={() => addAction(action)}
              disabled={reviewActions.includes(action)}
              className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'} rounded-lg font-medium transition-all duration-200 ${reviewActions.includes(action)
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
          <div className="min-h-[60px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {reviewActions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reviewActions.map((action, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <FiCheck className="w-3 h-3 mr-1" />
                    {action}
                    <button onClick={() => removeAction(index)} className="ml-2 text-green-600 hover:text-green-800 transition-colors">
                      <FiX className="w-3 h-3" />
                    </button>
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
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiAlertTriangle className="w-4 h-4 mr-2 text-red-600" />
          Violations
        </h3>

        <div className="mb-4">
          <label htmlFor="violations" className="block text-sm font-medium text-gray-700 mb-2">
            Violations Details
          </label>
          <textarea
            id="violations"
            rows={isMobile ? 3 : 4}
            value={violationText}
            onChange={handleViolationTextChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-red-700"
            placeholder="Enter violations separated by commas..."
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple violations with commas</p>
        </div>
      </div>

      {/* Inspector Assignment Section */}
      {showInspectorFields && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
            <FiUser className="w-4 h-4 mr-2 text-blue-600" />
            Inspection Assignment
          </h3>

          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
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