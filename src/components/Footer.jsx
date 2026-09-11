"use client";

import Link from "next/link";
import { SITE } from "@/lib/seo";
import { useAuth } from "../context/AuthContext";
import { useSiteI18n } from "../context/SiteI18nContext";

const WHATSAPP_HREF = `https://wa.me/${SITE.whatsapp.replace(/\D/g, "")}`;
const PHONE_HREF = `tel:${SITE.phone.replace(/\s/g, "")}`;

const Footer = () => {
  const { t } = useSiteI18n();
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const studentHref = user ? "/espace-etudiant" : "/espace-etudiant/connexion";

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <p className="landing-footer-name">🎓 {SITE.name}</p>
            <p>{t("footer.description")}</p>
          </div>
          <div className="landing-footer-col">
            <p className="landing-footer-heading">{t("footer.colStudy")}</p>
            <Link href="/etudier-en-chine">{t("footer.guide")}</Link>
            <Link href="/ecoles-de-langue-chine">{t("footer.languageSchools")}</Link>
            <Link href="/visa-etudiant-chine">{t("footer.studentVisa")}</Link>
            <Link href="/bourses">{t("footer.scholarships")}</Link>
            <Link href="/processus">{t("footer.admissionProcess")}</Link>
            <Link href="/faq">{t("footer.faq")}</Link>
          </div>
          <div className="landing-footer-col">
            <p className="landing-footer-heading">{t("footer.colSupport")}</p>
            <Link href="/tarifs">{t("footer.pricing")}</Link>
            <Link href="/#lead-form">{t("footer.evaluate")}</Link>
            <Link href={studentHref}>{t("footer.studentSpace")}</Link>
            <Link href="/politique-confidentialite">{t("footer.privacy")}</Link>
            <Link href="/conditions-utilisation">{t("footer.terms")}</Link>
          </div>
          <div className="landing-footer-col landing-footer-contact">
            <p className="landing-footer-heading">{t("footer.colContact")}</p>
            <p className="landing-footer-contact-text">{t("footer.contactLead")}</p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={PHONE_HREF}>{SITE.phone}</a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
              WhatsApp {SITE.whatsapp}
            </a>
            <Link href="/contact">{t("footer.contactPage")}</Link>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>
            © {year} {SITE.name} — {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
