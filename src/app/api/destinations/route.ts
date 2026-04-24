import { NextResponse } from "next/server";
import { fetchRssFeedItems } from "@/lib/rss-api";

const DESTINATIONS_FEED_URL =
  "https://travelagencytribes.com/rss/destinations";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  const state = await fetchRssFeedItems(DESTINATIONS_FEED_URL);
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
