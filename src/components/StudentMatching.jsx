"use client";

const DIPLOMA_SHORT = {
  bac: "Bac",
  licence: "Licence",
  master: "Master",
  doctorat: "Doctorat",
  autre: "Autre diplôme",
};

const STUDENT_TITLES = {
  analyse: "Votre projet",
  langue: "Langue",
  conseils: "Domaine et niveau",
  bourses: "Bourses",
  recommandations: "Pour le dossier",
  admission: "Critères d’admission",
  dossier: "Votre dossier",
  visa: "Visa",
  logement: "Logement",
};

function keysForFormule(formuleNumber) {
  const n = Number(formuleNumber) || 1;
  if (n >= 3) return ["analyse", "langue", "visa", "logement"];
  if (n === 2) return ["analyse", "langue", "admission", "dossier"];
  return ["analyse", "langue", "bourses", "recommandations"];
}

function normalizeItem(item) {
  if (item && typeof item === "object" && item.text) {
    return {
      text: scrubClient(item.text),
      tone: item.tone || "info",
    };
  }
  return { text: scrubClient(item), tone: "info" };
}

function scrubClient(text) {
  return String(text || "")
    .replace(/\*?Aucune admission[\s\S]*?garantie\.?\*?/gi, "")
    .replace(/\bmatching\b/gi, "sélection")
    .replace(/Mix d[’']universités[^.]{0,140}\.?/gi, "")
    .replace(/écarts à combler[^.]{0,80}\.?/gi, "")
    .replace(/feuille de route[^.]{0,80}\.?/gi, "")
    .replace(/sans promesse d[’']admission[^.]{0,40}\.?/gi, "")
    .replace(/\*{1,2}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function firstParagraph(body) {
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

function formatDiploma(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return DIPLOMA_SHORT[raw.toLowerCase()] || raw;
}

function ficheLine(summary) {
  return [
    summary.field,
    formatDiploma(summary.diploma),
    summary.country,
    summary.hsk,
    summary.english,
    summary.intake,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" · ");
}

function depthLabel(formuleNumber) {
  if (Number(formuleNumber) >= 3) return "Jusqu’au départ";
  if (Number(formuleNumber) === 2) return "Candidature";
  return "Bilan";
}

function introFor(formuleNumber) {
  if (Number(formuleNumber) >= 3) {
    return "Voici le compte rendu pour viser jusqu’à 5 candidatures, puis le visa et le logement.";
  }
  if (Number(formuleNumber) === 2) {
    return "Voici le compte rendu pour préparer jusqu’à 3 candidatures.";
  }
  return "Voici le compte rendu de votre projet, et les universités à viser en priorité.";
}

function uniqueGaps(gaps) {
  const seen = new Set();
  const out = [];
  for (const gap of gaps || []) {
    const conseil = scrubClient(gap?.conseil);
    if (!conseil) continue;
    const key = gap.type || conseil;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...gap, conseil });
  }
  return out.slice(0, 3);
}

function UniColumn({ title, items, tone }) {
  if (!items?.length) return null;
  return (
    <section className={`student-uni-col is-${tone}`}>
      <p className="student-uni-stamp">{title}</p>
      <ul className="student-uni-list">
        {items.map((uni) => {
          const language = String(uni.language || "").trim();
          const showLanguage =
            language && !/^à confirmer$/i.test(language);
          return (
            <li key={`${tone}-${uni.name}`} className="student-uni-card">
              <p className="student-uni-name">{uni.name}</p>
              {uni.city ? <p className="student-uni-city">{uni.city}</p> : null}
              {showLanguage ? (
                <p className="student-uni-note">{language}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OrientationBilan({ matching, formuleNumber }) {
  const bilan =
    matching?.orientation_bilan || matching?.formule1_bilan || null;
  const summary = matching?.profile_summary || {};
  const mix = matching?.mix || {};
  const gaps = uniqueGaps(matching?.gaps || bilan?.gaps);
  const hasUnis = Boolean(
    mix.safety?.length || mix.match?.length || mix.reach?.length,
  );
  const meta = ficheLine(summary);
  const intro = introFor(formuleNumber);
  const allowed = new Set(keysForFormule(formuleNumber));
  if (gaps.length) allowed.delete("recommandations");

  if (!bilan?.sections?.length) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <header className="student-bilan-head">
          <span className="student-bilan-chop" aria-hidden="true">
            函
          </span>
          <div className="student-bilan-head-copy">
            <p className="student-bilan-kicker">{depthLabel(formuleNumber)}</p>
            <h2 className="student-bilan-title">Votre orientation</h2>
            <p className="student-bilan-lede">
              Votre compte rendu n’est pas encore prêt. Il apparaîtra ici dès
              qu’il aura été établi.
            </p>
          </div>
        </header>
      </div>
    );
  }

  const sections = (bilan.sections || []).filter((section) =>
    allowed.has(section.key),
  );
  const groupCount = new Set(
    sections.map((section) => section.group).filter(Boolean),
  ).size;

  return (
    <div className="student-card student-card-wide student-bilan-sheet">
      <header className="student-bilan-head">
        <span className="student-bilan-chop" aria-hidden="true">
          函
        </span>
        <div className="student-bilan-head-copy">
          <p className="student-bilan-kicker">{depthLabel(formuleNumber)}</p>
          <h2 className="student-bilan-title">Votre orientation</h2>
          <p className="student-bilan-lede">{intro}</p>
          {meta ? <p className="student-bilan-meta">{meta}</p> : null}
        </div>
      </header>

      {hasUnis ? (
        <div className="student-unis">
          <p className="student-unis-label">Universités à viser</p>
          <div className="student-unis-grid">
            <UniColumn title="Sûre" items={mix.safety} tone="safety" />
            <UniColumn title="Réaliste" items={mix.match} tone="match" />
            <UniColumn title="Ambitieuse" items={mix.reach} tone="reach" />
          </div>
        </div>
      ) : null}

      {gaps.length ? (
        <div className="student-next">
          <p className="student-next-label">Avant de candidater</p>
          <ol>
            {gaps.map((gap, index) => (
              <li key={`${gap.type}-${index}`}>{gap.conseil}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="student-bilan">
        {sections.map((section, index) => {
          const items = (section.items || [])
            .map(normalizeItem)
            .filter((item) => item.text)
            .slice(0, 3);
          const paragraph = scrubClient(firstParagraph(section.body));
          const previous = sections[index - 1];
          const showGroup =
            groupCount > 1 &&
            Boolean(section.group) &&
            section.group !== previous?.group;

          return (
            <div key={section.key}>
              {showGroup ? (
                <p className="student-bilan-group">{section.groupLabel}</p>
              ) : null}
              <article className="student-bilan-qa">
                <div className="student-bilan-qa-main">
                  <h3 className="student-bilan-question">
                    {STUDENT_TITLES[section.key] || section.title}
                  </h3>
                  {paragraph ? (
                    <p className="student-bilan-answer">{paragraph}</p>
                  ) : null}
                  {items.length ? (
                    <ul className="student-bilan-facts">
                      {items.map((item, itemIndex) => (
                        <li
                          key={`${section.key}-${itemIndex}`}
                          className={`is-${item.tone}`}
                        >
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </div>
          );
        })}
      </div>

      <p className="student-bilan-foot">
        Aucune admission, bourse ou visa n’est garantie.
      </p>
    </div>
  );
}

export default function StudentMatching({ matching, formuleNumber }) {
  return (
    <OrientationBilan matching={matching} formuleNumber={formuleNumber} />
  );
}
