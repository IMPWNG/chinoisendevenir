import { NextResponse } from "next/server";
import { generateDailyBlogPost } from "@/lib/blog/generate";
import { revalidateBlog } from "@/lib/blog/revalidate";

export const maxDuration = 120;

function isAuthorizedCron(request: Request) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

async function runCron(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await generateDailyBlogPost({ createdBy: "cron" });
    if (!result.skipped) revalidateBlog(result.post.slug);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("blog-generate cron:", error);
    return NextResponse.json(
      { success: false, error: "Génération impossible" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return runCron(request);
}

export async function POST(request: Request) {
  return runCron(request);
}
