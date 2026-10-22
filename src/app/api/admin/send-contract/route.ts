import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ensureStudentBucket, getAuthenticatedAdmin } from "@/lib/studentAuth";
import { getResendApiKey, getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "@/lib/emailConfig";
import { getAdminEmailAllowlist } from "@/lib/adminRoles";
import { rateLimit } from "@/lib/httpSecurity";
import { asString, errorMessage, readJsonObject } from "@/lib/request";
import { getFormuleNumber } from "@/lib/formules";
import {
  emailHtmlToText,
  storeOutboundContactEmail,
} from "@/lib/contactEmails";
import {
  contractEmailWithPdfNote,
  contractHtmlToPdf,
  contractPdfFilename,
} from "@/lib/contractPdf";
import {
  SIGNED_CONTRACT_KEY,
  addRequestedDocumentKeys,
  saveContractCopy,
} from "@/lib/studentDocuments";
import {
  buildSaleContract,
  clientReady,
  contractClientFromContact,
  contractGaps,
  contractTerms,
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
    residence: body.residence,
    adresse: body.adresse,
    mineur: body.mineur === true,
    representants: Array.isArray(body.representants) ? body.representants : null,
    representant:
      body.representant && typeof body.representant === "object"
        ? (body.representant as {
            nom?: unknown;
            lien?: unknown;
            adresse?: unknown;
            contact?: unknown;
          })
        : null,
    tiersPayeur: body.tiersPayeur === true,
    payeur:
      body.payeur && typeof body.payeur === "object"
        ? (body.payeur as {
            nom?: unknown;
            lien?: unknown;
            adresse?: unknown;
            contact?: unknown;
          })
        : null,
  });
  if (!clientReady(client)) {
    return NextResponse.json(
      {
        success: false,
        error: "VALIDATION HUMAINE REQUISE",
        gaps: contractGaps(client),
      },
      { status: 400 },
    );
  }

  const sentAt = new Date();
  const contract = buildSaleContract({
    client,
    formuleNumber,
    sentAt,
    terms: body.terms,
  });
  if (!contract || "validation" in contract) {
    return NextResponse.json(
      {
        success: false,
        error: "VALIDATION HUMAINE REQUISE",
        gaps: contract && "validation" in contract ? contract.gaps : [],
      },
      { status: 400 },
    );
  }

  const fullName = `${client.prenom} ${client.nom}`.trim();
  let pdf: Uint8Array;
  try {
    pdf = await contractHtmlToPdf(contract.html, `Contrat ${fullName}`);
  } catch (error: unknown) {
    console.error("send-contract pdf:", errorMessage(error));
    return NextResponse.json(
      { success: false, error: "Le PDF du contrat n'a pas pu être créé" },
      { status: 500 },
    );
  }
  const emailHtml = contractEmailWithPdfNote(contract.html);

  try {
    await ensureStudentBucket(supabase);
    await saveContractCopy(supabase, contactId, pdf);
    await addRequestedDocumentKeys(supabase, contactId, [SIGNED_CONTRACT_KEY]);
  } catch (error: unknown) {
    console.error("send-contract space:", errorMessage(error));
    return NextResponse.json(
      { success: false, error: "Le contrat n'a pas pu être ajouté à l'espace étudiant" },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(getResendApiKey());
    const response = await resend.emails.send({
      from: CONTACT_FROM,
      replyTo: INBOUND_REPLY_TO,
      to: client.email,
      subject: contract.subject,
      html: emailHtml,
      attachments: [
        {
          filename: contractPdfFilename(fullName),
          content: Buffer.from(pdf),
          contentType: "application/pdf",
        },
      ],
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
      bodyText: emailHtmlToText(emailHtml),
      resendId: response.data?.id || null,
    });

    let copyError = "";
    if (body.copyAdmin === true) {
      const recipients = [
        ...getAdminEmailAllowlist(),
        String(auth.user.email || "").trim().toLowerCase(),
      ].filter((email, index, list) => {
        return Boolean(email) && email !== client.email && list.indexOf(email) === index;
      });
      if (!recipients.length) {
        copyError = "Aucun admin";
      } else {
        const copy = await resend.emails.send({
          from: CONTACT_FROM,
          replyTo: INBOUND_REPLY_TO,
          to: recipients,
          subject: `Copie admin — ${contract.subject}`,
          html: emailHtml,
          attachments: [
            {
              filename: contractPdfFilename(fullName),
              content: Buffer.from(pdf),
              contentType: "application/pdf",
            },
          ],
        });
        if (copy.error) {
          console.error("send-contract admin copy:", copy.error);
          copyError = "Erreur copie admin";
        }
      }
    }

    const { error: actionError } = await supabase.from("suivi_actions").insert([
      {
        contact_id: contactId,
        action: "email_envoye",
        description: `Contrat de prestation envoyé — formule ${formuleNumber} (PDF joint, copie dans l'espace${body.copyAdmin === true ? ", copie admin" : ""})`,
        user_admin: auth.user.email || "admin",
      },
    ]);
    if (actionError) console.warn("send-contract log:", actionError.message);

    return NextResponse.json({ success: true, copyError: copyError || undefined });
  } catch (error: unknown) {
    console.error("send-contract:", errorMessage(error));
    return NextResponse.json(
      { success: false, error: "Erreur envoi email" },
      { status: 500 },
    );
  }
}
