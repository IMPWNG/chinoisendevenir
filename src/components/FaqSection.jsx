export default function FaqSection({
  items,
  title = "Questions fréquentes sur les études en Chine",
}) {
  if (!items?.length) return null;

  return (
    <section className="seo-faq" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="seo-faq-title">
        {title}
      </h2>
      <div className="seo-faq-list">
        {items.map((faq) => (
          <details key={faq.question} className="seo-faq-item">
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
