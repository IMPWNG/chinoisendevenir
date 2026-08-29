import { getFormuleByNumber, getFormuleAccess, FORMULES } from "../formules";

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
    "Que dit l’analyse de votre parcours, de votre profil et de votre projet ?",
  langue:
    "Quel est votre niveau de langue, et que cela change-t-il pour les universités ?",
  conseils: "Quel domaine et quel niveau d’études sont les plus cohérents pour vous ?",
  selection: "Quelles universités et formations ressortent en première sélection ?",
  bourses: "Quelles bourses sont documentées pour votre profil ?",
  procedure: "Quelles sont les étapes de la procédure, dans votre cas ?",
  documents: "Quels documents devez-vous préparer, concrètement ?",
  recommandations: "Comment renforcer votre dossier avant de candidater ?",
  echange:
    "Que retenir pour l’échange téléphonique, et quelles sont les prochaines étapes ?",
  recherche:
    "Quelles universités, formations et bourses correspondent le mieux à votre fiche ?",
  admission: "Remplissez-vous les critères d’admission connus ?",
  dossier: "Où en est votre dossier : pièces reçues, manquantes, à aligner ?",
  formulaires: "Que faut-il caler avant de remplir les formulaires de candidature ?",
  depot: "Quelles candidatures déposer en priorité (3 maximum) ?",
  suivi_reponses: "Comment suivre les réponses, et quelles deadlines surveiller ?",
  echanges: "Où en est l’avancement, et que traiter au prochain échange ?",
  cinq_candidatures: "Quelles sont les candidatures à retenir (jusqu’à 5) ?",
  suivi_complet: "Comment se déroule le suivi sur toute la procédure ?",
  apres_admission: "Que faire après une admission, et quels documents relire ?",
  visa: "Que préparer pour le dossier de visa et les démarches avant le départ ?",
  logement: "Comment s’orienter pour le logement, le voyage et l’arrivée en Chine ?",
  demarches_depart: "Quelles démarches restent à faire avant le départ ?",
};

const GROUP_LABELS = {
  formule1: "Formule 1 — bilan",
  formule2: "Formule 2 — candidature",
  formule3: "Formule 3 — jusqu’au départ",
};

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
  if (n >= 3) {
    return [
      ...f1,
      ...packDefs(FORMULES[1], F2_KEYS, "formule2"),
      ...packDefs(FORMULES[2], F3_KEYS, "formule3"),
    ];
  }
  if (n === 2) {
    return [...f1, ...packDefs(FORMULES[1], F2_KEYS, "formule2")];
  }
  return f1;
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced ? fenced[1] : trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
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
    domainNote: item.breakdown?.domain?.note || null,
    languageNote: item.breakdown?.language?.note || null,
    languageStatus: item.breakdown?.language?.status || null,
    admissionNote: item.breakdown?.admission?.note || null,
    admissionStatus: item.breakdown?.admission?.status || null,
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

