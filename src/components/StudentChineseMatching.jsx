"use client";

import { useState } from "react";

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

function SchoolCard({ school, open, onToggle }) {
  return (
    <article
      className={`student-uni-full is-${school.categoryKey}${
        school.best_match ? " is-best" : ""
      }${open ? " is-open" : ""}`}
    >
      <button type="button" className="student-uni-full-head" onClick={onToggle}>
        <div>
          <p className="student-uni-full-name">{school.name}</p>
          <p className="student-uni-full-city">{school.city}</p>
        </div>
        <div className="student-uni-full-aside">
          {school.best_match ? (
            <span className="student-uni-best">Meilleur alignement</span>
          ) : null}
          <span className={`student-uni-stamp is-${school.categoryKey}`}>
            {school.category}
          </span>
        </div>
      </button>

      <p className="student-uni-score">{school.score_phrase}</p>
      <div className="student-meters">
        {(school.breakdown || []).map((row) => (
          <div key={row.key} className="student-meter-row">
            <span>{row.label}</span>
            <ScoreBar points={row.points} max={row.max} />
          </div>
        ))}
      </div>

      {open ? (
        <div className="student-uni-full-body">
          {school.why?.length ? (
            <div>
              <p className="student-uni-kicker">Pourquoi cette école</p>
              <ul>
                {school.why.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {school.vigilance?.length ? (
            <div>
              <p className="student-uni-kicker">À confirmer</p>
              <ul>
                {school.vigilance.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="student-uni-facts">
            Frais : {school.cost?.label || "à confirmer auprès de l’école"}
            <br />
            Rentrée : {school.intake}
          </p>
        </div>
      ) : (
        <p className="student-uni-more">Voir le détail</p>
      )}
    </article>
  );
}

export default function StudentChineseMatching({ chineseMatching, formuleNumber }) {
  const view = chineseMatching?.student_view;
  const schools = view?.schools || [];
  const [openId, setOpenId] = useState(null);
  const showForFormule =
    Number(formuleNumber) === 1 || Number(formuleNumber) === 3;
  const hasResult = Boolean(view && (view.profile_blurb || schools.length));

  if (!hasResult && !showForFormule) return null;

  if (!hasResult) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <header className="student-bilan-head">
          <div className="student-bilan-head-copy">
            <p className="student-bilan-kicker">Année de langue</p>
            <h2 className="student-bilan-title">Étude du chinois en Chine</h2>
            <p className="student-bilan-lede">
              Les écoles de langue correspondant à votre ville, votre budget et
              votre rentrée apparaîtront ici dès qu’elles auront été
              sélectionnées.
            </p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide student-bilan-sheet student-report">
      <header className="student-bilan-head">
        <div className="student-bilan-head-copy">
          <p className="student-bilan-kicker">Année de langue</p>
          <h2 className="student-bilan-title">Étude du chinois en Chine</h2>
        </div>
      </header>

      <section className="student-profile-card">
        <p className="student-profile-blurb">{view.profile_blurb}</p>
        {view.criteria ? (
          <p className="student-profile-complete">
            Ville : {view.criteria.city}
            {" · "}
            Budget : {view.criteria.budget}
            {" · "}
            Rentrée : {view.criteria.intake}
          </p>
        ) : null}
      </section>

      {schools.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">Écoles de langue retenues</h3>
          <div className="student-uni-full-list">
            {schools.map((school) => {
              const key = school.id || school.name;
              return (
                <SchoolCard
                  key={key}
                  school={school}
                  open={openId === key}
                  onToggle={() => setOpenId(openId === key ? null : key)}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <section className="student-report-block">
          <h3 className="student-report-title">Écoles de langue retenues</h3>
          <p className="student-report-copy">
            Aucune école assez compatible n’a été retenue avec les données
            actuelles. Précisez la ville, le budget ou la date de rentrée.
          </p>
        </section>
      )}

      <p className="student-bilan-foot">
        {view.disclaimer ||
          "Aucune inscription, bourse ou visa n’est garantie."}
      </p>
    </div>
  );
}
