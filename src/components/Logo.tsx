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
      src="/logo1.jpeg"
      alt="Global Service Mitra"
      style={{ height: size, width: "auto" }}
      className={className}
    />
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <LogoMark
        size={compact ? 30 : 34}
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <div className="font-bold tracking-tight text-[15px] sm:text-base text-slate-900 whitespace-nowrap">
        Global Service Mitra
      </div>
    </Link>
  );
}
