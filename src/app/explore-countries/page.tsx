import type { Metadata } from "next";
import { ExploreCountriesMap } from "@/components/ExploreCountriesMap";

export const metadata: Metadata = {
  title: "Explore Countries",
  description:
    "Explore the world country by country on an interactive map with Edwards Travel.",
};

export default function ExploreCountriesPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)] sm:text-5xl">
        Explore Countries
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Click any country to highlight it on the map. Every nation is shown, so
        feel free to tap around to see where you might go next.
      </p>

      <div className="mt-10">
        <ExploreCountriesMap />
      </div>
    </main>
  );
}
