import { getFormuleByNumber, getFormuleAccess, FORMULES } from "../formules";
import { matchingLlm } from "./llm";
import { CATEGORY_META } from "./constants";

const F1_KEYS = [
  "analyse",
  "langue",
  "conseils",
  "selection",
  "bourses",
  "procedure",
  "documents",
  "recommandations",
  "echange",
];

const F2_KEYS = [
  "recherche",
  "admission",
  "dossier",
  "formulaires",
  "depot",
  "suivi_reponses",
  "echanges",
];

const F3_KEYS = [
  "cinq_candidatures",
  "suivi_complet",
  "apres_admission",
  "visa",
  "logement",
  "demarches_depart",
];

const QUESTIONS = {
  analyse: "Où en est votre projet ?",
  langue: "Votre niveau de langue suffit-il ?",
  conseils: "Quel domaine et quel niveau viser ?",
  selection: "Quelles universités retenir ?",
  bourses: "Quelles bourses sont documentées ?",
  procedure: "Par où commencer ?",
  documents: "Quelles pièces préparer ?",
  recommandations: "Que faire avant de candidater ?",
  echange: "Que retenir pour l’appel ?",
  recherche: "Quels établissements correspondent à votre fiche ?",
  admission: "Remplissez-vous les critères connus ?",
  dossier: "Quelles pièces manquent encore ?",
  formulaires: "Quoi caler avant les formulaires ?",
  depot: "Quelles candidatures déposer en premier ?",
  suivi_reponses: "Quelles dates surveiller ?",
  echanges: "Que traiter au prochain échange ?",
  cinq_candidatures: "Quelles candidatures retenir ?",
  suivi_complet: "Comment se passe le suivi ?",
  apres_admission: "Que faire dès qu’une offre arrive ?",
  visa: "Que préparer pour le visa ?",
  logement: "Comment s’orienter pour le logement ?",
  demarches_depart: "Que reste-t-il avant le départ ?",
};

const GROUP_LABELS = {
  formule1: "Votre situation",
  formule2: "Candidatures",
  formule3: "Départ",
};

export const BILAN_DISCLAIMER =
  "Aucune admission, bourse ou visa n’est garantie.";

function packDefs(formule, keys, group) {
  const titles = formule.matchingIncludes || formule.includes;
  return titles.map((title, index) => ({
    key: keys[index] || `section_${group}_${index}`,
    title,
    question: QUESTIONS[keys[index]] || `Que faut-il retenir pour : ${title} ?`,
    group,
    groupLabel: GROUP_LABELS[group],
  }));
}

export function getBilanSectionDefs(formuleNumber) {
  const n = Number(formuleNumber) || 1;
  const f1 = packDefs(FORMULES[0], F1_KEYS, "formule1");
  const f2 = packDefs(FORMULES[1], F2_KEYS, "formule2");
  const f3 = packDefs(FORMULES[2], F3_KEYS, "formule3");

  if (n >= 3) {
    return [
      ...f1.filter((section) => section.key !== "selection"),
      ...f2.filter(
        (section) => section.key !== "depot" && section.key !== "suivi_reponses",
      ),
      ...f3,
    ];
  }
  if (n === 2) {
    return [
      ...f1.filter((section) => section.key !== "selection"),
      ...f2,
    ];
  }
  return f1;
}

function diplomaLabel(value) {
  const labels = {
    bac: "Baccalauréat",
    licence: "Licence",
    master: "Master",
    doctorat: "Doctorat",
    autre: "Autre diplôme",
  };
  return labels[value] || value || "à préciser";
}

function degreeLabel(value) {
  const labels = {
    bachelor: "Licence / Bachelor",
    master: "Master",
    phd: "Doctorat",
    language: "Année de langue",
  };
  return labels[value] || value || "à confirmer";
}

function money(cny) {
  if (cny == null || cny === "") return null;
  return `${Number(cny).toLocaleString("fr-FR")} RMB / an`;
}

function topMatches(analyses, limit) {
  return (analyses || []).slice(0, limit);
}

function applicationLimit(formuleNumber) {
  return getFormuleAccess(formuleNumber).applications || 5;
}

export function summarizeDocuments(documents = [], adminDocuments = []) {
  const required = (documents || []).map((doc) => ({
    key: doc.key,
    label: doc.label || doc.key,
    status: doc.status === "received" ? "received" : "missing",
    fileName: doc.file?.name || null,
  }));
  const received = required.filter((doc) => doc.status === "received");
  const missing = required.filter((doc) => doc.status !== "received");
  const fromAdmin = (adminDocuments || []).map((doc) => ({
    name: doc.name,
    path: doc.path,
  }));
  return { required, received, missing, fromAdmin };
}

function factItem(text, tone = "info") {
  if (!text) return null;
  return { text: String(text).trim(), tone };
}

