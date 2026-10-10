/**
 * Self-check for the sale contract amounts and identity.
 * Run: npx tsx src/lib/saleContract.check.ts
 */
import {
  CONTRACT_ADDRESS,
  CONTRACT_COMPANY,
  CONTRACT_PLACE,
  CONTRACT_REGISTRATION,
  buildSaleContract,
  contractClientFromContact,
  contractInstallments,
  contractSendDate,
} from "./saleContract";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(
  contractInstallments(800).join(",") === "320,240,240",
  "formule 1 échéances",
);
assert(
  contractInstallments(1700).join(",") === "680,510,510",
  "formule 2 échéances",
);
assert(
  contractInstallments(2000).join(",") === "800,600,600",
  "formule 3 échéances",
);

const sentAt = new Date("2026-09-27T18:30:00.000Z");
assert(
  contractSendDate(sentAt) === "28 septembre 2026",
  "date du jour à Chongqing",
);

const extras = {
  dateNaissance: "12 mars 2002",
  nationalite: "Sénégalaise",
  adresse: "Dakar",
};
const client = contractClientFromContact(
  {
    prenom: "Awa",
    nom: "Diallo",
    email: "Awa@Example.com",
    phone: "+221770000000",
    pays: "Sénégal",
  },
  extras,
);
assert(client.prenom === "Awa" && client.nom === "Diallo", "nom du dossier");
assert(client.email === "awa@example.com", "email du dossier");
assert(client.residence === "Sénégal", "résidence = pays du dossier");
assert(client.nationalite === "Sénégalaise", "nationalité saisie");
assert(
  contractClientFromContact(
    { prenom: "Awa", nom: "Diallo", email: "a@b.c", pays: "Sénégal" },
    { nationalite: "Malienne" },
  ).residence === "Sénégal" &&
    contractClientFromContact(
      { prenom: "Awa", nom: "Diallo", email: "a@b.c", pays: "Sénégal" },
      { nationalite: "Malienne" },
    ).nationalite === "Malienne",
  "la résidence n'est pas déduite de la nationalité",
);

const built = buildSaleContract({
  client,
  formuleNumber: 2,
  sentAt,
});
assert(built && "html" in built, "contrat formule 2");
if (!built || !("html" in built)) throw new Error("narrow");
assert(built.html.includes("Awa Diallo"), "nom dans le contrat");
assert(!built.html.includes("Pirate"), "le nom saisi à la main est ignoré");
assert(built.html.includes(CONTRACT_COMPANY), "raison sociale fixe");
assert(built.html.includes(CONTRACT_ADDRESS), "adresse fixe");
assert(built.html.includes(CONTRACT_REGISTRATION), "immatriculation fixe");
assert(!built.html.includes("Forme juridique"), "pas de forme juridique");
assert(!built.html.includes("Représentée par"), "pas de représentée par");
assert(!built.html.includes("OHADA"), "pas d'OHADA");
assert(!built.html.includes("aucun remboursement"), "pas de non-remboursement absolu");
assert(built.html.includes("règles impératives"), "droits impératifs réservés");
assert(built.html.includes("République populaire de Chine"), "droit chinois choisi");
assert(!built.html.includes("Société"), "raison sociale non modifiable");
assert(built.html.includes(CONTRACT_PLACE), "lieu Chongqing");
assert(built.html.includes("28 septembre 2026"), "date d'envoi");
assert(built.html.includes("cinq (5)"), "annexe formule 2");
assert(built.html.includes("680"), "acompte formule 2");
assert(!built.html.includes("huit (8)"), "pas l'annexe formule 3");
assert(built.html.includes("Tampon de l'entreprise"), "emplacement du tampon");
assert(built.html.includes("Mode de paiement : [À COMPLÉTER]"), "paiement vide");
const paid = buildSaleContract({
  client,
  formuleNumber: 2,
  sentAt,
  terms: {
    paymentMode: "virement <bancaire>",
    transferFees: "à la charge du Client",
    specialTerms: "",
  },
});
assert(paid && "html" in paid, "contrat avec paiement");
if (paid && "html" in paid) {
  assert(paid.html.includes("virement &lt;bancaire&gt;"), "mode de paiement");
  assert(paid.html.includes("à la charge du Client"), "frais de transfert");
  assert(paid.html.includes("Échéancier ou conditions particulières : [À COMPLÉTER]"), "condition vide");
}
assert(!built.html.includes("Si le Client est mineur"), "majeur sans représentant");
const formule3 = buildSaleContract({ client, formuleNumber: 3, sentAt });
assert(formule3 && "html" in formule3, "contrat formule 3");
if (!formule3 || !("html" in formule3)) throw new Error("narrow 3");
assert(!formule3.html.includes("Économie par rapport"), "pas de phrase d'économie");
assert(formule3.html.includes("huit (8)"), "huit candidatures");
assert(formule3.html.includes("2 000"), "prix formule 3");
const blocked = buildSaleContract({
  client: { ...client, nationalite: "" },
  formuleNumber: 2,
  sentAt,
});
assert(blocked && "validation" in blocked, "champ manquant");
if (blocked && "validation" in blocked) {
  assert(blocked.gaps.includes("Nationalité du client"), "nationalité signalée");
  assert(!("html" in blocked), "pas de contrat à signer");
}
const minor = buildSaleContract({
  client: { ...client, mineur: true },
  formuleNumber: 1,
  sentAt,
});
assert(
  minor && "validation" in minor && minor.gaps.includes("Nom du représentant légal"),
  "mineur sans représentant",
);

console.log("saleContract.check ok");
