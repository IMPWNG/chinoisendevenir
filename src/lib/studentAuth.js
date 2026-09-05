import { getSupabaseAdmin } from "./supabaseAdmin";
import {
  displayFormuleLabel,
  getFormuleNumber,
  getUnlockedStudentAccess,
} from "./formules";
import {
  isStudentSpaceUnlocked,
  isStudentAccessGranted,
  hasFilledLeadForm,
  getChosenFormule,
  getDisplayedStepIndex,
  getGrantedFormuleNumber,
} from "./studentProgress";

import {
  getAdminEmailAllowlist,
  resolveAdminRole,
} from "./adminRoles";

export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_DOCUMENT_FOLDER = "document-requis";

export function publicStudentProfile(contact, userEmail = "") {
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
    formule,
    formuleLabel: formule ? displayFormuleLabel(formule) : "",
    formuleNumber: formuleNumber || null,
    access: getUnlockedStudentAccess(unlocked ? formuleNumber || 1 : 0),
    suivi_statut: contact.suivi_statut || "",
    dossier_etape: getDisplayedStepIndex(contact),
    adminUnlocked: isStudentSpaceUnlocked(contact.suivi_statut),
  };
}

function filled(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

export async function getAuthenticatedUser(request) {
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

export function isAdminEmail(email) {
  const value = String(email || "").toLowerCase();
  if (!value) return false;
  return getAdminEmailAllowlist().has(value);
}

function tableMissing(error) {
  const message = String(error?.message || "").toLowerCase();
  if (!message.includes("admin_users")) return false;
  if (message.includes("column")) return false;
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

function roleColumnMissing(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("role") && message.includes("column");
}

export async function getAdminAccess(admin, user) {
  const email = String(user?.email || "").toLowerCase();
  const allowlist = getAdminEmailAllowlist();

  if (allowlist.size > 0 && !allowlist.has(email)) {
    return { approved: false, role: null };
  }

  let { data, error } = await admin
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

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
    if (!data?.user_id) return { approved: false, role: null };
    return { approved: true, role: resolveAdminRole(email, data.role) };
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

export async function isApprovedAdmin(admin, user) {
  const access = await getAdminAccess(admin, user);
  return access.approved;
}

export async function getAuthenticatedAdmin(request) {
  const auth = await getAuthenticatedUser(request);
  if (auth.error) return auth;

  const access = await getAdminAccess(auth.admin, auth.user);
  if (!access.approved) {
    return { error: "Accès admin requis", status: 403 };
  }

  return { ...auth, role: access.role };
}

export async function findContactByEmail(admin, email) {
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

  if (rows?.[0]) return rows[0];

  const { data: fallback, error: fallbackError } = await admin
    .from("contacts")
    .select("*")
    .ilike("email", normalized)
    .order("created_at", { ascending: true })
    .limit(1);

  if (fallbackError) {
    throw new Error("Erreur recherche dossier");
  }

  return fallback?.[0] || null;
}

export async function ensureStudentContact(admin, user, extras = {}) {
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
    const patch = {};
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

  const insertPayload = {
    email,
    source: "espace_etudiant",
    suivi_statut: "mail_bienvenue_envoyé",
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

export async function getAuthenticatedContact(request) {
  const auth = await getAuthenticatedUser(request);
  if (auth.error) return auth;

  try {
    const contact = await findContactByEmail(auth.admin, auth.user.email);
    return { user: auth.user, contact, admin: auth.admin };
  } catch (error) {
    console.error("getAuthenticatedContact:", error);
    return { error: "Erreur recherche dossier", status: 500 };
  }
}

export async function ensureStudentBucket(admin) {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = (buckets || []).some(
      (bucket) => bucket.name === STUDENT_DOCUMENT_BUCKET,
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
    console.warn("⚠️ Bucket student-documents:", error.message);
  }
}

export async function getStudentDocument(admin, contactId) {
  const folder = `${contactId}/${STUDENT_DOCUMENT_FOLDER}`;
  const { data, error } = await admin.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .list(folder);

  if (error || !data?.length) return null;

  const file = data.find((item) => item.name && item.id !== null);
  if (!file) return null;

  return {
    name: file.name,
    path: `${folder}/${file.name}`,
    updated_at: file.updated_at || file.created_at || null,
  };
}
