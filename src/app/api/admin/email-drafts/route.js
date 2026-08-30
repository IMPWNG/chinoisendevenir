import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { rateLimit } from "@/lib/httpSecurity";
import { listEmailDrafts, updateEmailDraft } from "@/lib/appointments";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const contactId = String(
      request.nextUrl.searchParams.get("contactId") || "",
    ).trim();
    const status = request.nextUrl.searchParams.get("status") || "pending";
    const listed = await listEmailDrafts(auth.admin, {
      contactId: contactId || undefined,
      status: status === "all" ? null : status,
    });

    if (listed.missingTable) {
      return NextResponse.json({
        success: true,
        missingTable: true,
        drafts: [],
      });
    }

    return NextResponse.json({ success: true, drafts: listed.drafts });
  } catch (error) {
    console.error("email-drafts GET:", error);
    return NextResponse.json(
      { success: false, error: "Lecture impossible" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status || 403 },
      );
    }

    const limited = rateLimit({
      key: `email-drafts:${auth.user.id}`,
      limit: 40,
      windowMs: 10 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { success: false, error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const updated = await updateEmailDraft(auth.admin, body.id, body);
    if (!updated.ok) {
      return NextResponse.json(
        { success: false, error: updated.error },
        { status: updated.status || 400 },
      );
    }
    return NextResponse.json({ success: true, draft: updated.draft });
  } catch (error) {
    console.error("email-drafts PATCH:", error);
    return NextResponse.json(
      { success: false, error: "Mise à jour impossible" },
      { status: 500 },
    );
  }
}
