import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/sendEmail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const now = new Date();

  const { data: violations, error } = await supabase
    .from("violations")
    .select(`
      *,
      buses (
        business_name,
        interval_days,
        email
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

    const interval = violation.buses.interval_days;

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

      await sendEmail(
        violation.buses.email,
        "Cease and Desist Notice",
        `<h1>Final Notice</h1>
         <p>Your business ${violation.buses.business_name} is now under Cease & Desist.</p>`
      );

      continue;
    }

    // SEND NEXT NOTICE
    await sendEmail(
      violation.buses.email,
      `Notice Level ${nextLevel}`,
      `<h1>Compliance Notice ${nextLevel}</h1>
       <p>Please resolve your violation immediately.</p>`
    );

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