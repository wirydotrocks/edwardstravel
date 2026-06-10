import { NextResponse, type NextRequest } from "next/server";

function securityHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const isDev = process.env.NODE_ENV !== "production";

  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-DNS-Prefetch-Control", "off");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (!isDev) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' https:",
    "worker-src 'self' blob:",
  ].join("; ");

  headers.set("Content-Security-Policy", csp);

  if (request.nextUrl.pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store");
  }

  return headers;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const headers = securityHeaders(request);
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
