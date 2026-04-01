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
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !data) {
    return <div>No data found</div>;
  }

  const savedData = {
    ...data,
    submitted_data:
      safeParse(data.submitted_data) ||
      safeParse(data.form_data) ||
      safeParse(data.data) ||
      safeParse(data.notice_data),
  };

  return <NoticePage initialData={savedData} />;
}