import BlogIndexPage from "@/views/BlogIndexPage";
import { listPublishedPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = pageMetadata({
  title: "Blog : étudier en Chine, bourses, visa et admission",
  description:
    "Guides pratiques pour étudier en Chine : admission, bourses, écoles de langue, visa étudiant, budget et erreurs à éviter. Publiés régulièrement.",
  path: "/blog",
  keywords: [
    "blog étudier en Chine",
    "bourse études Chine",
    "visa étudiant Chine",
    "école de langue Chine",
  ],
});

export default function BlogPage() {
  const posts = listPublishedPosts().slice().reverse();
  return <BlogIndexPage posts={posts} />;
}
