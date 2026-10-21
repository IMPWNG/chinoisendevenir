/**
 * Self-check for the sale contract amounts and identity.
 * Run: npx tsx src/lib/saleContract.check.ts
 */
import {
  CONTRACT_PDF_NOTE,
  contractEmailWithPdfNote,
  contractFontGaps,
  contractHtmlBlocks,
  contractHtmlToPdf,
  contractPdfFilename,
} from "./contractPdf";
import {
  CONTRACT_ADDRESS,
  CONTRACT_COMPANY,
  CONTRACT_PLACE,
  CONTRACT_REGISTRATION,
  CONTRACT_REPRESENTATIVE,
  CONTRACT_ROLE,
  CONTRACT_STAMP_SRC,
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
assert(built.html.includes("446 051 F CFA"), "acompte en CFA");
assert(built.html.includes("Devise de paiement : euros"), "devise euros");
assert(built.html.includes("1 € = 655,957 F CFA"), "taux du franc CFA");
assert(!built.html.includes("huit (8)"), "pas l'annexe formule 3");
assert(built.html.includes(CONTRACT_STAMP_SRC), "tampon de l'entreprise");
assert(built.html.includes(CONTRACT_REPRESENTATIVE), "représentant");
assert(built.html.includes(`Fonction : ${CONTRACT_ROLE}`), "fonction");
assert(!built.html.includes("Nom du représentant : [À COMPLÉTER]"), "représentant renseigné");
assert(built.html.includes("À l'ouverture du dossier"), "échéance 1");
assert(built.html.includes("À l'envoi des candidatures"), "échéance 2");
assert(
  built.html.includes("À la réception de l'acceptation de l'école et/ou de l'université"),
  "échéance 3",
);
assert(built.html.includes("1re échéance — 40 %"), "40 %");
assert(built.html.includes("2e échéance — 30 %"), "30 %");
assert(built.html.includes("3e échéance — solde"), "solde");
assert(!built.html.includes("Frais éventuels de transfert"), "pas de frais de transfert");
assert(built.html.includes("Conditions particulières :</p>"), "conditions particulières vides");
assert(built.html.includes("Mode de paiement : [À COMPLÉTER]"), "paiement vide");
const paid = buildSaleContract({
  client,
  formuleNumber: 2,
  sentAt,
  terms: {
    paymentMode: "virement <bancaire>",
  },
});
assert(paid && "html" in paid, "contrat avec paiement");
if (paid && "html" in paid) {
  assert(paid.html.includes("virement &lt;bancaire&gt;"), "mode de paiement");
  assert(!paid.html.includes("Frais éventuels de transfert"), "pas de frais de transfert");
  assert(paid.html.includes("Conditions particulières :</p>"), "conditions particulières vides");
}
const cfa = buildSaleContract({
  client,
  formuleNumber: 2,
  sentAt,
  terms: { currency: "XOF" },
});
assert(cfa && "html" in cfa && cfa.html.includes("Devise de paiement : francs CFA"), "devise CFA");
if (cfa && "html" in cfa) {
  assert(cfa.html.includes("446 051 F CFA"), "échéance en CFA");
  assert(!cfa.html.includes("680 €"), "plus d'euros quand la devise est le CFA");
}
const rmb = buildSaleContract({
  client,
  formuleNumber: 2,
  sentAt,
  terms: { currency: "CNY" },
});
assert(rmb && "html" in rmb && rmb.html.includes("Devise de paiement : RMB"), "devise RMB");
if (rmb && "html" in rmb) {
  assert(rmb.html.includes("5 440 RMB"), "échéance en RMB");
  assert(rmb.html.includes("446 051 F CFA"), "CFA à côté du RMB");
}
assert(!built.html.includes("Si le Client est mineur"), "majeur sans représentant");
assert(
  !built.html.includes("Personne qui règle l'accompagnement"),
  "client qui paie lui-même",
);
const formule3 = buildSaleContract({ client, formuleNumber: 3, sentAt });
assert(formule3 && "html" in formule3, "contrat formule 3");
if (!formule3 || !("html" in formule3)) throw new Error("narrow 3");
assert(!formule3.html.includes("Économie par rapport"), "pas de phrase d'économie");
assert(formule3.html.includes("huit (8)"), "huit candidatures");
assert(
  formule3.html.includes("À la réception de l'acceptation de l'école et/ou de l'université"),
  "même échéancier formule 3",
);
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
const payerMissing = buildSaleContract({
  client: { ...client, tiersPayeur: true },
  formuleNumber: 2,
  sentAt,
});
assert(
  payerMissing &&
    "validation" in payerMissing &&
    payerMissing.gaps.includes("Nom du payeur"),
  "payeur sans nom",
);
const paidByParent = buildSaleContract({
  client: {
    ...client,
    tiersPayeur: true,
    payeur: {
      nom: "Fatou Diallo",
      lien: "Mère",
      adresse: "Dakar",
      contact: "fatou@example.com",
    },
  },
  formuleNumber: 2,
  sentAt,
});
assert(paidByParent && "html" in paidByParent, "contrat payé par un parent");
if (paidByParent && "html" in paidByParent) {
  assert(
    paidByParent.html.includes("Personne qui règle l'accompagnement"),
    "bloc payeur",
  );
  assert(paidByParent.html.includes("Fatou Diallo"), "nom du payeur");
  assert(paidByParent.html.includes("Mère"), "lien du payeur");
  assert(
    paidByParent.html.includes("Les échéances sont réglées par Fatou Diallo, Mère."),
    "échéance réglée par le payeur",
  );
  assert(paidByParent.html.includes("<strong>Le payeur</strong>"), "signature du payeur");
}
const twoTutors = contractClientFromContact(
  { prenom: "Awa", nom: "Diallo", email: "a@b.c", phone: "+221770000000", pays: "Sénégal" },
  {
    ...extras,
    mineur: true,
    representants: [
      { nom: "Fatou Diallo", lien: "Mère", adresse: "Dakar", contact: "fatou@example.com" },
      { nom: "Moussa Diallo", lien: "Père", adresse: "Dakar", contact: "moussa@example.com" },
    ],
  },
);
assert(twoTutors.representants.length === 2 && twoTutors.representant.nom === "Fatou Diallo", "deux tutrices");
const tutorsContract = buildSaleContract({ client: twoTutors, formuleNumber: 1, sentAt });
assert(tutorsContract && "html" in tutorsContract, "contrat avec deux tutrices");
if (tutorsContract && "html" in tutorsContract) {
  assert(tutorsContract.html.includes("Personne tutrice 1"), "première tutrice");
  assert(tutorsContract.html.includes("Moussa Diallo"), "deuxième tutrice");
  assert(tutorsContract.html.includes("ses représentants légaux"), "pluriel");
}
const relatedAdult = contractClientFromContact(
  { prenom: "Awa", nom: "Diallo", email: "a@b.c", phone: "+221770000000", pays: "Sénégal" },
  {
    ...extras,
    representants: [
      { nom: "Awa Ndiaye", lien: "Sœur", adresse: "Dakar", contact: "awa.n@example.com" },
      { nom: "Ibrahima Ndiaye", lien: "Oncle", adresse: "Dakar", contact: "ib@example.com" },
    ],
  },
);
const relatedContract = buildSaleContract({ client: relatedAdult, formuleNumber: 1, sentAt });
assert(relatedContract && "html" in relatedContract, "majeur avec personnes liées");
if (relatedContract && "html" in relatedContract) {
  assert(relatedContract.html.includes("Personnes liées au Client"), "bloc personnes liées");
  assert(relatedContract.html.includes("Awa Ndiaye"), "première personne liée");
  assert(relatedContract.html.includes("Ibrahima Ndiaye"), "deuxième personne liée");
  assert(!relatedContract.html.includes("Si le Client est mineur"), "pas le bloc mineur");
  assert(!relatedContract.html.includes("représentant légal"), "pas un représentant");
}
const partialRelated = buildSaleContract({
  client: contractClientFromContact(
    { prenom: "Awa", nom: "Diallo", email: "a@b.c", phone: "+221770000000", pays: "Sénégal" },
    { ...extras, representants: [{ nom: "Awa Ndiaye", lien: "", adresse: "", contact: "" }] },
  ),
  formuleNumber: 1,
  sentAt,
});
assert(
  partialRelated &&
    "validation" in partialRelated &&
    partialRelated.gaps.includes("Lien de la personne liée avec le client"),
  "personne liée incomplète",
);

function blockText(html: string) {
  return contractHtmlBlocks(html)
    .map((block) => {
      if (block.kind === "stamp") return "";
      if (block.kind === "table") return block.rows.flat().join("\n");
      return block.text;
    })
    .join("\n");
}

for (const doc of [built, formule3, paidByParent]) {
  if (!doc || !("html" in doc)) continue;
  const missing = contractFontGaps(blockText(doc.html));
  assert(missing === "", `glyphes manquants: ${missing}`);
  assert(contractHtmlBlocks(doc.html).some((block) => block.kind === "stamp"), "tampon dans le PDF");
}
assert(contractPdfFilename("Awa Diallo") === "contrat-Awa-Diallo.pdf", "nom du PDF");
assert(
  contractEmailWithPdfNote(built.html).includes(CONTRACT_PDF_NOTE),
  "mention de la pièce jointe",
);
assert(!built.html.includes(CONTRACT_PDF_NOTE), "le contrat source n'annonce pas le PDF");
assert(
  contractFontGaps(`${CONTRACT_COMPANY}${CONTRACT_ADDRESS}`) === "",
  "raison sociale hors police",
);

contractHtmlToPdf(built.html, "Contrat Awa Diallo")
  .then(async (pdf) => {
    assert(pdf.byteLength > 8000, "PDF trop petit");
    assert(String.fromCharCode(...pdf.slice(0, 5)) === "%PDF-", "en-tête PDF");
    const { PDFDocument } = await import("pdf-lib");
    const loaded = await PDFDocument.load(pdf);
    assert(loaded.getTitle() === "Contrat Awa Diallo", "titre du PDF");
    assert(loaded.getPageCount() >= 2, "contrat sur plusieurs pages");
    console.log("saleContract.check ok");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
