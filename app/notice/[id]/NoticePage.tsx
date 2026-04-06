"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import type { ChangeEvent, KeyboardEvent } from "react";

type SavedNotice = {
  id?: string;
  violation_id?: number | null;
  taxpayer?: string | null;
  address?: string | null;
  nature?: string | null;
  notice_no?: string | null;
  data?: any;
  signatures?: any;
  created_at?: string | null;
};

type Props = {
  initialData?: any;
  savedNotice?: SavedNotice | null;
};

type ModalType = "loading" | "success" | "error" | "info" | "warning";

// ── Icon Components ──────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconSpin = () => (
  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22V12h6v10" /><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" />
  </svg>
);

const IconMapPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.5 2 2 0 0 1 3.6 2.3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const IconPen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

// ── Modal Icon ────────────────────────────────────────────────────────────────

function ModalIcon({ type }: { type: ModalType }) {
  const base = "flex h-12 w-12 items-center justify-center rounded-full text-white flex-shrink-0";
  switch (type) {
    case "success": return <div className={`${base} bg-green-600`}><IconCheck /></div>;
    case "error":   return <div className={`${base} bg-red-600`}><IconX /></div>;
    case "warning": return <div className={`${base} bg-yellow-500`}><IconAlert /></div>;
    case "loading": return <div className={`${base} bg-green-700`}><IconSpin /></div>;
    default:        return <div className={`${base} bg-blue-600`}><IconInfo /></div>;
  }
}

// ── Field Label ───────────────────────────────────────────────────────────────

function FieldLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 font-semibold text-gray-700 mb-2 text-sm">
      <span className="text-green-700">{icon}</span>
      {children}
    </label>
  );
}

// ── View-only text display ────────────────────────────────────────────────────

function ViewField({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <div className="border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl w-full text-gray-700 min-h-[48px] text-sm">
      {value || <span className="text-gray-400 italic">{placeholder ?? "—"}</span>}
    </div>
  );
}

