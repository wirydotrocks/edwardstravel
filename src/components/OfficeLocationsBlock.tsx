import { officeLocations } from "@/data/office-locations";

function LocationCard({
  compact,
  location,
}: {
  compact?: boolean;
  location: (typeof officeLocations)[number];
}) {
  return (
    <div
      className={
        compact
          ? "text-sm"
          : "rounded-[1.75rem] border border-[var(--color-border)] bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm"
      }
    >
      <p
        className={
          compact
            ? "font-semibold text-white/95"
            : "font-serif text-base font-semibold text-[var(--color-ocean-deep)]"
        }
      >
        {location.label}
      </p>
      <p
        className={
          compact
            ? "mt-1 text-white/75"
            : "mt-2 text-sm leading-relaxed text-[var(--color-muted)]"
        }
      >
        {location.street}
        <br />
        {location.cityLine}
      </p>
      <p
        className={
          compact ? "mt-2 text-sm text-white/80" : "mt-3 text-sm text-[var(--color-ink)]"
        }
      >
        <span className={compact ? "text-white/55" : "text-[var(--color-muted)]"}>
          Tel{" "}
        </span>
        {location.phones.map((p, i) => (
          <span key={p.tel}>
            {i > 0 && (compact ? " · " : " or ")}
            <a
              href={`tel:${p.tel}`}
              className={
                compact
                  ? "font-medium text-white/90 underline-offset-2 hover:underline"
                  : "font-medium text-[var(--color-ocean)] underline-offset-2 hover:underline"
              }
            >
              {p.display}
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

/** Footer — two offices always side by side */
export function OfficeLocationsFooter({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
        Visit or call
      </p>
      <div className="mt-4 grid grid-cols-2 items-start gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-4">
        {officeLocations.map((loc) => (
          <div key={loc.id} className="min-w-0">
            <LocationCard compact location={loc} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Soft “glob” card for the contact page — readable, secondary to the form */
export function OfficeLocationsGlob() {
  return (
    <div className="rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-sand)] via-white to-[var(--color-sand-muted)]/90 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ocean)]">
        Our offices
      </p>
      <p className="mt-2 font-serif text-lg font-semibold text-[var(--color-ocean-deep)]">
        Edwards Travel
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Reach either location — we&apos;re happy to help.
      </p>
      <div className="mt-6 space-y-5">
        {officeLocations.map((loc) => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>
    </div>
  );
}
