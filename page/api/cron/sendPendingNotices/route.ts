import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import { sendEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { violationId, noticeLevel } = req.body;

    const { data, error } = await supabase
      .from("violations")
      .select("id, notice_level, status, buses(email, business_name, interval_days)")
      .eq("id", violationId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Violation not found" });
    if (!data.buses || data.buses.length === 0 || !data.buses[0].email) return res.status(400).json({ error: "No email for business" });

    await sendEmail(
      data.buses[0].email,
      `Notice ${noticeLevel} - Violation`,
      `<p>Hello ${data.buses[0].business_name},</p>
       <p>This is Notice ${noticeLevel} regarding your violation.</p>
       <p>Status: ${data.status}</p>`
    );

    await supabase
      .from("violations")
      .update({ notice_level: noticeLevel, last_notice_sent_at: new Date() })
      .eq("id", violationId);

    return res.status(200).json({ message: "Notice sent!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}