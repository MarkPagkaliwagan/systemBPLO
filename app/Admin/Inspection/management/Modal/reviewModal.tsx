// app/module-2-inspection/Review Modal/ReviewModal.tsx
"use client";

import { useState } from "react";
import { FiCheck, FiX, FiSave, FiAlertTriangle, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase } from "react-icons/fi";
import { handlePhotoUpload } from "@/lib/photoUpload";

interface BusinessRecord {
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
  photo: string | null;
  latitude: string | null;
  longitude: string | null;
  accuracy: string | null;
}

interface ReviewModalProps {
  selectedRow: BusinessRecord | null;
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

  // ── Photo upload handler ───────────────────────────────────────────────
  // Called by coworker's UI when a photo is selected
  // Usage: const photoUrl = await onUploadPhoto(file);
  const onUploadPhoto = async (file: File) => {
    const photoUrl = await handlePhotoUpload(
      file,
      selectedRow["Business Identification Number"],
      selectedRow["Business Name"]
    );

    if (!photoUrl) {
      console.error('❌ Photo upload failed');
      return null;
    }

    console.log('✅ Photo uploaded:', photoUrl);
    return photoUrl;
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className={`${isMobile ? 'w-full max-w-full max-h-full' : 'max-w-5xl w-full mx-4'} bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto`}>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>Review Business</h2>
              <p className="text-green-100 text-sm mt-1">{selectedRow["Business Name"]}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-white/20">
              <FiX className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            </button>
          </div>
        </div>

        <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-3 gap-6'}`}>

            {/* Business Information Card */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-2'} bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200`}>
              <div className="flex items-center mb-3">
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <FiBriefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Business Information</h3>
                  <p className="text-xs text-gray-500">Permit #{selectedRow["Permit No."]}</p>
                </div>
              </div>

              <div className={`${isMobile ? 'max-h-64' : 'h-150'} overflow-y-auto pr-1 space-y-3`}>

                {/* Business Details */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Business Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">BIN:</span><span className="break-all">{selectedRow["Business Identification Number"]}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Business Name:</span><span className="break-words">{selectedRow["Business Name"]}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Trade Name:</span><span className="break-words">{selectedRow["Trade Name"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Nature:</span><span className="break-words">{selectedRow["Business Nature"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Line:</span><span className="break-words">{selectedRow["Business Line"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Type:</span><span className="break-words">{selectedRow["Business Type"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Transmittal:</span><span className="break-words">{selectedRow["Transmittal No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Module:</span><span className="break-words">{selectedRow["Module Type"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Transaction:</span><span className="break-words">{selectedRow["Transaction Type"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Year:</span><span>{selectedRow["Year"] ?? '-'}</span></div>
                  </div>
                </div>

                {/* Incharge Information */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Incharge Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Name:</span><span className="break-words">{[selectedRow["Incharge First Name"], selectedRow["Incharge Middle Name"], selectedRow["Incharge Last Name"], selectedRow["Incharge Extension Name"]].filter(Boolean).join(' ') || '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Sex:</span><span>{selectedRow["Incharge Sex"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Citizenship:</span><span>{selectedRow["Citizenship"] ?? '-'}</span></div>
                  </div>
                </div>

                {/* Office Address */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Office Address</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Street:</span><span className="break-words">{selectedRow["Office Street"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Region:</span><span>{selectedRow["Office Region"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Province:</span><span>{selectedRow["Office Province"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Municipality:</span><span>{selectedRow["Office Municipality"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Barangay:</span><span>{selectedRow["Office Barangay"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Zipcode:</span><span>{selectedRow["Office Zipcode"] ?? '-'}</span></div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Financial Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Capital:</span><span>{selectedRow["Capital"] != null ? `₱${selectedRow["Capital"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Gross Amount:</span><span>{selectedRow["Gross Amount"] != null ? `₱${selectedRow["Gross Amount"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Essential:</span><span>{selectedRow["Gross Amount Essential"] != null ? `₱${selectedRow["Gross Amount Essential"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Non-Essential:</span><span>{selectedRow["Gross Amount Non-Essential"] != null ? `₱${selectedRow["Gross Amount Non-Essential"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Reject Remarks:</span><span className="break-words">{selectedRow["Reject Remarks"] || '-'}</span></div>
                  </div>
                </div>

                {/* Requestor Information */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Requestor Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Name:</span><span className="break-words">{[selectedRow["Requestor First Name"], selectedRow["Requestor Middle Name"], selectedRow["Requestor Last Name"], selectedRow["Requestor Extension Name"]].filter(Boolean).join(' ') || '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Email:</span><span className="break-all">{selectedRow["Requestor Email"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Mobile No:</span><span>{selectedRow["Requestor Mobile No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Sex:</span><span>{selectedRow["Requestor Sex"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Civil Status:</span><span>{selectedRow["Civil Status"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Address:</span><span className="break-words">{selectedRow["Requestor Street"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Municipality:</span><span>{selectedRow["Requestor Municipality"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Barangay:</span><span>{selectedRow["Requestor Barangay"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Zipcode:</span><span>{selectedRow["Requestor Zipcode"] ?? '-'}</span></div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Transaction Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Transaction ID:</span><span className="break-all">{selectedRow["Transaction ID"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Reference No:</span><span>{selectedRow["Reference No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Brgy Clearance:</span><span>{selectedRow["Brgy. Clearance Status"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">SITE Transaction:</span><span>{selectedRow["SITE Transaction Status"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Core Transaction:</span><span>{selectedRow["CORE Transaction Status"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">SOA No:</span><span>{selectedRow["SOA No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Annual Amount:</span><span>{selectedRow["Annual Amount"] != null ? `₱${selectedRow["Annual Amount"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Term:</span><span>{selectedRow["Term"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Amount Paid:</span><span>{selectedRow["Amount Paid"] != null ? `₱${selectedRow["Amount Paid"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Balance:</span><span>{selectedRow["Balance"] != null ? `₱${selectedRow["Balance"].toLocaleString()}` : '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Payment Type:</span><span>{selectedRow["Payment Type"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Payment Date:</span><span>{selectedRow["Payment Date"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">O.R No:</span><span>{selectedRow["O.R. No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Permit No:</span><span>{selectedRow["Permit No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Business Plate No:</span><span>{selectedRow["Business Plate No."] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Closure Date:</span><span>{selectedRow["Actual Closure Date"] || '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Retirement Reason:</span><span className="break-words">{selectedRow["Retirement Reason"] || '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Source Type:</span><span>{selectedRow["Source Type"] ?? '-'}</span></div>
                  </div>
                </div>

                {/* Geo-Tagging */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm border-b border-gray-300 pb-2">Geo-Tagging</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Photo:</span><span className="break-all">{selectedRow["photo"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Longitude:</span><span>{selectedRow["longitude"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Latitude:</span><span>{selectedRow["latitude"] ?? '-'}</span></div>
                    <div className="flex items-start text-gray-600"><span className="font-bold mr-2 text-gray-700 shrink-0">Accuracy:</span><span>{selectedRow["accuracy"] ?? '-'}</span></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Review Form */}
            {/* 
              ── FOR COWORKER ──────────────────────────────────────────────
              To upload a photo, call onUploadPhoto(file) with a File object.
              Example usage in your UI:
              
              const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const photoUrl = await onUploadPhoto(file);
                if (photoUrl) {
                  // photo saved! update UI here
                }
              };
              ──────────────────────────────────────────────────────────────
            */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-1'}`}>
              <ReviewForm
                initialActions={selectedRow.review_action ? selectedRow.review_action.split(',').map(a => a.trim()) : []}
                initialViolations={selectedRow.violation ? selectedRow.violation.split(',').map(v => v.trim()) : []}
                initialInspector={selectedRow.assigned_inspector ?? undefined}
                initialScheduledDate={selectedRow.scheduled_date ?? undefined}
                onSave={onSave}
                onCancel={onClose}
                onUploadPhoto={onUploadPhoto}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Review Form Component ─────────────────────────────────────────────────────
function ReviewForm({
  initialActions,
  initialViolations,
  initialInspector,
  initialScheduledDate,
  onSave,
  onCancel,
  onUploadPhoto,
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
  // ── FOR COWORKER ──────────────────────────────────────────────────────────
  // Call this with a File object to upload photo to Supabase bucket
  // Returns the public URL of the uploaded photo, or null if failed
  // Example: const photoUrl = await onUploadPhoto(file);
  onUploadPhoto: (file: File) => Promise<string | null>;
  // ─────────────────────────────────────────────────────────────────────────
  isMobile?: boolean;
}) {
  const [reviewActions, setReviewActions] = useState<string[]>(initialActions);
  const [violations, setViolations] = useState<string[]>(initialViolations);
  const [violationText, setViolationText] = useState<string>(initialViolations.join(', '));
  const [assignedInspector, setAssignedInspector] = useState<string>(initialInspector || '');
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduledDate || '');

  const availableActions = ['Active', 'Compliant', 'Non-Compliant', 'For Inspection'];

  const isRedAction = (action: string) =>
    action === 'Non-Compliant' || action === 'For Inspection';

  const addAction = (action: string) => {
    if (!reviewActions.includes(action)) setReviewActions([...reviewActions, action]);
  };

  const removeAction = (index: number) => {
    setReviewActions(reviewActions.filter((_, i) => i !== index));
  };

  const handleViolationTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setViolationText(text);
    setViolations(text.split(',').map(v => v.trim()).filter(v => v.length > 0));
  };

  const handleSave = () => {
    onSave({
      reviewActions,
      violations,
      assignedInspector: assignedInspector || undefined,
      scheduledDate: scheduledDate || undefined,
    });
  };

  const showInspectorFields = reviewActions.includes('For Inspection');

  return (
    <div className="space-y-4">

      {/* Review Actions */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
          <FiCheck className="w-4 h-4 mr-2 text-green-600" />
          Review Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {availableActions.map((action) => {
            const isSelected = reviewActions.includes(action);
            const isRed = isRedAction(action);
            return (
              <button
                key={action}
                onClick={() => addAction(action)}
                disabled={isSelected}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? isRed
                      ? 'bg-red-600 text-white shadow-lg scale-105 ring-2 ring-red-500 ring-offset-2'
                      : 'bg-green-600 text-white shadow-lg scale-105 ring-2 ring-green-500 ring-offset-2'
                    : isRed
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Actions</label>
          <div className="min-h-[60px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            {reviewActions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reviewActions.map((action, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isRedAction(action) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    <FiCheck className="w-3 h-3 mr-1" />
                    {action}
                    <button
                      onClick={() => removeAction(index)}
                      className={`ml-2 transition-colors ${
                        isRedAction(action) ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                      }`}
                    >
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

      {/* Violations */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
          <FiAlertTriangle className="w-4 h-4 mr-2 text-red-600" />
          Violations
        </h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">Violations Details</label>
        <textarea
          rows={3}
          value={violationText}
          onChange={handleViolationTextChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-red-700"
          placeholder="Enter violations separated by commas..."
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple violations with commas</p>
      </div>

      {/* Inspector Assignment */}
      {showInspectorFields && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
            <FiUser className="w-4 h-4 mr-2 text-blue-600" />
            Inspection Assignment
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Inspector</label>
              <div className="relative">
                <input
                  type="text"
                  value={assignedInspector}
                  onChange={(e) => setAssignedInspector(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-black"
                  placeholder="Enter inspector name..."
                />
                <FiUser className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                />
                <FiCalendar className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="pt-4 border-t border-gray-200 flex flex-col gap-2">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 shadow-lg transition-all duration-200 active:scale-95"
        >
          <FiSave className="w-4 h-4" />
          Save Review
        </button>
        <button
          onClick={onCancel}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors active:scale-95"
        >
          Cancel
        </button>
      </div>

    </div>
  );
}