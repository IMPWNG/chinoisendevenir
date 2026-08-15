const Stats = ({ t }) => {
  const stats = [
    { value: "250+", label: t.stats_students },
    { value: "20+", label: t.stats_universities },
    { value: "95%", label: t.stats_success_rate },
    { value: "2+", label: t.stats_years },
  ];

  return (
    <section className="landing-stats">
      <div className="landing-stats-grid">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="landing-stat-value">{s.value}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
