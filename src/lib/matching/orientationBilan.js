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
  analyse:
    "Où en est votre projet, concrètement — et qu’est-ce qui manque encore ?",
  langue:
    "Votre niveau de langue ouvre-t-il les portes, ou faut-il un détour ?",
  conseils: "Quel domaine et quel niveau visent vraiment, pour vous ?",
  selection:
    "Quelles universités former votre mix : sûres, réalistes, ambitieuses ?",
  bourses: "Quelles bourses sont réellement documentées pour ces établissements ?",
  procedure: "Par où commencer, dans votre cas — et dans quel ordre ?",
  documents: "Quelles pièces préparer maintenant, sans tout traduire trop tôt ?",
  recommandations: "Que faut-il combler avant de déposer un dossier ?",
  echange:
    "Que retenir pour l’appel, et quelle décision prendre ensuite ?",
  recherche:
    "Quelles universités, formations et bourses collent à votre fiche ?",
  admission: "Sur quels critères connus êtes-vous déjà dans les clous ?",
  dossier: "Quelles pièces sont reçues, lesquelles bloquent encore ?",
  formulaires: "Quoi caler avant de remplir les formulaires ?",
  depot: "Quelles candidatures déposer en premier (3 maximum) ?",
  suivi_reponses: "Quelles deadlines surveiller jusqu’aux réponses ?",
  echanges: "Que traiter au prochain échange ?",
  cinq_candidatures: "Quelles candidatures retenir (jusqu’à 5) ?",
  suivi_complet: "Comment se déroule le suivi, du dossier jusqu’au départ ?",
  apres_admission: "Que relire dès qu’une offre arrive ?",
  visa: "Que préparer pour le visa — sans faire les démarches à votre place ?",
  logement: "Comment s’orienter pour le logement, le voyage et l’arrivée ?",
  demarches_depart: "Que reste-t-il à faire avant de partir ?",
};

const GROUP_LABELS = {
  formule1: "— Bilan",
  formule2: "— Candidature",
  formule3: "— La suite",
};

export const BILAN_DISCLAIMER =
  "*Aucune admission, bourse ou visa n’est garantie.*";

