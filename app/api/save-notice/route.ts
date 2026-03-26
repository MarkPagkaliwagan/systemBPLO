import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body); // ✅ debug

    // ✅ SAFE CHECK
    const violationId = body?.initialData?.id;

    if (!violationId) {
      return NextResponse.json(
        { error: "Missing initialData.id" },
        { status: 400 }
      );
    }

    // ✅ INSERT
    const { error: insertError } = await supabase
      .from("notice_forms")
      .insert([
        {
          violation_id: violationId,
          taxpayer: body.taxpayer,
          address: body.address,
          nature: body.nature,
          notice_no: body.noticeNo,
          data: body,
          signatures: body.signatures,
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message });
    }

    // ✅ UPDATE AFTER INSERT
    const { error: updateError } = await supabase
      .from("business_violations")
      .update({ signed: true })
      .eq("id", violationId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}