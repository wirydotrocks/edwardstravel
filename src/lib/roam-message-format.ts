export const ROAM_SUMMARY_DELIMITER = "---SUMMARY---";

export type ParsedRoamReply = {
  ideas: string[];
  summary: string[];
  /** True when streaming finished but recap section is missing. */
  looksIncomplete: boolean;
};

function endsMidSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return !/[.!?]"?$/.test(trimmed);
}

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

  const lastBlock = summary.length > 0 ? summary[summary.length - 1] : ideas[ideas.length - 1] ?? "";
  const looksIncomplete =
    delimiterIndex === -1
      ? ideas.length > 0 && endsMidSentence(lastBlock)
      : summary.length === 0 && endsMidSentence(body.trim());

  return { ideas, summary, looksIncomplete };
}
