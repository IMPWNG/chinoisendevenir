"use client";

function Formule1Bilan({ matching }) {
  const bilan = matching?.formule1_bilan;
  const summary = matching?.profile_summary || {};

  if (!bilan?.sections?.length) {
    return (
      <div className="student-card student-card-wide">
        <h2 className="card-title">Votre orientation</h2>
        <p className="card-subtitle">
          Votre bilan personnalisé est en cours de préparation. Dès qu'il
          sera généré depuis le matching, il apparaîtra ici, point par point
          selon la formule 1.
        </p>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">Votre orientation</h2>
      <p className="card-subtitle">
        Bilan personnalisé — formule 1. Aucune admission, bourse ou visa n'est
        garantie.
      </p>

      <div className="student-match-summary">
        {summary.field ? <span>Domaine : {summary.field}</span> : null}
        {summary.diploma ? <span>Diplôme : {summary.diploma}</span> : null}
        {summary.country ? <span>Pays : {summary.country}</span> : null}
        {summary.budget ? <span>Budget : {summary.budget}</span> : null}
        {summary.intake ? <span>Rentrée : {summary.intake}</span> : null}
      </div>

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
  if (Number(formuleNumber) === 1) {
    return <Formule1Bilan matching={matching} />;
  }

  if (!matching) {
    return (
      <div className="student-card student-card-wide">
        <h2 className="card-title">Votre orientation</h2>
        <p className="card-subtitle">
          Votre analyse est en cours de préparation. Dès qu'elle sera prête,
          les universités et informations correspondant à votre formule
          apparaîtront ici.
        </p>
      </div>
    );
  }

  const summary = matching.profile_summary || {};

  return (
    <div className="student-card student-card-wide">
      <h2 className="card-title">Votre orientation</h2>
      <p className="card-subtitle">
        {formuleNumber
          ? `Informations débloquées pour la formule ${formuleNumber}.`
          : "Informations débloquées selon votre formule."}{" "}
        Aucune admission, bourse ou visa n'est garantie.
      </p>

      <div className="student-match-summary">
        {summary.field ? <span>Domaine : {summary.field}</span> : null}
        {summary.diploma ? <span>Diplôme : {summary.diploma}</span> : null}
        {summary.country ? <span>Pays : {summary.country}</span> : null}
        {summary.budget ? <span>Budget : {summary.budget}</span> : null}
        {summary.intake ? <span>Rentrée : {summary.intake}</span> : null}
      </div>

      {matching.matches?.length ? (
        <div className="student-match-list">
          {matching.matches.map((item) => (
            <article key={item.university_name} className="student-match-item">
              <div className="student-match-head">
                <h3>{item.university_name}</h3>
                <span className="student-match-tag">{item.category}</span>
                {item.score != null ? (
                  <span className="student-match-score">{item.score}/100</span>
                ) : null}
              </div>
              {item.summary ? <p>{item.summary}</p> : null}
              {item.teaching_language ? (
                <p>Langue d'enseignement : {item.teaching_language}</p>
              ) : null}
              {item.deadline ? <p>Deadline : {item.deadline}</p> : null}
              {item.tuition ? <p>Frais de scolarité : {item.tuition}</p> : null}
              {item.strengths?.length ? (
                <ul>
                  {item.strengths.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {item.warnings?.length ? (
                <ul className="student-match-warnings">
                  {item.warnings.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {item.recommended_actions?.length ? (
                <div>
                  <p className="student-formule-label">Actions recommandées</p>
                  <ul>
                    {item.recommended_actions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="landing-alert landing-alert-warning">
          Aucune université suffisamment compatible n'a encore été identifiée.
          Mettez à jour votre profil pour affiner l'analyse.
        </div>
      )}

      {matching.scholarships?.length ? (
        <div className="student-match-block">
          <p className="student-formule-label">Bourses possibles</p>
          <p>
            {matching.scholarships.join(", ")}. L'obtention n'est jamais
            automatique.
          </p>
        </div>
      ) : null}

      {matching.documents_to_prepare?.length ? (
        <div className="student-match-block">
          <p className="student-formule-label">Documents à préparer</p>
          <ul>
            {matching.documents_to_prepare.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {matching.upgrade_hint ? (
        <div className="landing-alert landing-alert-warning">
          {matching.upgrade_hint}
        </div>
      ) : null}
    </div>
  );
}
