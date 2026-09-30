/**
 * Self-check for the sale contract amounts and identity.
 * Run: npx tsx src/lib/saleContract.check.ts
 */
import {
  CONTRACT_COMPANY,
  CONTRACT_PLACE,
  buildSaleContract,
  contractClientFromContact,
  contractInstallments,
  contractSendDate,
  readPrestataire,
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
  prenom: "Pirate",
  nom: "Autre",
  email: "pirate@example.com",
  dateNaissance: "12 mars 2002",
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
assert(client.nationalite === "Sénégal", "nationalité = pays");

const built = buildSaleContract({
  client,
  prestataire: readPrestataire({
    denomination: "Société <test>",
    forme: "SASU <x>",
    adresse: "Chongqing",
    immatriculation: "123",
    representant: "Matisse",
  }),
  formuleNumber: 2,
  sentAt,
});
assert(built, "contrat formule 2");
assert(built.html.includes("Awa Diallo"), "nom dans le contrat");
assert(!built.html.includes("Pirate"), "le nom saisi à la main est ignoré");
assert(built.html.includes(CONTRACT_COMPANY), "raison sociale fixe");
assert(!built.html.includes("Société"), "raison sociale non modifiable");
assert(built.html.includes("SASU &lt;x&gt;"), "échappement HTML");
assert(
  readPrestataire({ denomination: "autre" }).denomination === CONTRACT_COMPANY,
  "la lecture ignore une autre dénomination",
);
assert(built.html.includes(CONTRACT_PLACE), "lieu Chongqing");
assert(built.html.includes("28 septembre 2026"), "date d'envoi");
assert(built.html.includes("cinq (5)"), "annexe formule 2");
assert(built.html.includes("680"), "acompte formule 2");
assert(!built.html.includes("huit (8)"), "pas l'annexe formule 3");
assert(built.html.includes("Tampon de l'entreprise"), "emplacement du tampon");

console.log("saleContract.check ok");
