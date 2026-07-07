import { BRAND_GRADIENT } from "@/lib/brand";

// The Tag It mark — a tilted price-tag with a punched hole ("Sunset Pop").
// LogoTile is the gradient app-icon version (white tag on the brand gradient);
// Wordmark is the gradient "Tag It" text. Both use inline styles for the
// gradient so they render reliably.

export function TagMark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <g transform="rotate(45 50 50)">
        <rect x="27" y="27" width="46" height="46" rx="13" fill="#fff" />
        <circle cx="38.5" cy="38.5" r="5.6" fill="rgba(0,0,0,0.2)" />
      </g>
    </svg>
  );
}

export function LogoTile({ size = 32, radius }: { size?: number; radius?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center shadow-sm"
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.28),
        backgroundImage: BRAND_GRADIENT,
      }}
    >
      <TagMark size={Math.round(size * 0.62)} />
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-extrabold tracking-tight ${className}`}
      style={{
        backgroundImage: BRAND_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      Tag It
    </span>
  );
}

export function BrandLock({ size = 32, wordClass = "text-lg" }: { size?: number; wordClass?: string }) {
  return (
    <span className="flex items-center gap-2">
      <LogoTile size={size} />
      <Wordmark className={wordClass} />
    </span>
  );
}
