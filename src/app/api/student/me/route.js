import { NextResponse } from "next/server";
import {
  getAuthenticatedContact,
  getStudentDocument,
  publicStudentProfile,
  ensureStudentBucket,
} from "@/lib/studentAuth";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    await ensureStudentBucket(auth.admin);
    const document = await getStudentDocument(auth.admin, auth.contact.id);

    const profile = publicStudentProfile(auth.contact);

    return NextResponse.json({
      success: true,
      profile,
      document: profile.unlocked ? document : null,
      unlocked: profile.unlocked,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
