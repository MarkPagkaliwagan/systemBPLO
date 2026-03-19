"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
    FiArrowLeft,
    FiBriefcase,
    FiCheckCircle
} from "react-icons/fi";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ManualAddBusiness() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [form, setForm] = useState<any>({
        "Business Identification Number": "",
        "Business Name": "",
        "Trade Name": "",
        "Business Type": ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- LIVE DUPLICATE CHECK ---------- */
    useEffect(() => {
        const timer = setTimeout(async () => {
            const newErrors: Record<string, string> = { ...errors };
            // Check BIN
            const bin = form["Business Identification Number"]?.trim();
            if (bin?.length === 9) {
                const { data: binExists } = await supabase
                    .from("business_records")
                    .select("id")
                    .eq("business_identification_number", bin)
                    .limit(1)
                    .maybeSingle();
                if (binExists) newErrors["Business Identification Number"] = "BIN already exists";
                else if (newErrors["Business Identification Number"] === "BIN already exists") delete newErrors["Business Identification Number"];
            }
            // Check Business Name
            const name = form["Business Name"]?.trim();
            if (name) {
                const { data: nameExists } = await supabase
                    .from("business_records")
                    .select("id")
                    .ilike("business_name", name)
                    .limit(1)
                    .maybeSingle();
                if (nameExists) newErrors["Business Name"] = "Business Name already exists";
                else if (newErrors["Business Name"] === "Business Name already exists") delete newErrors["Business Name"];
            }
            setErrors(newErrors);
        }, 500); // debounce to avoid too many calls
        return () => clearTimeout(timer);
    }, [form["Business Identification Number"], form["Business Name"]]);

    /* ---------- HANDLE INPUT ---------- */
    const handleChange = (label: string, value: any) => {
        let v = value;
        if (v === "") v = null;

        // allow numbers only for BIN
        if (label === "Business Identification Number") {
            v = v.replace(/\D/g, ""); // remove non-digits
            if (v.length > 9) v = v.slice(0, 9);
        }

        setForm((prev: any) => ({
            ...prev,
            [label]: v
        }));

        const validationMessage = validateField(label, v);
        setErrors((prev) => {
            const copy = { ...prev };
            if (validationMessage) copy[label] = validationMessage;
            else delete copy[label];
            return copy;
        });
    };

    /* ---------- VALIDATION RULES ---------- */
    const validateField = (label: string, value: any): string | null => {
        if (!value) return `${label} is required`;
        const v = String(value).trim();

        if (label === "Business Identification Number") {
            if (!/^\d+$/.test(v)) return "BIN must contain only numbers";
            if (v.length !== 9) return "BIN must be exactly 9 digits";
            return null;
        }

        return null;
    };

    /* ---------- CLEAN DATA BEFORE SAVE ---------- */
    const cleanData = (data: any) => {
        const cleaned: any = {};
        Object.keys(data).forEach(key => {
            let value = data[key];
            if (value === "" || value === undefined) value = null;
            cleaned[key] = value;
        });
        return cleaned;
    };

    /* ---------- SAVE RECORD ---------- */
    const saveRecord = async () => {
        const allErrors = Object.keys(form).reduce((acc, key) => {
            const msg = validateField(key, form[key]);
            if (msg) acc[key] = msg;
            return acc;
        }, {} as Record<string, string>);

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            setShowErrorModal(true);
            setShowConfirm(false);
            return;
        }

        setLoading(true);
        const payload = cleanData(form);
        const { error } = await supabase
            .from("business_records")
            .insert([payload]);
        setLoading(false);
        if (error) {
            alert(error.message);
            return;
        }
        setShowConfirm(false);
        setShowSuccess(true);
    };

    const handleSaveClick = () => {
        if (Object.keys(errors).length > 0) {
            setShowErrorModal(true);
            setShowConfirm(false);
            return;
        }
        setShowConfirm(true);
    };

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
                    Quick Add Business
                </h1>
            </div>

            <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

                {/* BUSINESS */}
                <Section title="Business Information" icon={<FiBriefcase />}>
                    <Input label="Business Identification Number" onChange={handleChange} value={form["Business Identification Number"]} />
                    <Input label="Business Name" onChange={handleChange} value={form["Business Name"]} />
                    <Input label="Trade Name" onChange={handleChange} value={form["Trade Name"]} />
                    <Input label="Business Type" onChange={handleChange} value={form["Business Type"]} />
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
                        onClick={handleSaveClick}
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

            {/* ERROR MODAL */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    )
}

function Input({ label, type = "text", onChange, value }: { label: string, type?: string, onChange: any, value: any }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={value}
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