import Image from "next/image";
import { OfficeLocationsFooter } from "@/components/OfficeLocationsBlock";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-ocean-deep)] text-[var(--color-sand)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-0">
          <div className="shrink-0">
            <Image
              src="/edwards-travel-logo.png"
              alt="Edward's Travel"
              width={280}
              height={117}
              className="h-12 w-auto max-w-[220px] opacity-95 sm:h-14 sm:max-w-none"
            />
            <p className="mt-2 max-w-sm text-sm text-white/75">
              Thoughtfully planned journeys and memorable experiences. Your
              adventure starts with a conversation.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Follow us
              </p>
              <a
                href="https://www.facebook.com/Edwardstraveltours"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2.5 text-sm font-medium text-white/85 transition hover:text-white"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/15"
                  aria-hidden
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                Facebook
              </a>
            </div>
          </div>
          <OfficeLocationsFooter className="min-w-0 w-full md:ml-auto md:w-auto" />
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
