import type { Metadata } from "next";
import Link from "next/link";
import { BlogFeed } from "@/components/BlogFeed";
import { loadEdwardsRssSectionSafe } from "@/lib/edwards-rss";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Place-focused and destination stories from the Edwards Travel RSS feed.",
};

export const revalidate = 300;

export default async function DestinationsPage() {
  const feed = await loadEdwardsRssSectionSafe("destinations", 12);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Destinations
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Stories from our RSS feed that are categorized for destinations—culture,
        places, and trip inspiration. Each post opens on this site. See also{" "}
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
        <BlogFeed items={feed.items} />
      )}
    </main>
  );
}