function buildSectionMap(ctx) {
  const { student, analyses, formuleNumber, documents, adminDocuments } = ctx;
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

  const analyseItems = [
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
      hsk ? `Chinois : ${hsk}` : "Chinois : HSK non renseigné — à confirmer",
      hsk ? "ok" : "miss",
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
          `${uni.name}${uni.city ? ` (${uni.city})` : ""} — ${uni.score}/100, ${uni.category}. ${uni.domainNote || uni.strengths[0] || ""}`.trim(),
          uni.score >= 70 ? "ok" : uni.score >= 50 ? "warn" : "miss",
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
      verdict: `${field} · ${diploma} · rentrée ${intake}`,
      body: `À partir de la fiche de ${name} (${country}), le projet s’oriente vers ${field}.\n\nDernier diplôme retenu : ${diploma}. Niveau visé : ${degree}. Rentrée : ${intake}.\n\nCe n’est pas une admission : c’est une lecture réaliste de votre situation, recoupée avec le catalogue d’universités.`,
      items: analyseItems,
    },
    langue: {
      verdict: hsk || english ? `${hsk || "HSK à confirmer"} · ${english || "anglais à confirmer"}` : "Niveaux de langue à confirmer",
      body: hsk || english
        ? `État actuel : ${hsk || "HSK non renseigné"} ; ${english ? `anglais ${english}` : "anglais non renseigné"}.\n\nLa langue d’enseignement décide des universités possibles. Ci-dessous, chaque piste du catalogue est comparée à votre niveau. Si le HSK manque, un cursus en anglais ou une année de langue peut rester ouvert — à vérifier établissement par établissement.`
        : `Le chinois (HSK) et l’anglais ne sont pas encore assez renseignés sur la fiche.\n\nSans ces niveaux, on ne peut pas trancher entre un cursus en chinois, un cursus en anglais, ou une année de langue. L’échange téléphonique servira à le caler.`,
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
        ? `${top.length} piste${top.length > 1 ? "s" : ""} issue${top.length > 1 ? "s" : ""} du catalogue`
        : "Sélection encore insuffisante",
      body: top.length
        ? `Première sélection à partir de votre fiche et du catalogue. Chaque piste reste à vérifier (programme exact, langue, frais, deadline).\n\nLe score compare le domaine, le niveau, la langue, le budget et le calendrier — ce n’est pas une promesse d’admission.`
        : "Les données actuelles ne permettent pas une sélection fiable. Précisez le domaine, le niveau visé ou le budget, puis relancez l’analyse.",
      items: selectionItems,
    },
    bourses: {
      verdict: top.some((uni) => uni.scholarships.length)
        ? "Pistes documentées — aucune bourse n’est garantie"
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
            ? `Pour ${name}, la procédure va jusqu’aux réponses des universités : caler 3 candidatures, déposer, suivre.\n\nVisa, logement et départ ne sont pas inclus dans cette formule.`
            : `Pour un projet d’études en Chine, on clarifie d’abord le projet, puis on rassemble les pièces, puis on candidate.\n\nLa formule 1 pose le cadre. Le dépôt et le suivi jusqu’à l’admission relèvent des formules 2 et 3.`,
      items: [
        factItem("Clarifier le projet (domaine, niveau, langue, budget)", "info"),
        factItem("Rassembler et faire traduire les documents nécessaires", "info"),
        factItem(
          n >= 2
            ? `Candidater aux universités retenues (${applyMax} maximum)`
            : "Candidater aux universités retenues (formule 2 ou 3)",
          "info",
        ),
        factItem("Recevoir les réponses / lettres d’admission", "info"),
        factItem(
          n >= 3
            ? "Puis visa, logement et départ (conseils, sans démarches officielles à votre place)"
            : "Visa, logement et départ : hors formule actuelle",
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
      verdict: "Points à traiter avant de déposer",
      body: "Pour renforcer le dossier : préciser le projet, documenter la langue, et éviter les pièces manquantes. Les points ci-dessous viennent du matching et des zones d’ombre de la fiche.",
      items: [
        ...recommended.map((line) => factItem(line, "warn")),
        factItem("Rédiger une version claire du projet d’études (domaine + objectif)", "info"),
        hsk
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
      verdict: `Jusqu’à ${applyMax} candidatures — aucune admission garantie`,
      body: `Dépôt de ${applyMax} candidatures maximum. L’ordre ci-dessous est celui du matching (score et cohérence avec la fiche).\n\nAucune admission n’est garantie.`,
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

function introFor(formuleNumber, name) {
  if (formuleNumber >= 3) {
    return `Compte rendu pour ${name} : chaque service des formules 1, 2 et 3 est traité comme une question, à partir de votre fiche et du catalogue d’universités. Aucune admission, bourse ou visa n’est garantie. Ce document pourra être mis à jour.`;
  }
  if (formuleNumber === 2) {
    return `Compte rendu pour ${name} : le bilan de la formule 1 et l’accompagnement candidature sont répondus point par point (universités, critères, documents, dépôts). Aucune admission n’est garantie. Ce document pourra être mis à jour.`;
  }
  return `Bilan pour ${name} : chaque point de la formule 1 est une réponse précise, recoupée avec votre fiche et le catalogue. Aucune admission, bourse ou visa n’est garantie. Ce document pourra être mis à jour.`;
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
} = {}) {
  const n = Number(formuleNumber) || 1;
  const defs = getBilanSectionDefs(n);
  const map = buildSectionMap({
    student,
    analyses,
    formuleNumber: n,
    documents,
    adminDocuments,
  });
  const name = student.prenom || student.name || "vous";
  const status = summarizeDocuments(documents, adminDocuments);

  return {
    formuleNumber: n,
    intro: introFor(n, name),
    documents_status: status,
    universities: topMatches(analyses, applicationLimit(n)).map((item) => ({
      name: item.university_name,
      city: item.city || null,
      language: item.teaching_language || "à confirmer",
    })),
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
  const keys = new Set(stored.sections.map((section) => section.key));
  if (keys.has("f1_included") || keys.has("f12_included")) return false;
  return getBilanSectionDefs(formuleNumber).every((def) => keys.has(def.key));
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
      documents_status: status,
      sections: (live.sections || []).map((section) => {
        const def = byKey.get(section.key);
        return {
          ...section,
          question: section.question || def?.question || section.title,
          group: section.group || def?.group,
          groupLabel: section.groupLabel || def?.groupLabel,
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
  });
}

async function polishOrientationBilan(draft, payload) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return { ...draft, ai: false };

  const formule = getFormuleByNumber(draft.formuleNumber);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MAMMOUTH_MODEL || "minimax-m3",
        temperature: 0.15,
        max_tokens: 8000,
        messages: [
          {
            role: "system",
            content: `Tu es conseiller d'une agence francophone d'études en Chine. Tu rédiges le compte rendu étudiant pour la formule ${draft.formuleNumber}${formule ? ` (${formule.shortTitle})` : ""}.

Règle principale : chaque section est une QUESTION. Tu y réponds de façon précise, en comparant les universités du brief et la fiche client. Tu ne résumes pas « tous les services de la formule 1 / 2 ». Tu ne recopies pas un profil générique.

Français clair, concret, professionnel. 2 à 5 phrases dans body, avec \\n\\n entre les idées. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK, programmes, universités ou documents absents du brief. Distingue clairement : établi / à vérifier / manquant.

Pour chaque item, préfixe obligatoire : [ok] fait établi, [warn] à vérifier, [miss] manque ou blocage, [info] consigne.
verdict : une courte conclusion (moins de 12 mots).

Réponds uniquement par un JSON { intro, sections: [{ key, body, items, verdict }] } avec les mêmes keys.`,
          },
          {
            role: "user",
            content: `Brief (JSON) :\n${JSON.stringify(payload).slice(0, 18000)}\n\nQuestions à traiter, sans changer les keys ni les titres :\n${JSON.stringify({
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
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { ...draft, ai: false };
    const data = await response.json();
    const parsed = extractJsonObject(data?.choices?.[0]?.message?.content);
    if (!parsed?.sections?.length) return { ...draft, ai: false };

    const byKey = new Map(
      (parsed.sections || []).map((section) => [section.key, section]),
    );
    return {
      ...draft,
      intro: String(parsed.intro || draft.intro).trim(),
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
  } catch {
    return { ...draft, ai: false };
  } finally {
    clearTimeout(timer);
  }
}

export async function generateOrientationBilan({
  student,
  analyses,
  formuleNumber,
  documents = [],
  adminDocuments = [],
}) {
  const n = Number(formuleNumber) || 1;
  const draft = buildOrientationBilanDraft({
    student,
    analyses,
    formuleNumber: n,
    documents,
    adminDocuments,
  });
  const top = topMatches(analyses, getFormuleAccess(n).matchLimit || 8);
  return polishOrientationBilan(draft, {
    formuleNumber: n,
    formuleTitle: getFormuleByNumber(n)?.title,
    instruction:
      "Réponds à chaque question avec la fiche client + les universités. Compare. Vérifie. Pas de résumé de formule.",
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
      scholarshipGoal: student.scholarshipGoal,
    },
    documents: summarizeDocuments(documents, adminDocuments),
    matches: top.map((item) => ({
      name: item.university_name,
      city: item.city || null,
      score: item.score,
      category: item.category,
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
      languageNote: item.breakdown?.language?.note,
      domainNote: item.breakdown?.domain?.note,
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
