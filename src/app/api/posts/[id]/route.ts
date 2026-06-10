import { NextResponse } from "next/server";
import { fetchPostById } from "@/lib/tat-api";

export const runtime = "nodejs";
export const revalidate = 86400;

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteProps) {
  try {
    const { id } = await params;
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid post id." },
        { status: 400 },
      );
    }
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
