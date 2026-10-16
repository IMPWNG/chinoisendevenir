import { getSupabaseAdmin } from "./supabaseAdmin";
import { CONTACT_FROM_EMAIL } from "./emailConfig";

export type ContactEmailDirection = "in" | "out";

export type ContactEmailRow = {
  id: string;
  contact_id: string;
  direction: ContactEmailDirection;
  subject?: string | null;
  body_text: string;
  from_email?: string | null;
  to_email?: string | null;
  resend_id?: string | null;
  sent_at: string;
  read_at?: string | null;
  created_at?: string;
};

export type ContactEmailInput = {
  contactId: string;
  direction: ContactEmailDirection;
  subject?: string | null;
  bodyText?: string | null;
  fromEmail?: string | null;
  toEmail?: string | null;
  resendId?: string | null;
  sentAt?: string | null;
  /** Outbound is read by default; inbound starts unread. */
  readAt?: string | null;
};

function normalizeEmail(value: string | null | undefined): string | null {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  return v || null;
}

function truncateBody(text: string | null | undefined, max = 20000): string {
  const body = String(text || "").trim();
  if (body.length <= max) return body;
  return `${body.slice(0, max)}…`;
}

/** Persist one message in the contact thread. Idempotent on resend_id. */
export async function storeContactEmail(
  input: ContactEmailInput,
): Promise<ContactEmailRow | null> {
  const contactId = String(input.contactId || "").trim();
  if (!contactId) return null;

  const direction = input.direction === "in" ? "in" : "out";
  const sentAt = input.sentAt || new Date().toISOString();
  const readAt =
    input.readAt !== undefined
      ? input.readAt
      : direction === "out"
        ? sentAt
        : null;

  const row = {
    contact_id: contactId,
    direction,
    subject: String(input.subject || "").trim() || null,
    body_text: truncateBody(input.bodyText),
    from_email: normalizeEmail(input.fromEmail),
    to_email: normalizeEmail(input.toEmail),
    resend_id: String(input.resendId || "").trim() || null,
    sent_at: sentAt,
    read_at: readAt,
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_emails")
    .insert(row)
    .select("*")
    .maybeSingle();

  if (!error && data) return data as ContactEmailRow;

  // Unique resend_id → already stored
  if (error && row.resend_id && /duplicate|unique/i.test(error.message)) {
    const { data: existing } = await supabase
      .from("contact_emails")
      .select("*")
      .eq("resend_id", row.resend_id)
      .maybeSingle();
    return (existing as ContactEmailRow) || null;
  }

  // Table missing pre-migration — soft fail
  if (error) {
    console.warn("⚠️ storeContactEmail:", error.message);
    return null;
  }
  return null;
}

export async function storeInboundContactEmail(opts: {
  contactId: string;
  fromEmail?: string | null;
  subject?: string | null;
  bodyText?: string | null;
  resendId?: string | null;
}): Promise<ContactEmailRow | null> {
  return storeContactEmail({
    contactId: opts.contactId,
    direction: "in",
    subject: opts.subject,
    bodyText: opts.bodyText,
    fromEmail: opts.fromEmail,
    toEmail: CONTACT_FROM_EMAIL,
    resendId: opts.resendId,
  });
}

export async function storeOutboundContactEmail(opts: {
  contactId: string;
  toEmail?: string | null;
  subject?: string | null;
  bodyText?: string | null;
  resendId?: string | null;
}): Promise<ContactEmailRow | null> {
  return storeContactEmail({
    contactId: opts.contactId,
    direction: "out",
    subject: opts.subject,
    bodyText: opts.bodyText,
    fromEmail: CONTACT_FROM_EMAIL,
    toEmail: opts.toEmail,
    resendId: opts.resendId,
  });
}

/** Map contact_id → unread inbound count. */
export async function unreadEmailCountsByContact(
  contactIds: string[],
): Promise<Record<string, number>> {
  const ids = [...new Set(contactIds.map((id) => String(id).trim()).filter(Boolean))];
  if (!ids.length) return {};

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_emails")
    .select("contact_id")
    .in("contact_id", ids)
    .eq("direction", "in")
    .is("read_at", null);

  if (error) {
    console.warn("⚠️ unreadEmailCountsByContact:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data || []) {
    const id = String((row as { contact_id?: string }).contact_id || "");
    if (!id) continue;
    counts[id] = (counts[id] || 0) + 1;
  }
  return counts;
}

export async function listContactEmails(
  contactId: string,
): Promise<ContactEmailRow[]> {
  const id = String(contactId || "").trim();
  if (!id) return [];

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_emails")
    .select("*")
    .eq("contact_id", id)
    .order("sent_at", { ascending: true });

  if (error) {
    console.warn("⚠️ listContactEmails:", error.message);
    return [];
  }
  return (data || []) as ContactEmailRow[];
}

export async function markContactEmailsRead(
  contactId: string,
): Promise<number> {
  const id = String(contactId || "").trim();
  if (!id) return 0;

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("contact_emails")
    .update({ read_at: now })
    .eq("contact_id", id)
    .eq("direction", "in")
    .is("read_at", null)
    .select("id");

  if (error) {
    console.warn("⚠️ markContactEmailsRead:", error.message);
    return 0;
  }
  return data?.length || 0;
}

/** Strip HTML for storage / chat preview. */
export function emailHtmlToText(html: string | null | undefined): string {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
