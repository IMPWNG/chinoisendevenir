import { getSupabaseAdmin } from "./supabaseAdmin";

export const STUDENT_DOCUMENT_BUCKET = "student-documents";
export const STUDENT_DOCUMENT_FOLDER = "document-requis";

export function publicStudentProfile(contact) {
  if (!contact) return null;
  return {
    id: contact.id,
    prenom: contact.prenom || "",
    nom: contact.nom || "",
    email: contact.email || "",
    age: contact.age || "",
    phone: contact.phone || "",
    pays: contact.pays || "",
    dernier_diplome: contact.dernier_diplome || "",
    domaine_etudes: contact.domaine_etudes || "",
    budget: contact.budget || "",
    date_rentree: contact.date_rentree || "",
    suivi_statut: contact.suivi_statut || "",
  };
}

export async function getAuthenticatedContact(request) {
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

  const { data: rows, error: lookupError } = await admin
    .from("contacts")
    .select("*")
    .ilike("email", user.email)
    .order("created_at", { ascending: true })
    .limit(1);

  if (lookupError) {
    return { error: "Erreur recherche dossier", status: 500 };
  }

  const contact = rows?.[0];
  if (!contact) {
    return {
      error: "Aucun dossier étudiant trouvé pour cet email",
      status: 403,
      user,
    };
  }

  return { user, contact, admin };
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
