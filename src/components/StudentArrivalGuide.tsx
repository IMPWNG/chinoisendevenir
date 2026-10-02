"use client";

import { useSiteI18n } from "../context/SiteI18nContext";
import { getStudentSpaceGuide } from "../lib/studentSpaceGuide";

export default function StudentArrivalGuide() {
  const { lang } = useSiteI18n();
  const guide = getStudentSpaceGuide(lang);

  return (
    <section className="student-card student-card-wide" id="arrivee" aria-labelledby="arrival-title">
      <h2 id="arrival-title" className="card-title">
        {guide.arrivalTitle}
      </h2>
      <p className="card-subtitle">{guide.arrivalIntro}</p>
      <ol className="arrival-steps">
        {guide.arrivalBlocks.map((block, index) => (
          <li key={block.title}>
            <span className="arrival-step-index">{index + 1}</span>
            <div>
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="student-formule-note">{guide.arrivalNote}</p>
    </section>
  );
}
