import { unstable_cache } from "next/cache";
import Parser from "rss-parser";
import { maxQualityFeedImageUrl } from "@/lib/feed-image-url";

/** Default matches the edwardstraveltour.com RSS. Override via EDWARDS_RSS_URL. */
export const EDWARDS_RSS_URL =
  process.env.EDWARDS_RSS_URL ?? "https://www.edwardstraveltour.com/rss";

export type EdwardsRssItem = {
  slug: string;
  guid: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
  /** ISO 8601 timestamp when the feed provides a valid pub date */
  publishedAt: string | null;
  snippet: string;
  /** Raw HTML from the feed item (sanitized before render) */
  contentHtml: string;
};

type ItemWithImage = Parser.Item & {
  image?: { url?: string | string[] };
};

const parser = new Parser({
  customFields: {
    item: ["image", "category"],
  },
});

/** Parse RSS item date; `rss-parser` sets `isoDate` when `pubDate` is valid. */
function parseItemPublishedAt(raw: Parser.Item): string | null {
  if (raw.isoDate) {
    const t = Date.parse(raw.isoDate);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  if (raw.pubDate) {
    const t = Date.parse(raw.pubDate);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  return null;
}

/** Display date for blog UI (e.g. &quot;April 2, 2026&quot;) */
export function formatRssPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function firstUrlFromImageField(
  image: ItemWithImage["image"],
): string | null {
  if (!image?.url) return null;
  const u = image.url;
  const s = Array.isArray(u) ? u[0] : u;
  return typeof s === "string" && s.startsWith("http") ? s : null;
}

function firstImgFromHtml(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugFromPermalink(link: string): string {
  try {
    const u = new URL(link);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last && last.length > 0 ? last : "post";
  } catch {
    return "post";
  }
}

function snippetFromItem(item: Parser.Item): string {
  const encoded = (item as Parser.Item & { "content:encoded"?: string })[
    "content:encoded"
  ];
  const raw =
    item.contentSnippet?.trim() ||
    stripHtml(item.content || encoded || "") ||
    "";
  if (raw.length <= 240) return raw;
  return `${raw.slice(0, 237).trim()}…`;
}

function normalizeItem(raw: Parser.Item): EdwardsRssItem {
  const ext = raw as ItemWithImage;
  const encoded = (raw as Parser.Item & { "content:encoded"?: string })[
    "content:encoded"
  ];
  const descHtml = raw.content || encoded || "";
  const permalink = raw.link?.trim() || "#";

  let imageUrl =
    firstUrlFromImageField(ext.image) ||
    firstImgFromHtml(descHtml) ||
    null;
  if (imageUrl) {
    imageUrl = maxQualityFeedImageUrl(imageUrl);
  }

  const guid =
    typeof raw.guid === "string"
      ? raw.guid
      : raw.guid && typeof raw.guid === "object" && "value" in raw.guid
        ? String((raw.guid as { value?: string }).value)
        : permalink || raw.title || "";

  const cat = raw.categories?.[0] ?? (raw as { category?: string }).category;
  const category =
    typeof cat === "string" && cat.trim() ? cat.trim() : null;

  return {
    slug: slugFromPermalink(permalink),
    guid,
    title: raw.title?.trim() || "Untitled",
    imageUrl,
    category,
    publishedAt: parseItemPublishedAt(raw),
    snippet: snippetFromItem(raw),
    contentHtml: descHtml,
  };
}

/**
 * Fetch RSS via `fetch` + `parseString` so we never hit Node&apos;s deprecated `url.parse()`
 * inside `rss-parser`&apos;s `parseURL` implementation (DEP0169).
 */
async function fetchEdwardsRssItems(): Promise<EdwardsRssItem[]> {
  const res = await fetch(EDWARDS_RSS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EdwardsTravel/1.0)",
      Accept: "*/*",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`RSS request failed (${res.status})`);
  }
  const xml = await res.text();
  const feed = await parser.parseString(xml);
  const rawItems = feed.items ?? [];

  const seenUrl = new Set<string>();
  const seenSlug = new Set<string>();
  const deduped: EdwardsRssItem[] = [];

  for (const raw of rawItems) {
    const permalink = raw.link?.trim() || "";
    const guidStr =
      typeof raw.guid === "string"
        ? raw.guid
        : raw.guid &&
            typeof raw.guid === "object" &&
            "value" in raw.guid
          ? String((raw.guid as { value?: string }).value)
          : "";
    const urlKey = permalink || guidStr;
    if (urlKey && seenUrl.has(urlKey)) continue;

    const row = normalizeItem(raw);
    if (seenSlug.has(row.slug)) continue;

    if (urlKey) seenUrl.add(urlKey);
    seenSlug.add(row.slug);
    deduped.push(row);
  }

  return deduped;
}

export const getEdwardsRssItems = unstable_cache(
  fetchEdwardsRssItems,
  ["edwards-rss-items"],
  { revalidate: 300 },
);

export async function getEdwardsRssItemBySlug(
  slug: string,
): Promise<EdwardsRssItem | undefined> {
  const items = await getEdwardsRssItems();
  return items.find((i) => i.slug === slug);
}

export type RssLoadState =
  | { ok: true; items: EdwardsRssItem[] }
  | { ok: false; message: string };

export async function loadEdwardsRssSafe(): Promise<RssLoadState> {
  try {
    const items = await getEdwardsRssItems();
    return { ok: true, items };
  } catch (e) {
    console.error("[edwards-rss]", e);
    return {
      ok: false,
      message:
        e instanceof Error ? e.message : "Unable to load stories from the feed.",
    };
  }
}
