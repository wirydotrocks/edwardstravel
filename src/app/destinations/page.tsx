import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore destinations by location with Edwards Travel.",
};

export default function DestinationsPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Destinations
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Here we&apos;ll pull the same feed as Experiences, but sort and group
        by location. Feed integration comes next.
      </p>
    </main>
  );
}
