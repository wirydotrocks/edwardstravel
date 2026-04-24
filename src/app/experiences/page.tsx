import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  TatExperiencesFeedFromServer,
  TatFeedSkeleton,
} from "@/components/TatFeedFromServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Cruises, all-inclusive getaways, and experience-focused stories from the Edwards Travel RSS feed.",
};

export default function ExperiencesPage() {
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

      <Suspense fallback={<TatFeedSkeleton />}>
        <TatExperiencesFeedFromServer />
      </Suspense>
    </main>
  );
}
