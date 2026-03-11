"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManualAddBusiness() {

  const router = useRouter();

  const [loading,setLoading] = useState(false)
  const [showConfirm,setShowConfirm] = useState(false)
  const [showSuccess,setShowSuccess] = useState(false)

  const [form,setForm] = useState<any>({
    "Business Identification Number":"",
    "Business Name":"",
    "Trade Name":"",
    "Business Nature":"",
    "Business Line":"",
    "Business Type":"",
    "Transmittal No.":"",
    "Incharge First Name":"",
    "Incharge Middle Name":"",
    "Incharge Last Name":"",
    "Incharge Extension Name":"",
    "Incharge Sex":"",
    "Citizenship":"",
    "Office Street":"",
    "Office Region":"",
    "Office Province":"",
    "Office Municipality":"",
    "Office Barangay":"",
    "Office Zipcode":"",
    "Year":null,
    "Capital":null,
    "Gross Amount":null,
    "Gross Amount Essential":null,
    "Gross Amount Non-Essential":null,
    "Reject Remarks":"",
    "Module Type":"",
    "Transaction Type":"",
    "Requestor First Name":"",
    "Requestor Middle Name":"",
    "Requestor Last Name":"",
    "Requestor Extension Name":"",
    "Requestor Email":"",
    "Requestor Mobile No.":"",
    "Birth Date":"",
    "Requestor Sex":"",
    "Civil Status":"",
    "Requestor Street":"",
    "Requestor Province":"",
    "Requestor Municipality":"",
    "Requestor Barangay":"",
    "Requestor Zipcode":"",
    "Transaction ID":"",
    "Reference No.":"",
    "Brgy. Clearance Status":"",
    "SITE Transaction Status":"",
    "CORE Transaction Status":"",
    "Transaction Date":"",
    "SOA No.":"",
    "Annual Amount":null,
    "Term":"",
    "Amount Paid":null,
    "Balance":null,
    "Payment Type":"",
    "Payment Date":"",
    "O.R. No.":"",
    "Brgy. Clearance No.":"",
    "O.R. Date":"",
    "Permit No.":"",
    "Business Plate No.":"",
    "Actual Closure Date":"",
    "Retirement Reason":"",
    "Source Type":"",
    violation:"",
    review_action:"",
    review_date:"",
    reviewed_by:"",
    status:"",
    assigned_inspector:"",
    scheduled_date:""
  })

  const handleChange=(label:string,value:any)=>{
    setForm((prev:any)=>({
      ...prev,
      [label]:value
    }))
  }

  const saveRecord = async ()=>{

    setLoading(true)

    const {error} = await supabase
      .from("business_records")
      .insert([form])

    setLoading(false)

    if(error){
      alert(error.message)
      return
    }

    setShowConfirm(false)
    setShowSuccess(true)

  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">

        <button
          onClick={()=>router.back()}
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

        {/* BUSINESS */}
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

        {/* INCHARGE */}
        <Section title="Incharge Information" icon={<FiUser/>}>
          <Input label="Incharge First Name" onChange={handleChange}/>
          <Input label="Incharge Middle Name" onChange={handleChange}/>
          <Input label="Incharge Last Name" onChange={handleChange}/>
          <Input label="Incharge Extension Name" onChange={handleChange}/>
          <Input label="Incharge Sex" onChange={handleChange}/>
          <Input label="Citizenship" onChange={handleChange}/>
        </Section>

        {/* ADDRESS */}
        <Section title="Office Address" icon={<FiMapPin/>}>
          <Input label="Office Street" onChange={handleChange}/>
          <Input label="Office Region" onChange={handleChange}/>
          <Input label="Office Province" onChange={handleChange}/>
          <Input label="Office Municipality" onChange={handleChange}/>
          <Input label="Office Barangay" onChange={handleChange}/>
          <Input label="Office Zipcode" onChange={handleChange}/>
        </Section>

        {/* FINANCIAL */}
        <Section title="Financial Information" icon={<FiDollarSign/>}>
          <Input label="Capital" type="number" onChange={handleChange}/>
          <Input label="Gross Amount" type="number" onChange={handleChange}/>
          <Input label="Gross Amount Essential" type="number" onChange={handleChange}/>
          <Input label="Gross Amount Non-Essential" type="number" onChange={handleChange}/>
        </Section>

        {/* REQUESTOR */}
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

        {/* TRANSACTION */}
        <Section title="Transaction Information" icon={<FiFileText/>}>
          <Input label="Transaction ID" onChange={handleChange}/>
          <Input label="Reference No." onChange={handleChange}/>
          <Input label="Module Type" onChange={handleChange}/>
          <Input label="Transaction Type" onChange={handleChange}/>
          <Input label="Transaction Date" type="datetime-local" onChange={handleChange}/>
          <Input label="SOA No." onChange={handleChange}/>
          <Input label="Term" onChange={handleChange}/>
        </Section>

        {/* PAYMENT */}
        <Section title="Payment Information" icon={<FiClipboard/>}>
          <Input label="Annual Amount" type="number" onChange={handleChange}/>
          <Input label="Amount Paid" type="number" onChange={handleChange}/>
          <Input label="Balance" type="number" onChange={handleChange}/>
          <Input label="Payment Type" onChange={handleChange}/>
          <Input label="Payment Date" type="date" onChange={handleChange}/>
          <Input label="O.R. No." onChange={handleChange}/>
          <Input label="O.R. Date" type="date" onChange={handleChange}/>
        </Section>

        {/* PERMIT */}
        <Section title="Permit / Clearance" icon={<FiCheckCircle/>}>
          <Input label="Brgy. Clearance Status" onChange={handleChange}/>
          <Input label="Brgy. Clearance No." onChange={handleChange}/>
          <Input label="Permit No." onChange={handleChange}/>
          <Input label="Business Plate No." onChange={handleChange}/>
        </Section>

        {/* RETIREMENT */}
        <Section title="Closure / Retirement" icon={<FiCalendar/>}>
          <Input label="Actual Closure Date" type="date" onChange={handleChange}/>
          <Input label="Retirement Reason" onChange={handleChange}/>
          <Input label="Source Type" onChange={handleChange}/>
        </Section>

        {/* REVIEW */}
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
            onClick={()=>setShowConfirm(true)}
            className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800"
          >
            Save Record
          </button>

        </div>

      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <Modal>
          <h2 className="text-lg font-semibold mb-4">
            Confirm Save?
          </h2>

          <p className="text-gray-600 mb-6">
            Are you sure you want to save this business record?
          </p>

          <div className="flex justify-end gap-3">

            <button
              onClick={()=>setShowConfirm(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={saveRecord}
              className="px-4 py-2 bg-green-900 text-white rounded"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>

          </div>
        </Modal>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <Modal>

          <div className="text-center">

            <FiCheckCircle className="mx-auto text-green-700 w-12 h-12 mb-4"/>

            <h2 className="text-lg font-semibold">
              Record Saved Successfully
            </h2>

            <button
              onClick={()=>router.push("/Admin/Inspection/management")}
              className="mt-6 px-6 py-2 bg-green-900 text-white rounded"
            >
              Done
            </button>

          </div>

        </Modal>
      )}

    </div>
  )
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

function Modal({children}:{children:any}){

  return(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
        {children}
      </div>

    </div>
  )
}