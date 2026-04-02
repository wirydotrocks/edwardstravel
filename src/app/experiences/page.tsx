import type { Metadata } from "next";
import Link from "next/link";

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
        Curated trips and travel ideas will live here. Blog-style stories are on{" "}
        <Link
          href="/blog"
          className="font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
        >
          the blog
        </Link>
        .
      </p>
    </main>
  );
}
