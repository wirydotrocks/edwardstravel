import type { EdwardsRssItem } from "@/lib/edwards-rss";
import type { TatPost } from "@/lib/tat-api";

/** Shape returned by `/api/blog` and `/api/experiences` (trimmed TAT fields). */
export type TatPublicListPost = {
  id: string;
  zid?: string | null;
  title: string;
  slug: string;
  /** TAT path, e.g. `/blog/...` or `/product/...` */
  permalink?: string | null;
  content: string;
  /** TAT short summary when present */
  summary?: string | null;
  /** Lowercased tag strings from TAT */
  tags?: string[];
  imageUrl: string | null;
  publishedAt: string | null;
};

function stripForSnippet(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippetFromContent(html: string): string {
  const text = stripForSnippet(String(html || ""));
  if (text.length <= 240) return text;
  return `${text.slice(0, 237).trim()}...`;
}

/** Map a {@link TatPost} from `tat-api` into the JSON shape for `/api/blog` and `/api/experiences`. */
export function tatPostToPublicListPost(p: TatPost): TatPublicListPost {
  const slug = (() => {
    const path = p.permalink.trim().split("?")[0];
    const parts = path.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last && last.length > 0 ? last : "post";
  })();
  return {
    id: p.id,
    zid: p.zid ?? null,
    title: p.title,
    slug,
    permalink: p.permalink === "#" ? null : p.permalink,
    content: p.content,
    summary: p.summary.trim() ? p.summary : null,
    tags: p.tags,
    imageUrl: p.imageUrl,
    publishedAt: p.publishedAt,
  };
}

export function toTatPublicListFromRssItem(
  item: EdwardsRssItem,
): TatPublicListPost {
  return {
    id: item.id,
    zid: item.tatZid ?? null,
    title: item.title,
    slug: item.slug,
    permalink: item.tatPermalink ?? null,
    content: item.contentHtml,
    summary: item.tatSummary ?? null,
    tags: item.tatTags,
    imageUrl: item.imageUrl,
    publishedAt: item.publishedAt,
  };
}

/**
 * Rehydrates a list row for UI components that expect {@link EdwardsRssItem} (e.g. cards, search).
 */
export function tatPublicListPostToEdwardsRssItem(
  p: TatPublicListPost,
  options: { cmsKind: "blog" | "product" },
): EdwardsRssItem {
  const base = options.cmsKind === "blog" ? "/blog" : "/experiences";
  const snippet =
    p.summary && p.summary.trim().length > 0
      ? snippetFromContent(p.summary)
      : p.content
        ? snippetFromContent(p.content)
        : "";
  return {
    id: p.id,
    slug: p.slug,
    guid: p.zid || p.id,
    link: `${base}/${p.slug}`,
    title: p.title,
    imageUrl: p.imageUrl,
    categories: p.tags?.length ? [...p.tags] : [],
    category: p.tags?.[0] ?? null,
    publishedAt: p.publishedAt,
    snippet,
    contentHtml: p.content,
    cmsKind: options.cmsKind,
    tatZid: p.zid ?? null,
    tatSummary: p.summary ?? null,
    tatTags: p.tags,
    tatPermalink: p.permalink ?? null,
  };
}

/** One-line description for `generateMetadata` from list `content` HTML. */
export function tatPublicListDescription(
  p: Pick<TatPublicListPost, "content" | "title" | "summary">,
): string {
  const source = p.summary?.trim() ? p.summary : p.content;
  const text = source
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return text || `Edwards Travel — ${p.title}`;
}

export function isTatPublicListPost(
  v: unknown,
): v is TatPublicListPost {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.slug === "string" &&
    typeof o.content === "string" &&
    (!("imageUrl" in o) ||
      o.imageUrl === null ||
      typeof o.imageUrl === "string") &&
    (!("publishedAt" in o) ||
      o.publishedAt === null ||
      typeof o.publishedAt === "string")
  );
}
