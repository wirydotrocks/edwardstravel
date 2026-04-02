"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SPECIALS_GROUPS_BG =
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=90&w=3840";

export function HomeSpecialsGroupsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const updateParallax = useCallback(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setParallaxY(0);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const centerDelta = rect.top + rect.height / 2 - vh / 2;
    const raw = centerDelta * -0.06;
    setParallaxY(Math.max(-28, Math.min(28, raw)));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onMq = () => {
      setReduceMotion(mq.matches);
      updateParallax();
    };
    mq.addEventListener("change", onMq);
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    return () => {
      mq.removeEventListener("change", onMq);
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
    };
  }, [updateParallax]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="specials-heading"
      className="relative isolate flex min-h-[min(62vh,48rem)] flex-col justify-center overflow-hidden border-b border-[var(--color-border)] py-24 sm:py-32 md:py-40"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={
              reduceMotion
                ? "absolute inset-0 h-full w-full"
                : "absolute inset-0 h-[118%] w-full"
            }
            style={
              reduceMotion
                ? undefined
                : { transform: `translate3d(0, calc(-8% + ${parallaxY}px), 0)` }
            }
          >
            <Image
              src={SPECIALS_GROUPS_BG}
              alt=""
              fill
              quality={92}
              sizes="(min-width: 1536px) 1600px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ocean-deep)]/35 via-black/18 to-[var(--color-ocean-deep)]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_45%,rgba(12,28,48,0.22)_0%,transparent_58%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <div className="flex flex-col rounded-2xl border border-white/35 bg-white/[0.14] p-6 shadow-lg shadow-black/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/10 sm:p-8">
          <h2
            id="specials-heading"
            className="font-serif text-2xl font-semibold text-white [text-shadow:_0_1px_12px_rgba(0,0,0,0.45)] sm:text-3xl"
          >
            Specials
          </h2>
          <p className="mt-4 flex-1 text-[15px] leading-relaxed text-white/92 [text-shadow:_0_1px_8px_rgba(0,0,0,0.35)] sm:text-base">
            Find the best travel specials with Edward&apos;s Travel.
            <br />
            Browse our hot travel deals to plan your next trip.
          </p>
          <Link
            href="/specials"
            className="mt-8 inline-flex w-fit rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
          >
            View specials
          </Link>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/35 bg-white/[0.14] p-6 shadow-lg shadow-black/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/10 sm:p-8">
          <h2
            id="groups-heading"
            className="font-serif text-2xl font-semibold text-white [text-shadow:_0_1px_12px_rgba(0,0,0,0.45)] sm:text-3xl"
          >
            Groups
          </h2>
          <p className="mt-4 flex-1 text-[15px] leading-relaxed text-white/92 [text-shadow:_0_1px_8px_rgba(0,0,0,0.35)] sm:text-base">
            Join our group getaways! The best parts about traveling with a group
            are the experiences, a new network of friends you create along the
            way, and the memories you take home long after your vacation is over.
          </p>
          <Link
            href="/group-getaways"
            className="mt-8 inline-flex w-fit rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
          >
            Group getaways
          </Link>
        </div>
      </div>
    </section>
  );
}
