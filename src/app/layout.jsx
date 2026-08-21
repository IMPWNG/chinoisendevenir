import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Etudier-en-Chine",
  description:
    "Accompagnement pour étudier en Chine : orientation, admission, bourses et visa.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
