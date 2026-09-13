"use client";

import { useState } from "react";
import { useSiteI18n } from "../context/SiteI18nContext";

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

const ROAD_STATUS_MARK: Record<string, string> = {
  fait: "fait",
  en_cours: "cours",
  a_venir: "venir",
  bloquant: "bloc",
};

type BreakdownRow = {
  key: string;
  label: string;
  points?: number | null;
  max?: number;
};

type Uni = {
  id?: string;
  name: string;
  city?: string;
  categoryKey?: string;
  category?: string;
  best_match?: boolean;
  score_phrase?: string;
  breakdown?: BreakdownRow[];
  strengths?: string[];
  vigilance?: string[];
  cost?: { label?: string };
  deadline?: string;
  language?: string;
  scholarships?: string[];
  documents?: string[];
};

type RoadmapRow = {
  n: number | string;
  step: string;
  status?: string;
  you?: string;
  we?: string;
};

type MatchingDoc = {
  key?: string;
  name: string;
  status?: string;
  note?: string;
};

type GrantGroup = {
  type: string;
  title: string;
  explanation?: string;
  names?: string[];
};

type StudentReport = {
  profile_blurb?: string;
  universities?: Uni[];
  completeness?: { remaining_note?: string };
  options_synthesis?: {
    why_top?: string;
    application_mix?: string;
    no_safety_note?: string;
  };
  roadmap?: RoadmapRow[];
  documents?: MatchingDoc[];
  scholarships?: { groups?: GrantGroup[]; disclaimer?: string };
  closing?: string;
  disclaimer?: string;
};

type Matching = {
  student_report?: StudentReport;
  orientation_bilan?: StudentReport;
};

function ScoreBar({
  points,
  max,
  emptyLabel,
}: {
  points?: number | null;
  max?: number;
  emptyLabel: string;
}) {
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
      <div className="student-meters">
        {(uni.breakdown || []).map((row: BreakdownRow) => (
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
          <p className="student-uni-facts">
            {t("student.matching.fees")} {uni.cost?.label || t("student.matching.feesFallback")}
            <br />
            {t("student.matching.deadline")} {uni.deadline}
            <br />
            {t("student.matching.language")} {uni.language}
            {uni.scholarships?.length ? (
              <>
                <br />
                {t("student.matching.listedScholarships")} {uni.scholarships.join(", ")}
              </>
            ) : (
              <>
                <br />
                {t("student.matching.scholarshipsFallback")}
              </>
            )}
          </p>
          {uni.documents?.length ? (
            <p className="student-uni-facts">
              {t("student.matching.extraDocs")} {uni.documents.join(", ")}
            </p>
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
  const [openGrant, setOpenGrant] = useState<string | null>(null);

  const grants = report?.scholarships?.groups || [];
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

      {report.roadmap?.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.nextSteps")}</h3>
          <ol className="student-roadmap">
            {report.roadmap.map((row: RoadmapRow) => {
              const mark = ROAD_STATUS_MARK[row.status || "a_venir"] || "venir";
              const statusKey = row.status && t(`student.matching.status.${row.status}`) !== `student.matching.status.${row.status}`
                ? row.status
                : "a_venir";
              return (
                <li key={row.n} className={`is-${mark}`}>
                  <div className="student-roadmap-top">
                    <span className="student-roadmap-n">{row.n}</span>
                    <p className="student-roadmap-step">{row.step}</p>
                    <span className={`student-roadmap-status is-${mark}`}>
                      {t(`student.matching.status.${statusKey}`)}
                    </span>
                  </div>
                  <p>
                    <strong>{t("student.matching.you")}</strong> {row.you}
                  </p>
                  <p>
                    <strong>{t("student.matching.we")}</strong> {row.we}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {report.documents?.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.docsToPrep")}</h3>
          <ul className="student-doc-check">
            {report.documents.map((doc: MatchingDoc) => (
              <li
                key={doc.key || doc.name}
                className={doc.status === "fourni" ? "is-ok" : "is-miss"}
              >
                <span>
                  {doc.status === "fourni"
                    ? t("student.matching.provided")
                    : t("student.matching.toProvide")}
                </span>
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
          <h3 className="student-report-title">
            {t("student.matching.possibleScholarships")}
          </h3>
          <div className="student-grant-list">
            {grants.map((group: GrantGroup) => (
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
                      <p>{t("student.matching.noGrant")}</p>
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
        {report.disclaimer || t("student.matching.disclaimer")}
      </p>
    </div>
  );
}
