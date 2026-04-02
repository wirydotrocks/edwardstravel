import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  DestinationsBrowser,
  type DestinationCountryCard,
} from "@/components/DestinationsBrowser";
import { COUNTRIES, getContinentById } from "@/data/destination-world";
import {
  filterDestinationHubItems,
  itemsForCountry,
  sortItemsByPublishedDesc,
} from "@/lib/destination-matching";
import { loadEdwardsRssSafe } from "@/lib/edwards-rss";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse destinations by country and region—stories from the Edwards Travel RSS feed.",
};

export const revalidate = 300;

function searchIndexForCountry(c: (typeof COUNTRIES)[number]): string {
  const parts = [
    c.name,
    c.description,
    c.slug.replace(/-/g, " "),
    ...c.subdivisions.flatMap((s) => [
      s.name,
      s.slug.replace(/-/g, " "),
      ...s.matchTerms.slice(0, 6),
    ]),
  ];
  return parts.join(" ").toLowerCase();
}

function DestinationsBrowseFallback() {
  return (
    <div
      className="mt-10 h-40 animate-pulse rounded-2xl bg-[var(--color-sand-muted)]"
      aria-hidden
    />
  );
}

export default async function DestinationsPage() {
  const feed = await loadEdwardsRssSafe();
  const hubItems = feed.ok ? filterDestinationHubItems(feed.items) : [];
  sortItemsByPublishedDesc(hubItems);

  const countryCards: DestinationCountryCard[] = COUNTRIES.map((c) => {
    const cont = getContinentById(c.continentId);
    const postCount = feed.ok ? itemsForCountry(hubItems, c).length : 0;
    return {
      slug: c.slug,
      name: c.name,
      imageUrl: c.imageUrl,
      imageAlt: c.imageAlt,
      description: c.description,
      continentId: c.continentId,
      continentName: cont?.name ?? c.continentId,
      searchIndex: searchIndexForCountry(c),
      continentSortOrder: cont?.sortOrder ?? 999,
      subdivisionCount: c.subdivisions.length,
      postCount,
    };
  });

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Destinations
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Explore by country and region. Each country groups related areas so you
        can go deeper without dozens of flat pages. Stories come from your RSS
        feed when titles and categories mention a place. See also{" "}
        <Link
          href="/experiences"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Experiences
        </Link>{" "}
        and the{" "}
        <Link
          href="/blog"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Blog
        </Link>
        .
      </p>

      {!feed.ok ? (
        <div
          className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-sand)] px-5 py-4 text-sm text-[var(--color-muted)]"
          role="alert"
        >
          <p className="font-medium text-[var(--color-ink)]">
            We couldn&apos;t load the feed right now.
          </p>
          <p className="mt-1">{feed.message}</p>
        </div>
      ) : (
        <Suspense fallback={<DestinationsBrowseFallback />}>
          <DestinationsBrowser countries={countryCards} />
        </Suspense>
      )}
    </main>
  );
}
