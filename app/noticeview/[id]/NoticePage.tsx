"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

export default function NoticePage({ initialData }: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      const element = cardRef.current;
      if (!element) return;

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (doc) => {
          const all = doc.querySelectorAll("*");

          all.forEach((el: any) => {
            const style = doc.defaultView?.getComputedStyle(el);

            if (style && style.backgroundImage && style.backgroundImage !== "none") {
              el.style.backgroundImage = "none";
            }

            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
            el.style.borderColor = "#000000";
            el.style.boxShadow = "none";
            el.style.textShadow = "none";

            el.style.wordBreak = "break-word";
            el.style.overflowWrap = "break-word";
            el.style.whiteSpace = "normal";
          });

          const clonedCard = doc.querySelector(".print-card") as HTMLElement | null;
          if (clonedCard) {
            clonedCard.style.overflow = "visible";
            clonedCard.style.maxWidth = "none";
            clonedCard.style.width = "100%";
            clonedCard.style.height = "auto";
          }

          const fields = doc.querySelectorAll("input, textarea, select");

          fields.forEach((field: any) => {
            const type = (field.getAttribute("type") || "").toLowerCase();

            if (type === "checkbox" || type === "radio") {
              return;
            }

            let value = "";

            if (field.tagName === "SELECT") {
              value = field.options?.[field.selectedIndex]?.text || "";
            } else {
              value = field.value ?? "";
            }

            const div = doc.createElement("div");
            div.innerText = value || "";

            const computed = doc.defaultView?.getComputedStyle(field);

            div.style.border = computed?.border || "1px solid #000";
            div.style.padding = computed?.padding || "12px";
            div.style.borderRadius = computed?.borderRadius || "12px";
            div.style.fontSize = computed?.fontSize || "14px";
            div.style.fontFamily = computed?.fontFamily || "inherit";
            div.style.width = computed?.width || "100%";
            div.style.boxSizing = "border-box";
            div.style.backgroundColor = "#ffffff";
            div.style.color = "#000000";
            div.style.whiteSpace = "normal";
            div.style.wordBreak = "break-word";
            div.style.overflowWrap = "break-word";
            div.style.minHeight = computed?.minHeight || "auto";
            div.style.display = "block";

            field.parentNode?.replaceChild(div, field);
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = pageWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let remainingHeight = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, scaledHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, scaledHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`Apprehension_Notice_${initialData?.notice_no || "document"}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-slate-100 via-gray-100 to-slate-200 p-3 sm:p-4 md:p-8 flex justify-center text-black print:bg-white print:p-0">
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
            width: 100%;
            height: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .print-card,
          .print-card * {
            visibility: visible;
          }

          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-2xl border border-gray-200">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-700" />
            <p className="text-sm font-medium text-gray-700">Loading...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto">
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
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-green-700 bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-800 active:scale-[0.99] print:hidden"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.99] print:hidden"
          >
            Print
          </button>
        </div>

        <div
          ref={cardRef}
          className="print-card relative bg-white w-full mx-auto p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden print:shadow-none print:rounded-none print:border-none print:max-w-none print:w-full"
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-green-700 via-emerald-500 to-green-700 print:hidden" />

          <div className="relative mb-8 pb-6 border-b">
            <div className="flex flex-col items-center gap-4 md:block">
              <div className="relative flex justify-center md:block md:absolute md:left-6 md:top-6">
                <Image
                  src="/vercel.svg"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain"
                  priority
                />
              </div>

              <div className="text-center w-full px-2 sm:px-6 md:px-32 md:pt-0">
                <p className="font-semibold text-gray-700 text-sm sm:text-base">
                  Republic of the Philippines
                </p>
                <p className="text-gray-600 text-sm sm:text-base">City Government of San Pablo</p>
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
                  <input
                    value={initialData?.notice_no ?? ""}
                    readOnly
                    className="border border-gray-300 px-4 py-2 rounded-xl w-full max-w-sm text-center font-medium shadow-sm bg-gray-50 print:bg-white print:shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-2">Type:</label>
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
              <label className="block font-semibold text-gray-700 mb-2">DATE:</label>
              <input
                type="date"
                value={initialData?.date ?? ""}
                readOnly
                className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-50 print:bg-white print:shadow-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                BUSINESS AND TAX PAYER NAME:
              </label>
              <input
                value={initialData?.business_name ?? ""}
                readOnly
                className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-100 print:bg-white print:shadow-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-2">BUSINESS ADDRESS:</label>
            <input
              value={initialData?.address ?? ""}
              readOnly
              className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-50 print:bg-white print:shadow-none"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">NATURE OF BUSINESS:</label>
            <input
              value={initialData?.nature_of_business ?? ""}
              readOnly
              className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-50 print:bg-white print:shadow-none"
            />
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
              <label className="block font-semibold text-gray-700 mb-2">OTHER VIOLATIONS:</label>
              <textarea
                value={initialData?.otherViolation ?? ""}
                readOnly
                className="border border-gray-300 w-full p-3 rounded-xl min-h-27.5 shadow-sm bg-gray-50 print:bg-white print:shadow-none"
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
              <input
                value={initialData?.owner ?? ""}
                readOnly
                placeholder="NAME OF OWNER"
                className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm w-full bg-gray-50 print:bg-white print:shadow-none"
              />
              <input
                value={initialData?.rent ?? ""}
                readOnly
                placeholder="Cost of Rent P"
                className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm w-full bg-gray-50 print:bg-white print:shadow-none"
              />
              <input
                value={initialData?.ownerAddress ?? ""}
                readOnly
                placeholder="OWNER'S ADDRESS"
                className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm w-full bg-gray-50 print:bg-white print:shadow-none"
              />
              <input
                value={initialData?.contact ?? ""}
                readOnly
                placeholder="Contact No."
                className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm w-full bg-gray-50 print:bg-white print:shadow-none"
              />
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
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm print:shadow-none">
              <p className="font-semibold text-gray-700 mb-3">INSPECTED BY:</p>
              <input
                value={initialData?.inspectedBy ?? ""}
                readOnly
                className="border border-gray-300 w-full p-3 mb-3 rounded-xl shadow-sm bg-gray-50 print:bg-white print:shadow-none"
                placeholder="Name"
              />
              <div className="border rounded-xl overflow-hidden bg-white h-28 flex items-center justify-center print:border-gray-300">
                {initialData?.signatures?.inspectedBy ? (
                  <img
                    src={getSignatureSrc(initialData.signatures.inspectedBy)}
                    alt="Inspector Signature"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No Signature</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm print:shadow-none">
              <p className="font-semibold text-gray-700 mb-3">RECEIVED BY:</p>
              <input
                value={initialData?.receivedBy ?? ""}
                readOnly
                className="border border-gray-300 w-full p-3 mb-3 rounded-xl shadow-sm bg-gray-50 print:bg-white print:shadow-none"
                placeholder="Name"
              />
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
              <input
                type="datetime-local"
                value={initialData?.receivedAt ?? ""}
                readOnly
                className="border border-gray-300 w-full p-3 mt-3 rounded-xl shadow-sm bg-gray-50 print:bg-white print:shadow-none"
              />
              <p className="text-xs text-gray-500 mt-2">Current date and time only.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2 print:shadow-none">
              <p className="font-semibold text-gray-700 mb-3">NOTED BY:</p>
              <input
                value={initialData?.notedBy ?? ""}
                readOnly
                className="border border-gray-300 w-full p-3 mb-3 rounded-xl shadow-sm bg-gray-50 print:bg-white print:shadow-none"
                placeholder="Name"
              />
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
            <label className="block font-semibold text-gray-700 mb-2">ACTION TAKEN:</label>
            <textarea
              value={initialData?.actionTaken ?? ""}
              readOnly
              className="border border-gray-300 w-full p-3 rounded-xl min-h-30 shadow-sm bg-gray-50 print:bg-white print:shadow-none"
              placeholder="Enter action taken..."
            />
            <p className="text-xs text-gray-500 mt-3">QFM-BPL-009 Rev 0 2022.02.18</p>
          </div>
        </div>
      </div>
    </div>
  );
}