/**
 * Self-check for fiche questions turned into public FAQ titles.
 * Run: npx tsx src/lib/blog/ficheFaq.check.ts
 */
import {
  pickFreshFicheAsk,
  publicFaqTitle,
  redactPersonal,
  shouldUseFicheFaq,
  pillarsForAsk,
} from "./ficheFaq";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const raw = "Je m'appelle Awa Diop awa.diop@mail.com +221 77 123 45 67. Est-ce qu'une bourse CSC est possible avec un bac ?";
const clean = redactPersonal(raw);
assert(!clean.includes("@") && !clean.includes("Awa") && !/221/.test(clean), "redact name email phone");
const title = publicFaqTitle(raw);
assert(title === "Est-ce qu'une bourse CSC est possible avec un bac ?", "title is the question");
assert(publicFaqTitle("Merci beaucoup") === null, "thanks is not a question");
assert(pillarsForAsk(title || "")[0] === "/bourses", "scholarship pillar");

const first = pickFreshFicheAsk(
  [
    { text: "Ancien message assez long pour passer le filtre de longueur utile ?", at: "2026-01-01" },
    { text: "Comment déposer un dossier d'admission en université chinoise cette année ?", at: "2026-10-01" },
  ],
  [],
);
assert(first?.title.startsWith("Comment déposer"), "newest question wins");
const again = pickFreshFicheAsk(
  [{ text: "Comment déposer un dossier d'admission en université chinoise cette année ?", at: "2026-10-01" }],
  [first?.key || ""],
);
assert(again === null, "same question is not reused");

assert(
  shouldUseFicheFaq({ leadPublished: false, lastWasFaq: false, hasFreshAsk: true }) === false,
  "leading topics go first",
);
assert(
  shouldUseFicheFaq({ leadPublished: true, lastWasFaq: false, hasFreshAsk: true }) === true,
  "then a fiche question",
);
assert(
  shouldUseFicheFaq({ leadPublished: true, lastWasFaq: true, hasFreshAsk: true }) === false,
  "then a planned topic",
);

console.log("fiche faq check ok");
