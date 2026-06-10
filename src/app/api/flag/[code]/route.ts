import { NextRequest, NextResponse } from "next/server";
import { snapFlagcdnWidth } from "@/lib/country-flags";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimitMulti } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const ip = getClientIp(request);
  const rate = rateLimitMulti(`flag:${ip}`, [
    { limit: 120, windowMs: 60_000 },
    { limit: 2_000, windowMs: 3_600_000 },
  ]);

  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  const { code } = await context.params;
  const alpha2 = code.toLowerCase();
  if (!/^([a-z]{2}|xk)$/.test(alpha2)) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  const width = snapFlagcdnWidth(
    Number(request.nextUrl.searchParams.get("w") ?? 80),
  );
  const upstream = await fetch(`https://flagcdn.com/w${width}/${alpha2}.png`);

  if (!upstream.ok) {
    return NextResponse.json({ error: "Flag not found" }, { status: upstream.status });
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
