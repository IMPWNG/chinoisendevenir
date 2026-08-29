import { getFormuleByNumber, getFormuleAccess } from "../formules";

const SECTION_KEYS = {
  1: [
    "analyse",
    "langue",
    "conseils",
    "selection",
    "bourses",
    "procedure",
    "documents",
    "recommandations",
    "echange",
  ],
  2: [
    "f1_included",
    "recherche",
    "admission",
    "dossier",
    "formulaires",
    "depot",
    "suivi_reponses",
    "echanges",
  ],
  3: [
    "f12_included",
    "cinq_candidatures",
    "suivi_complet",
    "apres_admission",
    "visa",
    "logement",
    "demarches_depart",
  ],
};

export function getBilanSectionDefs(formuleNumber) {
  const formule = getFormuleByNumber(formuleNumber);
  const keys = SECTION_KEYS[formuleNumber] || [];
  return (formule?.includes || []).map((title, index) => ({
    key: keys[index] || `section_${index}`,
    title,
  }));
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

function documentItems(status, extraRequested = []) {
  const items = [];
  status.required.forEach((doc) => {
    items.push(
      doc.status === "received"
        ? `${doc.label} : reçu${doc.fileName ? ` (${doc.fileName})` : ""}`
        : `${doc.label} : à fournir`,
    );
  });
  extraRequested.forEach((doc) => {
    items.push(`Demandé par les universités : ${doc}`);
  });
  if (status.fromAdmin.length) {
    status.fromAdmin.forEach((doc) => {
      items.push(`Document transmis par Chinois en Devenir : ${doc.name}`);
    });
  } else {
    items.push("Aucun document n'a encore été envoyé par l'équipe.");
  }
  return items;
}

function universityLine(item) {
  const bits = [
    item.university_name,
    item.teaching_language ? `langue : ${item.teaching_language}` : null,
    item.deadline ? `deadline : ${item.deadline}` : null,
    item.cost_estimate?.tuition_cny
      ? `frais : ${Number(item.cost_estimate.tuition_cny).toLocaleString("fr-FR")} RMB / an`
      : null,
  ].filter(Boolean);
  return bits.join(" — ");
}

function buildSectionMap(ctx) {
  const { student, analyses, formuleNumber, documents, adminDocuments } = ctx;
  const n = Number(formuleNumber) || 1;
  const limit = getFormuleAccess(n).matchLimit || applicationLimit(n);
  const applyMax = applicationLimit(n);
  const top = topMatches(analyses, limit);
  const toApply = top.slice(0, applyMax);
  const name = student.prenom || student.name || "vous";
  const field = student.field || "votre domaine";
  const country = student.country || "votre pays";
  const diploma = diplomaLabel(student.dernierDiplome || student.diploma);
  const degree = degreeLabel(student.targetDegree);
  const budget = student.budget?.label || student.budget || "à préciser";
  const intake = student.intake?.label || student.intake || "à préciser";
  const hsk =
    student.hsk === 0 || student.hsk ? `HSK ${student.hsk}` : "HSK non renseigné";
  const english = student.english || "anglais non renseigné";
  const scholarships = [
    ...new Set(top.flatMap((item) => item.scholarships_possible || [])),
  ];
  const extraDocs = [
    ...new Set(top.flatMap((item) => item.missing_documents || [])),
  ].slice(0, 8);
  const status = summarizeDocuments(documents, adminDocuments);
  const missingCount = status.missing.length;
  const universities = top.map((item) => ({
    name: item.university_name,
    why:
      item.strengths?.[0] ||
      "Piste à approfondir selon votre projet et votre niveau de langue.",
    language: item.teaching_language || "à confirmer",
  }));

  return {
    analyse: {
      body: `À partir du profil de ${name} (${country}), le projet s'oriente vers ${field}, avec un dernier diplôme de niveau ${diploma}. La rentrée visée est ${intake}. Ce premier bilan pose le cadre : il ne s'agit pas d'une admission, mais d'une lecture réaliste de votre situation pour décider comment avancer.`,
      items: [
        `Pays de résidence : ${country}`,
        `Domaine indiqué : ${field}`,
        `Dernier diplôme : ${diploma}`,
        `Budget annuel estimé : ${budget}`,
      ],
    },
    langue: {
      body: `La langue d'enseignement conditionne fortement les universités possibles. État actuel : ${hsk} ; ${english}. Si ces éléments ne sont pas encore testés, l'échange téléphonique permettra d'estimer le niveau et de choisir entre un cursus en anglais, un cursus en chinois, ou une année de langue avant le diplôme.`,
      items: [hsk, `Anglais : ${english}`],
    },
    conseils: {
      body: `Pour ce profil, le niveau d'études visé est ${degree}. Nous recommandons de figer le domaine et le niveau avant de multiplier les candidatures. Si le projet n'est pas encore tranché, mieux vaut d'abord confirmer ${field} et la langue d'enseignement, plutôt que de viser trop d'établissements.`,
      items: [
        `Niveau visé (estimation) : ${degree}`,
        "Valider le domaine avant de déposer un dossier",
      ],
    },
    selection: {
      body: universities.length
        ? "Voici une première sélection d'universités et de formations, à partir de votre profil et du catalogue. Ce n'est pas une liste définitive : chaque piste doit être vérifiée (programme, langue, frais, deadline)."
        : "Les données actuelles ne permettent pas encore une sélection fiable. Précisez le domaine, le niveau visé ou le budget pour relancer l'analyse.",
      items: universities.map(
        (item) => `${item.name} — ${item.language}. ${item.why}`,
      ),
    },
    bourses: {
      body: scholarships.length
        ? `Des pistes de bourses apparaissent pour certaines universités : ${scholarships.join(", ")}. L'obtention n'est jamais automatique et dépend du dossier, des quotas et du calendrier.`
        : "Peu de bourses clairement documentées pour les pistes actuelles. Un financement personnel reste à prévoir, sauf vérification contraire auprès des universités.",
      items: scholarships.length
        ? scholarships.map((item) => `Piste : ${item}`)
        : ["Prévoir un plan sans bourse, puis vérifier les appels ouverts"],
    },
    procedure: {
      body: "Pour un projet d'études en Chine, la procédure suit en général ces étapes. La formule 1 clarifie le projet et prépare le terrain ; le dépôt des candidatures et le suivi jusqu'à l'admission relèvent des formules 2 et 3.",
      items: [
        "Clarifier le projet (domaine, niveau, langue, budget)",
        "Rassembler et faire traduire les documents nécessaires",
        "Candidater aux universités retenues",
        "Recevoir les réponses / lettres d'admission",
        "Puis, si vous poursuivez : visa, logement et départ",
      ],
    },
    documents: {
      body: "Liste de départ, à adapter selon l'université et le pays d'origine. Les traductions certifiées, légalisations et frais universitaires restent à votre charge.",
      items: [
        "Passeport en cours de validité",
        "Dernier diplôme et relevés de notes",
        "Traduction en anglais ou en chinois si l'université l'exige",
        ...extraDocs,
      ].slice(0, 8),
    },
    recommandations: {
      body: "Pour renforcer le dossier avant toute candidature : préciser le projet, documenter la langue, et éviter les pièces manquantes. Les points ci-dessous viennent du matching et des zones d'ombre du profil.",
      items: [
        ...[...new Set(top.flatMap((item) => item.recommended_actions || []))]
          .slice(0, 4),
        "Préparer une version claire de votre projet d'études (domaine + objectif)",
        student.hsk == null
          ? "Faire évaluer le chinois (HSK) ou confirmer un cursus en anglais"
          : null,
      ].filter(Boolean),
    },
    echange: {
      body: "Ce bilan sert de compte rendu de départ pour l'échange téléphonique : nous y reprenons votre parcours, les pistes universitaires et les prochaines questions. Relisez-le, notez ce qui vous semble juste ou incomplet, et nous l'ajustons ensemble.",
      items: [
        "Confirmer le domaine et le niveau visé",
        "Trancher la langue d'enseignement",
        "Décider si vous restez sur un bilan ou si vous passez à un accompagnement candidature",
      ],
    },
    f1_included: {
      body: `La formule 2 inclut le bilan de la formule 1. Pour ${name}, le projet reste centré sur ${field} (${diploma}, ${degree}), avec une rentrée ${intake}.`,
      items: [
        `Profil : ${country} — ${field}`,
        `Langue : ${hsk} ; anglais : ${english}`,
        `Budget : ${budget}`,
      ],
    },
    recherche: {
      body: universities.length
        ? `Recherche personnalisée à partir de votre profil et du catalogue. Voici les pistes les plus cohérentes pour ${field}. Chaque université reste à confirmer (programme, langue, frais, deadline, bourse).`
        : "Le matching n'a pas encore identifié d'université suffisamment compatible. Mettez à jour le profil ou relancez l'analyse.",
      items: top.map((item) => {
        const bourse = item.scholarships_possible?.length
          ? ` Bourses possibles : ${item.scholarships_possible.join(", ")}.`
          : "";
        return `${universityLine(item)}.${bourse}`;
      }),
    },
    admission: {
      body: "Vérification des critères d'admission connus. Les points « à vérifier » doivent être confirmés auprès de l'université avant de déposer un dossier.",
      items: toApply.flatMap((item) => {
        const lines = [universityLine(item)];
        (item.to_verify || []).slice(0, 3).forEach((line) => {
          lines.push(`${item.university_name} — à vérifier : ${line}`);
        });
        (item.warnings || []).slice(0, 2).forEach((line) => {
          lines.push(`${item.university_name} — vigilance : ${line}`);
        });
        return lines;
      }),
    },
    dossier: {
      body:
        missingCount > 0
          ? `Le dossier n'est pas complet : ${missingCount} document${missingCount > 1 ? "s" : ""} encore à fournir. Les pièces reçues et celles demandées par les universités sont listées ci-dessous.`
          : "Les documents demandés dans l'espace étudiant ont été reçus. Vérifiez encore les pièces spécifiques aux universités (traductions, relevés, lettres).",
      items: documentItems(status, extraDocs),
    },
    formulaires: {
      body: "Nous vous aidons à remplir les formulaires de candidature une fois les universités et les pièces calées. Préparez les informations personnelles, le parcours et les pièces scannées avant de commencer.",
      items: [
        "Caler 2 à 3 universités parmi la liste recommandée",
        "Avoir passeport et diplôme lisibles (et traduits si exigé)",
        ...[...new Set(top.flatMap((item) => item.recommended_actions || []))]
          .slice(0, 3),
      ],
    },
    depot: {
      body: `Dépôt de ${applyMax} candidatures maximum. La liste ci-dessous est l'ordre de priorité issu du matching. Aucune admission n'est garantie.`,
      items: toApply.length
        ? toApply.map(
            (item, index) =>
              `Candidature ${index + 1} : ${universityLine(item)}`,
          )
        : ["Aucune université assez compatible pour déposer un dossier pour le moment."],
    },
    suivi_reponses: {
      body: "Le suivi va jusqu'aux réponses des universités. Notez les deadlines et les pièces encore manquantes pour ne pas rater une session.",
      items: toApply.map((item) =>
        item.deadline
          ? `${item.university_name} — deadline indiquée : ${item.deadline}`
          : `${item.university_name} — deadline à confirmer`,
      ),
    },
    echanges: {
      body: "Des échanges réguliers permettent d'ajuster le dossier. Ce compte rendu évoluera après chaque étape (pièces reçues, candidature déposée, réponse d'université).",
      items: [
        missingCount
          ? `Priorité : envoyer les documents manquants (${status.missing.map((doc) => doc.label).join(", ")})`
          : "Documents de base reçus — on peut caler les formulaires",
        "Confirmer les 3 universités de dépôt",
        "Préparer les questions pour le prochain échange",
      ],
    },
    f12_included: {
      body: `La formule 3 reprend les services des formules 1 et 2 : bilan, matching, dossier et jusqu'à ${applyMax} candidatures. Pour ${name}, le fil directeur reste ${field}, rentrée ${intake}.`,
      items: [
        `Profil : ${country} — ${field} — ${diploma}`,
        missingCount
          ? `Documents : ${missingCount} pièce(s) encore à fournir`
          : "Documents de base reçus",
        `${toApply.length} université(s) prioritaire(s) pour candidater`,
      ],
    },
    cinq_candidatures: {
      body: `Jusqu'à ${applyMax} candidatures universitaires. Voici la sélection issue du matching, à valider avant dépôt.`,
      items: toApply.length
        ? toApply.map(
            (item, index) =>
              `Candidature ${index + 1} : ${universityLine(item)}`,
          )
        : ["Matching insuffisant pour figer 5 candidatures. Relancer l'analyse après mise à jour du profil."],
    },
    suivi_complet: {
      body: "Suivi personnalisé pendant toute la procédure : du dossier jusqu'aux réponses, puis après admission. Ce compte rendu sera mis à jour au fil des étapes.",
      items: [
        "Avancement dossier et pièces",
        "Dépôt et suivi des candidatures",
        "Lecture des réponses / documents d'admission",
        "Préparation visa, logement et départ (conseils, sans démarches officielles à votre place)",
      ],
    },
    apres_admission: {
      body: "Après admission, nous vous aidons à lire les documents de l'université (offre, JW201/JW202, délais, frais). Les fichiers transmis par l'équipe apparaissent ici dès qu'ils sont déposés.",
      items: status.fromAdmin.length
        ? status.fromAdmin.map((doc) => `Reçu de l'équipe : ${doc.name}`)
        : [
            "Aucun document d'admission n'a encore été déposé par l'équipe.",
            "Dès réception d'une offre, envoyez-la-nous pour relecture.",
          ],
    },
    visa: {
      body: "Conseils pour le dossier de visa et les démarches avant le départ. Nous orientons et vérifions la cohérence des pièces ; nous ne réalisons pas les démarches officielles à votre place.",
      items: [
        "Rassembler passeport, admission et documents exigés par le consulat",
        "Vérifier les délais après réception du JW201 / JW202",
        "Anticiper rendez-vous, photos, assurances et frais consulaires",
      ],
    },
    logement: {
      body: "Orientation logement, voyage et arrivée en Chine : pistes, calendrier et points de vigilance. La réservation et les démarches restent à votre charge.",
      items: [
        "Logement : campus vs ville, dépôt, dates d'arrivée",
        "Voyage : billet après visa, arrivée alignée sur l'inscription",
        "Arrivée : residence permit, inscription universitaire, premières démarches locales",
      ],
    },
    demarches_depart: {
      body: "Liste des démarches à faire avant le départ. Elle sera précisée selon l'université et le pays de départ.",
      items: [
        missingCount
          ? `Finaliser les documents manquants : ${status.missing.map((doc) => doc.label).join(", ")}`
          : "Documents de base en ordre",
        "Visa et documents d'admission relus",
        "Logement et billet calés",
        "Copies numériques de tous les originaux importants",
      ],
    },
  };
}

function introFor(formuleNumber, name) {
  if (formuleNumber >= 3) {
    return `Compte rendu d'accompagnement complet pour ${name} : candidatures, dossier, puis conseils visa, logement et départ. Aucune admission, bourse ou visa n'est garantie. Ce document pourra être mis à jour.`;
  }
  if (formuleNumber === 2) {
    return `Compte rendu d'accompagnement à la candidature pour ${name} : universités, critères, documents reçus et à fournir, puis dépôt jusqu'aux réponses. Aucune admission n'est garantie. Ce document pourra être mis à jour.`;
  }
  return `Bilan personnalisé pour ${name} : lecture de votre projet d'études en Chine, première sélection d'universités et prochaines étapes. Aucune admission, bourse ou visa n'est garantie. Ce document pourra être mis à jour.`;
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
    universities: (analyses || []).slice(0, applicationLimit(n)).map((item) => ({
      name: item.university_name,
      language: item.teaching_language || "à confirmer",
    })),
    sections: defs.map((section) => {
      const content = map[section.key] || {
        body: "Cette partie du compte rendu sera complétée au prochain échange.",
        items: [],
      };
      return {
        key: section.key,
        title: section.title,
        body: content.body,
        items: (content.items || []).filter(Boolean),
      };
    }),
  };
}

