"use client";

import { useState } from "react";
import { useSiteI18n } from "../context/SiteI18nContext";

type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

type School = {
  id?: string;
  name: string;
  city?: string;
  categoryKey?: string;
  category?: string;
  best_match?: boolean;
  score_phrase?: string;
  why?: string[];
  vigilance?: string[];
  facts?: string[];
  cost?: { label?: string; lines?: string[] };
  intake?: string;
};

type ChineseView = {
  profile_blurb?: string;
  criteria?: { city?: string; intake?: string };
  schools?: School[];
  disclaimer?: string;
};

function splitLabeled(line: string) {
  const index = line.indexOf(":");
  if (index <= 0 || index > 48) return { label: "", text: line };
  return {
    label: line.slice(0, index).trim(),
    text: line.slice(index + 1).trim(),
  };
}

function SchoolCard({
  school,
  open,
  onToggle,
  t,
}: {
  school: School;
  open: boolean;
  onToggle: () => void;
  t: TranslateFn;
}) {
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

      {open ? (
        <div className="student-uni-full-body">
          {school.why?.length ? (
            <section>
              <p className="student-uni-kicker">{t("student.matching.whySchool")}</p>
              <p className="student-block-intro">
                Ce qui rapproche cette école de la ville et de la rentrée indiquées dans votre dossier.
              </p>
              <ul>
                {school.why.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {school.vigilance?.length ? (
            <section>
              <p className="student-uni-kicker">{t("student.matching.toConfirm")}</p>
              <p className="student-block-intro">
                À vérifier avant de retenir cette école. Un point ouvert ne veut pas dire que la candidature est fermée.
              </p>
              <ul>
                {school.vigilance.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section>
            <p className="student-uni-kicker">{t("student.matching.fees").replace(/:\s*$/, "")}</p>
            <p className="student-block-intro">
              Le prix au semestre et le prix à l'année sont séparés. Le total annuel n'inclut la scolarité que lorsque sa période est connue.
            </p>
            <dl className="student-spec">
              {(school.cost?.lines?.length
                ? school.cost.lines
                : school.cost?.label
                  ? [school.cost.label]
                  : []
              ).map((line) => {
                const row = splitLabeled(line);
                return (
                  <div key={line}>
                    {row.label ? <dt>{row.label}</dt> : null}
                    <dd>{row.text}</dd>
                  </div>
                );
              })}
              {school.intake ? (
                <div>
                  <dt>{t("student.matching.intake").replace(/:\s*$/, "")}</dt>
                  <dd>{school.intake}</dd>
                </div>
              ) : null}
            </dl>
          </section>
          {(school.facts || []).some((line) => !/^site\s*:/i.test(line)) ? (
            <section>
              <p className="student-uni-kicker">Conditions publiées</p>
              <p className="student-block-intro">
                Âge, niveau, pièces et dates tels que l'école les indique. Le détail chinois, quand il existe, est à confirmer auprès de l'école.
              </p>
              <dl className="student-spec">
                {(school.facts || [])
                  .filter((line) => !/^site\s*:/i.test(line))
                  .map((line) => {
                  const row = splitLabeled(line);
                  return (
                    <div key={line}>
                      {row.label ? <dt>{row.label}</dt> : null}
                      <dd>{row.text}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ) : null}
        </div>
      ) : (
        <p className="student-uni-more">{t("student.matching.seeDetail")}</p>
      )}
    </article>
  );
}

export default function StudentChineseMatching({
  chineseMatching,
  formuleNumber,
}: {
  chineseMatching?: { student_view?: ChineseView } | null;
  formuleNumber?: number | string | null;
}) {
  const { t } = useSiteI18n();
  const view = chineseMatching?.student_view;
  const schools = view?.schools || [];
  const [openId, setOpenId] = useState<string | null>(
    () => schools[0]?.id || schools[0]?.name || null,
  );
  const showForFormule =
    Number(formuleNumber) === 1 || Number(formuleNumber) === 3;

  if (!view || !(view.profile_blurb || schools.length)) {
    if (!showForFormule) return null;
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
        {view.criteria?.city || view.criteria?.intake ? (
          <p className="student-profile-complete">
            {[view.criteria.city, view.criteria.intake].filter(Boolean).join(" ")}
          </p>
        ) : null}
      </section>

      {schools.length ? (
        <section className="student-report-block">
          <h3 className="student-report-title">{t("student.matching.schools")}</h3>
          <p className="student-report-copy">
            Ces écoles proposent une année de chinois. Ouvrez une fiche pour lire les frais selon la période, les conditions d'âge et de niveau, et ce qui correspond à votre demande.
          </p>
          <div className="student-uni-full-list">
            {schools.map((school: School) => {
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
