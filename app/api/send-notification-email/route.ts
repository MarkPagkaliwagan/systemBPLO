// app/api/send-notification-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, businessName, bin, violations, reviewActions } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    // Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,           // smtp.gmail.com
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,                          // true for 465
      auth: {
        user: process.env.EMAIL_USER,         // bplo.ims@gmail.com
        pass: process.env.EMAIL_PASS,         // app password
      },
    });

    const subject = `Non-Compliant Notice - ${businessName || "Business Record"}`;
    const text = `
      Non-Compliant Notice

      Good day,

      Your business record has been marked as Non-Compliant.

      Business Name: ${businessName || "-"}
      BIN: ${bin || "-"}
      Review Actions: ${(reviewActions || []).join(", ") || "-"}
      Violations: ${(violations || []).join(", ") || "-"}

      Please coordinate with the office for further action.
    `;

const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#111; background-color:#f9fafb; padding:20px;">
    <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:20px;">
      <h2 style="color:#065f46; margin-bottom:10px;">Non-Compliant Notice</h2>
      <p>Good day,</p>
      <p>Your business record has been marked as <strong style="color:#065f46;">Non-Compliant</strong>.</p>

      <div style="margin-top:20px; margin-bottom:20px;">
        <div style="display:flex; padding:10px 0; border-bottom:1px solid #e5e7eb;">
          <strong style="width:150px; color:#065f46;">Business Name:</strong>
          <span>${businessName || "-"}</span>
        </div>
        <div style="display:flex; padding:10px 0; border-bottom:1px solid #e5e7eb;">
          <strong style="width:150px; color:#065f46;">BIN:</strong>
          <span>${bin || "-"}</span>
        </div>
        <div style="display:flex; padding:10px 0; border-bottom:1px solid #e5e7eb;">
          <strong style="width:150px; color:#065f46;">Review Actions:</strong>
          <span>${(reviewActions || []).join(", ") || "-"}</span>
        </div>
        <div style="display:flex; padding:10px 0;">
          <strong style="width:150px; color:#065f46;">Violations:</strong>
          <span>${(violations || []).join(", ") || "-"}</span>
        </div>
      </div>

      <p>Please coordinate with the office for further action.</p>
      <hr style="border:none; border-top:1px solid #065f46; margin-top:15px; margin-bottom:15px;" />
      <p style="font-size:12px; color:#555;">This is an automated message. Please do not reply.</p>
    </div>
  </div>
`;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,   // bplo.ims@gmail.com
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}