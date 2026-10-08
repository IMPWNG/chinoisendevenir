"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import StudentArrivalGuide from "../components/StudentArrivalGuide";
import { useSiteI18n } from "../context/SiteI18nContext";
import { getStudentSpaceGuide } from "../lib/studentSpaceGuide";

function Screen({
  caption,
  example,
  children,
}: {
  caption: string;
  example: string;
  children: ReactNode;
}) {
  return (
    <figure className="guide-screen">
      <div className="guide-screen-chrome" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>{example}</em>
      </div>
      <div className="guide-screen-body">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="landing-form-group">
      <span className="guide-label">{label}</span>
      <div className="guide-fake-input">{value}</div>
    </div>
  );
}

function AccountScreen() {
  const { t } = useSiteI18n();
  return (
    <div className="student-card">
      <div className="auth-tabs">
        <span className="auth-tab">{t("student.login")}</span>
        <span className="auth-tab is-active">{t("student.register")}</span>
      </div>
      <FakeField label={t("form.email")} value="amina@email.com" />
      <FakeField label={t("student.password")} value="••••••••" />
      <FakeField label={t("student.confirmPassword")} value="••••••••" />
      <span className="landing-btn landing-btn-primary">{t("student.createAccount")}</span>
    </div>
  );
}

function InfoScreen() {
  const { t } = useSiteI18n();
  return (
    <div className="student-card">
      <h3 className="card-title">{t("student.infoTitle")}</h3>
      <div className="landing-form-row">
        <FakeField label={t("form.firstname")} value="Amina" />
        <FakeField label={t("form.lastname")} value="Diallo" />
      </div>
      <div className="landing-form-row">
        <FakeField label={t("form.email")} value="amina@email.com" />
        <FakeField label={t("form.phone")} value="+221 77 000 00 00" />
      </div>
      <div className="landing-form-row">
        <FakeField label={t("form.level")} value={t("form.diplomas.licence")} />
        <FakeField label={t("form.field")} value="Commerce / Business" />
      </div>
      <span className="landing-btn landing-btn-primary">{t("student.saveInfo")}</span>
    </div>
  );
}

function PaymentScreen() {
  const { t } = useSiteI18n();
  return (
    <div className="student-card">
      <div className="student-formule-banner">
        <span className="student-formule-banner-number">{t("student.formulaN", { n: 2 })}</span>
        <div>
          <p className="student-formule-banner-kicker">{t("student.yourSupport")}</p>
          <p className="student-formule-banner-title">Admission universitaire</p>
          <p className="student-formule-banner-price">1 700 €</p>
        </div>
      </div>
      <h3 className="card-title">{t("student.payTitle")}</h3>
      <div className="student-pay-grid">
        <div className="student-pay-box is-paid">
          <span>{t("student.payPaid")}</span>
          <strong>680 €</strong>
        </div>
        <div className="student-pay-box is-left">
          <span>{t("student.payLeft")}</span>
          <strong>1 020 €</strong>
        </div>
      </div>
      <ul className="student-pay-list">
        <li>
          <span>
            <strong>{t("student.payInstallment", { n: 1 })} — 680 €</strong>
            <span className="student-pay-due">{t("student.payDue1")}</span>
          </span>
          <span className="doc-badge-ok">{t("student.payStatePaid")}</span>
        </li>
        <li>
          <span>
            <strong>{t("student.payInstallment", { n: 2 })} — 510 €</strong>
            <span className="student-pay-due">{t("student.payDue2")}</span>
          </span>
          <span className="doc-badge-missing">{t("student.payStateDue")}</span>
        </li>
        <li>
          <span>
            <strong>{t("student.payInstallment", { n: 3 })} — 510 €</strong>
            <span className="student-pay-due">{t("student.payDue3")}</span>
          </span>
          <span className="doc-badge-missing">{t("student.payStateDue")}</span>
        </li>
      </ul>
    </div>
  );
}

