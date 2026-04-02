"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { mainNav } from "@/lib/nav";

const ctaClassName =
  "shrink-0 rounded-full bg-[var(--color-coral)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105";

/** Sample just under the sticky bar to see which home section is behind it */
const HEADER_BAR_PX = 64;
const PROBE_OFFSET_PX = 12;

/**
 * Find the nearest `<section>` ancestor of whatever is under the probe point
 * (parallax layers use `pointer-events: none`, so we hit real content).
 */
function homeSectionUnderProbe(probeY: number): HTMLElement | null {
  const x = Math.min(window.innerWidth - 8, Math.max(8, window.innerWidth / 2));
  const stack = document.elementsFromPoint(x, probeY);
  for (const node of stack) {
    let el: HTMLElement | null = node instanceof HTMLElement ? node : null;
    while (el && el !== document.body) {
      if (el.tagName === "SECTION") return el;
      el = el.parentElement;
    }
  }
  return null;
}

/**
 * Opaque bar on light bands; transparent on hero + photo parallax bands.
 * Uses a viewport probe so scrolling past “Stories” doesn’t leave the bar
 * stuck solid over Specials / About.
 */
function computeHomeHeaderSolid() {
  const probeY = HEADER_BAR_PX + PROBE_OFFSET_PX;
  const sec = homeSectionUnderProbe(probeY);

  if (!sec) {
    return window.scrollY > window.innerHeight * 0.75;
  }

  if (sec.getAttribute("aria-label") === "Hero") {
    return false;
  }

  switch (sec.id) {
    case "stories-inspiration":
    case "why-travel":
      return true;
    case "home-specials-groups":
    case "about":
      return false;
    default:
      return true;
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(() => pathname !== "/");

  useLayoutEffect(() => {
    if (pathname !== "/") {
      setSolid(true);
      return;
    }
    setSolid(computeHomeHeaderSolid());
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      setSolid(true);
      return;
    }

    const sync = () => setSolid(computeHomeHeaderSolid());

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [pathname]);

  const transparent = !solid;

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300 ${
        transparent
          ? "border-transparent bg-[var(--color-ocean-deep)]/25 shadow-none backdrop-blur-md supports-[backdrop-filter]:bg-white/10"
          : "border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/95 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:contents md:gap-0">
          <BrandLogo overDarkPhoto={transparent} priority />
          <nav
            className="hidden items-center gap-1 md:flex md:flex-1 md:justify-center"
            aria-label="Main navigation"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  transparent
                    ? "text-white/90 hover:bg-white/15 hover:text-white"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-sand-muted)] hover:text-[var(--color-ocean)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact?topic=plan-trip" className={ctaClassName}>
            Start your trip today
          </Link>
        </div>
        <nav
          className="-mx-1 flex gap-0.5 overflow-x-auto px-1 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Mobile navigation"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                transparent
                  ? "text-white/90 hover:bg-white/15"
                  : "text-[var(--color-ink)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
