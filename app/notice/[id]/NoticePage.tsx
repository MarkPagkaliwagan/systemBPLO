"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  initialData?: any;
};

type ModalState = {
  open: boolean;
  type: "loading" | "success" | "error" | "info";
  title: string;
  message: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const getLocalDateTime = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function NoticePage({ initialData }: Props) {
  const formRef = useRef<HTMLDivElement>(null);
  const sig1 = useRef<any>(null);
  const sig2 = useRef<any>(null);
  const sig3 = useRef<any>(null);
  const isSigned = initialData?.signed;
  const violationId = initialData?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = useState(
    Boolean(isSigned)
  );
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    noticeNo: "",
    type: "",
    date: "",
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
    receivedAt: "",
    actionTaken: "",
  });

  const currentDate = getLocalDate();
  const currentDateTime = getLocalDateTime();

  useEffect(() => {
    if (!initialData) return;

    setForm((prev) => ({
      ...prev,
      taxpayer: initialData.business_name ?? prev.taxpayer,
      address: initialData.address ?? prev.address,
      nature: initialData.nature_of_business ?? prev.nature,
      noticeNo: initialData.notice_no ?? prev.noticeNo,
    }));
  }, [initialData]);

  useEffect(() => {
    if (isSigned) {
      setShowAlreadySubmittedModal(true);
    }
  }, [isSigned]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const openModal = (
    type: ModalState["type"],
    title: string,
    message: string
  ) => {
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!form.taxpayer || !form.inspectedBy) {
      openModal("error", "Validation", "Please fill required fields.");
      return;
    }

    if (!form.date) {
      openModal("error", "Validation", "Please select the date.");
      return;
    }

    if (form.date !== currentDate) {
      openModal("error", "Validation", "Only the current date can be selected.");
      return;
    }

    if (form.receivedAt && form.receivedAt < currentDateTime) {
      openModal(
        "error",
        "Validation",
        "Received At must be current time or later."
      );
      return;
    }

    if (!violationId) {
      openModal("error", "Error", "No violation ID found!");
      return;
    }

    if (!sig1.current || sig1.current.isEmpty()) {
      openModal("error", "Validation", "Inspector signature required.");
      return;
    }

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

    setIsSubmitting(true);
    openModal("loading", "Saving...", "Please wait while your notice is being saved.");

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
        openModal("success", "Saved Successfully", "Your notice has been submitted.");
      } else {
        openModal("error", "Error", data.error || "Error saving");
      }
    } catch (error) {
      openModal("error", "Error", "Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  console.log("INITIAL DATA:", initialData);
  console.log("ID:", violationId);

  return (
    <div className="min-h-screen bg-linear-to-br text-black from-slate-100 via-gray-100 to-slate-200 p-4 md:p-8 flex justify-center">
      <div
        ref={formRef}
        className="relative bg-white w-full max-w-5xl p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200"
      >
        {/* HEADER */}
        <div className="relative text-center mb-8 pb-6 border-b">
          <div className="absolute right-0 top-0 hidden md:block">
            <img
              src="/vercel.svg"
              alt="Logo"
              className="h-14 w-14 object-contain"
            />
          </div>

          <p className="font-semibold text-gray-700">Republic of the Philippines</p>
          <p className="text-gray-600">City Government of San Pablo</p>
          <p className="text-gray-600">City Hall Compound, San Pablo City 4000</p>
          <p className="text-gray-500 text-sm">
            Tel No. (049) 503-3481 / Email add. bplospc@gmail.com
          </p>
          <h2 className="font-bold text-xl mt-3 tracking-wide text-green-900">
            BUSINESS PERMITS AND LICENSING OFFICE
          </h2>

          <div className="mt-5 flex flex-col items-center gap-2">
            <label className="font-semibold text-gray-700">APPREHENSION NOTICE NO:</label>
            <input
              name="noticeNo"
              value={form.noticeNo}
              onChange={handleChange}
              placeholder="Enter Apprehension Notice No."
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-2 rounded-xl w-full max-w-sm text-center font-medium shadow-sm"
            />
          </div>
        </div>

        {/* BUSINESS TYPE */}
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

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">DATE:</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={currentDate}
              max={currentDate}
              inputMode="none"
              onKeyDown={blockTyping}
              onPaste={(e) => e.preventDefault()}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm"
            />
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
              className="border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed px-4 py-3 rounded-xl w-full shadow-sm"
              placeholder="Automatically filled"
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

        {/* CARD NOTICE */}
        <div className="bg-green-50 border-l-4 border-green-700 p-5 rounded-2xl mb-5 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            Please be informed that inspection was conducted at your establishment by the
            undersigned Inspector of this office and found out the following
            violations/findings mentioned under The Revised Revenue Code of San Pablo.
          </p>
        </div>

        {/* VIOLATIONS */}
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

        {/* RENTED */}
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
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm"
            />
            <input
              name="rent"
              value={form.rent}
              onChange={handleChange}
              placeholder="Cost of Rent P"
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm"
            />
            <input
              name="ownerAddress"
              value={form.ownerAddress}
              onChange={handleChange}
              placeholder="OWNER'S ADDRESS"
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm"
            />
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Contact No."
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* DIRECTIVE */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-2xl mb-6 shadow-sm">
          <p className="text-gray-700 leading-relaxed">
            DIRECTIVE: The business establishment owner is directed to personally appear
            before the Office of the City Mayor, Business Permits and Licensing Division
            within three (3) working days from the receipt of this notice and to show cause
            why no cease-and-desist order should be issued against your establishment.
          </p>
        </div>

        {/* SIGNATURES */}
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
              <SignatureCanvas ref={sig1} canvasProps={{ className: "w-full h-28" }} />
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
              <SignatureCanvas ref={sig2} canvasProps={{ className: "w-full h-28" }} />
            </div>
            <input
              type="datetime-local"
              name="receivedAt"
              value={form.receivedAt}
              onChange={handleChange}
              min={currentDateTime}
              inputMode="none"
              onKeyDown={blockTyping}
              onPaste={(e) => e.preventDefault()}
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none w-full p-3 mt-3 rounded-xl shadow-sm"
            />
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
              <SignatureCanvas ref={sig3} canvasProps={{ className: "w-full h-28" }} />
            </div>
          </div>
        </div>

        {/* ACTION */}
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

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={isSigned || isSubmitting}
          className="bg-green-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg"
        >
          {isSigned ? "Already Submitted" : isSubmitting ? "Saving..." : "Submit"}
        </button>
      </div>

      {/* CUSTOM MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              {modal.type === "loading" && (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
              )}
              {modal.type === "success" && (
                <div className="h-6 w-6 rounded-full bg-green-600" />
              )}
              {modal.type === "error" && (
                <div className="h-6 w-6 rounded-full bg-red-600" />
              )}
              {modal.type === "info" && (
                <div className="h-6 w-6 rounded-full bg-blue-600" />
              )}
              <h3 className="text-lg font-bold text-gray-800">{modal.title}</h3>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">{modal.message}</p>

            {modal.type !== "loading" && (
              <button
                onClick={closeModal}
                className="mt-6 w-full rounded-xl bg-green-800 px-4 py-3 font-semibold text-white"
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}

      {/* ALREADY SUBMITTED MODAL */}
      {showAlreadySubmittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-green-600" />
              <h3 className="text-lg font-bold text-gray-800">Already Submitted</h3>
            </div>

            <p className="mt-4 text-gray-600 leading-relaxed">
              This notice has already been submitted.
            </p>

            <button
              onClick={() => setShowAlreadySubmittedModal(false)}
              className="mt-6 w-full rounded-xl bg-green-800 px-4 py-3 font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}