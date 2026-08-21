import { NextResponse } from "next/server";
import {
  getAuthenticatedContact,
  publicStudentProfile,
  ensureStudentBucket,
} from "@/lib/studentAuth";
import {
  getRequiredDocumentsStatus,
  listAdminSentDocuments,
} from "@/lib/studentDocuments";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const profile = publicStudentProfile(auth.contact);
    let requiredDocuments = [];
    let adminDocuments = [];

    if (profile.unlocked) {
      await ensureStudentBucket(auth.admin);
      [requiredDocuments, adminDocuments] = await Promise.all([
        getRequiredDocumentsStatus(auth.admin, auth.contact.id),
        listAdminSentDocuments(auth.admin, auth.contact.id),
      ]);
    }

    return NextResponse.json({
      success: true,
      profile,
      requiredDocuments,
      adminDocuments,
      unlocked: profile.unlocked,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
