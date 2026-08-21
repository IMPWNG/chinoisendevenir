import { NextResponse } from "next/server";
import {
  STUDENT_DOCUMENT_BUCKET,
  STUDENT_DOCUMENT_FOLDER,
  ensureStudentBucket,
  getAuthenticatedContact,
  getStudentDocument,
} from "@/lib/studentAuth";
import { isStudentSpaceUnlocked } from "@/lib/studentProgress";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

function safeFileName(name) {
  const cleaned = String(name || "document")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  return cleaned || "document";
}

export async function GET(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isStudentSpaceUnlocked(auth.contact.suivi_statut)) {
      return NextResponse.json(
        {
          error:
            "Les documents seront disponibles une fois votre formule validée.",
        },
        { status: 403 },
      );
    }

    await ensureStudentBucket(auth.admin);
    const document = await getStudentDocument(auth.admin, auth.contact.id);
    if (!document) {
      return NextResponse.json(
        { error: "Aucun document à télécharger" },
        { status: 404 },
      );
    }

    const { data, error } = await auth.admin.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .createSignedUrl(document.path, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: "Impossible de générer le lien de téléchargement" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
      name: document.name,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!isStudentSpaceUnlocked(auth.contact.suivi_statut)) {
      return NextResponse.json(
        {
          error:
            "Les documents seront disponibles une fois votre formule validée.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Veuillez choisir un fichier" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10 Mo)" },
        { status: 400 },
      );
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formats acceptés : PDF, JPG, PNG" },
        { status: 400 },
      );
    }

    await ensureStudentBucket(auth.admin);

    const existing = await getStudentDocument(auth.admin, auth.contact.id);
    if (existing) {
      await auth.admin.storage
        .from(STUDENT_DOCUMENT_BUCKET)
        .remove([existing.path]);
    }

    const path = `${auth.contact.id}/${STUDENT_DOCUMENT_FOLDER}/${safeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await auth.admin.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Échec de l'envoi du document" },
        { status: 500 },
      );
    }

    await auth.admin.from("suivi_actions").insert({
      contact_id: auth.contact.id,
      action: "document_envoye",
      description: `Document requis envoyé : ${file.name}`,
      user_admin: auth.user.email,
    });

    const document = await getStudentDocument(auth.admin, auth.contact.id);
    return NextResponse.json({ success: true, document });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
