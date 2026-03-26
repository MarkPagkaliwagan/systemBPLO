"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type Props = {
  initialData?: any;
};

export default function NoticePage({ initialData }: Props) {
  const formRef = useRef<HTMLDivElement>(null);
  const sig1 = useRef<any>(null);
  const sig2 = useRef<any>(null);
  const sig3 = useRef<any>(null);
  const isSigned = initialData?.signed;

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

 const handleSubmit = async () => {

  if (!form.taxpayer || !form.inspectedBy) {
  alert("Please fill required fields");
  return;
}

if (!sig1.current || sig1.current.isEmpty()) {
  alert("Inspector signature required");
  return;
}

  const sig1Data = sig1.current?.getTrimmedCanvas().toDataURL();
  const sig2Data = sig2.current?.getTrimmedCanvas().toDataURL();
  const sig3Data = sig3.current?.getTrimmedCanvas().toDataURL();

  const payload = {
    ...form,
    initialData,
    signatures: {
      inspectedBy: sig1Data,
      receivedBy: sig2Data,
      notedBy: sig3Data,
    },
  };

  const res = await fetch("/api/save-notice", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

  const data = await res.json();

  if (data.success) {
    alert("Saved successfully!");
  } else {
    alert("Error saving");
  }
};

  return (
    <div className="min-h-screen bg-linear-to-br text-black from-slate-100 via-gray-100 to-slate-200 p-4 md:p-8 flex justify-center">
      <div
        ref={formRef}
        className="bg-white w-full max-w-5xl p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-200"
      >
        {/* HEADER */}
        <div className="text-center mb-8 pb-6 border-b">
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
              className="border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none px-4 py-3 rounded-xl w-full shadow-sm"
              placeholder="Enter name"
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
  disabled={isSigned}
  className="bg-green-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl w-full font-semibold shadow-lg"
>
  {isSigned ? "Already Submitted" : "Submit"}
</button>
      </div>
    </div>
  );
}