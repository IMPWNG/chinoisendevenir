import { NextResponse } from "next/server";
import { pendingWhatsappContactIds } from "@/lib/inboxPriority";
import { OpenwaError, unreadWhatsappPhones } from "@/lib/openwa";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";

export async function GET(request: Request) {
  const auth = await getAuthenticatedAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }
  if (auth.role !== "full") {
    return NextResponse.json({ contactIds: [] });
  }

  try {
    const phones = await unreadWhatsappPhones();
    const { data, error } = await auth.admin
      .from("contacts")
      .select("id, phone, pays");
    if (error) {
      console.warn("inbox-priority contacts:", error.message);
      return NextResponse.json({ contactIds: [] });
    }
    return NextResponse.json({
      contactIds: pendingWhatsappContactIds(data || [], phones),
    });
  } catch (error) {
    if (!(error instanceof OpenwaError)) {
      console.error("inbox-priority:", error);
    }
    return NextResponse.json({ contactIds: [] });
  }
}
