import { NextResponse } from "next/server";
import { fetchPostById } from "@/lib/tat-api";

export const runtime = "nodejs";
export const revalidate = 86400;

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    const item = await fetchPostById(id);
    return NextResponse.json(
      { ok: true, item },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load post content.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
