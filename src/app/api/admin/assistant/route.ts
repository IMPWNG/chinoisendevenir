import { NextResponse } from "next/server";
import { askAdminAssistant, assistantPromptTurns } from "@/lib/adminAssistant";
import { requireFullAdmin } from "@/lib/adminRoles";
import { loadDossierBrief, loadMailBrief } from "@/lib/assistantDossiers";
import { rateLimit } from "@/lib/httpSecurity";
import { readJsonObject } from "@/lib/request";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export const maxDuration = 60;

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

  const question = turns
    .filter((turn) => turn.role === "user")
    .slice(-2)
    .map((turn) => turn.content)
    .join("\n");
  const [dossier, mailText] = await Promise.all([
    loadDossierBrief(auth.admin, question).catch(() => ({
      brief: "Dossiers : lecture impossible.",
      contacts: [] as Array<{ id: string; name: string }>,
    })),
    loadMailBrief(auth.admin, question).catch(() => "Mails reçus : lecture impossible."),
  ]);
  const dossiers = [dossier.brief, mailText].filter(Boolean).join("\n\n");

  const result = await askAdminAssistant(turns, dossiers);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({
    reply: result.reply,
    contacts: dossier.contacts,
  });
}
