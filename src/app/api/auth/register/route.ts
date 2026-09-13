import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { createConfirmedAuthUser } from "@/lib/authUsers";
import { isValidAuthPassword, normalizeAuthEmail } from "@/lib/supabaseAuth";
import { isValidEmail } from "@/lib/contactForm";
import { readJsonObject, asString } from "@/lib/request";

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      key: `auth-register:${getClientIp(request.headers)}`,
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
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const email = normalizeAuthEmail(body.email);
    const password = asString(body.password);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    if (!isValidAuthPassword(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir entre 8 et 72 caractères." },
        { status: 400 },
      );
    }

    const result = await createConfirmedAuthUser(email, password);
    if ("exists" in result && result.exists) {
      return NextResponse.json(
        {
          error: "Un compte existe déjà avec cet email. Connectez-vous.",
          code: "already_registered",
        },
        { status: 409 },
      );
    }
    if ("error" in result && result.error) {
      console.error("auth register:", result.error);
      return NextResponse.json(
        { error: "Impossible de créer le compte." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("auth register:", error);
    return NextResponse.json(
      { error: "Impossible de créer le compte pour le moment." },
      { status: 500 },
    );
  }
}
