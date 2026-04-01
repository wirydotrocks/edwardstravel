import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Trips",
  description: "Find trips by destination, type, month, and length.",
};

export default function SearchTripsPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Search trips
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        You&apos;ll be able to filter by destination, travel type, month, and
        trip length. We can build the form and hook it to your inventory or
        feed next.
      </p>
    </main>
  );
}
