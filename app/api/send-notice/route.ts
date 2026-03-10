import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/sendEmail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // fetch violation
    const { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: error?.message || "Violation not found" }, { status: 500 });
    }

    if (!data.requestor_email) {
      console.error("No requestor email for violation", data);
      return NextResponse.json({ error: "No email for this violation" }, { status: 400 });
    }

    const noticeLevel = Number(data.notice_level);

    // send email
    const subject = `Violation Notice ${noticeLevel}`;
    const html = `
      <h2>Violation Notice ${noticeLevel}</h2>
      <p><b>Business ID:</b> ${data.business_id}</p>
      <p><b>Violation:</b> ${data.violation}</p>
      ${
        noticeLevel === 3
          ? "<p style='color:red'><b>FINAL NOTICE: Failure to comply may result in Cease & Desist.</b></p>"
          : ""
      }
      ${
        noticeLevel > 3
          ? "<p style='color:red'><b>CEASE AND DESIST ORDER ISSUED.</b></p>"
          : ""
      }
      <p>Please resolve this violation immediately.</p>
    `;

    await sendEmail(data.requestor_email, subject, html);

    // update database
    const { error: updateError } = await supabase
      .from("business_violations")
      .update({
        notice_level: noticeLevel + 1,
        last_sent_time: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND NOTICE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}