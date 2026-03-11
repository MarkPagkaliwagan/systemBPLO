import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {

  const { data: setting } = await supabase
  .from("settings")
  .select("value")
  .eq("key","auto_send")
  .single();

if (!setting?.value) {
  return NextResponse.json({ message: "Auto send disabled" });
}

  const { data: violations } = await supabase
    .from("business_violations")
    .select("*")
    .eq("resolved", false)
.eq("cease_flag", false);

  if (!violations) {
    return NextResponse.json({ success: true });
  }

for (const v of violations) {

  if (!v.requestor_email) continue;

  const lastSent = v.last_sent_time
    ? new Date(v.last_sent_time)
    : null;

  const interval = v.interval_days ?? 7;

  const nextSend = lastSent
    ? new Date(lastSent.getTime() + interval * 86400000)
    : new Date(0);

  if (new Date() >= nextSend) {

    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/manual-send-notice`, {
      method: "POST",
      body: JSON.stringify({ id: v.id }),
      headers: { "Content-Type": "application/json" },
    });

  }

}

  return NextResponse.json({ success: true });
}