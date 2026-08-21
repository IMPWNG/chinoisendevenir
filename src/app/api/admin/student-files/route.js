import { NextResponse } from "next/server";
import {
  STUDENT_DOCUMENT_BUCKET,
  ensureStudentBucket,
  getAuthenticatedAdmin,
} from "@/lib/studentAuth";
import {
  adminFolder,
  createDocumentSignedUrl,
  getRequiredDocumentsStatus,
  isAdminSentPath,
  isOwnedStoragePath,
  listAdminSentDocuments,
  safeFileName,
  validateDocumentFile,
} from "@/lib/studentDocuments";

async function loadFiles(admin, contactId) {
  const [requiredDocuments, adminDocuments] = await Promise.all([
    getRequiredDocumentsStatus(admin, contactId),
    listAdminSentDocuments(admin, contactId),
  ]);
  return { requiredDocuments, adminDocuments };
}

export async function GET(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const contactId = request.nextUrl.searchParams.get("contactId");
    const path = request.nextUrl.searchParams.get("path");

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId manquant" },
        { status: 400 },
      );
    }

    await ensureStudentBucket(auth.admin);

    if (path) {
      if (!isOwnedStoragePath(contactId, path)) {
        return NextResponse.json(
          { error: "Document introuvable" },
          { status: 400 },
        );
      }
      const url = await createDocumentSignedUrl(auth.admin, path);
      return NextResponse.json({
        success: true,
        url,
        name: path.split("/").pop(),
      });
    }

    const files = await loadFiles(auth.admin, contactId);
    return NextResponse.json({ success: true, ...files });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const contactId = String(formData.get("contactId") || "");
    const file = formData.get("file");

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId manquant" },
        { status: 400 },
      );
    }

    const invalid = validateDocumentFile(file);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    await ensureStudentBucket(auth.admin);

    const folder = adminFolder(contactId);
    const path = `${folder}/${Date.now()}_${safeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await auth.admin.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Échec de l'envoi du document" },
        { status: 500 },
      );
    }

    const files = await loadFiles(auth.admin, contactId);
    return NextResponse.json({ success: true, ...files });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "");
    const path = String(body.path || "");

    if (!contactId || !isAdminSentPath(contactId, path)) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 400 },
      );
    }

    const { error: removeError } = await auth.admin.storage
      .from(STUDENT_DOCUMENT_BUCKET)
      .remove([path]);

    if (removeError) {
      return NextResponse.json(
        { error: removeError.message || "Impossible de supprimer le document" },
        { status: 500 },
      );
    }

    await auth.admin.from("suivi_actions").insert({
      contact_id: contactId,
      action: "contact_modifier",
      description: `Document retiré de l'espace étudiant : ${path.split("/").pop()}`,
      user_admin: auth.user.email,
    });

    const files = await loadFiles(auth.admin, contactId);
    return NextResponse.json({ success: true, ...files });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
