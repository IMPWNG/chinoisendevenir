import { FORMULES } from "../formules";

export const FORMULE1_SECTIONS = FORMULES[0].includes.map((title, index) => ({
  key: [
    "analyse",
    "langue",
    "conseils",
    "selection",
    "bourses",
    "procedure",
    "documents",
    "recommandations",
    "echange",
  ][index],
  title,
}));

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

function topMatches(analyses) {
  return (analyses || []).slice(0, 5);
}

export function buildFormule1BilanDraft(student = {}, analyses = []) {
  const top = topMatches(analyses);
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
  const documents = [
    ...new Set([
      "Passeport en cours de validité",
      "Dernier diplôme et relevés de notes",
      "Traduction en anglais ou en chinois si l'université l'exige",
      ...top.flatMap((item) => item.missing_documents || []),
    ]),
  ].slice(0, 8);
  const universities = top.map((item) => ({
    name: item.university_name,
    why:
      item.strengths?.[0] ||
      "Piste à approfondir selon votre projet et votre niveau de langue.",
    language: item.teaching_language || "à confirmer",
  }));

  const sections = {
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
      items: documents,
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
  };

  return {
    intro: `Bilan personnalisé pour ${name} : lecture de votre projet d'études en Chine, première sélection d'universités et prochaines étapes. Aucune admission, bourse ou visa n'est garantie.`,
    universities,
    sections: FORMULE1_SECTIONS.map((section) => ({
      key: section.key,
      title: section.title,
      body: sections[section.key].body,
      items: sections[section.key].items.filter(Boolean),
    })),
  };
}

export function buildFormule1BilanFromResult(result) {
  if (result?.formule1_bilan?.sections?.length) {
    return result.formule1_bilan;
  }
  return buildFormule1BilanDraft(result?.student || {}, result?.matches || []);
}

async function polishFormule1Bilan(draft, payload) {
  const apiKey = process.env.MAMMOUTH_API_KEY;
  if (!apiKey) return { ...draft, ai: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 35000);
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
        max_tokens: 2800,
        messages: [
          {
            role: "system",
            content:
              "Tu es conseiller d'une agence francophone d'études en Chine. Tu rédiges le bilan personnalisé (formule 1) visible par l'étudiant. Français clair, concret, rassurant. Ne jamais garantir admission, bourse ou visa. Ne pas inventer de frais, deadlines, HSK, programmes ou universités absents du brief. Réponds uniquement par un JSON { intro, sections: [{ key, body, items }] } avec les mêmes keys que le brouillon.",
          },
          {
            role: "user",
            content: `Brief matching (JSON):\n${JSON.stringify(payload).slice(0, 12000)}\n\nBrouillon à réécrire, sans changer les titres ni les keys:\n${JSON.stringify(draft)}`,
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
      intro: String(parsed.intro || draft.intro).trim(),
      universities: draft.universities,
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

export async function generateFormule1Bilan({ student, analyses }) {
  const draft = buildFormule1BilanDraft(student, analyses);
  return polishFormule1Bilan(draft, {
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
    matches: topMatches(analyses).map((item) => ({
      name: item.university_name,
      language: item.teaching_language,
      strengths: item.strengths,
      warnings: item.warnings,
      scholarships: item.scholarships_possible,
      documents: item.missing_documents,
      actions: item.recommended_actions,
    })),
  });
}
