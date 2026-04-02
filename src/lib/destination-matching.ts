import {
  COUNTRIES,
  type Country,
  type Subdivision,
} from "@/data/destination-world";
import type { EdwardsRssItem } from "@/lib/edwards-rss";
import { classifyRssSection } from "@/lib/rss-section";

export type LocationMatch = {
  countrySlug: string;
  countryName: string;
  subdivisionSlug?: string;
  subdivisionName?: string;
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True if `term` appears in `hay` (lowercase). Multi-word terms use substring; single words use word boundaries. */
function termMatches(hay: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return false;
  if (t.includes(" ")) {
    return hay.includes(t);
  }
  const re = new RegExp(`\\b${escapeRegex(t)}\\b`, "i");
  return re.test(hay);
}

export function postHaystack(item: EdwardsRssItem): string {
  return [item.title, ...item.categories, item.snippet ?? ""]
    .join(" ")
    .toLowerCase();
}

function subdivisionMatches(sub: Subdivision, hay: string): boolean {
  return sub.matchTerms.some((term) => termMatches(hay, term));
}

function countryMatchesCountryTerms(country: Country, hay: string): boolean {
  return country.matchTerms.some((term) => termMatches(hay, term));
}

/**
 * All geographic hits for an RSS item (subdivision-level when a subdivision matches,
 * otherwise country-level only when the country matches but no subdivision did).
 */
export function findLocationMatches(item: EdwardsRssItem): LocationMatch[] {
  const hay = postHaystack(item);
  const out: LocationMatch[] = [];
  const seen = new Set<string>();

  for (const country of COUNTRIES) {
    let anySub = false;
    const subsSorted = [...country.subdivisions].sort(
      (a, b) =>
        Math.max(...b.matchTerms.map((t) => t.length)) -
        Math.max(...a.matchTerms.map((t) => t.length)),
    );
    for (const sub of subsSorted) {
      if (subdivisionMatches(sub, hay)) {
        const key = `${country.slug}:${sub.slug}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({
            countrySlug: country.slug,
            countryName: country.name,
            subdivisionSlug: sub.slug,
            subdivisionName: sub.name,
          });
        }
        anySub = true;
      }
    }
    if (!anySub && countryMatchesCountryTerms(country, hay)) {
      const key = `${country.slug}:`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({
          countrySlug: country.slug,
          countryName: country.name,
        });
      }
    }
  }
  return out;
}

/** Feed items that belong on the destination hub: “destinations” section and/or any location match. */
export function itemQualifiesForDestinationHub(item: EdwardsRssItem): boolean {
  if (classifyRssSection(item.categories) === "destinations") return true;
  return findLocationMatches(item).length > 0;
}

export function filterDestinationHubItems(
  items: EdwardsRssItem[],
): EdwardsRssItem[] {
  return items.filter(itemQualifiesForDestinationHub);
}

function matchesCountry(item: EdwardsRssItem, country: Country): boolean {
  return findLocationMatches(item).some((m) => m.countrySlug === country.slug);
}

export function itemsForCountry(
  items: EdwardsRssItem[],
  country: Country,
): EdwardsRssItem[] {
  return items.filter((i) => matchesCountry(i, country));
}

export function itemsForSubdivision(
  items: EdwardsRssItem[],
  country: Country,
  sub: Subdivision,
): EdwardsRssItem[] {
  const hay = (item: EdwardsRssItem) => postHaystack(item);
  return items.filter((item) => {
    if (!matchesCountry(item, country)) return false;
    return subdivisionMatches(sub, hay(item));
  });
}

export function sortItemsByPublishedDesc(items: EdwardsRssItem[]): void {
  items.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}
