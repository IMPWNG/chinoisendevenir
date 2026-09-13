import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin, type AdminClient } from "./supabaseAdmin";
import {
  displayFormuleLabel,
  getFormuleNumber,
  getUnlockedStudentAccess,
} from "./formules";
import {
  isStudentSpaceUnlocked,
  isStudentAccessGranted,
  canStudentChooseFormule,
  hasFilledLeadForm,
  getChosenFormule,
  getDisplayedStepIndex,
  getGrantedFormuleNumber,
  type ContactRow,
} from "./studentProgress";

import {
  getAdminEmailAllowlist,
  resolveAdminRole,
  type AdminRole,
} from "./adminRoles";
import { toStoredStatut } from "./suiviStatuts";

export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_DOCUMENT_FOLDER = "document-requis";

export function publicStudentProfile(contact: ContactRow | null | undefined, userEmail = "") {
  if (!contact) {
    return {
      id: null,
      prenom: "",
      nom: "",
      email: userEmail || "",
      age: "",
      phone: "",
      pays: "",
      dernier_diplome: "",
      domaine_etudes: "",
      budget: "",
      date_rentree: "",
      hasForm: false,
      paid: false,
      unlocked: false,
      canChooseFormule: false,
      formule: "",
      formuleLabel: "",
      formuleNumber: null,
      access: getUnlockedStudentAccess(0),
      suivi_statut: "",
      dossier_etape: 0,
    };
  }

  const formule = getChosenFormule(contact);
  const unlocked = isStudentAccessGranted(contact);
  const formuleNumber = getGrantedFormuleNumber(contact) || getFormuleNumber(formule);
  const hasForm = hasFilledLeadForm(contact);

  return {
    id: contact.id,
    prenom: contact.prenom || "",
    nom: contact.nom || "",
    email: contact.email || userEmail || "",
    age: contact.age || "",
    phone: contact.phone || "",
    pays: contact.pays || "",
    dernier_diplome: contact.dernier_diplome || "",
    domaine_etudes: contact.domaine_etudes || "",
    budget: contact.budget || "",
    date_rentree: contact.date_rentree || "",
    hasForm,
    paid: unlocked,
    unlocked,
    canChooseFormule: canStudentChooseFormule(contact),
    formule,
    formuleLabel: formule ? displayFormuleLabel(formule) : "",
    formuleNumber: formuleNumber || null,
    access: getUnlockedStudentAccess(unlocked ? formuleNumber || 1 : 0),
    suivi_statut: contact.suivi_statut || "",
    dossier_etape: getDisplayedStepIndex(contact),
    adminUnlocked: isStudentSpaceUnlocked(contact.suivi_statut),
  };
}

function filled(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export type AuthErrorResult = { error: string; status: number };

export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthErrorResult | { user: User; admin: AdminClient }> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return { error: "Non authentifié", status: 401 };
  }

  const admin = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);

  if (error || !user?.email) {
    return { error: "Session invalide", status: 401 };
  }

  return { user, admin };
}

export { getAdminEmailAllowlist } from "./adminRoles";

function tableMissing(error: { message?: string } | null | undefined) {
  const message = String(error?.message || "").toLowerCase();
  if (!message.includes("admin_users")) return false;
  if (message.includes("column")) return false;
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

function roleColumnMissing(error: { message?: string } | null | undefined) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("role") && message.includes("column");
}

