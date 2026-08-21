import { NextResponse } from "next/server";
import {
  getAuthenticatedContact,
  ensureStudentBucket,
} from "@/lib/studentAuth";
import { isStudentSpaceUnlocked } from "@/lib/studentProgress";
import {
  createDocumentSignedUrl,
  getRequiredDocumentsStatus,
  isOwnedStoragePath,
  isRequiredDocKey,
  listAdminSentDocuments,
  replaceFolderFile,
  requiredFolder,
  validateDocumentFile,
} from "@/lib/studentDocuments";

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

    const path = request.nextUrl.searchParams.get("path");
    if (!path || !isOwnedStoragePath(auth.contact.id, path)) {
      return NextResponse.json(
        { error: "Document introuvable" },
        { status: 400 },
      );
    }

    await ensureStudentBucket(auth.admin);
    const url = await createDocumentSignedUrl(auth.admin, path);
    const name = path.split("/").pop();

    return NextResponse.json({ success: true, url, name });
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
    const docKey = String(formData.get("docKey") || "");

    if (!isRequiredDocKey(docKey)) {
      return NextResponse.json(
        { error: "Type de document invalide" },
        { status: 400 },
      );
    }

    const invalid = validateDocumentFile(file);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    await ensureStudentBucket(auth.admin);
    await replaceFolderFile(
      auth.admin,
      requiredFolder(auth.contact.id, docKey),
      file,
    );

    await auth.admin.from("suivi_actions").insert({
      contact_id: auth.contact.id,
      action: "document_envoye",
      description: `Document requis envoyé (${docKey}) : ${file.name}`,
      user_admin: auth.user.email,
    });

    const [requiredDocuments, adminDocuments] = await Promise.all([
      getRequiredDocumentsStatus(auth.admin, auth.contact.id),
      listAdminSentDocuments(auth.admin, auth.contact.id),
    ]);

    return NextResponse.json({
      success: true,
      requiredDocuments,
      adminDocuments,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
