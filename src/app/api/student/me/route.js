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
import { listMatchingRuns } from "@/lib/matching/persist";
import { matchingForStudent } from "@/lib/matching/studentView";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const profile = publicStudentProfile(auth.contact, auth.user.email);
    let requiredDocuments = [];
    let adminDocuments = [];
    let matching = null;

    if (profile.hasForm && profile.unlocked && auth.contact) {
      if (profile.access?.documents) {
        await ensureStudentBucket(auth.admin);
        [requiredDocuments, adminDocuments] = await Promise.all([
          getRequiredDocumentsStatus(auth.admin, auth.contact.id),
          listAdminSentDocuments(auth.admin, auth.contact.id),
        ]);
      }

      try {
        const runs = await listMatchingRuns(auth.admin, auth.contact.id);
        const latest = runs[0]?.result || null;
        matching = matchingForStudent(latest, profile.formuleNumber, {
          documents: requiredDocuments,
          adminDocuments,
        });
      } catch (error) {
        console.warn("student matching:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      requiredDocuments,
      adminDocuments,
      matching,
      hasForm: profile.hasForm,
      paid: profile.paid,
      unlocked: profile.unlocked,
    });
  } catch (error) {
    console.error("student me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
