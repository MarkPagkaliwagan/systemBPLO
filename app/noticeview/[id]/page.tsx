import NoticePage from "./NoticePage";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";

function safeParse(value: any) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value ?? {};
  } catch {
    return {};
  }
}

function NoticeNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
            <FiAlertCircle className="text-red-600 text-2xl" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-xl font-semibold text-slate-900">
  No notice available
</h1>

<p className="mt-2 text-center text-sm text-slate-600">
  There’s currently no notice form linked to this record. You may go back or check again later.
</p>

        <div className="mt-6 flex gap-3">
          <Link
            href="/Admin/Compliance/Dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            <FiArrowLeft />
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: row, error } = await supabase
    .from("notice_forms")
    .select("*")
    .eq("violation_id", Number(id))
    .maybeSingle();

  if (error || !row) {
    console.log("ID:", id);
    console.log("ERROR:", error);
    return <NoticeNotFound />;
  }

  const parsedData = safeParse(row.data);
  const parsedSignatures = safeParse(row.signatures);

  const initialData = {
    notice_no: row.notice_no ?? "",
    type: parsedData.type ?? "",
    date: parsedData.date ?? "",

    business_name: row.taxpayer ?? "",
    address: row.address ?? "",
    nature_of_business: row.nature ?? "",

    violation: parsedData.violation === true,
    otherViolation: parsedData.otherViolation ?? "",

    rented: parsedData.rented === true,
    owner: parsedData.owner ?? "",
    rent: parsedData.rent ?? "",
    ownerAddress: parsedData.ownerAddress ?? "",
    contact: parsedData.contact ?? "",

    inspectedBy: parsedData.inspectedBy ?? "",
    receivedBy: parsedData.receivedBy ?? "",
    notedBy: parsedData.notedBy ?? "",
    receivedAt: parsedData.receivedAt ?? "",

    actionTaken: parsedData.actionTaken ?? "",

    signatures: parsedSignatures ?? {},
  };

  return <NoticePage initialData={initialData} />;
}