import type { Metadata } from "next";
import Link from "next/link";
import { RssFeedFromApi } from "@/components/RssFeedFromApi";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse destinations by country and region—stories from the Edwards Travel RSS feed.",
};

export default function DestinationsPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Destinations
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Explore by country and region. 
        <br />
        Each country groups related areas so you
        can go deeper without getting lost.
        <br />
         See also{" "}
        <Link
          href="/experiences"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Experiences
        </Link>{" "}
        and the{" "}
        <Link
          href="/blog"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          Blog
        </Link>
        .
      </p>

      <RssFeedFromApi
        endpoint="/api/destinations"
        searchLabel="Search destinations"
        searchPlaceholder="Country, region, city, or keyword..."
        errorMessage="Unable to load destinations."
        itemBasePath="/destinations"
      />
    </main>
  );
}
