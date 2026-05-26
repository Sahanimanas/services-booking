// Outline icons for service categories. Stroke-only, no fill — matches the minimal theme.
// 24×24 viewBox, currentColor stroke so the parent controls the colour.

type Props = {
  slug: string;
  className?: string;
};

export default function CategoryIcon({ slug, className = "w-6 h-6" }: Props) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (slug) {
    case "ac": // snowflake
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M4 7l16 10" />
          <path d="M4 17 20 7" />
          <path d="M9 4l3 2 3-2" />
          <path d="M9 20l3-2 3 2" />
          <path d="M2 12h20" />
          <path d="M5 9l-1 3 1 3" />
          <path d="M19 9l1 3-1 3" />
        </svg>
      );
    case "ro": // droplet
      return (
        <svg {...common}>
          <path d="M12 2.7c4 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2-6 6-10z" />
        </svg>
      );
    case "washing-machine":
      return (
        <svg {...common}>
          <rect x="3.5" y="3" width="17" height="18" rx="2" />
          <circle cx="12" cy="14" r="4.5" />
          <circle cx="12" cy="14" r="1.5" />
          <line x1="7" y1="6.5" x2="7.01" y2="6.5" />
          <line x1="10.5" y1="6.5" x2="13" y2="6.5" />
        </svg>
      );
    case "refrigerator":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <line x1="5" y1="11" x2="19" y2="11" />
          <line x1="9" y1="7" x2="9" y2="9" />
          <line x1="9" y1="14" x2="9" y2="17" />
        </svg>
      );
    case "plumbing": // wrench
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3-3a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z" />
        </svg>
      );
    case "electrician": // bolt
      return (
        <svg {...common}>
          <polyline points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
        </svg>
      );
    default: // generic toolbox
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="3" y1="13" x2="21" y2="13" />
        </svg>
      );
  }
}
