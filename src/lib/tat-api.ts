import { unstable_cache } from "next/cache";
import type { EdwardsRssItem } from "@/lib/edwards-rss";
import { maxQualityFeedImageUrl } from "@/lib/feed-image-url";

const TAT_BASE = "https://api.gttwl2.com";
const REVALIDATE = 86400;
const TAT_PAGE_SIZE = 200;
const TAT_MAX_LIST_PAGES = 50;

export type TatPost = {
  id: string;
  /** TAT zid when present (for guid / API detail). */
  zid?: string | null;
  title: string;
  summary: string;
  content: string;
  permalink: string;
  imageUrl: string | null;
  publishedAt: string | null;
  tags: string[];
};

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function authHeader(): string {
  const token = process.env.TAT_API_TOKEN?.trim();
  if (!token) throw new Error("TAT_API_TOKEN is missing.");
  const user = process.env.TAT_API_AUTH_USER?.trim() || "agency";
  return `Basic ${Buffer.from(`${user}:${token}`).toString("base64")}`;
}

function listQueryPage(page: number): string {
  const order = encodeURIComponent("created_at desc");
  let q = `type=Products&page=${page}&page_size=${TAT_PAGE_SIZE}&order=${order}`;
  const agency = process.env.TAT_AGENCY_ID?.trim();
  if (agency) q += `&agency_id=${encodeURIComponent(agency)}`;
  return q;
}

async function tatFetchJson(path: string): Promise<unknown> {
  const url = `${TAT_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `TAT ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("TAT response was not valid JSON.");
  }
}

function entriesFromPayload(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    for (const key of ["entries", "posts", "items", "rows"] as const) {
      const arr = d[key];
      if (Array.isArray(arr)) return arr as Record<string, unknown>[];
    }
  }
  if (Array.isArray(root.entries)) return root.entries as Record<string, unknown>[];
  return [];
}

/** Include row unless status clearly means draft / archived. */
function isActiveRow(row: Record<string, unknown>): boolean {
  const s = row.status;
  if (s === undefined || s === null) return true;
  if (s === 0 || s === "0") return true;
  if (s === 1 || s === "1") return true;
  if (typeof s === "string") {
    const lower = s.toLowerCase();
    if (
      lower === "draft" ||
      lower === "archived" ||
      lower === "deleted" ||
      lower === "inactive" ||
      lower === "scheduled"
    ) {
      return false;
    }
    if (
      lower === "active" ||
      lower === "published" ||
      lower === "live" ||
      lower === "public"
    ) {
      return true;
    }
    if (/^\d+$/.test(lower)) return Number(lower) <= 1;
  }
  if (typeof s === "number" && Number.isFinite(s)) return s <= 1;
  return true;
}

function imageFromRow(row: Record<string, unknown>): string | null {
  const pm = row.primary_media;
  if (pm && typeof pm === "object") {
    const rec = pm as Record<string, unknown>;
    const o = rec.original;
    if (typeof o === "string" && o.trim()) return maxQualityFeedImageUrl(o.trim());
    if (o && typeof o === "object") {
      const u = str((o as Record<string, unknown>).url);
      if (u) return maxQualityFeedImageUrl(u);
    }
    const sizes = rec.sizes;
    if (sizes && typeof sizes === "object") {
      const so = (sizes as Record<string, unknown>).original;
      if (typeof so === "string" && so.trim()) return maxQualityFeedImageUrl(so.trim());
    }
  }
  return null;
}

function tagsFromRow(row: Record<string, unknown>): string[] {
  const at = row.array_tags;
  if (!Array.isArray(at)) return [];
  return at.map((x) => str(x)).filter(Boolean);
}

function publishedAtFromRow(row: Record<string, unknown>): string | null {
  const raw = str(row.created_at) || str(row.when);
  if (!raw) return null;
  let s = raw;
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) s = `${s.slice(0, 10)}T${s.slice(11)}`;
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function rowToTatPost(
  row: Record<string, unknown>,
  opts?: { ignoreStatus?: boolean },
): TatPost | null {
  if (!opts?.ignoreStatus && !isActiveRow(row)) return null;
  const id = str(row.id) || str(row.zid);
  if (!id) return null;
  const zid = str(row.zid) || null;
  const title = str(row.title) || "Untitled";
  const summary = str(row.summary);
  const content = str(row.content);
  const permalink = str(row.permalink) || "#";
  return {
    id,
    zid,
    title,
    summary,
    content,
    permalink,
    imageUrl: imageFromRow(row),
    publishedAt: publishedAtFromRow(row),
    tags: tagsFromRow(row),
  };
}

