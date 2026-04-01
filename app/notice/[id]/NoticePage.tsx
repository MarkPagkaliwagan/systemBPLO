"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import type { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  initialData?: any;
};

type ModalType = "loading" | "success" | "error" | "info" | "warning";

function safeParse(value: any) {
  try {
    if (!value) return null;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

function getSavedFormData(initialData: any) {
  const saved =
    safeParse(initialData?.submitted_data) ||
    safeParse(initialData?.form_data) ||
    safeParse(initialData?.data) ||
    safeParse(initialData?.notice_data) ||
    {};

  return {
    noticeNo: initialData?.notice_no ?? saved?.noticeNo ?? saved?.notice_no ?? "",
    type: initialData?.type ?? saved?.type ?? "",
    date: initialData?.date ?? saved?.date ?? "",
    taxpayer:
      initialData?.business_name ?? initialData?.taxpayer ?? saved?.taxpayer ?? "",
    address: initialData?.address ?? saved?.address ?? "",
    nature:
      initialData?.nature_of_business ?? initialData?.nature ?? saved?.nature ?? "",
    violation:
      initialData?.violation ?? saved?.violation ?? false,
    otherViolation:
      initialData?.otherViolation ?? saved?.otherViolation ?? "",
    rented: initialData?.rented ?? saved?.rented ?? false,
    owner: initialData?.owner ?? saved?.owner ?? "",
    ownerAddress: initialData?.ownerAddress ?? saved?.ownerAddress ?? "",
    rent: initialData?.rent ?? saved?.rent ?? "",
    contact: initialData?.contact ?? saved?.contact ?? "",
    inspectedBy: initialData?.inspectedBy ?? saved?.inspectedBy ?? "",
    receivedBy: initialData?.receivedBy ?? saved?.receivedBy ?? "",
    notedBy: initialData?.notedBy ?? saved?.notedBy ?? "",
    receivedAt: initialData?.receivedAt ?? saved?.receivedAt ?? "",
    actionTaken: initialData?.actionTaken ?? saved?.actionTaken ?? "",
  };
}

export default function NoticePage({ initialData }: Props) {
  const formRef = useRef<HTMLDivElement>(null);
  const sig1 = useRef<any>(null);
  const sig2 = useRef<any>(null);
  const sig3 = useRef<any>(null);

  const isSigned = initialData?.signed;
  const violationId = initialData?.id;

  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  const currentDateTime = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

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
    if (!initialData) return;

    const savedForm = getSavedFormData(initialData);

    setForm((prev) => ({
      ...prev,
      noticeNo: savedForm.noticeNo || prev.noticeNo,
      type: savedForm.type || prev.type,
      date: savedForm.date || prev.date,
      taxpayer: savedForm.taxpayer || prev.taxpayer,
      address: savedForm.address || prev.address,
      nature: savedForm.nature || prev.nature,
      violation: typeof savedForm.violation === "boolean" ? savedForm.violation : prev.violation,
      otherViolation: savedForm.otherViolation || prev.otherViolation,
      rented: typeof savedForm.rented === "boolean" ? savedForm.rented : prev.rented,
      owner: savedForm.owner || prev.owner,
      ownerAddress: savedForm.ownerAddress || prev.ownerAddress,
      rent: savedForm.rent || prev.rent,
      contact: savedForm.contact || prev.contact,
      inspectedBy: savedForm.inspectedBy || prev.inspectedBy,
      receivedBy: savedForm.receivedBy || prev.receivedBy,
      notedBy: savedForm.notedBy || prev.notedBy,
      receivedAt: savedForm.receivedAt || prev.receivedAt,
      actionTaken: savedForm.actionTaken || prev.actionTaken,
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    };

    const t = setTimeout(() => {
      const saved = safeParse(initialData?.submitted_data) ||
        safeParse(initialData?.form_data) ||
        safeParse(initialData?.data) ||
        safeParse(initialData?.notice_data) ||
        {};

      const sigs = initialData?.signatures || saved?.signatures || {};

      loadSignature(sig1, sigs?.inspectedBy);
      loadSignature(sig2, sigs?.receivedBy);
      loadSignature(sig3, sigs?.notedBy);
    }, 250);

    return () => clearTimeout(t);
  }, [initialData]);

  useEffect(() => {
    if (isSigned) {
      setModal({
        open: true,
        type: "warning",
        title: "Already Submitted",
        message: "This notice has already been submitted.",
      });
    }
  }, [isSigned]);

  const closeModal = () => {
    if (modal.type === "success") {
      window.location.reload();
      return;
    }

    setModal((prev) => ({ ...prev, open: false }));
  };

  const openModal = (type: ModalType, title: string, message: string) => {
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (name === "date" && value !== todayDate) {
      openModal("warning", "Invalid Date", "Please select today’s date only.");
      return;
    }

    if (name === "receivedAt" && value > currentDateTime) {
      openModal("warning", "Invalid Date Time", "Please select current date and time only.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const preventManualInput = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

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
      openModal("warning", "Signature Required", "Inspector signature required.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        openModal("success", "Saved Successfully", "The notice has been submitted successfully.");
      } else {
        openModal("error", "Save Failed", data.error || "Error saving");
      }
    } catch (error) {
      openModal("error", "Network Error", "Something went wrong while saving the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-slate-100 via-gray-100 to-slate-200 p-3 sm:p-4 md:p-8 flex justify-center text-black">
      <div
        ref={formRef}
        className="relative bg-white w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-green-700 via-emerald-500 to-green-700" />

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

              {isSigned && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800 border border-yellow-300">
                  <span>Already Submitted</span>
                </div>
              )}

              <div className="mt-5 flex flex-col items-center gap-2">
                <label className="font-semibold text-gray-700 text-sm sm:text-base">
                  APPREHENSION NOTICE NO:
                </label>
                <input
                  name="noticeNo"
                  value={form.noticeNo}
                  onChange={handleChange}
                  placeholder="Enter Apprehension Notice No."
                  className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-2 rounded-xl w-full max-w-sm text-center font-medium shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="block font-semibold text-gray-700 mb-2">Type:</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm bg-white"
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
              name="date"
              value={form.date}
              onChange={handleChange}
              onKeyDown={preventManualInput}
              readOnly
              min={todayDate}
              max={todayDate}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm bg-gray-50 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">Today’s date only.</p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              BUSINESS AND TAX PAYER NAME:
            </label>
            <input
              name="taxpayer"
              value={form.taxpayer}
              onChange={handleChange}
              disabled
              className="border border-gray-300 px-4 py-3 rounded-xl w-full shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Auto-filled name"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block font-semibold text-gray-700 mb-2">BUSINESS ADDRESS:</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm"
            placeholder="Enter business address"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-2">NATURE OF BUSINESS:</label>
          <input
            name="nature"
            value={form.nature}
            onChange={handleChange}
            className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm"
            placeholder="Enter nature of business"
          />
        </div>

        <div className="bg-green-50 border-l-4 border-green-700 p-5 rounded-2xl mb-5 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            Please be informed that inspection was conducted at your establishment by the
            undersigned Inspector of this office and found out the following
            violations/findings mentioned under The Revised Revenue Code of San Pablo.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm">
          <label className="flex items-center gap-3 font-medium text-gray-700">
            <input
              type="checkbox"
              name="violation"
              checked={form.violation}
              onChange={handleChange}
              className="h-4 w-4 accent-green-700"
            />
            NO PERMIT - Revised Revenue Code of San Pablo
          </label>

          <div className="mt-4">
            <label className="block font-semibold text-gray-700 mb-2">OTHER VIOLATIONS:</label>
            <textarea
              name="otherViolation"
              value={form.otherViolation}
              onChange={handleChange}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 rounded-xl min-h-27.5 shadow-sm"
              placeholder="Enter other violations..."
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl mb-5 shadow-sm">
          <label className="flex items-center gap-3 mb-4 font-medium text-gray-700">
            <input
              type="checkbox"
              name="rented"
              checked={form.rented}
              onChange={handleChange}
              className="h-4 w-4 accent-green-700"
            />
            RENTED
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="NAME OF OWNER"
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm w-full"
            />
            <input
              name="rent"
              value={form.rent}
              onChange={handleChange}
              placeholder="Cost of Rent P"
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm w-full"
            />
            <input
              name="ownerAddress"
              value={form.ownerAddress}
              onChange={handleChange}
              placeholder="OWNER'S ADDRESS"
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm w-full"
            />
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Contact No."
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm w-full"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-2xl mb-6 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            DIRECTIVE: The business establishment owner is directed to personally appear
            before the Office of the City Mayor, Business Permits and Licensing Division
            within three (3) working days from the receipt of this notice and to show cause
            why no cease-and-desist order should be issued against your establishment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-700 mb-3">INSPECTED BY:</p>
            <input
              name="inspectedBy"
              value={form.inspectedBy}
              onChange={handleChange}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 mb-3 rounded-xl shadow-sm"
              placeholder="Name"
            />
            <div className="border rounded-xl overflow-hidden bg-white">
              <SignatureCanvas ref={sig1} canvasProps={{ className: "w-full h-28 touch-none" }} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-700 mb-3">RECEIVED BY:</p>
            <input
              name="receivedBy"
              value={form.receivedBy}
              onChange={handleChange}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 mb-3 rounded-xl shadow-sm"
              placeholder="Name"
            />
            <div className="border rounded-xl overflow-hidden bg-white">
              <SignatureCanvas ref={sig2} canvasProps={{ className: "w-full h-28 touch-none" }} />
            </div>
            <input
              type="datetime-local"
              name="receivedAt"
              value={form.receivedAt}
              onChange={handleChange}
              onKeyDown={preventManualInput}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 mt-3 rounded-xl shadow-sm bg-gray-50 cursor-pointer"
              min={currentDateTime}
              max={currentDateTime}
            />
            <p className="text-xs text-gray-500 mt-2">Current date and time only.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm md:col-span-2">
            <p className="font-semibold text-gray-700 mb-3">NOTED BY:</p>
            <input
              name="notedBy"
              value={form.notedBy}
              onChange={handleChange}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 mb-3 rounded-xl shadow-sm"
              placeholder="Name"
            />
            <div className="border rounded-xl overflow-hidden bg-white">
              <SignatureCanvas ref={sig3} canvasProps={{ className: "w-full h-28 touch-none" }} />
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm">
          <label className="block font-semibold text-gray-700 mb-2">ACTION TAKEN:</label>
          <textarea
            name="actionTaken"
            value={form.actionTaken}
            onChange={handleChange}
            className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 rounded-xl min-h-30 shadow-sm"
            placeholder="Enter action taken..."
          />
          <p className="text-xs text-gray-500 mt-3">QFM-BPL-009 Rev 0 2022.02.18</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSigned || loading}
          className="bg-green-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg transition hover:bg-green-900"
        >
          {isSigned ? "Already Submitted" : loading ? "Saving..." : "Submit"}
        </button>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div
              className={`h-2 ${
                modal.type === "success"
                  ? "bg-green-600"
                  : modal.type === "error"
                  ? "bg-red-600"
                  : modal.type === "warning"
                  ? "bg-green-500"
                  : "bg-blue-600"
              }`}
            />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-bold ${
                    modal.type === "success"
                      ? "bg-green-600"
                      : modal.type === "error"
                      ? "bg-red-600"
                      : modal.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-600"
                  }`}
                >
                  {modal.type === "loading" ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : modal.type === "success" ? (
                    "✓"
                  ) : modal.type === "error" ? (
                    "!"
                  ) : modal.type === "warning" ? (
                    "!"
                  ) : (
                    "i"
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">{modal.message}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {modal.type !== "loading" && (
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Saving...</h3>
                <p className="text-gray-600">Please wait while the form is being submitted.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}