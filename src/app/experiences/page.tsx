import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Browse travel experiences from Edwards Travel.",
};

export default function ExperiencesPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Experiences
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        This page will list items from your RSS feed in their natural order
        (unsorted). We&apos;ll wire up the feed in a follow-up step.
      </p>
    </main>
  );
}
