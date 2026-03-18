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
   htmlBody = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    
    <div style="background:#0b3d91; color:#ffffff; padding:15px; text-align:center;">
      <h2 style="margin:0;">PBLO - City of San Pablo</h2>
      <p style="margin:5px 0 0; font-size:13px;">Business Compliance Notification</p>
    </div>

    <div style="padding:20px; color:#333;">
      <p>Dear Business Owner,</p>

      <p>This is to inform you that your business has been recorded with the following violation:</p>

      <p style="background:#f1f5f9; padding:10px; border-left:4px solid #0b3d91;">
        <strong>${v.violation}</strong>
      </p>

      <p>Please resolve this matter within <strong>${interval} days</strong> from receipt of this notice.</p>

      <p>If you have already taken action, kindly disregard this message or coordinate with our office.</p>

      <p style="margin-top:20px;">Thank you.</p>

      <p>
        <strong>Business Permits and Licensing Office</strong><br/>
        City of San Pablo
      </p>
    </div>

    <div style="background:#f4f6f8; padding:10px; text-align:center; font-size:12px; color:#777;">
      This is a system-generated email. Please do not reply.
    </div>

  </div>
</div>
`;
  } else if (noticeLevel === 2) {
    subjectText = "Notice 2: Business Violation Unresolved";
    textBody = `Your business violation is still unresolved: ${v.violation}. Immediate attention required.`;
   htmlBody = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    
    <div style="background:#b91c1c; color:#ffffff; padding:15px; text-align:center;">
      <h2 style="margin:0;">PBLO - City of San Pablo</h2>
      <p style="margin:5px 0 0; font-size:13px;">Second Notice</p>
    </div>

    <div style="padding:20px; color:#333;">
      <p>Dear Business Owner,</p>

      <p>Your previously reported violation remains unresolved:</p>

      <p style="background:#fef2f2; padding:10px; border-left:4px solid #b91c1c;">
        <strong>${v.violation}</strong>
      </p>

      <p><strong>Immediate action is required.</strong> Failure to comply may result in further administrative action.</p>

      <p>Please coordinate with the Business Permits and Licensing Office as soon as possible.</p>

      <p style="margin-top:20px;">Thank you.</p>

      <p>
        <strong>Business Permits and Licensing Office</strong><br/>
        City of San Pablo
      </p>
    </div>

    <div style="background:#f4f6f8; padding:10px; text-align:center; font-size:12px; color:#777;">
      This is a system-generated email. Please do not reply.
    </div>

  </div>
</div>
`;
  } else if (noticeLevel === 3) {
    subjectText = "Final Notice: Business Violation";
    textBody = `Final notice: ${v.violation}. Cease & Desist review pending.`;
   htmlBody = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
    
    <div style="background:#7f1d1d; color:#ffffff; padding:15px; text-align:center;">
      <h2 style="margin:0;">PBLO - City of San Pablo</h2>
      <p style="margin:5px 0 0; font-size:13px;">Final Notice</p>
    </div>

    <div style="padding:20px; color:#333;">
      <p>Dear Business Owner,</p>

      <p>This serves as your <strong>FINAL NOTICE</strong> regarding the violation below:</p>

      <p style="background:#fee2e2; padding:10px; border-left:4px solid #7f1d1d;">
        <strong>${v.violation}</strong>
      </p>

      <p>Failure to comply will result in <strong>Cease and Desist proceedings</strong> and possible legal action.</p>

      <p>You are strongly advised to coordinate with our office immediately.</p>

      <p style="margin-top:20px;">Thank you.</p>

      <p>
        <strong>Business Permits and Licensing Office</strong><br/>
        City of San Pablo
      </p>
    </div>

    <div style="background:#f4f6f8; padding:10px; text-align:center; font-size:12px; color:#777;">
      This is a system-generated email. Please do not reply.
    </div>

  </div>
</div>
`;
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