import Image from "next/image";
import Link from "next/link";
import { BlogFeed } from "@/components/BlogFeed";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeHero } from "@/components/HomeHero";
import { HomeSpecialsGroupsSection } from "@/components/HomeSpecialsGroupsSection";
import { loadEdwardsRssSafe } from "@/lib/edwards-rss";

export const revalidate = 300;

const highlights = [
  {
    title: "Thoughtful experiences",
    body: "Hand-picked tours and moments that match how you like to travel whether it be relaxed, adventurous, or something in between.",
    imageSrc:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Scenic lake and mountains at sunrise, representing a thoughtfully chosen destination",
  },
  {
    title: "Real guidance",
    body: "We handle the details so you can focus on the scenery, the culture, and the people you travel with.",
    imageSrc:
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "Travelers on a scenic coastal path, representing guidance from planning through the journey",
  },
  {
    title: "Built around you",
    body: "Destinations, timing, and trip length shaped around your calendar, budget, and bucket list.",
    imageSrc:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Passport, camera, and travel essentials laid out, representing a trip tailored to you",
  },
];

export default async function Home() {
  const feed = await loadEdwardsRssSafe();
  const storyItems = feed.ok ? feed.items.slice(0, 3) : [];

  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />

      {/* Stories first — why visitors came to the site; id used by SiteHeader for solid bar */}
      <section
        id="stories-inspiration"
        className="border-b border-[var(--color-border)] bg-[var(--color-sand)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
                Stories &amp; Inspiration
              </h2>
              <p className="mt-3 max-w-xl text-[var(--color-muted)]">
                Latest posts from our RSS feed. Open any story to read the full
                article on the blog, or explore experiences and destinations
                as you plan.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex w-fit items-center text-sm font-semibold text-[var(--color-ocean)] underline-offset-4 hover:underline"
            >
              View blog →
            </Link>
          </div>
          {!feed.ok ? (
            <div
              className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 text-sm text-[var(--color-muted)]"
              role="alert"
            >
              <p className="font-medium text-[var(--color-ink)]">
                We couldn&apos;t load stories right now.
              </p>
              <p className="mt-1">{feed.message}</p>
            </div>
          ) : storyItems.length > 0 ? (
            <BlogFeed items={storyItems} />
          ) : (
            <p className="mt-10 text-[var(--color-muted)]">
              No posts are in the feed yet. Check back soon.
            </p>
          )}
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
                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full bg-[var(--color-sand-muted)]">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-[var(--color-ocean-deep)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HomeAboutSection />
    </div>
  );
}
