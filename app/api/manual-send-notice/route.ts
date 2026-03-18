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
  const { id } = await req.json();

  const { data: violations } = await supabase
    .from("business_violations")
    .select("*")
    .eq("id", id);

  if (!violations || violations.length === 0) 
    return NextResponse.json({ success: false, error: "Violation not found" });

  const v = violations[0];
  const now = new Date();
  const interval = v.interval_days ?? 7;
  const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;

  // Check interval
  if (lastSent && new Date() < new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ 
      success: false, 
      error: `Next send allowed after ${new Date(lastSent.getTime() + interval*24*60*60*1000).toLocaleString()}` 
    });
  }

  // Decide notice content (support 0 as first notice)
  let subjectText = "", textBody = "", htmlBody = "";
  const noticeLevel = v.notice_level || 0;
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

  // Send email
  await sendEmail(v.requestor_email!, subjectText, textBody, htmlBody);

  // Update DB
  let updateData: any = { last_sent_time: now };
  if (noticeLevel < 3) updateData.notice_level = noticeLevel + 1;
  else updateData.cease_flag = true;

  await supabase.from("business_violations").update(updateData).eq("id", id);

  return NextResponse.json({ success: true });
}