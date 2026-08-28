import { NextResponse } from "next/server";
import {
  ensureStudentContact,
  getAuthenticatedUser,
  publicStudentProfile,
} from "@/lib/studentAuth";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const contact = await ensureStudentContact(auth.admin, auth.user, body);

    return NextResponse.json({
      success: true,
      profile: publicStudentProfile(contact),
    });
  } catch (error) {
    console.error("student ensure-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