function refreshDocumentSections(bilan, status, formuleNumber) {
  if (Number(formuleNumber) < 2) return bilan;
  return {
    ...bilan,
    sections: (bilan.sections || []).map((section) => {
      if (section.key === "dossier") {
        return { ...section, items: documentItems(status, []) };
      }
      if (section.key === "apres_admission") {
        return {
          ...section,
          items: status.fromAdmin.length
            ? status.fromAdmin.map((doc) => `Reçu de l'équipe : ${doc.name}`)
            : section.items,
        };
      }
      return section;
    }),
  };
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
  if (stored?.sections?.length) {
    const status = summarizeDocuments(documents || [], adminDocuments || []);
    const live =
      documents || adminDocuments
        ? refreshDocumentSections(stored, status, n)
        : stored;
    return { ...live, formuleNumber: n, documents_status: status };
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
  const timer = setTimeout(() => controller.abort(), 40000);
  try {
    const response = await fetch("https://api.mammouth.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.MAMMOUTH_MODEL || "minimax-m3",
        temperature: 0.2,
        max_tokens: 3200,
        messages: [
          {
            role: "system",
            content: `Tu es conseiller d'une agence francophone d'études en Chine. Tu rédiges le compte rendu étudiant pour la formule ${draft.formuleNumber}${formule ? ` (${formule.shortTitle})` : ""}. Français clair, concret. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK, programmes, universités ou documents absents du brief. Distingue clairement documents reçus et documents à fournir. Réponds uniquement par un JSON { intro, sections: [{ key, body, items }] } avec les mêmes keys. Ce compte rendu pourra être mis à jour plus tard.`,
          },
          {
            role: "user",
            content: `Brief matching et documents (JSON):\n${JSON.stringify(payload).slice(0, 14000)}\n\nBrouillon à réécrire, sans changer les titres ni les keys:\n${JSON.stringify({ intro: draft.intro, sections: draft.sections })}`,
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
          ? updated.items.map((item) => String(item).trim()).filter(Boolean)
          : section.items;
        return {
          ...section,
          body: String(updated.body || section.body).trim(),
          items: items.length ? items : section.items,
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
  return polishOrientationBilan(draft, {
    formuleNumber: n,
    formuleTitle: getFormuleByNumber(n)?.title,
    student: {
      name: student.name,
      prenom: student.prenom,
      field: student.field,
      diploma: student.dernierDiplome,
      degree: student.targetDegree,
      country: student.country,
      budget: student.budget?.label,
      intake: student.intake?.label,
      hsk: student.hsk,
      english: student.english,
    },
    documents: summarizeDocuments(documents, adminDocuments),
    matches: topMatches(analyses, getFormuleAccess(n).matchLimit || 8).map(
      (item) => ({
        name: item.university_name,
        language: item.teaching_language,
        deadline: item.deadline,
        strengths: item.strengths,
        warnings: item.warnings,
        scholarships: item.scholarships_possible,
        documents: item.missing_documents,
        actions: item.recommended_actions,
        to_verify: item.to_verify,
      }),
    ),
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
