import StudentGuidePage from "@/views/StudentGuidePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Guide de l'espace étudiant",
  description:
    "Créer un compte, suivre sa formule et ses paiements, déposer les documents, préparer le visa, puis installer WeChat, Alipay et un VPN avant le départ.",
  path: "/espace-etudiant/guide",
  index: false,
});

export default function Page() {
  return <StudentGuidePage />;
}
