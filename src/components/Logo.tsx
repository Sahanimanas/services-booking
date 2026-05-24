import Link from "next/link";

/**
 * SVG approximation of the Global Service Mitra mark:
 * - Globe (light grid)
 * - Blue stylized "S"
 * - Orange stylized "M" interlocked with S
 * - Small figure with raised arms in the join
 * - Pixel dots accent
 *
 * If you have the official PNG/SVG, drop it in /public/logo.png and use
 * <img src="/logo.png" alt="GSM" /> in <BrandLogo /> instead.
 */
export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Global Service Mitra"
    >
      {/* Globe */}
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="50" y1="4" x2="50" y2="96" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M 8 38 Q 50 28 92 38" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M 8 62 Q 50 72 92 62" fill="none" stroke="#cbd5e1" strokeWidth="1" />

      {/* Blue "S" — stylized open curve */}
      <path
        d="M 38 28
           C 22 28, 18 46, 34 50
           C 50 54, 50 70, 30 70"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Orange "M" — two peaks */}
      <path
        d="M 52 72
           L 52 38
           L 64 58
           L 76 38
           L 76 72"
        fill="none"
        stroke="#f97316"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Figure with raised arms (between S and M) */}
      <g fill="#f97316" stroke="#f97316" strokeLinecap="round">
        <circle cx="46" cy="40" r="3" />
        <path d="M 46 43 L 46 54" strokeWidth="2.5" />
        {/* arms up */}
        <path d="M 46 46 L 41 38" strokeWidth="2.2" />
        <path d="M 46 46 L 51 38" strokeWidth="2.2" />
      </g>

      {/* Pixel dots */}
      <g fill="#1d4ed8">
        <rect x="76" y="22" width="3" height="3" />
        <rect x="81" y="22" width="3" height="3" />
        <rect x="76" y="27" width="3" height="3" />
        <rect x="81" y="27" width="3" height="3" />
      </g>
    </svg>
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <LogoMark size={compact ? 32 : 40} />
      <div className="leading-tight">
        <div
          className={
            "font-extrabold tracking-tight " +
            (compact ? "text-base" : "text-lg") +
            " text-brand-700"
          }
        >
          Global Service <span className="text-accent-500">Mitra</span>
        </div>
        {!compact && (
          <div className="text-[9px] font-semibold text-ink-900/55 tracking-[0.18em] uppercase">
            Service · Support · Solutions
          </div>
        )}
      </div>
    </Link>
  );
}