function ProgressScreen() {
  const { t } = useSiteI18n();
  const steps = [
    { key: "inscription", state: "student-step-done", mark: "✓ " },
    { key: "consultation", state: "student-step-done", mark: "✓ " },
    { key: "dossier", state: "student-step-current", mark: "" },
    { key: "visa", state: "", mark: "" },
  ];
  return (
    <div className="student-card">
      <h3 className="card-title">{t("student.progressTitle")}</h3>
      <p className="card-subtitle">{t("student.progressSubtitle", { current: 3, total: 4 })}</p>
      <div className="student-progress is-short">
        {steps.map((step) => (
          <div key={step.key} className={`student-step ${step.state}`}>
            <div className="student-step-label">
              {step.mark}
              {t(`student.steps.${step.key}.label`)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrientationScreen() {
  const { t, lang } = useSiteI18n();
  return (
    <div className="student-card">
      <h3 className="card-title">{t("student.matching.orientation")}</h3>
      <p className="card-subtitle">{t("student.matching.bestOptions")}</p>
      <div className="doc-row doc-received">
        <div className="doc-row-main">
          <div className="doc-row-title">
            <span>🎓</span>
            {lang === "en"
              ? "Sample university — Shanghai"
              : "Université de démonstration — Shanghai"}
            <span className="doc-badge-ok">{t("student.matching.bestFit")}</span>
          </div>
          <p className="doc-row-desc">
            {lang === "en"
              ? "A short note on fit, fees, and what to prepare. Read only."
              : "Une note courte sur l'adéquation, les frais et les pièces à préparer. Lecture seule."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DocsScreen() {
  const { t } = useSiteI18n();
  return (
    <div className="student-card">
      <h3 className="card-title">{t("student.docsTitle")}</h3>
      <div className="doc-list">
        <div className="doc-row doc-received">
          <div className="doc-row-main">
            <div className="doc-row-title">
              <span>📘</span>
              {t("student.docsCatalog.passeport.label")}
              <span className="doc-badge-ok">{t("student.received")}</span>
            </div>
            <p className="doc-row-file">
              {t("student.currentFile")} <strong>passeport.pdf</strong>
            </p>
          </div>
          <span className="landing-btn landing-btn-secondary">{t("student.download")}</span>
        </div>
        <div className="doc-row doc-missing">
          <div className="doc-row-main">
            <div className="doc-row-title">
              <span>📄</span>
              {t("student.docsCatalog.high_school_diploma.label")}
              <span className="doc-badge-missing">{t("student.missing")}</span>
            </div>
          </div>
          <span className="landing-btn landing-btn-primary">{t("student.send")}</span>
        </div>
      </div>
    </div>
  );
}

function VisaScreen() {
  const { dict } = useSiteI18n();
  const guide = dict.student.visaGuide;
  return (
    <div className="student-card">
      <h3 className="card-title">{guide.title}</h3>
      <ul className="doc-visa-types">
        {guide.types.map((type) => (
          <li key={type.name}>
            <strong>{type.name}</strong> : {type.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

const SCREENS: Record<string, () => ReactNode> = {
  compte: AccountScreen,
  informations: InfoScreen,
  formule: PaymentScreen,
  avancement: ProgressScreen,
  orientation: OrientationScreen,
  documents: DocsScreen,
  visa: VisaScreen,
};

export default function StudentGuidePage() {
  const { lang } = useSiteI18n();
  const guide = getStudentSpaceGuide(lang);

  return (
    <div className="app app-page-fill">
      <Navigation />
      <section className="landing-form-section">
        <div className="container">
          <span className="landing-hero-badge">{guide.badge}</span>
          <h1 className="landing-section-title is-left">{guide.title}</h1>
          <p className="landing-section-subtitle is-left">{guide.intro}</p>
          <p className="guide-login-link">
            <Link href="/espace-etudiant/connexion" className="landing-btn landing-btn-primary">
              {lang === "en" ? "Open the student space" : "Ouvrir l'espace étudiant"}
            </Link>
          </p>
          <nav className="guide-toc" aria-label={guide.tocLabel}>
            {guide.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
            <a href="#arrivee">{guide.arrivalTitle}</a>
          </nav>

          {guide.sections.map((section) => {
            const Preview = SCREENS[section.id];
            return (
              <article key={section.id} id={section.id} className="guide-block">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {Preview ? (
                  <Screen caption={section.caption} example={guide.example}>
                    <Preview />
                  </Screen>
                ) : null}
              </article>
            );
          })}

          <StudentArrivalGuide />
        </div>
      </section>
      <Footer />
    </div>
  );
}
