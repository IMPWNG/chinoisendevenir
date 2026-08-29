"use client";

function documentTone(status) {
  return status === "received" ? "reçu" : "à fournir";
}

function OrientationBilan({ matching, formuleNumber }) {
  const bilan =
    matching?.orientation_bilan || matching?.formule1_bilan || null;
  const summary = matching?.profile_summary || {};
  const docs = bilan?.documents_status;
  const showDocs = Number(formuleNumber) >= 2 && docs;

  if (!bilan?.sections?.length) {
    return (
      <div className="student-card student-card-wide">
        <h2 className="card-title">Votre orientation</h2>
        <p className="card-subtitle">
          Votre compte rendu est en cours de préparation. Dès qu'il sera
          généré depuis le matching, il apparaîtra ici, selon votre formule.
          Il pourra être mis à jour plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">Votre orientation</h2>
      <p className="card-subtitle">
        Compte rendu — formule {formuleNumber}. Aucune admission, bourse ou
        visa n'est garantie. Ce document peut être mis à jour.
      </p>

      <div className="student-match-summary">
        {summary.field ? <span>Domaine : {summary.field}</span> : null}
        {summary.diploma ? <span>Diplôme : {summary.diploma}</span> : null}
        {summary.country ? <span>Pays : {summary.country}</span> : null}
        {summary.budget ? <span>Budget : {summary.budget}</span> : null}
        {summary.intake ? <span>Rentrée : {summary.intake}</span> : null}
      </div>

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
              {doc.label} : {documentTone(doc.status)}
            </span>
          ))}
          {docs.fromAdmin?.length ? (
            <span className="student-bilan-doc is-ok">
              {docs.fromAdmin.length} document
              {docs.fromAdmin.length > 1 ? "s" : ""} reçu
              {docs.fromAdmin.length > 1 ? "s" : ""} de l'équipe
            </span>
          ) : null}
        </div>
      ) : null}

      {bilan.intro ? <p className="student-bilan-intro">{bilan.intro}</p> : null}

      <div className="student-bilan">
        {bilan.sections.map((section) => (
          <article key={section.key} className="student-bilan-section">
            <h3>{section.title}</h3>
            {section.body ? <p>{section.body}</p> : null}
            {section.items?.length ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default function StudentMatching({ matching, formuleNumber }) {
  return (
    <OrientationBilan matching={matching} formuleNumber={formuleNumber} />
  );
}
