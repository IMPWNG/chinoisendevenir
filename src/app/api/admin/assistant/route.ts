import { NextResponse } from "next/server";
import { askAdminAssistant, assistantPromptTurns } from "@/lib/adminAssistant";
import { requireFullAdmin } from "@/lib/adminRoles";
import { rateLimit } from "@/lib/httpSecurity";
import { readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export async function POST(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }
  const denied = requireFullAdmin(auth);
  if (denied) {
    return NextResponse.json({ error: denied.error }, { status: denied.status || 403 });
  }

  const limited = rateLimit({
    key: `admin-assistant:${auth.user.id}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const body = await readJsonObject(request);
  const turns = assistantPromptTurns(body?.messages);
  if (!turns) {
    return NextResponse.json({ error: "Question vide" }, { status: 400 });
  }

  const result = await askAdminAssistant(turns);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ reply: result.reply });
}
