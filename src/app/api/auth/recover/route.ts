import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { findContactByEmail } from "@/lib/studentAuth";
import { getResendApiKey, getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "@/lib/emailConfig";
import {
  studentRecoveryEmailHtml,
  withEtudeChineSubject,
} from "@/lib/emailLayout";
import { isValidEmail } from "@/lib/contactForm";
import { asString, readJsonObject } from "@/lib/request";
import {
  normalizeAuthEmail,
  studentRecoveryRedirect,
} from "@/lib/supabaseAuth";

function missingAuthUser(error: { code?: string; message?: string } | null) {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return code === "user_not_found" || message.includes("user not found");
}

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

    const admin = getSupabaseAdmin();
    const contact = await findContactByEmail(admin, email);
    if (!contact) return NextResponse.json({ success: true });

    const redirectTo = studentRecoveryRedirect(request.headers.get("origin"));
    const generated = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });
    if (generated.error) {
      if (missingAuthUser(generated.error)) {
        return NextResponse.json({ success: true });
      }
      console.error("auth recover link:", generated.error.message);
      return NextResponse.json(
        { error: "Impossible d'envoyer l'email." },
        { status: 502 },
      );
    }

    const link = generated.data?.properties?.action_link || "";
    if (!link) {
      return NextResponse.json(
        { error: "Impossible d'envoyer l'email." },
        { status: 502 },
      );
    }

    const apiKey = getResendApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Impossible d'envoyer l'email." },
        { status: 503 },
      );
    }

    const prenom = String(contact.prenom || "").trim();
    const subject = withEtudeChineSubject("Réinitialisez votre mot de passe");
    const sent = await new Resend(apiKey).emails.send({
      from: CONTACT_FROM,
      replyTo: INBOUND_REPLY_TO,
      to: email,
      subject,
      html: studentRecoveryEmailHtml(prenom, link),
      text: [
        prenom ? `Bonjour ${prenom},` : "Bonjour,",
        "",
        "Choisissez un nouveau mot de passe pour votre espace étudiant :",
        link,
        "",
        "Ce lien expire au bout d'une heure et ne peut servir qu'une fois.",
        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
      ].join("\n"),
    });
    if (sent.error) {
      console.error("auth recover send:", sent.error.message);
      return NextResponse.json(
        { error: "Impossible d'envoyer l'email." },
        { status: 502 },
      );
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
