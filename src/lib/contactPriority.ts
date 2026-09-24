export type PriorityContact = {
  prioritaire?: boolean | null;
};

export function isPrioritaire(
  contact: PriorityContact | null | undefined,
): boolean {
  return contact?.prioritaire === true;
}

export function priorityPatch(on: boolean): { prioritaire: boolean } {
  return { prioritaire: on === true };
}

/**
 * Prioritaire rows first. Same flag keeps the incoming order
 * (the table's existing sort). Relies on a stable Array#sort.
 */
export function sortPriorityFirst<T extends PriorityContact>(
  rows: readonly T[],
): T[] {
  return [...rows].sort(
    (a, b) => Number(isPrioritaire(b)) - Number(isPrioritaire(a)),
  );
}

/** PostgREST / Postgres when sql/contacts-prioritaire.sql is not applied yet. */
export function isMissingPriorityColumn(
  message: string | null | undefined,
): boolean {
  const text = String(message || "");
  return (
    /prioritaire/i.test(text) &&
    /(column|schema cache|does not exist|n'existe pas)/i.test(text)
  );
}
