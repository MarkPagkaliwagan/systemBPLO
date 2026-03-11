"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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

  const [loading,setLoading] = useState(false);
  const [confirmModal,setConfirmModal] = useState(false);
  const [successModal,setSuccessModal] = useState(false);

  const [form,setForm] = useState<any>({});

  const handleChange = (label:string,value:any)=>{
    setForm((prev:any)=>({
      ...prev,
      [label]:value
    }))
  }

  const handleSubmit = async ()=>{

    setConfirmModal(false)
    setLoading(true)

    const payload = {
      ...form,
      id: crypto.randomUUID()
    }

    const {error} = await supabase
      .from("business_records")
      .insert(payload)

    setLoading(false)

    if(!error){
      setSuccessModal(true)
    }else{
      alert(error.message)
    }

  }

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
          <Input label="Business Identification Number" onChange={handleChange}/>
          <Input label="Business Name" onChange={handleChange}/>
          <Input label="Trade Name" onChange={handleChange}/>
          <Input label="Business Nature" onChange={handleChange}/>
          <Input label="Business Line" onChange={handleChange}/>
          <Input label="Business Type" onChange={handleChange}/>
          <Input label="Transmittal No." onChange={handleChange}/>
          <Input label="Year" type="number" onChange={handleChange}/>
        </Section>

        <Section title="Incharge Information" icon={<FiUser/>}>
          <Input label="Incharge First Name" onChange={handleChange}/>
          <Input label="Incharge Middle Name" onChange={handleChange}/>
          <Input label="Incharge Last Name" onChange={handleChange}/>
          <Input label="Incharge Extension Name" onChange={handleChange}/>
          <Input label="Incharge Sex" onChange={handleChange}/>
          <Input label="Citizenship" onChange={handleChange}/>
        </Section>

        <Section title="Office Address" icon={<FiMapPin/>}>
          <Input label="Office Street" onChange={handleChange}/>
          <Input label="Office Region" onChange={handleChange}/>
          <Input label="Office Province" onChange={handleChange}/>
          <Input label="Office Municipality" onChange={handleChange}/>
          <Input label="Office Barangay" onChange={handleChange}/>
          <Input label="Office Zipcode" onChange={handleChange}/>
        </Section>

        <Section title="Financial Information" icon={<FiDollarSign/>}>
          <Input label="Capital" type="number" onChange={handleChange}/>
          <Input label="Gross Amount" type="number" onChange={handleChange}/>
          <Input label="Gross Amount Essential" type="number" onChange={handleChange}/>
          <Input label="Gross Amount Non-Essential" type="number" onChange={handleChange}/>
        </Section>

        <Section title="Requestor Information" icon={<FiUser/>}>
          <Input label="Requestor First Name" onChange={handleChange}/>
          <Input label="Requestor Middle Name" onChange={handleChange}/>
          <Input label="Requestor Last Name" onChange={handleChange}/>
          <Input label="Requestor Extension Name" onChange={handleChange}/>
          <Input label="Requestor Email" onChange={handleChange}/>
          <Input label="Requestor Mobile No." onChange={handleChange}/>
          <Input label="Birth Date" type="date" onChange={handleChange}/>
          <Input label="Requestor Sex" onChange={handleChange}/>
          <Input label="Civil Status" onChange={handleChange}/>
          <Input label="Requestor Street" onChange={handleChange}/>
          <Input label="Requestor Province" onChange={handleChange}/>
          <Input label="Requestor Municipality" onChange={handleChange}/>
          <Input label="Requestor Barangay" onChange={handleChange}/>
          <Input label="Requestor Zipcode" onChange={handleChange}/>
        </Section>

        <Section title="Transaction Information" icon={<FiFileText/>}>
          <Input label="Transaction ID" onChange={handleChange}/>
          <Input label="Reference No." onChange={handleChange}/>
          <Input label="Module Type" onChange={handleChange}/>
          <Input label="Transaction Type" onChange={handleChange}/>
          <Input label="Transaction Date" type="date" onChange={handleChange}/>
          <Input label="SOA No." onChange={handleChange}/>
          <Input label="Term" onChange={handleChange}/>
        </Section>

        <Section title="Inspection / Review" icon={<FiClipboard/>}>
          <Input label="violation" onChange={handleChange}/>
          <Input label="review_action" onChange={handleChange}/>
          <Input label="review_date" type="date" onChange={handleChange}/>
          <Input label="reviewed_by" onChange={handleChange}/>
          <Input label="status" onChange={handleChange}/>
          <Input label="assigned_inspector" onChange={handleChange}/>
          <Input label="scheduled_date" type="date" onChange={handleChange}/>
        </Section>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            onClick={()=>router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={()=>setConfirmModal(true)}
            className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800"
          >
            {loading ? "Saving..." : "Save Record"}
          </button>
        </div>

      </div>

      {/* CONFIRM MODAL */}
      {confirmModal &&(
        <Modal
          title="Confirm Save"
          text="Do you want to save this record?"
          onConfirm={handleSubmit}
          onCancel={()=>setConfirmModal(false)}
        />
      )}

      {/* SUCCESS MODAL */}
      {successModal &&(
        <Modal
          title="Saved"
          text="Record successfully saved."
          onConfirm={()=>router.push("/Admin/Inspection/management")}
        />
      )}

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

function Input({label,type="text",onChange}:{label:string,type?:string,onChange:any}){

  return(
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        onChange={(e)=>onChange(label,e.target.value)}
        className="border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-green-900 outline-none"
      />
    </div>
  )
}

function Modal({title,text,onConfirm,onCancel}:{title:string,text:string,onConfirm:any,onCancel?:any}){

  return(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[380px]">

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-gray-600 mb-6">{text}</p>

        <div className="flex justify-end gap-3">

          {onCancel &&(
            <button
              onClick={onCancel}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-900 text-white rounded-lg"
          >
            Confirm
          </button>

        </div>

      </div>

    </div>
  )
}