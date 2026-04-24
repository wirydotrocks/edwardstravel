import sanitizeHtml from "sanitize-html";
import { load as loadHtml } from "cheerio";
import { maxQualityFeedImageUrl } from "@/lib/feed-image-url";

/**
 * Origin used to resolve relative `href` / `src` in RSS HTML. Default matches this site; if posts
 * still reference paths from another host during migration, set `EDWARDS_LEGACY_ORIGIN` there.
 */
const LEGACY_ORIGIN =
  process.env.EDWARDS_LEGACY_ORIGIN ?? "https://edwardstravel.com";

function absolutizePath(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith("/")) return `${LEGACY_ORIGIN}${url}`;
  return url;
}

/**
 * Sanitize RSS/HTML body content for server-rendered blog posts.
 * Relative asset URLs are pointed at the syndicated host so images and partner links keep working.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "figure",
      "figcaption",
      "h1",
      "h2",
      "h3",
      "h4",
      "img",
      "span",
      "blockquote",
      "hr",
      "sub",
      "sup",
      "u",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading", "class", "style"],
      a: ["href", "name", "target", "rel", "class"],
      p: ["class", "style"],
      div: ["class", "style"],
      span: ["class", "style"],
      figure: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      blockquote: ["class", "style"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = absolutizePath(attribs.href);
        if (href) attribs.href = href;
        if (
          attribs.href?.startsWith("http") &&
          !attribs.target &&
          !attribs.href.startsWith(LEGACY_ORIGIN)
        ) {
          attribs.target = "_blank";
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
      img: (tagName, attribs) => {
        const raw = absolutizePath(attribs.src);
        if (raw) attribs.src = maxQualityFeedImageUrl(raw);
        attribs.loading = attribs.loading || "lazy";
        return { tagName, attribs };
      },
    },
  });
}

/**
 * Remove the first inline image (or image wrapped in a figure/paragraph) from feed HTML.
 * We render a dedicated hero image above the article, so this avoids duplicated imagery.
 */
export function stripFirstInlineImage(html: string): string {
  let out = html;

  out = out.replace(
    /<figure\b[^>]*>\s*<img\b[^>]*>[\s\S]*?<\/figure>/i,
    "",
  );
  out = out.replace(/<p\b[^>]*>\s*<img\b[^>]*>\s*<\/p>/i, "");
  out = out.replace(/<img\b[^>]*>/i, "");

  return out.trim();
}

function bestContentSelector(html: string): string | null {
  const $ = loadHtml(html);

  const candidates = [
    ".offer-detail",
    ".offer-content",
    ".offer-body",
    "article",
    "main article",
    "main",
    "[role='main']",
    ".article-content",
    ".post-content",
    ".entry-content",
    ".content",
  ];

  for (const selector of candidates) {
    const node = $(selector).first();
    const textLen = node.text().replace(/\s+/g, " ").trim().length;
    if (node.length > 0 && textLen > 300) {
      return node.html()?.trim() || null;
    }
  }

  let bestHtml: string | null = null;
  let bestTextLen = 0;
  $("article, main, section, div").each((_, el) => {
    const node = $(el);
    const textLen = node.text().replace(/\s+/g, " ").trim().length;
    if (textLen > bestTextLen) {
      bestTextLen = textLen;
      bestHtml = node.html()?.trim() || null;
    }
  });

  return bestTextLen > 300 ? bestHtml : null;
}

export async function fetchFullArticleHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EdwardsTravel/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const pageHtml = await res.text();
    return bestContentSelector(pageHtml);
  } catch {
    return null;
  }
}

export function rewriteOfferBackLink(
  html: string,
  href: string,
  label: string,
): string {
  const $ = loadHtml(html);

  $("a").each((_, el) => {
    const a = $(el);
    const text = a.text().replace(/\s+/g, " ").trim().toLowerCase();
    if (text.includes("view all offers")) {
      a.attr("href", href);
      a.text(label);
    }
  });

  return $.root().html() ?? html;
}
