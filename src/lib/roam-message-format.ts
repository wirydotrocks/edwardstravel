export const ROAM_SUMMARY_DELIMITER = "---SUMMARY---";

export type ParsedRoamReply = {
  ideas: string[];
  summary: string[];
};

/** Split a Roam assistant reply into idea paragraphs and a recap list. */
export function parseRoamAssistantReply(text: string): ParsedRoamReply {
  const delimiterIndex = text.indexOf(ROAM_SUMMARY_DELIMITER);
  const body =
    delimiterIndex === -1 ? text : text.slice(0, delimiterIndex);
  const summaryRaw =
    delimiterIndex === -1 ? "" : text.slice(delimiterIndex + ROAM_SUMMARY_DELIMITER.length);

  const ideas = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const summary = summaryRaw
    .split(/\n/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  return { ideas, summary };
}
