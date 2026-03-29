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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 print:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id="modal-title" className="text-lg font-bold text-gray-900">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="text-sm leading-6 text-gray-600">{children}</div>

        <div className="mt-6 flex justify-end gap-3">{footer}</div>
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
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-2xl border border-gray-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <label className="block font-semibold text-gray-700 mb-2">{children}</label>;
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
    <input
      type={type}
      value={value ?? ""}
      readOnly
      placeholder={placeholder}
      className={`border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-50 print:bg-white print:shadow-none ${className}`}
    />
  );
}

function ReadOnlyTextArea({
  value,
  className = "",
  placeholder,
}: {
  value?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value ?? ""}
      readOnly
      placeholder={placeholder}
      className={`border border-gray-300 w-full p-3 rounded-xl shadow-sm bg-gray-50 print:bg-white print:shadow-none ${className}`}
    />
  );
}

function SignatureBox({
  label,
  name,
  signature,
}: {
  label: string;
  name?: string;
  signature?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm print:shadow-none">
      <p className="font-semibold text-gray-700 mb-3">{label}</p>

      <ReadOnlyInput value={name} placeholder="Name" className="mb-3" />

      <div className="border rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center print:border-gray-300">
        {signature ? (
          <img
            src={getSignatureSrc(signature)}
            alt={`${label} Signature`}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-gray-400">No Signature</span>
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

  const handleOpenPrintConfirm = () => {
    setShowPrintConfirm(true);
  };

  const handleClosePrintConfirm = () => {
    if (!isPreparingPrint) {
      setShowPrintConfirm(false);
    }
  };

  const handleConfirmPrint = async () => {
    setShowPrintConfirm(false);
    setIsPreparingPrint(true);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
      window.print();
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to open print dialog. Please try again.");
      setIsPreparingPrint(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-slate-100 via-gray-100 to-slate-200 p-3 sm:p-4 md:p-8 flex justify-center text-black print:bg-white print:p-0 print:overflow-visible">
      <style jsx global>{`
        @page {
          size: letter portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body {
            padding: 18px !important;
            box-sizing: border-box !important;
          }

          body * {
            visibility: hidden;
          }

          .print-card,
          .print-card * {
            visibility: visible;
          }

          .print-card {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 28px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
            overflow: visible !important;
            background: #fff !important;
          }

          .print-hide {
            display: none !important;
          }

          input,
          textarea,
          select {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .pdf-header-section {
            break-inside: avoid;
            page-break-inside: avoid;
            overflow: visible !important;
          }

          .pdf-header-logo {
            position: static !important;
          }

          .pdf-header-text {
            overflow: visible !important;
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
          }

          .print-card input,
          .print-card textarea,
          .print-card select {
            background: #fff !important;
          }
        }
      `}</style>

      <LoadingOverlay
        open={isLoading || isPreparingPrint}
        message={isPreparingPrint ? "Opening print dialog..." : "Loading..."}
      />

      <Modal
        open={showPrintConfirm}
        title="Print / Save PDF"
        onClose={handleClosePrintConfirm}
        footer={
          <>
            <button
              type="button"
              onClick={handleClosePrintConfirm}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPrint}
              className="rounded-xl border border-green-700 bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Continue
            </button>
          </>
        }
      >
        <p>
          This will open the browser print dialog. From there, choose{" "}
          <span className="font-semibold text-gray-900">Print</span> or{" "}
          <span className="font-semibold text-gray-900">Save to PDF</span>.
        </p>
      </Modal>

      <div className="w-full max-w-5xl mx-auto print:w-full print:max-w-none">
        <div className="mb-4 flex flex-wrap gap-3 justify-start print-hide">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.99] print:hidden"
          >
            <span className="text-lg leading-none">←</span>
            Back
          </button>

          <button
            type="button"
            onClick={handleOpenPrintConfirm}
            className="inline-flex items-center gap-2 rounded-xl border border-green-700 bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-800 active:scale-[0.99] print:hidden"
          >
            Print / Save PDF
          </button>
        </div>

        <div className="print-card relative bg-white w-full mx-auto p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden print:shadow-none print:rounded-none print:border-none print:max-w-none print:w-full">
          <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-green-700 via-emerald-500 to-green-700 print:hidden" />

          <div className="relative mb-8 pb-6 border-b pdf-header-section">
            <div className="flex flex-col items-center gap-4 md:block">
              <div className="relative flex justify-center md:block md:absolute md:left-6 md:top-6 pdf-header-logo">
                <Image
                  src="/vercel.svg"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain"
                  priority
                />
              </div>

              <div className="text-center w-full px-2 sm:px-6 md:px-32 md:pt-0 pdf-header-text">
                <p className="font-semibold text-gray-700 text-sm sm:text-base">
                  Republic of the Philippines
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  City Government of San Pablo
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  City Hall Compound, San Pablo City 4000
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Tel No. (049) 503-3481 / Email add. bplospc@gmail.com
                </p>

                <h2 className="font-bold text-lg sm:text-xl mt-3 tracking-wide text-green-900">
                  BUSINESS PERMITS AND LICENSING OFFICE
                </h2>

                <div className="mt-5 flex flex-col items-center gap-2">
                  <label className="font-semibold text-gray-700 text-sm sm:text-base">
                    APPREHENSION NOTICE NO:
                  </label>
                  <ReadOnlyInput
                    value={initialData?.notice_no}
                    className="max-w-sm text-center font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <SectionTitle>Type:</SectionTitle>
            <select
              value={initialData?.type ?? ""}
              disabled
              className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-100 print:bg-white print:shadow-none"
            >
              <option value="">Select</option>
              <option value="SINGLE PROPRIETORSHIP">SINGLE PROPRIETORSHIP</option>
              <option value="CORPORATION">CORPORATION</option>
              <option value="PARTNERSHIP">PARTNERSHIP</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <SectionTitle>DATE:</SectionTitle>
              <ReadOnlyInput value={initialData?.date} type="date" />
            </div>

            <div>
              <SectionTitle>BUSINESS AND TAX PAYER NAME:</SectionTitle>
              <ReadOnlyInput value={initialData?.business_name} className="bg-gray-100" />
            </div>
          </div>

          <div className="mb-5">
            <SectionTitle>BUSINESS ADDRESS:</SectionTitle>
            <ReadOnlyInput value={initialData?.address} />
          </div>

          <div className="mb-6">
            <SectionTitle>NATURE OF BUSINESS:</SectionTitle>
            <ReadOnlyInput value={initialData?.nature_of_business} />
          </div>

          <div className="bg-green-50 border-l-4 border-green-700 p-5 rounded-2xl mb-5 shadow-sm print:bg-white print:shadow-none">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              Please be informed that inspection was conducted at your establishment by the
              undersigned Inspector of this office and found out the following
              violations/findings mentioned under The Revised Revenue Code of San Pablo.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm print:bg-white print:shadow-none">
            <label className="flex items-center gap-3 font-medium text-gray-700">
              <input
                type="checkbox"
                checked={!!initialData?.violation}
                disabled
                className="h-4 w-4 accent-green-700"
              />
              NO PERMIT - Revised Revenue Code of San Pablo
            </label>

            <div className="mt-4">
              <SectionTitle>OTHER VIOLATIONS:</SectionTitle>
              <ReadOnlyTextArea
                value={initialData?.otherViolation}
                className="min-h-[110px]"
                placeholder="Enter other violations..."
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm print:bg-white print:shadow-none">
            <label className="flex items-center gap-3 mb-4 font-medium text-gray-700">
              <input
                type="checkbox"
                checked={!!initialData?.rented}
                disabled
                className="h-4 w-4 accent-green-700"
              />
              RENTED
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyInput value={initialData?.owner} placeholder="NAME OF OWNER" />
              <ReadOnlyInput value={initialData?.rent} placeholder="Cost of Rent P" />
              <ReadOnlyInput value={initialData?.ownerAddress} placeholder="OWNER'S ADDRESS" />
              <ReadOnlyInput value={initialData?.contact} placeholder="Contact No." />
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-2xl mb-6 shadow-sm print:bg-white print:shadow-none">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              DIRECTIVE: The business establishment owner is directed to personally appear
              before the Office of the City Mayor, Business Permits and Licensing Division
              within three (3) working days from the receipt of this notice and to show cause
              why no cease-and-desist order should be issued against your establishment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SignatureBox
              label="INSPECTED BY:"
              name={initialData?.inspectedBy}
              signature={initialData?.signatures?.inspectedBy}
            />

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm print:shadow-none">
              <p className="font-semibold text-gray-700 mb-3">RECEIVED BY:</p>
              <ReadOnlyInput value={initialData?.receivedBy} placeholder="Name" className="mb-3" />

              <div className="border rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center print:border-gray-300">
                {initialData?.signatures?.receivedBy ? (
                  <img
                    src={getSignatureSrc(initialData.signatures.receivedBy)}
                    alt="Received By Signature"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No Signature</span>
                )}
              </div>

              <ReadOnlyInput
                type="datetime-local"
                value={initialData?.receivedAt}
                className="mt-3"
              />
              <p className="text-xs text-gray-500 mt-2">Current date and time only.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2 print:shadow-none">
              <p className="font-semibold text-gray-700 mb-3">NOTED BY:</p>
              <ReadOnlyInput value={initialData?.notedBy} placeholder="Name" className="mb-3" />

              <div className="border rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center print:border-gray-300">
                {initialData?.signatures?.notedBy ? (
                  <img
                    src={getSignatureSrc(initialData.signatures.notedBy)}
                    alt="Noted By Signature"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No Signature</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm print:bg-white print:shadow-none">
            <SectionTitle>ACTION TAKEN:</SectionTitle>
            <ReadOnlyTextArea
              value={initialData?.actionTaken}
              className="min-h-[120px]"
              placeholder="Enter action taken..."
            />
            <p className="text-xs text-gray-500 mt-3">QFM-BPL-009 Rev 0 2022.02.18</p>
          </div>
        </div>
      </div>
    </div>
  );
}