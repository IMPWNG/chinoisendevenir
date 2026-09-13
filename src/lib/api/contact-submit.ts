import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getResendApiKey, getSupabaseAdmin } from "../supabaseAdmin";
import { CONTACT_FROM, INBOUND_REPLY_TO } from "../emailConfig";
import { wrapEmailHtml, withEtudeChineSubject } from "../emailLayout";
import { getClientIp, rateLimit } from "../httpSecurity";
import { canonicalStatut, EARLY_STATUSES, toStoredStatut } from "../suiviStatuts";
import { isValidPhone } from "../contactForm";
import { readJsonObject, asString, errorMessage } from "../request";

// ✅ Liste standardisée des domaines d'études (doit matcher le front)
const DOMAINES_VALIDES = [
  "Informatique / IA / Data Science",
  "Ingénierie / Génie civil",
  "Génie électrique / Énergie",
  "Génie mécanique",
  "Aérospatial",
  "Architecture",
  "Commerce / Business",
  "Commerce international",
  "Management / Gestion",
  "Marketing digital",
  "Banque / Finance / Assurance",
  "Droit",
  "Science politique",
  "Sciences pharmaceutiques",
  "Agriculture",
  "Hydrologie",
  "Langues",
];

function generateEmailTemplate(prenom: string) {
  return wrapEmailHtml({
    title: "Bienvenue — votre projet est bien reçu",
    subtitle: "Étudier en Chine, étape par étape",
    prenom,
    bodyHtml: `
            <div class="section">
              <p>Merci d'avoir transmis votre demande. Nous avons bien reçu vos informations et votre profil va être lu avec attention.</p>
              <p>Cette première lecture nous permet d'identifier les pistes les plus réalistes pour vous : formations, universités, calendrier et, le cas échéant, pistes de financement.</p>
            </div>
            <div class="section">
              <div class="section-title">Ce que nous faisons ensuite</div>
              <ul class="formule-list">
                <li>Analyse de votre parcours et de vos objectifs</li>
                <li>Repérage des formations et universités adaptées</li>
                <li>Point sur les bourses éventuellement accessibles</li>
                <li>Préparation des prochaines étapes de candidature</li>
              </ul>
            </div>
            <div class="section">
              <p>Nous reviendrons vers vous pour vous présenter les options correspondant à votre situation, ainsi que nos formules d'accompagnement.</p>
            </div>
            <div class="note">
              <p>Aucune admission ni bourse ne peut être garantie. Les décisions finales appartiennent aux universités et aux organismes concernés.</p>
            </div>
            <div class="cta">
              <p>Si vous souhaitez poursuivre, répondez simplement à cet e-mail par :</p>
              <div class="cta-choice">Je souhaite recevoir les informations sur l'accompagnement.</div>
            </div>
    `,
  });
}

const supabase = getSupabaseAdmin();
const resend = new Resend(getResendApiKey());

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}

function pick(formValue: unknown, existingValue: unknown): unknown {
  return isFilled(formValue) ? formValue : (existingValue ?? null);
}

function mergeNotes(existingNotes: unknown, incomingNotes: unknown): unknown {
  if (!isFilled(incomingNotes)) return existingNotes || null;
  if (!isFilled(existingNotes)) return incomingNotes;
  if (String(existingNotes).includes(String(incomingNotes))) {
    return existingNotes;
  }
  return `${existingNotes}\n---\n${incomingNotes}`;
}

