import { MIX_SIZE, MIX_TARGETS } from "./weights";
import type { MatchingUniversity } from "./university";

export type Mixable = {
  university_id?: string | null;
  university_name?: string | null;
  excluded?: boolean;
  categoryKey?: string;
  score?: number;
  university?: MatchingUniversity & { name?: string | null; displayName?: string | null };
  hsk_required?: number | null;
  gpa_required?: number | null;
  cost_total_cny?: number | null;
  scholarships_possible?: unknown[];
};

function takeFrom<T extends Mixable>(list: T[], n: number, used: Set<unknown>) {
  const picked: T[] = [];
  for (const item of list) {
    if (picked.length >= n) break;
    if (used.has(item.university_id)) continue;
    used.add(item.university_id);
    picked.push(item);
  }
  return picked;
}

export function selectMix<T extends Mixable>(
  ranked: T[] | null | undefined,
  { min = MIX_SIZE.min, max = MIX_SIZE.max }: { min?: number; max?: number } = {},
) {
  const pool = (ranked || []).filter((item) => !item.excluded);
  const byKey = {
    safety: pool.filter((item) => item.categoryKey === "safety"),
    match: pool.filter((item) => item.categoryKey === "match"),
    reach: pool.filter((item) => item.categoryKey === "reach"),
  };
  const used = new Set();
  const selected = [
    ...takeFrom(byKey.safety, MIX_TARGETS.safety, used),
    ...takeFrom(byKey.match, MIX_TARGETS.match, used),
    ...takeFrom(byKey.reach, MIX_TARGETS.reach, used),
  ];

  const leftovers = pool.filter((item) => !used.has(item.university_id));
  for (const item of leftovers) {
    if (selected.length >= max) break;
    used.add(item.university_id);
    selected.push(item);
  }

  if (selected.length < min) {
    const unready = (ranked || []).filter(
      (item) => item.categoryKey === "unready" && !used.has(item.university_id),
    );
    for (const item of unready) {
      if (selected.length >= min) break;
      selected.push(item);
    }
  }

  const order: Record<string, number> = { safety: 0, match: 1, reach: 2, unready: 3 };
  selected.sort((a, b) => {
    const da = order[a.categoryKey || ""] ?? 4;
    const db = order[b.categoryKey || ""] ?? 4;
    if (da !== db) return da - db;
    return (b.score || 0) - (a.score || 0);
  });

  return selected.slice(0, max);
}

export function groupMix<T extends Mixable>(matches: T[] | null | undefined) {
  const groups: Record<string, T[]> = {
    safety: [],
    match: [],
    reach: [],
    unready: [],
  };
  (matches || []).forEach((item) => {
    const key = item.categoryKey || "match";
    if (groups[key]) groups[key].push(item);
    else groups.match.push(item);
  });
  return groups;
}
