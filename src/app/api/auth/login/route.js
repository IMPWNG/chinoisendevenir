import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { publicAuthError, signInAuthUser } from "@/lib/authUsers";
import {
  isValidAuthEmail,
  isValidAuthPassword,
  normalizeAuthEmail,
} from "@/lib/supabaseAuth";

export async function POST(request) {
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

    const body = await request.json().catch(() => ({}));
    const email = normalizeAuthEmail(body.email);
    const password = String(body.password || "");

    if (!isValidAuthEmail(email) || !password) {
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
    const session = result.session;

    if (result.error || !session?.access_token || !session?.refresh_token) {
      return NextResponse.json(
        { error: publicAuthError(result.error) },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: result.user?.id || session.user?.id,
        email: result.user?.email || session.user?.email,
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
