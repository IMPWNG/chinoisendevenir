import StudyFromCountryPage from "@/views/StudyFromCountryPage";
import { pageMetadata } from "@/lib/seo";
import { getStudyCountry, studyCountryPath } from "@/lib/studyFromCountries";

const country = getStudyCountry("le-benin");
if (!country) throw new Error("missing country");

export const metadata = pageMetadata({
  title: country.title,
  description: country.description,
  path: studyCountryPath(country.slug),
  type: "article",
  keywords: [country.title, "étudier en Chine", "candidature université chinoise"],
});

export default function Page() {
  return <StudyFromCountryPage slug="le-benin" />;
}
