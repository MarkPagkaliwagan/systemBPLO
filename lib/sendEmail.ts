import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      `Missing email credentials — EMAIL_USER: ${!!user}, EMAIL_PASS: ${!!pass}`
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  // removed transporter.verify() — causes timeouts on Vercel serverless

  await transporter.sendMail({
    from: `"BPLO Inspection Management System" <${user}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent successfully to:", to);
};