export const DRIP_PER_HOUR = 5;
export const DRIP_GAP_MS = (60 * 60 * 1000) / DRIP_PER_HOUR;
export const DRIP_MAX_BATCH = 40;

/** Next send times, 12 minutes apart, after anything already queued. */
export function nextDripSlots(
  count: number,
  pendingScheduledMs: number[],
  now: number,
): number[] {
  const last = pendingScheduledMs.length
    ? Math.max(...pendingScheduledMs)
    : null;
  let cursor = last == null ? now : Math.max(now, last + DRIP_GAP_MS);
  const slots: number[] = [];
  for (let i = 0; i < count; i += 1) {
    slots.push(cursor);
    cursor += DRIP_GAP_MS;
  }
  return slots;
}

export function dripSendAllowed(input: {
  now: number;
  sentInLastHour: number;
  lastSentAt: number | null;
}): boolean {
  if (input.sentInLastHour >= DRIP_PER_HOUR) return false;
  if (
    input.lastSentAt != null &&
    input.now - input.lastSentAt < DRIP_GAP_MS
  ) {
    return false;
  }
  return true;
}
