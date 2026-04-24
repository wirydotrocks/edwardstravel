import { NextResponse } from "next/server";
import { tatPostToPublicListPost } from "@/lib/tat-public-list";
import { fetchExperiencePosts } from "@/lib/tat-api";

export const runtime = "nodejs";
export const revalidate = 86400;

/** TAT list: `GET …/post?type=Products&page_size=200&order=created_at desc`. */
export async function GET() {
  try {
    const posts = await fetchExperiencePosts();
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
      error instanceof Error ? error.message : "Unable to load experiences.";
    return NextResponse.json(
      { ok: false, message },
      { status: 502 },
    );
  }
}
