"use client";

import { useRouter } from "next/navigation";
import { useState, KeyboardEvent } from "react";
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

    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showErrorModal, setShowErrorModal] = useState(false)

    const [form, setForm] = useState<any>({})
    const [inspectorInput, setInspectorInput] = useState<string>("")
    const [inspectorList, setInspectorList] = useState<string[]>([])
    const [inspectorError, setInspectorError] = useState<string | null>(null)

    // live validation errors state (key -> message)
    const [errors, setErrors] = useState<Record<string, string>>({})

    /* ---------- HANDLE INPUT ---------- */
    const handleChange = (label: string, value: any) => {
        let v = value
        if (v === "") v = null

        // update form (keep original behaviour)
        setForm((prev: any) => ({
            ...prev,
            [label]: v
        }))

        // run live validation as soon as user types (but only if there's content)
        const validationMessage = validateField(label, value)
        setErrors((prev) => {
            const copy = { ...prev }
            if (validationMessage) copy[label] = validationMessage
            else delete copy[label]
            return copy
        })
    }

    /* ---------- VALIDATION RULES ---------- */
    const validateField = (label: string, value: any): string | null => {
        // If empty or null -> not required by default, so no error
        if (value === null || value === "" || value === undefined) return null

        const v = String(value).trim()

        // common numeric-only labels
        const integerOnlyLabels = [
            "Business Identification Number",
            "Transaction ID",
            "Reference No.",
            "Brgy. Clearance No.",
            "SOA No.",
            "Transmittal No.",
            "O.R. No.",
            "Business Plate No.",
            "Office Zipcode",
            "Requestor Zipcode",
            "Year"
        ]

        // decimal-allowed numeric labels (amounts)
        const decimalAllowedLabels = [
            "Capital",
            "Gross Amount",
            "Gross Amount Essential",
            "Gross Amount Non-Essential",
            "Annual Amount",
            "Amount Paid",
            "Balance"
        ]

        // phone labels
        const phoneLabels = [
            "Requestor Mobile No."
        ]

        // email labels
        const emailLabels = [
            "Requestor Email"
        ]

        // basic checks
        if (integerOnlyLabels.includes(label)) {
            if (!/^\d+$/.test(v)) return `${label} must contain only numbers (no letters or symbols)`
            return null
        }

        if (decimalAllowedLabels.includes(label)) {
            if (!/^\d+(\.\d+)?$/.test(v)) return `${label} must be a valid number`
            return null
        }

        if (phoneLabels.includes(label)) {
            // accept digits only, length check (7-15)
            const digits = v.replace(/\D/g, "")
            if (!/^\d+$/.test(digits)) return `${label} must contain only digits`
            if (digits.length < 7 || digits.length > 15) return `${label} looks too short/long`
            return null
        }

        if (emailLabels.includes(label)) {
            // simple email regex
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!re.test(v)) return `Invalid email format`
            return null
        }

        // default: no validation for other fields (non-required)
        return null
    }

    const validateAll = (): Record<string, string> => {
        const foundErrors: Record<string, string> = {}

        // validate every field currently present in the form
        Object.keys(form).forEach((key) => {
            const val = form[key]
            const msg = validateField(key, val)
            if (msg) foundErrors[key] = msg
        })

        // also validate inspector list items (if any)
        inspectorList.forEach((email, idx) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!re.test(email)) {
                foundErrors[`assigned_inspector[${idx}]`] = `Invalid inspector email: ${email}`
            }
        })

        // return object of errors (empty object => no errors)
        return foundErrors
    }

    /* ---------- HANDLE INSPECTOR CHIP INPUT ---------- */
    const handleInspectorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inspectorInput.trim() !== "") {
            e.preventDefault()
            const candidate = inspectorInput.trim()
            // basic email validation (inspectors usually emails)
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!re.test(candidate)) {
                setInspectorError("Invalid email format for inspector")
                return
            }
            setInspectorError(null)
            if (!inspectorList.includes(candidate)) {
                const updatedList = [...inspectorList, candidate]
                setInspectorList(updatedList)
                setForm((prev: any) => ({
                    ...prev,
                    assigned_inspector: updatedList
                }))
            }
            setInspectorInput("")
        }
        if (e.key === "Backspace" && inspectorInput === "" && inspectorList.length > 0) {
            const newList = [...inspectorList]
            newList.pop()
            setInspectorList(newList)
            setForm((prev: any) => ({
                ...prev,
                assigned_inspector: newList
            }))
        }
    }

    const removeInspector = (email: string) => {
        const newList = inspectorList.filter(e => e !== email)
        setInspectorList(newList)
        setForm((prev: any) => ({
            ...prev,
            assigned_inspector: newList
        }))
    }

    /* ---------- CLEAN DATA BEFORE SAVE ---------- */
    const cleanData = (data: any) => {
        const cleaned: any = {}
        Object.keys(data).forEach(key => {
            let value = data[key]
            if (value === "" || value === undefined) value = null
            cleaned[key] = value
        })
        return cleaned
    }

    /* ---------- SAVE RECORD ---------- */
    const saveRecord = async () => {
        // safety re-validate before saving
        const allErrors = validateAll()
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors)
            setShowErrorModal(true)
            setShowConfirm(false)
            return
        }

        setLoading(true)
        const payload = cleanData(form)
        const { error } = await supabase
            .from("business_records")
            .insert([payload])
        setLoading(false)
        if (error) {
            alert(error.message)
            return
        }
        setShowConfirm(false)
        setShowSuccess(true)
    }

    /* ---------- SAVE BUTTON CLICK (first gate) ---------- */
    const handleSaveClick = () => {
        const allErrors = validateAll()
        if (Object.keys(allErrors).length > 0) {
            // show error modal instead of confirm
            setErrors(allErrors)
            setShowErrorModal(true)
            setShowConfirm(false)
            return
        }
        // no errors -> show confirm modal
        setShowConfirm(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* HEADER */}
            <div className="bg-white border-b px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-900"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-green-900 truncate">
                    Manual Business Record Entry
                </h1>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

                {/* BUSINESS */}
                <Section title="Business Information" icon={<FiBriefcase />}>
                    <Input label="Business Identification Number" onChange={handleChange} />
                    <Input label="Business Name" onChange={handleChange} />
                    <Input label="Trade Name" onChange={handleChange} />
                    <Input label="Business Nature" onChange={handleChange} />
                    <Input label="Business Line" onChange={handleChange} />
                    <Input label="Business Type" onChange={handleChange} />
                    <Input label="Transmittal No." onChange={handleChange} />
                    <Input label="Year" type="number" onChange={handleChange} />
                </Section>

                {/* INCHARGE */}
                <Section title="Incharge Information" icon={<FiUser />}>
                    <Input label="Incharge First Name" onChange={handleChange} />
                    <Input label="Incharge Middle Name" onChange={handleChange} />
                    <Input label="Incharge Last Name" onChange={handleChange} />
                    <Input label="Incharge Extension Name" onChange={handleChange} />
                    <Input label="Incharge Sex" onChange={handleChange} />
                    <Input label="Citizenship" onChange={handleChange} />
                    <Input label="Birth Date" type="date" onChange={handleChange} />
                </Section>

                {/* ADDRESS */}
                <Section title="Office Address" icon={<FiMapPin />}>
                    <Input label="Office Street" onChange={handleChange} />
                    <Input label="Office Region" onChange={handleChange} />
                    <Input label="Office Province" onChange={handleChange} />
                    <Input label="Office Municipality" onChange={handleChange} />
                    <Input label="Office Barangay" onChange={handleChange} />
                    <Input label="Office Zipcode" onChange={handleChange} />
                </Section>

                {/* FINANCIAL */}
                <Section title="Financial Information" icon={<FiDollarSign />}>
                    <Input label="Capital" type="number" onChange={handleChange} />
                    <Input label="Gross Amount" type="number" onChange={handleChange} />
                    <Input label="Gross Amount Essential" type="number" onChange={handleChange} />
                    <Input label="Gross Amount Non-Essential" type="number" onChange={handleChange} />
                </Section>

                {/* REQUESTOR */}
                <Section title="Requestor Information" icon={<FiUser />}>
                    <Input label="Requestor First Name" onChange={handleChange} />
                    <Input label="Requestor Middle Name" onChange={handleChange} />
                    <Input label="Requestor Last Name" onChange={handleChange} />
                    <Input label="Requestor Extension Name" onChange={handleChange} />
                    <Input label="Requestor Email" onChange={handleChange} />
                    <Input label="Requestor Mobile No." onChange={handleChange} />
                    <Input label="Requestor Sex" onChange={handleChange} />
                    <Input label="Civil Status" onChange={handleChange} />
                    <Input label="Requestor Street" onChange={handleChange} />
                    <Input label="Requestor Province" onChange={handleChange} />
                    <Input label="Requestor Municipality" onChange={handleChange} />
                    <Input label="Requestor Barangay" onChange={handleChange} />
                    <Input label="Requestor Zipcode" onChange={handleChange} />
                </Section>

                {/* TRANSACTION */}
                <Section title="Transaction Information" icon={<FiFileText />}>
                    <Input label="Transaction ID" onChange={handleChange} />
                    <Input label="Reference No." onChange={handleChange} />
                    <Input label="Module Type" onChange={handleChange} />
                    <Input label="Transaction Type" onChange={handleChange} />
                    <Input label="Transaction Date" type="datetime-local" onChange={handleChange} />
                    <Input label="SITE Transaction Status" onChange={handleChange} />
                    <Input label="CORE Transaction Status" onChange={handleChange} />
                    <Input label="Reject Remarks" onChange={handleChange} />
                    <Input label="SOA No." onChange={handleChange} />
                    <Input label="Term" onChange={handleChange} />
                </Section>

                {/* PAYMENT */}
                <Section title="Payment Information" icon={<FiClipboard />}>
                    <Input label="Annual Amount" type="number" onChange={handleChange} />
                    <Input label="Amount Paid" type="number" onChange={handleChange} />
                    <Input label="Balance" type="number" onChange={handleChange} />
                    <Input label="Payment Type" onChange={handleChange} />
                    <Input label="Payment Date" type="date" onChange={handleChange} />
                    <Input label="O.R. No." onChange={handleChange} />
                    <Input label="O.R. Date" type="date" onChange={handleChange} />
                </Section>

                {/* PERMIT */}
                <Section title="Permit / Clearance" icon={<FiCheckCircle />}>
                    <Input label="Brgy. Clearance Status" onChange={handleChange} />
                    <Input label="Brgy. Clearance No." onChange={handleChange} />
                    <Input label="Permit No." onChange={handleChange} />
                    <Input label="Business Plate No." onChange={handleChange} />
                </Section>

                {/* RETIREMENT */}
                <Section title="Closure / Retirement" icon={<FiCalendar />}>
                    <Input label="Actual Closure Date" type="date" onChange={handleChange} />
                    <Input label="Retirement Reason" onChange={handleChange} />
                    <Input label="Source Type" onChange={handleChange} />
                </Section>

                {/* REVIEW */}
                <Section title="Inspection / Review" icon={<FiClipboard />}>
                    <Input label="violation" onChange={handleChange} />
                    <Input label="review_action" onChange={handleChange} />
                    <Input label="review_date" type="date" onChange={handleChange} />
                    <Input label="reviewed_by" onChange={handleChange} />
                    <Input label="status" onChange={handleChange} />

                    {/* assigned_inspector chip input - responsive */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">assigned_inspector</label>
                        <div className={`flex flex-wrap gap-2 border rounded-lg px-2 py-2 min-h-[44px] items-center focus-within:ring-2 ${Object.keys(errors).some(k => k.startsWith("assigned_inspector")) ? "ring-1 ring-red-400" : "focus-within:ring-green-900"}`}>
                            {inspectorList.map((email, idx) => (
                                <div key={idx} className="flex items-center bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs sm:text-sm">
                                    {email}
                                    <button type="button" className="ml-1" onClick={() => removeInspector(email)}>×</button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={inspectorInput}
                                onChange={(e) => {
                                    setInspectorInput(e.target.value)
                                    // live check for format as they type (basic)
                                    if (e.target.value.trim() === "") {
                                        setInspectorError(null)
                                    } else {
                                        const maybe = e.target.value.trim()
                                        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                                        setInspectorError(re.test(maybe) ? null : "Invalid email format")
                                    }
                                }}
                                onKeyDown={handleInspectorKeyDown}
                                placeholder="Type and press Enter"
                                className="flex-1 outline-none border-none text-black px-1 py-1 min-w-[100px] sm:min-w-[120px]"
                            />
                        </div>
                        {inspectorError && <p className="text-xs text-red-600 mt-1">{inspectorError}</p>}
                    </div>

                    <Input label="scheduled_date" type="date" onChange={handleChange} />
                </Section>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 border text-black rounded-lg hover:bg-blue-400 w-full sm:w-auto"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSaveClick()}
                        className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 w-full sm:w-auto"
                    >
                        Save Record
                    </button>
                </div>

            </div>

            {/* CONFIRM MODAL */}
            {showConfirm && (
                <Modal>
                    <h2 className="text-lg font-semibold mb-4 text-green-900">
                        Confirm Save
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Save this business record to database?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 border text-black rounded w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveRecord}
                            className="px-4 py-2 bg-green-900 text-white rounded w-full sm:w-auto"
                        >
                            {loading ? "Saving..." : "Confirm"}
                        </button>
                    </div>
                </Modal>
            )}

            {/* ERROR MODAL (shows validation errors) */}
            {showErrorModal && (
                <Modal>
                    <h2 className="text-lg font-semibold mb-4 text-red-600">
                        Validation Errors
                    </h2>
                    <div className="max-h-[300px] overflow-auto mb-4">
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            {Object.keys(errors).length === 0 && <li>No validation errors found.</li>}
                            {Object.entries(errors).map(([k, v]) => (
                                <li key={k}><strong className="text-red-600">{k}:</strong> {v}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Close
                        </button>
                    </div>
                </Modal>
            )}

            {/* SUCCESS MODAL */}
            {showSuccess && (
                <Modal>
                    <div className="text-center">
                        <FiCheckCircle className="mx-auto text-green-900 w-12 h-12 mb-4" />
                        <h2 className="text-lg font-semibold text-green-900">
                            Record Saved Successfully
                        </h2>
                        <button
                            onClick={() => router.push("/Admin/Inspection/management/review")}
                            className="mt-6 px-6 py-2 bg-green-900 text-white rounded w-full sm:w-auto"
                        >
                            Done
                        </button>
                    </div>
                </Modal>
            )}

        </div>
    )
}

/* ---------- UI COMPONENTS ---------- */
function Section({ title, icon, children }: { title: string, icon: any, children: any }) {
    return (
        <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 sm:mb-5 font-semibold text-green-900">
                {icon}
                {title}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    )
}

function Input({ label, type = "text", onChange }: { label: string, type?: string, onChange: any }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                onChange={(e) => onChange(label, e.target.value)}
                className="border rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-green-900 outline-none w-full"
            />
        </div>
    )
}

function Modal({ children }: { children: any }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 sm:p-0">
            <div className="bg-white rounded-xl p-6 w-full sm:w-[420px] shadow-xl">
                {children}
            </div>
        </div>
    )
}