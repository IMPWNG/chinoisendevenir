import { DOMAIN_FAMILIES, DOMAIN_KEYS, normalizeText } from "./constants";
import { DOMAIN_SIMILARITY_MIN } from "./weights";
import type { MatchingUniversity } from "./university";

function familyOf(field: unknown) {
  const value = String(field || "");
  return Object.entries(DOMAIN_FAMILIES).find(([, fields]) =>
    fields.includes(value),
  )?.[0];
}

function tokenize(value: unknown) {
  return new Set(
    normalizeText(value)
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length >= 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((token) => {
    if (b.has(token)) inter += 1;
  });
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function studentTokens(studentField: unknown) {
  const key = String(studentField || "");
  const aliases = DOMAIN_KEYS[key] || [key];
  return tokenize([key, ...aliases].join(" "));
}

function universityTokens(university: MatchingUniversity) {
  return tokenize(
    [
      ...(university.fieldKeys || []),
      ...(university.fields || []),
      ...(Array.isArray(university.majors) ? university.majors : []),
      ...(university.programs || []).map((p) => `${p.name} ${p.field}`),
    ].join(" "),
  );
}

export function domainSimilarity(studentField: unknown, university: MatchingUniversity) {
  const field = String(studentField || "");
  if (!field || field === "Autre") {
    return {
      score: null,
      hit: "unknown",
      related: false,
      unknownStudent: true,
    };
  }

  const keys = (DOMAIN_KEYS[field] || [normalizeText(field)]).map(
    normalizeText,
  );
  const structured = (university.fieldKeys || []).map(normalizeText).filter(Boolean);
  const haystack = normalizeText(
    [
      ...(university.fields || []),
      ...(Array.isArray(university.majors) ? university.majors : []),
      ...(university.programs || []).map((p) => `${p.name} ${p.field}`),
    ].join(" "),
  );

  const matchesKeys = (pool: string[]) =>
    keys.some((key) => pool.some((item) => item.includes(key) || key.includes(item)));

  const cosineLike = jaccard(studentTokens(field), universityTokens(university));

  if (structured.length) {
    if (matchesKeys(structured) || keys.some((key) => haystack.includes(key))) {
      return { score: Math.max(0.85, cosineLike), hit: "strong", related: false };
    }
    const studentFamily = familyOf(field);
    if (studentFamily) {
      const related = DOMAIN_FAMILIES[studentFamily].some((label) => {
        const aliases = (DOMAIN_KEYS[label] || []).map(normalizeText);
        return aliases.some(
          (key) => structured.some((item) => item.includes(key)) || haystack.includes(key),
        );
      });
      if (related) {
        return { score: Math.max(0.55, cosineLike), hit: "related", related: true };
      }
    }
    if (cosineLike >= DOMAIN_SIMILARITY_MIN) {
      return { score: cosineLike, hit: "related", related: true };
    }
    return { score: cosineLike, hit: "none", related: false };
  }

  if (!haystack) {
    return {
      score: null,
      hit: "unknown",
      related: false,
      unknownUniversity: true,
    };
  }
  if (keys.some((key) => haystack.includes(key))) {
    return { score: Math.max(0.85, cosineLike), hit: "strong", related: false };
  }
  const hasLatin = /[a-z]/.test(haystack);
  if (!hasLatin) {
    return {
      score: null,
      hit: "unknown",
      related: false,
      unknownUniversity: true,
    };
  }
  if (cosineLike >= DOMAIN_SIMILARITY_MIN) {
    return { score: cosineLike, hit: "related", related: true };
  }
  return { score: cosineLike, hit: "none", related: false };
}

export type DomainSimilarity = {
  score: number | null;
  hit: string;
  related: boolean;
  unknownStudent?: boolean;
  unknownUniversity?: boolean;
};

export function domainPassesHardFilter(similarity: DomainSimilarity | null | undefined) {
  if (!similarity || similarity.hit === "unknown") return true;
  return (
    similarity.hit === "strong" ||
    similarity.hit === "related" ||
    (typeof similarity.score === "number" && similarity.score >= DOMAIN_SIMILARITY_MIN)
  );
}
