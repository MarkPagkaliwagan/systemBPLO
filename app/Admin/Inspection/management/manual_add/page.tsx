"use client";

import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBriefcase,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiClipboard,
  FiCalendar,
  FiCheckCircle
} from "react-icons/fi";

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

export default function ManualAddBusiness() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <FiArrowLeft className="w-5 h-5"/>
          Back
        </button>

        <h1 className="text-xl font-bold text-gray-900">
          Manual Business Record Entry
        </h1>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        <Section title="Business Information" icon={<FiBriefcase/>}>
          <Input label="Business Identification Number"/>
          <Input label="Business Name"/>
          <Input label="Trade Name"/>
          <Input label="Business Nature"/>
          <Input label="Business Line"/>
          <Input label="Business Type"/>
          <Input label="Transmittal No."/>
          <Input label="Year" type="number"/>
        </Section>

        <Section title="Incharge Information" icon={<FiUser/>}>
          <Input label="Incharge First Name"/>
          <Input label="Incharge Middle Name"/>
          <Input label="Incharge Last Name"/>
          <Input label="Incharge Extension Name"/>
          <Input label="Incharge Sex"/>
          <Input label="Citizenship"/>
        </Section>

        <Section title="Office Address" icon={<FiMapPin/>}>
          <Input label="Office Street"/>
          <Input label="Office Region"/>
          <Input label="Office Province"/>
          <Input label="Office Municipality"/>
          <Input label="Office Barangay"/>
          <Input label="Office Zipcode"/>
        </Section>

        <Section title="Financial Information" icon={<FiDollarSign/>}>
          <Input label="Capital" type="number"/>
          <Input label="Gross Amount" type="number"/>
          <Input label="Gross Amount Essential" type="number"/>
          <Input label="Gross Amount Non-Essential" type="number"/>
        </Section>

        <Section title="Requestor Information" icon={<FiUser/>}>
          <Input label="Requestor First Name"/>
          <Input label="Requestor Middle Name"/>
          <Input label="Requestor Last Name"/>
          <Input label="Requestor Extension Name"/>
          <Input label="Requestor Email"/>
          <Input label="Requestor Mobile No."/>
          <Input label="Birth Date" type="date"/>
          <Input label="Requestor Sex"/>
          <Input label="Civil Status"/>
          <Input label="Requestor Street"/>
          <Input label="Requestor Province"/>
          <Input label="Requestor Municipality"/>
          <Input label="Requestor Barangay"/>
          <Input label="Requestor Zipcode"/>
        </Section>

        <Section title="Transaction Information" icon={<FiFileText/>}>
          <Input label="Transaction ID"/>
          <Input label="Reference No."/>
          <Input label="Module Type"/>
          <Input label="Transaction Type"/>
          <Input label="Transaction Date" type="date"/>
          <Input label="SOA No."/>
          <Input label="Term"/>
        </Section>

        <Section title="Payment Information" icon={<FiClipboard/>}>
          <Input label="Annual Amount" type="number"/>
          <Input label="Amount Paid" type="number"/>
          <Input label="Balance" type="number"/>
          <Input label="Payment Type"/>
          <Input label="Payment Date" type="date"/>
          <Input label="O.R. No."/>
          <Input label="O.R. Date" type="date"/>
        </Section>

        <Section title="Permit / Clearance" icon={<FiCheckCircle/>}>
          <Input label="Brgy. Clearance Status"/>
          <Input label="Brgy. Clearance No."/>
          <Input label="Permit No."/>
          <Input label="Business Plate No."/>
        </Section>

        <Section title="Closure / Retirement" icon={<FiCalendar/>}>
          <Input label="Actual Closure Date" type="date"/>
          <Input label="Retirement Reason"/>
          <Input label="Source Type"/>
        </Section>

        <Section title="Inspection / Review" icon={<FiClipboard/>}>
          <Input label="violation"/>
          <Input label="review_action"/>
          <Input label="review_date" type="date"/>
          <Input label="reviewed_by"/>
          <Input label="status"/>
          <Input label="assigned_inspector"/>
          <Input label="scheduled_date" type="date"/>
        </Section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 pt-6">
          <button className="px-6 py-2 border rounded-lg hover:bg-gray-100">
            Cancel
          </button>

          <button className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800">
            Save Record
          </button>
        </div>

      </div>
    </div>
  );
}

/* COMPONENTS */

function Section({title,icon,children}:{title:string,icon:any,children:any}){

  return(
    <div className="bg-white border rounded-xl p-6 shadow-sm">

      <div className="flex items-center gap-2 mb-5 font-semibold text-green-900">
        {icon}
        {title}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>

    </div>
  )
}

function Input({label,type="text"}:{label:string,type?:string}){

  return(
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-900 outline-none"
      />
    </div>
  )
}