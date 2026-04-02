import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group getaways",
  description:
    "Group getaways and shared travel experiences with Edwards Travel — content coming soon.",
};

export default function GroupGetawaysPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)]">
        Group getaways
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
        Join our group getaways! This page will soon feature upcoming group
        trips, what to expect, and how to reserve your spot.
      </p>
    </main>
  );
}
