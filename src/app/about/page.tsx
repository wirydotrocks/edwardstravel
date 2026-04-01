import type { Metadata } from "next";
import { TeamSection } from "@/components/TeamSection";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Meet the Edwards Travel team — the people behind your thoughtfully planned journeys.",
};

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-semibold text-[var(--color-ocean-deep)] sm:text-5xl">
          About us
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
          Edwards Travel helps you explore the world with confidence. We plan
          itineraries around how you like to travel—whether that means relaxing
          resorts, active adventures, or cultural deep dives—and we stay with you
          from first ideas through your return home.
        </p>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          Meet our team below—flip a card to read each profile and contact details.
        </p>
      </div>

      <section
        aria-labelledby="meet-team-heading"
        className="w-full border-t border-[var(--color-border)] bg-[var(--color-sand)]/40 py-12 sm:py-16"
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <h2
            id="meet-team-heading"
            className="font-serif text-2xl font-semibold text-[var(--color-ocean-deep)] sm:text-3xl"
          >
            Meet the team
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            Click a card to flip it and read the full profile, including contact.
          </p>
          <div className="mt-10">
            <TeamSection />
          </div>
        </div>
      </section>
    </main>
  );
}
