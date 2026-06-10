import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { ROAM_SYSTEM_PROMPT } from "@/lib/roam-prompt";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Roam is not available right now. Add GOOGLE_GENERATIVE_AI_API_KEY on the server to enable chat.",
      },
      { status: 503 },
    );
  }

  let messages: UIMessage[];
  try {
    const body = (await req.json()) as { messages?: UIMessage[] };
    messages = body.messages ?? [];
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const modelId =
    process.env.ROAM_GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const result = streamText({
    model: google(modelId),
    system: ROAM_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 8192,
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
