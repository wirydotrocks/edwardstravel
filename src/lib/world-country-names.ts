import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";

type CountryProperties = { name: string };

let sortedNames: string[] | null = null;

function countryNames(): string[] {
  if (sortedNames) return sortedNames;
  const topo = countries110m as unknown as Topology;
  const collection = feature(
    topo,
    topo.objects.countries,
  ) as FeatureCollection<Geometry, CountryProperties>;
  const names = collection.features
    .map((f) => (f.properties as CountryProperties | null)?.name?.trim())
    .filter((name): name is string => Boolean(name));
  sortedNames = [...new Set(names)].sort((a, b) => b.length - a.length);
  return sortedNames;
}

function hasWordBoundary(hay: string, start: number, length: number): boolean {
  const before = start === 0 ? " " : hay[start - 1] ?? " ";
  const after = hay[start + length] ?? " ";
  return !/\w/.test(before) && !/\w/.test(after);
}

/** Last country name mentioned in a single text blob (longest-name matches first). */
export function findLastCountryInText(text: string): string | null {
  const hay = text.toLowerCase();
  let best: { name: string; index: number } | null = null;

  for (const name of countryNames()) {
    const needle = name.toLowerCase();
    let from = 0;
    while (from < hay.length) {
      const index = hay.indexOf(needle, from);
      if (index === -1) break;
      if (hasWordBoundary(hay, index, needle.length)) {
        if (!best || index > best.index) {
          best = { name, index };
        }
      }
      from = index + 1;
    }
  }

  return best?.name ?? null;
}
