import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { adminCapabilities } from "@/lib/adminRoles";

export async function GET(request) {
  const auth = await getAuthenticatedAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const capabilities = adminCapabilities(auth.role);

  return NextResponse.json({
    ok: true,
    email: auth.user.email,
    role: capabilities.role,
  });
}