export async function getAdminAccess(
  admin: AdminClient,
  user: { id: string; email?: string | null },
) {
  const email = String(user?.email || "").toLowerCase();
  const allowlist = getAdminEmailAllowlist();

  let data: { user_id?: string; role?: string | null } | null = null;
  let error: { message?: string } | null = null;

  {
    const first = await admin
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", user.id)
      .maybeSingle();
    data = first.data;
    error = first.error;
  }

  if (error && roleColumnMissing(error)) {
    const retry = await admin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (!error) {
    if (data?.user_id) {
      return { approved: true, role: resolveAdminRole(email, data.role) };
    }
    if (allowlist.has(email)) {
      return { approved: true, role: resolveAdminRole(email, null) };
    }
    return { approved: false, role: null };
  }

  // Table not created yet: allowlist-only fallback so you are not locked out
  // before running sql/admin-security.sql. With no allowlist, deny everyone.
  if (tableMissing(error)) {
    if (!allowlist.has(email)) return { approved: false, role: null };
    return { approved: true, role: resolveAdminRole(email, null) };
  }

  console.error("admin_users check failed:", error.message);
  return { approved: false, role: null };
}

export async function getAuthenticatedAdmin(request: Request): Promise<
  | AuthErrorResult
  | { user: User; admin: AdminClient; role: AdminRole | null }
> {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth;

  const access = await getAdminAccess(auth.admin, auth.user);
  if (!access.approved) {
    return { error: "Accès admin requis", status: 403 };
  }

  return { user: auth.user, admin: auth.admin, role: access.role };
}

export async function findContactByEmail(
  admin: AdminClient,
  email: unknown,
): Promise<ContactRow | null> {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();

  const { data: rows, error } = await admin
    .from("contacts")
    .select("*")
    .eq("email", normalized)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    throw new Error("Erreur recherche dossier");
  }

  if (rows?.[0]) return rows[0] as ContactRow;

  const { data: fallback, error: fallbackError } = await admin
    .from("contacts")
    .select("*")
    .ilike("email", normalized)
    .order("created_at", { ascending: true })
    .limit(1);

  if (fallbackError) {
    throw new Error("Erreur recherche dossier");
  }

  return (fallback?.[0] as ContactRow | undefined) || null;
}

export async function ensureStudentContact(
  admin: AdminClient,
  user: { email?: string | null; user_metadata?: Record<string, unknown> },
  extras: Record<string, unknown> = {},
) {
  const email = String(user.email || "").trim().toLowerCase();
  const metadata = user.user_metadata || {};
  const prenom =
    filled(extras.prenom) || filled(metadata.prenom) || filled(metadata.first_name);
  const nom =
    filled(extras.nom) || filled(metadata.nom) || filled(metadata.last_name);
  const pays = filled(extras.pays) || filled(metadata.pays);
  const phone = filled(extras.phone) || filled(metadata.phone);

  let contact = await findContactByEmail(admin, email);

  if (contact) {
    const patch: Record<string, string> = {};
    if (!filled(contact.prenom) && prenom) patch.prenom = prenom;
    if (!filled(contact.nom) && nom) patch.nom = nom;
    if (!filled(contact.pays) && pays) patch.pays = pays;
    if (!filled(contact.phone) && phone) patch.phone = phone;

    if (Object.keys(patch).length === 0) return contact;

    const { data: updated } = await admin
      .from("contacts")
      .update(patch)
      .eq("id", contact.id)
      .select()
      .single();

    return updated || contact;
  }

  const insertPayload: Record<string, unknown> = {
    email,
    source: "espace_etudiant",
    suivi_statut: toStoredStatut("bienvenue_envoyé"),
    created_at: new Date().toISOString(),
  };
  if (prenom) insertPayload.prenom = prenom;
  if (nom) insertPayload.nom = nom;
  if (pays) insertPayload.pays = pays;
  if (phone) insertPayload.phone = phone;

  const { data: created, error: insertError } = await admin
    .from("contacts")
    .insert([insertPayload])
    .select()
    .single();

  if (insertError) {
    throw new Error("Impossible de créer le dossier");
  }

  try {
    await admin.from("suivi_actions").insert({
      contact_id: created.id,
      action: "email_envoye",
      description: `Compte espace étudiant créé pour ${email}`,
      user_admin: email,
    });
  } catch (_error) {
    // L'action n'est pas bloquante pour la création du compte.
  }

  return created;
}

export async function getAuthenticatedContact(request: Request): Promise<
  | AuthErrorResult
  | { user: User; contact: ContactRow | null; admin: AdminClient }
> {
  const auth = await getAuthenticatedUser(request);
  if ("error" in auth) return auth;

  try {
    const contact = await findContactByEmail(auth.admin, auth.user?.email);
    return { user: auth.user, contact, admin: auth.admin };
  } catch (error) {
    console.error("getAuthenticatedContact:", error);
    return { error: "Erreur recherche dossier", status: 500 };
  }
}

export async function ensureStudentBucket(admin: AdminClient) {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = (buckets || []).some(
      (bucket: { name?: string }) => bucket.name === STUDENT_DOCUMENT_BUCKET,
    );

    if (!exists) {
      await admin.storage.createBucket(STUDENT_DOCUMENT_BUCKET, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
      });
    }
  } catch (error) {
    console.warn("⚠️ Bucket student-documents:", error);
  }
}
