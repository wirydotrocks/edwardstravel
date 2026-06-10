"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import countries110m from "world-atlas/countries-110m.json";

type CountryProperties = { name: string };
type CountryFeature = Feature<Geometry, CountryProperties>;

const DEFAULT_FILL = "#c8d1db";
const SELECTED_FILL = "var(--color-ocean)";
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
  countries,
  pathGenerator,
  selectedId,
  hoveredId,
  keyPrefix,
  onSelect,
  onHover,
  onUnhover,
}: {
  countries: CountryFeature[];
  pathGenerator: ReturnType<typeof geoPath>;
  selectedId: string | null;
  hoveredId: string | null;
  keyPrefix: string;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  onUnhover: () => void;
}) {
  return (
    <>
      {countries.map((geo) => {
        const id = countryId(geo);
        const d = pathGenerator(geo);
        if (!d) return null;
        const isSelected = selectedId === id;
        const isHovered = hoveredId === id && !isSelected;
        return (
          <path
            key={`${keyPrefix}-${id}`}
            d={d}
            fill={isSelected ? SELECTED_FILL : DEFAULT_FILL}
            stroke={STROKE}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
            className="cursor-pointer transition-[fill] duration-200"
            style={isHovered ? { fill: "#b0bcc8" } : undefined}
            onClick={() => onSelect(id)}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={onUnhover}
            onFocus={() => onHover(id)}
            onBlur={onUnhover}
            tabIndex={0}
            aria-label={countryName(geo)}
          />
        );
      })}
    </>
  );
}

export function ExploreCountriesMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapGroupRef = useRef<SVGGElement>(null);
  const zoomBehaviorRef = useRef<ReturnType<
    typeof zoom<SVGSVGElement, unknown>
  > | null>(null);
  const [size, setSize] = useState({ width: 960, height: 520 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
  }, [size.height, size.width]);

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

  const hoveredCountry = useMemo(
    () => countries.find((c) => countryId(c) === hoveredId) ?? null,
    [countries, hoveredId],
  );

  const labelCountry = selectedCountry ?? hoveredCountry;
  const canZoomOut = zoomLevel > MIN_ZOOM + 0.01;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
      >
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

        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          role="img"
          aria-label="Interactive world map. Click a country to select it. Scroll or pinch to zoom, drag to pan."
          className={`block w-full touch-none select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
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
                  countries={countries}
                  pathGenerator={pathGenerator}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  keyPrefix={`copy-${copy}`}
                  onSelect={(id) =>
                    setSelectedId((prev) => (prev === id ? null : id))
                  }
                  onHover={setHoveredId}
                  onUnhover={() => setHoveredId(null)}
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="flex min-h-[1.5rem] flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--color-muted)]">
        {selectedCountry ? (
          <>
            <span className="font-medium text-[var(--color-ocean-deep)]">
              {countryName(selectedCountry)}
            </span>
            <span aria-hidden>·</span>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-coral)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Look up popular activities
            </button>
          </>
        ) : labelCountry ? (
          <>
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
    </div>
  );
}
