import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export async function GET(request) {
  const auth = await getAuthenticatedAdmin(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    ok: true,
    email: auth.user.email,
  });
}