export function normalizeBilanItem(item) {
  if (item && typeof item === "object" && item.text) {
    const tone = ["ok", "warn", "miss", "info"].includes(item.tone)
      ? item.tone
      : "info";
    return { text: String(item.text).trim(), tone };
  }
  const raw = String(item || "").trim();
  const tagged = raw.match(/^\[(ok|warn|miss|info)\]\s*(.*)$/i);
  if (tagged) {
    return { text: tagged[2].trim(), tone: tagged[1].toLowerCase() };
  }
  return { text: raw, tone: "info" };
}

function toneFromStatus(status) {
  if (status === "confirmed") return "ok";
  if (status === "missing") return "miss";
  return "warn";
}

function verdictToneFromItems(items, fallback = "info") {
  const tones = (items || []).map((item) => item.tone);
  if (tones.includes("miss")) return "miss";
  if (tones.includes("warn")) return "warn";
  if (tones.includes("ok")) return "ok";
  return fallback;
}

function uniFacts(item) {
  const tuition = money(item.cost_estimate?.tuition_cny);
  const tuitionMax = money(item.cost_estimate?.tuition_cny_max);
  const tuitionLabel =
    tuition && tuitionMax && tuition !== tuitionMax
      ? `${tuition} à ${tuitionMax}`
      : tuition;
  return {
    name: item.university_name,
    city: item.city || null,
    score: item.score,
    category: item.category,
    categoryKey: item.categoryKey || null,
    qualitative: item.qualitative || null,
    language: item.teaching_language || "à confirmer",
    deadline:
      item.deadline && !/^à vérifier/i.test(item.deadline) ? item.deadline : null,
    tuition: tuitionLabel,
    scholarships: item.scholarships_possible || [],
    strengths: item.strengths || [],
    warnings: item.warnings || [],
    toVerify: item.to_verify || [],
    confirmed: item.confirmed_information || [],
    missingDocs: item.missing_documents || [],
    domainNote: item.breakdown?.academique?.note || item.breakdown?.domain?.note || null,
    languageNote: item.breakdown?.langue?.note || item.breakdown?.language?.note || null,
    languageStatus: item.breakdown?.langue?.status || item.breakdown?.language?.status || null,
    admissionNote: item.breakdown?.admission?.note || item.breakdown?.academique?.note || null,
    admissionStatus: item.breakdown?.admission?.status || item.breakdown?.academique?.status || null,
    breakdown: item.breakdown || {},
  };
}

function uniLine(uni) {
  return [
    uni.name,
    uni.city,
    uni.language,
    uni.tuition ? `frais ${uni.tuition}` : null,
    uni.deadline ? `deadline ${uni.deadline}` : "deadline à confirmer",
  ]
    .filter(Boolean)
    .join(" · ");
}

function documentItems(status, extraRequested = []) {
  const items = [];
  status.required.forEach((doc) => {
    items.push(
      doc.status === "received"
        ? factItem(
            `${doc.label} : reçu${doc.fileName ? ` (${doc.fileName})` : ""}`,
            "ok",
          )
        : factItem(`${doc.label} : à fournir`, "miss"),
    );
  });
  extraRequested.forEach((doc) => {
    items.push(factItem(`Demandé par les universités : ${doc}`, "warn"));
  });
  if (status.fromAdmin.length) {
    status.fromAdmin.forEach((doc) => {
      items.push(
        factItem(`Document transmis par Chinois en Devenir : ${doc.name}`, "ok"),
      );
    });
  } else if (status.required.length) {
    items.push(
      factItem("Aucun document n’a encore été envoyé par l’équipe.", "info"),
    );
  }
  return items.filter(Boolean);
}

function mixLine(uni, formuleNumber) {
  const meta = CATEGORY_META[uni.categoryKey] || null;
  const tag = meta?.label || uni.category || "Piste";
  if (Number(formuleNumber) === 1) {
    return `${tag} — ${uni.name}${uni.city ? ` (${uni.city})` : ""}. ${uni.qualitative || uni.domainNote || ""}`.trim();
  }
  const scores = uni.breakdown
    ? [
        uni.breakdown.langue ? `langue ${uni.breakdown.langue.points}` : null,
        uni.breakdown.academique ? `parcours ${uni.breakdown.academique.points}` : null,
        uni.breakdown.financier ? `budget ${uni.breakdown.financier.points}` : null,
        uni.breakdown.bourse ? `bourse ${uni.breakdown.bourse.points}` : null,
      ].filter(Boolean)
    : [];
  return `${tag} — ${uni.name}${uni.city ? ` (${uni.city})` : ""} · ${uni.score}/100${scores.length ? ` (${scores.join(" · ")})` : ""}`;
}

