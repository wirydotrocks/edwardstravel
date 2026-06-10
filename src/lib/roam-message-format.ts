export const ROAM_SUMMARY_DELIMITER = "---SUMMARY---";
export const ROAM_PLAN_DELIMITER = "---PLAN---";

export type RoamPlanCta = {
  destination: string;
  notes?: string;
};

export type ParsedRoamReply = {
  ideas: string[];
  summary: string[];
  planCta: RoamPlanCta | null;
  /** True when streaming finished but recap section is missing. */
  looksIncomplete: boolean;
};

function endsMidSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return !/[.!?]"?$/.test(trimmed);
}

function parsePlanSection(raw: string): RoamPlanCta | null {
  const lines = raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  const [destination, ...noteLines] = lines;
  if (!destination) return null;
  const notes = noteLines.join("\n").trim();
  return notes ? { destination, notes } : { destination };
}

export function buildPlanTripContactHref(plan: RoamPlanCta): string {
  const params = new URLSearchParams({
    topic: "plan-trip",
    destination: plan.destination,
  });
  if (plan.notes?.trim()) {
    params.set("notes", plan.notes.trim());
  }
  return `/contact?${params.toString()}`;
}

/** Split a Roam assistant reply into idea paragraphs, recap, and optional plan CTA. */
export function parseRoamAssistantReply(text: string): ParsedRoamReply {
  const planIndex = text.indexOf(ROAM_PLAN_DELIMITER);
  const visibleText =
    planIndex === -1 ? text : text.slice(0, planIndex);
  const planRaw =
    planIndex === -1 ? "" : text.slice(planIndex + ROAM_PLAN_DELIMITER.length);
  const planCta = parsePlanSection(planRaw);

  const delimiterIndex = visibleText.indexOf(ROAM_SUMMARY_DELIMITER);
  const body =
    delimiterIndex === -1 ? visibleText : visibleText.slice(0, delimiterIndex);
  const summaryRaw =
    delimiterIndex === -1
      ? ""
      : visibleText.slice(delimiterIndex + ROAM_SUMMARY_DELIMITER.length);

  const ideas = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const summary = summaryRaw
    .split(/\n/)
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

  const lastBlock =
    summary.length > 0 ? summary[summary.length - 1] : ideas[ideas.length - 1] ?? "";
  const looksIncomplete =
    delimiterIndex === -1
      ? ideas.length > 0 && endsMidSentence(lastBlock)
      : summary.length === 0 && endsMidSentence(body.trim());

  return { ideas, summary, planCta, looksIncomplete };
}
