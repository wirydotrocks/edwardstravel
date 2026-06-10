"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import type { Feature, FeatureCollection, Geometry, Polygon } from "geojson";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";
import {
  countryAlpha2,
  countryFlagUrl,
  snapFlagcdnWidth,
} from "@/lib/country-flags";
import { countryHoverMode } from "@/lib/country-hover-mode";

type CountryProperties = { name: string };
type CountryFeature = Feature<Geometry, CountryProperties>;
type PolygonFeature = Feature<Polygon, CountryProperties>;

/** Standard flag width:height (covers most national flags). */
const FLAG_ASPECT = 3 / 2;

type MapPolygon = {
  country: CountryFeature;
  polygonIndex: number;
  feature: PolygonFeature;
};

function polygonKey(countryIdValue: string, polygonIndex: number): string {
  return `${countryIdValue}::${polygonIndex}`;
}

function explodeCountryPolygons(countries: CountryFeature[]): MapPolygon[] {
  const polygons: MapPolygon[] = [];

  for (const country of countries) {
    const { geometry } = country;

    if (geometry.type === "Polygon") {
      polygons.push({
        country,
        polygonIndex: 0,
        feature: country as PolygonFeature,
      });
      continue;
    }

    if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((coordinates, polygonIndex) => {
        polygons.push({
          country,
          polygonIndex,
          feature: {
            type: "Feature",
            id: country.id,
            properties: country.properties,
            geometry: { type: "Polygon", coordinates },
          },
        });
      });
      continue;
    }

    polygons.push({
      country,
      polygonIndex: 0,
      feature: {
        type: "Feature",
        id: country.id,
        properties: country.properties,
        geometry: { type: "Polygon", coordinates: [] },
      },
    });
  }

  return polygons.filter((entry) => entry.feature.geometry.coordinates.length > 0);
}

type FlagImageLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  preserveAspectRatio: "none" | "xMidYMid meet";
};

/** Wide countries (Russia, Chile, …) get a full-width stretch so all stripes stay visible. */
const WIDE_COUNTRY_ASPECT = FLAG_ASPECT * 1.25;

function flagCoverLayout(
  pathGenerator: ReturnType<typeof geoPath>,
  geo: CountryFeature,
): FlagImageLayout | null {
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(geo);
  const bboxW = x1 - x0;
  const bboxH = y1 - y0;
  if (bboxW <= 0 || bboxH <= 0) return null;

  const bboxAspect = bboxW / bboxH;

  if (bboxAspect >= WIDE_COUNTRY_ASPECT) {
    return {
      x: x0,
      y: y0,
      width: bboxW,
      height: bboxH,
      preserveAspectRatio: "none",
    };
  }

  const [cx, cy] = pathGenerator.centroid(geo);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

  const halfW = Math.max(cx - x0, x1 - cx);
  const halfH = Math.max(cy - y0, y1 - cy);

  let imgW = halfW * 2;
  let imgH = halfH * 2;

  if (imgW / imgH > FLAG_ASPECT) {
    imgH = imgW / FLAG_ASPECT;
  } else {
    imgW = imgH * FLAG_ASPECT;
  }

  if (imgW < bboxW) {
    imgW = bboxW;
    imgH = imgW / FLAG_ASPECT;
  }
  if (imgH < bboxH) {
    imgH = bboxH;
    imgW = imgH * FLAG_ASPECT;
  }

  return {
    x: cx - imgW / 2,
    y: cy - imgH / 2,
    width: imgW,
    height: imgH,
    preserveAspectRatio: "xMidYMid meet",
  };
}

function safeDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

const DEFAULT_FILL = "#c8d1db";
const SELECTED_FILL = "var(--color-ocean)";
const HOVER_FILL = "#b0bcc8";
const STROKE = "#f4f8fd";
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

function countryId(geo: CountryFeature): string {
  return String(geo.id ?? geo.properties?.name ?? "");
}

function countryName(geo: CountryFeature): string {
  return geo.properties?.name ?? "Unknown";
}

const zoomButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white/95 text-lg font-semibold text-[var(--color-ocean-deep)] shadow-sm transition hover:bg-[var(--color-sand)]";

function CountryFlagImage({
  alpha2,
  width = 28,
  className,
}: {
  alpha2: string;
  width?: number;
  className?: string;
}) {
  const height = Math.round(width * 0.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external flag CDN, not in next/image config
    <img
      src={countryFlagUrl(alpha2, width * 2)}
      alt=""
      width={width}
      height={height}
      className={`rounded-sm border border-black/10 object-cover shadow-sm ${className ?? ""}`}
      loading="lazy"
      decoding="async"
    />
  );
}

