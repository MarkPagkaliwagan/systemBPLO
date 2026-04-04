"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type NoticeFormData = {
  notice_no?: string;
  type?: string;
  date?: string;
  business_name?: string;
  address?: string;
  nature_of_business?: string;
  violation?: boolean;
  otherViolation?: string;
  rented?: boolean;
  owner?: string;
  rent?: string;
  ownerAddress?: string;
  contact?: string;
  inspectedBy?: string;
  receivedBy?: string;
  notedBy?: string;
  receivedAt?: string;
  actionTaken?: string;
  signatures?: {
    inspectedBy?: string;
    receivedBy?: string;
    notedBy?: string;
  };
};

type Props = {
  initialData?: NoticeFormData;
};

function getSignatureSrc(signature?: string) {
  if (!signature || signature === "null") return "";
  if (signature.startsWith("data:")) return signature;
  return `data:image/png;base64,${signature}`;
}

function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 print:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🖨️</span>
            <h3 id="modal-title" className="text-base font-bold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="text-sm leading-6 text-gray-600">{children}</div>
        <div className="mt-5 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

function LoadingOverlay({ open, message = "Preparing document..." }: { open: boolean; message?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-emerald-700" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

function FieldLabel({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 print:text-[9px] print:tracking-wider">
      <span className="print:hidden">{icon}</span>
      {children}
    </label>
  );
}

function ReadOnlyInput({
  value,
  className = "",
  placeholder,
  type = "text",
}: {
  value?: string;
  className?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value ?? ""}
        readOnly
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 placeholder-gray-300 focus:outline-none print:bg-white print:border-gray-300 print:text-xs print:py-1 print:px-2"
      />
    </div>
  );
}

function ReadOnlyTextArea({ value, placeholder, rows = 3 }: { value?: string; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value ?? ""}
      readOnly
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 placeholder-gray-300 resize-none print:bg-white print:border-gray-300 print:text-xs print:py-1 print:px-2"
    />
  );
}

