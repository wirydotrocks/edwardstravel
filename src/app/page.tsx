import Image from "next/image";
import Link from "next/link";

const highlights = [
  {
    title: "Curated experiences",
    body: "Hand-picked tours and moments that match how you like to travel — relaxed, adventurous, or something in between.",
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
      <section className="relative isolate min-h-[min(85vh,52rem)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-ocean-deep)]/90 via-[var(--color-ocean-deep)]/55 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[min(85vh,52rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-sand)]/90">
            Edwards Travel
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Go farther—with a plan that feels effortless.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/90">
            Discover experiences and destinations worth slowing down for. Tell
            us where you&apos;d like to go, and we&apos;ll help you get there.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/search-trips"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
            >
              Search trips
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16 sm:py-20">
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

      <section className="bg-[var(--color-sand)] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
                Stories &amp; inspiration
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

      <section className="bg-[var(--color-ocean-deep)] py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready when you are
          </h2>
          <p className="mt-4 text-white/85">
            Share your destination ideas, month, and how long you&apos;d like to
            be away—we&apos;ll follow up with thoughtful options.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-[var(--color-coral)] px-8 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
