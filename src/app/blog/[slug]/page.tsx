import { notFound } from "next/navigation";
import BlogArticlePage from "@/views/BlogArticlePage";
import {
  getPublishedPostBySlug,
  listPublishedPosts,
} from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Params = { slug: string };

export function generateStaticParams() {
  return listPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) {
    return pageMetadata({
      title: "Article introuvable",
      description: "Cet article n’est pas encore publié.",
      path: `/blog/${slug}`,
      index: false,
    });
  }

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: "article",
  });
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = listPublishedPosts()
    .filter((item) => item.slug !== post.slug)
    .slice()
    .reverse()
    .slice(0, 3);

  return <BlogArticlePage post={post} related={related} />;
}
