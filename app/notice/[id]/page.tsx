import NoticePage from "./NoticePage";
import { createClient } from "@supabase/supabase-js";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const violationId = id;

  if (Number.isNaN(violationId)) {
    return <div>No valid violation ID found</div>;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [violationRes, noticeRes] = await Promise.all([
    supabase.from("business_violations").select("*").eq("id", violationId).single(),
    supabase
      .from("notice_forms")
      .select("*")
      .eq("violation_id", violationId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const { data: violation, error: violationError } = violationRes;
  const { data: noticeList, error: noticeError } = noticeRes;

  if (violationError || !violation) {
    return <div>No data found</div>;
  }

  const savedNotice = noticeList?.[0] ?? null;

  if (noticeError) {
    console.error("Notice fetch error:", noticeError.message);
  }

  return <NoticePage initialData={violation} savedNotice={savedNotice} />;
}