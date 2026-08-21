import {
  STUDENT_DOCUMENT_BUCKET,
  STUDENT_DOCUMENT_FOLDER,
} from "./studentAuth";
import { REQUIRED_STUDENT_DOCUMENTS } from "./studentProgress";

export { REQUIRED_STUDENT_DOCUMENTS };

export const FOLDER_REQUIRED = "required";
export const FOLDER_ADMIN = "from-admin";

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export function safeFileName(name) {
  const cleaned = String(name || "document")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  return cleaned || "document";
}

export function isRequiredDocKey(key) {
  return REQUIRED_STUDENT_DOCUMENTS.some((item) => item.key === key);
}

export function requiredFolder(contactId, docKey) {
  return `${contactId}/${FOLDER_REQUIRED}/${docKey}`;
}

export function adminFolder(contactId) {
  return `${contactId}/${FOLDER_ADMIN}`;
}

export function isOwnedStoragePath(contactId, path) {
  const prefix = `${contactId}/`;
  const value = String(path || "");
  return (
    value.startsWith(prefix) &&
    !value.includes("..") &&
    value.length > prefix.length
  );
}

export function isAdminSentPath(contactId, path) {
  const prefix = `${adminFolder(contactId)}/`;
  return isOwnedStoragePath(contactId, path) && String(path || "").startsWith(prefix);
}

function toFileMeta(folder, file) {
  if (!file?.name) return null;
  return {
    name: file.name,
    path: `${folder}/${file.name}`,
    updated_at: file.updated_at || file.created_at || null,
  };
}

async function listStorageFiles(admin, folder) {
  const { data, error } = await admin.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (error || !data) return [];
  return data.filter((item) => item.name && item.id !== null);
}

async function getLegacyRequiredFile(admin, contactId) {
  const folder = `${contactId}/${STUDENT_DOCUMENT_FOLDER}`;
  const files = await listStorageFiles(admin, folder);
  return toFileMeta(folder, files[0]);
}

export async function getRequiredDocumentsStatus(admin, contactId) {
  const results = [];

  for (const spec of REQUIRED_STUDENT_DOCUMENTS) {
    const folder = requiredFolder(contactId, spec.key);
    const files = await listStorageFiles(admin, folder);
    results.push({
      key: spec.key,
      label: spec.label,
      icon: spec.icon,
      description: spec.description,
      status: files[0] ? "received" : "missing",
      file: toFileMeta(folder, files[0]),
    });
  }

  const passeport = results.find((item) => item.key === "passeport");
  if (passeport && !passeport.file) {
    const legacy = await getLegacyRequiredFile(admin, contactId);
    if (legacy) {
      passeport.status = "received";
      passeport.file = legacy;
    }
  }

  return results;
}

export async function listAdminSentDocuments(admin, contactId) {
  const folder = adminFolder(contactId);
  const files = await listStorageFiles(admin, folder);
  return files.map((file) => ({
    ...toFileMeta(folder, file),
    direction: "sent",
  }));
}

export async function replaceFolderFile(admin, folder, file) {
  const existing = await listStorageFiles(admin, folder);
  if (existing.length) {
    await admin.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .remove(existing.map((item) => `${folder}/${item.name}`));
  }

  const path = `${folder}/${safeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    throw new Error(error.message || "Échec de l'envoi du document");
  }

  return path;
}

export async function createDocumentSignedUrl(admin, path) {
  const { data, error } = await admin.storage
    .from(STUDENT_DOCUMENT_BUCKET)
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    throw new Error("Impossible de générer le lien de téléchargement");
  }

  return data.signedUrl;
}

export function validateDocumentFile(file) {
  if (!file || typeof file === "string") {
    return "Veuillez choisir un fichier";
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    return "Fichier trop volumineux (max 10 Mo)";
  }
  if (file.type && !ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return "Formats acceptés : PDF, JPG, PNG";
  }
  return null;
}
