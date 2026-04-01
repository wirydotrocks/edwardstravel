import Link from "next/link";
import { mainNav } from "@/lib/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-[var(--color-ocean-deep)]"
        >
          Edwards Travel
        </Link>
        <nav
          className="hidden items-center gap-1 md:flex"
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
        <Link
          href="/search-trips"
          className="hidden shrink-0 rounded-full bg-[var(--color-coral)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 md:inline-flex"
        >
          Plan a trip
        </Link>
        <nav
          className="-mx-1 flex max-w-[min(100%,28rem)] gap-0.5 overflow-x-auto px-1 pb-0 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
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
