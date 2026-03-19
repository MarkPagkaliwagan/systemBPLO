"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
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
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BIN_FIELD = "Business Identification Number";
const REQUIRED_FIELDS = [BIN_FIELD, "Business Name"];
const BIN_MAX_LENGTH = 20; // change if you have a fixed BIN length in your database

export default function ManualAddBusiness() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [inspectorInput, setInspectorInput] = useState<string>("");
  const [inspectorList, setInspectorList] = useState<string[]>([]);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [binChecking, setBinChecking] = useState(false);

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
  };

  const setFieldError = (field: string, message: string | null) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const sanitizeValue = (label: string, rawValue: any) => {
    let value = rawValue == null ? "" : String(rawValue);

    if (label === BIN_FIELD) {
      return value.replace(/\D/g, "").slice(0, BIN_MAX_LENGTH);
    }

    const integerOnlyLabels = [
      BIN_FIELD,
      "Transaction ID",
      "Reference No.",
      "Brgy. Clearance No.",
      "SOA No.",
      "Transmittal No.",
      "O.R. No.",
      "Business Plate No.",
      "Office Zipcode",
      "Requestor Zipcode",
      "Year",
    ];

    const decimalAllowedLabels = [
      "Capital",
      "Gross Amount",
      "Gross Amount Essential",
      "Gross Amount Non-Essential",
      "Annual Amount",
      "Amount Paid",
      "Balance",
    ];

    if (integerOnlyLabels.includes(label)) {
      return value.replace(/\D/g, "");
    }

    if (decimalAllowedLabels.includes(label)) {
      const cleaned = value.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length <= 1) return cleaned;
      return `${parts[0]}.${parts.slice(1).join("")}`;
    }

    return value;
  };

  const validateField = (label: string, value: any): string | null => {
    const v = value === null || value === undefined ? "" : String(value).trim();

    if (REQUIRED_FIELDS.includes(label) && !v) {
      return `${label} is required`;
    }

    if (!v) return null;

    if (label === BIN_FIELD) {
      if (!/^\d+$/.test(v)) return "BIN must contain only numbers";
      if (v.length < 6) return "BIN looks too short";
      if (v.length > BIN_MAX_LENGTH) return `BIN must be at most ${BIN_MAX_LENGTH} digits`;
      return null;
    }

    const integerOnlyLabels = [
      "Transaction ID",
      "Reference No.",
      "Brgy. Clearance No.",
      "SOA No.",
      "Transmittal No.",
      "O.R. No.",
      "Business Plate No.",
      "Office Zipcode",
      "Requestor Zipcode",
      "Year",
    ];

    const decimalAllowedLabels = [
      "Capital",
      "Gross Amount",
      "Gross Amount Essential",
      "Gross Amount Non-Essential",
      "Annual Amount",
      "Amount Paid",
      "Balance",
    ];

    const phoneLabels = ["Requestor Mobile No."];
    const emailLabels = ["Requestor Email"];

    if (integerOnlyLabels.includes(label)) {
      if (!/^\d+$/.test(v)) return `${label} must contain only numbers`;
      return null;
    }

    if (decimalAllowedLabels.includes(label)) {
      if (!/^\d+(\.\d+)?$/.test(v)) return `${label} must be a valid number`;
      return null;
    }

    if (phoneLabels.includes(label)) {
      const digits = v.replace(/\D/g, "");
      if (!/^\d+$/.test(digits)) return `${label} must contain only digits`;
      if (digits.length < 7 || digits.length > 15) return `${label} looks too short/long`;
      return null;
    }

    if (emailLabels.includes(label)) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(v)) return `Invalid email format`;
      return null;
    }

    return null;
  };

  const handleChange = (label: string, value: any) => {
    const sanitized = sanitizeValue(label, value);
    const finalValue = sanitized === "" ? "" : sanitized;

    setForm((prev) => ({
      ...prev,
      [label]: finalValue,
    }));

    if (label === BIN_FIELD) {
      const basicError = validateField(label, finalValue);
      setFieldError(label, basicError);
      return;
    }

    const validationMessage = validateField(label, finalValue);
    setFieldError(label, validationMessage);
  };

  const validateAll = (): Record<string, string> => {
    const foundErrors: Record<string, string> = {};

    Object.keys(form).forEach((key) => {
      const msg = validateField(key, form[key]);
      if (msg) foundErrors[key] = msg;
    });

    inspectorList.forEach((email, idx) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) {
        foundErrors[`assigned_inspector[${idx}]`] = `Invalid inspector email: ${email}`;
      }
    });

    return foundErrors;
  };

  const checkDuplicateBIN = async (bin: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("business_records")
      .select(BIN_FIELD)
      .eq(BIN_FIELD, bin)
      .limit(1);

    if (error) {
      throw error;
    }

    return (data?.length ?? 0) > 0;
  };

  useEffect(() => {
    const bin = String(form[BIN_FIELD] ?? "").trim();

    if (!bin) {
      setFieldError(BIN_FIELD, validateField(BIN_FIELD, bin));
      setBinChecking(false);
      return;
    }

    const timer = setTimeout(async () => {
      const basicError = validateField(BIN_FIELD, bin);
      if (basicError) {
        setFieldError(BIN_FIELD, basicError);
        setBinChecking(false);
        return;
      }

      setBinChecking(true);
      try {
        const duplicate = await checkDuplicateBIN(bin);
        if (duplicate) {
          setFieldError(BIN_FIELD, "This BIN already exists");
        } else {
          setFieldError(BIN_FIELD, null);
        }
      } catch {
        setFieldError(BIN_FIELD, "Could not verify BIN right now");
      } finally {
        setBinChecking(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [form[BIN_FIELD]]);

  const handleInspectorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inspectorInput.trim() !== "") {
      e.preventDefault();
      const candidate = inspectorInput.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!re.test(candidate)) {
        setInspectorError("Invalid email format for inspector");
        return;
      }

      setInspectorError(null);

      if (!inspectorList.includes(candidate)) {
        const updatedList = [...inspectorList, candidate];
        setInspectorList(updatedList);
        setForm((prev) => ({
          ...prev,
          assigned_inspector: updatedList,
        }));
      }

      setInspectorInput("");
    }

    if (e.key === "Backspace" && inspectorInput === "" && inspectorList.length > 0) {
      const newList = [...inspectorList];
      newList.pop();
      setInspectorList(newList);
      setForm((prev) => ({
        ...prev,
        assigned_inspector: newList,
      }));
    }
  };

  const removeInspector = (email: string) => {
    const newList = inspectorList.filter((e) => e !== email);
    setInspectorList(newList);
    setForm((prev) => ({
      ...prev,
      assigned_inspector: newList,
    }));
  };

  const cleanData = (data: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value === "" || value === undefined) cleaned[key] = null;
      else cleaned[key] = value;
    });
    return cleaned;
  };

  const saveRecord = async () => {
    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      showNotification("error", "Please fix the highlighted fields first.");
      return;
    }

    const bin = String(form[BIN_FIELD] ?? "").trim();
    if (!bin) {
      setFieldError(BIN_FIELD, "Business Identification Number is required");
      showNotification("error", "BIN is required.");
      return;
    }

    setLoading(true);

    try {
      const duplicate = await checkDuplicateBIN(bin);
      if (duplicate) {
        setFieldError(BIN_FIELD, "This BIN already exists");
        showNotification("error", "Duplicate BIN found.");
        setLoading(false);
        return;
      }

      const payload = cleanData(form);

      const { error } = await supabase.from("business_records").insert([payload]);

      if (error) {
        setLoading(false);
        showNotification("error", error.message);
        return;
      }

      setLoading(false);
      showNotification("success", "Record saved successfully.");
      setTimeout(() => {
        router.push("/Admin/Inspection/management/review");
      }, 900);
    } catch (err: any) {
      setLoading(false);
      showNotification("error", err?.message ?? "Something went wrong while saving.");
    }
  };

  const handleSaveClick = () => {
    const allErrors = validateAll();
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      showNotification("error", "Please fix the highlighted fields first.");
      return;
    }

    const bin = String(form[BIN_FIELD] ?? "").trim();
    if (!bin) {
      setFieldError(BIN_FIELD, "Business Identification Number is required");
      showNotification("error", "BIN is required.");
      return;
    }

    saveRecord();
  };

  const getValue = (label: string) => form[label] ?? "";

  return (
    <div className="min-h-screen bg-green-50">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg ${
            notification.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : notification.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-white text-green-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-900" />
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

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
        {/* QUICK ADD - MOST NEEDED FIELDS */}
        <Section title="Quick Add Business" icon={<FiBriefcase />} accent="green">
          <Input
            label={BIN_FIELD}
            value={getValue(BIN_FIELD)}
            onChange={handleChange}
            error={errors[BIN_FIELD]}
            type="text"
            inputMode="numeric"
            maxLength={BIN_MAX_LENGTH}
            placeholder="Type BIN only"
          />
          <Input
            label="Business Name"
            value={getValue("Business Name")}
            onChange={handleChange}
            error={errors["Business Name"]}
            placeholder="Type business name"
          />
          <Input
            label="Business Type"
            value={getValue("Business Type")}
            onChange={handleChange}
            error={errors["Business Type"]}
            placeholder="Optional"
          />
          <Input
            label="Trade Name"
            value={getValue("Trade Name")}
            onChange={handleChange}
            error={errors["Trade Name"]}
            placeholder="Optional"
          />
        </Section>

        {/* OPTIONAL SECTIONS */}
        <OptionalSection title="Incharge Information" icon={<FiUser />}>
          <Input label="Incharge First Name" value={getValue("Incharge First Name")} onChange={handleChange} error={errors["Incharge First Name"]} />
          <Input label="Incharge Middle Name" value={getValue("Incharge Middle Name")} onChange={handleChange} error={errors["Incharge Middle Name"]} />
          <Input label="Incharge Last Name" value={getValue("Incharge Last Name")} onChange={handleChange} error={errors["Incharge Last Name"]} />
          <Input label="Incharge Extension Name" value={getValue("Incharge Extension Name")} onChange={handleChange} error={errors["Incharge Extension Name"]} />
          <Input label="Incharge Sex" value={getValue("Incharge Sex")} onChange={handleChange} error={errors["Incharge Sex"]} />
          <Input label="Citizenship" value={getValue("Citizenship")} onChange={handleChange} error={errors["Citizenship"]} />
          <Input label="Birth Date" type="date" value={getValue("Birth Date")} onChange={handleChange} error={errors["Birth Date"]} />
        </OptionalSection>

        <OptionalSection title="Office Address" icon={<FiMapPin />}>
          <Input label="Office Street" value={getValue("Office Street")} onChange={handleChange} error={errors["Office Street"]} />
          <Input label="Office Region" value={getValue("Office Region")} onChange={handleChange} error={errors["Office Region"]} />
          <Input label="Office Province" value={getValue("Office Province")} onChange={handleChange} error={errors["Office Province"]} />
          <Input label="Office Municipality" value={getValue("Office Municipality")} onChange={handleChange} error={errors["Office Municipality"]} />
          <Input label="Office Barangay" value={getValue("Office Barangay")} onChange={handleChange} error={errors["Office Barangay"]} />
          <Input label="Office Zipcode" value={getValue("Office Zipcode")} onChange={handleChange} error={errors["Office Zipcode"]} />
        </OptionalSection>

        <OptionalSection title="Financial Information" icon={<FiDollarSign />}>
          <Input label="Capital" type="number" value={getValue("Capital")} onChange={handleChange} error={errors["Capital"]} />
          <Input label="Gross Amount" type="number" value={getValue("Gross Amount")} onChange={handleChange} error={errors["Gross Amount"]} />
          <Input label="Gross Amount Essential" type="number" value={getValue("Gross Amount Essential")} onChange={handleChange} error={errors["Gross Amount Essential"]} />
          <Input label="Gross Amount Non-Essential" type="number" value={getValue("Gross Amount Non-Essential")} onChange={handleChange} error={errors["Gross Amount Non-Essential"]} />
        </OptionalSection>

        <OptionalSection title="Requestor Information" icon={<FiUser />}>
          <Input label="Requestor First Name" value={getValue("Requestor First Name")} onChange={handleChange} error={errors["Requestor First Name"]} />
          <Input label="Requestor Middle Name" value={getValue("Requestor Middle Name")} onChange={handleChange} error={errors["Requestor Middle Name"]} />
          <Input label="Requestor Last Name" value={getValue("Requestor Last Name")} onChange={handleChange} error={errors["Requestor Last Name"]} />
          <Input label="Requestor Extension Name" value={getValue("Requestor Extension Name")} onChange={handleChange} error={errors["Requestor Extension Name"]} />
          <Input label="Requestor Email" value={getValue("Requestor Email")} onChange={handleChange} error={errors["Requestor Email"]} />
          <Input label="Requestor Mobile No." value={getValue("Requestor Mobile No.")} onChange={handleChange} error={errors["Requestor Mobile No."]} />
          <Input label="Requestor Sex" value={getValue("Requestor Sex")} onChange={handleChange} error={errors["Requestor Sex"]} />
          <Input label="Civil Status" value={getValue("Civil Status")} onChange={handleChange} error={errors["Civil Status"]} />
          <Input label="Requestor Street" value={getValue("Requestor Street")} onChange={handleChange} error={errors["Requestor Street"]} />
          <Input label="Requestor Province" value={getValue("Requestor Province")} onChange={handleChange} error={errors["Requestor Province"]} />
          <Input label="Requestor Municipality" value={getValue("Requestor Municipality")} onChange={handleChange} error={errors["Requestor Municipality"]} />
          <Input label="Requestor Barangay" value={getValue("Requestor Barangay")} onChange={handleChange} error={errors["Requestor Barangay"]} />
          <Input label="Requestor Zipcode" value={getValue("Requestor Zipcode")} onChange={handleChange} error={errors["Requestor Zipcode"]} />
        </OptionalSection>

        <OptionalSection title="Transaction Information" icon={<FiFileText />}>
          <Input label="Transaction ID" value={getValue("Transaction ID")} onChange={handleChange} error={errors["Transaction ID"]} />
          <Input label="Reference No." value={getValue("Reference No.")} onChange={handleChange} error={errors["Reference No."]} />
          <Input label="Module Type" value={getValue("Module Type")} onChange={handleChange} error={errors["Module Type"]} />
          <Input label="Transaction Type" value={getValue("Transaction Type")} onChange={handleChange} error={errors["Transaction Type"]} />
          <Input label="Transaction Date" type="datetime-local" value={getValue("Transaction Date")} onChange={handleChange} error={errors["Transaction Date"]} />
          <Input label="SITE Transaction Status" value={getValue("SITE Transaction Status")} onChange={handleChange} error={errors["SITE Transaction Status"]} />
          <Input label="CORE Transaction Status" value={getValue("CORE Transaction Status")} onChange={handleChange} error={errors["CORE Transaction Status"]} />
          <Input label="Reject Remarks" value={getValue("Reject Remarks")} onChange={handleChange} error={errors["Reject Remarks"]} />
          <Input label="SOA No." value={getValue("SOA No.")} onChange={handleChange} error={errors["SOA No."]} />
          <Input label="Term" value={getValue("Term")} onChange={handleChange} error={errors["Term"]} />
        </OptionalSection>

        <OptionalSection title="Payment Information" icon={<FiClipboard />}>
          <Input label="Annual Amount" type="number" value={getValue("Annual Amount")} onChange={handleChange} error={errors["Annual Amount"]} />
          <Input label="Amount Paid" type="number" value={getValue("Amount Paid")} onChange={handleChange} error={errors["Amount Paid"]} />
          <Input label="Balance" type="number" value={getValue("Balance")} onChange={handleChange} error={errors["Balance"]} />
          <Input label="Payment Type" value={getValue("Payment Type")} onChange={handleChange} error={errors["Payment Type"]} />
          <Input label="Payment Date" type="date" value={getValue("Payment Date")} onChange={handleChange} error={errors["Payment Date"]} />
          <Input label="O.R. No." value={getValue("O.R. No.")} onChange={handleChange} error={errors["O.R. No."]} />
          <Input label="O.R. Date" type="date" value={getValue("O.R. Date")} onChange={handleChange} error={errors["O.R. Date"]} />
        </OptionalSection>

        <OptionalSection title="Permit / Clearance" icon={<FiCheckCircle />}>
          <Input label="Brgy. Clearance Status" value={getValue("Brgy. Clearance Status")} onChange={handleChange} error={errors["Brgy. Clearance Status"]} />
          <Input label="Brgy. Clearance No." value={getValue("Brgy. Clearance No.")} onChange={handleChange} error={errors["Brgy. Clearance No."]} />
          <Input label="Permit No." value={getValue("Permit No.")} onChange={handleChange} error={errors["Permit No."]} />
          <Input label="Business Plate No." value={getValue("Business Plate No.")} onChange={handleChange} error={errors["Business Plate No."]} />
        </OptionalSection>

        <OptionalSection title="Closure / Retirement" icon={<FiCalendar />}>
          <Input label="Actual Closure Date" type="date" value={getValue("Actual Closure Date")} onChange={handleChange} error={errors["Actual Closure Date"]} />
          <Input label="Retirement Reason" value={getValue("Retirement Reason")} onChange={handleChange} error={errors["Retirement Reason"]} />
          <Input label="Source Type" value={getValue("Source Type")} onChange={handleChange} error={errors["Source Type"]} />
        </OptionalSection>

        <OptionalSection title="Inspection / Review" icon={<FiClipboard />}>
          <Input label="violation" value={getValue("violation")} onChange={handleChange} error={errors["violation"]} />
          <Input label="review_action" value={getValue("review_action")} onChange={handleChange} error={errors["review_action"]} />
          <Input label="review_date" type="date" value={getValue("review_date")} onChange={handleChange} error={errors["review_date"]} />
          <Input label="reviewed_by" value={getValue("reviewed_by")} onChange={handleChange} error={errors["reviewed_by"]} />
          <Input label="status" value={getValue("status")} onChange={handleChange} error={errors["status"]} />

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">assigned_inspector</label>
            <div
              className={`flex flex-wrap gap-2 border rounded-lg px-2 py-2 min-h-[44px] items-center focus-within:ring-2 ${
                Object.keys(errors).some((k) => k.startsWith("assigned_inspector"))
                  ? "border-red-400 ring-1 ring-red-400"
                  : "border-gray-200 focus-within:ring-green-900"
              }`}
            >
              {inspectorList.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-green-100 text-green-900 px-2 py-1 rounded-full text-xs sm:text-sm"
                >
                  {email}
                  <button type="button" className="ml-1" onClick={() => removeInspector(email)}>
                    ×
                  </button>
                </div>
              ))}

              <input
                type="text"
                value={inspectorInput}
                onChange={(e) => {
                  setInspectorInput(e.target.value);
                  if (e.target.value.trim() === "") {
                    setInspectorError(null);
                  } else {
                    const maybe = e.target.value.trim();
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    setInspectorError(re.test(maybe) ? null : "Invalid email format");
                  }
                }}
                onKeyDown={handleInspectorKeyDown}
                placeholder="Type and press Enter"
                className="flex-1 outline-none border-none text-black px-1 py-1 min-w-[100px] sm:min-w-[120px]"
              />
            </div>
            {inspectorError && <p className="text-xs text-red-600 mt-1">{inspectorError}</p>}
          </div>

          <Input label="scheduled_date" type="date" value={getValue("scheduled_date")} onChange={handleChange} error={errors["scheduled_date"]} />
        </OptionalSection>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-100 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={loading}
            className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: any;
}) {
  return (
    <div className="bg-white border border-green-100 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 sm:mb-5 font-semibold text-green-900">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function OptionalSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: any;
}) {
  return (
    <details className="bg-white border border-green-100 rounded-xl shadow-sm">
      <summary className="cursor-pointer list-none px-4 sm:px-6 py-4 flex items-center justify-between gap-3 text-green-900 font-semibold">
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <FiChevronDown className="h-5 w-5 shrink-0" />
      </summary>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>
    </details>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  inputMode,
  maxLength,
}: {
  label: string;
  type?: string;
  value: any;
  onChange: any;
  error?: string;
  placeholder?: string;
  inputMode?: any;
  maxLength?: number;
}) {
  const isError = !!error;

  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(label, e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`border rounded-lg px-3 py-2 text-black outline-none w-full focus:ring-2 ${
          isError
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-200 focus:ring-green-900"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}