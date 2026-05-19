const PARTICLE_COUNT_DESKTOP = 220;
const PARTICLE_COUNT_MOBILE = 90;
const ACCENT_RGB = "212, 188, 122"; // --accent-glow

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function makeParticles(count: number, w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      size: Math.random() < 0.85 ? 1 : 2,
      alpha: 0.08 + Math.random() * 0.18,
    });
  }
  return particles;
}

export function initParticles(canvas: HTMLCanvasElement | null): () => void {
  if (!canvas || typeof window === "undefined") return () => {};

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return () => {};

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return () => {};

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles: Particle[] = [];
  let lastScrollY = window.scrollY;
  let scrollNudge = 0;
  let raf = 0;
  let running = true;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    particles = makeParticles(count, width, height);
  };

  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastScrollY;
    lastScrollY = y;
    // Add a small downward/upward nudge based on scroll direction
    scrollNudge += delta * 0.004;
    scrollNudge = Math.max(-2, Math.min(2, scrollNudge));
  };

  const tick = () => {
    if (!running) return;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `rgba(${ACCENT_RGB}, 1)`;

    // Decay scroll nudge over time
    scrollNudge *= 0.92;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Brownian-ish jitter
      p.vx += (Math.random() - 0.5) * 0.006;
      p.vy += (Math.random() - 0.5) * 0.006;
      // Light damping
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx;
      p.y += p.vy + scrollNudge * 0.15;

      // Wrap around viewport
      if (p.x < -2) p.x = width + 2;
      else if (p.x > width + 2) p.x = -2;
      if (p.y < -2) p.y = height + 2;
      else if (p.y > height + 2) p.y = -2;

      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  raf = requestAnimationFrame(tick);

  // Pause when hidden to save battery
  const onVis = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVis);
  };
}
