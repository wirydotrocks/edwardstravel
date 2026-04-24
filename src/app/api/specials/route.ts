import { NextResponse } from "next/server";
import { fetchRssFeedItems } from "@/lib/rss-api";

const SPECIALS_FEED_URL =
  "https://travelclub.travelsavers.com/travelclubexclusiveFeed.aspx?ext=1&type=0&imgWidth=140&cid=253472";

export const revalidate = 86400;

export async function GET() {
  const state = await fetchRssFeedItems(SPECIALS_FEED_URL);
  if (!state.ok) {
    return NextResponse.json(
      { ok: false, message: state.message },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { ok: true, items: state.items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    },
  );
}
