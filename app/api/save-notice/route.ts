import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

const { error } = await supabase
  .from("notice_forms")
  .insert([
    {
      violation_id: body.initialData.id,
      taxpayer: body.taxpayer,
      address: body.address,
      nature: body.nature,
      notice_no: body.noticeNo,
      data: body,
      signatures: body.signatures,
    },
  ]);

if (error) {
  return NextResponse.json({ error: error.message });
}

// ✅ update ONLY if success
await supabase
  .from("business_violations")
  .update({ signed: true })
  .eq("id", body.initialData.id);

return NextResponse.json({ success: true });
}