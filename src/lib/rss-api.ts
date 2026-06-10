import { XMLParser } from "fast-xml-parser";
import { maxQualityFeedImageUrl } from "@/lib/feed-image-url";
import { slugFromPermalink, type EdwardsRssItem } from "@/lib/edwards-rss";

type ParsedItem = {
  title?: string;
  link?: string;
  guid?: string | { "#text"?: string };
  pubDate?: string;
  description?: string;
  category?: string | string[];
};

export type FeedApiState =
  | { ok: true; items: EdwardsRssItem[] }
  | { ok: false; message: string };

/** Travel Agency Tribes blog RSS (override with `BLOG_RSS_URL`). */
export const BLOG_RSS_URL =
  process.env.BLOG_RSS_URL?.trim() ||
  "https://www.travelagencytribes.com/rss/blog";

/** Blog list for this site — public RSS, no TAT token. */
export async function fetchBlogRssItems(): Promise<FeedApiState> {
  return fetchRssFeedItems(BLOG_RSS_URL);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImgFromHtml(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function snippetFromHtml(html: string): string {
  const text = stripHtml(String(html || ""));
  if (text.length <= 240) return text;
  return `${text.slice(0, 237).trim()}...`;
}

function parsePublishedAt(pubDate?: string): string | null {
  if (!pubDate) return null;
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function normalizeCategories(raw: ParsedItem["category"]): string[] {
  return asArray(raw)
    .map((c) => String(c).trim())
    .filter(Boolean);
}

function guidFromRaw(raw: ParsedItem, permalink: string): string {
  if (typeof raw.guid === "string" && raw.guid.trim()) return raw.guid.trim();
  if (
    raw.guid &&
    typeof raw.guid === "object" &&
    typeof raw.guid["#text"] === "string" &&
    raw.guid["#text"].trim()
  ) {
    return raw.guid["#text"].trim();
  }
  return permalink || raw.title?.trim() || "";
}

export async function fetchRssFeedItems(feedUrl: string): Promise<FeedApiState> {
  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 86400 },
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EdwardsTravel/1.0)",
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      },
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      return { ok: false, message: `RSS request failed (${res.status})` };
    }

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      trimValues: true,
    });

    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: ParsedItem | ParsedItem[] } };
    };
    const rawItems = asArray(parsed.rss?.channel?.item);

    const seenSlug = new Set<string>();
    const seenKey = new Set<string>();
    const items: EdwardsRssItem[] = [];

    for (const raw of rawItems) {
      const permalink = raw.link?.trim() || "#";
      const slug = slugFromPermalink(permalink);
      const guid = guidFromRaw(raw, permalink);
      const key = `${slug}:${guid || permalink}`;

      if (seenSlug.has(slug) || seenKey.has(key)) continue;

      const description = raw.description || "";
      let imageUrl = firstImgFromHtml(description);
      if (imageUrl) imageUrl = maxQualityFeedImageUrl(imageUrl);

      const categories = normalizeCategories(raw.category);

      items.push({
        id: guid || slug,
        slug,
        guid,
        link: permalink,
        title: raw.title?.trim() || "Untitled",
        imageUrl,
        categories,
        category: categories[0] ?? null,
        publishedAt: parsePublishedAt(raw.pubDate),
        snippet: snippetFromHtml(description),
        contentHtml: description,
      });

      seenSlug.add(slug);
      seenKey.add(key);
    }

    items.sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    });

    return { ok: true, items };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Unable to load RSS feed.",
    };
  }
}
