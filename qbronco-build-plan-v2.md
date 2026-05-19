# Quantum Broncos Website Build Plan v2

## Project Overview

A single-page, dark, minimalist site for **Quantum Broncos** at `qbronco.com`. The goal is not to be a typical club website. It is to be a visually impressive piece that signals technical seriousness through interaction and motion rather than copy.

The centerpiece is an **interactive 3D qubit on the hero**: a Bloch sphere with a draggable state vector. Everything else supports that moment. Lenis smooth scroll connects sections. GSAP ScrollTrigger drives three or four carefully chosen scroll-driven quantum visuals. Copy is sparse on purpose.

Reference aesthetic: darkroom.engineering, lusion.co, studio-freight.com, robin-noguier.com. Minimalist, dark, glowing thin lines, mono typography, huge whitespace.

## Goals

1. Make the first 5 seconds memorable. The qubit should make any visitor stop and play.
2. Communicate "this club is technically serious" without saying it.
3. Drive Discord joins, mailing list signups, Instagram follows.
4. Be performant. 60fps target. Mobile-friendly. Lighthouse 95+.

## Tech Stack

- **Framework**: Astro 4.x (static, fast, great for content sites with islands of interactivity)
- **Interactivity islands**: React 18 via Astro's React integration
- **3D**: Three.js via `@react-three/fiber` and `@react-three/drei`
- **Smooth scroll**: `@studio-freight/lenis` 1.x
- **Scroll animations**: `gsap` 3.x with `ScrollTrigger` and `SplitText` plugins
- **Styling**: Tailwind CSS 3.x
- **Fonts**: Inter (body), Space Grotesk (display), JetBrains Mono (accents and the wordmark)
- **TypeScript** strict mode
- **Deploy**: Vercel, custom domain qbronco.com

## Design System

### Color Palette

Single-accent palette for maximum cohesion. The "quantum" feel comes from the visuals, not from color count.

```
--bg:          #0A0A0B   /* near-black */
--bg-elevated: #131316   /* cards, slightly elevated */
--text:        #F5F1E8   /* warm off-white */
--text-muted:  #8C8780   /* secondary text */
--text-dim:    #4A4640   /* tertiary, captions */
--accent:      #B5A167   /* WMU gold */
--accent-glow: #D4BC7A   /* hover, highlights */
--line:        rgba(245, 241, 232, 0.08)  /* borders, divider lines */
```

All "glowing" elements (the qubit, lines, hover states) get a subtle CSS or shader-driven glow using the gold accent color.

### Typography

- **Display (h1)**: Space Grotesk, weight 500, tracking -0.04em, line-height 0.95. Set big. The hero H1 is at 8rem on desktop.
- **Headings (h2)**: Space Grotesk, weight 500, tracking -0.02em, lowercase.
- **Body**: Inter, weight 400, tracking 0, line-height 1.6.
- **Mono**: JetBrains Mono, weight 400. Used for the wordmark, section labels, equations, kicker text, fine print.
- Everything lowercase except the H1 "Quantum Broncos" and proper nouns. Sentence case for body.

Type scale (rem): 0.75, 0.875, 1, 1.125, 1.25, 1.75, 2.5, 4, 6, 8

### Spacing

- Max content width: 1440px, with most sections capped at 1200px
- Section vertical padding: 12rem desktop, 6rem mobile. Sections breathe a lot.
- Generous gutters. Margins on copy blocks: 60ch max line length.

### Motion

- Lenis: `lerp: 0.08, duration: 1.4, smoothWheel: true, smoothTouch: false` (touch devices use native scroll for performance)
- Default ease for entrances: `power3.out`
- Default ease for scrubs: `none` (linear, tied to scroll)
- Reveal threshold: animations trigger at `top 75%`
- Stagger: 0.06s between sibling elements
- Respect `prefers-reduced-motion`: Lenis disabled, scrub animations swap to instant fades, qubit auto-rotates instead of allowing drag

## Section Architecture

Aggressively minimal. Six sections, each does one thing well.

```
1. Hero with interactive qubit
2. Superposition (the explanation, as a visual moment)
3. The Club (three-card mission, sparse copy)
4. Events (Qiskit Fall Fest as the marquee)
5. Join (three CTA cards)
6. Footer
```

## Section Specifications

### 1. Hero (Full Viewport)

