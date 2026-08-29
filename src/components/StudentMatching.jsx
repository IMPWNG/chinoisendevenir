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

function OrientationBilan({ matching, formuleNumber }) {
  const bilan =
    matching?.orientation_bilan || matching?.formule1_bilan || null;
  const summary = matching?.profile_summary || {};
  const docs = bilan?.documents_status;
  const showDocs = Number(formuleNumber) >= 2 && docs;
  const chips = ficheChips(summary);

  if (!bilan?.sections?.length) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <p className="student-bilan-kicker">Compte rendu · Formule {formuleNumber}</p>
        <h2 className="card-title">Votre orientation</h2>
        <p className="student-bilan-lede">
          Votre compte rendu est en cours de préparation. Dès qu’il sera généré
          depuis le matching, chaque service de votre formule y sera répondu.
          Il pourra être mis à jour plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide student-bilan-sheet">
      <header className="student-bilan-head">
        <p className="student-bilan-kicker">
          Compte rendu · Formule {formuleNumber}
        </p>
        <h2 className="card-title">Votre orientation</h2>
        <p className="student-bilan-lede">
          {bilan.intro ||
            "Chaque point de votre formule est traité comme une question, à partir de votre fiche et du catalogue d’universités. Aucune admission, bourse ou visa n’est garantie."}
        </p>

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
