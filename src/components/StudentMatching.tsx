"use client";

import { useState } from "react";
import { useSiteI18n } from "../context/SiteI18nContext";

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

type Reading = {
  key: string;
  label: string;
  text: string;
};

type Uni = {
  id?: string;
  name: string;
  city?: string;
  categoryKey?: string;
  category?: string;
  best_match?: boolean;
  score_phrase?: string;
  readings?: Reading[];
  strengths?: string[];
  vigilance?: string[];
  fact_lines?: string[];
};

type MatchingDoc = {
  key?: string;
  name: string;
  status?: string;
  note?: string;
};

type DocGroup = {
  name: string;
  documents: MatchingDoc[];
};

type StudentReport = {
  profile_blurb?: string;
  universities?: Uni[];
  completeness?: { remaining_note?: string };
  documents_by_university?: DocGroup[];
  options_synthesis?: {
    why_top?: string;
    application_mix?: string;
    no_safety_note?: string;
  };
  documents?: MatchingDoc[];
  disclaimer?: string;
};

type Matching = {
  student_report?: StudentReport;
  orientation_bilan?: StudentReport;
};

function UniCard({
  uni,
  open,
  onToggle,
  t,
}: {
  uni: Uni;
  open: boolean;
  onToggle: () => void;
  t: TranslateFn;
}) {
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
            <span className="student-uni-best">{t("student.matching.bestFit")}</span>
          ) : null}
          <span className={`student-uni-stamp is-${uni.categoryKey}`}>
            {uni.category}
          </span>
        </div>
      </button>

      <p className="student-uni-score">{uni.score_phrase}</p>
      {uni.readings?.length ? (
        <ul className="student-readings">
          {uni.readings.map((row) => (
            <li key={row.key}>
              <strong>{row.label}.</strong> {row.text}
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="student-uni-full-body">
          {uni.strengths?.length ? (
            <div>
              <p className="student-uni-kicker">{t("student.matching.strengths")}</p>
              <ul>
                {uni.strengths.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {uni.vigilance?.length ? (
            <div>
              <p className="student-uni-kicker">{t("student.matching.prepare")}</p>
              <ul>
                {uni.vigilance.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {uni.fact_lines?.length ? (
            <div className="student-uni-facts">
              {uni.fact_lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="student-uni-more">{t("student.matching.seeDetail")}</p>
      )}
    </article>
  );
}

export default function StudentMatching({
  matching,
  formuleNumber,
}: {
  matching?: Matching | null;
  formuleNumber?: number | string | null;
}) {
  const { t } = useSiteI18n();
  const report = matching?.student_report || matching?.orientation_bilan;
  const unis = report?.universities || [];
  const [openId, setOpenId] = useState<string | null>(null);

  const kicker =
    Number(formuleNumber) >= 3
      ? t("student.matching.untilDeparture")
      : Number(formuleNumber) === 2
        ? t("student.matching.application")
        : t("student.matching.bilan");

  if (!report || !(report.profile_blurb || report.universities)) {
    return (
      <div className="student-card student-card-wide student-bilan-sheet">
        <header className="student-bilan-head">
          <div className="student-bilan-head-copy">
            <p className="student-bilan-kicker">{kicker}</p>
            <h2 className="student-bilan-title">{t("student.matching.orientation")}</h2>
            <p className="student-bilan-lede">{t("student.matching.notReady")}</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="student-card student-card-wide student-bilan-sheet student-report">
      <header className="student-bilan-head">
        <div className="student-bilan-head-copy">
          <p className="student-bilan-kicker">{kicker}</p>
          <h2 className="student-bilan-title">{t("student.matching.orientation")}</h2>
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
          <h3 className="student-report-title">{t("student.matching.unis")}</h3>
          <div className="student-uni-full-list">
            {unis.map((uni: Uni) => {
              const key = uni.id || uni.name;
              return (
                <UniCard
                  key={key}
                  uni={uni}
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
          <h3 className="student-report-title">{t("student.matching.unis")}</h3>
          <p className="student-report-copy">{t("student.matching.noUnis")}</p>
        </section>
      )}

      {report.options_synthesis ? (
        <section className="student-report-block">
          <h3 className="student-report-title">
            {t("student.matching.bestOptions")}
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

      {report.documents_by_university?.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.docsToPrep")}</h3>
          {report.documents_by_university.map((group) => (
            <div key={group.name} className="student-doc-group">
              <p className="student-uni-kicker">{group.name}</p>
              <ul className="student-doc-check">
                {group.documents.map((doc) => (
                  <li
                    key={`${group.name}-${doc.key || doc.name}`}
                    className={doc.status === "fourni" ? "is-ok" : "is-miss"}
                  >
                    <span>
                      {doc.status === "fourni"
                        ? t("student.matching.provided")
                        : t("student.matching.toProvide")}
                    </span>
                    <p>{doc.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      <p className="student-bilan-foot">
        {report.disclaimer || t("student.matching.disclaimer")}
      </p>
    </div>
  );
}