**Layout**: Full screen. Split or overlay layout: text on left, qubit on right (or qubit centered, text overlaid bottom-left on mobile).

**Content**:
- Top-left, mono: `qbronco · wmu`
- Top-right, mono nav: `events · join · resources`
- Bottom-left:
  - Mono kicker: `est. 2026 · western michigan university`
  - H1: **Quantum Broncos**
  - Subhead (Inter, 1.25rem, muted): "A community for anyone curious about quantum computing."
- Bottom-right: small scroll cue (mono, "scroll" with a thin vertical line that has a tiny dot moving down it on loop)

**The qubit (right or center)**:
This is the entire reason for the site. Specs in detail below.

### Interactive Qubit Implementation

A 3D Bloch sphere rendered with `@react-three/fiber`. The user can click and drag to rotate the state vector around the sphere surface.

**Visual elements**:
- A wireframe sphere, radius 1, made of thin lines (use `EdgesGeometry` on an `IcosahedronGeometry` with detail 3-4, or a custom lat/long wireframe). Color: `--text-muted` at 30% opacity.
- Three labeled axes (X, Y, Z) extending slightly beyond the sphere, drawn as thin glowing gold lines.
- Pole markers: `|0⟩` at the top (+Z), `|1⟩` at the bottom (-Z), rendered as small mono text labels using `<Html>` from drei.
- The state vector: a glowing gold arrow from origin to a point on the sphere surface. Use a `Line` or a custom shader for the glow.
- A small dot at the vector tip, with a halo/bloom effect.
- Ambient slow rotation of the whole scene when the user isn't interacting (resumes after 2s of no interaction).

**Interaction**:
- Click and drag rotates the state vector around the sphere. NOT the camera. The camera stays fixed (slight orbit allowed but the vector is what moves).
- On mobile, touch drag does the same.
- Use raycasting from the pointer to project onto the sphere surface and update the vector's spherical coordinates (θ, φ).
- As the vector moves, update a small mono-typeset readout displayed below or beside the canvas:
  ```
  |ψ⟩ = α|0⟩ + β|1⟩
  α = 0.707
  β = 0.707 · e^(iπ/2)
  ```
  Values update live. Format to 3 decimal places.
- Optional "measure" button below the readout. Pressing it triggers a brief collapse animation: the vector snaps to either |0⟩ or |1⟩ based on the probability `|α|² and |β|²`. A subtle screen flash. Then after 1.5s, the user can drag again to set a new state.

**Performance**:
- Use `frameloop="demand"` in R3F so it only re-renders on interaction or animation
- Cap pixel ratio at 2
- Use `<Bloom>` from drei post-processing for the glow, but tune intensity low (0.4)
- On mobile, swap to a simpler version: static Bloch sphere with auto-rotating vector, no drag

**Fallback**:
- If JS is disabled or `prefers-reduced-motion`: show a static SVG of a Bloch sphere with a vector at the equator. Caption: "A qubit in superposition."

### Hero Scroll Behavior

As the user starts to scroll:
- The qubit scales down to 0.7x and translates up-right with parallax
- Hero text fades and translates up
- The qubit smoothly transitions to a "corner" position in the next section as a persistent visual anchor (optional polish, defer to v2 if complex)

### 2. Superposition

**Layout**: Centered, narrow column. Pure typography moment.

**Content**:
- Mono kicker (top-center, gold): `01 · superposition`
- A single large statement, displayed line-by-line:
  - Line 1: "A classical bit is 0 or 1."
  - Line 2: "A qubit is both."
  - Line 3: "Until you measure it."

Each line splits in by character or word using SplitText, fading from a "blurry/multiple" state into a sharp single state as it enters the viewport. This visually echoes wave function collapse.

**Implementation of the "collapse" reveal**:
- Each line starts with 3 ghost copies offset slightly (using CSS transform translate with a blur filter and lower opacity)
- As ScrollTrigger fires, the ghost copies animate toward the main copy and fade out, leaving the sharp line
- Timing: 0.6s per line, staggered 0.4s apart

Below the three lines, a thin gold horizontal divider line draws itself across the screen as you scroll past. Use SVG with `stroke-dasharray` animated by ScrollTrigger.

### 3. The Club

**Layout**: Three columns on desktop, stacks on mobile.

