"use client";

import { useState } from "react";
import { useSiteI18n } from "../context/SiteI18nContext";

function ScoreBar({ points, max, emptyLabel }) {
  if (points == null || !max) {
    return <span className="student-meter-empty">{emptyLabel}</span>;
  }
  const pct = Math.max(0, Math.min(100, Math.round((points / max) * 100)));
  return (
    <span className="student-meter" title={`${points}/${max}`}>
      <span className="student-meter-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

function SchoolCard({ school, open, onToggle, t }) {
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
            <span className="student-uni-best">{t("student.matching.bestFit")}</span>
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
            <ScoreBar
              points={row.points}
              max={row.max}
              emptyLabel={t("student.matching.toSpecify")}
            />
          </div>
        ))}
      </div>

      {open ? (
        <div className="student-uni-full-body">
          {school.why?.length ? (
            <div>
              <p className="student-uni-kicker">{t("student.matching.whySchool")}</p>
              <ul>
                {school.why.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {school.vigilance?.length ? (
            <div>
              <p className="student-uni-kicker">{t("student.matching.toConfirm")}</p>
              <ul>
                {school.vigilance.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="student-uni-facts">
            {t("student.matching.fees")}{" "}
            {school.cost?.label || t("student.matching.schoolFeesFallback")}
            <br />
            {t("student.matching.intake")} {school.intake}
          </p>
        </div>
      ) : (
        <p className="student-uni-more">{t("student.matching.seeDetail")}</p>
      )}
    </article>
  );
}

export default function StudentChineseMatching({ chineseMatching, formuleNumber }) {
  const { t } = useSiteI18n();
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
            <p className="student-bilan-kicker">{t("student.matching.languageYear")}</p>
            <h2 className="student-bilan-title">{t("student.matching.chineseStudy")}</h2>
            <p className="student-bilan-lede">
              {t("student.matching.chineseNotReady")}
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
          <p className="student-bilan-kicker">{t("student.matching.languageYear")}</p>
          <h2 className="student-bilan-title">{t("student.matching.chineseStudy")}</h2>
        </div>
      </header>

      <section className="student-profile-card">
        <p className="student-profile-blurb">{view.profile_blurb}</p>
        {view.criteria ? (
          <p className="student-profile-complete">
            {t("student.matching.city")} {view.criteria.city}
            {" · "}
            {t("student.matching.budget")} {view.criteria.budget}
            {" · "}
            {t("student.matching.intake")} {view.criteria.intake}
          </p>
        ) : null}
      </section>

      {schools.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.schools")}</h3>
          <div className="student-uni-full-list">
            {schools.map((school) => {
              const key = school.id || school.name;
              return (
                <SchoolCard
                  key={key}
                  school={school}
                  open={openId === key}
                  onToggle={() => setOpenId(openId === key ? null : key)}
                  t={t}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.schools")}</h3>
          <p className="student-report-copy">{t("student.matching.noSchools")}</p>
        </section>
      )}

      <p className="student-bilan-foot">
        {view.disclaimer || t("student.matching.chineseDisclaimer")}
      </p>
    </div>
  );
}
