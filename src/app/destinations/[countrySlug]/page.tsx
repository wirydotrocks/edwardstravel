import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogFeed } from "@/components/BlogFeed";
import {
  COUNTRIES,
  getContinentById,
  getCountryBySlug,
} from "@/data/destination-world";
import {
  filterDestinationHubItems,
  itemsForCountry,
  itemsForSubdivision,
  sortItemsByPublishedDesc,
} from "@/lib/destination-matching";
import { loadEdwardsRssSafe } from "@/lib/edwards-rss";

export const revalidate = 300;

type Props = { params: Promise<{ countrySlug: string }> };

export async function generateStaticParams() {
  return COUNTRIES.map((c) => ({ countrySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) return { title: "Destination" };
  const desc =
    country.description.length > 155
      ? `${country.description.slice(0, 152).trim()}…`
      : country.description;
  return {
    title: `${country.name} | Destinations`,
    description: desc,
  };
}

export default async function DestinationCountryPage({ params }: Props) {
  const { countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) notFound();

  const continent = getContinentById(country.continentId);
  const feed = await loadEdwardsRssSafe();
  const hubItems = feed.ok ? filterDestinationHubItems(feed.items) : [];
  const countryPosts = feed.ok ? itemsForCountry(hubItems, country) : [];
  sortItemsByPublishedDesc(countryPosts);

  const subsWithCounts = country.subdivisions.map((sub) => ({
    sub,
    count: feed.ok ? itemsForSubdivision(hubItems, country, sub).length : 0,
  }));

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-sm text-[var(--color-muted)]">
        <Link
          href="/destinations"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          ← Destinations
        </Link>
        {continent ? (
          <>
            <span aria-hidden className="mx-2">
              ·
            </span>
            <span>{continent.name}</span>
          </>
        ) : null}
      </p>

      <h1 className="mt-4 font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        {country.name}
      </h1>

      <div className="relative mt-6 aspect-[21/9] max-h-[min(360px,50vw)] w-full overflow-hidden rounded-2xl bg-[var(--color-sand-muted)] shadow-md">
        <Image
          src={country.imageUrl}
          alt={country.imageAlt}
          fill
          priority
          quality={95}
          className="object-cover"
          sizes="(max-width: 1152px) 100vw, 1152px"
        />
      </div>

      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
        {country.description}
      </p>
      <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
        Choose a region below for more focused stories, or scroll for everything
        we currently match to {country.name} from the feed.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-ocean-deep)]">
          Regions
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subsWithCounts.map(({ sub, count }) => (
            <li key={sub.slug}>
              <Link
                href={`/destinations/${country.slug}/${sub.slug}`}
                className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm transition hover:border-[var(--color-ocean)]/40 hover:shadow-md"
              >
                <span className="font-medium text-[var(--color-ocean-deep)]">
                  {sub.name}
                </span>
                <span className="mt-1 text-xs text-[var(--color-muted)]">
                  {count > 0
                    ? `${count} stor${count === 1 ? "y" : "ies"}`
                    : "Browse"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-ocean-deep)]">
          Stories · {country.name}
        </h2>
        {!feed.ok ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">{feed.message}</p>
        ) : countryPosts.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            No feed posts match this country yet. Add match terms in{" "}
            <code className="rounded bg-[var(--color-sand)] px-1 text-xs">
              src/data/destination-world.ts
            </code>{" "}
            or use categories in your CMS that mention these places.
          </p>
        ) : (
          <BlogFeed items={countryPosts} />
        )}
      </section>
    </main>
  );
}
