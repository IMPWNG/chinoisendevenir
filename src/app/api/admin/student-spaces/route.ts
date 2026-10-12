import { NextResponse } from "next/server";
import { listStudentSpaceEmails } from "@/lib/authUsers";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export async function GET(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const emails = await listStudentSpaceEmails(auth.admin);
    return NextResponse.json({ emails });
  } catch (error) {
    console.error("student-spaces:", error);
    return NextResponse.json({ emails: [] });
  }
}
