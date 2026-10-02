import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/studentAuth";
import { requireFullAdmin } from "@/lib/adminRoles";
import { BLOG_POSTS, listAllPosts, parisDateString } from "@/lib/blog";
import { BLOG_DAILY_LIMIT, generateDailyBlogPost } from "@/lib/blog/generate";
import { revalidateBlog } from "@/lib/blog/revalidate";
import {
  countAiPostsOn,
  deleteStoredPost,
  isBlogTableMissing,
  listStoredPosts,
  setStoredPostLive,
} from "@/lib/blog/store";
import { asString, errorMessage, readJsonObject } from "@/lib/request";

export const maxDuration = 120;

function staticRows() {
  return listAllPosts().map((post) => ({
    id: null as string | null,
    source: "static" as const,
    live: true,
    created_at: `${post.publishedAt}T00:00:00.000Z`,
    created_by: "fichier",
    post,
  }));
}

async function catalog() {
  const stored = await listStoredPosts();
  const today = parisDateString();
  return {
    today,
    dailyLimit: BLOG_DAILY_LIMIT,
    generatedToday: await countAiPostsOn(today),
    posts: [
      ...stored.map((row) => ({
        id: row.id,
        source: "ai" as const,
        live: row.live,
        created_at: row.created_at,
        created_by: row.created_by,
        post: row.post,
      })),
      ...staticRows(),
    ],
    staticCount: BLOG_POSTS.length,
  };
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }
    return NextResponse.json({ success: true, ...(await catalog()) });
  } catch (error) {
    if (isBlogTableMissing(error)) {
      return NextResponse.json(
        { error: "Table blog_posts absente. Appliquez sql/blog-posts.sql." },
        { status: 500 },
      );
    }
    console.error("admin blog GET:", error);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }
    const result = await generateDailyBlogPost({
      force: true,
      createdBy: auth.user?.email || "admin",
    });
    if (!result.skipped) revalidateBlog(result.post.slug);
    return NextResponse.json({ success: true, ...result, ...(await catalog()) });
  } catch (error) {
    console.error("admin blog POST:", error);
    return NextResponse.json(
      { error: errorMessage(error, "Génération impossible") },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    const id = asString(body.id).trim();
    if (!id) return NextResponse.json({ error: "Article introuvable" }, { status: 400 });
    await setStoredPostLive(id, body.live !== false);
    revalidateBlog();
    return NextResponse.json({ success: true, ...(await catalog()) });
  } catch (error) {
    console.error("admin blog PATCH:", error);
    return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthenticatedAdmin(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const forbidden = requireFullAdmin(auth);
    if (forbidden) {
      return NextResponse.json(
        { error: forbidden.error },
        { status: forbidden.status },
      );
    }
    const body = await readJsonObject(request);
    if (!body) return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    const id = asString(body.id).trim();
    if (!id) return NextResponse.json({ error: "Article introuvable" }, { status: 400 });
    await deleteStoredPost(id);
    revalidateBlog();
    return NextResponse.json({ success: true, ...(await catalog()) });
  } catch (error) {
    console.error("admin blog DELETE:", error);
    return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
  }
}
