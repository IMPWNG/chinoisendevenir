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

    return NextResponse.json({
      success: true,
      profile: publicStudentProfile(auth.contact),
      document,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
