import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    // fetch violation
    const { data, error } = await supabase
      .from("business_violations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(error);
      return NextResponse.json({ error: error?.message || "Violation not found" }, { status: 500 });
    }

    if (!data.requestor_email) {
      return NextResponse.json({ error: "No email for this violation" }, { status: 400 });
    }

    if (data.resolved) {
      return NextResponse.json({ error: "Violation already resolved" }, { status: 400 });
    }

    const noticeLevel = Number(data.notice_level);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.requestor_email,
      subject: `Violation Notice ${noticeLevel}`,
      html: `
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
      `,
    });

    const { error: updateError } = await supabase
      .from("business_violations")
      .update({
        notice_level: noticeLevel + 1,
        last_sent_time: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND NOTICE ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}