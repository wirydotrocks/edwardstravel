import { NextResponse } from "next/server";
import { toTatPublicListFromRssItem } from "@/lib/tat-public-list";
import { fetchBlogRssItems } from "@/lib/rss-api";

export const runtime = "nodejs";
export const revalidate = 86400;

/** Travel Agency Tribes blog RSS (`BLOG_RSS_URL` or default). */
export async function GET() {
  const state = await fetchBlogRssItems();
  if (!state.ok) {
    return NextResponse.json(
      { ok: false, message: state.message },
      { status: 502 },
    );
  }
  const items = state.items.map((row) =>
    toTatPublicListFromRssItem({ ...row, cmsKind: "blog" }),
  );
  return NextResponse.json(
    { ok: true, items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    },
  );
}
