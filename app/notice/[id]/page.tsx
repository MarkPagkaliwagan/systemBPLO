import NoticePage from "./NoticePage";
import { createClient } from "@supabase/supabase-js";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ IMPORTANT

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

  return <NoticePage initialData={data} />;
}