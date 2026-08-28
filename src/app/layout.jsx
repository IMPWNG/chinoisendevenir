import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, SITE, websiteJsonLd } from "@/lib/seo";
import Providers from "./providers";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default:
      "Étudier en Chine : admission, bourse et visa | Chinois en Devenir",
    template: "%s | Chinois en Devenir",
  },
  description: SITE.metaDescription,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "education",
  openGraph: {
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — accompagnement pour étudier en Chine`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [SITE.ogImage],
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
