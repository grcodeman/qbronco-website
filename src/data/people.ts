// The club itself, its officers and the photo reel. Photos live in
// /public/officers and /public/reel, each saved at a few widths
// (name-320.webp, name-480.webp, ...) so phones don't download desktop sizes.

import { MEETING, PLACE } from "./schedule";

// both names the club goes by. the first alias shows up next to the wordmark,
// in page titles, link previews, structured data and llms.txt, so a search for
// either name lands here.
export const CLUB = {
  name: "QBronco",
  alsoKnownAs: ["Quantum Broncos", "QBroncos", "WMU Quantum Computing Club"],
  summary: `QBronco (the Quantum Broncos) is WMU's quantum computing club. We meet Wednesdays ${MEETING.time} in ${PLACE.building} ${MEETING.room} on Parkview campus. No experience needed.`,
  signup:
    "https://docs.google.com/forms/d/e/1FAIpQLSe83Y5m_jP0qmOiVQPctybcPf4Zsvg5W58nT5T5oSlPOoQucA/viewform",
  links: [
    // label: how the page writes it (in pencil); name: how it's spelled everywhere else
    { label: "instagram", name: "Instagram", text: "@qbroncowmu", href: "https://www.instagram.com/qbroncowmu/" },
    {
      label: "experienceWMU",
      name: "experienceWMU",
      text: "our org page",
      href: "https://experiencewmu.wmich.edu/organization/qbroncos",
    },
    {
      label: "linkedin",
      name: "LinkedIn",
      text: "linkedin.com/company/qbronco",
      href: "https://www.linkedin.com/company/qbronco",
    },
    { label: "github", name: "GitHub", text: "github.com/qbronco", href: "https://github.com/qbronco" },
  ],
};

export interface Officer {
  name: string;
  role: string;
  href: string;
  photo: string; // /officers/<photo>-160.webp and -320.webp
  tilt: number; // degrees, set by hand so the row doesn't look stamped
}

export const OFFICERS: Officer[] = [
  {
    name: "Dr. Sawalha",
    role: "faculty advisor",
    href: "https://wmich.edu/electrical-computer/directory/sawalha",
    photo: "sawalha",
    tilt: -2,
  },
  {
    name: "Mack Usmanova",
    role: "president",
    href: "https://www.linkedin.com/in/mukaddass/",
    photo: "mack-usmanova",
    tilt: 1.5,
  },
  {
    name: "Cody Thornell",
    role: "vice president",
    href: "https://www.linkedin.com/in/codythornell/",
    photo: "cody-thornell",
    tilt: -1,
  },
  {
    name: "Jordan Johnson",
    role: "events officer",
    href: "https://www.linkedin.com/in/jordan-sjohnson/",
    photo: "jordan-johnson",
    tilt: 2,
  },
  {
    name: "Hana Tourner",
    role: "marketing officer",
    href: "https://www.linkedin.com/in/hanatourner/",
    photo: "hana-tourner",
    tilt: -1.5,
  },
  {
    name: "Lola MacAlpine",
    role: "tech officer",
    href: "https://www.linkedin.com/in/lola-macalpine-251632366/",
    photo: "lola-macalpine",
    tilt: 1,
  },
  {
    name: "Kaiden Rudolph",
    role: "tech officer",
    href: "https://www.linkedin.com/in/kaiden-rudolph-6b3553246/",
    photo: "kaiden-rudolph",
    tilt: -1.2,
  },
  {
    name: "Peyton Nitz-Lentz",
    role: "tech officer",
    href: "https://www.linkedin.com/in/peyton-nitz-lentz-86903935b/",
    photo: "peyton-nitz-lentz",
    tilt: 1.4,
  },
];

// every reel photo is cropped to the same 4:3 print. to add one: save it as
// /public/reel/<name>-320.webp, -480.webp and -640.webp (640x480 at the
// largest) and add a line here. newest first.
export const REEL_WIDTHS = [320, 480, 640];

export interface ReelPhoto {
  photo: string;
  caption: string;
  alt: string;
  tilt: number;
}

export const REEL: ReelPhoto[] = [
  {
    photo: "bell-lab-qubis",
    caption: "Bell state lab, Qubis in hand",
    alt: "A member holds two glowing Qubis while helping another member at a laptop; behind them someone writes probability math on the whiteboard.",
    tilt: -1.4,
  },
  {
    photo: "bell-lab-math",
    caption: "theory team works the math",
    alt: "A member works through the Bell state math on a whiteboard covered in red equations while the room follows along at their laptops.",
    tilt: 1.2,
  },
  {
    photo: "bell-lab-qiskit",
    caption: "the same circuit in Qiskit",
    alt: "A presenter beside whiteboard notes on the Hadamard gate and Bell states, with Qiskit code and a results histogram on the projector.",
    tilt: -0.8,
  },
  {
    photo: "bell-lab-room",
    caption: "Bell state lab, oct 7",
    alt: "The whole room at laptops during the Bell state lab, facing a presenter at the podium and the Qubi worksheet on the projector.",
    tilt: 1.6,
  },
  {
    photo: "study-session",
    caption: "study session, worksheets out",
    alt: "Students working through a worksheet at long desks, with whiteboards covered in red math behind them.",
    tilt: -1.2,
  },
  {
    photo: "project-plan",
    caption: "going over the project plan",
    alt: "A presenter at the front of the room talks through the project plan on the projector while students listen from their laptops.",
    tilt: 0.9,
  },
  {
    photo: "study-lab-repeat",
    caption: "study, lab, repeat",
    alt: "A full classroom facing two presenters at the podium, with a slide that reads: Meeting weekly: Study, Lab, Repeat.",
    tilt: -1.5,
  },
  {
    photo: "info-night",
    caption: "info night, sept 16",
    alt: "A presenter holds up two white handheld devices in front of a whiteboard full of qubit states, next to the QBronco info night slide.",
    tilt: 1,
  },
];

/** "bell-lab-math" -> "/reel/bell-lab-math-320.webp 320w, ..." */
export const reelSrcset = (photo: string) =>
  REEL_WIDTHS.map((w) => `/reel/${photo}-${w}.webp ${w}w`).join(", ");