function dedupeKeyForPost(p: TatPost): string {
  if (p.zid) return p.zid;
  if (p.id) return p.id;
  if (p.permalink && p.permalink !== "#") return p.permalink;
  return p.id;
}

async function loadPosts(): Promise<TatPost[]> {
  try {
    const byKey = new Map<string, TatPost>();
    for (let page = 1; page <= TAT_MAX_LIST_PAGES; page += 1) {
      const json = await tatFetchJson(`/post?${listQueryPage(page)}`);
      const entries = entriesFromPayload(json);
      if (entries.length === 0) break;
      const sizeBefore = byKey.size;
      for (const row of entries) {
        const p = rowToTatPost(row);
        if (!p) continue;
        const k = dedupeKeyForPost(p);
        if (!byKey.has(k)) byKey.set(k, p);
      }
      if (byKey.size === sizeBefore) break;
    }
    const merged = Array.from(byKey.values());
    console.log(
      `[TAT] Products list: pages<=${TAT_MAX_LIST_PAGES} page_size=${TAT_PAGE_SIZE} merged=${merged.length}`,
    );
    return merged;
  } catch (e) {
    console.error("[TAT] fetch Products:", e);
    throw e;
  }
}

const cacheAgency = () => process.env.TAT_AGENCY_ID?.trim() ?? "";
const cacheAuthUser = () => process.env.TAT_API_AUTH_USER?.trim() || "agency";

export const fetchExperiencePosts = unstable_cache(
  () => loadPosts(),
  ["tat", "experience-posts", "v3-paginated", cacheAgency(), cacheAuthUser()],
  { revalidate: REVALIDATE },
);

function slugFromPermalinkPath(path: string): string {
  const noQuery = path.trim().split("?")[0];
  const parts = noQuery.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return last && last.length > 0 ? last : "post";
}

function snippetFromHtml(html: string): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 240) return text;
  return `${text.slice(0, 237).trim()}...`;
}

/** Map a list row to the shape SearchableBlogFeed / detail pages expect. */
export function tatPostToEdwardsRssItem(
  p: TatPost,
  cmsKind: "blog" | "product",
): EdwardsRssItem {
  const base = cmsKind === "blog" ? "/blog" : "/experiences";
  const slug = slugFromPermalinkPath(p.permalink);
  const snippet =
    p.summary.trim().length > 0
      ? snippetFromHtml(p.summary)
      : snippetFromHtml(p.content);
  return {
    id: p.id,
    slug,
    guid: p.zid || p.id,
    link: `${base}/${slug}`,
    title: p.title,
    imageUrl: p.imageUrl,
    categories: p.tags.length ? [...p.tags] : [],
    category: p.tags[0] ?? null,
    publishedAt: p.publishedAt,
    snippet,
    contentHtml: p.content,
    cmsKind,
    tatZid: p.zid ?? null,
    tatSummary: p.summary || null,
    tatTags: p.tags.length ? p.tags : undefined,
    tatPermalink: p.permalink === "#" ? null : p.permalink,
  };
}

function detectKind(row: Record<string, unknown>): "blog" | "product" {
  const t = `${str(row.type)} ${str(row.kind_name)}`.toLowerCase();
  if (t.includes("product") || t.includes("vendor")) return "product";
  return "blog";
}

function firstDataObject(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.entries) && rec.entries[0]) {
      return rec.entries[0] as Record<string, unknown>;
    }
    return rec;
  }
  if (data && typeof data === "object" && Array.isArray(data)) {
    const arr = data as unknown[];
    if (arr[0] && typeof arr[0] === "object") return arr[0] as Record<string, unknown>;
  }
  if (looksLikeRow(root)) return root;
  return null;
}

function looksLikeRow(v: unknown): boolean {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return "title" in o || "id" in o || "permalink" in o;
}

/** Single post for `/api/posts/[id]` (not cached separately — short TTL via route). */
export async function fetchPostById(id: string): Promise<EdwardsRssItem> {
  const agency = process.env.TAT_AGENCY_ID?.trim();
  const path = agency
    ? `/post/${encodeURIComponent(id)}?agency_id=${encodeURIComponent(agency)}`
    : `/post/${encodeURIComponent(id)}`;
  const json = await tatFetchJson(path);
  const row = firstDataObject(json);
  if (!row) throw new Error("Post not found.");
  const p = rowToTatPost(row, { ignoreStatus: true });
  if (!p) throw new Error("Post is not available.");
  return tatPostToEdwardsRssItem(p, detectKind(row));
}
