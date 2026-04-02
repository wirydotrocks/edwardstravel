import type { Metadata } from "next";
import Link from "next/link";
import { BlogFeed } from "@/components/BlogFeed";
import { loadEdwardsRssSectionSafe } from "@/lib/edwards-rss";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Cruises, all-inclusive getaways, and experience-focused stories from the Edwards Travel RSS feed.",
};

export const revalidate = 300;

export default async function ExperiencesPage() {
  const feed = await loadEdwardsRssSectionSafe("experiences", 12);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Experiences
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Experiences that others have enjoyed on vacation.
        <br />
        Look through each experience to see what others have enjoyed.
        <br />

        Browse{" "}
        <Link
          href="/destinations"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Destinations
        </Link>{" "}
        or the{" "}
        <Link
          href="/blog"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Blog
        </Link>{" "}
        for other feed sections.
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
