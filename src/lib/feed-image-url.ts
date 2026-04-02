/**
 * RSS thumbnails often include `h`, `w`, and low `q` query params.
 * Strip size caps and raise quality for gttwl CDN URLs so we serve the sharpest asset the CDN allows.
 */
export function maxQualityFeedImageUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("gttwl.net")) {
      u.searchParams.delete("h");
      u.searchParams.delete("w");
      u.searchParams.set("q", "100");
      if (!u.searchParams.get("auto")) {
        u.searchParams.set("auto", "format");
      }
    }
    return u.toString();
  } catch {
    return url;
  }
}
