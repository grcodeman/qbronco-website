const SECTION_MAP: Record<string, string> = {
  hero: "00",
  superposition: "01",
  club: "02",
  events: "03",
  join: "04",
};

const GLITCH_MS = 220;

export function initSectionIndicator(): void {
  if (typeof window === "undefined") return;

  const indicator = document.querySelector<HTMLElement>(
    "[data-section-indicator]",
  );
  if (!indicator) return;

  const numberEl = indicator.querySelector<HTMLElement>(
    "[data-section-number]",
  );
  const ghostA = indicator.querySelector<HTMLElement>(
    "[data-section-ghost-a]",
  );
  const ghostB = indicator.querySelector<HTMLElement>(
    "[data-section-ghost-b]",
  );
  if (!numberEl) return;

  let current = "";
  let glitchTimeout: number | null = null;

  const setNumber = (next: string) => {
    if (next === current) return;
    current = next;
    numberEl.textContent = next;
    if (ghostA) ghostA.textContent = next;
    if (ghostB) ghostB.textContent = next;

    indicator.classList.add("section-indicator--glitch");
    if (glitchTimeout) window.clearTimeout(glitchTimeout);
    glitchTimeout = window.setTimeout(() => {
      indicator.classList.remove("section-indicator--glitch");
    }, GLITCH_MS);
  };

  const sections = Object.keys(SECTION_MAP)
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (sections.length === 0) return;

  const visibility = new Map<string, number>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visibility.set(entry.target.id, entry.intersectionRatio);
      }
      // Pick section with highest visibility ratio
      let best: { id: string; ratio: number } | null = null;
      visibility.forEach((ratio, id) => {
        if (!best || ratio > best.ratio) best = { id, ratio };
      });
      if (best && best.ratio > 0.15) {
        setNumber(SECTION_MAP[best.id] ?? "00");
      }
    },
    {
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      rootMargin: "-10% 0px -10% 0px",
    },
  );

  sections.forEach((section) => io.observe(section));

  // Set initial state
  setNumber(SECTION_MAP[sections[0].id] ?? "00");
}
