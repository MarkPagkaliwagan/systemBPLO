import NoticePage from "./NoticePage";
import { createClient } from "@supabase/supabase-js";

export default async function Page({
  params,
  searchParams, // ✅ ADD THIS
}: {
  params: Promise<{ id: string }>;
  searchParams: { token?: string }; // ✅ ADD THIS
}) {
  const { id } = await params;
  const token = searchParams.token; // ✅ GET TOKEN

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", Number(id))
    .single();

  // ❌ IF NO DATA
  if (error || !data) {
    return <div>No data found</div>;
  }

  // 🚫 SECURITY CHECK (ITO PINAKA IMPORTANT)
  if (!token || data.access_token !== token) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>🚫 Unauthorized Access</h2>
        <p>This link is invalid or not allowed.</p>
      </div>
    );
  }

  // ✅ OKAY NA
  return <NoticePage initialData={data} />;
}