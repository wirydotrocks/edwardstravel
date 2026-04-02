import type { Metadata } from "next";
import { BlogFeed } from "@/components/BlogFeed";
import { loadEdwardsRssSafe } from "@/lib/edwards-rss";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Travel stories and inspiration from Edward's Travel — synced from our editorial RSS feed.",
};

export const revalidate = 300;

export default async function BlogPage() {
  const feed = await loadEdwardsRssSafe();

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Blog
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Stories from our editorial RSS feed, in feed order. Open any card to
        read the full article on this site.
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