function HoveredCountryFlag({
  geo,
  pathGenerator,
  alpha2,
  copy,
  polygonKeyValue,
  flagWidth,
}: {
  geo: CountryFeature;
  pathGenerator: ReturnType<typeof geoPath>;
  alpha2: string;
  copy: number;
  polygonKeyValue: string;
  flagWidth: number;
}) {
  const d = pathGenerator(geo);
  const layout = flagCoverLayout(pathGenerator, geo);
  if (!d || !layout) return null;

  const clipId = `hover-flag-clip-${copy}-${safeDomId(polygonKeyValue)}`;

  return (
    <g pointerEvents="none" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={countryFlagUrl(alpha2, flagWidth)}
          x={layout.x}
          y={layout.y}
          width={layout.width}
          height={layout.height}
          preserveAspectRatio={layout.preserveAspectRatio}
        />
      </g>
    </g>
  );
}

/** One flag spanning the full country bounds, clipped to every part (archipelagos, etc.). */
function HoveredUnitedCountryFlag({
  country,
  polygons,
  pathGenerator,
  alpha2,
  copy,
  flagWidth,
}: {
  country: CountryFeature;
  polygons: MapPolygon[];
  pathGenerator: ReturnType<typeof geoPath>;
  alpha2: string;
  copy: number;
  flagWidth: number;
}) {
  const layout = flagCoverLayout(pathGenerator, country);
  if (!layout || polygons.length === 0) return null;

  const clipId = `hover-flag-united-${copy}-${safeDomId(countryId(country))}`;

  return (
    <g pointerEvents="none" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          {polygons.map(({ feature, polygonIndex }) => {
            const d = pathGenerator(feature);
            if (!d) return null;
            return <path key={polygonIndex} d={d} />;
          })}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={countryFlagUrl(alpha2, flagWidth)}
          x={layout.x}
          y={layout.y}
          width={layout.width}
          height={layout.height}
          preserveAspectRatio={layout.preserveAspectRatio}
        />
      </g>
    </g>
  );
}

const MAP_COPIES = [-1, 0, 1] as const;

function wrapPanX(x: number, scale: number, worldWidth: number): number {
  const period = worldWidth * scale;
  if (period <= 0) return 0;
  return ((x + period / 2) % period + period) % period - period / 2;
}

function clampPanY(y: number, scale: number, worldHeight: number): number {
  const limit = (worldHeight * (scale - 1)) / 2;
  return Math.max(-limit, Math.min(limit, y));
}

function constrainMapTransform(
  x: number,
  y: number,
  scale: number,
  worldWidth: number,
  worldHeight: number,
) {
  return zoomIdentity
    .translate(
      wrapPanX(x, scale, worldWidth),
      clampPanY(y, scale, worldHeight),
    )
    .scale(scale);
}

function CountryPaths({
  mapPolygons,
  pathGenerator,
  selectedId,
  hoveredCountryId,
  hoveredPolygonKey,
  keyPrefix,
  onSelect,
  onHover,
  onUnhover,
  preview = false,
}: {
  mapPolygons: MapPolygon[];
  pathGenerator: ReturnType<typeof geoPath>;
  selectedId: string | null;
  hoveredCountryId: string | null;
  hoveredPolygonKey: string | null;
  keyPrefix: string;
  onSelect: (countryIdValue: string) => void;
  onHover: (country: CountryFeature, polygonKeyValue: string) => void;
  onUnhover: () => void;
  preview?: boolean;
}) {
  return (
    <>
      {mapPolygons.map(({ country, polygonIndex, feature }) => {
        const id = countryId(country);
        const partKey = polygonKey(id, polygonIndex);
        const d = pathGenerator(feature);
        if (!d) return null;
        const isSelected = selectedId === id;
        const hoverMode = countryHoverMode(country);
        const isHovered =
          !isSelected &&
          (hoverMode === "polygon"
            ? hoveredPolygonKey === partKey
            : hoveredCountryId === id);
        const fill = isSelected
          ? SELECTED_FILL
          : isHovered
            ? HOVER_FILL
            : DEFAULT_FILL;
        return (
          <path
            key={`${keyPrefix}-${partKey}`}
            d={d}
            fill={fill}
            stroke={STROKE}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
            className={preview ? undefined : "cursor-pointer"}
            onClick={preview ? undefined : () => onSelect(id)}
            onMouseEnter={
              preview ? undefined : () => onHover(country, partKey)
            }
            onMouseLeave={preview ? undefined : onUnhover}
            onFocus={preview ? undefined : () => onHover(country, partKey)}
            onBlur={preview ? undefined : onUnhover}
            tabIndex={preview ? -1 : 0}
            aria-hidden={preview ? true : undefined}
            aria-label={preview ? undefined : countryName(country)}
          />
        );
      })}
    </>
  );
}

