import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {

  const { id } = await req.json();

  // get violation info
  const { data, error } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const noticeLevel = data.notice_level;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: data.requestor_email,
    subject: `Violation Notice ${noticeLevel}`,
    html: `
      <h2>Business Violation Notice ${noticeLevel}</h2>

      <p><b>Business ID:</b> ${data.business_id}</p>
      <p><b>Violation:</b> ${data.violation}</p>

      ${
        noticeLevel === 3
        ? "<p style='color:red'><b>FINAL NOTICE: Failure to comply may result in Cease and Desist.</b></p>"
        : ""
      }

      <p>Please resolve this issue immediately.</p>
    `
  });

  // update database after sending
  await supabase
    .from("business_violations")
    .update({
      last_sent_time: new Date(),
      notice_level: noticeLevel + 1
    })
    .eq("id", id);

  return NextResponse.json({ success: true });
}