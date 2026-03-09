import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/sendEmail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const now = new Date();

  // Get violations joined with business_records
  const { data: violations, error } = await supabase
    .from("violations")
    .select(`
      *,
      business_records (
        "Business Name",
        interval_days,
        "Requestor Email"
      )
    `)
    .eq("status", "open");

  if (error) {
    return NextResponse.json({ error });
  }

  for (const violation of violations) {
    const lastSent = violation.last_notice_sent_at
      ? new Date(violation.last_notice_sent_at)
      : null;

    const interval = violation.business_records?.interval_days ?? 3;
    const email = violation.business_records?.["Requestor Email"];
    const businessName = violation.business_records?.["Business Name"] ?? "Unknown";

    const shouldSend =
      !lastSent ||
      (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24) >=
        interval;

    if (!shouldSend) continue;

    const nextLevel = violation.notice_level + 1;

    // STOP if already 3
    if (violation.notice_level >= 3) {
      await supabase
        .from("violations")
        .update({ status: "cease_desist" })
        .eq("id", violation.id);

      if (email) {
        await sendEmail(
          email,
          "Cease and Desist Notice",
          `<h1>Final Notice</h1>
           <p>Your business ${businessName} is now under Cease & Desist.</p>`
        );
      }

      continue;
    }

    // SEND NEXT NOTICE
    if (email) {
      await sendEmail(
        email,
        `Notice Level ${nextLevel}`,
        `<h1>Compliance Notice ${nextLevel}</h1>
         <p>Please resolve your violation immediately.</p>`
      );
    }

    await supabase
      .from("violations")
      .update({
        notice_level: nextLevel,
        last_notice_sent_at: now,
      })
      .eq("id", violation.id);
  }

  return NextResponse.json({ message: "Cron executed" });
}