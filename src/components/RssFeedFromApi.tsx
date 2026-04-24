"use client";

import { useEffect, useState } from "react";
import { SearchableBlogFeed } from "@/components/SearchableBlogFeed";
import type { EdwardsRssItem } from "@/lib/edwards-rss";
import {
  isTatPublicListPost,
  tatPublicListPostToEdwardsRssItem,
  type TatPublicListPost,
} from "@/lib/tat-public-list";

type ApiState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: EdwardsRssItem[] };

type ApiResponse =
  | { ok: true; items: EdwardsRssItem[] | TatPublicListPost[] }
  | { ok: false; message: string };

function listItemsToRss(
  items: EdwardsRssItem[] | TatPublicListPost[],
  itemBasePath: string,
): EdwardsRssItem[] {
  const cmsKind: "blog" | "product" =
    itemBasePath === "/blog" || itemBasePath.startsWith("/blog")
      ? "blog"
      : "product";
  return items.map((it) => {
    if (isTatPublicListPost(it)) {
      return tatPublicListPostToEdwardsRssItem(it, { cmsKind });
    }
    return it;
  });
}

export function RssFeedFromApi({
  endpoint,
  searchLabel,
  searchPlaceholder,
  errorMessage,
  itemBasePath = "/blog",
}: {
  endpoint: string;
  searchLabel: string;
  searchPlaceholder: string;
  errorMessage: string;
  itemBasePath?: string;
}) {
  const [state, setState] = useState<ApiState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const url =
          typeof window !== "undefined"
            ? new URL(endpoint, window.location.origin).toString()
            : endpoint;
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        let json: ApiResponse;
        try {
          json = text
            ? (JSON.parse(text) as ApiResponse)
            : { ok: false, message: "Empty response from server." };
        } catch {
          if (!mounted) return;
          setState({
            status: "error",
            message: `Could not read API response (HTTP ${res.status}). The server may have crashed or returned HTML.`,
          });
          return;
        }

        if (!mounted) return;
        if (!res.ok || !json.ok) {
          setState({
            status: "error",
            message: json.ok ? errorMessage : json.message,
          });
          return;
        }

        setState({
          status: "ready",
          items: listItemsToRss(json.items, itemBasePath),
        });
      } catch (error) {
        if (!mounted) return;
        const parts: string[] = [];
        let cur: unknown = error;
        let depth = 0;
        while (cur != null && depth < 5) {
          if (cur instanceof Error) {
            parts.push(cur.message);
            cur = cur.cause;
          } else {
            parts.push(String(cur));
            break;
          }
          depth += 1;
        }
        const detail =
          parts.length > 0
            ? parts.join(" → ")
            : typeof error === "string"
              ? error
              : errorMessage;
        setState({
          status: "error",
          message: `${detail} If you are on HTTPS, make sure the site URL matches the dev server. Try opening the API URL (e.g. /api/blog) directly in the browser.`,
        });
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [endpoint, errorMessage, itemBasePath]);

  if (state.status === "loading") {
    return (
      <div
        className="mt-10 h-12 animate-pulse rounded-xl bg-[var(--color-sand-muted)]"
        aria-hidden
      />
    );
  }

  if (state.status === "error") {
    return (
      <div
        className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-sand)] px-5 py-4 text-sm text-[var(--color-muted)]"
        role="alert"
      >
        <p className="font-medium text-[var(--color-ink)]">
          We couldn&apos;t load the feed right now.
        </p>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  return (
    <SearchableBlogFeed
      items={state.items}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      itemBasePath={itemBasePath}
    />
  );
}