**Content**:
- Mono kicker: `02 · what we do`
- H2: "Three things, done well."
- Three cards, each with a thin gold border, mono number, short title, and 1-2 sentence body:

  **01 — Learn.** Weekly workshops. Qiskit hands-on labs. Zero-to-quantum curriculum.

  **02 — Build.** Hackathons. Project teams. Real code on real quantum hardware.

  **03 — Connect.** Industry speakers. Peer clubs. Travel teams to MIT iQuHACK and YQuantum.

**Animation**:
- Cards stagger in from below as section enters viewport
- On hover: border glows brighter, card lifts 4px, mono number scales up slightly
- A thin connecting line draws between the three cards on first scroll-in, hinting at entanglement (subtle, decorative)

### 4. Events

**Layout**: One large featured card center stage. Small "more soon" line below.

**Content**:
- Mono kicker: `03 · marquee event`
- Featured card:
  - Date label (mono, gold): `october 2026`
  - Title (Space Grotesk, large): "Qiskit Fall Fest"
  - Body (1-2 sentences): "Our first hackathon. A full Saturday of quantum challenges, workshops, and prizes. Sponsored by IBM Quantum. Open to all WMU students."
  - CTA button: "Get notified" (opens an inline email field that posts to a mailing list endpoint)
- Below the card, small mono text: `weekly meetings · travel teams · speaker series · more details soon`

**Animation**:
- Featured card has a subtle scale-up entrance (from 0.95 to 1.0)
- Background: a faint scrolling quantum circuit visual moves slowly horizontally behind the section (low opacity, decorative)
- On hover of the card: gold border glows, slight lift

### 5. Join

**Layout**: Three full-width cards stacked vertically (not side by side). Each is a focused conversion moment.

**Content**:
- Mono kicker: `04 · join`
- H2: "There's room at the table."
- Three cards:

  **Discord** — "Where the day-to-day happens." [Join Discord →]

  **Mailing list** — "Event invites, meeting reminders, nothing else." [email input + Subscribe]

  **Instagram** — "@qbronco" [Follow →]

**Animation**:
- Each card slides in from the side (alternating left/right) with ScrollTrigger
- Hover: gold border, lift 4px, CTA arrow translates right 4px

### 6. Footer

**Layout**: Three-column on desktop, stacks on mobile.

**Content**:
- Column 1: Wordmark `qbronco`, tagline "western michigan university · founded 2026"
- Column 2: Quick links (events, join, resources)
- Column 3: Socials (Instagram, Discord, GitHub, Email)
- Bottom bar (mono, dim): `© 2026 quantum broncos · built at wmu`

A thin gold line above the footer divides it from the page.

## Scroll-Driven Visual System

Beyond per-section animations, two persistent scroll-driven visuals run throughout the page:

### A. Background Particle Field

A canvas-rendered or shader-based particle system in the background of the entire page. Specs:
- 150-300 particles, small (1-2px), gold at 20% opacity
- Each particle drifts slowly with random brownian motion
- On scroll, particles get a velocity nudge in the scroll direction (parallax-ish, but more organic)
- Particles wrap around the viewport edges
- Implementation: a single full-viewport `<canvas>` fixed to position fixed, behind content, with `pointer-events: none`

### B. Section Number Indicator

A small mono indicator fixed to the right edge of the viewport showing the current section number (`01`, `02`, `03`, ...) that updates as the user scrolls. Each section transition triggers a brief "glitch" effect on the number (split into three offset RGB-style ghost copies for 200ms, then snaps back). The "glitch" visually echoes superposition.

## File Structure

```
/
├── public/
│   ├── fonts/
│   └── favicon.svg            // a simple gold 'q' on dark
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Superposition.astro
│   │   ├── Club.astro
│   │   ├── Events.astro
│   │   ├── Join.astro
│   │   ├── Footer.astro
│   │   ├── SectionIndicator.tsx
│   │   ├── ParticleField.tsx
│   │   └── qubit/
│   │       ├── Qubit.tsx          // <Canvas> wrapper, R3F entry
│   │       ├── BlochSphere.tsx    // wireframe sphere
│   │       ├── StateVector.tsx    // the glowing arrow
│   │       ├── Axes.tsx           // X, Y, Z axes + |0⟩ |1⟩ labels
│   │       ├── Readout.tsx        // the live α, β math display
│   │       └── useQubitState.ts   // shared state hook
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   └── index.astro
│   ├── scripts/
│   │   ├── lenis.ts
│   │   └── reveal.ts             // ScrollTrigger reveal utilities
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.css
│   └── content/
│       └── site.ts               // copy lives here for easy edits
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

## Setup

```bash
npm create astro@latest qbronco-site -- --template minimal --typescript strict
cd qbronco-site
npx astro add tailwind react
npm install @studio-freight/lenis gsap
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

