import NoticePage from "./NoticePage";
import { createClient } from "@supabase/supabase-js";

function safeParse(value: any) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value ?? {};
  } catch {
    return {};
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // 🔥 FIX HERE

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: row, error } = await supabase
  .from("notice_forms")
  .select("*")
  .eq("violation_id", Number(id)) // ✅ FIX
  .maybeSingle();

  if (error || !row) {
    console.log("ID:", id);
    console.log("ERROR:", error);
    return <div className="p-6">No notice form found.</div>;
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