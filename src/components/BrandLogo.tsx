import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/edwards-travel-logo.png";
const LOGO_W = 720;
const LOGO_H = 300;

/**
 * Same padding, radius, and ring width in both modes so nothing jumps.
 * Over the hero: visible frosted chip. On the solid bar: transparent shell so it
 * blends into the header (only the logo art reads).
 */
const shellLayout =
  "inline-flex rounded-xl px-2.5 py-1.5 ring-1 sm:px-3 sm:py-2";

type BrandLogoProps = {
  /** True when the nav is transparent over the hero */
  overDarkPhoto?: boolean;
  priority?: boolean;
  className?: string;
};

export function BrandLogo({
  overDarkPhoto = false,
  priority = false,
  className = "",
}: BrandLogoProps) {
  const shellTone = overDarkPhoto
    ? "bg-white/18 ring-white/35 backdrop-blur-md"
    : "bg-transparent ring-transparent backdrop-blur-none";

  return (
    <Link
      href="/"
      className={`relative inline-flex shrink-0 items-center ${className}`}
      aria-label="Edward's Travel — Home"
    >
      <span className={`${shellLayout} ${shellTone}`}>
        <Image
          src={LOGO_SRC}
          alt=""
          width={LOGO_W}
          height={LOGO_H}
          priority={priority}
          className={`h-9 w-auto sm:h-10 md:h-11 ${
            overDarkPhoto ? "brightness-[1.08] contrast-[1.05]" : ""
          }`}
          sizes="(max-width: 768px) 180px, 220px"
        />
      </span>
    </Link>
  );
}
