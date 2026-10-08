import { NextResponse } from "next/server";
import { OpenwaError } from "@/lib/openwa";
import {
  deleteOpenwaWebhook,
  ensureOpenwaWebhook,
  listOpenwaWebhooks,
  parseOpenwaWebhookCreate,
  parseOpenwaWebhookId,
} from "@/lib/openwaWebhooks";
import { readJsonObject } from "@/lib/request";

export const maxDuration = 30;

function isAuthorizedAgent(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function fail(error: unknown) {
  if (error instanceof OpenwaError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("agent openwa-webhooks:", error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

export async function GET(request: Request) {
  if (!isAuthorizedAgent(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const webhooks = await listOpenwaWebhooks();
    return NextResponse.json({ success: true, webhooks });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAgent(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await readJsonObject(request);
  const parsed = parseOpenwaWebhookCreate(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    const result = await ensureOpenwaWebhook(parsed);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorizedAgent(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const queryId = new URL(request.url).searchParams.get("id");
  let id = parseOpenwaWebhookId(queryId);
  if (!id) {
    const body = await readJsonObject(request);
    id = parseOpenwaWebhookId(body?.id);
  }
  if (!id) {
    return NextResponse.json({ error: "id manquant" }, { status: 400 });
  }
  try {
    await deleteOpenwaWebhook(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    return fail(error);
  }
}
