const MAP_SHELL_FULL = "map-shell map-shell--full";
const MAP_SHELL_PREVIEW = "map-shell map-shell--preview";

export function ExploreCountriesMapSkeleton() {
  return (
    <div className="space-y-4">
      <div
        className="h-12 w-full rounded-xl bg-[var(--color-surface)]"
        aria-hidden
      />
      <div className={MAP_SHELL_FULL} aria-hidden />
    </div>
  );
}

export { MAP_SHELL_FULL, MAP_SHELL_PREVIEW };
