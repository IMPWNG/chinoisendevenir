/**
 * Self-check for EUR → F CFA display.
 * Run: npx tsx src/lib/money.check.ts
 */
import { displayFormulePrice, FORMULES } from "./formules";
import {
  EUR_TO_FCFA,
  eurosToFcfa,
  formatEurosWithCfa,
  parseEuroAmount,
  withCfaInText,
} from "./money";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(EUR_TO_FCFA === 655.957, "official peg");
assert(eurosToFcfa(800) === 524766, "800 € → 524 766 F CFA");
assert(eurosToFcfa(1700) === 1115127, "1 700 € → 1 115 127 F CFA");
assert(eurosToFcfa(2000) === 1311914, "2 000 € → 1 311 914 F CFA");
assert(eurosToFcfa(500) === 327979, "500 € → 327 979 F CFA");

assert(formatEurosWithCfa(800) === "800 € (524 766 F CFA)", "format 800");
assert(formatEurosWithCfa(1700) === "1 700 € (1 115 127 F CFA)", "format 1700");
assert(formatEurosWithCfa(2000) === "2 000 € (1 311 914 F CFA)", "format 2000");

assert(parseEuroAmount("800") === 800, "parse 800");
assert(parseEuroAmount("1 700") === 1700, "parse 1 700");
assert(parseEuroAmount("1,700") === 1700, "parse 1,700");
assert(parseEuroAmount("2,50") === 2.5, "parse 2,50");

assert(
  withCfaInText("800 €") === "800 €, soit 524 766 F CFA",
  "suffix 800",
);
assert(
  withCfaInText("La formule 1 (800 €) et la 2 (1 700 €).") ===
    "La formule 1 (800 €, soit 524 766 F CFA) et la 2 (1 700 €, soit 1 115 127 F CFA).",
  "two amounts in prose",
);
assert(
  withCfaInText("€800") === "€800, soit 524 766 F CFA",
  "english prefix",
);
assert(
  withCfaInText("€1,700") === "€1,700, soit 1 115 127 F CFA",
  "english thousands",
);
assert(
  withCfaInText("250 à 500 euros") ===
    "250 à 500 euros, soit 163 989 à 327 979 F CFA",
  "range à",
);
assert(
  withCfaInText("50-100 euros") ===
    "50-100 euros, soit 32 798-65 596 F CFA",
  "range hyphen",
);
assert(
  withCfaInText("1 à 2,50 €") === "1 à 2,50 €, soit 656 à 1 640 F CFA",
  "decimal range",
);

const converted = withCfaInText("800 €");
assert(withCfaInText(converted) === converted, "idempotent");
assert(
  withCfaInText("800 € (524 766 F CFA)") === "800 € (524 766 F CFA)",
  "already converted suffix",
);
assert(
  withCfaInText("2 500 RMB (210 à 350 €)") ===
    "2 500 RMB (210 à 350 €, soit 137 751 à 229 585 F CFA)",
  "euro inside rmb parens",
);

assert(
  displayFormulePrice(FORMULES[0]) === "800 € (524 766 F CFA)",
  "formule 1 display",
);
assert(
  displayFormulePrice(FORMULES[2]).includes("2 000 € (1 311 914 F CFA)"),
  "formule 3 display includes CFA",
);
assert(
  displayFormulePrice(FORMULES[2]).includes("327 979 F CFA"),
  "formule 3 savings CFA",
);

console.log("money check ok");
