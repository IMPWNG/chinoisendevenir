import { getSupabaseAdmin, type AdminClient } from "../supabaseAdmin";
import type { BlogPost } from "./types";
import { isPublished, parisDateString } from "./index";

export type StoredBlogPost = {
  id: string;
  live: boolean;
  created_at: string;
  created_by: string | null;
  post: BlogPost;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function payloadToPost(payload: unknown, fallback: { slug?: string; published_at?: string } = {}): BlogPost | null {
  const row = asRecord(payload);
  const slug = String(row.slug || fallback.slug || "").trim();
  const title = String(row.title || "").trim();
  const publishedAt = String(row.publishedAt || fallback.published_at || "").trim();
  if (!slug || !title || !/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) return null;
  return {
    slug,
    title,
    description: String(row.description || ""),
    publishedAt,
    keywords: Array.isArray(row.keywords) ? row.keywords.map(String) : [],
    intro: String(row.intro || ""),
    sections: Array.isArray(row.sections) ? (row.sections as BlogPost["sections"]) : [],
    faqs: Array.isArray(row.faqs) ? (row.faqs as BlogPost["faqs"]) : [],
    internalLinks: Array.isArray(row.internalLinks)
      ? (row.internalLinks as BlogPost["internalLinks"])
      : [],
    ctaTitle: String(row.ctaTitle || ""),
    ctaSubtitle: String(row.ctaSubtitle || ""),
  };
}

function mapRow(row: Record<string, unknown>): StoredBlogPost | null {
  const post = payloadToPost(row.payload, {
    slug: String(row.slug || ""),
    published_at: String(row.published_at || ""),
  });
  if (!post || !row.id) return null;
  return {
    id: String(row.id),
    live: row.live !== false,
    created_at: String(row.created_at || ""),
    created_by: row.created_by ? String(row.created_by) : null,
    post,
  };
}

export function isBlogTableMissing(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return /blog_posts|schema cache|does not exist/i.test(message);
}

async function client(): Promise<AdminClient | null> {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function listStoredPosts(): Promise<StoredBlogPost[]> {
  try {
    const admin = await client();
    if (!admin) return [];
    const { data, error } = await admin
      .from("blog_posts")
      .select("id, slug, published_at, live, payload, created_at, created_by")
      .order("published_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data || [])
      .map((row) => mapRow(asRecord(row)))
      .filter((row): row is StoredBlogPost => Boolean(row));
  } catch (error) {
    console.warn("blog_posts list:", error);
    return [];
  }
}

export async function listLiveDbPosts(
  today: string = parisDateString(),
): Promise<BlogPost[]> {
  const rows = await listStoredPosts();
  return rows
    .filter((row) => row.live && isPublished(row.post, today))
    .map((row) => row.post);
}

export async function countAiPostsOn(day: string): Promise<number> {
  try {
    const admin = await client();
    if (!admin) return 0;
    const { count, error } = await admin
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("published_at", day);
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.warn("blog_posts count:", error);
    return 0;
  }
}

export async function insertStoredPost({
  post,
  createdBy,
}: {
  post: BlogPost;
  createdBy?: string;
}): Promise<StoredBlogPost> {
  const admin = await client();
  if (!admin) throw new Error("Variables Supabase admin manquantes");
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      slug: post.slug,
      published_at: post.publishedAt,
      live: true,
      payload: post,
      created_by: createdBy || "ai",
    })
    .select("id, slug, published_at, live, payload, created_at, created_by")
    .maybeSingle();
  if (error) throw error;
  const mapped = mapRow(asRecord(data || {}));
  if (!mapped) throw new Error("Article non enregistré");
  return mapped;
}

export async function setStoredPostLive(id: string, live: boolean) {
  const admin = await client();
  if (!admin) throw new Error("Variables Supabase admin manquantes");
  const { error } = await admin.from("blog_posts").update({ live }).eq("id", id);
  if (error) throw error;
}

export async function deleteStoredPost(id: string) {
  const admin = await client();
  if (!admin) throw new Error("Variables Supabase admin manquantes");
  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}