export default async function handler(request: Request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200 });
  }

  if (request.method !== "POST") {
    return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
  }

  const limited = rateLimit({
    key: `contact-submit:${getClientIp(request.headers)}`,
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Trop de requêtes. Réessayez plus tard.",
        code: "rate_limit",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      },
    );
  }

  if (!getResendApiKey()) {
    console.error("❌ Variables d'environnement manquantes pour contact-submit");
    return NextResponse.json(
      { error: "Service temporairement indisponible" },
      { status: 500 },
    );
  }

  try {
    const body = await readJsonObject(request);
    if (!body) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const prenom = body.prenom;
    const nom = body.nom;
    const email = body.email;
    const age = body.age;
    const pays = body.pays;
    const phone = body.phone;
    const domaine_etudes = body.domaine_etudes;
    const budget = body.budget;
    const date_rentree = body.date_rentree;
    const dernier_diplome = body.dernier_diplome;
    const notes_admin = body.notes_admin;

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      email.length > 254
    ) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    if (
      !prenom ||
      !nom ||
      !pays ||
      String(prenom).length > 80 ||
      String(nom).length > 80 ||
      String(pays).length > 80
    ) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 },
      );
    }

    if (notes_admin && String(notes_admin).length > 2000) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: "Téléphone invalide" }, { status: 400 });
    }

    let domaineFinal: string | null = null;
    if (domaine_etudes) {
      const trimmed = String(domaine_etudes).trim();

      if (trimmed.length === 0) {
        return NextResponse.json(
          { error: "Domaine d'études invalide (vide)" },
          { status: 400 },
        );
      }

      if (trimmed.length > 100) {
        return NextResponse.json(
          { error: "Domaine d'études trop long (max 100 caractères)" },
          { status: 400 },
        );
      }

      if (!DOMAINES_VALIDES.includes(trimmed)) {
        console.log("ℹ️ Domaine hors liste standard (cas 'Autre'):", trimmed);
      }

      domaineFinal = trimmed;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: existingRows, error: lookupError } = await supabase
      .from("contacts")
      .select("*")
      .ilike("email", normalizedEmail)
      .order("created_at", { ascending: true })
      .limit(1);

    if (lookupError) {
      console.error("❌ Erreur recherche contact:", lookupError);
      return NextResponse.json(
        { error: "Erreur recherche contact" },
        { status: 500 },
      );
    }

    const existing = (existingRows?.[0] as Record<string, unknown> | undefined) || null;
    const profilePayload: Record<string, unknown> = {
      prenom: pick(prenom, existing?.prenom),
      nom: pick(nom, existing?.nom),
      email: normalizedEmail,
      age: pick(age || null, existing?.age),
      pays: pick(pays, existing?.pays),
      phone: pick(phone || null, existing?.phone),
      domaine_etudes: pick(domaineFinal, existing?.domaine_etudes),
      dernier_diplome: pick(dernier_diplome || null, existing?.dernier_diplome),
      budget: pick(budget || null, existing?.budget),
      date_rentree: pick(date_rentree || null, existing?.date_rentree),
      notes_admin: mergeNotes(existing?.notes_admin, notes_admin),
      updated_at: new Date().toISOString(),
    };

    const currentStatut = canonicalStatut(
      existing?.suivi_statut as string | null | undefined,
    );
    if (!existing || !currentStatut || EARLY_STATUSES.has(currentStatut)) {
      profilePayload.suivi_statut = toStoredStatut("bienvenue_envoyé");
    }

    let contact = existing;
    let isUpdate = false;

    if (existing) {
      isUpdate = true;
      const { data: updated, error: updateError } = await supabase
        .from("contacts")
        .update(profilePayload)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.warn("⚠️ Update avec updated_at échoué, retry:", updateError.message);
        const { updated_at: _ignored, ...withoutUpdatedAt } = profilePayload;
        const { data: retried, error: retryError } = await supabase
          .from("contacts")
          .update(withoutUpdatedAt)
          .eq("id", existing.id)
          .select()
          .single();

        if (retryError) {
          console.error("❌ Erreur update contact:", retryError);
          return NextResponse.json(
            { error: "Erreur mise à jour contact" },
            { status: 500 },
          );
        }
        contact = retried as Record<string, unknown>;
      } else {
        contact = updated as Record<string, unknown>;
      }

      console.log(
        "✅ Contact mis à jour (même email):",
        contact.id,
        "-",
        normalizedEmail,
      );
    } else {
      const { data: created, error: insertError } = await supabase
        .from("contacts")
        .insert([
          {
            ...profilePayload,
            source: "website_vercel",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erreur Supabase contacts:", insertError);
        if (insertError.code === "23505") {
          return NextResponse.json(
            { error: "Cet email existe déjà", code: "duplicate" },
            { status: 409 },
          );
        }
        return NextResponse.json(
          {
            error:
              "Impossible d'enregistrer votre demande. Réessayez dans un instant.",
          },
          { status: 500 },
        );
      }

      contact = created as Record<string, unknown>;
      console.log("✅ Contact créé (PROD):", contact.id, "-", normalizedEmail);
    }

    const actionDescription = isUpdate
      ? `Formulaire site complété — profil mis à jour pour ${normalizedEmail}`
      : `Email de bienvenue envoyé à ${normalizedEmail}`;

    try {
      const { error: actionError } = await supabase.from("suivi_actions").insert([
        {
          contact_id: contact?.id,
          action: isUpdate ? "contact_modifier" : "email_envoye",
          description: actionDescription,
          user_admin: "système_automatique",
        },
      ]);

      if (actionError) {
        console.warn("⚠️ Erreur suivi_actions:", actionError);
      } else {
        console.log("✅ Action loggée: email_envoye");
      }
    } catch (actionError: unknown) {
      console.warn("⚠️ Erreur suivi_actions:", errorMessage(actionError));
    }

    try {
      const emailResponse = await resend.emails.send({
        from: CONTACT_FROM,
        replyTo: INBOUND_REPLY_TO,
        to: normalizedEmail,
        subject: withEtudeChineSubject(
          `Nous avons bien reçu votre demande, ${asString(prenom)}`,
        ),
        html: generateEmailTemplate(asString(prenom)),
      });

      if (emailResponse.error) {
        console.warn("⚠️ Erreur Resend:", emailResponse.error);
      } else {
        console.log("✅ Email envoyé:", emailResponse.data?.id);
      }
    } catch (emailError: unknown) {
      console.warn("⚠️ Erreur Resend (non bloquant):", errorMessage(emailError));
    }

    return NextResponse.json(
      {
        success: true,
        updated: isUpdate,
        message: `Bienvenue ${String(prenom).trim()} ✅`,
      },
      { status: isUpdate ? 200 : 201 },
    );
  } catch (error: unknown) {
    console.error("❌ Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
