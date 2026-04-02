import Link from "next/link";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeHero } from "@/components/HomeHero";

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

      {/* Specials + Groups — between Stories and Why travel */}
      <section
        aria-labelledby="specials-heading"
        className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16 sm:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
          <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
            <h2
              id="specials-heading"
              className="font-serif text-2xl font-semibold text-[var(--color-ocean-deep)] sm:text-3xl"
            >
              Specials
            </h2>
            <p className="mt-4 flex-1 text-[var(--color-muted)]">
              Find the best travel specials with Edward&apos;s Travel. 
              <br />
              Browse our hot travel deals to plan your next trip.
            </p>
            <Link
              href="/specials"
              className="mt-8 inline-flex w-fit rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              View specials
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
            <h2
              id="groups-heading"
              className="font-serif text-2xl font-semibold text-[var(--color-ocean-deep)] sm:text-3xl"
            >
              Groups
            </h2>
            <p className="mt-4 flex-1 text-[var(--color-muted)]">
              The best parts about traveling with a
              group are the experiences, a new network of friends you create
              along the way, and the memories you take home long after your
              vacation is over.
            </p>
            <Link
              href="/group-getaways"
              className="mt-8 inline-flex w-fit rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Group getaways
            </Link>
          </div>
        </div>
      </section>

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

      <section className="bg-[var(--color-ocean-deep)] py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-white/85">
            Share your destination ideas, month, and how long you&apos;d like to
            be away.
            <br />
            We&apos;ll follow up with thoughtful options.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-[var(--color-coral)] px-8 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Start your trip today
          </Link>
        </div>
      </section>
    </div>
  );
}
