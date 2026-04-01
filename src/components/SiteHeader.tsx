"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { mainNav } from "@/lib/nav";

const ctaClassName =
  "shrink-0 rounded-full bg-[var(--color-coral)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105";

/** When #why-travel’s top passes under the header bar, use solid styles */
const HEADER_BAR_PX = 64;

function computeHomeHeaderSolid() {
  const section = document.getElementById("why-travel");
  if (!section) {
    return window.scrollY > window.innerHeight * 0.75;
  }
  return section.getBoundingClientRect().top <= HEADER_BAR_PX;
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
          ? "border-transparent bg-white/[0.07] shadow-none backdrop-blur-[2px]"
          : "border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/95 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:contents md:gap-0">
          <Link
            href="/"
            className={`font-serif text-xl font-semibold tracking-tight transition-colors ${
              transparent
                ? "text-white drop-shadow-md"
                : "text-[var(--color-ocean-deep)]"
            }`}
          >
            Edwards Travel
          </Link>
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
          <Link href="/contact" className={ctaClassName}>
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
