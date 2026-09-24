import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/httpSecurity";
import { getAuthenticatedContact } from "@/lib/studentAuth";
import { readJsonObject } from "@/lib/request";
import {
  PaymentFlowError,
  readPaymentState,
  requestOrigin,
  startCheckout,
} from "@/lib/paymentRecords";
import type { PaymentMode } from "@/lib/payments";

function paymentError(error: unknown) {
  if (error instanceof PaymentFlowError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("student payment:", error);
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!auth.contact?.id) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }
    const state = await readPaymentState(auth.admin, auth.contact);
    return NextResponse.json({ success: true, ...state });
  } catch (error) {
    return paymentError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedContact(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    if (!auth.contact?.id) {
      return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
    }

    const limited = rateLimit({
      key: `student-payment:${auth.user.id || getClientIp(request.headers)}`,
      limit: 15,
      windowMs: 15 * 60 * 1000,
    });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }

    const body = await readJsonObject(request);
    const mode = body?.mode;
    if (mode !== "full" && mode !== "installments") {
      return NextResponse.json({ error: "Mode de paiement invalide." }, { status: 400 });
    }

    const checkout = await startCheckout(
      auth.admin,
      auth.contact,
      mode as PaymentMode,
      requestOrigin(request),
    );
    return NextResponse.json({ success: true, ...checkout });
  } catch (error) {
    return paymentError(error);
  }
}