Tailwind config: extend colors with the design tokens. Add the three Google Fonts via the Base layout `<link>`.

GSAP SplitText is a Club plugin (paid). Acceptable alternatives:
- Use the open-source `split-type` package (works similarly)
- Or write a small utility that splits text into spans on mount

## Implementation Phases

Build in order. Each phase is independently deployable.

**Phase 1 — Skeleton (half day)**
- Astro + Tailwind + TS setup
- Design tokens in Tailwind config
- Fonts loaded
- All section components stubbed with copy
- Responsive (mobile-first)
- Static, no animations

**Phase 2 — Lenis + reveal animations (half day)**
- Lenis smooth scroll initialized and synced with GSAP ticker
- ScrollTrigger fade-up reveals on each section
- Stagger on cards
- Reduced motion fallback tested

**Phase 3 — The qubit (1.5 days)**
- R3F Canvas mounted in Hero
- Wireframe Bloch sphere with axes and pole labels
- State vector rendered, defaults to equator (superposition)
- Drag-to-rotate the vector implemented (raycasting onto sphere)
- Live α, β readout component
- Ambient auto-rotation when idle
- Mobile fallback (auto-rotating, no drag)
- Bloom post-processing for glow

**Phase 4 — Quantum motion polish (1 day)**
- Background particle field across full page
- Superposition section "collapse" text reveal
- Section indicator with glitch transition
- Connecting entanglement line in Club section
- Quantum circuit background behind Events section

**Phase 5 — Optional "measure" feature on qubit (half day)**
- Add measure button
- Probabilistic collapse animation
- Screen flash on measurement
- Reset to draggable state after 1.5s

**Phase 6 — Launch polish (half day)**
- Mailing list form wired (Formspree or Resend)
- SEO, Open Graph, favicon
- Lighthouse pass
- Custom domain DNS to Vercel

## Performance Budget

- LCP < 2s on mobile 4G
- 60fps target on the qubit on mid-tier laptops
- R3F `frameloop="demand"` to avoid constant re-renders
- Particle field uses `requestAnimationFrame` not React state updates
- Lenis disabled below 768px width (mobile uses native scroll)
- Three.js bundle loaded only when Hero is in viewport (consider dynamic import if bundle size is a concern; the qubit is above the fold so `client:load` is fine)
- Images: none on v1 (all-vector aesthetic)

## Design Don'ts

- No clip-art atoms with electron orbits anywhere
- No gradients (single-color glow only, no gradient fills)
- No "futuristic" stretched fonts
- No carousels
- No autoplay video
- No cookie banner
- No emojis in copy
- No em dashes in copy
- No chatbot widget
- No second accent color. Gold only.
- No purple/blue "quantum" colors. The aesthetic is warm gold on near-black.

## Copy Voice Notes

- Direct, sparse, confident. No marketing speak.
- Short sentences. Periods are punctuation, not transitions.
- Lowercase the brand throughout body copy. Capitalize only the H1 and in formal contexts.
- The qubit speaks for itself. Don't over-explain quantum mechanics. The visual does the heavy lifting.

## Future Enhancements

- Persistent qubit that follows the user as they scroll, docking into the corner after the hero (mentioned earlier as deferred polish)
- A second interactive moment in the Superposition section (e.g., a clickable "measure" that demonstrates collapse)
- Sponsor logos row in footer once partnerships confirmed
- Past events archive once the club has history
- Team page once the founding board is set

## Notes for the Builder

- The qubit is the deliverable. Everything else is supporting cast. If anything has to be cut to ship, cut the particle field, the section indicator glitch, and the entanglement line. Keep the qubit pristine.
- Match the polish of reference sites like darkroom.engineering, lusion.co, robin-noguier.com. Study how they balance whitespace, glow, and motion.
- When in doubt: less. Less copy, less color, less motion. Make every element earn its place.
