import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  TatBlogFeedFromServer,
  TatFeedSkeleton,
} from "@/components/TatFeedFromServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Travel stories and inspiration from Edward's Travel — synced from our RSS feed.",
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Blog
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Open any card to read the full article on this site. 
        <br />
        For cruises and stories, see{" "}
        <Link
          href="/experiences"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Experiences
        </Link>
        ; for place focused pieces, see{" "}
        <Link
          href="/destinations"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Destinations
        </Link>
        .
      </p>
      <Suspense fallback={<TatFeedSkeleton />}>
        <TatBlogFeedFromServer />
      </Suspense>
    </main>
  );
}
