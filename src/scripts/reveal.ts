import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ENTER_EASE = "power3.out";
const ENTER_DURATION = 0.9;
const STAGGER = 0.06;
const TRIGGER_START = "top 75%";

export function initReveals(): void {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Set initial hidden state so reveals don't flash unstyled
  gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });
  gsap.set("[data-reveal-stagger] > *", { autoAlpha: 0, y: 24 });

  if (prefersReducedMotion) {
    gsap.set("[data-reveal]", { autoAlpha: 1, y: 0 });
    gsap.set("[data-reveal-stagger] > *", { autoAlpha: 1, y: 0 });
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: ENTER_DURATION,
      ease: ENTER_EASE,
      scrollTrigger: {
        trigger: el,
        start: TRIGGER_START,
        toggleActions: "play none none none",
      },
    });
  });

  document
    .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
    .forEach((container) => {
      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) return;

      gsap.to(children, {
        autoAlpha: 1,
        y: 0,
        duration: ENTER_DURATION,
        ease: ENTER_EASE,
        stagger: STAGGER,
        scrollTrigger: {
          trigger: container,
          start: TRIGGER_START,
          toggleActions: "play none none none",
        },
      });
    });
}
