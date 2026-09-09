import NotFoundContent from "@/components/NotFoundContent";

export const metadata = {
  title: "Page introuvable",
  description:
    "Cette page n'existe pas. Consultez nos guides pour étudier en Chine : admission, bourses, visa étudiant, ou contactez-nous.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
