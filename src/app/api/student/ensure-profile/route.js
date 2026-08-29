import { NextResponse } from "next/server";
import {
  findContactByEmail,
  getAuthenticatedUser,
  publicStudentProfile,
} from "@/lib/studentAuth";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const contact = await findContactByEmail(auth.admin, auth.user.email);

    return NextResponse.json({
      success: true,
      profile: publicStudentProfile(contact, auth.user.email),
    });
  } catch (error) {
    console.error("student ensure-profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
