import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GhostOffset {
  x: number;
  y: number;
}

const GHOST_OFFSETS: GhostOffset[] = [
  { x: -14, y: -8 },
  { x: 12, y: -10 },
  { x: -4, y: 12 },
];

const LINE_DURATION = 0.6;
const LINE_STAGGER = 0.4;
const TRIGGER_START = "top 75%";

export function initSuperposition(): void {
  if (typeof window === "undefined") return;

  const root = document.querySelector<HTMLElement>("[data-superposition]");
  if (!root) return;

  const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
  if (lines.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Build ghost copies for each line
  lines.forEach((line) => {
    const text = line.dataset.text ?? line.textContent ?? "";
    line.textContent = "";

    // Real (sharp) copy
    const sharp = document.createElement("span");
    sharp.className = "superposition__sharp";
    sharp.textContent = text;
    line.appendChild(sharp);

    // Ghost copies (start visible & offset, animate to converged)
    GHOST_OFFSETS.forEach((offset, i) => {
      const ghost = document.createElement("span");
      ghost.className = "superposition__ghost";
      ghost.dataset.ghostIndex = String(i);
      ghost.textContent = text;
      ghost.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
      line.appendChild(ghost);
    });
  });

  if (prefersReducedMotion) {
    // Snap to final state, no animation
    root.querySelectorAll<HTMLElement>(".superposition__ghost").forEach((g) => {
      g.style.opacity = "0";
      g.style.transform = "translate3d(0, 0, 0)";
    });
    return;
  }

  // Initial state for sharp text (slightly visible)
  gsap.set(".superposition__sharp", { opacity: 0.85, filter: "blur(0px)" });

  lines.forEach((line, i) => {
    const ghosts = line.querySelectorAll<HTMLElement>(".superposition__ghost");
    const sharp = line.querySelector<HTMLElement>(".superposition__sharp");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: line,
        start: TRIGGER_START,
        toggleActions: "play none none none",
      },
      delay: i * LINE_STAGGER,
    });

    tl.to(
      ghosts,
      {
        x: 0,
        y: 0,
        opacity: 0,
        filter: "blur(0px)",
        duration: LINE_DURATION,
        ease: "power3.out",
      },
      0,
    );

    if (sharp) {
      tl.to(
        sharp,
        {
          opacity: 1,
          duration: LINE_DURATION * 0.8,
          ease: "power3.out",
        },
        0.1,
      );
    }
  });

  // Animated thin gold divider
  const divider = root.querySelector<SVGPathElement>("[data-divider-path]");
  if (divider) {
    const length = divider.getTotalLength();
    divider.style.strokeDasharray = String(length);
    divider.style.strokeDashoffset = String(length);
    gsap.to(divider, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: divider,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }
}
