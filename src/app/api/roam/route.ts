import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getClientIp } from "@/lib/get-client-ip";
import { rateLimitMulti } from "@/lib/rate-limit";
import { ROAM_SYSTEM_PROMPT } from "@/lib/roam-prompt";
import {
  assertSameOrigin,
  ROAM_LIMITS,
  ROAM_RATE_LIMIT,
  validateRoamMessages,
} from "@/lib/roam-request";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(message: string, status: number, extra?: HeadersInit) {
  return Response.json({ error: message }, { status, headers: extra });
}

export async function POST(req: Request) {
  if (!assertSameOrigin(req)) {
    return jsonError("Forbidden.", 403);
  }

  const ip = getClientIp(req);
  const rate = rateLimitMulti(`roam:${ip}`, [
    { limit: ROAM_RATE_LIMIT.perMinute, windowMs: 60_000 },
    { limit: ROAM_RATE_LIMIT.perHour, windowMs: 3_600_000 },
  ]);

  if (!rate.ok) {
    return jsonError("Too many requests. Please wait and try again.", 429, {
      "Retry-After": String(rate.retryAfterSec),
    });
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("Roam is not available right now.", 503);
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > ROAM_LIMITS.maxBodyBytes) {
    return jsonError("Request is too large.", 413);
  }

  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    messages = body.messages ?? [];
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const validated = validateRoamMessages(messages);
  if (!validated.ok) {
    return jsonError(validated.error, 400);
  }

  const modelId =
    process.env.ROAM_GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const result = streamText({
    model: google(modelId),
    system: ROAM_SYSTEM_PROMPT,
    messages: await convertToModelMessages(validated.messages),
    maxOutputTokens: ROAM_LIMITS.maxOutputTokens,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}

export function GET() {
  return jsonError("Method not allowed.", 405);
}
