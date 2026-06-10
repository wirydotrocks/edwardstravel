import Image from "next/image";
import Link from "next/link";
import { HomeAboutSection } from "@/components/HomeAboutSection";
import { HomeExploreCountriesPreview } from "@/components/HomeExploreCountriesPreview";
import { HomeHero } from "@/components/HomeHero";
import { HomeSpecialsGroupsSection } from "@/components/HomeSpecialsGroupsSection";

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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />

      {/* Explore map promo; id used by SiteHeader for solid bar */}
      <section
        id="explore-countries"
        className="border-b border-[var(--color-border)] bg-[var(--color-sand)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-ocean-deep)] sm:text-4xl">
                Explore Countries
              </h2>
              <p className="mt-4 max-w-xl text-[var(--color-muted)]">
                Not sure where to start? Our interactive world map lets you
                click any country to highlight, zoom and pan around the globe
                to discover what you can do.
              </p>
              <p className="mt-3 max-w-xl text-[var(--color-muted)]">
                Pick a destination that catches your eye, then look up popular
                activities and start shaping a trip that fits how you like to
                travel.
              </p>
              <Link
                href="/explore-countries"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Explore the map
              </Link>
            </div>
            <HomeExploreCountriesPreview />
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
            well organized trip.
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