function buildSectionMap(ctx) {
  const { student, analyses, formuleNumber, documents, adminDocuments } = ctx;
  const n = Number(formuleNumber) || 1;
  const limit = getFormuleAccess(n).matchLimit || applicationLimit(n);
  const applyMax = applicationLimit(n);
  const top = topMatches(analyses, limit).map(uniFacts);
  const toApply = top.slice(0, applyMax);
  const field = student.field || "votre domaine";
  const diploma = diplomaLabel(student.dernierDiplome || student.diploma);
  const degree = degreeLabel(student.targetDegree);
  const budget = student.budget?.label || student.budget || "à préciser";
  const intake = student.intake?.label || student.intake || "à préciser";
  const hskKnown = student.hsk === 0 || student.hsk;
  const hsk = hskKnown ? `HSK ${student.hsk}` : null;
  const english = student.english || null;
  const extraDocs = [
    ...new Set(top.flatMap((item) => item.missingDocs || [])),
  ].slice(0, 8);
  const status = summarizeDocuments(documents, adminDocuments);
  const missingCount = status.missing.length;
  const scholarshipGoal = student.scholarshipGoal;

  const analyseItems = [
    factItem(`Domaine : ${field}`, field === "votre domaine" ? "warn" : "ok"),
    factItem(`Diplôme : ${diploma} · niveau visé : ${degree}`, student.targetDegreeSource === "confirmed" ? "ok" : "warn"),
    factItem(`Budget : ${budget}`, /préciser/i.test(String(budget)) ? "miss" : "ok"),
  ].filter(Boolean);

  const langueItems = [
    factItem(
      hsk
        ? `Chinois : ${hsk}${student.hskSource === "default_beginner" ? " (à confirmer)" : ""}`
        : "Chinois : HSK à confirmer",
      hsk && student.hskSource !== "default_beginner" ? "ok" : "miss",
    ),
    factItem(
      english ? `Anglais : ${english}` : "Anglais : à confirmer",
      english ? "ok" : "miss",
    ),
  ].filter(Boolean);

  const selectionItems = top.length
    ? top.map((uni) =>
        factItem(
          mixLine(uni, n),
          uni.categoryKey === "safety" || uni.score >= 80
            ? "ok"
            : uni.categoryKey === "unready" || uni.score < 40
              ? "miss"
              : "warn",
        ),
      )
    : [factItem("Aucune université assez compatible avec les données actuelles.", "miss")];

  const bourseItems = top.length
    ? top.map((uni) =>
        uni.scholarships.length
          ? factItem(
              `${uni.name} — pistes : ${uni.scholarships.join(", ")}`,
              "ok",
            )
          : factItem(
              `${uni.name} — aucune bourse clairement documentée dans le catalogue`,
              "warn",
            ),
      )
    : [factItem("Pas assez d’universités pour lister des bourses.", "miss")];

  if (scholarshipGoal === "required") {
    bourseItems.unshift(
      factItem(
        "Une bourse est un objectif du dossier : rien n’est garanti, il faut croiser les appels et les quotas.",
        "warn",
      ),
    );
  }

  const admissionItems = toApply.flatMap((uni) => {
    const rows = [
      factItem(
        `${uni.name} — ${uni.admissionNote || "critères à recouper"}.`,
        toneFromStatus(uni.admissionStatus),
      ),
    ];
    uni.warnings.slice(0, 1).forEach((line) => {
      rows.push(factItem(`${uni.name} — ${line}`, "miss"));
    });
    return rows;
  });

  const recommended = [
    ...new Set(
      (analyses || [])
        .slice(0, limit)
        .flatMap((item) => item.recommended_actions || []),
    ),
  ].slice(0, 6);

  return {
    analyse: {
      verdict: `${field} · rentrée ${intake}`,
      body: `Votre projet vise ${field} (${diploma}, ${degree}), pour une rentrée ${intake}.`,
      items: analyseItems.slice(0, 3),
    },
    langue: {
      verdict: hsk || english ? `${hsk || "HSK à confirmer"} · ${english || "anglais à confirmer"}` : "Niveaux à confirmer",
      body: hsk || english
        ? `Niveaux indiqués : ${hsk || "HSK à confirmer"}${student.hskSource === "default_beginner" ? " (à confirmer)" : ""}${english ? ` ; anglais ${english}` : " ; anglais à confirmer"}.`
        : "Le chinois et l’anglais restent à préciser avant de figer la langue d’enseignement.",
      items: langueItems.slice(0, 3),
    },
    conseils: {
      verdict: `${field} · ${degree}`,
      body: `Le niveau le plus cohérent est ${degree}, dans ${field}. Mieux vaut figer le domaine et la langue avant de multiplier les candidatures.`,
      items: [
        factItem(`Domaine : ${field}`, "ok"),
        factItem(
          `Niveau visé : ${degree}${student.targetDegreeSource === "confirmed" ? "" : " (estimé)"}`,
          student.targetDegreeSource === "confirmed" ? "ok" : "warn",
        ),
      ],
    },
    selection: {
      verdict: top.length
        ? `${top.length} établissement${top.length > 1 ? "s" : ""} retenu${top.length > 1 ? "s" : ""}`
        : "Sélection encore insuffisante",
      body: top.length
        ? `Voici les universités à viser en priorité. Chaque piste reste à vérifier (programme, langue, frais, dates).`
        : "Les données actuelles ne permettent pas une sélection fiable. Précisez le domaine, le niveau visé ou le budget.",
      items: selectionItems,
    },
    bourses: {
      verdict: top.some((uni) => uni.scholarships.length)
        ? "Pistes documentées"
        : "Peu de bourses documentées",
      body: top.some((uni) => uni.scholarships.length)
        ? `Des pistes apparaissent dans le catalogue (CSC, bourse d’université, bourse provinciale). L’obtention n’est jamais automatique.`
        : "Peu de bourses clairement documentées pour ces établissements. Un financement personnel reste à prévoir, sauf vérification contraire.",
      items: bourseItems.slice(0, 5),
    },
    procedure: {
      verdict: n >= 3 ? "Jusqu’au départ" : n === 2 ? "Jusqu’aux réponses" : "Clarifier, puis décider",
      body:
        n >= 3
          ? `La procédure va du dossier jusqu’au départ : candidatures, réponses, puis conseils visa et logement. Les démarches officielles restent à votre charge.`
          : n === 2
            ? `La procédure va jusqu’aux réponses des universités : caler ${applyMax} candidatures, déposer, suivre.`
            : `On clarifie d’abord le projet, puis on rassemble les pièces, puis on candidate.`,
      items: [
        factItem("Clarifier le projet", "info"),
        factItem("Rassembler les documents nécessaires", "info"),
        factItem(
          n >= 2
            ? `Candidater (${applyMax} maximum)`
            : "Candidater aux universités retenues",
          "info",
        ),
        n >= 3
          ? factItem("Puis visa, logement et départ (conseils uniquement)", "info")
          : null,
      ].filter(Boolean),
    },
    documents: {
      verdict:
        extraDocs.length || missingCount
          ? "Liste à adapter selon l’université"
          : "Pièces de base à préparer",
      body: "Liste de départ, à adapter selon l’université et le pays d’origine. Les traductions certifiées, légalisations et frais universitaires restent à votre charge.",
      items: [
        factItem("Passeport en cours de validité", "info"),
        factItem("Dernier diplôme et relevés de notes", "info"),
        factItem("Traduction en anglais ou en chinois si l’université l’exige", "info"),
        ...extraDocs.map((doc) => factItem(doc, "warn")),
      ].slice(0, 10),
    },
    recommandations: {
      verdict: "Points à traiter avant de déposer",
      body: "Précisez le projet, documentez la langue, et évitez les pièces manquantes avant de candidater.",
      items: [
        ...recommended.slice(0, 3).map((line) => factItem(line, "warn")),
        hsk && student.hskSource !== "default_beginner"
          ? null
          : factItem("Faire évaluer le chinois (HSK) ou confirmer un cursus en anglais", "miss"),
        /préciser/i.test(String(budget))
          ? factItem("Indiquer un budget annuel", "miss")
          : null,
      ].filter(Boolean).slice(0, 4),
    },
    echange: {
      verdict: "À relire avant l’appel",
      body: `Relisez ce compte rendu, notez ce qui vous semble incomplet, et nous l’ajustons ensemble.`,
      items: [
        factItem("Confirmer le domaine et le niveau visé", "info"),
        factItem("Trancher la langue d’enseignement", hsk || english ? "info" : "warn"),
        factItem(
          n >= 2
            ? "Valider les universités de dépôt"
            : "Décider de la suite après ce bilan",
          "info",
        ),
      ],
    },
    recherche: {
      verdict: top.length
        ? `${top.length} établissement${top.length > 1 ? "s" : ""} retenu${top.length > 1 ? "s" : ""}`
        : "Pas encore assez d’éléments",
      body: top.length
        ? `Voici les établissements retenus pour ${field}, d’après votre fiche et le catalogue.`
        : "Pas assez d’éléments pour retenir un établissement. Mettez à jour le profil.",
      items: top.length
        ? top.slice(0, applyMax).map((uni) =>
            factItem(
              `${uni.name}${uni.city ? ` (${uni.city})` : ""} — ${uni.language}`,
              "ok",
            ),
          )
        : [factItem("Aucune piste assez solide pour le moment.", "miss")],
    },
    admission: {
      verdict: toApply.length
        ? "Critères connus, à confirmer avant dépôt"
        : "Pas encore de critères à recouper",
      body: "Les critères connus sont listés ci-dessous. Confirmez-les auprès de l’université avant de déposer.",
      items: admissionItems.length
        ? admissionItems.slice(0, 6)
        : [factItem("Pas d’université assez compatible pour vérifier des critères.", "miss")],
    },
    dossier: {
      verdict:
        missingCount > 0
          ? `${missingCount} document${missingCount > 1 ? "s" : ""} encore à fournir`
          : status.received.length
            ? "Pièces demandées reçues"
            : "Dossier à constituer",
      body:
        missingCount > 0
          ? `Le dossier n’est pas complet : ${missingCount} document${missingCount > 1 ? "s" : ""} encore à fournir.`
          : status.received.length
            ? "Les pièces demandées dans l’espace étudiant ont été reçues. Vérifiez encore celles propres à chaque université."
            : "Aucun document n’a encore été déposé. Commencez par les pièces de base.",
      items: documentItems(status, extraDocs),
    },
    formulaires: {
      verdict: "Caler universités et pièces avant de remplir",
      body: "Nous aidons à remplir les formulaires une fois les universités et les pièces calées.\n\nPréparez les informations personnelles, le parcours et les pièces scannées avant de commencer.",
      items: [
        factItem(`Caler jusqu’à ${applyMax} universités parmi la liste recommandée`, "info"),
        factItem("Avoir passeport et diplôme lisibles (et traduits si exigé)", missingCount ? "warn" : "info"),
        ...recommended.slice(0, 3).map((line) => factItem(line, "warn")),
      ].filter(Boolean),
    },
    depot: {
      verdict: `Jusqu’à ${applyMax} candidatures`,
      body: `Jusqu’à ${applyMax} candidatures. L’ordre ci-dessous est celui de la sélection.`,
      items: toApply.length
        ? toApply.map((uni, index) =>
            factItem(`${index + 1}. ${uni.name}${uni.city ? ` (${uni.city})` : ""}`, "ok"),
          )
        : [factItem("Aucune université assez compatible pour déposer un dossier pour le moment.", "miss")],
    },
    suivi_reponses: {
      verdict: "Deadlines à surveiller jusqu’aux réponses",
      body: "Le suivi va jusqu’aux réponses des universités. Notez les deadlines et les pièces encore manquantes pour ne pas rater une session.",
      items: toApply.length
        ? toApply.map((uni) =>
            factItem(
              uni.deadline
                ? `${uni.name} — deadline indiquée : ${uni.deadline}`
                : `${uni.name} — deadline à confirmer auprès de l’université`,
              uni.deadline ? "warn" : "miss",
            ),
          )
        : [factItem("Pas de candidature à suivre tant que la liste n’est pas calée.", "warn")],
    },
    echanges: {
      verdict: missingCount ? "Priorité : pièces manquantes" : "Dossier de base en ordre",
      body: "Des échanges réguliers permettent d’ajuster le dossier. Ce compte rendu évoluera après chaque étape (pièces reçues, candidature déposée, réponse d’université).",
      items: [
        missingCount
          ? factItem(
              `Priorité : envoyer ${status.missing.map((doc) => doc.label).join(", ")}`,
              "miss",
            )
          : factItem("Documents de base reçus — on peut caler les formulaires", "ok"),
        factItem(`Confirmer les ${applyMax} universités de dépôt`, "info"),
        factItem("Préparer les questions pour le prochain échange", "info"),
      ].filter(Boolean),
    },
    cinq_candidatures: {
      verdict: `Jusqu’à ${applyMax} dépôts`,
      body: `Jusqu’à ${applyMax} candidatures, à valider avant dépôt.`,
      items: toApply.length
        ? toApply.map((uni, index) =>
            factItem(`${index + 1}. ${uni.name}${uni.city ? ` (${uni.city})` : ""}`, "ok"),
          )
        : [factItem(`Pas assez d’éléments pour figer ${applyMax} candidatures.`, "miss")],
    },
    suivi_complet: {
      verdict: "Du dossier jusqu’au départ",
      body: `Suivi du dossier jusqu’aux réponses, puis après admission. Ce compte rendu sera mis à jour au fil des étapes.`,
      items: [
        factItem(
          missingCount
            ? `Dossier : ${missingCount} pièce(s) encore à fournir`
            : "Dossier : pièces de base reçues",
          missingCount ? "miss" : "ok",
        ),
        factItem(`Candidatures : ${toApply.length} université(s) prioritaire(s)`, toApply.length ? "ok" : "warn"),
        factItem("Lecture des réponses / documents d’admission", "info"),
        factItem("Puis conseils visa, logement et départ (sans démarches officielles à votre place)", "info"),
      ],
    },
    apres_admission: {
      verdict: status.fromAdmin.length
        ? `${status.fromAdmin.length} document${status.fromAdmin.length > 1 ? "s" : ""} transmis par l’équipe`
        : "En attente d’une offre à relire",
      body: "Après admission, nous vous aidons à lire les documents de l’université (offre, JW201/JW202, délais, frais). Les fichiers transmis par l’équipe apparaissent ici dès qu’ils sont déposés.",
      items: status.fromAdmin.length
        ? status.fromAdmin.map((doc) => factItem(`Reçu de l’équipe : ${doc.name}`, "ok"))
        : [
            factItem("Aucun document d’admission n’a encore été déposé par l’équipe.", "warn"),
            factItem("Dès réception d’une offre, envoyez-la-nous pour relecture.", "info"),
          ],
    },
    visa: {
      verdict: "Conseils — démarches officielles à votre charge",
      body: "Nous vous orientons sur le dossier de visa. Les démarches officielles restent à votre charge.",
      items: [
        factItem("Passeport, admission et pièces exigées par le consulat", "info"),
        factItem("Délais à vérifier dès réception du JW201 / JW202", "warn"),
        factItem("Rendez-vous, photos, assurances et frais consulaires à anticiper", "info"),
      ],
    },
    logement: {
      verdict: "Orientation — réservations à votre charge",
      body: "Nous vous orientons pour le logement et l’arrivée. La réservation et les démarches restent à votre charge.",
      items: [
        factItem(
          top[0]?.city
            ? `À ${top[0].city} : comparer campus et ville, puis caler le dépôt et la date d’arrivée`
            : "Comparer campus et ville, puis caler le dépôt et la date d’arrivée",
          "info",
        ),
        factItem("Billet après le visa, arrivée calée sur l’inscription", "info"),
        factItem("À l’arrivée : inscription à l’université et titre de séjour", "info"),
      ],
    },
    demarches_depart: {
      verdict: missingCount ? "D’abord finaliser les pièces" : "Check-list avant départ",
      body: "Liste des démarches à faire avant le départ. Elle sera précisée selon l’université d’admission et le pays de départ.",
      items: [
        missingCount
          ? factItem(
              `Finaliser les documents manquants : ${status.missing.map((doc) => doc.label).join(", ")}`,
              "miss",
            )
          : factItem("Documents de base en ordre", "ok"),
        factItem("Visa et documents d’admission relus", "info"),
        factItem("Logement et billet calés", "info"),
        factItem("Copies numériques de tous les originaux importants", "info"),
      ].filter(Boolean),
    },
  };
}

