import Link from "next/link";

/**
 * Official Global Service Mitra brand mark.
 * Source image lives at /public/logo.png (served from the site root as /logo.png).
 * The `size` prop sets the rendered height; width scales to keep the aspect ratio.
 */
export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Global Service Mitra"
      style={{ height: size, width: "auto" }}
      className={className}
    />
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
            " text-slate-900"
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