function packDefs(formule, keys, group) {
  const titles =
    formule.number === 1 ? formule.includes : formule.includes.slice(1);
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
  if (Number(formuleNumber) >= 3) return 5;
  if (Number(formuleNumber) === 2) return 3;
  return 5;
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

function gapTone(type) {
  if (type === "langue" || type === "financier") return "miss";
  if (type === "academique") return "warn";
  return "info";
}

function buildSectionMap(ctx) {
  const { student, analyses, formuleNumber, documents, adminDocuments, gaps = [] } = ctx;
  const n = Number(formuleNumber) || 1;
  const limit = getFormuleAccess(n).matchLimit || applicationLimit(n);
  const applyMax = applicationLimit(n);
  const top = topMatches(analyses, limit).map(uniFacts);
  const toApply = top.slice(0, applyMax);
  const name = student.prenom || student.name || "vous";
  const field = student.field || "votre domaine";
  const country = student.country || "votre pays";
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
  const quality = student.qualityScore;
  const gapItems = (gaps || []).map((gap) =>
    factItem(
      gap.universite ? `${gap.universite} — ${gap.conseil}` : gap.conseil,
      gapTone(gap.type),
    ),
  );

  const analyseItems = [
    quality != null
      ? factItem(`Complétude du dossier : ${quality}/100`, quality >= 70 ? "ok" : quality >= 45 ? "warn" : "miss")
      : null,
    factItem(`Pays de résidence : ${country}`, "ok"),
    factItem(`Domaine indiqué : ${field}`, field === "votre domaine" ? "warn" : "ok"),
    factItem(`Dernier diplôme : ${diploma}`, "ok"),
    factItem(
      `Niveau visé : ${degree}`,
      student.targetDegreeSource === "confirmed" ? "ok" : "warn",
    ),
    factItem(`Budget annuel : ${budget}`, /préciser/i.test(String(budget)) ? "miss" : "ok"),
    factItem(`Rentrée visée : ${intake}`, "info"),
  ].filter(Boolean);

  const langueItems = [
    factItem(
      hsk
        ? `Chinois : ${hsk}${student.hskSource === "default_beginner" ? " (débutant par défaut)" : ""}`
        : "Chinois : HSK non renseigné — à confirmer",
      hsk && student.hskSource !== "default_beginner" ? "ok" : "miss",
    ),
    factItem(
      english ? `Anglais : ${english}` : "Anglais : niveau non renseigné — à confirmer",
      english ? "ok" : "miss",
    ),
    ...top.map((uni) =>
      factItem(
        `${uni.name} — ${uni.language}${uni.languageNote ? ` (${uni.languageNote})` : ""}`,
        toneFromStatus(uni.languageStatus),
      ),
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
        `${uni.name} — ${uni.admissionNote || "critères à recouper avec le programme"}. ${uniLine(uni)}`,
        toneFromStatus(uni.admissionStatus),
      ),
    ];
    uni.confirmed.slice(0, 2).forEach((line) => {
      rows.push(factItem(`${uni.name} — établi : ${line}`, "ok"));
    });
    uni.toVerify.slice(0, 3).forEach((line) => {
      rows.push(factItem(`${uni.name} — à vérifier : ${line}`, "warn"));
    });
    uni.warnings.slice(0, 2).forEach((line) => {
      rows.push(factItem(`${uni.name} — vigilance : ${line}`, "miss"));
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
      verdict:
        quality != null
          ? `Dossier ${quality}/100 · ${field} · rentrée ${intake}`
          : `${field} · ${diploma} · rentrée ${intake}`,
      body: `À partir de la fiche de ${name} (${country}), le projet s’oriente vers ${field}.\n\nDernier diplôme retenu : ${diploma}. Niveau visé : ${degree}. Rentrée : ${intake}.\n\nCe n’est pas une admission : c’est une lecture réaliste de votre situation, recoupée avec le catalogue. Le mix ci-dessous vise à ne pas tout miser sur un seul établissement trop juste.`,
      items: analyseItems,
    },
    langue: {
      verdict: hsk || english ? `${hsk || "HSK à confirmer"} · ${english || "anglais à confirmer"}` : "Niveaux de langue à confirmer",
      body: hsk || english
        ? `État actuel : ${hsk || "HSK non renseigné"}${student.hskSource === "default_beginner" ? " (hypothèse débutant, à confirmer)" : ""} ; ${english ? `anglais ${english}` : "anglais non renseigné"}.\n\nSans le bon niveau, une admission directe se ferme. Un cursus en anglais ou une année de langue peut rester ouvert — à vérifier établissement par établissement.`
        : `Le chinois (HSK) et l’anglais ne sont pas encore assez renseignés.\n\nSans ces niveaux, on ne tranche pas entre un cursus en chinois, un cursus en anglais, ou une année de langue. L’échange téléphonique servira à le caler.`,
      items: langueItems,
    },
    conseils: {
      verdict: `${field} · ${degree}`,
      body: `Pour ce profil, le niveau d’études le plus cohérent est ${degree}, dans ${field}.\n\nMieux vaut figer le domaine et la langue avant de multiplier les candidatures. Si le projet n’est pas tranché, on confirme ${field} plutôt que de viser trop d’établissements.`,
      items: [
        factItem(`Domaine retenu : ${field}`, "ok"),
        factItem(
          `Niveau visé : ${degree}${student.targetDegreeSource === "confirmed" ? " (confirmé)" : " (estimé à partir du dernier diplôme)"}`,
          student.targetDegreeSource === "confirmed" ? "ok" : "warn",
        ),
        factItem("Valider le domaine et la langue avant de déposer un dossier", "info"),
      ],
    },
    selection: {
      verdict: top.length
        ? `${top.length} établissement${top.length > 1 ? "s" : ""} en mix sûr / réaliste / ambitieux`
        : "Sélection encore insuffisante",
      body: top.length
        ? n === 1
          ? `Voici un mix, pas un classement brut : des pistes sûres, des pistes réalistes, et au moins une ambitieuse.\n\nChaque établissement reste à vérifier (programme exact, langue, frais, deadline). Ce n’est pas une promesse d’admission.`
          : `Mix d’universités à partir de votre fiche et du catalogue. Le score (langue, parcours, budget, bourse, âge, ville, clarté du projet) classe chaque piste en sûre, réaliste ou ambitieuse.\n\nCe n’est pas une promesse d’admission.`
        : "Les données actuelles ne permettent pas une sélection fiable. Précisez le domaine, le niveau visé ou le budget, puis relancez l’analyse.",
      items: selectionItems,
    },
    bourses: {
      verdict: top.some((uni) => uni.scholarships.length)
        ? "Pistes documentées dans le catalogue"
        : "Peu de bourses clairement documentées",
      body: top.some((uni) => uni.scholarships.length)
        ? `Des pistes apparaissent dans le catalogue (CSC, bourse d’université, bourse provinciale). L’obtention n’est jamais automatique : elle dépend du dossier, des quotas et du calendrier.\n\nCi-dessous, la comparaison université par université, sans inventer d’appel qui n’est pas dans la base.`
        : "Peu de bourses clairement documentées pour les pistes actuelles. Un financement personnel reste à prévoir, sauf vérification contraire auprès des universités.",
      items: bourseItems,
    },
    procedure: {
      verdict: n >= 3 ? "Jusqu’au départ" : n === 2 ? "Jusqu’aux réponses" : "Clarifier, puis décider",
      body:
        n >= 3
          ? `Pour ${name}, la procédure va du dossier jusqu’au départ : candidatures, réponses, puis conseils visa, logement et arrivée.\n\nLes deadlines connues du catalogue sont listées plus bas. Les démarches officielles (visa, résidence) restent à votre charge.`
          : n === 2
            ? `Pour ${name}, la procédure va jusqu’aux réponses des universités : caler 3 candidatures, déposer, suivre.\n\nVisa, logement et départ ne sont pas traités dans ce compte rendu.`
            : `Pour un projet d’études en Chine, on clarifie d’abord le projet, puis on rassemble les pièces, puis on candidate.\n\nCe compte rendu pose le cadre. Le dépôt et le suivi jusqu’à l’admission relèvent d’un accompagnement candidature.`,
      items: [
        factItem("Clarifier le projet (domaine, niveau, langue, budget)", "info"),
        factItem("Rassembler et faire traduire les documents nécessaires", "info"),
        factItem(
          n >= 2
            ? `Candidater aux universités retenues (${applyMax} maximum)`
            : "Candidater aux universités retenues",
          "info",
        ),
        factItem("Recevoir les réponses / lettres d’admission", "info"),
        factItem(
          n >= 3
            ? "Puis visa, logement et départ (conseils, sans démarches officielles à votre place)"
            : "Visa, logement et départ : hors de ce compte rendu",
          n >= 3 ? "info" : "warn",
        ),
        ...toApply
          .filter((uni) => uni.deadline)
          .map((uni) =>
            factItem(`${uni.name} — deadline indiquée : ${uni.deadline}`, "warn"),
          ),
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
      verdict: gapItems.length
        ? `${gapItems.length} écart${gapItems.length > 1 ? "s" : ""} à combler avant de candidater`
        : "Dossier déjà assez clair pour viser le mix",
      body: gapItems.length
        ? n >= 3
          ? "Voici le plan de remédiation : langue, moyenne, budget. Traitez ces écarts avant de déposer, ou intégrez-les au calendrier de candidature."
          : n === 2
            ? "Voici les écarts identifiés, université par université. C’est ce qui transforme une liste d’écoles en plan d’action."
            : "Ce n’est pas une liste d’écoles. C’est ce qu’il manque pour y entrer. Traitez ces points avant de multiplier les candidatures."
        : "Aucun écart bloquant n’apparaît sur les données actuelles. Confirmez encore la langue et les pièces avant de déposer.",
      items: [
        ...gapItems.slice(0, 8),
        ...recommended.map((line) => factItem(line, "warn")),
        hsk && student.hskSource !== "default_beginner"
          ? null
          : factItem("Faire évaluer le chinois (HSK) ou confirmer un cursus en anglais", "miss"),
        /préciser/i.test(String(budget))
          ? factItem("Indiquer un budget annuel pour recouper les frais du catalogue", "miss")
          : null,
      ].filter(Boolean),
    },
    echange: {
      verdict: "Compte rendu de départ pour l’appel",
      body: `Ce bilan sert de compte rendu de départ pour l’échange téléphonique avec ${name}.\n\nRelisez-le, notez ce qui vous semble juste ou incomplet, et nous l’ajustons ensemble. Le document pourra être mis à jour.`,
      items: [
        factItem("Confirmer le domaine et le niveau visé", "info"),
        factItem("Trancher la langue d’enseignement", hsk || english ? "info" : "warn"),
        factItem(
          n >= 2
            ? "Valider les universités de dépôt"
            : "Décider si vous restez sur un bilan ou si vous passez à un accompagnement candidature",
          "info",
        ),
      ],
    },
    recherche: {
      verdict: top.length
        ? `${top.length} université${top.length > 1 ? "s" : ""} recoupée${top.length > 1 ? "s" : ""} avec la fiche`
        : "Matching encore insuffisant",
      body: top.length
        ? `Recherche personnalisée à partir de votre fiche et du catalogue, pour ${field}.\n\nChaque ligne compare langue, frais connus, deadline et bourses documentées. Rien n’est inventé : si une information manque dans la base, elle est marquée à confirmer.`
        : "Le matching n’a pas encore identifié d’université suffisamment compatible. Mettez à jour le profil ou relancez l’analyse.",
      items: top.length
        ? top.map((uni) =>
            factItem(
              `${uniLine(uni)}${uni.scholarships.length ? ` · bourses : ${uni.scholarships.join(", ")}` : " · bourses : non documentées"}`,
              uni.scholarships.length ? "ok" : "warn",
            ),
          )
        : [factItem("Aucune piste assez solide pour une recherche personnalisée.", "miss")],
    },
    admission: {
      verdict: toApply.length
        ? "Critères connus — points à vérifier avant dépôt"
        : "Pas encore de critères à recouper",
      body: "Vérification des critères d’admission connus (langue, niveau, pièces, calendrier). Les points « à vérifier » doivent être confirmés auprès de l’université avant de déposer un dossier.",
      items: admissionItems.length
        ? admissionItems
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
          ? `Le dossier n’est pas complet : ${missingCount} document${missingCount > 1 ? "s" : ""} encore à fournir.\n\nLes pièces reçues, celles qui manquent, et celles demandées par les universités du catalogue sont listées ci-dessous.`
          : status.received.length
            ? "Les documents demandés dans l’espace étudiant ont été reçus. Vérifiez encore les pièces spécifiques aux universités (traductions, relevés, lettres)."
            : "Aucun document n’a encore été déposé dans l’espace étudiant. Commencez par les pièces de base, puis les demandes propres à chaque université.",
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
      body: `Dépôt de ${applyMax} candidatures maximum. L’ordre ci-dessous est celui du matching (score et cohérence avec la fiche).`,
      items: toApply.length
        ? toApply.map((uni, index) =>
            factItem(`Candidature ${index + 1} : ${uniLine(uni)}`, "ok"),
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
      body: `Jusqu’à ${applyMax} candidatures universitaires. Voici la sélection issue du matching, à valider avant dépôt.`,
      items: toApply.length
        ? toApply.map((uni, index) =>
            factItem(`Candidature ${index + 1} : ${uniLine(uni)}`, "ok"),
          )
        : [factItem("Matching insuffisant pour figer 5 candidatures. Relancer l’analyse après mise à jour du profil.", "miss")],
    },
    suivi_complet: {
      verdict: "Du dossier jusqu’au départ",
      body: `Suivi personnalisé pendant toute la procédure, pour ${name} : du dossier jusqu’aux réponses, puis après admission.\n\nCe compte rendu sera mis à jour au fil des étapes.`,
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
      body: "Conseils pour le dossier de visa et les démarches avant le départ. Nous orientons et vérifions la cohérence des pièces ; nous ne réalisons pas les démarches officielles à votre place.",
      items: [
        factItem("Rassembler passeport, admission et documents exigés par le consulat", "info"),
        factItem("Vérifier les délais après réception du JW201 / JW202", "warn"),
        factItem("Anticiper rendez-vous, photos, assurances et frais consulaires", "info"),
      ],
    },
    logement: {
      verdict: "Orientation — réservations à votre charge",
      body: "Orientation logement, voyage et arrivée en Chine : pistes, calendrier et points de vigilance. La réservation et les démarches restent à votre charge.",
      items: [
        factItem(
          top[0]?.city
            ? `Logement : campus vs ville à ${top[0].city}${top[0].name ? ` (${top[0].name})` : ""} — dépôt et dates d’arrivée`
            : "Logement : campus vs ville, dépôt, dates d’arrivée",
          "info",
        ),
        factItem("Voyage : billet après visa, arrivée alignée sur l’inscription", "info"),
        factItem("Arrivée : residence permit, inscription universitaire, premières démarches locales", "info"),
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
  if (n >= 3) {
    return "Voici le compte rendu pour viser jusqu’à 5 candidatures, puis le visa et le logement. Mix d’universités, écarts à combler, et feuille de route jusqu’au départ — sans promesse d’admission.";
  }
  if (n === 2) {
    return "Voici le compte rendu pour caler jusqu’à 3 candidatures. Mix d’universités, critères connus, pièces à fournir — et les écarts à traiter avant de déposer.";
  }
  return "Voici où votre profil se situe aujourd’hui : un mix d’universités sûres, réalistes et ambitieuses, plus ce qu’il faut renforcer avant de candidater. Aucune admission n’est promise.";
}

function stripIntroExtras(text) {
  return String(text || "")
    .replace(/\*?Aucune admission[\s\S]*?garantie\.?\*?/gi, "")
    .replace(/Ce document pourra être mis à jour\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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

  return {
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
        body: "Cette partie du compte rendu sera complétée au prochain échange.",
        items: [],
        verdict: "À compléter",
      }),
    ),
  };
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
    return {
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
    };
  }

  return buildOrientationBilanDraft({
    student: result?.student || {},
    analyses: result?.matches || [],
    formuleNumber: n,
    documents,
    adminDocuments,
    gaps: result?.gaps || [],
  });
}

async function polishOrientationBilan(draft, payload) {
  const formule = getFormuleByNumber(draft.formuleNumber);
  const depth =
    draft.formuleNumber >= 3
      ? "complet + feuille de route visa/logement"
      : draft.formuleNumber === 2
        ? "score détaillé par critère + écarts"
        : "synthèse qualitative, sans tableau de scores bruts";
  const polished = await matchingLlm({
    system: `Tu es conseiller d'une agence francophone d'études en Chine. Tu rédiges « Votre orientation », un compte rendu calé sur le profil et sur un mix sûr / réaliste / ambitieux.

Profondeur demandée : ${depth}${formule ? ` (${formule.shortTitle})` : ""}.

Chaque section est une QUESTION. Réponds avec la fiche et le catalogue. Distingue établi / à vérifier / manquant.

Aucun doublon. Une seule liste de candidatures : accompagnement candidature = 3 maximum ; accompagnement complet = jusqu'à 5. Si deux questions se recoupent, la seconde n'ajoute que du nouveau.

Ne mentionne jamais « formule 1 », « formule 2 » ou « formule 3 ». N'inclus pas la mention d'absence de garantie dans l'intro.

Français clair, concret, professionnel. 2 à 5 phrases dans body, avec \\n\\n entre les idées. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK, programmes, universités ou documents absents du brief.

Pour la formule synthèse : décris les universités sans aligner des scores /100. Pour le détail : tu peux citer langue / parcours / budget / bourse.

Pour chaque item, préfixe obligatoire : [ok] fait établi, [warn] à vérifier, [miss] manque ou blocage, [info] consigne.
verdict : une courte conclusion (moins de 12 mots).

Réponds uniquement par un JSON { intro, sections: [{ key, body, items, verdict }] } avec les mêmes keys.`,
    user: `Brief (JSON) :\n${JSON.stringify(payload).slice(0, 18000)}\n\nQuestions à traiter, sans changer les keys ni les titres :\n${JSON.stringify({
      intro: draft.intro,
      sections: draft.sections.map((section) => ({
        key: section.key,
        title: section.title,
        question: section.question,
        verdict: section.verdict,
        body: section.body,
        items: section.items,
      })),
    })}`,
    temperature: 0.15,
    maxTokens: 8000,
    timeoutMs: 55000,
  });

  const parsed = polished.json;
  if (!polished.ok || !parsed?.sections?.length) return { ...draft, ai: false };

  const byKey = new Map(
    (parsed.sections || []).map((section) => [section.key, section]),
  );
  return {
    ...draft,
    intro: stripIntroExtras(parsed.intro || draft.intro) || draft.intro,
    disclaimer: BILAN_DISCLAIMER,
    sections: draft.sections.map((section) => {
      const updated = byKey.get(section.key);
      if (!updated) return section;
      const items = Array.isArray(updated.items)
        ? updated.items.map(normalizeBilanItem).filter((item) => item.text)
        : section.items;
      const nextItems = items.length ? items : section.items;
      return {
        ...section,
        body: String(updated.body || section.body).trim(),
        verdict: String(updated.verdict || section.verdict).trim(),
        items: nextItems,
        verdictTone: verdictToneFromItems(nextItems, section.verdictTone),
      };
    }),
    ai: true,
  };
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
      "Compte rendu calé sur le mix sûr/réaliste/ambitieux et les écarts à combler. Pas de doublon. Une seule liste de candidatures. Pas de mention des numéros de formule.",
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
