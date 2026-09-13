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
import type { StudentDocRef } from "@/lib/studentProgress";
import { listMatchingRuns, MATCHING_KIND_CHINESE } from "@/lib/matching/persist";
import {
  chineseMatchingForStudent,
  matchingForStudent,
} from "@/lib/matching/studentView";
import { errorMessage } from "@/lib/request";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const profile = publicStudentProfile(auth.contact, auth.user.email);
    let requiredDocuments: StudentDocRef[] = [];
    let adminDocuments: unknown[] = [];
    let matching = null;
    let chineseMatching = null;

    if (profile.hasForm && profile.unlocked && auth.contact) {
      if (profile.access?.documents) {
        await ensureStudentBucket(auth.admin);
        const [required, adminDocs] = await Promise.all([
          getRequiredDocumentsStatus(auth.admin, auth.contact.id, auth.contact),
          listAdminSentDocuments(auth.admin, auth.contact.id),
        ]);
        requiredDocuments = required as StudentDocRef[];
        adminDocuments = adminDocs;
      }

      try {
        const runs = (await listMatchingRuns(auth.admin, auth.contact.id, {
          kind: "all",
        })) as Array<{ result?: { kind?: string } }>;
        const universityRun = runs.find(
          (run) => run.result?.kind !== MATCHING_KIND_CHINESE,
        );
        const chineseRun = runs.find(
          (run) => run.result?.kind === MATCHING_KIND_CHINESE,
        );
        matching = matchingForStudent(universityRun?.result || null, profile.formuleNumber, {
          documents: requiredDocuments,
          adminDocuments,
        });
        chineseMatching = chineseMatchingForStudent(
          chineseRun?.result || null,
          profile.formuleNumber,
        );
      } catch (error) {
        console.warn("student matching:", errorMessage(error));
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
