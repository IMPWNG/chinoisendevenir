export type BlogLink = {
  href: string;
  label: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO date YYYY-MM-DD (Europe/Paris calendar day) */
  publishedAt: string;
  keywords: string[];
  /** Lead sous le titre — pas de labels Problème/Solution/Promesse */
  intro: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
  internalLinks: BlogLink[];
  ctaTitle: string;
  ctaSubtitle: string;
};
