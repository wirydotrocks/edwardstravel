import sanitizeHtml from "sanitize-html";
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
