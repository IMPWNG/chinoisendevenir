"use client";

function normalizeItem(item) {
  if (item && typeof item === "object" && item.text) {
    return {
      text: item.text,
      tone: item.tone || "info",
    };
  }
  return { text: String(item || ""), tone: "info" };
}

function bodyParagraphs(body) {
  return String(body || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function ficheChips(summary) {
  return [
    summary.field ? { label: "Domaine", value: summary.field } : null,
    summary.diploma ? { label: "Diplôme", value: summary.diploma } : null,
    summary.country ? { label: "Pays", value: summary.country } : null,
    summary.hsk ? { label: "Chinois", value: summary.hsk } : null,
    summary.english ? { label: "Anglais", value: summary.english } : null,
    summary.budget ? { label: "Budget", value: summary.budget } : null,
    summary.intake ? { label: "Rentrée", value: summary.intake } : null,
  ].filter(Boolean);
}

function depthLabel(formuleNumber) {
  if (Number(formuleNumber) >= 3) return "Jusqu’au départ";
  if (Number(formuleNumber) === 2) return "Candidature";
  return "Bilan";
}

function MixColumn({ title, hint, items, formuleNumber, tone }) {
  if (!items?.length) return null;
  const showScore = Number(formuleNumber) >= 2;
  return (
    <section className={`student-mix-col is-${tone}`}>
      <p className="student-mix-col-title">{title}</p>
      <p className="student-mix-col-hint">{hint}</p>
      <ul className="student-mix-list">
        {items.map((uni) => (
          <li key={`${tone}-${uni.name}`} className="student-mix-card">
            <p className="student-mix-name">{uni.name}</p>
            <p className="student-mix-meta">
              {[uni.city, uni.language].filter(Boolean).join(" · ")}
            </p>
            {showScore && uni.score != null ? (
              <p className="student-mix-score">{uni.score}/100</p>
            ) : (
              <p className="student-mix-qual">{uni.qualitative}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OrientationBilan({ matching, formuleNumber }) {
  const bilan =
    matching?.orientation_bilan || matching?.formule1_bilan || null;
  const summary = matching?.profile_summary || {};
  const docs = bilan?.documents_status;
  const showDocs = Number(formuleNumber) >= 2 && docs;
  const chips = ficheChips(summary);
  const mix = matching?.mix || {};
  const gaps = matching?.gaps || bilan?.gaps || [];
  const quality = matching?.quality_score ?? summary.quality;
  const hasMix = Boolean(mix.safety?.length || mix.match?.length || mix.reach?.length);

  if (!bilan?.sections?.length) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <p className="student-bilan-kicker">Compte rendu · {depthLabel(formuleNumber)}</p>
        <h2 className="card-title">Votre orientation</h2>
        <p className="student-bilan-lede">
          Votre compte rendu n’est pas encore prêt. Dès que l’analyse sera lancée,
          vous verrez ici un mix d’universités à viser — et ce qu’il faut renforcer
          avant de candidater.
        </p>
        <p className="student-bilan-disclaimer">
          *Aucune admission, bourse ou visa n’est garantie.*
        </p>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide student-bilan-sheet">
      <header className="student-bilan-head">
        <p className="student-bilan-kicker">
          Compte rendu · {depthLabel(formuleNumber)}
        </p>
        <h2 className="card-title">Votre orientation</h2>
        <p className="student-bilan-lede">
          {bilan.intro ||
            "Voici où votre profil se situe aujourd’hui : un mix d’universités sûres, réalistes et ambitieuses, plus ce qu’il faut renforcer avant de candidater."}
        </p>
        <p className="student-bilan-disclaimer">
          {bilan.disclaimer ||
            "*Aucune admission, bourse ou visa n’est garantie.*"}
        </p>

        {quality != null ? (
          <p className="student-quality">
            Complétude du dossier <strong>{quality}/100</strong>
            {quality < 70
              ? " — plus le dossier est complet, plus le matching est fiable."
              : " — assez d’éléments pour une première sélection solide."}
          </p>
        ) : null}

        {chips.length ? (
          <dl className="student-bilan-fiche">
            {chips.map((chip) => (
              <div key={chip.label} className="student-bilan-fiche-item">
                <dt>{chip.label}</dt>
                <dd>{chip.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {hasMix ? (
          <div className="student-mix">
            <p className="student-mix-kicker">Votre mix d’universités</p>
            <p className="student-mix-lede">
              Pas le top 5 brut : des pistes sûres, des pistes réalistes, et au moins une ambitieuse — pour ne pas tout miser sur un seul dossier trop juste.
            </p>
            <div className="student-mix-grid">
              <MixColumn
                title="Sûres"
                hint="Forte probabilité d’admission"
                items={mix.safety}
                formuleNumber={formuleNumber}
                tone="safety"
              />
              <MixColumn
                title="Réalistes"
                hint="Dossier à soigner"
                items={mix.match}
                formuleNumber={formuleNumber}
                tone="match"
              />
              <MixColumn
                title="Ambitieuses"
                hint="Dossier à renforcer"
                items={mix.reach}
                formuleNumber={formuleNumber}
                tone="reach"
              />
            </div>
          </div>
        ) : null}

        {gaps.length ? (
          <div className="student-gaps">
            <p className="student-gaps-title">À combler avant de déposer</p>
            <ul>
              {gaps.slice(0, 6).map((gap, index) => (
                <li key={`${gap.type}-${index}`}>
                  {gap.universite ? (
                    <strong>{gap.universite} — </strong>
                  ) : null}
                  {gap.conseil}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showDocs ? (
          <div className="student-bilan-docs">
            {docs.required?.map((doc) => (
              <span
                key={doc.key}
                className={
                  doc.status === "received"
                    ? "student-bilan-doc is-ok"
                    : "student-bilan-doc is-missing"
                }
              >
                {doc.label} : {doc.status === "received" ? "reçu" : "à fournir"}
              </span>
            ))}
            {docs.fromAdmin?.length ? (
              <span className="student-bilan-doc is-ok">
                {docs.fromAdmin.length} document
                {docs.fromAdmin.length > 1 ? "s" : ""} reçu
                {docs.fromAdmin.length > 1 ? "s" : ""} de l’équipe
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="student-bilan">
        {bilan.sections.map((section, index) => {
          const items = (section.items || [])
            .map(normalizeItem)
            .filter((item) => item.text);
          const paragraphs = bodyParagraphs(section.body);
          const previous = bilan.sections[index - 1];
          const showGroup =
            Boolean(section.group) && section.group !== previous?.group;
          const number = String(index + 1).padStart(2, "0");
          const tone = section.verdictTone || "info";

          return (
            <div key={section.key}>
              {showGroup ? (
                <p className="student-bilan-group">{section.groupLabel}</p>
              ) : null}
              <article className={`student-bilan-qa is-${tone}`}>
                <p className="student-bilan-index" aria-hidden="true">
                  {number}
                </p>
                <div className="student-bilan-qa-main">
                  <p className="student-bilan-service">{section.title}</p>
                  <h3 className="student-bilan-question">
                    {section.question || section.title}
                  </h3>
                  {section.verdict ? (
                    <p className={`student-bilan-verdict is-${tone}`}>
                      {section.verdict}
                    </p>
                  ) : null}
                  {paragraphs.map((paragraph, paragraphIndex) => (
                    <p
                      key={`${section.key}-p-${paragraphIndex}`}
                      className="student-bilan-answer"
                    >
                      {paragraph}
                    </p>
                  ))}
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
    </div>
  );
}

export default function StudentMatching({ matching, formuleNumber }) {
  return (
    <OrientationBilan matching={matching} formuleNumber={formuleNumber} />
  );
}
