import { after } from "next/server";
import { Resend } from "resend";
import { getResendApiKey, getSupabaseAdmin } from "../supabaseAdmin";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "../emailConfig";
import {
  emailHtmlToText,
  storeOutboundContactEmail,
} from "../contactEmails";
import { generateCustomEmailHtml } from "../emailLayout";
import { composeStudentQuestionReply } from "../emailCompose";
import { studentAskKey, studentAskText, shouldAnswerStudentAsk } from "../studentAsk";
import { AUTO_MAIL_ACTOR } from "../suiviHistory";
import { errorMessage } from "../request";
import { updateContactStatus, logAction } from "./auto-reply";

const supabase = getSupabaseAdmin();

export type StudentDemandInput = {
  contactId: string;
  email: string;
  prenom?: string | null;
  ask: unknown;
  diplome?: unknown;
  domaine?: unknown;
  budget?: unknown;
  rentree?: unknown;
  pays?: unknown;
  /** Move the file to “formules présentées” after a real send. */
  markFormules?: boolean;
};

export async function replyToStudentDemand(
  input: StudentDemandInput,
): Promise<"sent" | "already" | "empty" | "failed"> {
  const ask = studentAskText(input.ask);
  if (!input.contactId || !input.email || !shouldAnswerStudentAsk(ask)) return "empty";
  const key = studentAskKey(ask);
  const marker = `[demande:${key}]`;

  const { data: existing } = await supabase
    .from("suivi_actions")
    .select("id")
    .eq("contact_id", input.contactId)
    .ilike("description", `%${marker}%`)
    .limit(1);
  if (existing && existing.length > 0) return "already";

  const composed = await composeStudentQuestionReply({
    ask,
    profile: {
      prenom: input.prenom,
      diplome: input.diplome,
      domaine: input.domaine,
      budget: input.budget,
      rentree: input.rentree,
      pays: input.pays,
    },
  });
  if (!composed.ok) {
    console.warn("⚠️ Réponse personnelle non rédigée:", composed.error);
    return "failed";
  }

  const html = generateCustomEmailHtml(
    { prenom: input.prenom || "" },
    {
      customSubject: composed.subject,
      customTitle: composed.title,
      customSubtitle: composed.subtitle,
      customMessage: composed.body,
    },
  );
  const resend = new Resend(getResendApiKey());
  const sent = await resend.emails.send({
    from: CONTACT_FROM,
    replyTo: INBOUND_REPLY_TO,
    to: input.email,
    subject: composed.subject,
    html,
    headers: {
      "Auto-Submitted": "auto-replied",
      "X-Auto-Response-Suppress": "All",
    },
  });
  if (sent.error) {
    console.warn("⚠️ Réponse personnelle non envoyée:", sent.error);
    return "failed";
  }

  await storeOutboundContactEmail({
    contactId: input.contactId,
    toEmail: input.email,
    subject: composed.subject,
    bodyText: emailHtmlToText(html),
    resendId: sent.data?.id || null,
  });
  await logAction(
    input.contactId,
    input.email,
    "email_envoye",
    `Réponse personnelle à la demande de l'étudiant ${marker}`,
    AUTO_MAIL_ACTOR,
  );
  if (input.markFormules) {
    await updateContactStatus(input.contactId, "formules_présentées");
  }
  return "sent";
}

export function scheduleStudentDemandReply(input: StudentDemandInput) {
  after(() => {
    void replyToStudentDemand(input).catch((error: unknown) => {
      console.warn("⚠️ Réponse personnelle:", errorMessage(error));
    });
  });
}