export function ExploreCountriesMap({ preview = false }: { preview?: boolean } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ReturnType<
    typeof zoom<SVGSVGElement, unknown>
  > | null>(null);
  const [size, setSize] = useState({ width: 960, height: 520 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const [hoveredPolygonKey, setHoveredPolygonKey] = useState<string | null>(null);

  const handlePolygonHover = (country: CountryFeature, partKey: string) => {
    const id = countryId(country);
    if (countryHoverMode(country) === "polygon") {
      setHoveredCountryId(null);
      setHoveredPolygonKey(partKey);
    } else {
      setHoveredCountryId(id);
      setHoveredPolygonKey(null);
    }
  };

  const clearHover = () => {
    setHoveredCountryId(null);
    setHoveredPolygonKey(null);
  };
  const [isPanning, setIsPanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const countries = useMemo(() => {
    const topo = countries110m as unknown as Topology;
    const collection = feature(
      topo,
      topo.objects.countries,
    ) as FeatureCollection<Geometry, CountryProperties>;
    return collection.features;
  }, []);

  const mapPolygons = useMemo(
    () => explodeCountryPolygons(countries),
    [countries],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const sync = () => {
      const width = Math.max(280, Math.floor(el.clientWidth));
      setSize({ width, height: Math.round(width * 0.52) });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pathGenerator = useMemo(() => {
    const collection: FeatureCollection = {
      type: "FeatureCollection",
      features: countries,
    };
    const projection = geoNaturalEarth1().fitSize(
      [size.width, size.height],
      collection,
    );
    return geoPath(projection);
  }, [countries, size.height, size.width]);

  useEffect(() => {
    if (preview) return;

    const svgEl = svgRef.current;
    const mapGroupEl = mapGroupRef.current;
    if (!svgEl || !mapGroupEl) return;

    const svg = select(svgEl);
    const mapGroup = select(mapGroupEl);
    const { width, height } = size;
    let syncingTransform = false;

    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .filter((event) => {
        if (event.type === "wheel") {
          event.preventDefault();
          return true;
        }
        if (event.type === "dblclick") return true;
        if (event.type.startsWith("touch")) return true;
        return event.type === "mousedown" && event.button === 0;
      })
      .on("start", () => setIsPanning(true))
      .on("zoom", (event) => {
        if (syncingTransform) return;

        const next = constrainMapTransform(
          event.transform.x,
          event.transform.y,
          event.transform.k,
          width,
          height,
        );

        mapGroup.attr("transform", next.toString());
        setZoomLevel(next.k);

        const drifted =
          Math.abs(next.x - event.transform.x) > 0.5 ||
          Math.abs(next.y - event.transform.y) > 0.5;

        if (drifted) {
          syncingTransform = true;
          svg.call(behavior.transform, next);
          syncingTransform = false;
        }
      })
      .on("end", () => setIsPanning(false));

    zoomBehaviorRef.current = behavior;
    svg.call(behavior);
    svg.call(behavior.transform, zoomIdentity);

    return () => {
      svg.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [preview, size.height, size.width]);

  const zoomIn = () => {
    const svgEl = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svgEl || !behavior) return;
    select(svgEl).call(behavior.scaleBy, 1.35);
  };

  const zoomOut = () => {
    const svgEl = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svgEl || !behavior) return;
    select(svgEl).call(behavior.scaleBy, 1 / 1.35);
  };

  const resetZoom = () => {
    const svgEl = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    if (!svgEl || !behavior) return;
    select(svgEl).call(behavior.transform, zoomIdentity);
  };

  const selectedCountry = useMemo(
    () => countries.find((c) => countryId(c) === selectedId) ?? null,
    [countries, selectedId],
  );

  const unitedHoverPolygons = useMemo(() => {
    if (!hoveredCountryId) return [];
    return mapPolygons.filter(
      (entry) => countryId(entry.country) === hoveredCountryId,
    );
  }, [mapPolygons, hoveredCountryId]);

  const polygonHoverEntry = useMemo(() => {
    if (!hoveredPolygonKey) return null;
    return (
      mapPolygons.find(
        (entry) =>
          polygonKey(countryId(entry.country), entry.polygonIndex) ===
          hoveredPolygonKey,
      ) ?? null
    );
  }, [mapPolygons, hoveredPolygonKey]);

  const hoveredCountry = useMemo(() => {
    if (hoveredCountryId) {
      return countries.find((c) => countryId(c) === hoveredCountryId) ?? null;
    }
    return polygonHoverEntry?.country ?? null;
  }, [countries, hoveredCountryId, polygonHoverEntry]);

  const labelCountry = selectedCountry ?? hoveredCountry;
  const labelAlpha2 = labelCountry ? countryAlpha2(labelCountry) : null;
  const hoveredAlpha2 = hoveredCountry ? countryAlpha2(hoveredCountry) : null;
  const hoverFlagWidth = snapFlagcdnWidth(Math.round(320 * zoomLevel));
  const canZoomOut = zoomLevel > MIN_ZOOM + 0.01;

  return (
    <div className={preview ? undefined : "space-y-4"}>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm ${preview ? "pointer-events-none" : ""}`}
      >
        {!preview ? (
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={zoomIn}
              className={zoomButtonClass}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={zoomOut}
              disabled={!canZoomOut}
              className={`${zoomButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              onClick={resetZoom}
              disabled={!canZoomOut}
              className={`${zoomButtonClass} text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Reset zoom"
            >
              ⟲
            </button>
          </div>
        ) : null}

        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          role="img"
          aria-hidden={preview ? true : undefined}
          aria-label={
            preview
              ? undefined
              : "Interactive world map. Click a country to select it. Scroll or pinch to zoom, drag to pan."
          }
          className={`block w-full select-none ${preview ? "" : `touch-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}`}
        >
          <rect
            width={size.width}
            height={size.height}
            fill="var(--color-sand-muted)"
          />
          <g ref={mapGroupRef}>
            {MAP_COPIES.map((copy) => (
              <g
                key={copy}
                transform={`translate(${copy * size.width}, 0)`}
              >
                <CountryPaths
                  mapPolygons={mapPolygons}
                  pathGenerator={pathGenerator}
                  selectedId={selectedId}
                  hoveredCountryId={hoveredCountryId}
                  hoveredPolygonKey={hoveredPolygonKey}
                  keyPrefix={`copy-${copy}`}
                  preview={preview}
                  onSelect={(id) =>
                    setSelectedId((prev) => (prev === id ? null : id))
                  }
                  onHover={handlePolygonHover}
                  onUnhover={clearHover}
                />
                {!preview && hoveredAlpha2 && hoveredCountryId && hoveredCountry ? (
                  <HoveredUnitedCountryFlag
                    country={hoveredCountry}
                    polygons={unitedHoverPolygons}
                    pathGenerator={pathGenerator}
                    alpha2={hoveredAlpha2}
                    copy={copy}
                    flagWidth={hoverFlagWidth}
                  />
                ) : null}
                {!preview &&
                hoveredAlpha2 &&
                hoveredPolygonKey &&
                polygonHoverEntry ? (
                  <HoveredCountryFlag
                    geo={polygonHoverEntry.feature}
                    pathGenerator={pathGenerator}
                    alpha2={hoveredAlpha2}
                    copy={copy}
                    polygonKeyValue={hoveredPolygonKey}
                    flagWidth={hoverFlagWidth}
                  />
                ) : null}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {!preview ? (
        <div className="flex min-h-[1.5rem] flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--color-muted)]">
          {selectedCountry ? (
            <>
              {labelAlpha2 ? (
                <CountryFlagImage alpha2={labelAlpha2} width={32} />
              ) : null}
              <span className="font-serif text-lg font-semibold leading-none text-[var(--color-ocean-deep)]">
                {countryName(selectedCountry)}
              </span>
              <Link
                href={`/talk-to-roam?country=${encodeURIComponent(countryName(selectedCountry))}`}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-coral)] px-5 py-2.5 text-sm font-semibold leading-none text-white shadow-sm transition hover:brightness-105"
              >
                Ask Roam about Popular Activities
              </Link>
            </>
          ) : labelCountry ? (
            <>
              {labelAlpha2 ? (
                <CountryFlagImage alpha2={labelAlpha2} width={24} />
              ) : null}
              <span className="font-medium text-[var(--color-ocean-deep)]">
                {countryName(labelCountry)}
              </span>
              <span aria-hidden>·</span>
              <span>click to select</span>
            </>
          ) : (
            <span>
              Click a country on the map to highlight it. Scroll to zoom, drag to
              pan.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
