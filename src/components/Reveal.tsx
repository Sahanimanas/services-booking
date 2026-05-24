"use client";

import { useEffect, useRef, type ElementType } from "react";

type Variant = "up" | "left" | "right" | "scale" | "fade";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Animation direction. Default "up". */
  variant?: Variant;
  /** Delay in ms before the animation starts. Default 0. */
  delay?: number;
  /** Element to render. Default "div". */
  as?: ElementType;
  /** % of the element that must be visible to trigger. Default 0.12. */
  threshold?: number;
};

export default function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  as: Tag = "div",
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // SSR fallback: if IntersectionObserver isn't available, show immediately.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const variantClass =
    variant === "left"
      ? "reveal reveal-left"
      : variant === "right"
      ? "reveal reveal-right"
      : variant === "scale"
      ? "reveal reveal-scale"
      : variant === "fade"
      ? "reveal"
      : "reveal";

  // Use ref={ref as any} so the component works with any element type
  const Component = Tag as React.ElementType;
  return (
    <Component
      ref={ref as React.RefObject<HTMLElement>}
      className={`${variantClass} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
