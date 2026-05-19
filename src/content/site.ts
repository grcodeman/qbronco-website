export const site = {
  brand: "qbronco",
  brandFull: "Quantum Broncos",
  affiliation: "wmu",
  affiliationFull: "Western Michigan University",
  domain: "qbronco.com",
  established: "2026",

  nav: [
    { label: "events", href: "#events" },
    { label: "join", href: "#join" },
    { label: "resources", href: "#resources" },
  ],

  hero: {
    kicker: "est. 2026 · western michigan university",
    title: "Quantum Broncos",
    subhead: "A community for anyone curious about quantum computing.",
  },

  superposition: {
    kicker: "01 · superposition",
    lines: [
      "A classical bit is 0 or 1.",
      "A qubit is both.",
      "Until you measure it.",
    ],
  },

  club: {
    kicker: "02 · what we do",
    title: "Three things, done well.",
    cards: [
      {
        number: "01",
        title: "Learn.",
        body: "Weekly workshops. Qiskit hands-on labs. Zero-to-quantum curriculum.",
      },
      {
        number: "02",
        title: "Build.",
        body: "Hackathons. Project teams. Real code on real quantum hardware.",
      },
      {
        number: "03",
        title: "Connect.",
        body: "Industry speakers. Peer clubs. Travel teams to MIT iQuHACK and YQuantum.",
      },
    ],
  },

  events: {
    kicker: "03 · marquee event",
    featured: {
      date: "october 2026",
      title: "Qiskit Fall Fest",
      body: "Our first hackathon. A full Saturday of quantum challenges, workshops, and prizes. Sponsored by IBM Quantum. Open to all WMU students.",
      cta: "Get notified",
    },
    more: "weekly meetings · travel teams · speaker series · more details soon",
  },

  join: {
    kicker: "04 · join",
    title: "There's room at the table.",
    cards: [
      {
        platform: "Discord",
        body: "Where the day-to-day happens.",
        ctaLabel: "Join Discord",
        href: "#",
        kind: "link" as const,
      },
      {
        platform: "Mailing list",
        body: "Event invites, meeting reminders, nothing else.",
        ctaLabel: "Subscribe",
        href: "#",
        kind: "email" as const,
      },
      {
        platform: "Instagram",
        body: "@qbronco",
        ctaLabel: "Follow",
        href: "#",
        kind: "link" as const,
      },
    ],
  },

  footer: {
    wordmark: "qbronco",
    tagline: "western michigan university · founded 2026",
    quickLinks: [
      { label: "events", href: "#events" },
      { label: "join", href: "#join" },
      { label: "resources", href: "#resources" },
    ],
    socials: [
      { label: "Instagram", href: "#" },
      { label: "Discord", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Email", href: "mailto:hello@qbronco.com" },
    ],
    legal: "© 2026 quantum broncos · built at wmu",
  },
};

export type SiteContent = typeof site;
