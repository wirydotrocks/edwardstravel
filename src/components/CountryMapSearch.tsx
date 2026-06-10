"use client";

import type { Feature, Geometry } from "geojson";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type CountryFeature = Feature<Geometry, { name?: string }>;

function countryName(geo: CountryFeature): string {
  return geo.properties?.name ?? "Unknown";
}

function countryId(geo: CountryFeature): string {
  return String(geo.id ?? geo.properties?.name ?? "");
}

export function CountryMapSearch({
  countries,
  selectedCountry,
  onSelectCountry,
}: {
  countries: CountryFeature[];
  selectedCountry: CountryFeature | null;
  onSelectCountry: (countryId: string) => void;
}) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const sortedCountries = useMemo(
    () =>
      [...countries].sort((a, b) =>
        countryName(a).localeCompare(countryName(b)),
      ),
    [countries],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return sortedCountries
      .filter((country) => countryName(country).toLowerCase().includes(needle))
      .slice(0, 10);
  }, [query, sortedCountries]);

  useEffect(() => {
    setQuery(selectedCountry ? countryName(selectedCountry) : "");
  }, [selectedCountry]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const pickCountry = (country: CountryFeature) => {
    onSelectCountry(countryId(country));
    setQuery(countryName(country));
    setOpen(false);
  };

  const showResults = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search for a country
      </label>
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={showResults ? `${listId}-listbox` : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          showResults && results[activeIndex]
            ? `${listId}-option-${activeIndex}`
            : undefined
        }
        placeholder="Search for a country…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showResults || results.length === 0) return;

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter") {
            event.preventDefault();
            pickCountry(results[activeIndex] ?? results[0]!);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-ink)] shadow-sm outline-none ring-[var(--color-ocean)]/40 placeholder:text-[var(--color-muted)] focus:ring-2"
      />

      {showResults ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-[var(--color-muted)]">
              No countries found
            </li>
          ) : (
            results.map((country, index) => {
              const name = countryName(country);
              const isActive = index === activeIndex;
              return (
                <li key={countryId(country)} role="presentation">
                  <button
                    id={`${listId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => pickCountry(country)}
                    className={`flex w-full px-4 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-[var(--color-sand)] text-[var(--color-ocean-deep)]"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-sand)]/70"
                    }`}
                  >
                    {name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
