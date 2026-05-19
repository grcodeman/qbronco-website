import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initEntanglement(): void {
  if (typeof window === "undefined") return;

  const path = document.querySelector<SVGPathElement>(
    "[data-entanglement-path]",
  );
  if (!path) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const setLength = () => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = prefersReducedMotion ? "0" : String(length);
    return length;
  };

  setLength();

  if (prefersReducedMotion) return;

  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.6,
    ease: "power2.out",
    scrollTrigger: {
      trigger: path,
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  // Recompute on resize since the SVG path may scale
  window.addEventListener(
    "resize",
    () => {
      setLength();
    },
    { passive: true },
  );
}
