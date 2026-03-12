import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check if auto send is enabled
    const { data: setting, error: settingError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "auto_send")
      .single();

    if (settingError) console.error("Setting error:", settingError);

    if (!setting?.value) {
      return NextResponse.json({ success: true, message: "Auto send disabled" });
    }

    // Get unresolved violations
    const { data: violations, error: violationsError } = await supabase
      .from("business_violations")
      .select("*")
      .or("resolved.eq.false,resolved.is.null")       // handle boolean/nullable
      .or("cease_flag.eq.false,cease_flag.is.null"); // handle boolean/nullable

    if (violationsError) console.error("Violations fetch error:", violationsError);

    if (!violations || violations.length === 0) {
      return NextResponse.json({ success: true, message: "No violations to send" });
    }

    const readyToSend: any[] = [];

    for (const v of violations) {
      if (!v.requestor_email) {
        console.log(`Skipping violation ${v.id}: No requestor email`);
        continue;
      }

      const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
      const interval = v.interval_days ?? 7;
      const nextSend = lastSent
        ? new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000)
        : new Date(0);

      if (new Date() >= nextSend) {
        readyToSend.push(v);
        // Trigger manual send
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/manual-send-notice`, {
          method: "POST",
          body: JSON.stringify({ id: v.id }),
          headers: { "Content-Type": "application/json" },
        });
        console.log(`Sent notice for violation ${v.id}`);
      } else {
        console.log(`Skipping violation ${v.id}: Next send at ${nextSend.toLocaleString()}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: violations.length,
      sent: readyToSend.length,
      message: readyToSend.length > 0 ? "Notices sent" : "No violations ready to send"
    });

  } catch (err) {
    console.error("Automatic send error:", err);
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}