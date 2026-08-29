import { MIX_SIZE, MIX_TARGETS } from "./weights";

function takeFrom(list, n, used) {
  const picked = [];
  for (const item of list) {
    if (picked.length >= n) break;
    if (used.has(item.university_id)) continue;
    used.add(item.university_id);
    picked.push(item);
  }
  return picked;
}

export function selectMix(ranked, { min = MIX_SIZE.min, max = MIX_SIZE.max } = {}) {
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

  selected.sort((a, b) => {
    const order = { safety: 0, match: 1, reach: 2, unready: 3 };
    const da = order[a.categoryKey] ?? 4;
    const db = order[b.categoryKey] ?? 4;
    if (da !== db) return da - db;
    return b.score - a.score;
  });

  return selected.slice(0, max);
}

export function groupMix(matches) {
  const groups = { safety: [], match: [], reach: [], unready: [] };
  (matches || []).forEach((item) => {
    const key = item.categoryKey || "match";
    if (groups[key]) groups[key].push(item);
    else groups.match.push(item);
  });
  return groups;
}
