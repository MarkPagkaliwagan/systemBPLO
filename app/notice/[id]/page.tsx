import NoticePage from "./NoticePage"; // your form file
import { createClient } from "@supabase/supabase-js";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", params.id)
    .single();

  return <NoticePage initialData={data} />;
}