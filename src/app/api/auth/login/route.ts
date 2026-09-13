import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { publicAuthError, signInAuthUser } from "@/lib/authUsers";
import { isValidAuthPassword, normalizeAuthEmail } from "@/lib/supabaseAuth";
import { isValidEmail } from "@/lib/contactForm";
import { readJsonObject, asString } from "@/lib/request";

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      key: `auth-login:${getClientIp(request.headers)}`,
      limit: 20,
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

    if (!isValidEmail(email) || !password) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 400 },
      );
    }
    if (!isValidAuthPassword(password)) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    const result = await signInAuthUser(email, password);
    const session = "session" in result ? result.session : null;

    if ("error" in result || !session?.access_token || !session?.refresh_token) {
      return NextResponse.json(
        { error: publicAuthError("error" in result ? result.error : null) },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: ("user" in result ? result.user?.id : undefined) || session.user?.id,
        email: ("user" in result ? result.user?.email : undefined) || session.user?.email,
      },
    });
  } catch (error) {
    console.error("auth login:", error);
    return NextResponse.json(
      { error: "Connexion impossible pour le moment." },
      { status: 500 },
    );
  }
}
