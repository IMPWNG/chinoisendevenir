import type { AdminClient } from "./supabaseAdmin";
import { getFormuleByNumber, getFormuleNumber } from "./formules";
import { shouldAdvanceStatus, toStoredStatut, canonicalStatut } from "./suiviStatuts";
import {
  AirwallexError,
  airwallexEnv,
  cancelPaymentIntent,
  createPaymentIntent,
  isAirwallexConfigured,
  retrievePaymentIntent,
} from "./airwallex";
import {
  PAYMENT_CURRENCY,
  accessUnlocksFromInstallments,
  amountsMatch,
  centsToMajor,
  isPayableStatus,
  nextPayable,
  paymentEventLabel,
  quoteInstallments,
  type InstallmentStatus,
  type PaymentEventView,
  type PaymentMode,
  type PaymentPlanView,
} from "./payments";
import { formatEurosOnly } from "./money";
import { getChosenFormule } from "./studentProgress";

type DbError = { code?: string; message?: string } | null;

export class PaymentFlowError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type PlanRow = {
  id: string;
  contact_id: string;
  formule: string;
  currency: string;
  total_cents: number;
  mode: PaymentMode;
};

type InstallmentRow = {
  id: string;
  plan_id: string;
  contact_id: string;
  sequence: number;
  amount_cents: number;
  currency: string;
  status: InstallmentStatus;
  paid_at: string | null;
};

type EventRow = {
  id: string;
  name: string;
  contact_id: string | null;
  plan_id: string | null;
  installment_id: string | null;
  intent_id: string | null;
  created_at: string;
  payload?: unknown;
};

export type ContactPayee = {
  id?: string | null;
  email?: string | null;
  prenom?: string | number | null;
  nom?: string | number | null;
  formule?: string | null;
  notes_admin?: string | null;
  suivi_statut?: string | null;
};

function isUniqueViolation(error: DbError) {
  if (!error) return false;
  if (error.code === "23505") return true;
  const message = String(error.message || "").toLowerCase();
  return message.includes("duplicate") || message.includes("unique");
}

