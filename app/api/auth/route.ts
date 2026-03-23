import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { comparePassword } from "@/lib/passwordUtils";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // ── Basic validation ───────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── Look up user ───────────────────────────────────────────────────────
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    // Return the same generic message for both "no user" and "wrong password"
    // to avoid leaking which one is wrong (security best practice).
    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // ── Verify password ────────────────────────────────────────────────────
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // ── Check account status ───────────────────────────────────────────────
    if (user.is_disabled || user.status === "inactive") {
      return NextResponse.json(
        {
          error:
            "Your account has been disabled. Please contact your administrator.",
        },
        { status: 403 }
      );
    }

    // ── Build user object (database now has correct roles) ─────────────────
    const mappedUser = {
      id: user.id,
      name: user.full_name || user.name,
      email: user.email,
      role: user.role, // Database now has 'admin' and 'staff' directly
    };

    // ── Email verification gate ────────────────────────────────────────────
    // Grandfather rule: null/undefined means the account pre-dates the
    // verification feature — treat as verified.
    const needsEmailVerification = user.email_verified === false;

    if (needsEmailVerification) {
      return NextResponse.json({
        message:
          "Email verification required. Please check your inbox for the verification code.",
        user: mappedUser,
        requiresEmailVerification: true,
      });
    }

    // ── OTP step ───────────────────────────────────────────────────────────
    return NextResponse.json({
      message: "Credentials validated. OTP verification required.",
      user: mappedUser,
      requiresOTP: true,
    });
  } catch (err) {
    console.error("[auth] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}