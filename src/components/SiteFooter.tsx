import Link from "next/link";
import { mainNav } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-ocean-deep)] text-[var(--color-sand)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold text-white">
              Edwards Travel
            </p>
            <p className="mt-2 max-w-sm text-sm text-white/75">
              Thoughtfully planned journeys and memorable experiences. Your
              adventure starts with a conversation.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Explore
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/85 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/15 pt-8 text-center text-xs text-white/55">
          © {new Date().getFullYear()} Edwards Travel. Planned for{" "}
          <a
            href="https://edwardstravel.com"
            className="underline underline-offset-2 hover:text-white"
          >
            edwardstravel.com
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
