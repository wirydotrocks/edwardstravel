import { NextResponse } from "next/server";
import { tatPostToPublicListPost } from "@/lib/tat-public-list";
import { fetchBlogPosts } from "@/lib/tat-api";

export const runtime = "nodejs";
export const revalidate = 86400;

/** TAT list: `GET …/post?type=Blogs&page_size=200&order=created_at desc` (Basic `agency` + `TAT_API_TOKEN`). */
export async function GET() {
  try {
    const posts = await fetchBlogPosts();
    const items = posts.map(tatPostToPublicListPost);
    return NextResponse.json(
      { ok: true, items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load blog posts.";
    return NextResponse.json(
      { ok: false, message },
      { status: 502 },
    );
  }
}
