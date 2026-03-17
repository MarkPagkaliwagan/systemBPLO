// app/module-2-inspection/Review Modal/ReviewModal.tsx
"use client";

import { useState, useRef } from "react";
import { FiCheck, FiX, FiSave, FiAlertTriangle, FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiBriefcase, FiCamera, FiUpload, FiTrash2 } from "react-icons/fi";

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

interface ReviewModalProps {
  selectedRow: BusinessRecord | null;
  showReviewModal: boolean;
  onClose: () => void;
  onSave: (reviewData: {
    reviewActions: string[];
    violations: string[];
    assignedInspector?: string;
    scheduledDate?: string;
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
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
              <p className="text-green-100 text-sm mt-1">{selectedRow["Business Name"]}</p>
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
                  <p className="text-sm text-gray-500 mt-1">Permit #{selectedRow["Permit No."]}</p>
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
                      <span className="truncate">{selectedRow["Business Identification Number"]}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Name:</span>
                      <span className="truncate">{selectedRow["Business Name"]}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Trade Name:</span>
                      <span className="truncate">{selectedRow["Trade Name"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Nature:</span>
                      <span className="truncate">{selectedRow["Business Nature"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Line:</span>
                      <span className="truncate">{selectedRow["Business Line"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Type:</span>
                      <span className="truncate">{selectedRow["Business Type"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transmittal:</span>
                      <span className="truncate">{selectedRow["Transmittal No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Module:</span>
                      <span className="truncate">{selectedRow["Module Type"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction:</span>
                      <span className="truncate">{selectedRow["Transaction Type"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Year:</span>
                      <span className="truncate">{selectedRow["Year"] ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Incharge Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Incharge Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">
                        {[selectedRow["Incharge First Name"], selectedRow["Incharge Middle Name"], selectedRow["Incharge Last Name"], selectedRow["Incharge Extension Name"]].filter(Boolean).join(' ') || '-'}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow["Incharge Sex"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Citizenship:</span>
                      <span className="truncate">{selectedRow["Citizenship"] ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Office Address Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Office Address</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Street:</span>
                      <span className="truncate">{selectedRow["Office Street"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Region:</span>
                      <span className="truncate">{selectedRow["Office Region"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Province:</span>
                      <span className="truncate">{selectedRow["Office Province"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Municipality:</span>
                      <span className="truncate">{selectedRow["Office Municipality"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Barangay:</span>
                      <span className="truncate">{selectedRow["Office Barangay"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Zipcode:</span>
                      <span className="truncate">{selectedRow["Office Zipcode"] ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Financial Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Capital:</span>
                      <span className="truncate">{selectedRow["Capital"] != null ? `₱${selectedRow["Capital"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Gross Amount:</span>
                      <span className="truncate">{selectedRow["Gross Amount"] != null ? `₱${selectedRow["Gross Amount"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Essential:</span>
                      <span className="truncate">{selectedRow["Gross Amount Essential"] != null ? `₱${selectedRow["Gross Amount Essential"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Non-Essential:</span>
                      <span className="truncate">{selectedRow["Gross Amount Non-Essential"] != null ? `₱${selectedRow["Gross Amount Non-Essential"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Reject Remarks:</span>
                      <span className="truncate">{selectedRow["Reject Remarks"] || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Requestor Information Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Requestor Information</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Name:</span>
                      <span className="truncate">
                        {[selectedRow["Requestor First Name"], selectedRow["Requestor Middle Name"], selectedRow["Requestor Last Name"], selectedRow["Requestor Extension Name"]].filter(Boolean).join(' ') || '-'}
                      </span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Email:</span>
                      <span className="truncate">{selectedRow["Requestor Email"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Mobile No:</span>
                      <span className="truncate">{selectedRow["Requestor Mobile No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Sex:</span>
                      <span className="truncate">{selectedRow["Requestor Sex"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Civil Status:</span>
                      <span className="truncate">{selectedRow["Civil Status"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Address:</span>
                      <span className="truncate">{selectedRow["Requestor Street"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Municipality:</span>
                      <span className="truncate">{selectedRow["Requestor Municipality"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Barangay:</span>
                      <span className="truncate">{selectedRow["Requestor Barangay"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Zipcode:</span>
                      <span className="truncate">{selectedRow["Requestor Zipcode"] ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Details Section */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm border-b border-gray-300 pb-2">Transaction Details</h4>
                  <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 gap-3'} text-sm`}>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Transaction ID:</span>
                      <span className="truncate">{selectedRow["Transaction ID"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Reference No:</span>
                      <span className="truncate">{selectedRow["Reference No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Brgy Clearance:</span>
                      <span className="truncate">{selectedRow["Brgy. Clearance Status"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SITE Transaction:</span>
                      <span className="truncate">{selectedRow["SITE Transaction Status"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Core Transaction:</span>
                      <span className="truncate">{selectedRow["CORE Transaction Status"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">SOA No:</span>
                      <span className="truncate">{selectedRow["SOA No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Annual Amount:</span>
                      <span className="truncate">{selectedRow["Annual Amount"] != null ? `₱${selectedRow["Annual Amount"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Term:</span>
                      <span className="truncate">{selectedRow["Term"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Amount Paid:</span>
                      <span className="truncate">{selectedRow["Amount Paid"] != null ? `₱${selectedRow["Amount Paid"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Balance:</span>
                      <span className="truncate">{selectedRow["Balance"] != null ? `₱${selectedRow["Balance"].toLocaleString()}` : '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Type:</span>
                      <span className="truncate">{selectedRow["Payment Type"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Payment Date:</span>
                      <span className="truncate">{selectedRow["Payment Date"] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">O.R No:</span>
                      <span className="truncate">{selectedRow["O.R. No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Permit No:</span>
                      <span className="truncate">{selectedRow["Permit No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Business Plate No:</span>
                      <span className="truncate">{selectedRow["Business Plate No."] ?? '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Closure Date:</span>
                      <span className="truncate">{selectedRow["Actual Closure Date"] || '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Retirement Reason:</span>
                      <span className="truncate">{selectedRow["Retirement Reason"] || '-'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <span className="font-bold mr-2 text-gray-700">Source Type:</span>
                      <span className="truncate">{selectedRow["Source Type"] ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className={`${isMobile ? 'w-full' : 'lg:col-span-1'}`}>
              <ReviewForm
                initialActions={selectedRow.review_action ? selectedRow.review_action.split(',').map(a => a.trim()) : []}
                initialViolations={selectedRow.violation ? selectedRow.violation.split(',').map(v => v.trim()) : []}
                initialInspector={selectedRow.assigned_inspector ?? undefined}
                initialScheduledDate={selectedRow.scheduled_date ?? undefined}
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
    location?: { lat: number; lng: number; accuracy: number };
    photo?: File;
  }) => void;
  onCancel: () => void;
  isMobile?: boolean;
}) {
  const [reviewActions, setReviewActions] = useState<string[]>(initialActions);
  const [violations, setViolations] = useState<string[]>(initialViolations);
  const [violationText, setViolationText] = useState<string>(initialViolations.join(', '));
  const [assignedInspector, setAssignedInspector] = useState<string>(initialInspector || '');
  const [scheduledDate, setScheduledDate] = useState<string>(initialScheduledDate || '');

  // ── Geo-tag state ──────────────────────────────────────────────
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocationStatus('success');
      },
      () => setLocationStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  // ──────────────────────────────────────────────────────────────

  // ── Photo state ───────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'granted' | 'denied'>('idle');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Request camera permission then trigger the input
  const openCamera = async () => {
    try {
      // Ask browser for camera permission — works on desktop & mobile
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Permission granted — stop the stream immediately (we just needed the prompt)
      stream.getTracks().forEach((t) => t.stop());
      setCameraPermission('granted');
      // Trigger the file input with capture="environment"
      cameraInputRef.current?.click();
    } catch {
      setCameraPermission('denied');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePhotoFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setCameraPermission('idle');
  };
  // ──────────────────────────────────────────────────────────────

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
    const violationArray = text.split(',').map(v => v.trim()).filter(v => v.length > 0);
    setViolations(violationArray);
  };

  const handleSave = () => {
    onSave({
      reviewActions,
      violations,
      assignedInspector: assignedInspector || undefined,
      scheduledDate: scheduledDate || undefined,
      location: location || undefined,
      photo: photoFile || undefined,
    });
  };

  const showInspectorFields = reviewActions.includes('For Inspection');

  return (
    <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
      {/* Hidden file inputs — always mounted so refs are stable */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ''; }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ''; }}
      />

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

      {/* ── Inspection Photo — always visible for all statuses ── */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiCamera className="w-4 h-4 mr-2 text-green-600" />
          Inspection Photo
        </h3>

        {/* Camera permission denied warning */}
        {cameraPermission === 'denied' && (
          <div className="mb-3 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Camera access was denied. Please allow camera permission in your browser settings, then try again. You can still upload a photo using the Upload File button.
            </p>
          </div>
        )}

        {/* Photo preview — shown when a photo is captured/uploaded */}
        {photoPreview && (
          <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <div className="relative">
              <img
                src={photoPreview}
                alt="Inspection photo"
                className="w-full max-h-64 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-white shadow-sm transition-colors"
                >
                  <FiCamera className="w-3 h-3" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-red-600 shadow-sm transition-colors"
                >
                  <FiTrash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{photoFile?.name}</p>
                <p className="text-xs text-gray-400">{photoFile ? `${(photoFile.size / 1024).toFixed(1)} KB` : ''}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Captured</span>
            </div>
          </div>
        )}

        {/* Dropzone — shown when no photo yet */}
        {!photoPreview && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full rounded-xl border-2 border-dashed transition-all duration-200
              ${isDragging
                ? 'border-green-400 bg-green-50 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
              }`}
          >
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <FiCamera className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isMobile ? 'Tap to take a photo or upload' : 'Drag & drop a photo here, or use the buttons below'}
              </p>
              <p className="text-xs text-gray-400 mb-5">JPG, PNG, WEBP • Max 10 MB</p>
              <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} gap-3`}>
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                >
                  <FiCamera className="w-4 h-4" />
                  Open Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                >
                  <FiUpload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ── End Inspection Photo ── */}

      {/* ── Geo-tag Location — always visible for all statuses ── */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center`}>
          <FiMapPin className="w-4 h-4 mr-2 text-blue-600" />
          Inspection Location
        </h3>
        <button
          type="button"
          onClick={captureLocation}
          disabled={locationStatus === 'loading'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
            ${locationStatus === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : locationStatus === 'error'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : locationStatus === 'loading'
              ? 'bg-gray-100 text-gray-500 border border-gray-300 cursor-wait'
              : 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
            }`}
        >
          <FiMapPin className="w-4 h-4 flex-shrink-0" />
          {locationStatus === 'loading' && 'Getting location...'}
          {locationStatus === 'success' && location && `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
          {locationStatus === 'error' && 'Location failed — tap to retry'}
          {locationStatus === 'idle' && 'Capture Current Location'}
        </button>
        {locationStatus === 'success' && location && (
          <p className="text-xs text-gray-500 mt-2">
            Accuracy: ±{location.accuracy}m ·{' '}
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              View on map
            </a>
          </p>
        )}
      </div>
      {/* ── End Geo-tag ── */}

      {/* Inspector Assignment Section — only for 'For Inspection' */}
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
      <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-4'} pt-4 border-t border-gray-200`}>
        <button onClick={onCancel} className={`${isMobile ? 'w-full' : ''} px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors`}>
          Cancel
        </button>
        <button onClick={handleSave} className={`${isMobile ? 'w-full flex items-center justify-center' : 'flex items-center'} px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 shadow-lg transition-all duration-200 transform hover:scale-105`}>
          <FiSave className="w-4 h-4 mr-2" />
          Save Review
        </button>
      </div>
    </div>
  );
}