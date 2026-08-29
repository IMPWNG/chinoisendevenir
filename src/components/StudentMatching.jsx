"use client";

import { useState } from "react";

const ROAD_STATUS = {
  fait: { label: "Fait", mark: "fait" },
  en_cours: { label: "En cours", mark: "cours" },
  a_venir: { label: "À venir", mark: "venir" },
  bloquant: { label: "Bloquant", mark: "bloc" },
};

function ScoreBar({ points, max }) {
  if (points == null || !max) {
    return <span className="student-meter-empty">à préciser</span>;
  }
  const pct = Math.max(0, Math.min(100, Math.round((points / max) * 100)));
  return (
    <span className="student-meter" title={`${points}/${max}`}>
      <span className="student-meter-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

function UniCard({ uni, open, onToggle }) {
  return (
    <article
      className={`student-uni-full is-${uni.categoryKey}${
        uni.best_match ? " is-best" : ""
      }${open ? " is-open" : ""}`}
    >
      <button type="button" className="student-uni-full-head" onClick={onToggle}>
        <div>
          <p className="student-uni-full-name">{uni.name}</p>
          <p className="student-uni-full-city">{uni.city}</p>
        </div>
        <div className="student-uni-full-aside">
          {uni.best_match ? (
            <span className="student-uni-best">Meilleur alignement</span>
          ) : null}
          <span className={`student-uni-stamp is-${uni.categoryKey}`}>
            {uni.category}
          </span>
        </div>
      </button>

      <p className="student-uni-score">{uni.score_phrase}</p>
      <div className="student-meters">
        {(uni.breakdown || []).map((row) => (
          <div key={row.key} className="student-meter-row">
            <span>{row.label}</span>
            <ScoreBar points={row.points} max={row.max} />
          </div>
        ))}
      </div>

      {open ? (
        <div className="student-uni-full-body">
          {uni.strengths?.length ? (
            <div>
              <p className="student-uni-kicker">Points forts</p>
              <ul>
                {uni.strengths.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {uni.vigilance?.length ? (
            <div>
              <p className="student-uni-kicker">À préparer</p>
              <ul>
                {uni.vigilance.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="student-uni-facts">
            Frais : {uni.cost?.label || "à vérifier auprès de l’université"}
            <br />
            Deadline : {uni.deadline}
            <br />
            Langue : {uni.language}
            {uni.scholarships?.length ? (
              <>
                <br />
                Bourses listées : {uni.scholarships.join(", ")}
              </>
            ) : (
              <>
                <br />
                Bourses : à vérifier auprès de l’université
              </>
            )}
          </p>
          {uni.documents?.length ? (
            <p className="student-uni-facts">
              Pièces propres à cet établissement : {uni.documents.join(", ")}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="student-uni-more">Voir le détail</p>
      )}
    </article>
  );
}

export default function StudentMatching({ matching, formuleNumber }) {
  const report = matching?.student_report || matching?.orientation_bilan;
  const unis = report?.universities || [];
  const [openId, setOpenId] = useState(null);
  const [openGrant, setOpenGrant] = useState(null);

  const hasReport = Boolean(report?.profile_blurb || report?.universities);
  const grants = report?.scholarships?.groups || [];

  if (!hasReport) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <header className="student-bilan-head">
          <span className="student-bilan-chop" aria-hidden="true">
            函
          </span>
          <div className="student-bilan-head-copy">
            <p className="student-bilan-kicker">
              {Number(formuleNumber) >= 3
                ? "Jusqu’au départ"
                : Number(formuleNumber) === 2
                  ? "Candidature"
                  : "Bilan"}
            </p>
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

  return (
    <div className="student-card student-card-wide student-bilan-sheet student-report">
      <header className="student-bilan-head">
        <span className="student-bilan-chop" aria-hidden="true">
          函
        </span>
        <div className="student-bilan-head-copy">
          <p className="student-bilan-kicker">
            {Number(formuleNumber) >= 3
              ? "Jusqu’au départ"
              : Number(formuleNumber) === 2
                ? "Candidature"
                : "Bilan"}
          </p>
          <h2 className="student-bilan-title">Votre orientation</h2>
        </div>
      </header>

      <section className="student-profile-card">
        <p className="student-profile-blurb">{report.profile_blurb}</p>
        <p className="student-profile-complete">
          {report.completeness?.remaining_note}
        </p>
      </section>

      {unis.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">Universités retenues</h3>
          <div className="student-uni-full-list">
            {unis.map((uni) => {
              const key = uni.id || uni.name;
              return (
                <UniCard
                  key={key}
                  uni={uni}
                  open={openId === key}
                  onToggle={() => setOpenId(openId === key ? null : key)}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <section className="student-report-block">
          <h3 className="student-report-title">Universités retenues</h3>
          <p className="student-report-copy">
            Aucune université assez compatible n’a été retenue avec les données
            actuelles. Précisez le domaine, la langue ou le budget pour affiner
            les recommandations.
          </p>
        </section>
      )}

      {report.options_synthesis ? (
        <section className="student-report-block">
          <h3 className="student-report-title">
            Quelles sont les meilleures options pour vous
          </h3>
          <p className="student-report-copy">{report.options_synthesis.why_top}</p>
          <p className="student-report-copy">
            {report.options_synthesis.application_mix}
          </p>
          {report.options_synthesis.no_safety_note ? (
            <p className="student-report-copy is-note">
              {report.options_synthesis.no_safety_note}
            </p>
          ) : null}
        </section>
      ) : null}

      {report.roadmap?.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">Prochaines étapes</h3>
          <ol className="student-roadmap">
            {report.roadmap.map((row) => {
              const status = ROAD_STATUS[row.status] || ROAD_STATUS.a_venir;
              return (
                <li key={row.n} className={`is-${status.mark}`}>
                  <div className="student-roadmap-top">
                    <span className="student-roadmap-n">{row.n}</span>
                    <p className="student-roadmap-step">{row.step}</p>
                    <span className={`student-roadmap-status is-${status.mark}`}>
                      {status.label}
                    </span>
                  </div>
                  <p>
                    <strong>Vous :</strong> {row.you}
                  </p>
                  <p>
                    <strong>Nous :</strong> {row.we}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {report.documents?.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">Documents à préparer</h3>
          <ul className="student-doc-check">
            {report.documents.map((doc) => (
              <li
                key={doc.key || doc.name}
                className={doc.status === "fourni" ? "is-ok" : "is-miss"}
              >
                <span>{doc.status === "fourni" ? "Fourni" : "À fournir"}</span>
                <p>
                  {doc.name}
                  {doc.note ? ` — ${doc.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {grants.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">Bourses possibles</h3>
          <div className="student-grant-list">
            {grants.map((group) => (
              <div key={group.type} className="student-grant">
                <button
                  type="button"
                  onClick={() =>
                    setOpenGrant(openGrant === group.type ? null : group.type)
                  }
                >
                  {group.title}
                </button>
                {openGrant === group.type ? (
                  <div>
                    <p>{group.explanation}</p>
                    {group.names?.length ? (
                      <p>{group.names.join(", ")}</p>
                    ) : (
                      <p>Aucune piste nommée dans le catalogue pour l’instant.</p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="student-report-copy is-note">
            {report.scholarships?.disclaimer}
          </p>
        </section>
      ) : null}

      {report.closing ? (
        <p className="student-report-close">{report.closing}</p>
      ) : null}
      <p className="student-bilan-foot">
        {report.disclaimer ||
          "Aucune admission, bourse ou visa n’est garantie."}
      </p>
    </div>
  );
}
