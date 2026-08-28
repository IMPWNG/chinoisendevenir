import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";

export async function POST(request) {
  try {
    const limited = rateLimit({
      key: `student-access:${getClientIp(request.headers)}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const { email } = await request.json().catch(() => ({}));
    const normalized = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalized || !normalized.includes("@") || normalized.length > 254) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("student request-access:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
