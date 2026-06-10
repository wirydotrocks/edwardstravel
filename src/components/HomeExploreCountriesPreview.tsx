"use client";

import Link from "next/link";
import { ExploreCountriesMap } from "@/components/ExploreCountriesMap";

export function HomeExploreCountriesPreview() {
  return (
    <Link
      href="/explore-countries"
      className="group relative block overflow-hidden rounded-2xl transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ocean)]"
      aria-label="Open the interactive world map to explore countries"
    >
      <ExploreCountriesMap preview />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-ocean-deep)]/45 via-transparent to-transparent transition group-hover:from-[var(--color-ocean-deep)]/55"
        aria-hidden
      />
      <p className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 font-serif text-lg font-semibold text-white [text-shadow:_0_1px_8px_rgba(0,0,0,0.45)]">
        Every nation, one click away
      </p>
    </Link>
  );
}
