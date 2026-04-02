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
