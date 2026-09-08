import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { requireFullAdmin } from "@/lib/adminRoles";
import {
  chineseCitiesFromCatalog,
  chineseMatchingSummary,
  compactChineseMatchingResult,
  runChineseMatching,
} from "@/lib/matching/chinese";
import {
  listMatchingRuns,
  MATCHING_KIND_CHINESE,
  saveMatchingRun,
} from "@/lib/matching/persist";

export async function GET(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }

    const contactId = String(
      request.nextUrl.searchParams.get("contactId") || "",
    ).trim();
    if (!contactId) {
      return NextResponse.json({ error: "contactId manquant" }, { status: 400 });
    }

    const runs = await listMatchingRuns(auth.admin, contactId, {
      kind: MATCHING_KIND_CHINESE,
    });

    return NextResponse.json({
      success: true,
      runs,
      latest: runs[0] || null,
      cities: [],
    });
  } catch (error) {
    console.error("chinese matching GET:", error);
    return NextResponse.json(
      { error: "Lecture impossible" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }

    const body = await request.json().catch(() => ({}));
    const contactId = String(body.contactId || "").trim();
    if (!contactId) {
      return NextResponse.json({ error: "contactId manquant" }, { status: 400 });
    }

    const [{ data: contact, error: contactError }, { data: universities, error: uniError }] =
      await Promise.all([
        auth.admin.from("contacts").select("*").eq("id", contactId).maybeSingle(),
        auth.admin.from("universities").select("*").order("name_zh", { ascending: true }),
      ]);

    if (contactError) throw contactError;
    if (!contact) {
      return NextResponse.json({ error: "Étudiant introuvable" }, { status: 404 });
    }
    if (uniError) throw uniError;
    if (!universities?.length) {
      return NextResponse.json(
        { error: "Aucune université en base. Importez d'abord le catalogue." },
        { status: 400 },
      );
    }

    const result = runChineseMatching({
      contact,
      universities,
      overrides: body.overrides || {},
    });

    if (!result.matches.length) {
      return NextResponse.json({
        success: true,
        saved: null,
        cities: chineseCitiesFromCatalog(universities),
        ...result,
        warning: "Aucune école de langue assez compatible avec ces critères.",
      });
    }

    const payload = compactChineseMatchingResult(result, body.overrides || {});
    let saved = null;
    try {
      saved = await saveMatchingRun(auth.admin, {
        contactId,
        createdBy: auth.user?.email || "admin",
        payload,
      });
    } catch (saveError) {
      console.warn("Chinese matching save failed:", saveError.message);
      return NextResponse.json({
        success: true,
        saved: null,
        save_error: saveError.message,
        cities: chineseCitiesFromCatalog(universities),
        ...result,
      });
    }

    try {
      await auth.admin.from("suivi_actions").insert({
        contact_id: contactId,
        action: "note_ajoutee",
        description: chineseMatchingSummary(payload),
        user_admin: auth.user?.email || "admin",
      });
    } catch {
      // history is optional
    }

    return NextResponse.json({
      success: true,
      saved,
      cities: chineseCitiesFromCatalog(universities),
      ...result,
    });
  } catch (error) {
    console.error("chinese matching POST:", error);
    return NextResponse.json(
      { error: "Matching chinois impossible" },
      { status: 500 },
    );
  }
}
