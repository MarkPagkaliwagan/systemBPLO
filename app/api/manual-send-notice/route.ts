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
  const interval = v.interval_days;

  if (interval === null || interval === undefined) {
    return NextResponse.json({ success: false, error: "Interval days not set in database" });
  }

  const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;

  // Check interval
  if (lastSent && new Date() < new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ 
      success: false, 
      error: `Next send allowed after ${new Date(lastSent.getTime() + interval*24*60*60*1000).toLocaleString()}` 
    });
  }

  // Determine notice level
  const noticeLevel = v.notice_level ?? 0;
  let subjectText = "", textBody = "", htmlBody = "";

  switch (noticeLevel) {
    case 0:
      subjectText = "Notice 1: Business Violation";
      textBody = `Your business has a violation: ${v.violation}. Resolve within ${interval} days.`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h1 style="color:#065f46; font-size:24px; margin-bottom:10px;">BPLO - CITY OF SAN PABLO</h1>
          <h2 style="font-size:20px; margin-bottom:10px;">Notice 1: Business Violation</h2>
          <p>Your business has a violation: <strong>${v.violation}</strong></p>
          <p>Please resolve within <strong>${interval} days</strong>.</p>
          <hr style="border:none; border-top:1px solid #ccc; margin-top:20px;"/>
          <p style="font-size:12px; color:#555;">This is an automated message. Please do not reply directly.</p>
        </div>
      `;
      break;
    case 1:
      subjectText = "Notice 2: Business Violation Unresolved";
      textBody = `Your business violation is still unresolved: ${v.violation}. Immediate attention required.`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h1 style="color:#065f46; font-size:24px; margin-bottom:10px;">BPLO - CITY OF SAN PABLO</h1>
          <h2 style="font-size:20px; margin-bottom:10px;">Notice 2: Business Violation Unresolved</h2>
          <p>Your business violation is still unresolved: <strong>${v.violation}</strong></p>
          <p>Immediate attention is required.</p>
          <hr style="border:none; border-top:1px solid #ccc; margin-top:20px;"/>
          <p style="font-size:12px; color:#555;">This is an automated message. Please do not reply directly.</p>
        </div>
      `;
      break;
    case 2:
      subjectText = "Final Notice: Business Violation";
      textBody = `Final notice: ${v.violation}. Cease & Desist review pending.`;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h1 style="color:#065f46; font-size:24px; margin-bottom:10px;">BPLO - CITY OF SAN PABLO</h1>
          <h2 style="font-size:20px; margin-bottom:10px;">Final Notice: Business Violation</h2>
          <p>Final notice: <strong>${v.violation}</strong></p>
          <p>Cease & Desist review pending.</p>
          <hr style="border:none; border-top:1px solid #ccc; margin-top:20px;"/>
          <p style="font-size:12px; color:#555;">This is an automated message. Please do not reply directly.</p>
        </div>
      `;
      break;
    default:
      return NextResponse.json({ success: false, error: "All notices already sent" });
  }

  // Send email
  await sendEmail(v.requestor_email!, subjectText, textBody, htmlBody);

  // Update DB
  const updateData: any = { last_sent_time: now };
  if (noticeLevel < 2) {
    updateData.notice_level = noticeLevel + 1; // move to next notice
  } else {
    updateData.cease_flag = true; // final notice
  }

  await supabase.from("business_violations").update(updateData).eq("id", id);

  return NextResponse.json({ success: true });
}