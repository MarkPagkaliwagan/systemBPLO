// app/api/send-notification-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, businessName, bin, violations, reviewActions } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `Non-Compliant Notice - ${businessName || "Business Record"}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Non-Compliant Notice</h2>
        <p>Good day,</p>
        <p>Your business record has been marked as <strong>Non-Compliant</strong>.</p>
        <p><strong>Business Name:</strong> ${businessName || "-"}</p>
        <p><strong>BIN:</strong> ${bin || "-"}</p>
        <p><strong>Review Actions:</strong> ${(reviewActions || []).join(", ") || "-"}</p>
        <p><strong>Violations:</strong> ${(violations || []).join(", ") || "-"}</p>
        <p>Please coordinate with the office for further action.</p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}