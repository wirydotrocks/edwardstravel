import Link from "next/link";
import { mainNav } from "@/lib/nav";

const ctaClassName =
  "shrink-0 rounded-full bg-[var(--color-coral)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:h-16 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0 lg:px-8">
        <div className="flex items-center justify-between gap-3 md:contents md:gap-0">
          <Link
            href="/"
            className="font-serif text-xl font-semibold tracking-tight text-[var(--color-ocean-deep)]"
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
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-sand-muted)] hover:text-[var(--color-ocean)]"
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
              className="shrink-0 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
