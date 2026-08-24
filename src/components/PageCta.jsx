import Link from "next/link";

export default function PageCta({
  title,
  subtitle,
  cta = "Évaluer mon projet",
}) {
  return (
    <div className="mt-16 text-center bg-[#1d3557] rounded-2xl p-10">
      <h2 className="text-white text-lg font-semibold mb-2">{title}</h2>
      {subtitle ? <p className="text-white/80 mb-6">{subtitle}</p> : null}
      <Link href="/#lead-form" className="landing-btn landing-btn-accent">
        {cta}
      </Link>
    </div>
  );
}
