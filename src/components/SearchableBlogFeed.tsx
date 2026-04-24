"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { BlogFeed } from "@/components/BlogFeed";
import type { EdwardsRssItem } from "@/lib/edwards-rss";

function itemSearchBlob(item: EdwardsRssItem): string {
  return [
    item.title,
    item.snippet,
    item.category,
    ...item.categories,
    item.tatSummary,
    ...(item.tatTags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Stable viewport for results so filtering does not shrink the page layout. */
const RESULTS_PANEL =
  "h-[min(72vh,44rem)] w-full overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]";

const SEARCH_FIELD_ROW =
  "h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 focus:ring-2";

export function SearchableBlogFeed({
  items,
  searchLabel,
  searchPlaceholder,
  itemBasePath = "/blog",
}: {
  items: EdwardsRssItem[];
  searchLabel: string;
  searchPlaceholder: string;
  itemBasePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qRaw = searchParams.get("q") ?? "";
  const q = qRaw.trim().toLowerCase();

  const setQuery = useCallback(
    (value: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (value.trim()) p.set("q", value.trim());
      else p.delete("q");
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((item) => itemSearchBlob(item).includes(q));
  }, [items, q]);

  return (
    <div className="mt-10 flex flex-col gap-8">
      <label className="flex w-full max-w-2xl flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          {searchLabel}
        </span>
        <input
          type="search"
          name="q"
          value={qRaw}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className={SEARCH_FIELD_ROW}
          autoComplete="off"
        />
      </label>

      <div className={RESULTS_PANEL}>
        {q && filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="max-w-md text-sm text-[var(--color-muted)]">
              No posts match &ldquo;{qRaw.trim()}&rdquo;. Try another word or
              clear the search.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <BlogFeed
              items={filtered}
              listClassName="mt-0 text-center"
              basePath={itemBasePath}
            />
          </div>
        ) : (
          <BlogFeed
            items={filtered}
            listClassName="mt-0 pb-2"
            basePath={itemBasePath}
          />
        )}
      </div>
    </div>
  );
}
