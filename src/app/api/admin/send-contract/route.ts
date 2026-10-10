import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { getResendApiKey, getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "@/lib/emailConfig";
import { rateLimit } from "@/lib/httpSecurity";
import { asString, errorMessage, readJsonObject } from "@/lib/request";
import { getFormuleNumber } from "@/lib/formules";
import {
  emailHtmlToText,
  storeOutboundContactEmail,
} from "@/lib/contactEmails";
import {
  buildSaleContract,
  clientReady,
  contractClientFromContact,
} from "@/lib/saleContract";

export async function POST(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status || 403 },
    );
  }

  const limited = rateLimit({
    key: `send-contract:${auth.user.id}`,
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { success: false, error: "Trop de requêtes. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  if (!getResendApiKey()) {
    return NextResponse.json(
      { success: false, error: "Service d'email indisponible" },
      { status: 500 },
    );
  }

  const body = await readJsonObject(request);
  if (!body) {
    return NextResponse.json(
      { success: false, error: "JSON invalide" },
      { status: 400 },
    );
  }

  const contactId = asString(body.contactId).trim();
  if (!contactId) {
    return NextResponse.json(
      { success: false, error: "Contact manquant" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: contact, error: fetchError } = await supabase
    .from("contacts")
    .select("id, prenom, nom, email, phone, pays, formule")
    .eq("id", contactId)
    .single();

  if (fetchError || !contact) {
    return NextResponse.json(
      { success: false, error: "Contact non trouvé" },
      { status: 404 },
    );
  }

  const savedFormule = getFormuleNumber(contact.formule);
  const formuleNumber = savedFormule || Number(body.formuleNumber);
  if (formuleNumber !== 1 && formuleNumber !== 2 && formuleNumber !== 3) {
    return NextResponse.json(
      { success: false, error: "Choisissez une formule avant d'envoyer le contrat" },
      { status: 400 },
    );
  }

  const client = contractClientFromContact(contact, {
    phone: body.phone,
    dateNaissance: body.dateNaissance,
    nationalite: body.nationalite,
    adresse: body.adresse,
  });
  if (!clientReady(client)) {
    return NextResponse.json(
      {
        success: false,
        error: "Date de naissance, nationalité, adresse ou téléphone manquant",
      },
      { status: 400 },
    );
  }

  const sentAt = new Date();
  const contract = buildSaleContract({
    client,
    formuleNumber,
    sentAt,
  });
  if (!contract) {
    return NextResponse.json(
      { success: false, error: "Contrat impossible à préparer" },
      { status: 400 },
    );
  }

  try {
    const resend = new Resend(getResendApiKey());
    const response = await resend.emails.send({
      from: CONTACT_FROM,
      replyTo: INBOUND_REPLY_TO,
      to: client.email,
      subject: contract.subject,
      html: contract.html,
    });
    if (response.error) {
      console.error("send-contract resend:", response.error);
      return NextResponse.json(
        { success: false, error: "Erreur envoi email" },
        { status: 500 },
      );
    }

    await storeOutboundContactEmail({
      contactId,
      toEmail: client.email,
      subject: contract.subject,
      bodyText: emailHtmlToText(contract.html),
      resendId: response.data?.id || null,
    });

    const { error: actionError } = await supabase.from("suivi_actions").insert([
      {
        contact_id: contactId,
        action: "email_envoye",
        description: `Contrat de prestation envoyé — formule ${formuleNumber}`,
        user_admin: auth.user.email || "admin",
      },
    ]);
    if (actionError) console.warn("send-contract log:", actionError.message);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("send-contract:", errorMessage(error));
    return NextResponse.json(
      { success: false, error: "Erreur envoi email" },
      { status: 500 },
    );
  }
}
