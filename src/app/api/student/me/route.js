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
import { listMatchingRuns, MATCHING_KIND_CHINESE } from "@/lib/matching/persist";
import {
  chineseMatchingForStudent,
  matchingForStudent,
} from "@/lib/matching/studentView";

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
    let chineseMatching = null;

    if (profile.hasForm && profile.unlocked && auth.contact) {
      if (profile.access?.documents) {
        await ensureStudentBucket(auth.admin);
        [requiredDocuments, adminDocuments] = await Promise.all([
          getRequiredDocumentsStatus(auth.admin, auth.contact.id, auth.contact),
          listAdminSentDocuments(auth.admin, auth.contact.id),
        ]);
      }

      try {
        const [runs, chineseRuns] = await Promise.all([
          listMatchingRuns(auth.admin, auth.contact.id),
          listMatchingRuns(auth.admin, auth.contact.id, {
            kind: MATCHING_KIND_CHINESE,
          }),
        ]);
        matching = matchingForStudent(runs[0]?.result || null, profile.formuleNumber, {
          documents: requiredDocuments,
          adminDocuments,
        });
        chineseMatching = chineseMatchingForStudent(
          chineseRuns[0]?.result || null,
          profile.formuleNumber,
        );
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
      chineseMatching,
      hasForm: profile.hasForm,
      paid: profile.paid,
      unlocked: profile.unlocked,
    });
  } catch (error) {
    console.error("student me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
