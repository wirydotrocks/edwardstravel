import type { UIMessage } from "ai";
import { parseRoamAssistantReply } from "@/lib/roam-message-format";
import { findLastCountryInText } from "@/lib/world-country-names";

function visibleText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * Best destination guess from chat history up to an index (inclusive).
 * Prefers Roam ---PLAN--- blocks, then country mentions in messages, then URL seed.
 */
export function resolveDestinationUpTo(
  messages: UIMessage[],
  endIndex: number,
  seedCountry?: string,
): string | null {
  let destination = seedCountry?.trim() || null;

  for (let i = 0; i <= endIndex; i++) {
    const message = messages[i];
    const text = visibleText(message);
    if (!text) continue;

    if (message.role === "assistant") {
      const { planCta } = parseRoamAssistantReply(text);
      if (planCta?.destination) {
        destination = planCta.destination;
      }
    }

    const mentioned = findLastCountryInText(text);
    if (mentioned) {
      destination = mentioned;
    }
  }

  return destination;
}

export function resolveThreadDestination(
  messages: UIMessage[],
  seedCountry?: string,
): string | null {
  if (messages.length === 0) return seedCountry?.trim() || null;
  return resolveDestinationUpTo(messages, messages.length - 1, seedCountry);
}

export function planNotesFromMessage(text: string): string | undefined {
  const { planCta } = parseRoamAssistantReply(text);
  return planCta?.notes?.trim() || undefined;
}
