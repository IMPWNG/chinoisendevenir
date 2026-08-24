import JsonLd from "@/components/JsonLd";
import {
  organizationJsonLd,
  SEO_KEYWORDS,
  SITE,
  websiteJsonLd,
} from "@/lib/seo";
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Étudier en Chine : admission, bourse et visa | Chinois en Devenir",
    template: "%s | Chinois en Devenir",
  },
  description: SITE.description,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "education",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>",
  },
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
