"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type DestinationCountryCard = {
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  continentId: string;
  continentName: string;
  /** Lowercase string for search (country, slugs, subdivision names). */
  searchIndex: string;
  continentSortOrder: number;
  subdivisionCount: number;
  postCount: number;
};

type SortMode = "alphabetical" | "continent";

function readSort(raw: string | null): SortMode {
  return raw === "continent" ? "continent" : "alphabetical";
}

function DestinationCountryCardItem({
  c,
  showContinentLabel,
}: {
  c: DestinationCountryCard;
  showContinentLabel: boolean;
}) {
  return (
    <li>
      <Link
        href={`/destinations/${c.slug}`}
        className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:border-[var(--color-ocean)]/40 hover:shadow-md"
      >
        <div className="relative aspect-[16/10] bg-[var(--color-sand-muted)]">
          <Image
            src={c.imageUrl}
            alt={c.imageAlt}
            fill
            quality={90}
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ocean-deep)]/35 via-transparent to-transparent"
            aria-hidden
          />
        </div>
        <div className="p-5">
          <span className="font-serif text-lg font-semibold text-[var(--color-ocean-deep)] group-hover:text-[var(--color-ocean)]">
            {c.name}
          </span>
          {showContinentLabel ? (
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
              {c.continentName}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] line-clamp-3">
            {c.description}
          </p>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-ink)]">
              {c.subdivisionCount} region{c.subdivisionCount === 1 ? "" : "s"}
            </span>
            {c.postCount > 0 ? (
              <span className="text-[var(--color-ocean)]">
                {" "}
                · {c.postCount} stor{c.postCount === 1 ? "y" : "ies"}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function DestinationsBrowser({
  countries,
}: {
  countries: DestinationCountryCard[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const sort = readSort(searchParams.get("sort"));

  const setParams = useCallback(
    (next: { q?: string; sort?: SortMode }) => {
      const p = new URLSearchParams(searchParams.toString());
      const nextQ = next.q !== undefined ? next.q : p.get("q") ?? "";
      const nextSort = next.sort ?? readSort(p.get("sort"));
      if (nextQ.trim()) p.set("q", nextQ.trim());
      else p.delete("q");
      if (nextSort === "continent") p.set("sort", "continent");
      else p.delete("sort");
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filtered = useMemo(() => {
    if (!q) return countries;
    return countries.filter((c) => c.searchIndex.includes(q));
  }, [countries, q]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "alphabetical") {
      list.sort((a, b) => a.name.localeCompare(b.name));
      return {
        mode: "alphabetical" as const,
        groups: [{ label: null as string | null, items: list }],
      };
    }
    list.sort((a, b) => {
      const co = a.continentSortOrder - b.continentSortOrder;
      if (co !== 0) return co;
      return a.name.localeCompare(b.name);
    });
    const groups: { label: string; items: DestinationCountryCard[] }[] = [];
    for (const c of list) {
      const last = groups[groups.length - 1];
      if (last && last.label === c.continentName) last.items.push(c);
      else groups.push({ label: c.continentName, items: [c] });
    }
    return { mode: "continent" as const, groups };
  }, [filtered, sort]);

  const showContinentOnCards = sorted.mode === "alphabetical";

  return (
    <div className="mt-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Search locations
          </span>
          <input
            type="search"
            name="q"
            value={searchParams.get("q") ?? ""}
            onChange={(e) => setParams({ q: e.target.value })}
            placeholder="Country or region…"
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 focus:ring-2"
            autoComplete="off"
          />
        </label>
        <label className="flex w-full flex-col gap-1.5 sm:w-56">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Sort by
          </span>
          <select
            value={sort}
            onChange={(e) =>
              setParams({ sort: e.target.value as SortMode })
            }
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 focus:ring-2"
          >
            <option value="alphabetical">Country (A–Z)</option>
            <option value="continent">Continent, then A–Z</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No countries match &ldquo;{q}&rdquo;. Try another spelling or browse
          all locations.
        </p>
      ) : sorted.mode === "alphabetical" ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.groups[0].items.map((c) => (
            <DestinationCountryCardItem
              key={c.slug}
              c={c}
              showContinentLabel={showContinentOnCards}
            />
          ))}
        </ul>
      ) : (
        <div className="space-y-10">
          {sorted.groups.map((g) => (
            <section key={g.label}>
              <h2 className="border-b border-[var(--color-border)] pb-2 font-serif text-xl font-semibold text-[var(--color-ocean-deep)]">
                {g.label}
              </h2>
              <ul className="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((c) => (
                  <DestinationCountryCardItem
                    key={c.slug}
                    c={c}
                    showContinentLabel={showContinentOnCards}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
