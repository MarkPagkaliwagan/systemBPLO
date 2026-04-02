import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const violationId = body?.initialDataId;

    if (!violationId) {
      return NextResponse.json(
        { error: "Missing initialData.id" },
        { status: 400 }
      );
    }

    const { data: existingNotice, error: existingError } = await supabase
      .from("notice_forms")
      .select("id")
      .eq("violation_id", violationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const noticePayload = {
      violation_id: violationId,
      taxpayer: body.taxpayer,
      address: body.address,
      nature: body.nature,
      notice_no: body.noticeNo,
      data: body,
      signatures: body.signatures,
    };

    let saveResult;

    if (existingNotice?.id) {
      saveResult = await supabase
        .from("notice_forms")
        .update(noticePayload)
        .eq("id", existingNotice.id);
    } else {
      saveResult = await supabase.from("notice_forms").insert([noticePayload]);
    }

    if (saveResult.error) {
      return NextResponse.json({ error: saveResult.error.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("business_violations")
      .update({ signed: true })
      .eq("id", violationId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}