export function isMissingPaymentTable(error: DbError) {
  const message = String(error?.message || "").toLowerCase();
  if (!message) return false;
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function formuleTotalCents(formuleLabel: unknown): number | null {
  const formule = getFormuleByNumber(getFormuleNumber(formuleLabel));
  if (!formule || !Number.isFinite(formule.priceEuros) || formule.priceEuros <= 0) {
    return null;
  }
  return Math.round(formule.priceEuros * 100);
}

function toPlanView(plan: PlanRow, rows: InstallmentRow[]): PaymentPlanView {
  return {
    mode: plan.mode,
    formule: plan.formule,
    totalCents: plan.total_cents,
    currency: plan.currency || PAYMENT_CURRENCY,
    installments: [...rows]
      .sort((a, b) => a.sequence - b.sequence)
      .map((row) => ({
        sequence: row.sequence,
        amountCents: row.amount_cents,
        status: row.status,
        paidAt: row.paid_at,
      })),
  };
}

function toEventView(row: EventRow, sequence: number | null, amountCents: number | null): PaymentEventView {
  const payload = asRecord(row.payload);
  const data = asRecord(payload?.data);
  const object = asRecord(data?.object);
  return {
    id: row.id,
    name: row.name,
    label: paymentEventLabel(row.name),
    at: row.created_at,
    sequence,
    amountCents,
    status: asString(object?.status) || null,
  };
}

async function loadPlan(admin: AdminClient, contactId: string) {
  const planResult = await admin
    .from("payment_plans")
    .select("id, contact_id, formule, currency, total_cents, mode")
    .eq("contact_id", contactId)
    .maybeSingle();
  if (planResult.error) {
    if (isMissingPaymentTable(planResult.error)) return { missing: true as const };
    throw new PaymentFlowError("Impossible de lire l'échéancier.", 500);
  }
  const plan = (planResult.data || null) as PlanRow | null;
  if (!plan) return { missing: false as const, plan: null, installments: [] as InstallmentRow[] };

  const rowsResult = await admin
    .from("payment_installments")
    .select("id, plan_id, contact_id, sequence, amount_cents, currency, status, paid_at")
    .eq("plan_id", plan.id)
    .order("sequence", { ascending: true });
  if (rowsResult.error) throw new PaymentFlowError("Impossible de lire les versements.", 500);
  return {
    missing: false as const,
    plan,
    installments: (rowsResult.data || []) as InstallmentRow[],
  };
}

async function loadEvents(admin: AdminClient, contactId: string, installments: InstallmentRow[]) {
  const eventsResult = await admin
    .from("payment_events")
    .select("id, name, contact_id, plan_id, installment_id, intent_id, created_at, payload")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (eventsResult.error) {
    if (isMissingPaymentTable(eventsResult.error)) return [];
    throw new PaymentFlowError("Impossible de lire les échanges de paiement.", 500);
  }
  const byId = new Map(installments.map((row) => [row.id, row]));
  return ((eventsResult.data || []) as EventRow[]).map((row) => {
    const installment = row.installment_id ? byId.get(row.installment_id) : undefined;
    return toEventView(row, installment?.sequence ?? null, installment?.amount_cents ?? null);
  });
}

export async function readPaymentState(admin: AdminClient, contact: ContactPayee) {
  if (!contact.id) throw new PaymentFlowError("Dossier introuvable.", 404);
  const formule = getChosenFormule(contact);
  const totalCents = formuleTotalCents(formule);
  const loaded = await loadPlan(admin, String(contact.id));
  if (loaded.missing) {
    return {
      ready: false,
      configured: isAirwallexConfigured(),
      currency: PAYMENT_CURRENCY,
      totalCents,
      formule,
      quote: totalCents
        ? {
            full: quoteInstallments(totalCents, "full"),
            installments: quoteInstallments(totalCents, "installments"),
          }
        : null,
      plan: null,
      events: [] as PaymentEventView[],
    };
  }

  const paid = loaded.installments.some((row) => row.status === "succeeded");
  const stale =
    loaded.plan &&
    !paid &&
    (loaded.plan.formule !== formule ||
      (totalCents != null && loaded.plan.total_cents !== totalCents));
  const plan = loaded.plan && !stale ? toPlanView(loaded.plan, loaded.installments) : null;

  return {
    ready: true,
    configured: isAirwallexConfigured(),
    currency: PAYMENT_CURRENCY,
    totalCents,
    formule,
    quote: totalCents
      ? {
          full: quoteInstallments(totalCents, "full"),
          installments: quoteInstallments(totalCents, "installments"),
        }
      : null,
    plan,
    events: await loadEvents(admin, String(contact.id), loaded.installments),
  };
}

async function retirePreviousIntents(admin: AdminClient, installment: InstallmentRow) {
  const listed = await admin
    .from("payment_intents")
    .select("airwallex_intent_id")
    .eq("installment_id", installment.id);
  for (const row of listed.data || []) {
    const intentId = asString((row as { airwallex_intent_id?: unknown }).airwallex_intent_id);
    if (!intentId) continue;
    try {
      await cancelPaymentIntent(intentId);
    } catch (error) {
      if (!(error instanceof AirwallexError)) throw error;
      const current = await retrievePaymentIntent(intentId);
      if (current.status === "SUCCEEDED") {
        if (amountsMatch(current.amount, installment.amount_cents, current.currency)) {
          await creditInstallment(admin, installment);
        }
        throw new PaymentFlowError(
          "Ce versement est déjà confirmé. Actualisez la page.",
          409,
        );
      }
      if (current.status !== "CANCELLED") {
        throw new PaymentFlowError(
          "Un paiement est déjà ouvert sur ce versement. Terminez-le avant d'en lancer un autre.",
          409,
        );
      }
    }
  }
}

async function replaceInstallments(
  admin: AdminClient,
  plan: PlanRow,
  mode: PaymentMode,
  formule: string,
  totalCents: number,
) {
  const quotes = quoteInstallments(totalCents, mode);
  const existing = await admin
    .from("payment_installments")
    .select("id, plan_id, contact_id, sequence, amount_cents, currency, status, paid_at")
    .eq("plan_id", plan.id);
  for (const row of (existing.data || []) as InstallmentRow[]) {
    if (row.status === "succeeded") {
      throw new PaymentFlowError(
        "Un versement est déjà reçu. L'échéancier ne peut plus changer.",
        409,
      );
    }
    await retirePreviousIntents(admin, row);
  }
  const now = new Date().toISOString();
  const updated = await admin
    .from("payment_plans")
    .update({
      formule,
      total_cents: totalCents,
      mode,
      currency: PAYMENT_CURRENCY,
      updated_at: now,
    })
    .eq("id", plan.id)
    .select("id, contact_id, formule, currency, total_cents, mode")
    .single();
  if (updated.error || !updated.data) {
    throw new PaymentFlowError("Impossible de mettre à jour l'échéancier.", 500);
  }
  const removed = await admin.from("payment_installments").delete().eq("plan_id", plan.id);
  if (removed.error) throw new PaymentFlowError("Impossible de remplacer les versements.", 500);
  const inserted = await admin
    .from("payment_installments")
    .insert(
      quotes.map((quote) => ({
        plan_id: plan.id,
        contact_id: plan.contact_id,
        sequence: quote.sequence,
        amount_cents: quote.amountCents,
        currency: PAYMENT_CURRENCY,
        status: "pending",
      })),
    )
    .select("id, plan_id, contact_id, sequence, amount_cents, currency, status, paid_at");
  if (inserted.error || !inserted.data?.length) {
    throw new PaymentFlowError("Impossible d'enregistrer les versements.", 500);
  }
  return {
    plan: updated.data as PlanRow,
    installments: inserted.data as InstallmentRow[],
  };
}

async function ensurePlan(
  admin: AdminClient,
  contactId: string,
  formule: string,
  totalCents: number,
  mode: PaymentMode,
) {
  const loaded = await loadPlan(admin, contactId);
  if (loaded.missing) {
    throw new PaymentFlowError(
      "Le suivi des paiements n'est pas encore activé.",
      503,
    );
  }
  const paid = loaded.installments.some((row) => row.status === "succeeded");
  if (loaded.plan && paid) {
    if (loaded.plan.mode !== mode || loaded.plan.formule !== formule) {
      throw new PaymentFlowError(
        "Un versement est déjà reçu. L'échéancier ne peut plus changer.",
        409,
      );
    }
    return { plan: loaded.plan, installments: loaded.installments };
  }
  if (
    loaded.plan &&
    loaded.plan.mode === mode &&
    loaded.plan.formule === formule &&
    loaded.plan.total_cents === totalCents &&
    loaded.installments.length
  ) {
    return { plan: loaded.plan, installments: loaded.installments };
  }
  if (loaded.plan) {
    return replaceInstallments(admin, loaded.plan, mode, formule, totalCents);
  }

  const created = await admin
    .from("payment_plans")
    .insert({
      contact_id: contactId,
      formule,
      currency: PAYMENT_CURRENCY,
      total_cents: totalCents,
      mode,
    })
    .select("id, contact_id, formule, currency, total_cents, mode")
    .single();
  if (created.error || !created.data) {
    if (isUniqueViolation(created.error)) {
      const again = await loadPlan(admin, contactId);
      if (again.missing || !again.plan) {
        throw new PaymentFlowError("Impossible de créer l'échéancier.", 500);
      }
      return replaceInstallments(admin, again.plan, mode, formule, totalCents);
    }
    throw new PaymentFlowError("Impossible de créer l'échéancier.", 500);
  }
  return replaceInstallments(admin, created.data as PlanRow, mode, formule, totalCents);
}

export function requestOrigin(request: Request) {
  const proto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
  const host = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    .trim();
  if (!host) return "";
  return `${proto}://${host}`;
}

export async function startCheckout(
  admin: AdminClient,
  contact: ContactPayee,
  mode: PaymentMode,
  origin: string,
) {
  if (!contact.id) throw new PaymentFlowError("Dossier introuvable.", 404);
  if (!isAirwallexConfigured()) {
    throw new PaymentFlowError(
      "Le paiement en ligne n'est pas encore configuré. Aucun montant ne sera débité.",
      503,
    );
  }
  const formule = getChosenFormule(contact);
  const totalCents = formuleTotalCents(formule);
  if (!formule || totalCents == null) {
    throw new PaymentFlowError("Choisissez d'abord une formule.", 400);
  }
  if (!origin) throw new PaymentFlowError("Adresse de retour introuvable.", 500);

  const ensured = await ensurePlan(admin, String(contact.id), formule, totalCents, mode);
  const installment = nextPayable(ensured.installments);
  if (!installment) {
    throw new PaymentFlowError("Tous les versements sont déjà réglés.", 409);
  }
  if (!isPayableStatus(installment.status)) {
    throw new PaymentFlowError("Ce versement n'est pas payable.", 409);
  }

  const returnUrl = `${origin}/espace-etudiant?paiement=retour`;
  await retirePreviousIntents(admin, installment);
  const requestId = crypto.randomUUID();
  const merchantOrderId = `ced-${requestId}`;
  let created;
  try {
    created = await createPaymentIntent({
      requestId,
      amount: centsToMajor(installment.amount_cents),
      currency: PAYMENT_CURRENCY,
      merchantOrderId,
      returnUrl,
      descriptor: "Chinois en Devenir",
      metadata: {
        contact_id: String(contact.id),
        plan_id: ensured.plan.id,
        installment_id: installment.id,
        sequence: String(installment.sequence),
      },
      customer: {
        email: contact.email || undefined,
        firstName: contact.prenom ? String(contact.prenom) : undefined,
        lastName: contact.nom ? String(contact.nom) : undefined,
        merchantCustomerId: String(contact.id),
      },
    });
  } catch (error) {
    if (error instanceof AirwallexError) {
      throw new PaymentFlowError(error.message, error.status >= 500 ? 502 : error.status);
    }
    throw new PaymentFlowError("Impossible de créer le paiement.", 502);
  }

  const saved = await admin.from("payment_intents").insert({
    installment_id: installment.id,
    request_id: requestId,
    merchant_order_id: merchantOrderId,
    airwallex_intent_id: created.id,
  });
  if (saved.error && !isUniqueViolation(saved.error)) {
    console.error("payment intent persist:", saved.error.message);
  }

  if (installment.status === "pending" || installment.status === "failed" || installment.status === "cancelled") {
    await admin
      .from("payment_installments")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", installment.id)
      .neq("status", "succeeded");
  }

  return {
    configured: true as const,
    env: airwallexEnv(),
    intentId: created.id,
    clientSecret: created.clientSecret,
    currency: PAYMENT_CURRENCY,
    successUrl: returnUrl,
  };
}

type WebhookObject = Record<string, unknown>;

function objectOf(event: Record<string, unknown>): WebhookObject {
  const data = asRecord(event.data);
  return asRecord(data?.object) || {};
}

function intentIdOf(name: string, object: WebhookObject) {
  if (name.startsWith("payment_intent.")) return asString(object.id);
  return asString(object.payment_intent_id);
}

const FAILED_EVENTS = new Set([
  "payment_intent.payment_failed",
  "payment_intent.cancelled",
  "payment_attempt.authentication_failed",
  "payment_attempt.authorization_failed",
  "payment_attempt.capture_failed",
  "payment_attempt.risk_declined",
  "payment_attempt.failed_to_process",
  "payment_attempt.expired",
  "payment_attempt.cancelled",
]);

const PROCESSING_EVENTS = new Set([
  "payment_intent.requires_customer_action",
  "payment_intent.requires_capture",
  "payment_intent.pending",
  "payment_intent.pending_review",
  "payment_attempt.received",
  "payment_attempt.authentication_redirected",
  "payment_attempt.pending_authorization",
  "payment_attempt.authorized",
  "payment_attempt.capture_requested",
]);

async function findInstallment(admin: AdminClient, intentId: string, object: WebhookObject) {
  if (intentId) {
    const byIntent = await admin
      .from("payment_intents")
      .select("installment_id")
      .eq("airwallex_intent_id", intentId)
      .maybeSingle();
    const installmentId = asString(byIntent.data?.installment_id);
    if (installmentId) return fetchInstallment(admin, installmentId);
  }
  const merchantOrderId = asString(object.merchant_order_id);
  if (merchantOrderId) {
    const byOrder = await admin
      .from("payment_intents")
      .select("installment_id")
      .eq("merchant_order_id", merchantOrderId)
      .maybeSingle();
    const installmentId = asString(byOrder.data?.installment_id);
    if (installmentId) return fetchInstallment(admin, installmentId);
  }
  const metadata = asRecord(object.metadata);
  const fromMeta = asString(metadata?.installment_id);
  if (fromMeta) return fetchInstallment(admin, fromMeta);
  return null;
}

async function latestIntentId(admin: AdminClient, installmentId: string) {
  const result = await admin
    .from("payment_intents")
    .select("airwallex_intent_id")
    .eq("installment_id", installmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return asString(result.data?.airwallex_intent_id);
}

async function fetchInstallment(admin: AdminClient, id: string) {
  const result = await admin
    .from("payment_installments")
    .select("id, plan_id, contact_id, sequence, amount_cents, currency, status, paid_at")
    .eq("id", id)
    .maybeSingle();
  return (result.data || null) as InstallmentRow | null;
}

async function creditInstallment(admin: AdminClient, installment: InstallmentRow) {
  const now = new Date().toISOString();
  const credited = await admin
    .from("payment_installments")
    .update({ status: "succeeded", paid_at: now, updated_at: now })
    .eq("id", installment.id)
    .neq("status", "succeeded")
    .select("id, plan_id, contact_id, sequence, amount_cents")
    .maybeSingle();
  if (credited.error) throw new PaymentFlowError(credited.error.message, 500);
  if (!credited.data) return;

  const rowsResult = await admin
    .from("payment_installments")
    .select("sequence, status")
    .eq("plan_id", installment.plan_id);
  const rows = (rowsResult.data || []) as { sequence: number; status: string }[];
  const unlocks = accessUnlocksFromInstallments(rows);
  const amountLabel = formatEurosOnly(centsToMajor(installment.amount_cents));
  const contactResult = await admin
    .from("contacts")
    .select("id, suivi_statut")
    .eq("id", installment.contact_id)
    .maybeSingle();
  const contact = contactResult.data as { id?: string; suivi_statut?: string | null } | null;
  let unlocked = false;
  if (unlocks && contact && shouldAdvanceStatus(contact.suivi_statut, "client_payé")) {
    const current = canonicalStatut(contact.suivi_statut);
    if (current !== "client_payé") {
      const updated = await admin
        .from("contacts")
        .update({
          suivi_statut: toStoredStatut("client_payé"),
          updated_at: now,
        })
        .eq("id", installment.contact_id);
      unlocked = !updated.error;
      if (updated.error) console.error("payment unlock:", updated.error.message);
    }
  }

  const total = rows.length;
  const kind = total === 1 ? "Paiement intégral" : `Versement ${installment.sequence}/${total}`;
  const description = unlocked
    ? `${kind} reçu (${amountLabel}). L'espace étudiant est débloqué.`
    : `${kind} reçu (${amountLabel}).`;
  const action = await admin.from("suivi_actions").insert({
    contact_id: installment.contact_id,
    action: "paiement_recu",
    description,
    user_admin: "airwallex",
  });
  if (action.error) console.error("payment action:", action.error.message);
}

export async function recordAirwallexEvent(admin: AdminClient, event: Record<string, unknown>) {
  const name = asString(event.name);
  const eventId = asString(event.id);
  if (!name || !eventId) {
    throw new PaymentFlowError("Événement Airwallex incomplet.", 400);
  }
  const object = objectOf(event);
  const intentId = intentIdOf(name, object);
  const installment = await findInstallment(admin, intentId, object);

  const inserted = await admin.from("payment_events").insert({
    airwallex_event_id: eventId,
    name,
    contact_id: installment?.contact_id || asString(asRecord(object.metadata)?.contact_id) || null,
    plan_id: installment?.plan_id || null,
    installment_id: installment?.id || null,
    intent_id: intentId || null,
    payload: event,
  });
  if (inserted.error && !isUniqueViolation(inserted.error)) {
    throw new PaymentFlowError("Impossible d'enregistrer l'événement.", 500);
  }

  if (!installment) return { matched: false };

  if (name === "payment_intent.succeeded") {
    if (asString(object.status) !== "SUCCEEDED") return { matched: true };
    if (!amountsMatch(object.amount, installment.amount_cents, object.currency || installment.currency)) {
      console.error("airwallex amount mismatch", installment.id);
      return { matched: true, credited: false };
    }
    await creditInstallment(admin, installment);
    return { matched: true, credited: true };
  }

  const latestIntent = await latestIntentId(admin, installment.id);
  const staleIntent = Boolean(intentId && latestIntent && latestIntent !== intentId);

  if (!staleIntent && FAILED_EVENTS.has(name) && installment.status !== "succeeded") {
    const status = name.endsWith("cancelled") ? "cancelled" : "failed";
    await admin
      .from("payment_installments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", installment.id)
      .neq("status", "succeeded");
  } else if (!staleIntent && PROCESSING_EVENTS.has(name) && installment.status === "pending") {
    await admin
      .from("payment_installments")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", installment.id)
      .eq("status", "pending");
  }

  return { matched: true };
}
