const Programs = ({ t }) => {
  const programs = [
    {
      key: "programs_bachelor",
      icon: "📘",
      desc: "Formation initiale de 4 ans dans plus de 300 universités",
    },
    {
      key: "programs_master",
      icon: "📗",
      desc: "Spécialisation avancée de 2 à 3 ans",
    },
    {
      key: "programs_phd",
      icon: "📕",
      desc: "Recherche doctorale avec encadrement académique",
    },
    {
      key: "programs_language",
      icon: "🗣️",
      desc: "Immersion linguistique de 6 mois à 2 ans",
    },
  ];

  const scrollToForm = () => {
    document
      .getElementById("lead-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="programs" className="landing-programs">
      <div className="container">
        <h2 className="landing-section-title">{t.programs_title}</h2>
        <p className="landing-section-subtitle">{t.programs_subtitle}</p>

        <div className="landing-programs-grid">
          {programs.map((p) => (
            <div className="landing-program-card" key={p.key}>
              <div className="landing-program-icon">{p.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {t[p.key]}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{p.desc}</p>
              <button className="landing-btn-link" onClick={scrollToForm}>
                {t.programs_learn_more} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
