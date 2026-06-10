import type { UIMessage } from "ai";

export const ROAM_LIMITS = {
  maxBodyBytes: 256_000,
  maxMessages: 48,
  maxTextPartChars: 2_000,
  maxTotalInputChars: 32_000,
  maxOutputTokens: 6_144,
} as const;

export const ROAM_RATE_LIMIT = {
  perMinute: 12,
  perHour: 80,
} as const;

function messageText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function validateRoamMessages(
  messages: UIMessage[],
): { ok: true; messages: UIMessage[] } | { ok: false; error: string } {
  if (!Array.isArray(messages)) {
    return { ok: false, error: "Invalid messages." };
  }

  if (messages.length === 0) {
    return { ok: false, error: "At least one message is required." };
  }

  if (messages.length > ROAM_LIMITS.maxMessages) {
    return { ok: false, error: "Conversation is too long. Start a fresh chat." };
  }

  let totalChars = 0;

  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") {
      return { ok: false, error: "Invalid message role." };
    }

    const text = messageText(message);
    if (text.length > ROAM_LIMITS.maxTextPartChars) {
      return { ok: false, error: "A message is too long." };
    }

    totalChars += text.length;
    if (totalChars > ROAM_LIMITS.maxTotalInputChars) {
      return {
        ok: false,
        error: "Conversation is too long. Start a fresh chat.",
      };
    }
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return { ok: false, error: "Send a user message to continue." };
  }

  const lastText = messageText(last).trim();
  if (!lastText) {
    return { ok: false, error: "Message cannot be empty." };
  }

  return { ok: true, messages };
}
