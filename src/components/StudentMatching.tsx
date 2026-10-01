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

const CRITERION_HELP: Record<string, string> = {
  langue:
    "On compare votre chinois ou votre anglais au seuil publié pour ce cursus. Un écart signifie qu'un test plus élevé, ou une année de langue, sera probablement demandé.",
  academique:
    "On compare le diplôme et le domaine de votre dossier au niveau visé. Un parcours proche peut quand même demander un complément.",
  financier:
    "On compare le budget indiqué aux frais de scolarité, de logement et de vie qui sont connus. Ce n'est pas un refus : c'est une lecture des montants publiés.",
  bourse:
    "On indique si des bourses sont mentionnées pour ce besoin de financement. Aucune n'est attribuée automatiquement.",
  age: "On compare votre âge à la limite publiée pour ce niveau d'études.",
  localisation:
    "On regarde si la ville figure dans votre dossier. Sans ville de préférence, ce point ne favorise ni ne pénalise l'établissement.",
  motivation:
    "On lit la clarté du projet écrit, pas la qualité de l'ensemble du dossier.",
};

const DOC_HELP: Record<string, string> = {
  passeport: "Page d'identité du passeport, encore valable plusieurs mois après le dépôt.",
  photo: "Photo d'identité récente, au format demandé par l'université.",
  high_school_diploma: "Diplôme de fin d'études secondaires, avec traduction si le document n'est pas en français, anglais ou chinois.",
  bachelor_degree: "Diplôme de licence, avec traduction si besoin.",
  master_degree: "Diplôme de master, avec traduction si besoin.",
  diplome: "Dernier diplôme obtenu, avec traduction si besoin.",
  transcripts: "Relevés de notes du dernier cursus, avec traduction si besoin.",
  hsk: "Certificat HSK, ou le test de chinois demandé par le programme.",
  ielts_or_toefl: "IELTS ou TOEFL, si le programme est enseigné en anglais.",
  csca: "Évaluation scolaire chinoise, souvent demandée pour une licence.",
  formulaire_medical: "Formulaire d'examen médical pour étrangers, daté et tamponné.",
  casier_judiciaire: "Extrait de casier judiciaire récent.",
  motivation: "Lettre qui explique le projet d'études, le choix de la Chine et de cette université.",
  recommendation: "Lettres de professeurs ou d'employeurs, selon ce que l'université demande.",
  video: "Présentation filmée, si l'université la demande.",
  financial_proof: "Justificatif que le budget annoncé peut être mobilisé.",
  application_form: "Formulaire de candidature de l'université, complété.",
  resume: "CV à jour, en anglais ou en chinois selon la consigne.",
};

function splitLabeled(line: string) {
  const index = line.indexOf(":");
  if (index <= 0 || index > 42) return { label: "", text: line };
  return {
    label: line.slice(0, index).trim(),
    text: line.slice(index + 1).trim(),
  };
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

      {open ? (
        <div className="student-uni-full-body">
          {uni.readings?.length ? (
            <section>
              <p className="student-uni-kicker">Lecture du dossier</p>
              <p className="student-block-intro">
                Chaque ligne compare une information de votre dossier à ce que cette université publie. Ce n'est pas une chance d'admission.
              </p>
              <div className="student-readings">
                {uni.readings.map((row) => (
                  <div key={row.key}>
                    <p className="student-reading-label">{row.label}</p>
                    <p>{row.text}</p>
                    {CRITERION_HELP[row.key] ? (
                      <p className="student-reading-help">{CRITERION_HELP[row.key]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {uni.strengths?.length ? (
            <section>
              <p className="student-uni-kicker">{t("student.matching.strengths")}</p>
              <p className="student-block-intro">
                Ce qui, dans votre dossier, va dans le sens de cette candidature.
              </p>
              <ul>
                {uni.strengths.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {uni.vigilance?.length ? (
            <section>
              <p className="student-uni-kicker">{t("student.matching.prepare")}</p>
              <p className="student-block-intro">
                Ce qu'il vaut mieux clarifier ou renforcer avant de déposer le dossier.
              </p>
              <ul>
                {uni.vigilance.map((line: string) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {uni.fact_lines?.length ? (
            <section>
              <p className="student-uni-kicker">Repères de l'établissement</p>
              <p className="student-block-intro">
                Montants, date et langue tels qu'ils sont publiés. Ils restent à confirmer sur le site de l'université.
              </p>
              <dl className="student-spec">
                {uni.fact_lines.map((line) => {
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
  const [openId, setOpenId] = useState<string | null>(
    () => unis[0]?.id || unis[0]?.name || null,
  );

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
          <p className="student-report-copy">
            Chaque établissement est retenu parce qu'il correspond à une partie de votre dossier. Ouvrez une fiche pour lire, critère par critère, ce qui va dans le sens de la candidature et ce qu'il reste à préparer.
          </p>
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
          <p className="student-report-copy">
            L'ordre proposé sert à décider par où commencer. La première piste est la plus proche du dossier aujourd'hui. Les suivantes restent des options, pas des admissions promises.
          </p>
          <div className="student-spec">
            <div>
              <dt>Par où commencer</dt>
              <dd>{report.options_synthesis.why_top}</dd>
            </div>
            <div>
              <dt>Comment répartir les candidatures</dt>
              <dd>{report.options_synthesis.application_mix}</dd>
            </div>
          </div>
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
          <p className="student-report-copy">
            Ce sont les pièces demandées par les universités retenues. Une pièce n'est écrite qu'une fois, sous la première université qui la demande. Dès qu'elle est déposée, le statut passe à « {t("student.matching.provided")} ».
          </p>
          {report.documents_by_university.map((group) => {
            const ready = group.documents.filter((doc) => doc.status === "fourni").length;
            return (
              <article key={group.name} className="student-doc-card">
                <header>
                  <h4>{group.name}</h4>
                  <p>
                    {ready} sur {group.documents.length} déposées
                  </p>
                </header>
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
                      <div>
                        <p>{doc.name}</p>
                        {doc.key && DOC_HELP[doc.key] ? (
                          <p className="student-doc-help">{DOC_HELP[doc.key]}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      ) : null}

      <p className="student-bilan-foot">
        {report.disclaimer || t("student.matching.disclaimer")}
      </p>
    </div>
  );
}
