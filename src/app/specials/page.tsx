import type { Metadata } from "next";
import { RssFeedFromApi } from "@/components/RssFeedFromApi";

export const metadata: Metadata = {
  title: "Specials",
  description:
    "Hot travel deals and specials with Edwards Travel — content coming soon.",
};

export default function SpecialsPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Specials
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Find the best travel specials with Edwards Travel.
      </p>
      <RssFeedFromApi
        endpoint="/api/specials"
        searchLabel="Search specials"
        searchPlaceholder="Supplier, destination, offer, or keyword..."
        errorMessage="Unable to load specials."
      />
    </main>
  );
}