function ViewTextarea({ value, placeholder }: { value: string; placeholder?: string }) {
  return (
    <div className="border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl w-full text-gray-700 min-h-[110px] text-sm whitespace-pre-wrap">
      {value || <span className="text-gray-400 italic">{placeholder ?? "—"}</span>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NoticePage({ initialData, savedNotice }: Props) {
  const formRef = useRef<HTMLDivElement>(null);
  const sig1 = useRef<any>(null);
  const sig2 = useRef<any>(null);
  const sig3 = useRef<any>(null);

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const currentDateTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const savedFormData =
    savedNotice?.data ||
    initialData?.submitted_data ||
    initialData?.form_data ||
    initialData?.data ||
    initialData?.notice_data ||
    {};

  const isSigned = Boolean(savedNotice?.id || initialData?.signed);
  const violationId = initialData?.id;

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({ open: false, type: "info", title: "", message: "" });

  const [form, setForm] = useState({
    noticeNo: "",
    type: "",
    date: todayDate,
    taxpayer: "",
    address: "",
    nature: "",
    violation: false,
    otherViolation: "",
    rented: false,
    owner: "",
    ownerAddress: "",
    rent: "",
    contact: "",
    inspectedBy: "",
    receivedBy: "",
    notedBy: "",
    receivedAt: currentDateTime,
    actionTaken: "",
  });

  useEffect(() => {
    if (!initialData && !savedNotice) return;

    setForm((prev) => ({
      ...prev,
      taxpayer:
        savedNotice?.taxpayer ?? savedFormData?.taxpayer ?? initialData?.business_name ?? prev.taxpayer,
      address: savedNotice?.address ?? savedFormData?.address ?? initialData?.address ?? prev.address,
      nature: savedNotice?.nature ?? savedFormData?.nature ?? initialData?.nature_of_business ?? prev.nature,
      noticeNo:
        savedNotice?.notice_no ?? savedFormData?.noticeNo ?? savedFormData?.notice_no ?? initialData?.notice_no ?? prev.noticeNo,
      type: savedFormData?.type ?? prev.type,
      date: savedFormData?.date ?? prev.date,
      violation: savedFormData?.violation ?? prev.violation,
      otherViolation: savedFormData?.otherViolation ?? prev.otherViolation,
      rented: savedFormData?.rented ?? prev.rented,
      owner: savedFormData?.owner ?? prev.owner,
      ownerAddress: savedFormData?.ownerAddress ?? prev.ownerAddress,
      rent: savedFormData?.rent ?? prev.rent,
      contact: savedFormData?.contact ?? prev.contact,
      inspectedBy: savedFormData?.inspectedBy ?? prev.inspectedBy,
      receivedBy: savedFormData?.receivedBy ?? prev.receivedBy,
      notedBy: savedFormData?.notedBy ?? prev.notedBy,
      receivedAt: savedFormData?.receivedAt ?? prev.receivedAt,
      actionTaken: savedFormData?.actionTaken ?? prev.actionTaken,
    }));

    const loadSignature = (ref: any, dataUrl?: string) => {
      if (!ref?.current || !dataUrl) return;
      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas: HTMLCanvasElement = ref.current.getCanvas();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw centered, maintaining aspect ratio, no stretch
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
    };

    const savedSignatures = savedNotice?.signatures ?? savedFormData?.signatures ?? {};
    const t = setTimeout(() => {
      loadSignature(sig1, savedSignatures?.inspectedBy);
      loadSignature(sig2, savedSignatures?.receivedBy);
      loadSignature(sig3, savedSignatures?.notedBy);
    }, 250);

    return () => clearTimeout(t);
  }, [initialData, savedNotice]);

  useEffect(() => {
    if (isSigned) {
      setModal({
        open: true,
        type: "info",
        title: "View Mode",
        message: "This notice has already been submitted. You are viewing a read-only copy.",
      });
    }
  }, [isSigned]);

  const closeModal = () => {
    if (modal.type === "success") { window.location.reload(); return; }
    setModal((prev) => ({ ...prev, open: false }));
  };

  const openModal = (type: ModalType, title: string, message: string) => {
    setModal({ open: true, type, title, message });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isSigned) return;
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (name === "date" && value !== todayDate) {
      openModal("warning", "Invalid Date", "Please select today's date only.");
      return;
    }
    if (name === "receivedAt" && value > currentDateTime) {
      openModal("warning", "Invalid Date Time", "Please select current date and time only.");
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? target.checked : value }));
  };

  const preventManualInput = (e: KeyboardEvent<HTMLInputElement>) => { e.preventDefault(); };

  const handleSubmit = async () => {
    if (loading || isSigned) return;

    if (!form.taxpayer || !form.inspectedBy) {
      openModal("error", "Missing Required Fields", "Please fill in all required fields.");
      return;
    }
    if (!violationId) {
      openModal("error", "Missing ID", "No violation ID found!");
      return;
    }
    if (form.date !== todayDate) {
      openModal("warning", "Invalid Date", "Date must be today only.");
      return;
    }
    if (!form.receivedAt) {
      openModal("warning", "Missing Date Time", "Please select the current date and time.");
      return;
    }
    if (form.receivedAt > currentDateTime) {
      openModal("warning", "Invalid Date Time", "Please select current date and time only.");
      return;
    }
    if (!sig1.current || sig1.current.isEmpty()) {
      openModal("warning", "Signature Required", "Inspector signature is required before submitting.");
      return;
    }

    setLoading(true);

    const sig1Data = sig1.current?.getTrimmedCanvas().toDataURL();
    const sig2Data = sig2.current?.getTrimmedCanvas().toDataURL();
    const sig3Data = sig3.current?.getTrimmedCanvas().toDataURL();

    const payload = {
      ...form,
      initialDataId: violationId,
      signatures: {
        inspectedBy: sig1Data,
        receivedBy: sig2Data,
        notedBy: sig3Data,
      },
    };

    try {
      const res = await fetch("/api/save-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        openModal("success", "Submitted Successfully", "The apprehension notice has been submitted successfully.");
      } else {
        openModal("error", "Save Failed", data.error || "An error occurred while saving.");
      }
    } catch {
      openModal("error", "Network Error", "Something went wrong while submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input classes ───────────────────────────────────────────────────

  const inputCls = "border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm text-sm transition";
  const readonlyCls = "border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl w-full shadow-sm text-sm text-gray-600 cursor-default";

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 p-3 sm:p-4 md:p-8 flex justify-center text-black">
      <div
        ref={formRef}
        className="relative bg-white w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700" />

        {/* View-only banner */}
        {isSigned && (
          <div className="mt-2 mb-4 flex items-center gap-2.5 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800">
            <IconEye />
            <span>View-Only Mode — This notice has already been submitted and cannot be edited.</span>
          </div>
        )}

        {/* ── Header ── */}
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
              <p className="font-semibold text-gray-700 text-sm sm:text-base">Republic of the Philippines</p>
              <p className="text-gray-600 text-sm sm:text-base">City Government of San Pablo</p>
              <p className="text-gray-600 text-sm sm:text-base">City Hall Compound, San Pablo City 4000</p>
              <p className="text-gray-500 text-xs sm:text-sm">Tel No. (049) 503-3481 / Email add. bplospc@gmail.com</p>

              <h2 className="font-bold text-lg sm:text-xl mt-3 tracking-wide text-green-900">
                BUSINESS PERMITS AND LICENSING OFFICE
              </h2>

              <div className="mt-5 flex flex-col items-center gap-2">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 text-sm sm:text-base">
                  <span className="text-green-700"><IconTag /></span>
                  APPREHENSION NOTICE NO:
                </label>
                {isSigned ? (
                  <div className="border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl w-full max-w-sm text-center font-medium shadow-sm text-gray-700 text-sm">
                    {form.noticeNo || <span className="text-gray-400 italic">—</span>}
                  </div>
                ) : (
                  <input
                    name="noticeNo"
                    value={form.noticeNo}
                    onChange={handleChange}
                    placeholder="Enter Apprehension Notice No."
                    className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-2 rounded-xl w-full max-w-sm text-center font-medium shadow-sm text-sm transition"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Type ── */}
        <div className="mb-5">
          <FieldLabel icon={<IconBuilding />}>Type:</FieldLabel>
          {isSigned ? (
            <ViewField value={form.type} placeholder="Not specified" />
          ) : (
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={`${inputCls} bg-white`}
            >
              <option value="">Select</option>
              <option value="SINGLE PROPRIETORSHIP">SINGLE PROPRIETORSHIP</option>
              <option value="CORPORATION">CORPORATION</option>
              <option value="PARTNERSHIP">PARTNERSHIP</option>
            </select>
          )}
        </div>

        {/* ── Date + Taxpayer ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <FieldLabel icon={<IconCalendar />}>DATE:</FieldLabel>
            {isSigned ? (
              <ViewField value={form.date} />
            ) : (
              <>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  onKeyDown={preventManualInput}
                  readOnly
                  min={todayDate}
                  max={todayDate}
                  className={`${inputCls} bg-gray-50 cursor-pointer`}
                />
                <p className="text-xs text-gray-500 mt-2">Today's date only.</p>
              </>
            )}
          </div>

          <div>
            <FieldLabel icon={<IconUser />}>BUSINESS AND TAX PAYER NAME:</FieldLabel>
            <input
              name="taxpayer"
              value={form.taxpayer}
              onChange={handleChange}
              disabled
              className={readonlyCls + " cursor-not-allowed"}
              placeholder="Auto-filled name"
            />
          </div>
        </div>

        {/* ── Address ── */}
        <div className="mb-5">
          <FieldLabel icon={<IconMapPin />}>BUSINESS ADDRESS:</FieldLabel>
          {isSigned ? (
            <ViewField value={form.address} placeholder="No address provided" />
          ) : (
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={inputCls}
              placeholder="Enter business address"
            />
          )}
        </div>

        {/* ── Nature ── */}
        <div className="mb-6">
          <FieldLabel icon={<IconBriefcase />}>NATURE OF BUSINESS:</FieldLabel>
          {isSigned ? (
            <ViewField value={form.nature} placeholder="Not specified" />
          ) : (
            <input
              name="nature"
              value={form.nature}
              onChange={handleChange}
              className={inputCls}
              placeholder="Enter nature of business"
            />
          )}
        </div>

        {/* ── Notice body ── */}
        <div className="bg-green-50 border-l-4 border-green-700 p-5 rounded-2xl mb-5 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Please be informed that inspection was conducted at your establishment by the
            undersigned Inspector of this office and found out the following violations/findings
            mentioned under The Revised Revenue Code of San Pablo.
          </p>
        </div>

        {/* ── Violations ── */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm">
          <label className={`flex items-center gap-3 font-medium text-gray-700 ${isSigned ? "cursor-default" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              name="violation"
              checked={form.violation}
              onChange={handleChange}
              disabled={isSigned}
              className="h-4 w-4 accent-green-700 disabled:cursor-default"
            />
            NO PERMIT - Revised Revenue Code of San Pablo
          </label>

          <div className="mt-4">
            <FieldLabel icon={<IconClipboard />}>OTHER VIOLATIONS:</FieldLabel>
            {isSigned ? (
              <ViewTextarea value={form.otherViolation} placeholder="None" />
            ) : (
              <textarea
                name="otherViolation"
                value={form.otherViolation}
                onChange={handleChange}
                className={`${inputCls} min-h-[110px]`}
                placeholder="Enter other violations..."
              />
            )}
          </div>
        </div>

        {/* ── Rented ── */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm">
          <label className={`flex items-center gap-3 mb-4 font-medium text-gray-700 ${isSigned ? "cursor-default" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              name="rented"
              checked={form.rented}
              onChange={handleChange}
              disabled={isSigned}
              className="h-4 w-4 accent-green-700 disabled:cursor-default"
            />
            RENTED
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isSigned ? (
              <>
                <div>
                  <FieldLabel icon={<IconUser />}>NAME OF OWNER</FieldLabel>
                  <ViewField value={form.owner} placeholder="—" />
                </div>
                <div>
                  <FieldLabel icon={<IconTag />}>Cost of Rent (₱)</FieldLabel>
                  <ViewField value={form.rent} placeholder="—" />
                </div>
                <div>
                  <FieldLabel icon={<IconHome />}>OWNER'S ADDRESS</FieldLabel>
                  <ViewField value={form.ownerAddress} placeholder="—" />
                </div>
                <div>
                  <FieldLabel icon={<IconPhone />}>Contact No.</FieldLabel>
                  <ViewField value={form.contact} placeholder="—" />
                </div>
              </>
            ) : (
              <>
                <input name="owner" value={form.owner} onChange={handleChange} placeholder="NAME OF OWNER" className={inputCls} />
                <input name="rent" value={form.rent} onChange={handleChange} placeholder="Cost of Rent P" className={inputCls} />
                <input name="ownerAddress" value={form.ownerAddress} onChange={handleChange} placeholder="OWNER'S ADDRESS" className={inputCls} />
                <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact No." className={inputCls} />
              </>
            )}
          </div>
        </div>

        {/* ── Directive ── */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-2xl mb-6 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            <span className="font-semibold">DIRECTIVE:</span> The business establishment owner is directed to personally appear before
            the Office of the City Mayor, Business Permits and Licensing Division within three (3)
            working days from the receipt of this notice and to show cause why no cease-and-desist
            order should be issued against your establishment.
          </p>
        </div>

        {/* ── Signatures ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Inspected By */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="flex items-center gap-1.5 font-semibold text-gray-700 mb-3 text-sm">
              <span className="text-green-700"><IconUser /></span>
              INSPECTED BY:
            </p>
            {isSigned ? (
              <ViewField value={form.inspectedBy} placeholder="—" />
            ) : (
              <input
                name="inspectedBy"
                value={form.inspectedBy}
                onChange={handleChange}
                className={`${inputCls} mb-3`}
                placeholder="Name"
              />
            )}
            <div className="mt-3">
              <p className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                <IconPen />
                Signature:
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ aspectRatio: "3/1" }}>
                <SignatureCanvas
                  ref={sig1}
                  canvasProps={{
                    className: "w-full h-full touch-none",
                    style: { display: "block" },
                  }}
                  backgroundColor="white"
                />
              </div>
              {!isSigned && (
                <button
                  type="button"
                  onClick={() => sig1.current?.clear()}
                  className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Received By */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="flex items-center gap-1.5 font-semibold text-gray-700 mb-3 text-sm">
              <span className="text-green-700"><IconUser /></span>
              RECEIVED BY:
            </p>
            {isSigned ? (
              <ViewField value={form.receivedBy} placeholder="—" />
            ) : (
              <input
                name="receivedBy"
                value={form.receivedBy}
                onChange={handleChange}
                className={`${inputCls} mb-3`}
                placeholder="Name"
              />
            )}
            <div className="mt-3">
              <p className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                <IconPen />
                Signature:
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" style={{ aspectRatio: "3/1" }}>
                <SignatureCanvas
                  ref={sig2}
                  canvasProps={{
                    className: "w-full h-full touch-none",
                    style: { display: "block" },
                  }}
                  backgroundColor="white"
                />
              </div>
              {!isSigned && (
                <button
                  type="button"
                  onClick={() => sig2.current?.clear()}
                  className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="mt-3">
              <p className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                <IconCalendar />
                Date &amp; Time Received:
              </p>
              {isSigned ? (
                <ViewField value={form.receivedAt} placeholder="—" />
              ) : (
                <>
                  <input
                    type="datetime-local"
                    name="receivedAt"
                    value={form.receivedAt}
                    onChange={handleChange}
                    onKeyDown={preventManualInput}
                    className={`${inputCls} bg-gray-50 cursor-pointer`}
                  />
                  <p className="text-xs text-gray-500 mt-2">Current date and time only.</p>
                </>
              )}
            </div>
          </div>

          {/* Noted By */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2">
            <p className="flex items-center gap-1.5 font-semibold text-gray-700 mb-3 text-sm">
              <span className="text-green-700"><IconUser /></span>
              NOTED BY:
            </p>
            {isSigned ? (
              <ViewField value={form.notedBy} placeholder="—" />
            ) : (
              <input
                name="notedBy"
                value={form.notedBy}
                onChange={handleChange}
                className={`${inputCls} mb-3`}
                placeholder="Name"
              />
            )}
            <div className="mt-3">
              <p className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                <IconPen />
                Signature:
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white md:max-w-sm" style={{ aspectRatio: "3/1" }}>
                <SignatureCanvas
                  ref={sig3}
                  canvasProps={{
                    className: "w-full h-full touch-none",
                    style: { display: "block" },
                  }}
                  backgroundColor="white"
                />
              </div>
              {!isSigned && (
                <button
                  type="button"
                  onClick={() => sig3.current?.clear()}
                  className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Taken ── */}
        <div className="mb-6 bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm">
          <FieldLabel icon={<IconClipboard />}>ACTION TAKEN:</FieldLabel>
          {isSigned ? (
            <ViewTextarea value={form.actionTaken} placeholder="No action recorded" />
          ) : (
            <textarea
              name="actionTaken"
              value={form.actionTaken}
              onChange={handleChange}
              className={`${inputCls} min-h-[120px]`}
              placeholder="Enter action taken..."
            />
          )}
          <p className="text-xs text-gray-500 mt-3">QFM-BPL-009 Rev 0 2022.02.18</p>
        </div>

        {/* ── Submit / View-only button ── */}
        <button
          onClick={handleSubmit}
          disabled={isSigned || loading}
          className="flex items-center justify-center gap-2 bg-green-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg transition hover:bg-green-900 text-sm"
        >
          {isSigned ? (
            <><IconEye /><span>View Only — Already Submitted</span></>
          ) : loading ? (
            <><IconSpin /><span>Saving...</span></>
          ) : (
            <><IconSend /><span>Submit Notice</span></>
          )}
        </button>
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div
              className={`h-1.5 ${
                modal.type === "success" ? "bg-green-600"
                : modal.type === "error"   ? "bg-red-600"
                : modal.type === "warning" ? "bg-yellow-500"
                : modal.type === "loading" ? "bg-green-700"
                : "bg-blue-600"
              }`}
            />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <ModalIcon type={modal.type} />

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed text-sm">{modal.message}</p>
                </div>
              </div>

              {modal.type !== "loading" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-sm transition shadow-sm ${
                      modal.type === "success"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : modal.type === "error"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : modal.type === "warning"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <IconCheck />
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading overlay ── */}
      {loading && !modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 flex-shrink-0 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Saving...</h3>
                <p className="text-gray-600 text-sm">Please wait while the form is being submitted.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}