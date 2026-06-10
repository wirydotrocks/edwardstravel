import type { Feature, Geometry } from "geojson";

type CountryFeature = Feature<Geometry, { name?: string }>;

/**
 * Countries whose polygons are far apart (mainland vs overseas territories).
 * Hover highlights one polygon at a time — France mainland vs French Guiana, etc.
 */
const POLYGON_HOVER_ISO_NUMERIC = new Set([
  "250", // France
]);

export type CountryHoverMode = "country" | "polygon";

/** Default: hover any part → whole country highlights (SEA, East Asia, archipelagos). */
export function countryHoverMode(country: CountryFeature): CountryHoverMode {
  const id = country.id != null ? String(country.id) : null;
  if (id && POLYGON_HOVER_ISO_NUMERIC.has(id)) return "polygon";
  return "country";
}
