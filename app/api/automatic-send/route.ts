import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Import your manual send function
import { POST as manualSendPOST } from "../manual-send-notice/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check if auto send is enabled
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "auto_send")
      .single();

    if (!setting?.value) {
      return NextResponse.json({ message: "Auto send disabled" });
    }

    // Get unresolved violations
    const { data: violations } = await supabase
      .from("business_violations")
      .select("*")
      .eq("resolved", false)
      .eq("cease_flag", false);

    if (!violations || violations.length === 0) {
      return NextResponse.json({ success: true, message: "No violations to send" });
    }

    // Loop through violations and send notice if interval passed
    for (const v of violations) {
      if (!v.requestor_email) continue;

      const lastSent = v.last_sent_time ? new Date(v.last_sent_time) : null;
      const interval = v.interval_days ?? 7;
      const nextSend = lastSent
        ? new Date(lastSent.getTime() + interval * 24 * 60 * 60 * 1000)
        : new Date(0);

      if (new Date() >= nextSend) {
        // Call manual-send directly
        await manualSendPOST({
          json: async () => ({ id: v.id }),
        } as any);
      }
    }

    return NextResponse.json({ success: true, message: "Automatic send completed" });

  } catch (err) {
    console.error("Automatic send error:", err);
    return NextResponse.json({ success: false, error: "Automatic send failed" });
  }
}