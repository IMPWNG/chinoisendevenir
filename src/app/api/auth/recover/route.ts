import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { findContactByEmail } from "@/lib/studentAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getSupabaseAnonServer } from "@/lib/authUsers";
import { isValidEmail } from "@/lib/contactForm";
import { asString, readJsonObject } from "@/lib/request";
import {
  normalizeAuthEmail,
  studentRecoveryRedirect,
} from "@/lib/supabaseAuth";

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      key: `auth-recover:${getClientIp(request.headers)}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await readJsonObject(request);
    const email = normalizeAuthEmail(asString(body?.email));
    if (!body || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const contact = await findContactByEmail(getSupabaseAdmin(), email);
    if (contact) {
      const { error } = await getSupabaseAnonServer().auth.resetPasswordForEmail(
        email,
        { redirectTo: studentRecoveryRedirect(request.headers.get("origin")) },
      );
      if (error) {
        const code = String(error.code || "");
        const message = String(error.message || "").toLowerCase();
        const missing =
          code === "user_not_found" || message.includes("user not found");
        if (!missing) {
          console.error("auth recover:", error.message);
          return NextResponse.json(
            { error: "Impossible d'envoyer l'email." },
            { status: 502 },
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("auth recover:", error);
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email." },
      { status: 500 },
    );
  }
}
