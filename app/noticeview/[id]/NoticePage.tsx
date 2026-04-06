"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Building2,
  Calendar,
  User,
  MapPin,
  Tag,
  AlertTriangle,
  FileText,
  Home,
  DollarSign,
  Phone,
  Search,
  Mail,
  FileCheck,
  CheckSquare,
  Square,
  Clock,
  ChevronRight,
  Info,
  BookOpen,
  Stamp,
  ClipboardCheck,
  X,
} from "lucide-react";

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
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
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
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm leading-6 text-gray-600">{children}</div>
        <div className="mt-5 flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

function LoadingOverlay({
  open,
  message = "Preparing document...",
}: {
  open: boolean;
  message?: string;
}) {
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

function SectionHeader({
  icon: Icon,
  label,
  color = "emerald",
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-700 border-emerald-700 bg-emerald-50",
    red: "text-red-700 border-red-700 bg-red-50",
    blue: "text-blue-700 border-blue-700 bg-blue-50",
    violet: "text-violet-700 border-violet-700 bg-violet-50",
    teal: "text-teal-700 border-teal-700 bg-teal-50",
  };
  const cls = colorMap[color] ?? colorMap.emerald;
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${cls.split(" ")[2] ? "" : ""} print:mb-2`}>
      <div className={`w-6 h-6 rounded flex items-center justify-center ${cls.split(" ").slice(2).join(" ")} print:hidden`}>
        <Icon className={`w-3.5 h-3.5 ${cls.split(" ")[0]}`} />
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-widest ${cls.split(" ")[0]} print:text-[9px]`}>
        {label}
      </span>
    </div>
  );
}

function FieldLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5 print:text-[8px]">
      <Icon className="w-3 h-3 text-gray-400 print:hidden" />
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
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-300 focus:outline-none print:text-xs print:py-1 print:px-2"
      />
    </div>
  );
}

function ReadOnlyTextArea({
  value,
  placeholder,
  rows = 3,
}: {
  value?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value ?? ""}
      readOnly
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-300 resize-none print:text-xs print:py-1 print:px-2"
    />
  );
}

function InfoCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded border border-gray-200 bg-gray-50/40 p-4 print:bg-white print:border-gray-300 print:p-3 ${className}`}
    >
      {children}
    </div>
  );
}

function CheckField({
  checked,
  label,
  color = "emerald",
}: {
  checked?: boolean;
  label: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-700 border-emerald-700",
    blue: "bg-blue-700 border-blue-700",
  };
  const cls = colorMap[color] ?? colorMap.emerald;
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 mb-3 print:text-xs print:mb-2">
      <div
        className={`w-4 h-4 rounded-sm flex items-center justify-center border-2 transition-colors ${
          checked ? cls : "bg-white border-gray-400"
        } print:w-3 print:h-3`}
      >
        {checked ? (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : null}
      </div>
      {label}
    </label>
  );
}

function SignatureBox({
  label,
  icon: Icon,
  name,
  signature,
}: {
  label: string;
  icon: React.ElementType;
  name?: string;
  signature?: string;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[8px] print:mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-400 print:hidden" />
        {label}
      </p>
      <ReadOnlyInput value={name} placeholder="Full Name" className="mb-3 print:mb-2" />
      <div className="h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden print:h-16">
        {signature ? (
          <img
            src={getSignatureSrc(signature)}
            alt={`${label} Signature`}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-xs text-gray-300 italic">Signature over printed name</span>
        )}
      </div>
    </div>
  );
}

export default function NoticePage({ initialData }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6 md:p-10 flex justify-center text-black print:bg-white print:p-0 print:block">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

        *, *::before, *::after {
          font-family: 'Source Sans 3', sans-serif;
        }

        @page {
          size: A4;
          margin: 14mm 12mm;
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
          .print-root, .print-root * { visibility: visible; }

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
        message={
          isPreparingPrint ? "Opening print dialog..." : "Loading notice..."
        }
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
              className="rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPrint}
              className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition"
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
        <p className="mt-2 text-xs text-gray-400">
          The form will be formatted to A4 paper size.
        </p>
      </Modal>

      <div className="w-full max-w-3xl print:max-w-none print:w-full">

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center gap-2 print-hide">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={() => setShowPrintConfirm(true)}
            className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Main Card */}
        <div className="print-root bg-white shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none">

          {/* Header band */}
          <div className="bg-emerald-800 h-2 print:h-1.5" />

          <div className="p-6 sm:p-8 print:p-5">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5 print:flex-row print:gap-4 print:mb-4 pb-5 border-b-2 border-gray-200 print:pb-3">
              {/* Logo */}
              <div className="shrink-0">
                <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] print:w-16 print:h-16 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src="/vercel.svg"
                    alt="City Seal"
                    width={80}
                    height={80}
                    className="object-contain p-2"
                    priority
                  />
                </div>
              </div>

              {/* Title block */}
              <div className="flex-1 text-center sm:text-left print:text-left">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.18em] print:text-[8px]">
                  Republic of the Philippines
                </p>
                <p className="text-[11px] text-gray-600 print:text-[10px]">
                  Province of Laguna
                </p>
                <p className="text-base font-bold text-gray-900 leading-tight mt-0.5 print:text-sm" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  City Government of San Pablo
                </p>
                <p className="text-xs text-gray-500 print:text-[10px]">
                  City Hall Compound, San Pablo City, Laguna 4000
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 print:text-[9px]">
                    <Phone className="w-3 h-3 print:hidden" />
                    (049) 503-3481
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 print:text-[9px]">
                    <Mail className="w-3 h-3 print:hidden" />
                    bplospc@gmail.com
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-emerald-800 print:text-[10px]">
                  Business Permits and Licensing Office
                </p>
              </div>

              {/* Notice badge */}
              <div className="shrink-0 text-center print:text-right">
                <div className="border-2 border-emerald-800 rounded p-3 print:p-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 print:text-[7px]">
                    Notice No.
                  </p>
                  <p className="font-mono text-lg font-bold text-emerald-900 leading-none print:text-sm">
                    {initialData?.notice_no || "___________"}
                  </p>
                </div>
                <div className="mt-2 bg-emerald-800 text-white rounded px-3 py-1.5 print:py-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider print:text-[8px]">
                    Apprehension Notice
                  </p>
                </div>
              </div>
            </div>

            {/* ── SECTION 1: Business Information ── */}
            <div className="mb-5 print:mb-3">
              <SectionHeader icon={Building2} label="Business Information" color="emerald" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:gap-2 print:grid-cols-3">
                <div>
                  <FieldLabel icon={Tag}>Type of Business</FieldLabel>
                  <select
                    value={initialData?.type ?? ""}
                    disabled
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white print:text-xs print:py-1"
                  >
                    <option value="">Select</option>
                    <option value="SINGLE PROPRIETORSHIP">Single Proprietorship</option>
                    <option value="CORPORATION">Corporation</option>
                    <option value="PARTNERSHIP">Partnership</option>
                  </select>
                </div>
                <div>
                  <FieldLabel icon={Calendar}>Date of Inspection</FieldLabel>
                  <ReadOnlyInput value={initialData?.date} type="date" />
                </div>
                <div>
                  <FieldLabel icon={User}>Business / Taxpayer Name</FieldLabel>
                  <ReadOnlyInput value={initialData?.business_name} placeholder="Business name" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 print:gap-2 print:mt-2 print:grid-cols-2">
                <div>
                  <FieldLabel icon={MapPin}>Business Address</FieldLabel>
                  <ReadOnlyInput value={initialData?.address} placeholder="Full address" />
                </div>
                <div>
                  <FieldLabel icon={BookOpen}>Nature of Business</FieldLabel>
                  <ReadOnlyInput value={initialData?.nature_of_business} placeholder="e.g. Retail, Services" />
                </div>
              </div>
            </div>

            {/* ── NOTICE BANNER ── */}
            <div className="border border-gray-300 rounded bg-gray-50 p-4 mb-5 print:p-3 print:mb-3 print:bg-white">
              <p className="text-xs text-gray-700 leading-relaxed print:text-[9px]">
                <strong>NOTICE:</strong> Please be informed that inspection was conducted at your establishment by the undersigned Inspector of this office and found the following violations/findings mentioned under The Revised Revenue Code of San Pablo.
              </p>
            </div>

            {/* ── SECTION 2: Violations ── */}
            <InfoCard className="mb-5 print:mb-3">
              <SectionHeader icon={AlertTriangle} label="Violations / Findings" color="red" />

              <CheckField
                checked={initialData?.violation}
                label="NO PERMIT — Revised Revenue Code of San Pablo"
                color="emerald"
              />

              <div>
                <FieldLabel icon={FileText}>Other Violations / Findings</FieldLabel>
                <ReadOnlyTextArea
                  value={initialData?.otherViolation}
                  placeholder="List additional violations here..."
                  rows={3}
                />
              </div>
            </InfoCard>

            {/* ── SECTION 3: Property / Rental ── */}
            <InfoCard className="mb-5 print:mb-3">
              <SectionHeader icon={Home} label="Property Information" color="blue" />

              <CheckField
                checked={initialData?.rented}
                label="Rented Property"
                color="blue"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:gap-2 print:grid-cols-2">
                <div>
                  <FieldLabel icon={User}>Name of Owner / Lessor</FieldLabel>
                  <ReadOnlyInput value={initialData?.owner} placeholder="Owner's full name" />
                </div>
                <div>
                  <FieldLabel icon={DollarSign}>Monthly Rental (₱)</FieldLabel>
                  <ReadOnlyInput value={initialData?.rent} placeholder="0.00" />
                </div>
                <div>
                  <FieldLabel icon={MapPin}>Owner's Address</FieldLabel>
                  <ReadOnlyInput value={initialData?.ownerAddress} placeholder="Full address" />
                </div>
                <div>
                  <FieldLabel icon={Phone}>Contact Number</FieldLabel>
                  <ReadOnlyInput value={initialData?.contact} placeholder="+63 XXX XXX XXXX" />
                </div>
              </div>
            </InfoCard>

            {/* ── DIRECTIVE BANNER ── */}
            <div className="border-l-4 border-red-600 bg-red-50 rounded-r p-4 mb-5 print:p-3 print:mb-3 print:bg-white print:border-gray-700">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1.5 print:text-[8px] print:text-gray-800">
                Directive
              </p>
              <p className="text-xs text-red-900 leading-relaxed print:text-[9px] print:text-gray-800">
                The business establishment owner is hereby directed to personally appear before the Office of the City Mayor, Business Permits and Licensing Division within{" "}
                <strong>three (3) working days</strong> from receipt of this notice and to show cause why no cease-and-desist order should be issued against your establishment.
              </p>
            </div>

            {/* ── SECTION 4: Signatories ── */}
            <div className="mb-5 print:mb-3">
              <SectionHeader icon={Stamp} label="Signatories" color="violet" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3 print:grid-cols-2">
                <SignatureBox
                  label="Inspected By"
                  icon={Search}
                  name={initialData?.inspectedBy}
                  signature={initialData?.signatures?.inspectedBy}
                />

                {/* Received By */}
                <div className="rounded border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[8px] print:mb-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                    Received By
                  </p>
                  <ReadOnlyInput
                    value={initialData?.receivedBy}
                    placeholder="Full Name"
                    className="mb-3 print:mb-2"
                  />
                  <div className="h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden print:h-16">
                    {initialData?.signatures?.receivedBy ? (
                      <img
                        src={getSignatureSrc(initialData.signatures.receivedBy)}
                        alt="Received By Signature"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-300 italic">
                        Signature over printed name
                      </span>
                    )}
                  </div>
                  <div className="mt-3 print:mt-2">
                    <FieldLabel icon={Clock}>Date &amp; Time Received</FieldLabel>
                    <ReadOnlyInput
                      type="datetime-local"
                      value={initialData?.receivedAt}
                    />
                  </div>
                </div>

                {/* Noted By — full width */}
                <div className="sm:col-span-2 rounded border border-gray-200 bg-white p-4 print:p-2.5 print:border-gray-300 print:col-span-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 print:text-[8px] print:mb-2">
                    <FileCheck className="w-3.5 h-3.5 text-gray-400 print:hidden" />
                    Noted By
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3 print:grid-cols-2">
                    <div>
                      <ReadOnlyInput
                        value={initialData?.notedBy}
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden print:h-16">
                      {initialData?.signatures?.notedBy ? (
                        <img
                          src={getSignatureSrc(initialData.signatures.notedBy)}
                          alt="Noted By Signature"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-300 italic">
                          Signature over printed name
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Action Taken ── */}
            <InfoCard>
              <SectionHeader icon={ClipboardCheck} label="Action Taken" color="teal" />
              <ReadOnlyTextArea
                value={initialData?.actionTaken}
                placeholder="Describe the action taken..."
                rows={4}
              />
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between print:mt-2 print:pt-2">
                <p className="text-[9px] text-gray-400 font-mono print:text-[7px]">
                  QFM-BPL-009 Rev 0 2022.02.18
                </p>
                <p className="text-[9px] text-gray-400 print:text-[7px]">
                  Business Permits and Licensing Office — City Government of San Pablo
                </p>
              </div>
            </InfoCard>

          </div>

          {/* Footer band */}
          <div className="bg-emerald-800 h-2 print:h-1.5" />
        </div>
      </div>
    </div>
  );
}
