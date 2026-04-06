"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    FiArrowLeft,
    FiBriefcase,
    FiClipboard,
    FiCheckCircle,
    FiChevronDown,
    FiUser,
    FiSearch,
    FiX,
    FiAlertCircle,
    FiInfo,
    FiCalendar,
    FiSave,
    FiTrash2,
    FiUserPlus,
    FiMapPin,
    FiDollarSign,
    FiFileText,
    FiCreditCard,
    FiShield,
    FiSlash,
    FiEye,
} from "react-icons/fi";
import ProtectedRoute from "../../../../../components/ProtectedRoute";
import ReviewModal, { BusinessRecord } from "../Modal/reviewModal";

const BIN_FIELD = "Business Identification Number";
const BUSINESS_NAME_FIELD = "Business Name";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface InspectorOption {
    name: string;
    source: "user" | "inspector";
    label: string;
}

/* ─────────────────────────────────────────────────────────────────────────── */
function ManualAddBusinessContent() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Record<string, any>>({});
    const [inspectorInput, setInspectorInput] = useState("");
    const [inspectorList, setInspectorList] = useState<string[]>([]);
    const [inspectorError, setInspectorError] = useState<string | null>(null);
    const [adminUsers, setAdminUsers] = useState<InspectorOption[]>([]);
    const [selectedAdminInspector, setSelectedAdminInspector] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [binChecking, setBinChecking] = useState(false);
    const [existingRecord, setExistingRecord] = useState<BusinessRecord | null>(null);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [showProceedModal, setShowProceedModal] = useState(false);
    const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);
    const [reviewRecord, setReviewRecord] = useState<BusinessRecord | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // BIN confirmation modal
    const [pendingRecord, setPendingRecord] = useState<BusinessRecord | null>(null);
    const [showBinConfirm, setShowBinConfirm] = useState(false);

    // Track the last confirmed BIN so typing away clears auto-fill
    const confirmedBinRef = useRef<string>("");

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 640);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* ── Proceed modal ── */
    const openProceedModal = () =>
        new Promise<boolean>((resolve) => {
            confirmResolveRef.current = resolve;
            setShowProceedModal(true);
        });

    const handleProceedModalChoice = (choice: boolean) => {
        setShowProceedModal(false);
        if (confirmResolveRef.current) {
            confirmResolveRef.current(choice);
            confirmResolveRef.current = null;
        }
    };

    /* ── Load admin users + inspectors ── */
    useEffect(() => {
        const load = async () => {
            try {
                const [ur, ir] = await Promise.all([
                    supabase.from("users").select("full_name, role").order("full_name"),
                    supabase.from("bplo_inspectors").select("full_name").order("full_name"),
                ]);
                const users: InspectorOption[] = (ur.data ?? [])
                    .map((i) => {
                        const name = String(i.full_name ?? "").trim();
                        return name ? { name, source: "user" as const, label: `👤 ${name}` } : null;
                    })
                    .filter(Boolean) as InspectorOption[];

                const inspectors: InspectorOption[] = (ir.data ?? [])
                    .map((i) => {
                        const name = String(i.full_name ?? "").trim();
                        return name ? { name, source: "inspector" as const, label: `🛂 ${name}` } : null;
                    })
                    .filter(Boolean) as InspectorOption[];

                const combined = Array.from(
                    new Map([...users, ...inspectors].map((i) => [i.label, i])).values()
                ).sort((a, b) => a.label.localeCompare(b.label));

                setAdminUsers(combined);
            } catch (err: any) {
                console.error(err);
            }
        };
        load();
    }, []);

    /* ── Toasts ── */
    const addToast = (type: ToastType, message: string) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((p) => [...p, { id, type, message }]);
        window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };

    /* ── Helpers ── */
    const normalizeDigits = (v: any) => String(v ?? "").replace(/\D/g, "");
    const normalizeText = (v: any) => String(v ?? "").trim();

    /* ── Handle field change ── */
    const handleChange = (label: string, value: any) => {
        let v = value;
        if (label === BIN_FIELD) v = normalizeDigits(value).slice(0, 12);
        if (v === "") v = null;
        setForm((p) => ({ ...p, [label]: v }));
        const msg = validateField(label, v);
        setErrors((p) => {
            const c = { ...p };
            if (msg) c[label] = msg;
            else delete c[label];
            return c;
        });
    };

    /* ── Validation ── */
    const validateField = (label: string, value: any): string | null => {
        if (value === null || value === "" || value === undefined) return null;
        const v = String(value).trim();
        const intOnly = [
            BIN_FIELD, "Transaction ID", "Reference No.", "Brgy. Clearance No.",
            "SOA No.", "Transmittal No.", "O.R. No.", "Business Plate No.",
            "Office Zipcode", "Requestor Zipcode", "Year",
        ];
        const decOk = [
            "Capital", "Gross Amount", "Gross Amount Essential",
            "Gross Amount Non-Essential", "Annual Amount", "Amount Paid", "Balance",
        ];
        if (label === BIN_FIELD) {
            if (!/^\d+$/.test(v)) return "BIN must contain only numbers.";
            if (v.length < 9 || v.length > 12) return "BIN must be 9 to 12 digits only.";
            return null;
        }
        if (intOnly.includes(label) && !/^\d+$/.test(v)) return `${label} must contain only numbers.`;
        if (decOk.includes(label) && !/^\d+(\.\d+)?$/.test(v)) return `${label} must be a valid number.`;
        if (label === "Requestor Mobile No.") {
            const d = v.replace(/\D/g, "");
            if (d.length < 7 || d.length > 15) return `${label} looks too short or too long.`;
        }
        if (label === "Requestor Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
            return "Invalid email format.";
        return null;
    };

    /* ── Fetch by BIN ── */
    const fetchByBin = async (bin: string): Promise<BusinessRecord | null> => {
        const { data, error } = await supabase
            .from("business_records")
            .select("*")
            .eq(BIN_FIELD, bin)
            .limit(1)
            .single();
        if (error || !data) return null;
        return data as BusinessRecord;
    };

    /* ── LIVE BIN check with smart-clear ── */
    useEffect(() => {
        const binValue = normalizeDigits(form[BIN_FIELD]);

        // If user changed the BIN away from the confirmed one → clear auto-fill
        if (existingRecord && binValue !== confirmedBinRef.current) {
            setExistingRecord(null);
            setForm((p) => ({ [BIN_FIELD]: p[BIN_FIELD] }));
            setInspectorList([]);
        }

        if (!binValue || binValue.length < 9) {
            setBinChecking(false);
            return;
        }

        // Already confirmed this exact BIN
        if (binValue === confirmedBinRef.current && existingRecord) return;

        const delay = window.setTimeout(async () => {
            setBinChecking(true);
            const found = await fetchByBin(binValue);
            setBinChecking(false);
            if (found) {
                setPendingRecord(found);
                setShowBinConfirm(true);
            }
        }, 500);

        return () => window.clearTimeout(delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form[BIN_FIELD]]);

    /* ── BIN confirm ── */
    const handleBinConfirmYes = () => {
        if (!pendingRecord) return;
        setShowBinConfirm(false);
        const bin = normalizeDigits(pendingRecord[BIN_FIELD]);
        confirmedBinRef.current = bin;
        setExistingRecord(pendingRecord);
        setForm(pendingRecord as Record<string, any>);
        const raw = (pendingRecord as any).assigned_inspector;
        if (Array.isArray(raw)) setInspectorList(raw);
        else if (typeof raw === "string" && raw.trim()) setInspectorList([raw.trim()]);
        else setInspectorList([]);
        setPendingRecord(null);
        addToast("info", "Record auto-filled. Click 'Schedule Inspection' to proceed.");
    };

    const handleBinConfirmNo = () => {
        setShowBinConfirm(false);
        setPendingRecord(null);
        confirmedBinRef.current = "";
    };

    /* ── Body scroll lock ── */
    useEffect(() => {
        document.body.style.overflow = showReview || showBinConfirm || showProceedModal ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [showReview, showBinConfirm, showProceedModal]);

    /* ── Inspector helpers ── */
    const formatInspector = (raw: string) => {
        const c = raw.trim();
        if (!c) return "";
        return c.startsWith("👤 ") || c.startsWith("🛂 ") ? c : `👤 ${c}`;
    };

    const addInspector = (raw: string) => {
        const c = formatInspector(raw);
        if (!c) { setInspectorError("Inspector name is required."); return; }
        if (inspectorList.includes(c)) { setInspectorError("Already added."); return; }
        const updated = [...inspectorList, c];
        setInspectorList(updated);
        setForm((p) => ({ ...p, assigned_inspector: updated }));
        setInspectorError(null);
    };

    const handleInspectorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inspectorInput.trim()) {
            e.preventDefault();
            addInspector(inspectorInput);
            setInspectorInput("");
        }
        if (e.key === "Backspace" && !inspectorInput && inspectorList.length > 0) {
            const nl = inspectorList.slice(0, -1);
            setInspectorList(nl);
            setForm((p) => ({ ...p, assigned_inspector: nl }));
        }
    };

    const removeInspector = (name: string) => {
        const nl = inspectorList.filter((e) => e !== name);
        setInspectorList(nl);
        setForm((p) => ({ ...p, assigned_inspector: nl }));
    };

    /* ── Clean data ── */
    const cleanData = (data: Record<string, any>) => {
        const out: Record<string, any> = {};
        Object.keys(data).forEach((k) => {
            let v = data[k];
            if (typeof v === "string") v = v.trim();
            if (v === "" || v === undefined) v = null;
            if (k === BIN_FIELD && v !== null) v = normalizeDigits(v);
            out[k] = v;
        });
        return out;
    };

    /* ── Validate all ── */
    const validateAll = async (): Promise<Record<string, string>> => {
        const errs: Record<string, string> = {};
        const bin = normalizeText(form[BIN_FIELD]);
        if (!bin) errs[BIN_FIELD] = "BIN is required.";
        else if (!/^\d+$/.test(bin)) errs[BIN_FIELD] = "BIN must contain only numbers.";
        else if (bin.length < 9 || bin.length > 12) errs[BIN_FIELD] = "BIN must be 9 to 12 digits only.";
        if (!normalizeText(form[BUSINESS_NAME_FIELD])) errs[BUSINESS_NAME_FIELD] = "Business Name is required.";
        Object.keys(form).forEach((k) => { const m = validateField(k, form[k]); if (m) errs[k] = m; });
        return errs;
    };

    /* ── Save new record ── */
    const saveRecord = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("business_records")
            .insert([cleanData(form)])
            .select()
            .single();
        setLoading(false);
        if (error) { addToast("error", error.message); return; }
        addToast("success", "Record saved successfully.");
        const saved = data as BusinessRecord;
        const proceed = await openProceedModal();
        if (proceed) { setReviewRecord(saved); setShowReview(true); }
        else { resetForm(); addToast("info", "Form cleared. You can add another record."); }
    };

    /* ── Reset ── */
    const resetForm = () => {
        setForm({});
        setInspectorList([]);
        setInspectorInput("");
        setSelectedAdminInspector("");
        setErrors({});
        setExistingRecord(null);
        confirmedBinRef.current = "";
    };

    /* ── Primary button ── */
    const handlePrimaryButton = async () => {
        if (existingRecord) { setReviewRecord(existingRecord); setShowReview(true); return; }
        const errs = await validateAll();
        if (Object.keys(errs).length > 0) { setErrors(errs); addToast("error", "Please fix the highlighted fields first."); return; }
        await saveRecord();
    };

    /* ── Review save ── */
    const handleReviewSave = async (reviewData: {
        reviewActions: string[]; violations: string[]; assignedInspector?: string;
        scheduledDate?: string; scheduledTime?: string;
        location?: { lat: number; lng: number; accuracy: number };
        photo?: File; photoUrl?: string; reviewedBy?: string;
    }) => {
        if (!reviewRecord) return;
        await supabase.from("business_records").update({
            review_action: reviewData.reviewActions.join(", ") || null,
            violation: reviewData.violations.join(", ") || null,
            status: reviewData.reviewActions.at(-1)?.toLowerCase().replace(/ /g, "_") ?? null,
            review_date: new Date().toISOString(),
            reviewed_by: reviewData.reviewedBy ?? null,
            assigned_inspector: reviewData.assignedInspector ?? null,
            scheduled_date: reviewData.scheduledDate ?? null,
            schedule_time: reviewData.scheduledTime ?? null,
            latitude: reviewData.location?.lat?.toString() ?? null,
            longitude: reviewData.location?.lng?.toString() ?? null,
            accuracy: reviewData.location?.accuracy?.toString() ?? null,
            photo: reviewData.photoUrl ?? null,
        }).eq("Business Identification Number", reviewRecord["Business Identification Number"]);
        setShowReview(false);
        setReviewRecord(null);
        addToast("success", "Review saved successfully.");
        resetForm();
    };

    const isScheduleMode = !!existingRecord;
    const binVal = form[BIN_FIELD] ?? "";
    const binLen = String(binVal).length;

    const binHelperText = binChecking
        ? "Checking BIN..."
        : isScheduleMode
            ? `Existing record — ${existingRecord?.[BUSINESS_NAME_FIELD] ?? ""}`
            : binLen === 0 ? "Enter 9 to 12 digits"
                : binLen < 9 ? `${binLen} / 12 — minimum 9 digits`
                    : `${binLen} / 12 digits`;

    /* ──────────────────────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-slate-50">

            {/* Review modal */}
            {showReview && reviewRecord && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <ReviewModal
                        selectedRow={reviewRecord}
                        showReviewModal
                        isMobile={isMobile}
                        onClose={() => { setShowReview(false); setReviewRecord(null); }}
                        onSave={handleReviewSave}
                        onRecordUpdated={(u) => setReviewRecord(u as BusinessRecord)}
                        onRecordDeleted={() => { setShowReview(false); setReviewRecord(null); router.back(); }}
                    />
                </div>
            )}

            {/* BIN Confirmation Modal */}
            {showBinConfirm && pendingRecord && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-amber-50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <FiSearch className="h-5 w-5 text-amber-700" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">Existing Record Found</h2>
                                <p className="text-xs text-slate-500">BIN already exists in the database</p>
                            </div>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                                <InfoRow icon={<FiFileText />} label="BIN">
                                    <span className="font-mono font-semibold text-slate-800">{normalizeDigits(pendingRecord[BIN_FIELD])}</span>
                                </InfoRow>
                                <InfoRow icon={<FiBriefcase />} label="Business Name">
                                    <span className="font-medium text-slate-800 truncate">{pendingRecord[BUSINESS_NAME_FIELD] ?? "—"}</span>
                                </InfoRow>
                                {pendingRecord["Business Nature"] && (
                                    <InfoRow icon={<FiInfo />} label="Nature">
                                        <span className="text-slate-700">{pendingRecord["Business Nature"]}</span>
                                    </InfoRow>
                                )}
                                {(pendingRecord as any).status && (
                                    <InfoRow icon={<FiShield />} label="Status">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium capitalize">
                                            {(pendingRecord as any).status}
                                        </span>
                                    </InfoRow>
                                )}
                            </div>
                            <p className="text-sm text-slate-600">
                                Do you want to auto-fill the form with this record and proceed to schedule an inspection?
                            </p>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={handleBinConfirmNo} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition">
                                <FiX className="w-4 h-4" /> Cancel
                            </button>
                            <button onClick={handleBinConfirmYes} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-700 transition">
                                <FiEye className="w-4 h-4" /> Auto-fill & Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proceed modal */}
            {showProceedModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => handleProceedModalChoice(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-green-50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <FiCheckCircle className="h-5 w-5 text-green-700" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-slate-800">Record Saved</h2>
                                <p className="text-xs text-slate-500">What would you like to do next?</p>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-slate-600">Open the Review form for this record, or clear the form to add another?</p>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={() => handleProceedModalChoice(false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition">
                                <FiFileText className="w-4 h-4" /> Add another
                            </button>
                            <button onClick={() => handleProceedModalChoice(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-800 text-white text-sm font-medium hover:bg-green-700 transition">
                                <FiCalendar className="w-4 h-4" /> Open Review Form
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm
                        ${t.type === "success" ? "border-green-200 bg-green-50 text-green-900"
                            : t.type === "error" ? "border-red-200 bg-red-50 text-red-800"
                                : t.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-800"
                                    : "border-blue-200 bg-blue-50 text-blue-800"}`}
                    >
                        {t.type === "success" && <FiCheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {t.type === "error" && <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {t.type === "warning" && <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        {t.type === "info" && <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-green-800 transition px-2 py-1 rounded-lg hover:bg-slate-100">
                            <FiArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <span className="text-slate-200 select-none">|</span>
                        <div className="flex items-center gap-2">
                            <FiBriefcase className="w-4 h-4 text-green-800" />
                            <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">Add Business Record</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={resetForm} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition">
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                        <button
                            onClick={handlePrimaryButton}
                            disabled={loading}
                            className={`flex items-center gap-1.5 text-sm font-medium text-white px-4 py-1.5 rounded-lg transition disabled:opacity-60
                                ${isScheduleMode ? "bg-blue-700 hover:bg-blue-600" : "bg-green-800 hover:bg-green-700"}`}
                        >
                            {isScheduleMode
                                ? <><FiCalendar className="w-3.5 h-3.5" /><span>Schedule</span></>
                                : loading ? "Saving..."
                                    : <><FiSave className="w-3.5 h-3.5" /><span>Save</span></>
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* Schedule mode banner */}
            {isScheduleMode && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 py-2">
                    <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-blue-700">
                        <FiInfo className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                            Existing record loaded — BIN <span className="font-mono font-semibold">{normalizeDigits(form[BIN_FIELD])}</span>
                            {existingRecord?.[BUSINESS_NAME_FIELD] ? `, ${existingRecord[BUSINESS_NAME_FIELD]}` : ""}. Fields are read-only. Click <strong>Schedule Inspection</strong> to proceed.
                        </span>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">

                {/* ── Business Information (always open) ── */}
                <FormSection title="Business Information" icon={<FiBriefcase className="w-4 h-4" />} badge="Required" badgeColor="green">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">

                        {/* BIN */}
                        <Field label={BIN_FIELD} required error={errors[BIN_FIELD]} helperText={binHelperText} helperStatus={binChecking ? "checking" : isScheduleMode ? "found" : undefined}>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    {binChecking
                                        ? <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-green-700 rounded-full animate-spin" />
                                        : isScheduleMode ? <FiCheckCircle className="w-3.5 h-3.5 text-blue-500" />
                                            : <FiSearch className="w-3.5 h-3.5" />}
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={binVal}
                                    onChange={(e) => handleChange(BIN_FIELD, e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition
                                        ${errors[BIN_FIELD] ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-200 text-slate-800"
                                            : isScheduleMode ? "border-blue-200 bg-blue-50 text-slate-600"
                                                : "border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-green-200 focus:border-green-400"}`}
                                />
                            </div>
                        </Field>

                        {/* Business Name */}
                        <Field label={BUSINESS_NAME_FIELD} required error={errors[BUSINESS_NAME_FIELD]}>
                            <SimpleInput value={form[BUSINESS_NAME_FIELD] ?? ""} onChange={(v) => handleChange(BUSINESS_NAME_FIELD, v)} placeholder="Enter business name" readOnly={isScheduleMode} error={!!errors[BUSINESS_NAME_FIELD]} />
                        </Field>

                        {/* Business Nature */}
                        <Field label="Business Nature">
                            <SimpleInput value={form["Business Nature"] ?? ""} onChange={(v) => handleChange("Business Nature", v)} placeholder="e.g. Retail, Services" readOnly={isScheduleMode} />
                        </Field>

                        {/* Business Type */}
                        <Field label="Business Type">
                            <SimpleInput value={form["Business Type"] ?? ""} onChange={(v) => handleChange("Business Type", v)} placeholder="e.g. Sole Proprietorship" readOnly={isScheduleMode} />
                        </Field>

                        {/* Inspector — full width */}
                        <div className="sm:col-span-2 lg:col-span-3">
                            <Field label="Assigned Inspector" helperText="Optional. Select from list or type a name and press Enter.">
                                <div className="space-y-2 mt-0.5">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative sm:w-64 flex-shrink-0">
                                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                            <select value={selectedAdminInspector} onChange={(e) => { const v = e.target.value; setSelectedAdminInspector(v); if (v) { addInspector(v); setSelectedAdminInspector(""); } }}
                                                className="w-full border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-white appearance-none transition">
                                                <option value="">Select from list</option>
                                                {adminUsers.map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
                                            </select>
                                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="relative flex-1">
                                            <FiUserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                            <input type="text" value={inspectorInput} onChange={(e) => { setInspectorInput(e.target.value); setInspectorError(null); }} onKeyDown={handleInspectorKeyDown}
                                                placeholder="Or type name, press Enter"
                                                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 bg-white transition" />
                                        </div>
                                    </div>
                                    <div className="min-h-[40px] flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 items-center">
                                        {inspectorList.length === 0
                                            ? <span className="text-xs text-slate-400">No inspector assigned yet</span>
                                            : inspectorList.map((name, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 bg-white border border-green-200 text-green-800 text-xs px-2.5 py-1 rounded-full">
                                                    {name}
                                                    <button type="button" onClick={() => removeInspector(name)} className="text-green-500 hover:text-red-600 transition">
                                                        <FiX className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                    </div>
                                    {inspectorError && <p className="flex items-center gap-1 text-xs text-red-600"><FiAlertCircle className="w-3 h-3" />{inspectorError}</p>}
                                </div>
                            </Field>
                        </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4 mt-4 border-t border-slate-100">
                        <button onClick={resetForm} className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-red-700 hover:border-red-200 transition">
                            <FiTrash2 className="w-3.5 h-3.5" /> Clear Form
                        </button>
                        <button onClick={() => router.back()} className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition">
                            <FiX className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button onClick={handlePrimaryButton} disabled={loading}
                            className={`flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-60
                                ${isScheduleMode ? "bg-blue-700 hover:bg-blue-600" : "bg-green-800 hover:bg-green-700"}`}>
                            {isScheduleMode
                                ? <><FiCalendar className="w-3.5 h-3.5" /> Schedule Inspection</>
                                : loading ? "Saving..." : <><FiSave className="w-3.5 h-3.5" /> Save Record</>}
                        </button>
                    </div>
                </FormSection>

                {/* ── Collapsible sections ── */}
                <CollapsibleSection title="Incharge Information" icon={<FiUser className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {([
                            ["Incharge First Name", "text", "First name"],
                            ["Incharge Middle Name", "text", "Middle name"],
                            ["Incharge Last Name", "text", "Last name"],
                            ["Incharge Extension Name", "text", "e.g. Jr., III"],
                            ["Incharge Sex", "text", "Male / Female"],
                            ["Citizenship", "text", "e.g. Filipino"],
                            ["Birth Date", "date", ""],
                        ] as [string, string, string][]).map(([label, type, placeholder]) => (
                            <Field key={label} label={label}>
                                <SimpleInput type={type} value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} placeholder={placeholder} readOnly={isScheduleMode} />
                            </Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Office Address" icon={<FiMapPin className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {([
                            ["Office Street", "Street address"],
                            ["Office Region", "Region"],
                            ["Office Province", "Province"],
                            ["Office Municipality", "Municipality / City"],
                            ["Office Barangay", "Barangay"],
                            ["Office Zipcode", "Zipcode"],
                        ] as [string, string][]).map(([label, placeholder]) => (
                            <Field key={label} label={label}>
                                <SimpleInput value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} placeholder={placeholder} readOnly={isScheduleMode} />
                            </Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Financial Information" icon={<FiDollarSign className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {["Capital", "Gross Amount", "Gross Amount Essential", "Gross Amount Non-Essential"].map((label) => (
                            <Field key={label} label={label} error={errors[label]}>
                                <SimpleInput type="number" value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} placeholder="0.00" readOnly={isScheduleMode} error={!!errors[label]} />
                            </Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Requestor Information" icon={<FiUserPlus className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {([
                            ["Requestor First Name", "text", "First name"],
                            ["Requestor Middle Name", "text", "Middle name"],
                            ["Requestor Last Name", "text", "Last name"],
                            ["Requestor Extension Name", "text", "e.g. Jr."],
                            ["Requestor Email", "email", "email@example.com"],
                            ["Requestor Mobile No.", "tel", "09XX-XXX-XXXX"],
                            ["Requestor Sex", "text", "Male / Female"],
                            ["Civil Status", "text", "Single / Married"],
                            ["Requestor Street", "text", "Street address"],
                            ["Requestor Province", "text", "Province"],
                            ["Requestor Municipality", "text", "Municipality / City"],
                            ["Requestor Barangay", "text", "Barangay"],
                            ["Requestor Zipcode", "text", "Zipcode"],
                        ] as [string, string, string][]).map(([label, type, placeholder]) => (
                            <Field key={label} label={label} error={errors[label]}>
                                <SimpleInput type={type} value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} placeholder={placeholder} readOnly={isScheduleMode} error={!!errors[label]} />
                            </Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Transaction Information" icon={<FiFileText className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {["Transaction ID", "Reference No.", "Module Type", "Transaction Type", "SOA No.", "Term",
                            "SITE Transaction Status", "CORE Transaction Status", "Reject Remarks"].map((label) => (
                            <Field key={label} label={label} error={errors[label]}>
                                <SimpleInput value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} readOnly={isScheduleMode} error={!!errors[label]} />
                            </Field>
                        ))}
                        <Field label="Transaction Date">
                            <SimpleInput type="datetime-local" value={form["Transaction Date"] ?? ""} onChange={(v) => handleChange("Transaction Date", v)} readOnly={isScheduleMode} />
                        </Field>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Payment Information" icon={<FiCreditCard className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {["Annual Amount", "Amount Paid", "Balance"].map((label) => (
                            <Field key={label} label={label} error={errors[label]}>
                                <SimpleInput type="number" value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} placeholder="0.00" readOnly={isScheduleMode} error={!!errors[label]} />
                            </Field>
                        ))}
                        <Field label="Payment Type"><SimpleInput value={form["Payment Type"] ?? ""} onChange={(v) => handleChange("Payment Type", v)} readOnly={isScheduleMode} /></Field>
                        <Field label="Payment Date"><SimpleInput type="date" value={form["Payment Date"] ?? ""} onChange={(v) => handleChange("Payment Date", v)} readOnly={isScheduleMode} /></Field>
                        <Field label="O.R. No." error={errors["O.R. No."]}><SimpleInput value={form["O.R. No."] ?? ""} onChange={(v) => handleChange("O.R. No.", v)} readOnly={isScheduleMode} error={!!errors["O.R. No."]} /></Field>
                        <Field label="O.R. Date"><SimpleInput type="date" value={form["O.R. Date"] ?? ""} onChange={(v) => handleChange("O.R. Date", v)} readOnly={isScheduleMode} /></Field>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Permit & Clearance" icon={<FiShield className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {["Brgy. Clearance Status", "Brgy. Clearance No.", "Permit No.", "Business Plate No."].map((label) => (
                            <Field key={label} label={label} error={errors[label]}>
                                <SimpleInput value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} readOnly={isScheduleMode} error={!!errors[label]} />
                            </Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Closure & Retirement" icon={<FiSlash className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        <Field label="Actual Closure Date"><SimpleInput type="date" value={form["Actual Closure Date"] ?? ""} onChange={(v) => handleChange("Actual Closure Date", v)} readOnly={isScheduleMode} /></Field>
                        {["Retirement Reason", "Source Type"].map((label) => (
                            <Field key={label} label={label}><SimpleInput value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} readOnly={isScheduleMode} /></Field>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Inspection & Review" icon={<FiClipboard className="w-4 h-4" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                        {["violation", "review_action", "reviewed_by", "status"].map((label) => (
                            <Field key={label} label={label}><SimpleInput value={form[label] ?? ""} onChange={(v) => handleChange(label, v)} readOnly={isScheduleMode} /></Field>
                        ))}
                        <Field label="review_date"><SimpleInput type="date" value={form["review_date"] ?? ""} onChange={(v) => handleChange("review_date", v)} readOnly={isScheduleMode} /></Field>
                        <Field label="scheduled_date"><SimpleInput type="date" value={form["scheduled_date"] ?? ""} onChange={(v) => handleChange("scheduled_date", v)} readOnly={isScheduleMode} /></Field>
                    </div>
                </CollapsibleSection>

            </main>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  UI PRIMITIVES                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-400 w-4 flex-shrink-0">{icon}</span>
            <span className="text-xs text-slate-500 w-28 flex-shrink-0">{label}</span>
            <span className="text-sm truncate">{children}</span>
        </div>
    );
}

