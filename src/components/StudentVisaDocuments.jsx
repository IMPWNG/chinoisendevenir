"use client";

import { useSiteI18n } from "../context/SiteI18nContext";

export default function StudentVisaDocuments({ standalone = false }) {
  const { dict } = useSiteI18n();
  const guide = dict.student.visaGuide;

  return (
    <div className={`doc-visa${standalone ? " is-standalone" : ""}`}>
      <h3 className="doc-visa-title">
        <span>✈️</span>
        {guide.title}
      </h3>
      <p className="doc-visa-intro">{guide.intro}</p>
      <ul className="doc-visa-types">
        {guide.types.map((type) => (
          <li key={type.name}>
            <strong>{type.name}</strong> : {type.description}
          </li>
        ))}
      </ul>
      <p className="doc-visa-docs-title">{guide.documentsTitle}</p>
      <ol className="doc-visa-docs">
        {guide.documents.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <p className="doc-visa-note">{guide.note}</p>
    </div>
  );
}
