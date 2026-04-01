"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/** High-res source; `quality` on Image improves encoded sharpness */
const ABOUT_BG_IMAGE =
  "https://plus.unsplash.com/premium_photo-1725408032701-45831d3e6ad0?q=90&w=3840&auto=format&fit=crop&ixlib=rb-4.1.0";

export function HomeAboutSection() {
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
    /* How far the section center is from the viewport center — small, bounded */
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
      id="about"
      className="relative overflow-hidden border-t border-[var(--color-border)] py-16 sm:py-24"
      aria-labelledby="home-about-heading"
    >
      {/* Background: extra vertical room so small translate never shows gaps */}
      <div className="pointer-events-none absolute inset-0 -top-px -bottom-px" aria-hidden>
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
              src={ABOUT_BG_IMAGE}
              alt=""
              fill
              quality={92}
              sizes="(min-width: 1536px) 1600px, 100vw"
              className="object-cover object-center"
              priority={false}
            />
          </div>
        </div>
        {/* Lighter scrim so the photo stays visible; text still readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ocean-deep)]/45 via-black/25 to-[var(--color-ocean-deep)]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(15,35,55,0.35)_0%,transparent_65%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2
          id="home-about-heading"
          className="font-serif text-3xl font-semibold tracking-tight text-white [text-shadow:_0_2px_16px_rgba(0,0,0,0.45)] sm:text-4xl"
        >
          About us
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white [text-shadow:_0_1px_10px_rgba(0,0,0,0.4)] sm:text-lg">
          Thoughtful trips, personal service, and a team that stays with you
          from first ideas to takeoff. Meet the people behind Edward&apos;s Travel.
        </p>
        <Link
          href="/about"
          className="mt-8 inline-flex rounded-full bg-[var(--color-coral)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
        >
          Meet the team
        </Link>
      </div>
    </section>
  );
}
