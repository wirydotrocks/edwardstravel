import type { Metadata } from "next";
import { ExploreCountriesMapClient } from "@/components/ExploreCountriesMapClient";

export const metadata: Metadata = {
  title: "Explore Countries",
  description:
    "Explore the world country by country on an interactive map with Edwards Travel.",
};

export default function ExploreCountriesPage() {
  return (
    <main className="flex flex-1 flex-col pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)] sm:text-5xl">
          Explore Countries
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          Click any country on the map or search below to highlight it. Every nation
          is shown, so feel free to tap around to see where you might go next.
        </p>
      </div>

      <section className="mx-auto mt-8 w-full max-w-[1640px] px-4 sm:px-6 lg:px-8">
        <ExploreCountriesMapClient />
      </section>
    </main>
  );
}