function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-gray-50/60 p-4 print:bg-white print:border-gray-200 print:p-3 ${className}`}>
      {children}
    </div>
  );
}

function SignatureBox({ label, icon, name, signature }: { label: string; icon: string; name?: string; signature?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[9px] print:mb-2">
        <span className="print:hidden">{icon}</span>
        {label}
      </p>
      <ReadOnlyInput value={name} placeholder="Full Name" className="mb-3 print:mb-2" />
      <div className="h-24 rounded-lg border border-dashed border-gray-200 bg-white flex items-center justify-center overflow-hidden print:h-16 print:border-gray-300">
        {signature ? (
          <img src={getSignatureSrc(signature)} alt={`${label} Signature`} className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-gray-300 italic">No signature</span>
        )}
      </div>
    </div>
  );
}

function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="my-5 border-gray-100 print:my-3" />;
  return (
    <div className="relative flex items-center my-5 print:my-3">
      <div className="flex-grow border-t border-gray-100" />
      <span className="mx-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
      <div className="flex-grow border-t border-gray-100" />
    </div>
  );
}

export default function NoticePage({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEffect(() => { setIsLoading(false); }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPreparingPrint(false);
      setShowPrintConfirm(false);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handleConfirmPrint = async () => {
    setShowPrintConfirm(false);
    setIsPreparingPrint(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 250));
      window.print();
    } catch {
      alert("Failed to open print dialog. Please try again.");
      setIsPreparingPrint(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-3 sm:p-6 md:p-10 flex justify-center text-black print:bg-white print:p-0 print:block">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { font-family: 'DM Sans', sans-serif; }

        @page {
          size: auto;
          margin: 12mm 10mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 11px;
          }

          body * { visibility: hidden; }

          .print-root,
          .print-root * { visibility: visible; }

          .print-root {
            position: relative !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .print-hide { display: none !important; }

          * { page-break-inside: avoid !important; break-inside: avoid !important; }
          
          .print-root { page-break-after: avoid !important; break-after: avoid !important; }
        }
      `}</style>

      <LoadingOverlay
        open={isLoading || isPreparingPrint}
        message={isPreparingPrint ? "Opening print dialog..." : "Loading notice..."}
      />

      <Modal
        open={showPrintConfirm}
        title="Print / Save as PDF"
        onClose={() => !isPreparingPrint && setShowPrintConfirm(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowPrintConfirm(false)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPrint}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition"
            >
              Continue
            </button>
          </>
        }
      >
        <p>
          Your browser's print dialog will open. Choose{" "}
          <strong className="text-gray-900">Print</strong> or{" "}
          <strong className="text-gray-900">Save as PDF</strong> from there.
        </p>
        <p className="mt-2 text-xs text-gray-400">The form will be saved as a single page without breaks.</p>
      </Modal>

      <div className="w-full max-w-3xl print:max-w-none print:w-full">

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2 print-hide">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <button
            type="button"
            onClick={() => setShowPrintConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" /></svg>
            Print / Save PDF
          </button>
        </div>

        {/* Main Card */}
        <div className="print-root bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:rounded-none print:border-none">

          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 print:hidden" />

          <div className="p-5 sm:p-8 print:p-4">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 print:flex-row print:gap-3 print:mb-4">
              <div className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 print:w-16 print:h-16 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden print:rounded-xl print:border-gray-200">
                  <Image src="/vercel.svg" alt="City Logo" width={80} height={80} className="object-contain p-2" priority />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left print:text-left">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest print:text-[9px]">Republic of the Philippines</p>
                <p className="text-sm font-semibold text-gray-700 print:text-[11px]">City Government of San Pablo</p>
                <p className="text-xs text-gray-500 print:text-[10px]">City Hall Compound, San Pablo City 4000</p>
                <p className="text-[11px] text-gray-400 print:text-[9px]">📞 (049) 503-3481 &nbsp;✉ bplospc@gmail.com</p>
                <h2 className="mt-2 text-base sm:text-lg font-extrabold text-emerald-800 tracking-tight print:text-sm">
                  BUSINESS PERMITS AND LICENSING OFFICE
                </h2>
              </div>
              {/* Notice No badge */}
              <div className="shrink-0 text-center print:text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 print:text-[8px]">Notice No.</p>
                <div className="font-mono text-base font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 print:text-xs print:px-3 print:py-1.5 print:bg-white print:border-gray-300 print:text-gray-800">
                  {initialData?.notice_no || "—"}
                </div>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 print:text-[8px]">APPREHENSION NOTICE</p>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5 print:mb-3" />

            {/* ── SECTION 1: Business Info ── */}
            <div className="mb-5 print:mb-3">
              <div className="flex items-center gap-2 mb-3 print:mb-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center print:hidden">
                  <span className="text-[10px]">🏢</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 print:text-[9px]">Business Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:gap-2 print:grid-cols-3">
                <div className="sm:col-span-1">
                  <FieldLabel icon="📋">Type</FieldLabel>
                  <select
                    value={initialData?.type ?? ""}
                    disabled
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 print:bg-white print:border-gray-300 print:text-xs print:py-1"
                  >
                    <option value="">Select</option>
                    <option value="SINGLE PROPRIETORSHIP">Single Proprietorship</option>
                    <option value="CORPORATION">Corporation</option>
                    <option value="PARTNERSHIP">Partnership</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel icon="📅">Date</FieldLabel>
                  <ReadOnlyInput value={initialData?.date} type="date" />
                </div>
                <div className="sm:col-span-1">
                  <FieldLabel icon="👤">Business / Taxpayer Name</FieldLabel>
                  <ReadOnlyInput value={initialData?.business_name} placeholder="Business name" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 print:gap-2 print:mt-2 print:grid-cols-2">
                <div>
                  <FieldLabel icon="📍">Business Address</FieldLabel>
                  <ReadOnlyInput value={initialData?.address} placeholder="Full address" />
                </div>
                <div>
                  <FieldLabel icon="🏷️">Nature of Business</FieldLabel>
                  <ReadOnlyInput value={initialData?.nature_of_business} placeholder="e.g. Retail, Services" />
                </div>
              </div>
            </div>

            {/* ── NOTICE BANNER ── */}
            <div className="flex gap-3 items-start bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-5 print:bg-white print:border-gray-300 print:p-3 print:mb-3">
              <div className="shrink-0 text-emerald-600 print:hidden">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed print:text-[9px]">
                Please be informed that inspection was conducted at your establishment by the undersigned Inspector of this office and found the following violations/findings mentioned under The Revised Revenue Code of San Pablo.
              </p>
            </div>

            {/* ── SECTION 2: Violations ── */}
            <InfoCard className="mb-5 print:mb-3">
              <div className="flex items-center gap-2 mb-3 print:mb-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center print:hidden">
                  <span className="text-[10px]">⚠️</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-red-600 print:text-[9px]">Violations / Findings</span>
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 mb-3 print:text-xs print:mb-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors ${initialData?.violation ? "bg-emerald-600 border-emerald-600" : "bg-white border-gray-300"} print:w-3 print:h-3`}>
                  {initialData?.violation && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                NO PERMIT — Revised Revenue Code of San Pablo
              </label>

              <div>
                <FieldLabel icon="📝">Other Violations</FieldLabel>
                <ReadOnlyTextArea value={initialData?.otherViolation} placeholder="List additional violations here..." rows={3} />
              </div>
            </InfoCard>

            {/* ── SECTION 3: Property / Rental ── */}
            <InfoCard className="mb-5 print:mb-3">
              <div className="flex items-center gap-2 mb-3 print:mb-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center print:hidden">
                  <span className="text-[10px]">🏠</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 print:text-[9px]">Property Information</span>
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 mb-3 print:text-xs print:mb-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 ${initialData?.rented ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"} print:w-3 print:h-3`}>
                  {initialData?.rented && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                Rented Property
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-2 print:grid-cols-2">
                <div>
                  <FieldLabel icon="👤">Name of Owner</FieldLabel>
                  <ReadOnlyInput value={initialData?.owner} placeholder="Owner's full name" />
                </div>
                <div>
                  <FieldLabel icon="💰">Monthly Rent (₱)</FieldLabel>
                  <ReadOnlyInput value={initialData?.rent} placeholder="0.00" />
                </div>
                <div>
                  <FieldLabel icon="📍">Owner's Address</FieldLabel>
                  <ReadOnlyInput value={initialData?.ownerAddress} placeholder="Full address" />
                </div>
                <div>
                  <FieldLabel icon="📞">Contact Number</FieldLabel>
                  <ReadOnlyInput value={initialData?.contact} placeholder="+63 XXX XXX XXXX" />
                </div>
              </div>
            </InfoCard>

            {/* ── DIRECTIVE BANNER ── */}
            <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 print:bg-white print:border-gray-300 print:p-3 print:mb-3">
              <div className="shrink-0 text-amber-500 print:hidden">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-1 print:text-[9px]">📌 Directive</p>
                <p className="text-xs text-amber-900 leading-relaxed print:text-[9px]">
                  The business establishment owner is directed to personally appear before the Office of the City Mayor, Business Permits and Licensing Division within <strong>three (3) working days</strong> from the receipt of this notice and to show cause why no cease-and-desist order should be issued against your establishment.
                </p>
              </div>
            </div>

            {/* ── SECTION 4: Signatories ── */}
            <div className="mb-5 print:mb-3">
              <div className="flex items-center gap-2 mb-3 print:mb-2">
                <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center print:hidden">
                  <span className="text-[10px]">✍️</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-600 print:text-[9px]">Signatories</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
                <SignatureBox
                  label="Inspected By"
                  icon="🔍"
                  name={initialData?.inspectedBy}
                  signature={initialData?.signatures?.inspectedBy}
                />

                <div className="rounded-xl border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[9px] print:mb-2">
                    <span className="print:hidden">📬</span>
                    Received By
                  </p>
                  <ReadOnlyInput value={initialData?.receivedBy} placeholder="Full Name" className="mb-3 print:mb-2" />
                  <div className="h-24 rounded-lg border border-dashed border-gray-200 bg-white flex items-center justify-center overflow-hidden print:h-16 print:border-gray-300">
                    {initialData?.signatures?.receivedBy ? (
                      <img src={getSignatureSrc(initialData.signatures.receivedBy)} alt="Received By Signature" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-300 italic">No signature</span>
                    )}
                  </div>
                  <div className="mt-3 print:mt-2">
                    <FieldLabel icon="🕐">Date & Time Received</FieldLabel>
                    <ReadOnlyInput type="datetime-local" value={initialData?.receivedAt} />
                  </div>
                </div>

                {/* Noted By — full width */}
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300 print:col-span-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[9px] print:mb-2">
                    <span className="print:hidden">🗂️</span>
                    Noted By
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3 print:grid-cols-2">
                    <div>
                      <ReadOnlyInput value={initialData?.notedBy} placeholder="Full Name" />
                    </div>
                    <div className="h-24 rounded-lg border border-dashed border-gray-200 bg-white flex items-center justify-center overflow-hidden print:h-16 print:border-gray-300">
                      {initialData?.signatures?.notedBy ? (
                        <img src={getSignatureSrc(initialData.signatures.notedBy)} alt="Noted By Signature" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-gray-300 italic">No signature</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Action Taken ── */}
            <InfoCard>
              <div className="flex items-center gap-2 mb-3 print:mb-2">
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center print:hidden">
                  <span className="text-[10px]">✅</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal-600 print:text-[9px]">Action Taken</span>
              </div>
              <ReadOnlyTextArea value={initialData?.actionTaken} placeholder="Describe the action taken..." rows={4} />
              <p className="mt-2 text-[10px] text-gray-400 font-mono print:text-[8px]">QFM-BPL-009 Rev 0 2022.02.18</p>
            </InfoCard>

          </div>

          {/* Bottom bar */}
          <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 print:hidden" />
        </div>
      </div>
    </div>
  );
}