function introFor(formuleNumber) {
  const n = Number(formuleNumber) || 1;
  const applyMax = applicationLimit(n);
  if (n >= 3) {
    return `Voici le compte rendu pour viser jusqu’à ${applyMax} candidatures, puis le visa et le logement.`;
  }
  if (n === 2) {
    return `Voici le compte rendu pour préparer jusqu’à ${applyMax} candidatures.`;
  }
  return "Voici le compte rendu de votre projet, et les établissements à viser en priorité.";
}

function tightenBody(body) {
  const block = String(body || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find(Boolean);
  if (!block) return "";
  const sentences = block.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [block];
  return sentences
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function scrubJargon(text) {
  return String(text || "")
    .replace(/un mix d[’']universités[^.,]*/gi, "les universités retenues")
    .replace(/mix d[’']universités/gi, "universités retenues")
    .replace(/\bmatching\b/gi, "sélection")
    .replace(/formule\s*[123]/gi, "")
    .replace(/écarts à combler/gi, "points à traiter")
    .replace(/feuille de route/gi, "étapes")
    .replace(/sans promesse d[’']admission/gi, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}

export function tightenBilan(bilan, formuleNumber) {
  const n = Number(formuleNumber || bilan?.formuleNumber) || 1;
  if (!bilan) return bilan;
  return {
    ...bilan,
    formuleNumber: n,
    intro: introFor(n),
    disclaimer: BILAN_DISCLAIMER,
    sections: (bilan.sections || []).map((section) => {
      const items = (section.items || [])
        .map(normalizeBilanItem)
        .filter((item) => item.text)
        .slice(0, 3)
        .map((item) => ({ ...item, text: scrubJargon(item.text) }));
      return {
        ...section,
        body: scrubJargon(tightenBody(section.body)),
        verdict: scrubJargon(String(section.verdict || "")).slice(0, 72),
        items,
        verdictTone: verdictToneFromItems(items, section.verdictTone),
      };
    }),
  };
}

function finalizeSection(def, content) {
  const items = (content.items || []).map(normalizeBilanItem).filter((item) => item.text);
  return {
    key: def.key,
    title: def.title,
    question: def.question,
    group: def.group,
    groupLabel: def.groupLabel,
    verdict: content.verdict || "",
    verdictTone: verdictToneFromItems(items),
    body: content.body || "",
    items,
  };
}

export function buildOrientationBilanDraft({
  student = {},
  analyses = [],
  formuleNumber = 1,
  documents = [],
  adminDocuments = [],
  gaps = [],
} = {}) {
  const n = Number(formuleNumber) || 1;
  const defs = getBilanSectionDefs(n);
  const map = buildSectionMap({
    student,
    analyses,
    formuleNumber: n,
    documents,
    adminDocuments,
    gaps,
  });
  const status = summarizeDocuments(documents, adminDocuments);

  return tightenBilan({
    formuleNumber: n,
    intro: introFor(n),
    disclaimer: BILAN_DISCLAIMER,
    documents_status: status,
    universities: topMatches(analyses, getFormuleAccess(n).matchLimit || 8).map((item) => ({
      name: item.university_name,
      city: item.city || null,
      language: item.teaching_language || "à confirmer",
      category: item.category || null,
      categoryKey: item.categoryKey || null,
      score: n === 1 ? null : item.score,
      qualitative: item.qualitative || null,
    })),
    gaps,
    quality_score: student.qualityScore ?? null,
    sections: defs.map((section) =>
      finalizeSection(section, map[section.key] || {
        body: "Cette partie sera complétée au prochain échange.",
        items: [],
        verdict: "À compléter",
      }),
    ),
  }, n);
}

function refreshDocumentSections(bilan, status, formuleNumber) {
  if (Number(formuleNumber) < 2) return bilan;
  const extraDocs = [];
  return {
    ...bilan,
    sections: (bilan.sections || []).map((section) => {
      if (section.key === "dossier") {
        const items = documentItems(status, extraDocs);
        return {
          ...section,
          items,
          verdictTone: verdictToneFromItems(items, section.verdictTone),
        };
      }
      if (section.key === "apres_admission") {
        const items = status.fromAdmin.length
          ? status.fromAdmin.map((doc) =>
              normalizeBilanItem({
                text: `Reçu de l’équipe : ${doc.name}`,
                tone: "ok",
              }),
            )
          : (section.items || []).map(normalizeBilanItem);
        return { ...section, items };
      }
      return {
        ...section,
        items: (section.items || []).map(normalizeBilanItem),
      };
    }),
  };
}

function storedBilanIsComplete(stored, formuleNumber) {
  if (!stored?.sections?.length) return false;
  const keys = stored.sections.map((section) => section.key);
  if (keys.includes("f1_included") || keys.includes("f12_included")) return false;
  const expected = getBilanSectionDefs(formuleNumber).map((def) => def.key);
  if (expected.length !== keys.length) return false;
  const actual = new Set(keys);
  return expected.every((key) => actual.has(key));
}

export function buildOrientationBilanFromResult(
  result,
  formuleNumber,
  { documents, adminDocuments } = {},
) {
  const n =
    Number(formuleNumber) || result?.orientation_bilan?.formuleNumber || 1;
  const stored =
    result?.orientation_bilan || (n === 1 ? result?.formule1_bilan : null);
  const status = summarizeDocuments(documents || [], adminDocuments || []);

  if (storedBilanIsComplete(stored, n)) {
    const live =
      documents || adminDocuments
        ? refreshDocumentSections(stored, status, n)
        : {
            ...stored,
            sections: (stored.sections || []).map((section) => ({
              ...section,
              items: (section.items || []).map(normalizeBilanItem),
            })),
          };
    const defs = getBilanSectionDefs(n);
    const byKey = new Map(defs.map((def) => [def.key, def]));
    return tightenBilan({
      ...live,
      formuleNumber: n,
      intro: introFor(n),
      disclaimer: BILAN_DISCLAIMER,
      documents_status: status,
      sections: (live.sections || [])
        .filter((section) => byKey.has(section.key))
        .map((section) => {
        const def = byKey.get(section.key);
        return {
          ...section,
          question: def?.question || section.question || section.title,
          group: def?.group || section.group,
          groupLabel: def?.groupLabel || section.groupLabel,
          items: (section.items || []).map(normalizeBilanItem),
        };
      }),
    }, n);
  }

  return tightenBilan(
    buildOrientationBilanDraft({
      student: result?.student || {},
      analyses: result?.matches || [],
      formuleNumber: n,
      documents,
      adminDocuments,
      gaps: result?.gaps || [],
    }),
    n,
  );
}

function applyPolishedJson(draft, parsed) {
  const byKey = new Map(
    (parsed.sections || []).map((section) => [section.key, section]),
  );
  return {
    ...draft,
    intro: introFor(draft.formuleNumber),
    disclaimer: BILAN_DISCLAIMER,
    sections: draft.sections.map((section) => {
      const updated = byKey.get(section.key);
      if (!updated) return section;
      const items = Array.isArray(updated.items)
        ? updated.items.map(normalizeBilanItem).filter((item) => item.text).slice(0, 3)
        : section.items;
      const nextItems = (items.length ? items : section.items).slice(0, 3);
      return {
        ...section,
        body: scrubJargon(tightenBody(String(updated.body || section.body))),
        verdict: scrubJargon(String(updated.verdict || section.verdict)).slice(0, 72),
        items: nextItems,
        verdictTone: verdictToneFromItems(nextItems, section.verdictTone),
      };
    }),
    ai: true,
  };
}

async function polishOrientationBilan(draft, payload) {
  const formule = getFormuleByNumber(draft.formuleNumber);
  const polished = await matchingLlm({
    system: `Tu es conseiller d'une agence francophone d'études en Chine. Tu rédiges « Votre orientation », un compte rendu d'agence : sobre, précis, cohérent.

${formule ? `Prestation : ${formule.shortTitle}.` : ""}
Règles :
- Français professionnel, vouvoiement. Pas de marketing, pas de familier, pas d'emojis.
- UNE phrase par body (deux maximum si indispensable). 3 items maximum par section.
- Ne répète pas une liste d'universités : elles sont déjà affichées à part.
- Interdit : « mix », « matching », « formule 1/2/3 », « feuille de route », « écarts à combler », « sans promesse d'admission ».
- L'intro est imposée : recopie-la telle quelle, sans rien ajouter.
- Distingue établi / à vérifier / manquant. Ne garantis jamais admission, bourse ou visa.
- N'invente aucun frais, date, HSK, programme, université ou document absent du brief.
- Cohérence stricte : mêmes universités, mêmes niveaux de langue, pas de contradiction entre sections.
- Items : préfixe [ok] / [warn] / [miss] / [info]. Un fait par item, phrase courte.
- verdict : moins de 6 mots.

Réponds uniquement par un JSON { intro, sections: [{ key, body, items, verdict }] } avec les mêmes keys.`,
    user: `Brief (JSON) :\n${JSON.stringify(payload).slice(0, 14000)}\n\nBrouillon à réécrire, sans changer les keys :\n${JSON.stringify({
      intro: draft.intro,
      sections: draft.sections.map((section) => ({
        key: section.key,
        title: section.title,
        question: section.question,
        verdict: section.verdict,
        body: section.body,
        items: (section.items || []).slice(0, 3),
      })),
    })}`,
    temperature: 0.12,
    maxTokens: 4000,
    timeoutMs: 45000,
  });

  if (!polished.ok || !polished.json?.sections?.length) {
    return { ...tightenBilan(draft, draft.formuleNumber), ai: false };
  }

  let next = applyPolishedJson(draft, polished.json);

  const edited = await matchingLlm({
    system: `Tu es relecteur d'une agence d'études en Chine. Relis le compte rendu comme un document client.

Corrige : ton peu professionnel, phrases trop longues, jargon interne, incohérences (HSK, universités, dates, budget), doublons.
Coupe : listes d'universités déjà dites, détails inutiles, formules vagues (« optimiser », « accompagner au mieux »).
Garde : les faits du brief. Une phrase par body, 3 items max.
Interdit : mix, matching, numéros de formule, « sans promesse d'admission » dans l'intro.
L'intro reste exactement : « ${draft.intro} »

JSON uniquement : { intro, sections: [{ key, body, items, verdict }] }.`,
    user: JSON.stringify({
      intro: draft.intro,
      sections: next.sections.map((section) => ({
        key: section.key,
        title: section.title,
        verdict: section.verdict,
        body: section.body,
        items: (section.items || []).slice(0, 3),
      })),
    }).slice(0, 14000),
    temperature: 0.08,
    maxTokens: 3500,
    timeoutMs: 25000,
  });

  if (edited.ok && edited.json?.sections?.length) {
    next = applyPolishedJson(next, edited.json);
  }

  return tightenBilan(next, draft.formuleNumber);
}

export async function generateOrientationBilan({
  student,
  analyses,
  formuleNumber,
  documents = [],
  adminDocuments = [],
  gaps = [],
}) {
  const n = Number(formuleNumber) || 1;
  const draft = buildOrientationBilanDraft({
    student,
    analyses,
    formuleNumber: n,
    documents,
    adminDocuments,
    gaps,
  });
  const top = topMatches(analyses, getFormuleAccess(n).matchLimit || 8);
  return polishOrientationBilan(draft, {
    formuleNumber: n,
    formuleTitle: getFormuleByNumber(n)?.title,
    instruction:
      "Compte rendu court, professionnel, sans jargon. Une phrase d’intro imposée. Pas de doublon. Les universités sont listées à part : ne pas les répéter.",
    student: {
      name: student.name,
      prenom: student.prenom,
      field: student.field,
      diploma: student.dernierDiplome,
      degree: student.targetDegree,
      degreeSource: student.targetDegreeSource,
      country: student.country,
      age: student.age,
      budget: student.budget?.label,
      intake: student.intake?.label,
      hsk: student.hsk,
      english: student.english,
      gpa: student.gpa,
      qualityScore: student.qualityScore,
      scholarshipGoal: student.scholarshipGoal,
    },
    gaps,
    documents: summarizeDocuments(documents, adminDocuments),
    matches: top.map((item) => ({
      name: item.university_name,
      city: item.city || null,
      score: n === 1 ? undefined : item.score,
      category: item.category,
      categoryKey: item.categoryKey,
      qualitative: item.qualitative,
      language: item.teaching_language,
      deadline: item.deadline,
      cost: item.cost_estimate,
      strengths: item.strengths,
      warnings: item.warnings,
      confirmed: item.confirmed_information,
      scholarships: item.scholarships_possible,
      documents: item.missing_documents,
      actions: item.recommended_actions,
      to_verify: item.to_verify,
      breakdown: n === 1 ? undefined : item.breakdown,
      languageNote: item.breakdown?.langue?.note || item.breakdown?.language?.note,
      domainNote: item.breakdown?.academique?.note || item.breakdown?.domain?.note,
    })),
  });
}

export const FORMULE1_SECTIONS = getBilanSectionDefs(1);

export function buildFormule1BilanDraft(student, analyses) {
  return buildOrientationBilanDraft({ student, analyses, formuleNumber: 1 });
}

export function buildFormule1BilanFromResult(result) {
  return buildOrientationBilanFromResult(result, 1);
}

export async function generateFormule1Bilan(args) {
  return generateOrientationBilan({ ...args, formuleNumber: 1 });
}
