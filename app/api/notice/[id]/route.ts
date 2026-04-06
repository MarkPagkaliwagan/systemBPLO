import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ await is REQUIRED

  const { data, error } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", id); // ✅ convert to number

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json(data);
}