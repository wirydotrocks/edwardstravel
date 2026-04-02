import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogFeed } from "@/components/BlogFeed";
import { COUNTRIES, getSubdivision } from "@/data/destination-world";
import {
  filterDestinationHubItems,
  itemsForSubdivision,
  sortItemsByPublishedDesc,
} from "@/lib/destination-matching";
import { loadEdwardsRssSafe } from "@/lib/edwards-rss";

export const revalidate = 300;

type Props = {
  params: Promise<{ countrySlug: string; subdivisionSlug: string }>;
};

export async function generateStaticParams() {
  const out: { countrySlug: string; subdivisionSlug: string }[] = [];
  for (const c of COUNTRIES) {
    for (const s of c.subdivisions) {
      out.push({ countrySlug: c.slug, subdivisionSlug: s.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countrySlug, subdivisionSlug } = await params;
  const found = getSubdivision(countrySlug, subdivisionSlug);
  if (!found) return { title: "Destination" };
  return {
    title: `${found.subdivision.name}, ${found.country.name} | Destinations`,
    description: `Travel stories for ${found.subdivision.name} in ${found.country.name}.`,
  };
}

export default async function DestinationSubdivisionPage({ params }: Props) {
  const { countrySlug, subdivisionSlug } = await params;
  const found = getSubdivision(countrySlug, subdivisionSlug);
  if (!found) notFound();

  const { country, subdivision } = found;
  const feed = await loadEdwardsRssSafe();
  const hubItems = feed.ok ? filterDestinationHubItems(feed.items) : [];
  const posts = feed.ok
    ? itemsForSubdivision(hubItems, country, subdivision)
    : [];
  sortItemsByPublishedDesc(posts);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm text-[var(--color-muted)]">
        <Link
          href="/destinations"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Destinations
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <Link
          href={`/destinations/${country.slug}`}
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          {country.name}
        </Link>
      </p>

      <h1 className="mt-4 font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        {subdivision.name}
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">{country.name}</p>

      <section className="mt-10">
        {!feed.ok ? (
          <p className="text-sm text-[var(--color-muted)]">{feed.message}</p>
        ) : posts.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            No stories match this region in the feed yet. You can widen{" "}
            <code className="rounded bg-[var(--color-sand)] px-1 text-xs">
              matchTerms
            </code>{" "}
            for this area in{" "}
            <code className="rounded bg-[var(--color-sand)] px-1 text-xs">
              destination-world.ts
            </code>
            .
          </p>
        ) : (
          <BlogFeed items={posts} />
        )}
      </section>
    </main>
  );
}
