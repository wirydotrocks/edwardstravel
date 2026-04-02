/** Which area of the site an RSS item belongs to (partitioned from one feed). */
export type RssSection = "experiences" | "destinations" | "blog";

/**
 * Exact category label → section (keys lowercase). Extend when you add WordPress categories.
 * Checked before keyword rules.
 */
const SECTION_BY_EXACT_CATEGORY: Record<string, RssSection> = {
  "river or ocean cruises": "experiences",
  "all inclusive": "experiences",
  "culture & history": "destinations",
};

/**
 * Classify an item using its RSS categories. Each post should land in one section;
 * tune {@link SECTION_BY_EXACT_CATEGORY} or keywords if routing looks wrong.
 */
export function classifyRssSection(categories: string[]): RssSection {
  const normalized = categories.map((c) => c.trim().toLowerCase()).filter(Boolean);

  for (const c of normalized) {
    const mapped = SECTION_BY_EXACT_CATEGORY[c];
    if (mapped) return mapped;
  }

  const joined = normalized.join(" ");

  if (/\bdestinations?\b/.test(joined)) return "destinations";
  if (/\bexperiences?\b/.test(joined)) return "experiences";
  if (/\bblog\b/.test(joined)) return "blog";

  if (normalized.some((c) => c.includes("destination"))) return "destinations";
  if (
    normalized.some(
      (c) =>
        c.includes("experience") ||
        c.includes("cruise") ||
        /all[-\s]?inclusive/.test(c),
    )
  ) {
    return "experiences";
  }

  return "blog";
}
