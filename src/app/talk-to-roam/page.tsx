import type { Metadata } from "next";
import { Suspense } from "react";
import { RoamChat } from "@/components/RoamChat";

export const metadata: Metadata = {
  description:
    "Chat with Roam AI, your Edwards Travel guide—discover countries and things to do on your next trip.",
};

export default function TalkToRoamPage() {
  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:max-w-none lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ocean)]">
          Roam AI
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-[var(--color-ocean-deep)] sm:text-5xl">
          Talk to Roam
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          Roam helps you narrow down where to go and what to do—whether you have
          a country in mind or you&apos;re still browsing the map for ideas.
        </p>
      </div>

      <div className="mt-8 lg:mx-auto lg:w-full lg:max-w-7xl">
        <Suspense
          fallback={
            <div className="flex h-[min(640px,calc(100dvh-13rem))] items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-muted)] lg:h-[min(760px,calc(100dvh-10rem))]">
              Loading chat…
            </div>
          }
        >
          <RoamChat />
        </Suspense>
      </div>
    </main>
  );
}
