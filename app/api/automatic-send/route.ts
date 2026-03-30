import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email function
async function sendEmail(to: string, subject: string, text: string, html: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    text,
    html,
  });
}

// AUTO SEND
export async function GET() {
  try {
    // 1️⃣ Check setting
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "auto_send")
      .single();

    if (!setting || !setting.value) {
      return NextResponse.json({ success: false, message: "Auto send disabled" });
    }

    // 2️⃣ Get violations
    const { data: violations, error } = await supabase
      .from("business_violations")
      .select("*")
      .eq("resolved", false);

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json({ success: false, error });
    }

    const now = new Date();
    let sentCount = 0;

    for (const v of violations || []) {
      // 🚫 skip invalid
      if (!v.requestor_email) continue;
      if (v.cease_flag) continue;

      const interval = v.interval_days ?? 7;
      const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;

      // 3️⃣ Check interval
      if (lastSent) {
        const nextSend = new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000);
        if (now < nextSend) continue;
      }

      // 4️⃣ Notice level
      const noticeLevel = v.notice_level ?? 0;

      let subjectText = "";
      let textBody = "";
      let htmlBody = "";

      const viewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/notice/${v.id}`;

switch (noticeLevel) {
  case 0:
    subjectText = "Notice 1: Business Violation";
    textBody = `Your business has a violation: ${v.violation}. Resolve within ${interval} days.`;
    htmlBody = `
      <div style="background:#f3f4f6; padding:30px; font-family: Arial, sans-serif;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background:#064e3b; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:22px;">BPLO - CITY OF SAN PABLO</h1>
            <p style="margin:5px 0 0; font-size:14px;">Business Permit & Licensing Office</p>
          </div>

          <!-- Body -->
          <div style="padding:25px;">
            <h2 style="color:#065f46; margin-bottom:15px;">Notice 1: Business Violation</h2>
            
            <p>Hello,</p>
            <p>Your business has a recorded violation:</p>
            
            <div style="background:#ecfdf5; padding:15px; border-left:5px solid #065f46; border-radius:6px; margin:15px 0;">
              <strong>${v.violation}</strong>
            </div>

            <p>Please resolve this within <strong>${interval} days</strong> to avoid further action.</p>

            <p style="margin-top:20px;">Thank you for your cooperation.</p>
          </div>
                              <div style="text-align:center; margin-top:20px;">
            <a href="${viewUrl}" 
              style="background:#064e3b;color:white;padding:12px 20px;
              text-decoration:none;border-radius:8px;">
              View Notice & Sign
            </a>
          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
            This is an automated message. Please do not reply.
          </div>
        </div>
      </div>
    `;
    break;

  case 1:
    subjectText = "Notice 2: Business Violation Unresolved";
    textBody = `Your business violation is still unresolved: ${v.violation}. Immediate attention required.`;
    htmlBody = `
      <div style="background:#f3f4f6; padding:30px; font-family: Arial, sans-serif;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
          
          <div style="background:#064e3b; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:22px;">BPLO - CITY OF SAN PABLO</h1>
            <p style="margin:5px 0 0; font-size:14px;">Business Permit & Licensing Office</p>
          </div>

          <div style="padding:25px;">
            <h2 style="color:#b45309; margin-bottom:15px;">Notice 2: Unresolved Violation</h2>
            
            <p>This is a follow-up regarding your business violation:</p>

            <div style="background:#fffbeb; padding:15px; border-left:5px solid #f59e0b; border-radius:6px; margin:15px 0;">
              <strong>${v.violation}</strong>
            </div>

            <p style="color:#b91c1c;"><strong>Immediate attention is required.</strong></p>

            <p>Please resolve this issue to avoid penalties or further legal action.</p>
          </div>
          

          <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
            This is an automated message. Please do not reply.
          </div>
        </div>
      </div>
    `;
    break;

  case 2:
    subjectText = "Final Notice: Business Violation";
    textBody = `Final notice: ${v.violation}. Cease & Desist review pending.`;
    htmlBody = `
      <div style="background:#f3f4f6; padding:30px; font-family: Arial, sans-serif;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
          
          <div style="background:#064e3b; color:white; padding:20px; text-align:center;">
            <h1 style="margin:0; font-size:22px;">BPLO - CITY OF SAN PABLO</h1>
            <p style="margin:5px 0 0; font-size:14px;">Business Permit & Licensing Office</p>
          </div>

          <div style="padding:25px;">
            <h2 style="color:#991b1b; margin-bottom:15px;">Final Notice</h2>

            <p>This serves as your <strong>FINAL NOTICE</strong> regarding the violation:</p>

            <div style="background:#fef2f2; padding:15px; border-left:5px solid #dc2626; border-radius:6px; margin:15px 0;">
              <strong>${v.violation}</strong>
            </div>

            <p style="color:#991b1b;">
              Failure to comply may result in <strong>Cease & Desist Order</strong> and further legal action.
            </p>

            <p>Please act immediately.</p>
          </div>

          <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#6b7280;">
            This is an automated message. Please do not reply.
          </div>
        </div>
      </div>
    `;
    break;

  default:
    return NextResponse.json({ success: false, error: "All notices already sent" });
}

      // 5️⃣ Send email (safe)
      try {
        await sendEmail(v.requestor_email, subjectText, textBody, htmlBody);
      } catch (emailError) {
        console.error("Email failed:", emailError);
        continue; // wag i-update if failed
      }

      // 6️⃣ Update DB (FIXED LOGIC)
      const updateData: any = {
        last_sent_time: now,
        notice_level: noticeLevel + 1,
      };

      if (noticeLevel >= 2) {
        updateData.cease_flag = true;
      }

      const { error: updateError } = await supabase
        .from("business_violations")
        .update(updateData)
        .eq("id", v.id);

      if (updateError) {
        console.error("Update error:", updateError);
        continue;
      }

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
    });

  } catch (err) {
    console.error("AUTO SEND ERROR:", err);
    return NextResponse.json({
      success: false,
      error: "Automatic send failed",
    });
  }
}