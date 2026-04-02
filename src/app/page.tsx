import Link from "next/link";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeHero } from "@/components/HomeHero";
import { HomeSpecialsGroupsSection } from "@/components/HomeSpecialsGroupsSection";

const highlights = [
  {
    title: "Curated experiences",
    body: "Hand-picked tours and moments that match how you like to travel whether it be relaxed, adventurous, or something in between.",
  },
  {
    title: "Real guidance",
    body: "We handle the details so you can focus on the scenery, the culture, and the people you travel with.",
  },
  {
    title: "Built around you",
    body: "Destinations, timing, and trip length shaped around your calendar, budget, and bucket list.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />

      {/* Stories first — why visitors came to the site */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-sand)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
                Stories &amp; Inspiration
              </h2>
              <p className="mt-3 max-w-xl text-[var(--color-muted)]">
                Soon you&apos;ll browse experiences, destinations, and blog
                posts from a single source—sorted the way you like.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex w-fit items-center text-sm font-semibold text-[var(--color-ocean)] underline-offset-4 hover:underline"
            >
              View blog (coming soon) →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["Coastal escapes", "Urban long weekends", "Family-friendly tours"].map(
              (title) => (
                <article
                  key={title}
                  className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] bg-[var(--color-sand-muted)]" />
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ocean)]">
                      Preview
                    </p>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-[var(--color-ink)]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Content will connect to your RSS feed in a later step.
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      <HomeSpecialsGroupsSection />

      <section
        id="why-travel"
        className="border-b border-[var(--color-border)] bg-[var(--color-sand)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
            Why travel with us
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
            Whether you already have a dream destination or you&apos;re still
            exploring ideas, we&apos;re here to turn inspiration into a
            well-organized trip.
          </p>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
              >
                <h3 className="font-serif text-xl font-semibold text-[var(--color-ocean-deep)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeAboutSection />
    </div>
  );
}
