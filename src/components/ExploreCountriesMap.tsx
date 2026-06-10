"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, zoomTransform, type ZoomTransform } from "d3-zoom";
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
import { CountryMapSearch } from "@/components/CountryMapSearch";
import {
  MAP_SHELL_FULL,
  MAP_SHELL_PREVIEW,
} from "@/components/explore-map-shell";

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
const FOCUS_PADDING = 0.82;
const FOCUS_DURATION_MS = 700;

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

function clampPanY(y: number, scale: number, viewportHeight: number): number {
  if (scale <= 1) return 0;
  const minY = viewportHeight * (1 - scale);
  return Math.max(minY, Math.min(0, y));
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

function pickFocusTranslateX(
  baseTx: number,
  scale: number,
  viewportWidth: number,
  currentX: number,
  countryCenterX: number,
): number {
  const period = viewportWidth * scale;
  if (period <= 0) return baseTx;

  const east = countryCenterX >= viewportWidth / 2;
  const nCenter = Math.round((currentX - baseTx) / period);
  const candidates = [nCenter - 1, nCenter, nCenter + 1].map(
    (n) => baseTx + n * period,
  );

  if (east) {
    const westward = candidates.filter((candidate) => candidate <= currentX);
    if (westward.length > 0) {
      return Math.max(...westward);
    }
    return Math.min(...candidates.filter((candidate) => candidate > currentX));
  }

  const eastward = candidates.filter((candidate) => candidate >= currentX);
  if (eastward.length > 0) {
    return Math.min(...eastward);
  }
  return Math.max(...candidates.filter((candidate) => candidate < currentX));
}

function computeFocusTransform(
  country: CountryFeature,
  pathGenerator: ReturnType<typeof geoPath>,
  viewportWidth: number,
  viewportHeight: number,
  currentX: number,
): { transform: ZoomTransform; translateX: number } {
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(country);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const bw = Math.max(x1 - x0, 4);
  const bh = Math.max(y1 - y0, 4);

  const k = Math.min(
    MAX_ZOOM,
    Math.max(
      MIN_ZOOM,
      FOCUS_PADDING * Math.min(viewportWidth / bw, viewportHeight / bh),
    ),
  );

  const baseTx = viewportWidth / 2 - k * cx;
  const ty = viewportHeight / 2 - k * cy;
  const tx = pickFocusTranslateX(
    baseTx,
    k,
    viewportWidth,
    currentX,
    cx,
  );

  return {
    transform: constrainMapTransform(tx, ty, k, viewportWidth, viewportHeight),
    translateX: tx,
  };
}

function animateMapTransform(
  svgEl: SVGSVGElement,
  behavior: ReturnType<typeof zoom<SVGSVGElement, unknown>>,
  target: ZoomTransform,
  viewportWidth: number,
  viewportHeight: number,
  durationMs: number,
  endTranslateX = target.x,
): () => void {
  const svg = select(svgEl);
  const start = zoomTransform(svgEl);
  const startTime = performance.now();
  let frameId = 0;

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / durationMs);
    const ease = 1 - (1 - progress) ** 3;
    const x = start.x + (endTranslateX - start.x) * ease;
    const y = start.y + (target.y - start.y) * ease;
    const k = start.k + (target.k - start.k) * ease;
    const next =
      progress >= 1
        ? target
        : zoomIdentity
            .translate(x, clampPanY(y, k, viewportHeight))
            .scale(k);
    svg.call(behavior.transform, next);
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frameId);
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

export function ExploreCountriesMap() {
  return <WorldMap preview={false} />;
}

export function ExploreCountriesMapPreview() {
  return <WorldMap preview={true} />;
}

function WorldMap({ preview }: { preview: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ReturnType<
    typeof zoom<SVGSVGElement, unknown>
  > | null>(null);
  const focusAnimationCancelRef = useRef<(() => void) | null>(null);
  const prevSelectedIdRef = useRef<string | null>(null);
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
      const { width, height } = el.getBoundingClientRect();
      const nextWidth = Math.floor(width);
      const nextHeight = Math.floor(height);
      if (nextWidth <= 0 || nextHeight <= 0) return;
      setSize({ width: nextWidth, height: nextHeight });
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

  const pathGeneratorRef = useRef(pathGenerator);
  pathGeneratorRef.current = pathGenerator;

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
    svg.call(behavior.transform, zoomTransform(svgEl));

    return () => {
      svg.on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, [preview, size.height, size.width]);

  useEffect(() => {
    if (preview) return;

    const svgEl = svgRef.current;
    const behavior = zoomBehaviorRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !behavior || !containerEl) return;

    focusAnimationCancelRef.current?.();
    focusAnimationCancelRef.current = null;

    const { width, height } = containerEl.getBoundingClientRect();
    const nextWidth = Math.floor(width);
    const nextHeight = Math.floor(height);
    if (nextWidth <= 0 || nextHeight <= 0) return;

    const current = zoomTransform(svgEl);
    const hadSelection = prevSelectedIdRef.current !== null;
    prevSelectedIdRef.current = selectedId;

    if (!selectedId) {
      if (!hadSelection) return;
      focusAnimationCancelRef.current = animateMapTransform(
        svgEl,
        behavior,
        zoomIdentity,
        nextWidth,
        nextHeight,
        FOCUS_DURATION_MS,
      );
      return;
    }

    const country = countries.find((entry) => countryId(entry) === selectedId);
    if (!country) return;

    const next = computeFocusTransform(
      country,
      pathGeneratorRef.current,
      nextWidth,
      nextHeight,
      current.x,
    );

    focusAnimationCancelRef.current = animateMapTransform(
      svgEl,
      behavior,
      next.transform,
      nextWidth,
      nextHeight,
      FOCUS_DURATION_MS,
      next.translateX,
    );

    return () => {
      focusAnimationCancelRef.current?.();
      focusAnimationCancelRef.current = null;
    };
  }, [selectedId, countries, preview]);

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

  const handleSelectCountry = (id: string) => {
    clearHover();
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={preview ? undefined : "flex min-h-0 flex-1 flex-col gap-4"}>
      {!preview ? (
        <div className="shrink-0">
          <CountryMapSearch
            countries={countries}
            selectedCountry={selectedCountry}
            onSelectCountry={(id) => {
              clearHover();
              setSelectedId(id);
            }}
          />
        </div>
      ) : null}
      <div
        ref={containerRef}
        className={`${preview ? MAP_SHELL_PREVIEW : MAP_SHELL_FULL}${preview ? "" : " min-h-0"}`}
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
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-hidden={preview ? true : undefined}
          aria-label={
            preview
              ? undefined
              : "Interactive world map. Click a country to select it. Scroll or pinch to zoom, drag to pan."
          }
          className={`block h-full w-full select-none ${preview ? "" : `touch-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}`}
        >
          <rect
            x={-Math.ceil(size.width * 0.015)}
            y={-Math.ceil(size.height * 0.015)}
            width={size.width + Math.ceil(size.width * 0.03)}
            height={size.height + Math.ceil(size.height * 0.03)}
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
                  onSelect={handleSelectCountry}
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
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--color-muted)]">
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