function FormSection({
    title, icon, badge, badgeColor = "slate", children,
}: {
    title: string; icon: React.ReactNode; badge?: string;
    badgeColor?: "green" | "slate" | "amber" | "blue"; children: React.ReactNode;
}) {
    const colors: Record<string, string> = {
        green: "bg-green-100 text-green-800",
        slate: "bg-slate-100 text-slate-600",
        amber: "bg-amber-100 text-amber-800",
        blue: "bg-blue-100 text-blue-700",
    };
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="text-green-700">{icon}</span>
                    {title}
                </div>
                {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[badgeColor]}`}>{badge}</span>}
            </div>
            <div className="px-5 py-5">{children}</div>
        </div>
    );
}

function CollapsibleSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <details className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden group">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer list-none hover:bg-slate-50 transition select-none">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span className="text-slate-400">{icon}</span>
                    {title}
                </div>
                <FiChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>
        </details>
    );
}

function Field({
    label, children, error, helperText, required, helperStatus,
}: {
    label: string; children: React.ReactNode; error?: string;
    helperText?: string; required?: boolean;
    helperStatus?: "checking" | "found";
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {helperText && !error && (
                <p className={`text-xs flex items-center gap-1
                    ${helperStatus === "checking" ? "text-amber-600"
                        : helperStatus === "found" ? "text-blue-600"
                            : "text-slate-400"}`}>
                    {helperStatus === "checking" && <div className="w-2.5 h-2.5 border border-amber-400 border-t-transparent rounded-full animate-spin" />}
                    {helperStatus === "found" && <FiCheckCircle className="w-2.5 h-2.5" />}
                    {helperText}
                </p>
            )}
            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3 flex-shrink-0" />{error}
                </p>
            )}
        </div>
    );
}

function SimpleInput({
    value, onChange, type = "text", placeholder, readOnly = false, error = false,
}: {
    value: any; onChange: (v: string) => void; type?: string;
    placeholder?: string; readOnly?: boolean; error?: boolean;
}) {
    return (
        <input
            type={type}
            value={value ?? ""}
            onChange={(e) => !readOnly && onChange(e.target.value)}
            placeholder={readOnly ? undefined : placeholder}
            readOnly={readOnly}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition
                ${readOnly
                    ? "bg-slate-50 border-slate-100 text-slate-500 cursor-default"
                    : error
                        ? "bg-red-50 border-red-300 text-slate-800 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                        : "bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-green-200 focus:border-green-400"
                }`}
        />
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ManualAddBusiness() {
    return (
        <ProtectedRoute requiredRole="staff">
            <ManualAddBusinessContent />
        </ProtectedRoute>
    );
}
