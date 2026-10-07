// Officers and the photo reel. Photos live in /public/officers and /public/reel.
// To add a reel photo: drop a webp into /public/reel (448px tall is plenty)
// and add a line below. Newest first.

export interface Officer {
  name: string;
  role: string;
  href: string;
  photo: string;
  tilt: number; // degrees, set by hand so the row doesn't look stamped
}

export const OFFICERS: Officer[] = [
  {
    name: "Dr. Sawalha",
    role: "faculty advisor",
    href: "https://wmich.edu/electrical-computer/directory/sawalha",
    photo: "/officers/sawalha.webp",
    tilt: -2,
  },
  {
    name: "Mack Usmanova",
    role: "president",
    href: "https://www.linkedin.com/in/mukaddass/",
    photo: "/officers/mack-usmanova.webp",
    tilt: 1.5,
  },
  {
    name: "Cody Thornell",
    role: "vice president",
    href: "https://www.linkedin.com/in/codythornell/",
    photo: "/officers/cody-thornell.webp",
    tilt: -1,
  },
  {
    name: "Jordan Johnson",
    role: "events officer",
    href: "https://www.linkedin.com/in/jordan-sjohnson/",
    photo: "/officers/jordan-johnson.webp",
    tilt: 2,
  },
  {
    name: "Hana Tourner",
    role: "marketing officer",
    href: "https://www.linkedin.com/in/hanatourner/",
    photo: "/officers/hana-tourner.webp",
    tilt: -1.5,
  },
  {
    name: "Lola MacAlpine",
    role: "tech officer",
    href: "https://www.linkedin.com/in/lola-macalpine-251632366/",
    photo: "/officers/lola-macalpine.webp",
    tilt: 1,
  },
];

export interface ReelPhoto {
  src: string;
  width: number;
  height: number;
  caption: string;
  alt: string;
  tilt: number;
}

export const REEL: ReelPhoto[] = [
  {
    src: "/reel/info-night.webp",
    width: 597,
    height: 448,
    caption: "info night, sept 16",
    alt: "A presenter holds up two white handheld devices in front of a whiteboard full of qubit states, next to the QBronco info night slide.",
    tilt: -1.5,
  },
  {
    src: "/reel/study-lab-repeat.webp",
    width: 597,
    height: 448,
    caption: "study, lab, repeat",
    alt: "A full classroom facing two presenters at the podium, with a slide that reads: Meeting weekly: Study, Lab, Repeat.",
    tilt: 1,
  },
  {
    src: "/reel/study-session.webp",
    width: 799,
    height: 448,
    caption: "study session, worksheets out",
    alt: "Students working through a worksheet at long desks, with whiteboards covered in red math behind them.",
    tilt: -0.8,
  },
  {
    src: "/reel/project-plan.webp",
    width: 597,
    height: 448,
    caption: "going over the project plan",
    alt: "A presenter at the front of the room talks through the project plan on the projector while students listen from their laptops.",
    tilt: 1.6,
  },
];
