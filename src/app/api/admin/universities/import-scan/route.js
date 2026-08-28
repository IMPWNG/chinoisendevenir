import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { importScanCatalog } from "@/lib/universityScanImport";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const catalog = JSON.parse(
      await readFile(join(process.cwd(), "data/universities/catalog.json"), "utf8"),
    );
    const result = await importScanCatalog(auth.admin, catalog);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("universities import-scan:", error);
    return NextResponse.json(
      { error: "Import impossible" },
      { status: 500 },
    );
  }
}
