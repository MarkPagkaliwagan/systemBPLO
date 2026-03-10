import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendEmail(to: string, subject: string, text: string, html: string) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM!, to, subject, text, html });
}

export async function POST(req: NextRequest) {
  const { autoSend } = await req.json(); // boolean: true = auto send, false = do nothing

  if (!autoSend) return NextResponse.json({ success: false, message: "Auto send is OFF" });

  // Fetch all unresolved violations
  const { data: violations, error } = await supabase
    .from("business_violations")
    .select("*")
    .or("resolved.eq.false,cease_flag.eq.false"); // fetch only unresolved or not yet ceased

  if (error) return NextResponse.json({ success: false, error: error.message });
  if (!violations || violations.length === 0) return NextResponse.json({ success: true, message: "No violations to send" });

  const now = new Date();
  const sentResults: { id: number; status: string }[] = [];

  for (const v of violations) {
    const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
    const interval = v.interval_days || 7;
    const nextSendTime = lastSent ? new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000) : null;

    // Skip if interval not passed
    if (nextSendTime && now < nextSendTime) {
      sentResults.push({ id: v.id, status: "Skipped (interval not reached)" });
      continue;
    }

    // Prepare notice content
    const noticeLevel = v.notice_level || 0;
    let subjectText = "", textBody = "", htmlBody = "";

    if (noticeLevel === 0 || noticeLevel === 1) {
      subjectText = "Notice 1: Business Violation";
      textBody = `Your business has a violation: ${v.violation}. Resolve within ${interval} days.`;
      htmlBody = `<p>Your business has a violation: <strong>${v.violation}</strong></p><p>Please resolve within ${interval} days.</p>`;
    } else if (noticeLevel === 2) {
      subjectText = "Notice 2: Business Violation Unresolved";
      textBody = `Your business violation is still unresolved: ${v.violation}. Immediate attention required.`;
      htmlBody = `<p>Your business violation is still unresolved: <strong>${v.violation}</strong></p><p>Immediate attention required.</p>`;
    } else if (noticeLevel === 3) {
      subjectText = "Final Notice: Business Violation";
      textBody = `Final notice: ${v.violation}. Cease & Desist review pending.`;
      htmlBody = `<p>Final notice: <strong>${v.violation}</strong></p><p>Cease & Desist review pending.</p>`;
    }

    try {
      await sendEmail(v.requestor_email!, subjectText, textBody, htmlBody);

      // Update DB
      let updateData: any = { last_sent_time: now };
      if (noticeLevel < 3) updateData.notice_level = noticeLevel + 1;
      else updateData.cease_flag = true;

      await supabase.from("business_violations").update(updateData).eq("id", v.id);

      sentResults.push({ id: v.id, status: "Sent" });
    } catch (err: any) {
      sentResults.push({ id: v.id, status: "Failed: " + err.message });
    }
  }

  return NextResponse.json({ success: true, results: sentResults });
}