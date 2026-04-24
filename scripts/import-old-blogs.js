#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");
const { XMLParser } = require("fast-xml-parser");

const OLD_BLOG_RSS_URL = "https://www.edwardstraveltour.com/rss/blog";
const OUTPUT_PATH = path.join(process.cwd(), "data", "blogs.json");

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImgFromHtml(html) {
  const m = String(html || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function parsePublishedAt(pubDate) {
  if (!pubDate) return null;
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

function slugFromPermalink(link) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "post";
  } catch {
    return "post";
  }
}

function normalizeItem(raw) {
  const link = String(raw.link || "").trim();
  const description = String(raw.description || "");
  const categories = asArray(raw.category)
    .map((c) => String(c).trim())
    .filter(Boolean);

  const snippetBase = stripHtml(description);
  const snippet =
    snippetBase.length <= 240
      ? snippetBase
      : `${snippetBase.slice(0, 237).trim()}...`;

  return {
    slug: slugFromPermalink(link),
    guid: String(raw.guid || link || raw.title || ""),
    title: String(raw.title || "Untitled").trim(),
    link,
    imageUrl: firstImgFromHtml(description),
    categories,
    category: categories[0] || null,
    publishedAt: parsePublishedAt(raw.pubDate),
    snippet,
    contentHtml: description,
  };
}

async function run() {
  console.log(`Fetching old RSS: ${OLD_BLOG_RSS_URL}`);

  const response = await fetch(OLD_BLOG_RSS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; EdwardsTravelImport/1.0)",
      Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Old RSS request failed (${response.status})`);
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true,
  });
  const parsed = parser.parse(xml);

  const rawItems = asArray(parsed?.rss?.channel?.item);
  const seen = new Set();
  const items = [];

  for (const raw of rawItems) {
    const item = normalizeItem(raw || {});
    const key = `${item.slug}:${item.guid}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }

  items.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(items, null, 2), "utf8");

  console.log(`Saved ${items.length} posts to ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
