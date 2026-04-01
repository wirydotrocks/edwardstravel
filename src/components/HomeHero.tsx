"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Hero background — set URL here (local: "/file.jpg" in /public, or allowed remote host in next.config.ts) */
const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1661963047742-dabc5a735357?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export function HomeHero() {
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onMq);

    const onScroll = () => {
      if (mq.matches) {
        setParallaxY(0);
        return;
      }
      setParallaxY(window.scrollY * 0.36);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section
      className="relative isolate -mt-16 overflow-hidden pt-16"
      aria-label="Hero"
    >
      {/* Full-bleed background — taller than viewport so parallax doesn’t clip */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={
            reduceMotion
              ? "absolute inset-0 h-full w-full"
              : "absolute inset-0 h-[125%] w-full min-h-[100svh]"
          }
          style={
            reduceMotion
              ? undefined
              : { transform: `translate3d(0, calc(-10% + ${parallaxY}px), 0)` }
          }
        >
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--color-ocean-deep)]/50 via-black/35 to-[var(--color-ocean-deep)]/78"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-4xl flex-col items-center justify-center px-4 pb-24 pt-10 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/90">
          Edwards Travel
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
          Go farther with a plan that feels effortless.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/90 drop-shadow-sm">
          Discover experiences and destinations worth slowing down for. Tell us
          where you&apos;d like to go, and we&apos;ll help you get there.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-105"
          >
            Start your trip today
          </Link>
          <Link
            href="/search-trips"
            className="inline-flex items-center justify-center rounded-full border-2 border-white/45 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Search trips
          </Link>
        </div>
      </div>
    </section>
  );
}
