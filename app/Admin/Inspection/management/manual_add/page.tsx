"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    FiArrowLeft,
    FiBriefcase,
    FiClipboard,
    FiCheckCircle,
    FiChevronDown
} from "react-icons/fi";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import ReviewModal, { BusinessRecord } from "../Modal/reviewModal";

const BIN_FIELD = "Business Identification Number";
const BUSINESS_NAME_FIELD = "Business Name";

type ToastType = "success" | "error" | "info";

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

function ManualAddBusinessContent() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Record<string, any>>({});
    const [inspectorInput, setInspectorInput] = useState<string>("");
    const [inspectorList, setInspectorList] = useState<string[]>([]);
    const [inspectorError, setInspectorError] = useState<string | null>(null);
    const [adminUsers, setAdminUsers] = useState<string[]>([]);
    const [selectedAdminInspector, setSelectedAdminInspector] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [binChecking, setBinChecking] = useState(false);
    const [binDuplicate, setBinDuplicate] = useState(false);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [showProceedModal, setShowProceedModal] = useState(false);
    const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

    // ── ReviewModal state ─────────────────────────────────────────────────────
    const [reviewRecord, setReviewRecord] = useState<BusinessRecord | null>(null);
    const [showReview, setShowReview] = useState(false);

    const openProceedModal = () => {
        return new Promise<boolean>((resolve) => {
            confirmResolveRef.current = resolve;
            setShowProceedModal(true);
        });
    };

    const handleProceedModalChoice = (choice: boolean) => {
        setShowProceedModal(false);
        if (confirmResolveRef.current) {
            confirmResolveRef.current(choice);
            confirmResolveRef.current = null;
        }
    };

    /* ---------- LOAD ADMIN USERS ---------- */
    useEffect(() => {
        const loadAdminUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from("users")
                    .select("full_name, role")
                    .order("full_name", { ascending: true });
                if (error) throw new Error(error.message);
                if (!data || data.length === 0) { setAdminUsers([]); return; }
                const names = data
                    .map((item) => String(item.full_name ?? "").trim())
                    .filter((name) => name.length > 0);
                setAdminUsers(names);
            } catch (err: any) {
                console.error("Failed to load users:", err.message || err);
                setAdminUsers([]);
            }
        };
        loadAdminUsers();
    }, []);

    /* ---------- TOASTS ---------- */
    const addToast = (type: ToastType, message: string) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((prev) => [...prev, { id, type, message }]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    };

    /* ---------- HELPERS ---------- */
    const normalizeDigits = (value: any) => String(value ?? "").replace(/\D/g, "");
    const normalizeText = (value: any) => String(value ?? "").trim();

    /* ---------- HANDLE INPUT ---------- */
    const handleChange = (label: string, value: any) => {
        let v = value;
        if (label === BIN_FIELD) {
            v = normalizeDigits(value).slice(0, 12);
        }
        if (v === "") v = null;
        setForm((prev: Record<string, any>) => ({ ...prev, [label]: v }));
        const validationMessage = validateField(label, v);
        setErrors((prev) => {
            const copy = { ...prev };
            if (validationMessage) copy[label] = validationMessage;
            else delete copy[label];
            return copy;
        });
    };

    /* ---------- VALIDATION ---------- */
    const validateField = (label: string, value: any): string | null => {
        if (value === null || value === "" || value === undefined) return null;
        const v = String(value).trim();
        const integerOnlyLabels = [
            BIN_FIELD, "Transaction ID", "Reference No.", "Brgy. Clearance No.",
            "SOA No.", "Transmittal No.", "O.R. No.", "Business Plate No.",
            "Office Zipcode", "Requestor Zipcode", "Year"
        ];
        const decimalAllowedLabels = [
            "Capital", "Gross Amount", "Gross Amount Essential",
            "Gross Amount Non-Essential", "Annual Amount", "Amount Paid", "Balance"
        ];
        if (label === BIN_FIELD) {
            if (!/^\d+$/.test(v)) return "BIN must contain only numbers.";
            if (v.length < 9 || v.length > 12) return "BIN must be 9 to 12 digits only.";
            if (binDuplicate) return "BIN already exists.";
            return null;
        }
        if (integerOnlyLabels.includes(label)) {
            if (!/^\d+$/.test(v)) return `${label} must contain only numbers.`;
            return null;
        }
        if (decimalAllowedLabels.includes(label)) {
            if (!/^\d+(\.\d+)?$/.test(v)) return `${label} must be a valid number.`;
            return null;
        }
        if (label === "Requestor Mobile No.") {
            const digits = v.replace(/\D/g, "");
            if (digits.length < 7 || digits.length > 15) return `${label} looks too short or too long.`;
            return null;
        }
        if (label === "Requestor Email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format.";
            return null;
        }
        return null;
    };

    const checkBinDuplicateNow = async (rawValue: any) => {
        const bin = normalizeDigits(rawValue);
        if (!bin) return false;
        const { data, error } = await supabase
            .from("business_records")
            .select('"Business Identification Number"')
            .eq(BIN_FIELD, bin)
            .limit(1);
        if (error) { console.error("BIN duplicate check error:", error.message); return false; }
        return !!data && data.length > 0;
    };

    const validateAll = async (): Promise<Record<string, string>> => {
        const foundErrors: Record<string, string> = {};
        if (!normalizeText(form[BIN_FIELD])) {
            foundErrors[BIN_FIELD] = "BIN is required.";
        } else {
            const binVal = String(form[BIN_FIELD]).trim();
            if (!/^\d+$/.test(binVal)) {
                foundErrors[BIN_FIELD] = "BIN must contain only numbers.";
            } else if (binVal.length < 9 || binVal.length > 12) {
                foundErrors[BIN_FIELD] = "BIN must be 9 to 12 digits only.";
            } else {
                const isDup = await checkBinDuplicateNow(binVal);
                if (isDup) foundErrors[BIN_FIELD] = "BIN already exists.";
            }
        }
        if (!normalizeText(form[BUSINESS_NAME_FIELD])) {
            foundErrors[BUSINESS_NAME_FIELD] = "Business Name is required.";
        }
        Object.keys(form).forEach((key) => {
            const msg = validateField(key, form[key]);
            if (msg) foundErrors[key] = msg;
        });
        return foundErrors;
    };

    /* ---------- LIVE BIN DUPLICATE CHECK ---------- */
    useEffect(() => {
        const binValue = normalizeDigits(form[BIN_FIELD]);
        if (!binValue) {
            setBinChecking(false);
            setBinDuplicate(false);
            setErrors((prev) => {
                const copy = { ...prev };
                if (copy[BIN_FIELD] === "BIN already exists.") delete copy[BIN_FIELD];
                return copy;
            });
            return;
        }
        const delay = window.setTimeout(async () => {
            setBinChecking(true);
            const isDup = await checkBinDuplicateNow(binValue);
            setBinDuplicate(isDup);
            setErrors((prev) => {
                const copy = { ...prev };
                if (isDup) copy[BIN_FIELD] = "BIN already exists.";
                else if (copy[BIN_FIELD] === "BIN already exists.") delete copy[BIN_FIELD];
                return copy;
            });
            setBinChecking(false);
        }, 450);
        return () => window.clearTimeout(delay);
    }, [form[BIN_FIELD]]);

    /* ---------- INSPECTOR HELPERS ---------- */
    const addInspectorName = (rawName: string) => {
        const candidate = rawName.trim();
        if (!candidate) { setInspectorError("Inspector name is required."); return; }
        if (!inspectorList.includes(candidate)) {
            const updatedList = [...inspectorList, candidate];
            setInspectorList(updatedList);
            setForm((prev: Record<string, any>) => ({ ...prev, assigned_inspector: updatedList }));
            setInspectorError(null);
        } else {
            setInspectorError("Inspector already added.");
        }
    };

    const handleInspectorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inspectorInput.trim() !== "") {
            e.preventDefault();
            addInspectorName(inspectorInput);
            setInspectorInput("");
        }
        if (e.key === "Backspace" && inspectorInput === "" && inspectorList.length > 0) {
            const newList = [...inspectorList];
            newList.pop();
            setInspectorList(newList);
            setForm((prev: Record<string, any>) => ({ ...prev, assigned_inspector: newList }));
        }
    };

    const removeInspector = (name: string) => {
        const newList = inspectorList.filter((e) => e !== name);
        setInspectorList(newList);
        setForm((prev: Record<string, any>) => ({ ...prev, assigned_inspector: newList }));
    };

    /* ---------- CLEAN DATA ---------- */
    const cleanData = (data: Record<string, any>) => {
        const cleaned: Record<string, any> = {};
        Object.keys(data).forEach((key) => {
            let value = data[key];
            if (typeof value === "string") value = value.trim();
            if (value === "" || value === undefined) value = null;
            if (key === BIN_FIELD && value !== null) value = normalizeDigits(value);
            cleaned[key] = value;
        });
        return cleaned;
    };

    /* ---------- SAVE RECORD ---------- */
    const saveRecord = async () => {
        setLoading(true);
        const payload = cleanData(form);

        const { data, error } = await supabase
            .from("business_records")
            .insert([payload])
            .select()
            .single(); // ✅ get back the inserted record

        setLoading(false);

        if (error) {
            console.error("Insert error:", error.message);
            addToast("error", error.message);
            return;
        }

        addToast("success", "Record saved successfully.");

        const savedRecord = data as BusinessRecord;
        const proceedToReview = await openProceedModal();

        if (proceedToReview) {
            // ✅ Open ReviewModal exactly like analytics does — no routing
            setReviewRecord(savedRecord);
            setShowReview(true);
        } else {
            // Clear form for another entry
            setForm({});
            setInspectorList([]);
            setInspectorInput("");
            setSelectedAdminInspector("");
            setErrors({});
            setBinDuplicate(false);
            addToast("info", "Form cleared. You can add another record.");
        }
    };

    /* ---------- SAVE BUTTON ---------- */
    const handleSaveClick = async () => {
        const allErrors = await validateAll();
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            addToast("error", "Please fix the highlighted fields first.");
            return;
        }
        await saveRecord();
    };

    /* ---------- REVIEW MODAL HANDLERS ---------- */
    const handleReviewSave = async (reviewData: {
        reviewActions: string[];
        violations: string[];
        assignedInspector?: string;
        scheduledDate?: string;
        scheduledTime?: string;
        location?: { lat: number; lng: number; accuracy: number };
        photo?: File;
        photoUrl?: string;
        reviewedBy?: string;
    }) => {
        if (!reviewRecord) return;
        const updates: Record<string, any> = {
            review_action: reviewData.reviewActions.join(", ") || null,
            violation: reviewData.violations.join(", ") || null,
            status: reviewData.reviewActions[reviewData.reviewActions.length - 1]?.toLowerCase().replace(/ /g, "_") ?? null,
            review_date: new Date().toISOString(),
            reviewed_by: reviewData.reviewedBy ?? null,
            assigned_inspector: reviewData.assignedInspector ?? null,
            scheduled_date: reviewData.scheduledDate ?? null,
            schedule_time: reviewData.scheduledTime ?? null,
            latitude: reviewData.location?.lat?.toString() ?? null,
            longitude: reviewData.location?.lng?.toString() ?? null,
            accuracy: reviewData.location?.accuracy?.toString() ?? null,
            photo: reviewData.photoUrl ?? null,
        };
        await supabase
            .from("business_records")
            .update(updates)
            .eq("Business Identification Number", reviewRecord["Business Identification Number"]);

        setShowReview(false);
        setReviewRecord(null);
        addToast("success", "Review saved successfully.");

        // ✅ After review is saved, close the manual add page entirely
        setTimeout(() => {
            router.back();
        }, 800); // small delay so the toast is visible before leaving
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {showReview && reviewRecord && (
                <ReviewModal
                    selectedRow={reviewRecord}
                    showReviewModal={true}
                    isMobile={false}
                    onClose={() => {
                        setShowReview(false);
                        setReviewRecord(null);
                    }}
                    onSave={handleReviewSave}
                    onRecordUpdated={(updated) => setReviewRecord(updated as BusinessRecord)}
                    onRecordDeleted={() => {
                        setShowReview(false);
                        setReviewRecord(null);
                        router.back();
                    }}
                />
            )}

            {/* TOASTS */}
            <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-[360px] pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg text-sm
                        ${toast.type === "success" ? "border-green-200 bg-green-50 text-green-900"
                                : toast.type === "error" ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"}`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* CONFIRMATION MODAL */}
            {showProceedModal && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4"
                    onClick={() => handleProceedModalChoice(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-green-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-900">
                                <FiCheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-green-900">Record Saved</h2>
                                <p className="text-sm text-gray-600">What would you like to do next?</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-6">
                            Do you want to open the Review form for this record, or add another one?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => handleProceedModalChoice(false)}
                                className="px-5 py-2 rounded-lg border border-green-900 text-green-900 hover:bg-green-50 transition w-full sm:w-auto"
                            >
                                Add more
                            </button>
                            <button
                                type="button"
                                onClick={() => handleProceedModalChoice(true)}
                                className="px-5 py-2 rounded-lg bg-green-900 text-white hover:bg-green-800 transition w-full sm:w-auto"
                            >
                                Open Review Form
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-white border-b border-green-100 px-4 sm:px-6 py-4 flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-900 transition"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-green-900 truncate">
                    Add Business Record
                </h1>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

                {/* QUICK ENTRY */}
                <Section title="Quick Business Entry" icon={<FiBriefcase />} collapsible={false} note="Main fields only">
                    <Input
                        label={BIN_FIELD}
                        value={form[BIN_FIELD] ?? ""}
                        onChange={handleChange}
                        error={errors[BIN_FIELD]}
                        inputMode="numeric"
                        placeholder="9 to 12 digits"
                        helperText={
                            binChecking ? "Checking BIN..."
                                : binDuplicate ? "This BIN already exists."
                                    : (form[BIN_FIELD]?.length || 0) < 9
                                        ? `Minimum 9 digits (${(form[BIN_FIELD] ?? "").length}/12)`
                                        : `${(form[BIN_FIELD] ?? "").length}/12 digits`
                        }
                        required
                    />
                    <Input
                        label={BUSINESS_NAME_FIELD}
                        value={form[BUSINESS_NAME_FIELD] ?? ""}
                        onChange={handleChange}
                        error={errors[BUSINESS_NAME_FIELD]}
                        placeholder="Enter business name"
                        required
                    />

                    {/* Inspector */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Inspector</label>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={selectedAdminInspector}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedAdminInspector(value);
                                        if (value) { addInspectorName(value); setSelectedAdminInspector(""); }
                                    }}
                                    className="border rounded-lg px-3 py-2 text-black outline-none w-full sm:w-[260px] transition border-green-100 focus:ring-2 focus:ring-green-900"
                                >
                                    <option value="">Select users name</option>
                                    {adminUsers.map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={inspectorInput}
                                    onChange={(e) => { setInspectorInput(e.target.value); setInspectorError(null); }}
                                    onKeyDown={handleInspectorKeyDown}
                                    placeholder="Or type name and press Enter"
                                    className="flex-1 border rounded-lg px-3 py-2 text-black outline-none w-full transition border-green-100 focus:ring-2 focus:ring-green-900"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 border rounded-lg px-2 py-2 min-h-[44px] items-center border-green-100 focus-within:ring-2 focus-within:ring-green-900">
                                {inspectorList.map((name, idx) => (
                                    <div key={idx} className="flex items-center bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs sm:text-sm">
                                        {name}
                                        <button type="button" className="ml-1" onClick={() => removeInspector(name)}>×</button>
                                    </div>
                                ))}
                                {inspectorList.length === 0 && (
                                    <span className="text-xs text-gray-400 px-1">No inspector added yet</span>
                                )}
                            </div>
                        </div>
                        {inspectorError && <p className="text-xs text-red-600 mt-1">{inspectorError}</p>}
                        <p className="text-xs text-gray-500 mt-1">Optional only. You can choose from admin names or type a new one and press Enter.</p>
                    </div>

                    <Input label="Business Nature" value={form["Business Nature"] ?? ""} onChange={handleChange} />
                    <Input label="Business Type" value={form["Business Type"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-1 lg:col-span-3 flex flex-col sm:flex-row justify-end gap-4 pt-2">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-green-900 text-green-900 rounded-lg hover:bg-green-50 w-full sm:w-auto transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={loading}
                            className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto transition"
                        >
                            {loading ? "Saving..." : "Save Record"}
                        </button>
                    </div>
                </Section>

                {/* ADDITIONAL DETAILS */}
                <Section title="Additional Details" icon={<FiClipboard />} collapsible note="Optional only">
                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2">Incharge Information</div>
                    <Input label="Incharge First Name" value={form["Incharge First Name"] ?? ""} onChange={handleChange} />
                    <Input label="Incharge Middle Name" value={form["Incharge Middle Name"] ?? ""} onChange={handleChange} />
                    <Input label="Incharge Last Name" value={form["Incharge Last Name"] ?? ""} onChange={handleChange} />
                    <Input label="Incharge Extension Name" value={form["Incharge Extension Name"] ?? ""} onChange={handleChange} />
                    <Input label="Incharge Sex" value={form["Incharge Sex"] ?? ""} onChange={handleChange} />
                    <Input label="Citizenship" value={form["Citizenship"] ?? ""} onChange={handleChange} />
                    <Input label="Birth Date" type="date" value={form["Birth Date"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Office Address</div>
                    <Input label="Office Street" value={form["Office Street"] ?? ""} onChange={handleChange} />
                    <Input label="Office Region" value={form["Office Region"] ?? ""} onChange={handleChange} />
                    <Input label="Office Province" value={form["Office Province"] ?? ""} onChange={handleChange} />
                    <Input label="Office Municipality" value={form["Office Municipality"] ?? ""} onChange={handleChange} />
                    <Input label="Office Barangay" value={form["Office Barangay"] ?? ""} onChange={handleChange} />
                    <Input label="Office Zipcode" value={form["Office Zipcode"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Financial Information</div>
                    <Input label="Capital" type="number" value={form["Capital"] ?? ""} onChange={handleChange} />
                    <Input label="Gross Amount" type="number" value={form["Gross Amount"] ?? ""} onChange={handleChange} />
                    <Input label="Gross Amount Essential" type="number" value={form["Gross Amount Essential"] ?? ""} onChange={handleChange} />
                    <Input label="Gross Amount Non-Essential" type="number" value={form["Gross Amount Non-Essential"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Requestor Information</div>
                    <Input label="Requestor First Name" value={form["Requestor First Name"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Middle Name" value={form["Requestor Middle Name"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Last Name" value={form["Requestor Last Name"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Extension Name" value={form["Requestor Extension Name"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Email" value={form["Requestor Email"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Mobile No." value={form["Requestor Mobile No."] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Sex" value={form["Requestor Sex"] ?? ""} onChange={handleChange} />
                    <Input label="Civil Status" value={form["Civil Status"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Street" value={form["Requestor Street"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Province" value={form["Requestor Province"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Municipality" value={form["Requestor Municipality"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Barangay" value={form["Requestor Barangay"] ?? ""} onChange={handleChange} />
                    <Input label="Requestor Zipcode" value={form["Requestor Zipcode"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Transaction Information</div>
                    <Input label="Transaction ID" value={form["Transaction ID"] ?? ""} onChange={handleChange} />
                    <Input label="Reference No." value={form["Reference No."] ?? ""} onChange={handleChange} />
                    <Input label="Module Type" value={form["Module Type"] ?? ""} onChange={handleChange} />
                    <Input label="Transaction Type" value={form["Transaction Type"] ?? ""} onChange={handleChange} />
                    <Input label="Transaction Date" type="datetime-local" value={form["Transaction Date"] ?? ""} onChange={handleChange} />
                    <Input label="SITE Transaction Status" value={form["SITE Transaction Status"] ?? ""} onChange={handleChange} />
                    <Input label="CORE Transaction Status" value={form["CORE Transaction Status"] ?? ""} onChange={handleChange} />
                    <Input label="Reject Remarks" value={form["Reject Remarks"] ?? ""} onChange={handleChange} />
                    <Input label="SOA No." value={form["SOA No."] ?? ""} onChange={handleChange} />
                    <Input label="Term" value={form["Term"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Payment Information</div>
                    <Input label="Annual Amount" type="number" value={form["Annual Amount"] ?? ""} onChange={handleChange} />
                    <Input label="Amount Paid" type="number" value={form["Amount Paid"] ?? ""} onChange={handleChange} />
                    <Input label="Balance" type="number" value={form["Balance"] ?? ""} onChange={handleChange} />
                    <Input label="Payment Type" value={form["Payment Type"] ?? ""} onChange={handleChange} />
                    <Input label="Payment Date" type="date" value={form["Payment Date"] ?? ""} onChange={handleChange} />
                    <Input label="O.R. No." value={form["O.R. No."] ?? ""} onChange={handleChange} />
                    <Input label="O.R. Date" type="date" value={form["O.R. Date"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Permit / Clearance</div>
                    <Input label="Brgy. Clearance Status" value={form["Brgy. Clearance Status"] ?? ""} onChange={handleChange} />
                    <Input label="Brgy. Clearance No." value={form["Brgy. Clearance No."] ?? ""} onChange={handleChange} />
                    <Input label="Permit No." value={form["Permit No."] ?? ""} onChange={handleChange} />
                    <Input label="Business Plate No." value={form["Business Plate No."] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Closure / Retirement</div>
                    <Input label="Actual Closure Date" type="date" value={form["Actual Closure Date"] ?? ""} onChange={handleChange} />
                    <Input label="Retirement Reason" value={form["Retirement Reason"] ?? ""} onChange={handleChange} />
                    <Input label="Source Type" value={form["Source Type"] ?? ""} onChange={handleChange} />

                    <div className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-green-900 border-b border-green-100 pb-2 mt-2">Inspection / Review</div>
                    <Input label="violation" value={form["violation"] ?? ""} onChange={handleChange} />
                    <Input label="review_action" value={form["review_action"] ?? ""} onChange={handleChange} />
                    <Input label="review_date" type="date" value={form["review_date"] ?? ""} onChange={handleChange} />
                    <Input label="reviewed_by" value={form["reviewed_by"] ?? ""} onChange={handleChange} />
                    <Input label="status" value={form["status"] ?? ""} onChange={handleChange} />
                    <Input label="scheduled_date" type="date" value={form["scheduled_date"] ?? ""} onChange={handleChange} />
                </Section>
            </div>
        </div>
    );
}

/* ---------- UI COMPONENTS ---------- */
function Section({
    title, icon, children, collapsible = false, note
}: {
    title: string; icon: any; children: any; collapsible?: boolean; note?: string;
}) {
    if (!collapsible) {
        return (
            <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                    <div className="flex items-center gap-2 font-semibold text-green-900">{icon}{title}</div>
                    {note && <span className="text-xs text-gray-500">{note}</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
            </div>
        );
    }
    return (
        <details className="bg-white border border-green-100 rounded-2xl shadow-sm group">
            <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 flex items-center justify-between gap-3 text-green-900 font-semibold">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">{icon}<span>{title}</span></div>
                    {note && <span className="text-xs text-gray-500 font-normal">{note}</span>}
                </div>
                <FiChevronDown className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
            </div>
        </details>
    );
}

function Input({
    label, type = "text", value, onChange, error, placeholder, helperText, required = false, inputMode
}: {
    label: string; type?: string; value?: any; onChange: any; error?: string;
    placeholder?: string; helperText?: string; required?: boolean;
    inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | "search";
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(label, e.target.value)}
                placeholder={placeholder}
                inputMode={inputMode}
                className={`border rounded-lg px-3 py-2 text-black outline-none w-full transition
                    ${error ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-green-100 focus:ring-2 focus:ring-green-900"}`}
            />
            {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

export default function ManualAddBusiness() {
    return (
        <ProtectedRoute requiredRole="staff">
            <ManualAddBusinessContent />
        </ProtectedRoute>
    );
}